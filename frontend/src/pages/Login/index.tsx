import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Title, Text, Paragraph } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('Login successful');
    } catch {
      message.error('Invalid credentials. Try admin / admin123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #10b981 100%)',
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <MedicineBoxOutlined
            style={{ fontSize: 48, color: '#0ea5e9', marginBottom: 12 }}
          />
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            MedImage Toolkit
          </Title>
          <Text style={{ color: '#64748b' }}>
            Medical Image Synthesis Platform
          </Text>
        </div>

        <Form
          name="login"
          initialValues={{ username: 'admin', password: 'admin123' }}
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, borderRadius: 8, fontWeight: 600 }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size={4}>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>
              Demo credentials: admin / admin123
            </Text>
            <Text style={{ fontSize: 11, color: '#cbd5e1' }}>
              Open-source medical image synthesis toolkit
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Login;
