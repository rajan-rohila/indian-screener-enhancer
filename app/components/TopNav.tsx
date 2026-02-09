"use client";

import { Menu } from 'antd';
import { LineChartOutlined, BulbOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    {
      key: '/',
      icon: <LineChartOutlined />,
      label: 'Screener',
    },
    {
      key: '/recommendations',
      icon: <BulbOutlined />,
      label: 'Recommendations',
    },
  ];

  return (
    <div style={{ 
      background: '#fff', 
      borderBottom: '1px solid #f0f0f0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Menu
        mode="horizontal"
        selectedKeys={[pathname]}
        items={items}
        onClick={({ key }) => router.push(key)}
        style={{ borderBottom: 'none' }}
      />
    </div>
  );
}
