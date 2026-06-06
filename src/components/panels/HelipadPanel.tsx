import { Card, Table, Tag, Button, Progress, Switch, Modal, Form, Input, message, Avatar } from 'antd';
import { SafetyOutlined, WarningOutlined, RocketOutlined, UserOutlined, CameraOutlined } from '@ant-design/icons';
import { useStore } from '@/store/useStore';
import { useState, useRef } from 'react';

const HelipadPanel = () => {
  const helicopters = useStore((state) => state.helicopters);
  const fuelReserve = useStore((state) => state.fuelReserve);
  const deckStatus = useStore((state) => state.deckStatus);
  const unauthorizedAccess = useStore((state) => state.unauthorizedAccess);
  const setUnauthorizedAccess = useStore((state) => state.setUnauthorizedAccess);
  const currentUser = useStore((state) => state.currentUser);

  const [faceScanModal, setFaceScanModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'failed' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'blue',
      boarding: 'orange',
      landed: 'success',
      departed: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      scheduled: '计划中',
      boarding: '登机中',
      landed: '已降落',
      departed: '已起飞',
    };
    return texts[status] || status;
  };

  const getDeckStatusText = (status: string) => {
    const texts: Record<string, string> = {
      empty: '空闲',
      occupied: '占用',
      maintenance: '维护中',
    };
    return texts[status] || status;
  };

  const columns = [
    { title: '航班号', dataIndex: 'flightNumber', key: 'flightNumber' },
    { title: '出发地', dataIndex: 'departure', key: 'departure' },
    { title: '目的地', dataIndex: 'arrival', key: 'arrival' },
    { title: '乘客数', dataIndex: 'passengerCount', key: 'passengerCount' },
    { title: '计划时间', dataIndex: 'scheduledTime', key: 'scheduledTime' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: string) => <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag>
    },
  ];

  const startFaceScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsScanning(true);
      setScanResult(null);
    } catch (error) {
      message.error('无法访问摄像头');
    }
  };

  const stopFaceScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const verifyFace = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      setTimeout(() => {
        const isAuthorized = Math.random() > 0.3;
        setScanResult(isAuthorized ? 'success' : 'failed');
        stopFaceScan();
        
        if (isAuthorized) {
          message.success('身份验证通过，允许登机');
          setTimeout(() => setFaceScanModal(false), 1500);
        } else {
          message.error('身份验证失败，非授权人员！');
          setUnauthorizedAccess(true);
        }
      }, 1500);
    }
  };

  return (
    <div className="space-y-4">
      <Card 
        title={
          <div className="flex items-center gap-2">
            <RocketOutlined className="text-oil-primary" />
            <span>直升机甲板监控</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg border border-oil-primary/30 bg-white/5">
            <div className="text-xs text-gray-400 mb-1">甲板状态</div>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${
                deckStatus === 'empty' ? 'text-oil-success' : 
                deckStatus === 'occupied' ? 'text-oil-warning' : 'text-oil-danger'
              }`}>
                {getDeckStatusText(deckStatus)}
              </span>
              <Tag color={
                deckStatus === 'empty' ? 'success' : 
                deckStatus === 'occupied' ? 'warning' : 'error'
              }>
                {getDeckStatusText(deckStatus)}
              </Tag>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-oil-primary/30 bg-white/5">
            <div className="text-xs text-gray-400 mb-1">油料储备</div>
            <Progress
              percent={fuelReserve}
              strokeColor={fuelReserve > 50 ? '#00ff88' : fuelReserve > 20 ? '#ffaa00' : '#ff3333'}
              size="small"
              format={(percent) => `${percent}%`}
            />
          </div>
        </div>

        {unauthorizedAccess && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400">
              <WarningOutlined className="text-xl animate-pulse" />
              <span className="font-bold">检测到非授权人员进入！</span>
            </div>
            <Button size="small" onClick={() => setUnauthorizedAccess(false)}>
              解除警报
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between p-3 rounded-lg border border-oil-primary/30 bg-white/5">
          <div className="flex items-center gap-2">
            <SafetyOutlined className="text-oil-primary" />
            <span>人员登机人脸识别</span>
          </div>
          <Button 
            type="primary" 
            icon={<CameraOutlined />}
            onClick={() => setFaceScanModal(true)}
          >
            刷脸登机
          </Button>
        </div>

        {currentUser?.role !== 'operator' && (
          <div className="mt-4 flex items-center justify-between p-3 rounded-lg border border-red-500/50 bg-red-900/20">
            <div className="flex items-center gap-2">
              <WarningOutlined className="text-red-500" />
              <span className="text-red-400">模拟非授权入侵</span>
            </div>
            <Switch 
              checked={unauthorizedAccess}
              onChange={setUnauthorizedAccess}
            />
          </div>
        )}
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <RocketOutlined className="text-oil-primary" />
            <span>航班计划</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <Table
          dataSource={helicopters}
          columns={columns}
          size="small"
          pagination={false}
          rowKey="id"
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <CameraOutlined className="text-oil-primary" />
            <span>人脸识别登机验证</span>
          </div>
        }
        open={faceScanModal}
        onCancel={() => {
          stopFaceScan();
          setFaceScanModal(false);
          setScanResult(null);
        }}
        footer={null}
        width={400}
      >
        <div className="space-y-4">
          <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden">
            {isScanning ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : scanResult === 'success' ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Avatar size={64} style={{ backgroundColor: '#00ff88' }} icon={<UserOutlined />} />
                <p className="text-oil-success mt-2 font-bold">验证通过</p>
              </div>
            ) : scanResult === 'failed' ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Avatar size={64} style={{ backgroundColor: '#ff3333' }} icon={<WarningOutlined />} />
                <p className="text-red-500 mt-2 font-bold">验证失败</p>
                <p className="text-red-400 text-sm">非授权人员</p>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CameraOutlined className="text-6xl text-oil-primary/30" />
              </div>
            )}
            {isScanning && (
              <div className="absolute inset-0 border-4 border-oil-primary/50 rounded-lg animate-pulse">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-oil-primary" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-oil-primary" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-oil-primary" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-oil-primary" />
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <Form layout="vertical">
            <Form.Item label="姓名">
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item label="工号">
              <Input placeholder="请输入工号" />
            </Form.Item>
          </Form>

          <div className="flex gap-2">
            {!isScanning && !scanResult && (
              <Button type="primary" block onClick={startFaceScan}>
                开始识别
              </Button>
            )}
            {isScanning && (
              <>
                <Button block onClick={stopFaceScan}>取消</Button>
                <Button type="primary" block onClick={verifyFace}>
                  验证身份
                </Button>
              </>
            )}
            {scanResult && (
              <Button block onClick={() => {
                setScanResult(null);
                startFaceScan();
              }}>
                重新识别
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HelipadPanel;
