import { Outlet, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { HomeOutlined, BookOutlined, LoginOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const PublicLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '20px', marginRight: '50px' }}>
          Personal Hub
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['home']}
          style={{ flex: 1, minWidth: 0 }}
          items={[
            { key: 'home', icon: <HomeOutlined />, label: <Link to="/">Home</Link> },
            { key: 'blog', icon: <BookOutlined />, label: <Link to="/blog">Blog</Link> },
            { key: 'login', icon: <LoginOutlined />, label: <Link to="/login">Login</Link> },
          ]}
        />
      </Header>
      <Content style={{ padding: '50px' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Personal Hub ©{new Date().getFullYear()} - A Modern Personal Space
      </Footer>
    </Layout>
  );
};

export default PublicLayout;
