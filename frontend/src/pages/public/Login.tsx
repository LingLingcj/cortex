import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      // 1) call /auth/login to get JWT
      const loginRes = await api.post('/auth/login', values);
      const token: string | undefined = loginRes.data?.token;
      if (!token) throw new Error('No token returned');

      // 2) fetch profile using the token
      const profileRes = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      login(token, profileRes.data);
      message.success('Login successful!');

      // redirect to previous page if exists
      const from = (location.state as any)?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      message.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center' }}>Login</Title>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
