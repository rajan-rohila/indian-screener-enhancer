"use client";

import { useState, useEffect, useMemo } from 'react';
import { Layout, Table, Tabs, Tag, Button, Typography, Alert, Spin } from 'antd';
import { ReloadOutlined, LineChartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import config from './config';

const { Sider, Content } = Layout;
const { Text } = Typography;

interface IndustryData {
  key: string;
  name: string;
  url: string;
  companies: number;
  marketCap: string;
  medianCap: string;
  pe: string;
  salesGrowth: string;
  opm: string;
  roce: string;
  return1y: string;
}

const parseNum = (val: string | undefined): number | null => {
  if (!val || val === '-' || val === '%') return null;
  const clean = val.replace(/,/g, '').replace(/%/g, '').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
};

const ValueCell = ({ value }: { value: string }) => {
  if (!value || value === '%' || value === '-') {
    return <Text type="secondary">-</Text>;
  }
  const isNegative = value.includes('-');
  return (
    <Text style={{ color: isNegative ? '#ff4d4f' : '#52c41a', fontWeight: 500 }}>
      {value}
    </Text>
  );
};

// All industry groups as a flat list
const allGroups = ['CHEMICALS', 'METALS', 'ENERGY', 'CONSUMER', 'FOOD', 'TEXTILE', 'CRAFT TYPE', 'FINANCIAL', 'INSURANCE', 'HEALTHCARE', 'MEDIA', 'INDUSTRIAL', 'INFRASTRUCTURE', 'DEFENSE', 'MOBILITY', 'TECH'];

export default function Home() {
  const [allData, setAllData] = useState<IndustryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const [currentSub, setCurrentSub] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    const proxies = ['https://api.allorigins.win/raw?url=', 'https://corsproxy.io/?'];
    
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy + encodeURIComponent('https://www.screener.in/market/'));
        if (!res.ok) continue;
        const html = await res.text();
        if (html.includes('Industry')) {
          parseData(html);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.log('Proxy failed:', proxy);
      }
    }
    
    setError('Failed to load data. Please try again.');
    setLoading(false);
  };

  const parseData = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const data: IndustryData[] = [];
    
    doc.querySelectorAll('table tr').forEach((row, idx) => {
      if (row.querySelector('th')) return;
      const cells = row.querySelectorAll('td');
      if (cells.length < 10) return;
      const link = cells[1]?.querySelector('a');
      if (!link) return;
      
      data.push({
        key: String(idx),
        name: link.textContent?.trim() || '',
        url: 'https://www.screener.in' + link.getAttribute('href'),
        companies: parseInt(cells[2]?.textContent?.trim() || '0') || 0,
        marketCap: cells[3]?.textContent?.trim() || '-',
        medianCap: cells[4]?.textContent?.trim() || '-',
        pe: cells[5]?.textContent?.trim() || '-',
        salesGrowth: cells[6]?.textContent?.trim() || '-',
        opm: cells[7]?.textContent?.trim() || '-',
        roce: cells[8]?.textContent?.trim() || '-',
        return1y: cells[9]?.textContent?.trim() || '-',
      });
    });
    
    setAllData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!currentGroup) return allData;
    
    let industries: string[];
    if (currentSub) {
      industries = config[currentGroup]?.[currentSub] || [];
    } else {
      industries = Object.values(config[currentGroup] || {}).flat() as string[];
    }
    
    return allData.filter(d => industries.includes(d.name));
  }, [allData, currentGroup, currentSub]);

  const subFilters = currentGroup ? Object.keys(config[currentGroup] || {}) : [];

  // Helper to count industries for a group or sub-filter
  const getIndustryCount = (group: string, sub?: string | null): number => {
    let industries: string[];
    if (sub) {
      industries = config[group]?.[sub] || [];
    } else {
      industries = Object.values(config[group] || {}).flat() as string[];
    }
    return allData.filter(d => industries.includes(d.name)).length;
  };

  const columns: ColumnsType<IndustryData> = [
    {
      title: 'S.No',
      key: 'sno',
      width: 60,
      align: 'center',
      render: (_: unknown, __: IndustryData, index: number) => index + 1,
    },
    {
      title: 'Industry',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 220,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: IndustryData) => (
        <a href={record.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1677ff', fontWeight: 500 }}>
          {name}
        </a>
      ),
    },
    {
      title: 'Companies',
      dataIndex: 'companies',
      key: 'companies',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.companies - b.companies,
    },
    {
      title: 'Market Cap',
      dataIndex: 'marketCap',
      key: 'marketCap',
      width: 120,
      align: 'right',
      sorter: (a, b) => (parseNum(a.marketCap) || 0) - (parseNum(b.marketCap) || 0),
    },
    {
      title: 'Median Cap',
      dataIndex: 'medianCap',
      key: 'medianCap',
      width: 120,
      align: 'right',
      sorter: (a, b) => (parseNum(a.medianCap) || 0) - (parseNum(b.medianCap) || 0),
    },
    {
      title: 'P/E',
      dataIndex: 'pe',
      key: 'pe',
      width: 80,
      align: 'right',
      sorter: (a, b) => (parseNum(a.pe) || 0) - (parseNum(b.pe) || 0),
    },
    {
      title: 'Sales Growth',
      dataIndex: 'salesGrowth',
      key: 'salesGrowth',
      width: 120,
      align: 'right',
      sorter: (a, b) => (parseNum(a.salesGrowth) || 0) - (parseNum(b.salesGrowth) || 0),
      render: (val: string) => <ValueCell value={val} />,
    },
    {
      title: 'OPM',
      dataIndex: 'opm',
      key: 'opm',
      width: 80,
      align: 'right',
      sorter: (a, b) => (parseNum(a.opm) || 0) - (parseNum(b.opm) || 0),
      render: (val: string) => <ValueCell value={val} />,
    },
    {
      title: 'ROCE',
      dataIndex: 'roce',
      key: 'roce',
      width: 80,
      align: 'right',
      sorter: (a, b) => (parseNum(a.roce) || 0) - (parseNum(b.roce) || 0),
      render: (val: string) => <ValueCell value={val} />,
    },
    {
      title: '1Y Return',
      dataIndex: 'return1y',
      key: 'return1y',
      width: 100,
      align: 'right',
      sorter: (a, b) => (parseNum(a.return1y) || 0) - (parseNum(b.return1y) || 0),
      render: (val: string) => <ValueCell value={val} />,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={240}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #f0f0f0', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12 
        }}>
          <LineChartOutlined style={{ fontSize: 20, color: '#1677ff' }} />
          <Text strong style={{ fontSize: 16 }}>Screener Wrapper</Text>
        </div>
        
        {/* All Industries */}
        <button
          className={`sidebar-item ${!currentGroup ? 'active' : ''}`}
          onClick={() => { setCurrentGroup(null); setCurrentSub(null); }}
        >
          All Industries
          {!currentGroup && <Tag style={{ marginLeft: 8 }}>{allData.length}</Tag>}
        </button>
        
        {/* Industry Groups */}
        {allGroups.map(item => (
          <button
            key={item}
            className={`sidebar-item ${currentGroup === item ? 'active' : ''}`}
            onClick={() => { setCurrentGroup(item); setCurrentSub(null); }}
          >
            {item}
            {currentGroup === item && <Tag style={{ marginLeft: 8 }}>{getIndustryCount(item)}</Tag>}
          </button>
        ))}
        
        {/* Refresh Button */}
        <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0', marginTop: 16 }}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
            block
          >
            Refresh Data
          </Button>
        </div>
      </Sider>
      
      <Layout style={{ marginLeft: 240 }}>
        <Content style={{ padding: 32, background: '#f5f5f5', minHeight: '100vh' }}>
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              closable
              onClose={() => setError(null)}
            />
          )}
          
          {/* Data Table with Tabs */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            {/* Sub-filter tabs */}
            {currentGroup && subFilters.length > 0 && (
              <div style={{ padding: '0 20px' }}>
                <Tabs
                  activeKey={currentSub || 'all'}
                  onChange={(key) => setCurrentSub(key === 'all' ? null : key)}
                  items={[
                    { 
                      key: 'all', 
                      label: (
                        <span>
                          All {currentGroup}
                          {!currentSub && <Tag style={{ marginLeft: 8 }}>{getIndustryCount(currentGroup)}</Tag>}
                        </span>
                      )
                    },
                    ...subFilters.map(sub => ({ 
                      key: sub, 
                      label: (
                        <span>
                          {sub}
                          {currentSub === sub && <Tag style={{ marginLeft: 8 }}>{getIndustryCount(currentGroup, sub)}</Tag>}
                        </span>
                      )
                    }))
                  ]}
                  style={{ marginBottom: 0 }}
                />
              </div>
            )}
            
            <div style={{ padding: 16 }}>
              <Spin spinning={loading} tip="Loading data from Screener.in...">
                <Table
                columns={columns}
                dataSource={filteredData}
                pagination={{
                  defaultPageSize: 25,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '25', '50', '100'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                  style: { padding: '16px' },
                }}
                scroll={{ x: 1100 }}
                size="middle"
                style={{ width: '100%' }}
              />
              </Spin>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
