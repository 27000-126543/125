import { useState, useRef } from 'react';
import { Card, Form, Input, Select, Button, Tabs, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useStore } from '@/store/useStore';
import type { UserRole } from '@/types';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState<'password' | 'face'>('password');
  const [loading, setLoading] = useState(false);
  const [faceScanning, setFaceScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const login = useStore((state) => state.login);
  const faceLogin = useStore((state) => state.faceLogin);

  const handlePasswordLogin = (values: { username: string; password: string; role: UserRole }) => {
    setLoading(true);
    setTimeout(() => {
      const success = login(values.username, values.password, values.role);
      if (success) {
        message.success('登录成功！');
      } else {
        message.error('用户名或密码错误！');
      }
      setLoading(false);
    }, 500);
  };

  const startFaceScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setFaceScanning(true);
    } catch (error) {
      message.error('无法访问摄像头，请检查权限设置');
    }
  };

  const stopFaceScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setFaceScanning(false);
  };

  const captureAndLogin = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');
      
      setLoading(true);
      stopFaceScan();
      
      const success = await faceLogin(imageData);
      if (success) {
        message.success('人脸识别登录成功！');
      } else {
        message.error('人脸识别失败，请重试');
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-oil-dark via-blue-900/20 to-oil-dark">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-oil-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-oil-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <Card className="w-96 panel-bg glow-border relative z-10" title={
        <div className="text-center">
          <h1 className="text-xl font-bold glow-text text-oil-primary">
            3D智慧海上石油钻井平台
          </h1>
          <p className="text-sm text-gray-400 mt-1">综合管控与应急调度可视化平台</p>
        </div>
      }>
        <Tabs
          activeKey={loginMethod}
          onChange={(key) => setLoginMethod(key as 'password' | 'face')}
          centered
          items={[
            { key: 'password', label: '密码登录' },
            { key: 'face', label: '人脸识别' },
          ]}
        />

        {loginMethod === 'password' && (
          <Form onFinish={handlePasswordLogin} layout="vertical">
            <Form.Item
              name="role"
              label="用户角色"
              rules={[{ required: true, message: '请选择角色' }]}
              initialValue="operator"
            >
              <Select>
                <Select.Option value="operator">操作员</Select.Option>
                <Select.Option value="manager">平台经理</Select.Option>
                <Select.Option value="emergency">公司应急中心</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
              initialValue="operator"
            >
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
              initialValue="123456"
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                登录系统
              </Button>
            </Form.Item>
          </Form>
        )}

        {loginMethod === 'face' && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden">
              {faceScanning ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <SafetyCertificateOutlined className="text-6xl text-oil-primary/30" />
                </div>
              )}
              {faceScanning && (
                <div className="absolute inset-0 border-4 border-oil-primary/50 rounded-lg animate-pulse">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-oil-primary" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-oil-primary" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-oil-primary" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-oil-primary" />
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            
            {!faceScanning ? (
              <Button type="primary" block onClick={startFaceScan}>
                开启摄像头
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button block onClick={stopFaceScan}>取消</Button>
                <Button type="primary" block onClick={captureAndLogin} loading={loading}>
                  识别登录
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>默认账号: operator / 123456 (操作员)</p>
          <p>manager / 123456 (平台经理)</p>
          <p>emergency / 123456 (应急中心)</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
