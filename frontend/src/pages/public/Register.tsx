import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, LockOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const { Title } = Typography;

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const onFinish = async (values: RegisterForm) => {
    const { name, email, password } = values;
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const token: string | undefined = res.data?.token;
      const user = res.data?.user;
      if (!token || !user) throw new Error('Invalid register response');

      login(token, user);
      message.success('Register successful!');
      navigate('/app/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Register failed';
      message.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card style={{ width: 480 }}>
        <Title level={2} style={{ textAlign: 'center' }}>Create Account</Title>
        <Form<RegisterForm>
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input your name' }, { min: 2, message: 'At least 2 characters' }]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="Your Name" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please input your email' }, { type: 'email', message: 'Invalid email' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password' }, { min: 6, message: 'At least 6 characters' }]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Create Account
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;

