import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  CheckSquareOutlined,
  DollarOutlined,
  VideoCameraOutlined,
  BookOutlined,
  FileTextOutlined,
  ToolOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Header, Sider, Content } = Layout;

const PrivateLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/app/settings">Settings</Link>,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{
          height: '32px',
          margin: '16px',
          color: 'white',
          textAlign: 'center',
          fontSize: collapsed ? '14px' : '18px',
          fontWeight: 'bold'
        }}>
          {collapsed ? 'CX' : 'Cortex'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: <Link to="/app/dashboard">Dashboard</Link> },
            { key: 'habits', icon: <CheckSquareOutlined />, label: <Link to="/app/habits">Habits</Link> },
            { key: 'subs', icon: <DollarOutlined />, label: <Link to="/app/subs">Subscriptions</Link> },
            { key: 'media', icon: <VideoCameraOutlined />, label: <Link to="/app/media">Media</Link> },
            { key: 'blog', icon: <FileTextOutlined />, label: <Link to="/app/blog">Blog</Link> },
            { key: 'knowledge', icon: <BookOutlined />, label: <Link to="/app/knowledge">Knowledge</Link> },
            { key: 'tools', icon: <ToolOutlined />, label: <Link to="/app/tools">Tools</Link> },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar src={user?.avatar} icon={<UserOutlined />} style={{ marginRight: '8px' }} />
              <span>{user?.name || 'User'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default PrivateLayout;
