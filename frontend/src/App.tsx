import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  RocketOutlined,
  HistoryOutlined,
  LineChartOutlined,
  UserOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

import Dashboard from './pages/Dashboard';
import Synthesis from './pages/Synthesis';
import Datasets from './pages/Datasets';
import Models from './pages/Models';
import Tasks from './pages/Tasks';
import Quality from './pages/Quality';
import Login from './pages/Login';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, username, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/synthesis',
      icon: <ExperimentOutlined />,
      label: 'Synthesis',
    },
    {
      key: '/datasets',
      icon: <DatabaseOutlined />,
      label: 'Datasets',
    },
    {
      key: '/models',
      icon: <RocketOutlined />,
      label: 'Models',
    },
    {
      key: '/tasks',
      icon: <HistoryOutlined />,
      label: 'Tasks',
    },
    {
      key: '/quality',
      icon: <LineChartOutlined />,
      label: 'Quality',
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        width={220}
        style={{
          borderRight: '1px solid #f0f0f0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <MedicineBoxOutlined
            style={{ fontSize: 24, color: '#0ea5e9', marginRight: 10 }}
          />
          <div>
            <Text strong style={{ fontSize: 15, color: '#0f172a', display: 'block', lineHeight: 1.2 }}>
              MedImage
            </Text>
            <Text style={{ fontSize: 11, color: '#94a3b8' }}>Toolkit v1.0</Text>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', padding: '8px 0' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: '1px solid #f0f0f0',
            height: 64,
          }}
        >
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                style={{ backgroundColor: '#0ea5e9' }}
                icon={<UserOutlined />}
                size="small"
              />
              <Text>{username || 'User'}</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            padding: 24,
            background: '#f8fafc',
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto',
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/synthesis" element={<Synthesis />} />
            <Route path="/datasets" element={<Datasets />} />
            <Route path="/models" element={<Models />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/quality" element={<Quality />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
