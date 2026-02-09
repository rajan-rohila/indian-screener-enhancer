"use client";

import { useState, useMemo, useRef } from 'react';
import { Layout, Tabs, Badge, Typography, Table, Tooltip, Avatar, Button } from 'antd';
import { BulbOutlined, LineChartOutlined, BankOutlined, ClearOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TableRef } from 'antd/es/table';
import recommendations from '../recommendations.json';
import config, { GROUP_ORDER } from '../config';
import TopNav from '../components/TopNav';

const { Content } = Layout;
const { Text } = Typography;

interface Recommendation {
  type: 'sector' | 'stock';
  key: string;
  thesis: string;
}

type RecommendationsData = Record<string, Recommendation[]>;

interface GroupedItem {
  key: string;
  name: string;
  industryGroup?: string;
  recommenders: string[];
  theses: Record<string, string>;
}

// Build reverse lookup: sector name -> industry group
const sectorToGroup: Record<string, string> = {};
const groupOrder: Record<string, number> = {};
GROUP_ORDER.forEach((group, index) => {
  groupOrder[group] = index;
});
Object.entries(config).forEach(([group, subGroups]) => {
  Object.values(subGroups).forEach((sectors) => {
    sectors.forEach((sector) => {
      sectorToGroup[sector] = group;
    });
  });
});

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState<'sectors' | 'stocks'>('sectors');
  const [filteredInfo, setFilteredInfo] = useState<Record<string, string[] | null>>({});
  const [sortedInfo, setSortedInfo] = useState<{ columnKey?: string; order?: 'ascend' | 'descend' }>({});

  // Get all unique recommenders
  const allRecommenders = useMemo(() => {
    return Object.keys(recommendations as RecommendationsData);
  }, []);

  const groupedData = useMemo(() => {
    const data = recommendations as RecommendationsData;
    const sectors: Record<string, { recommenders: string[]; theses: Record<string, string> }> = {};
    const stocks: Record<string, { recommenders: string[]; theses: Record<string, string> }> = {};

    Object.entries(data).forEach(([recommender, recs]) => {
      recs.forEach((rec) => {
        const target = rec.type === 'sector' ? sectors : stocks;
        if (!target[rec.key]) {
          target[rec.key] = { recommenders: [], theses: {} };
        }
        target[rec.key].recommenders.push(recommender);
        target[rec.key].theses[recommender] = rec.thesis;
      });
    });

    return { sectors, stocks };
  }, []);

  const currentData = activeTab === 'sectors' ? groupedData.sectors : groupedData.stocks;

  const tableData: GroupedItem[] = useMemo(() => {
    const data = Object.entries(currentData).map(([name, { recommenders, theses }]) => ({
      key: name,
      name,
      industryGroup: activeTab === 'sectors' ? sectorToGroup[name] : undefined,
      recommenders,
      theses,
    }));
    
    // Sort by industry group order from config for sectors
    if (activeTab === 'sectors') {
      data.sort((a, b) => {
        const orderA = groupOrder[a.industryGroup || ''] ?? 999;
        const orderB = groupOrder[b.industryGroup || ''] ?? 999;
        return orderA - orderB;
      });
    }
    
    return data;
  }, [currentData, activeTab]);

  // Get unique industry groups for filter
  const industryGroups = useMemo(() => {
    if (activeTab !== 'sectors') return [];
    const groups = new Set(tableData.map(d => d.industryGroup).filter(Boolean));
    return Array.from(groups) as string[];
  }, [tableData, activeTab]);

  const columns: ColumnsType<GroupedItem> = [
    {
      title: 'S.No',
      key: 'sno',
      width: 60,
      align: 'center',
      render: (_: unknown, __: GroupedItem, index: number) => index + 1,
    },
    ...(activeTab === 'sectors' ? [{
      title: 'Industry Group',
      dataIndex: 'industryGroup',
      key: 'industryGroup',
      width: 180,
      sorter: (a: GroupedItem, b: GroupedItem) => {
        const orderA = groupOrder[a.industryGroup || ''] ?? 999;
        const orderB = groupOrder[b.industryGroup || ''] ?? 999;
        return orderA - orderB;
      },
      sortOrder: sortedInfo.columnKey === 'industryGroup' ? sortedInfo.order : null,
      filters: industryGroups.map(g => ({ text: g, value: g })),
      filteredValue: filteredInfo.industryGroup || null,
      onFilter: (value: unknown, record: GroupedItem) => record.industryGroup === value,
      render: (group: string) => <Text type="secondary">{group || '-'}</Text>,
    }] : []),
    {
      title: activeTab === 'sectors' ? 'Industry' : 'Stock',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => <Text strong>{name}</Text>,
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
      render: (theses: Record<string, string>, record: GroupedItem) => (
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

  return (
    <>
    <TopNav />
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: 32 }}>
        {/* Tabs + Table */}
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '0 16px' }}>
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as 'sectors' | 'stocks')}
              items={[
                {
                  key: 'sectors',
                  label: (
                    <span>
                      <BankOutlined /> Sectors
                      <Badge 
                        count={Object.keys(groupedData.sectors).length} 
                        style={{ marginLeft: 8, backgroundColor: '#1677ff' }} 
                      />
                    </span>
                  ),
                },
                {
                  key: 'stocks',
                  label: (
                    <span>
                      <LineChartOutlined /> Stocks
                      <Badge 
                        count={Object.keys(groupedData.stocks).length} 
                        style={{ marginLeft: 8, backgroundColor: '#52c41a' }} 
                      />
                    </span>
                  ),
                },
              ]}
            />
          </div>

          <div style={{ padding: 16 }}>
            <Button 
              icon={<ClearOutlined />}
              onClick={() => setFilteredInfo({})}
              style={{ marginBottom: 16 }}
            >
              Clear filters
            </Button>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="middle"
              scroll={{ x: 900 }}
              onChange={(pagination, filters, sorter) => {
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
