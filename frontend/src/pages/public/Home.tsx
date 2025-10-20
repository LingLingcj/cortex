import { Typography, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import { RocketOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <RocketOutlined style={{ fontSize: '80px', color: '#1890ff', marginBottom: '20px' }} />
      <Title level={1}>Welcome to Personal Hub</Title>
      <Paragraph style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 30px' }}>
        Your all-in-one personal space for managing habits, subscriptions, media, knowledge, and more.
        A modern platform built with React, Node.js, Go, and Rust.
      </Paragraph>
      <Space size="large">
        <Link to="/blog">
          <Button type="primary" size="large">Explore Blog</Button>
        </Link>
        <Link to="/login">
          <Button size="large">Get Started</Button>
        </Link>
      </Space>
    </div>
  );
};

export default Home;
