"use client";

import { useState, useMemo } from 'react';
import { Layout, Badge, Typography, Table, Tooltip, Avatar, Button } from 'antd';
import { ClearOutlined, LinkOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import recommendations from '../data/dynamic/recommendations.json';
import sectorConfig, { GROUP_ORDER } from '../data/config/sectors';
import stocks from '../data/config/stocks';
import TopNav from '../components/TopNav';

const { Content } = Layout;
const { Text } = Typography;

interface StockRec {
  name: string;
  thesis: string;
}

interface IndustryRec {
  industry: string;
  thesis: string;
  stocks?: StockRec[];
}

type RecommendationsData = Record<string, IndustryRec[]>;

interface IndustryRow {
  key: string;
  industry: string;
  industryGroup?: string;
  subGroup?: string;
  recommenders: string[];
  theses: Record<string, string>;
  stocks?: StockRow[];
}

interface StockRow {
  key: string;
  name: string;
  screenerUrl?: string;
  recommenders: string[];
  theses: Record<string, string>;
}

// Build reverse lookup: industry name -> industry group and sub-group
const industryToGroup: Record<string, string> = {};
const industryToSubGroup: Record<string, string> = {};
const groupOrder: Record<string, number> = {};
const subGroupOrder: Record<string, Record<string, number>> = {};
GROUP_ORDER.forEach((group, index) => {
  groupOrder[group] = index;
});
Object.entries(sectorConfig).forEach(([group, subGroups]) => {
  subGroupOrder[group] = {};
  Object.entries(subGroups).forEach(([subGroup, industries], subIdx) => {
    subGroupOrder[group][subGroup] = subIdx;
    industries.forEach((industry) => {
      industryToGroup[industry] = group;
      industryToSubGroup[industry] = subGroup;
    });
  });
});

// Helper to get stock info
const getStockInfo = (name: string) => {
  const entry = Object.entries(stocks).find(([_, info]) => info.name === name);
  return entry ? entry[1] : null;
};

export default function RecommendationsPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [filteredInfo, setFilteredInfo] = useState<Record<string, string[] | null>>({});
  const [sortedInfo, setSortedInfo] = useState<{ columnKey?: string; order?: 'ascend' | 'descend' }>({});

  const allRecommenders = useMemo(() => {
    return Object.keys(recommendations as RecommendationsData);
  }, []);

  const tableData: IndustryRow[] = useMemo(() => {
    const data = recommendations as RecommendationsData;
    const industryMap: Record<string, { 
      recommenders: string[]; 
      theses: Record<string, string>;
      stocks: Record<string, { recommenders: string[]; theses: Record<string, string> }>;
    }> = {};

    // Aggregate by industry
    Object.entries(data).forEach(([recommender, recs]) => {
      recs.forEach((rec) => {
        if (!industryMap[rec.industry]) {
          industryMap[rec.industry] = { recommenders: [], theses: {}, stocks: {} };
        }
        if (!industryMap[rec.industry].recommenders.includes(recommender)) {
          industryMap[rec.industry].recommenders.push(recommender);
        }
        industryMap[rec.industry].theses[recommender] = rec.thesis;

        // Aggregate stocks
        if (rec.stocks) {
          rec.stocks.forEach((stock) => {
            if (!industryMap[rec.industry].stocks[stock.name]) {
              industryMap[rec.industry].stocks[stock.name] = { recommenders: [], theses: {} };
            }
            if (!industryMap[rec.industry].stocks[stock.name].recommenders.includes(recommender)) {
              industryMap[rec.industry].stocks[stock.name].recommenders.push(recommender);
            }
            industryMap[rec.industry].stocks[stock.name].theses[recommender] = stock.thesis;
          });
        }
      });
    });

    // Convert to array
    const rows = Object.entries(industryMap).map(([industry, { recommenders, theses, stocks: stocksMap }]) => {
      const stockRows: StockRow[] = Object.entries(stocksMap).map(([name, { recommenders: stockRecommenders, theses: stockTheses }]) => {
        const stockInfo = getStockInfo(name);
        return {
          key: `${industry}-${name}`,
          name,
          screenerUrl: stockInfo?.screenerUrl,
          recommenders: stockRecommenders,
          theses: stockTheses,
        };
      });

      return {
        key: industry,
        industry,
        industryGroup: industryToGroup[industry],
        subGroup: industryToSubGroup[industry],
        recommenders,
        theses,
        stocks: stockRows.length > 0 ? stockRows : undefined,
      };
    });

    // Sort by industry group order, then sub-group order
    rows.sort((a, b) => {
      const groupOrderA = groupOrder[a.industryGroup || ''] ?? 999;
      const groupOrderB = groupOrder[b.industryGroup || ''] ?? 999;
      if (groupOrderA !== groupOrderB) return groupOrderA - groupOrderB;
      const subOrderA = subGroupOrder[a.industryGroup || '']?.[a.subGroup || ''] ?? 999;
      const subOrderB = subGroupOrder[b.industryGroup || '']?.[b.subGroup || ''] ?? 999;
      return subOrderA - subOrderB;
    });

    return rows;
  }, []);

  const industryGroups = useMemo(() => {
    const groups = new Set(tableData.map(d => d.industryGroup).filter(Boolean));
    return Array.from(groups) as string[];
  }, [tableData]);

  // Filter table data by selected group
  const filteredTableData = useMemo(() => {
    if (!selectedGroup) return tableData;
    return tableData.filter(row => row.industryGroup === selectedGroup);
  }, [tableData, selectedGroup]);

  // Count per group for badges (industries and stocks)
  const groupCounts = useMemo(() => {
    const counts: Record<string, { industries: number; stocks: number }> = {};
    tableData.forEach(row => {
      if (row.industryGroup) {
        if (!counts[row.industryGroup]) {
          counts[row.industryGroup] = { industries: 0, stocks: 0 };
        }
        counts[row.industryGroup].industries += 1;
        counts[row.industryGroup].stocks += row.stocks?.length || 0;
      }
    });
    return counts;
  }, [tableData]);

  // Total stocks count
  const totalStocks = useMemo(() => {
    return tableData.reduce((sum, row) => sum + (row.stocks?.length || 0), 0);
  }, [tableData]);

  const columns: ColumnsType<IndustryRow> = [
    {
      title: 'S.No',
      key: 'sno',
      width: 60,
      align: 'center',
      render: (_: unknown, __: IndustryRow, index: number) => index + 1,
    },
    {
      title: 'Industry Group',
      dataIndex: 'industryGroup',
      key: 'industryGroup',
      width: 180,
      sorter: (a, b) => {
        const orderA = groupOrder[a.industryGroup || ''] ?? 999;
        const orderB = groupOrder[b.industryGroup || ''] ?? 999;
        return orderA - orderB;
      },
      sortOrder: sortedInfo.columnKey === 'industryGroup' ? sortedInfo.order : null,
      filters: industryGroups.map(g => ({ text: g, value: g })),
      filteredValue: filteredInfo.industryGroup || null,
      onFilter: (value, record) => record.industryGroup === value,
      render: (group: string) => group ? <Badge count={group} style={{ backgroundColor: '#1677ff' }} /> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Sub Group',
      dataIndex: 'subGroup',
      key: 'subGroup',
      width: 140,
      sorter: (a, b) => {
        const groupOrderA = groupOrder[a.industryGroup || ''] ?? 999;
        const groupOrderB = groupOrder[b.industryGroup || ''] ?? 999;
        if (groupOrderA !== groupOrderB) return groupOrderA - groupOrderB;
        const subOrderA = subGroupOrder[a.industryGroup || '']?.[a.subGroup || ''] ?? 999;
        const subOrderB = subGroupOrder[b.industryGroup || '']?.[b.subGroup || ''] ?? 999;
        return subOrderA - subOrderB;
      },
      sortOrder: sortedInfo.columnKey === 'subGroup' ? sortedInfo.order : null,
      render: (subGroup: string) => subGroup ? <Badge count={subGroup} style={{ backgroundColor: '#faad14' }} /> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      width: 280,
      sorter: (a, b) => a.industry.localeCompare(b.industry),
      render: (industry: string) => <Text strong>{industry}</Text>,
    },
    {
      title: 'Analyst',
      dataIndex: 'recommenders',
      key: 'recommenders',
      width: 120,
      sorter: (a, b) => b.recommenders.length - a.recommenders.length,
      sortOrder: sortedInfo.columnKey === 'recommenders' ? sortedInfo.order : null,
      filters: allRecommenders.map(r => ({ text: r, value: r })),
      filteredValue: filteredInfo.recommenders || null,
      onFilter: (value, record) => record.recommenders.includes(value as string),
      render: (recommenders: string[]) => (
        <Avatar.Group max={{ count: 3, style: { backgroundColor: '#faad14' } }}>
          {recommenders.map((r) => (
            <Tooltip key={r} title={r}>
              <Avatar
                src={`/avatars/${r.toLowerCase()}.png`}
                style={{ backgroundColor: '#1677ff', cursor: 'pointer' }}
              >
                {r.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: 'Thesis',
      dataIndex: 'theses',
      key: 'theses',
      render: (theses: Record<string, string>, record: IndustryRow) => (
        <div>
          {record.recommenders.map((r, idx) => (
            <div key={r} style={{ marginBottom: idx < record.recommenders.length - 1 ? 8 : 0 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{r}:</Text>
              <div style={{ fontSize: 13 }}>{theses[r]}</div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  // Expanded row for stocks
  const expandedRowRender = (record: IndustryRow) => {
    if (!record.stocks) return null;

    const stockColumns: ColumnsType<StockRow> = [
      {
        title: '',
        key: 'spacer1',
        width: 60,
      },
      {
        title: '',
        key: 'spacer2',
        width: 180,
      },
      {
        title: '',
        key: 'spacer3',
        width: 140,
      },
      {
        title: 'Stock',
        dataIndex: 'name',
        key: 'name',
        width: 280,
        render: (name: string, row: StockRow) => (
          <span>
            <Text type="secondary" style={{ marginRight: 8 }}>└─</Text>
            <Text strong>{name}</Text>
            {row.screenerUrl && (
              <a href={row.screenerUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                <LinkOutlined style={{ fontSize: 12, color: '#1677ff' }} />
              </a>
            )}
          </span>
        ),
      },
      {
        title: 'Analyst',
        dataIndex: 'recommenders',
        key: 'recommenders',
        width: 120,
        render: (recommenders: string[]) => (
          <Avatar.Group max={{ count: 3, style: { backgroundColor: '#faad14' } }}>
            {recommenders.map((r) => (
              <Tooltip key={r} title={r}>
                <Avatar
                  src={`/avatars/${r.toLowerCase()}.png`}
                  style={{ backgroundColor: '#1677ff', cursor: 'pointer' }}
                  size="small"
                >
                  {r.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>
        ),
      },
      {
        title: 'Thesis',
        dataIndex: 'theses',
        key: 'theses',
        render: (theses: Record<string, string>, row: StockRow) => (
          <div>
            {row.recommenders.map((r, idx) => (
              <div key={r} style={{ marginBottom: idx < row.recommenders.length - 1 ? 8 : 0 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{r}:</Text>
                <div style={{ fontSize: 13 }}>{theses[r]}</div>
              </div>
            ))}
          </div>
        ),
      },
    ];

    return (
      <Table
        columns={stockColumns}
        dataSource={record.stocks}
        pagination={false}
        size="small"
        showHeader={false}
      />
    );
  };

  return (
    <>
      <TopNav />
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Content style={{ padding: 32 }}>
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: 16 }}>
              {/* Industry Group Filter Buttons */}
              <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Button
                  type={selectedGroup === null ? 'primary' : 'default'}
                  onClick={() => setSelectedGroup(null)}
                >
                  All
                  <Badge count={totalStocks} style={{ marginLeft: 8, backgroundColor: selectedGroup === null ? '#fff' : '#52c41a' }} />
                </Button>
                {GROUP_ORDER.map(group => {
                  const hasData = groupCounts[group];
                  const stockCount = groupCounts[group]?.stocks || 0;
                  return (
                    <Button
                      key={group}
                      type={selectedGroup === group ? 'primary' : 'default'}
                      onClick={() => setSelectedGroup(group)}
                      disabled={!hasData}
                      style={{ opacity: hasData ? 1 : 0.5 }}
                    >
                      {group}
                      {stockCount > 0 && (
                        <Badge 
                          count={stockCount} 
                          style={{ marginLeft: 8, backgroundColor: selectedGroup === group ? '#fff' : '#52c41a' }} 
                        />
                      )}
                    </Button>
                  );
                })}
              </div>

              <Button
                icon={<ClearOutlined />}
                onClick={() => {
                  setFilteredInfo({});
                  setSelectedGroup(null);
                }}
                style={{ marginBottom: 16 }}
              >
                Clear filters
              </Button>
              <Table
                columns={columns}
                dataSource={filteredTableData}
                pagination={false}
                size="middle"
                scroll={{ x: 1100 }}
                expandable={{
                  expandedRowRender,
                  rowExpandable: (record) => !!record.stocks && record.stocks.length > 0,
                }}
                onChange={(_, filters, sorter) => {
                  setFilteredInfo(filters as Record<string, string[] | null>);
                  setSortedInfo(sorter as { columnKey?: string; order?: 'ascend' | 'descend' });
                }}
              />
            </div>
          </div>
        </Content>
      </Layout>
    </>
  );
}
