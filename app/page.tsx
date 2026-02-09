"use client";

import { useState, useEffect, useMemo } from 'react';
import { Layout, Table, Tabs, Badge, Button, Typography, Alert, Spin, App, Drawer, Grid } from 'antd';
import { ReloadOutlined, LineChartOutlined, MenuOutlined, LoadingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import config, { SIDEBAR_SECTIONS } from './data/config/sectors';
import TopNav from './components/TopNav';

const { Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

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

export default function Home() {
  const [allData, setAllData] = useState<IndustryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const [currentSub, setCurrentSub] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    const startTime = Date.now();
    const minLoadTime = 800; // minimum loading time for visual feedback
    
    try {
      const res = await fetch('/api/screener');
      if (!res.ok) throw new Error('Failed to fetch');
      
      const html = await res.text();
      parseData(html);
      
      // Ensure minimum loading time for visual feedback
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed));
      }
    } catch (e) {
      setError('Failed to load data. Please try again.');
    }
    
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
      title: 'P/E',
      dataIndex: 'pe',
      key: 'pe',
      width: 80,
      align: 'right',
      sorter: (a, b) => (parseNum(a.pe) || 0) - (parseNum(b.pe) || 0),
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
  ];

  const handleGroupClick = (group: string | null) => {
    setCurrentGroup(group);
    setCurrentSub(null);
    if (isMobile) setDrawerOpen(false);
  };

  const sidebarContent = (
    <>
      {/* All Industries */}
      <button
        className={`sidebar-item ${!currentGroup ? 'active' : ''}`}
        onClick={() => handleGroupClick(null)}
      >
        All Industries
        {!currentGroup && <Badge count={allData.length} overflowCount={999} color="orange" style={{ marginLeft: 8 }} />}
      </button>
      
      {/* Section header */}
      <div className="sidebar-section-title">Industry Groups</div>
      
      {SIDEBAR_SECTIONS.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {section.map(item => (
            <button
              key={item}
              className={`sidebar-item ${currentGroup === item ? 'active' : ''}`}
              onClick={() => handleGroupClick(item)}
            >
              {item}
              {currentGroup === item && <Badge count={getIndustryCount(item)} overflowCount={999} color="orange" style={{ marginLeft: 8 }} />}
            </button>
          ))}
          {sectionIndex < SIDEBAR_SECTIONS.length - 1 && <div className="sidebar-divider" />}
        </div>
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
    </>
  );

  return (
    <App>
    <TopNav />
    <Layout style={{ minHeight: '100vh' }}>
      {/* Mobile Header */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          zIndex: 100,
        }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
          />
          <LineChartOutlined style={{ fontSize: 20, color: '#1677ff' }} />
          <Text strong style={{ fontSize: 16 }}>Screener Wrapper</Text>
        </div>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LineChartOutlined style={{ fontSize: 20, color: '#1677ff' }} />
            <span>Screener Wrapper</span>
          </div>
        }
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{ body: { padding: 0 } }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop Sider */}
      {!isMobile && (
        <Sider
          width={240}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            position: 'fixed',
            height: 'calc(100vh - 46px)',
            left: 0,
            top: 46,
            overflow: 'auto',
          }}
        >
          {sidebarContent}
        </Sider>
      )}
      
      <Layout style={{ marginLeft: isMobile ? 0 : 240, marginTop: isMobile ? 56 : 46 }}>
        <Content style={{ padding: isMobile ? 16 : 32, background: '#f5f5f5', minHeight: '100vh' }}>
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
                  items={
                    subFilters.length === 1
                      ? [{ 
                          key: 'all', 
                          label: (
                            <span>
                              All {currentGroup}
                              <Badge count={getIndustryCount(currentGroup)} overflowCount={999} color="orange" style={{ marginLeft: 8 }} />
                            </span>
                          )
                        }]
                      : [
                          { 
                            key: 'all', 
                            label: (
                              <span>
                                All {currentGroup}
                                {!currentSub && <Badge count={getIndustryCount(currentGroup)} overflowCount={999} color="orange" style={{ marginLeft: 8 }} />}
                              </span>
                            )
                          },
                          ...subFilters.map(sub => ({ 
                            key: sub, 
                            label: (
                              <span>
                                {sub}
                                {currentSub === sub && <Badge count={getIndustryCount(currentGroup, sub)} overflowCount={999} color="orange" style={{ marginLeft: 8 }} />}
                              </span>
                            )
                          }))
                        ]
                  }
                  style={{ marginBottom: 0 }}
                />
              </div>
            )}
            
            <div style={{ padding: 16 }}>
              {loading && (
                <Spin 
                  tip="Loading data from Screener.in..."
                  indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                  fullscreen
                />
              )}
              <Table
                columns={columns}
                dataSource={filteredData}
                pagination={{
                  defaultPageSize: 50,
                  showSizeChanger: false,
                  hideOnSinglePage: true,
                }}
                scroll={{ x: 1100 }}
                size="middle"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
    </App>
  );
}
