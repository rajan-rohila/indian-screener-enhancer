import { useState, useEffect, useMemo } from 'react'
import { ConfigProvider, Layout, Menu, Table, Tag, Button, Alert, Space, Spin, Typography } from 'antd'
import { AppstoreOutlined, FolderOutlined, ReloadOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons'
import config from './config.json'

const { Sider, Content } = Layout
const { Title, Link } = Typography

const parseNum = (val) => {
  if (!val || val === '-' || val === '%') return null
  const clean = val.replace(/,/g, '').replace(/%/g, '').trim()
  const num = parseFloat(clean)
  return isNaN(num) ? null : num
}

const ValueCell = ({ value }) => {
  if (!value || value === '%') return <span style={{ color: '#999' }}>-</span>
  const isNegative = value.includes('-')
  return <span style={{ color: isNegative ? '#ff4d4f' : '#52c41a', fontWeight: 500 }}>{value}</span>
}

export default function App() {
  const [allData, setAllData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentGroup, setCurrentGroup] = useState(null)
  const [currentSub, setCurrentSub] = useState(null)

  const groups = Object.keys(config)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    const proxies = ['https://api.allorigins.win/raw?url=', 'https://corsproxy.io/?']
    
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy + encodeURIComponent('https://www.screener.in/market/'))
        if (!res.ok) continue
        const html = await res.text()
        if (html.includes('Industry')) {
          parseData(html)
          setLoading(false)
          return
        }
      } catch (e) {
        console.log('Proxy failed:', proxy)
      }
    }
    setError('Failed to load data. Please try again.')
    setLoading(false)
  }

  const parseData = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const data = []
    doc.querySelectorAll('table tr').forEach((row, idx) => {
      if (row.querySelector('th')) return
      const cells = row.querySelectorAll('td')
      if (cells.length < 10) return
      const link = cells[1]?.querySelector('a')
      if (!link) return
      data.push({
        key: idx,
        name: link.textContent.trim(),
        url: 'https://www.screener.in' + link.getAttribute('href'),
        companies: parseInt(cells[2]?.textContent.trim()) || 0,
        marketCap: cells[3]?.textContent.trim(),
        medianCap: cells[4]?.textContent.trim(),
        pe: cells[5]?.textContent.trim(),
        salesGrowth: cells[6]?.textContent.trim(),
        opm: cells[7]?.textContent.trim(),
        roce: cells[8]?.textContent.trim(),
        return1y: cells[9]?.textContent.trim(),
      })
    })
    setAllData(data)
  }

  useEffect(() => { fetchData() }, [])

  const filteredData = useMemo(() => {
    if (!currentGroup) return allData
    const industries = currentSub
      ? (config[currentGroup]?.[currentSub] || [])
      : Object.values(config[currentGroup] || {}).flat()
    return allData.filter(d => industries.includes(d.name))
  }, [allData, currentGroup, currentSub])

  const subFilters = currentGroup ? Object.keys(config[currentGroup] || {}) : []

  const menuItems = [
    { key: 'all', icon: <AppstoreOutlined />, label: 'All Industries' },
    ...groups.map(g => ({ key: g, icon: <FolderOutlined />, label: g }))
  ]

  const columns = [
    {
      title: '#', dataIndex: 'key', width: 60, render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Industry', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => <Link href={record.url} target="_blank">{text}</Link>,
    },
    {
      title: 'Companies', dataIndex: 'companies', align: 'right',
      sorter: (a, b) => a.companies - b.companies,
    },
    {
      title: 'Market Cap', dataIndex: 'marketCap', align: 'right',
      sorter: (a, b) => (parseNum(a.marketCap) || 0) - (parseNum(b.marketCap) || 0),
    },
    {
      title: 'Median Cap', dataIndex: 'medianCap', align: 'right',
      sorter: (a, b) => (parseNum(a.medianCap) || 0) - (parseNum(b.medianCap) || 0),
    },
    {
      title: 'P/E', dataIndex: 'pe', align: 'right',
      sorter: (a, b) => (parseNum(a.pe) || 0) - (parseNum(b.pe) || 0),
    },
    {
      title: 'Sales Growth', dataIndex: 'salesGrowth', align: 'right',
      sorter: (a, b) => (parseNum(a.salesGrowth) || 0) - (parseNum(b.salesGrowth) || 0),
      render: (val) => <ValueCell value={val} />,
    },
    {
      title: 'OPM', dataIndex: 'opm', align: 'right',
      sorter: (a, b) => (parseNum(a.opm) || 0) - (parseNum(b.opm) || 0),
      render: (val) => <ValueCell value={val} />,
    },
    {
      title: 'ROCE', dataIndex: 'roce', align: 'right',
      sorter: (a, b) => (parseNum(a.roce) || 0) - (parseNum(b.roce) || 0),
      render: (val) => <ValueCell value={val} />,
    },
    {
      title: '1Y Return', dataIndex: 'return1y', align: 'right',
      sorter: (a, b) => (parseNum(a.return1y) || 0) - (parseNum(b.return1y) || 0),
      render: (val) => <ValueCell value={val} />,
    },
  ]

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1677ff', borderRadius: 6, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" } }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={240} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <RiseOutlined style={{ fontSize: 24, color: '#0b57d0' }} />
            <Title level={5} style={{ margin: 0 }}>Screener Filter</Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[currentGroup || 'all']}
            items={menuItems}
            onClick={({ key }) => {
              setCurrentGroup(key === 'all' ? null : key)
              setCurrentSub(null)
            }}
            style={{ border: 'none' }}
          />
          <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', marginTop: 'auto' }}>
            <Button type="primary" icon={<ReloadOutlined />} onClick={fetchData} loading={loading} block>
              Refresh Data
            </Button>
          </div>
        </Sider>
        
        <Content style={{ padding: 24, background: '#f5f5f5' }}>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
          
          {currentGroup && subFilters.length > 0 && (
            <Space wrap style={{ marginBottom: 16, padding: 16, background: '#fff', borderRadius: 12 }}>
              <Tag.CheckableTag
                checked={!currentSub}
                onChange={() => setCurrentSub(null)}
                style={{ padding: '4px 12px' }}
              >
                All {currentGroup}
              </Tag.CheckableTag>
              {subFilters.map(sub => (
                <Tag.CheckableTag
                  key={sub}
                  checked={currentSub === sub}
                  onChange={() => setCurrentSub(sub)}
                  style={{ padding: '4px 12px' }}
                >
                  {sub}
                </Tag.CheckableTag>
              ))}
            </Space>
          )}
          
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={5} style={{ margin: 0 }}>Industry Data</Title>
              {currentGroup && (
                <Tag color="blue">{currentSub ? `${currentGroup} › ${currentSub}` : currentGroup}</Tag>
              )}
            </div>
            
            <Spin spinning={loading} tip="Loading data from Screener.in...">
              <Table
                columns={columns}
                dataSource={filteredData}
                pagination={{ defaultPageSize: 25, showSizeChanger: true, pageSizeOptions: [10, 25, 50, 100] }}
                size="middle"
                scroll={{ x: 1000 }}
              />
            </Spin>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  )
}
