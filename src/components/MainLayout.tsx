import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Badge, Dropdown, Avatar, Tag, message } from 'antd';
import {
  DashboardOutlined,
  AlertOutlined,
  FileTextOutlined,
  LogoutOutlined,
  BellOutlined,
  FireOutlined,
  SettingOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useStore } from '@/store/useStore';
import Scene3D from '@/components/Scene3D';
import DrillingPanel from '@/components/panels/DrillingPanel';
import ProcessingPanel from '@/components/panels/ProcessingPanel';
import HelipadPanel from '@/components/panels/HelipadPanel';
import PipelinePanel from '@/components/panels/PipelinePanel';
import EmergencyPanel from '@/components/panels/EmergencyPanel';
import SupplyPanel from '@/components/panels/SupplyPanel';
import ProductionPanel from '@/components/panels/ProductionPanel';
import LogsPanel from '@/components/panels/LogsPanel';
import AlertList from '@/components/AlertList';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [activePanel, setActivePanel] = useState('drilling');
  const currentUser = useStore((state) => state.currentUser);
  const alerts = useStore((state) => state.alerts);
  const logout = useStore((state) => state.logout);
  const isDrillActive = useStore((state) => state.isDrillActive);
  const startEmergencyDrill = useStore((state) => state.startEmergencyDrill);
  const stopEmergencyDrill = useStore((state) => state.stopEmergencyDrill);
  const generateDailyReport = useStore((state) => state.generateDailyReport);
  const drillingModules = useStore((state) => state.drillingModules);

  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;

  const roleNames: Record<string, string> = {
    operator: '操作员',
    manager: '平台经理',
    emergency: '应急中心',
  };

  const handleExportReport = () => {
    const report = generateDailyReport(dayjs().format('YYYY-MM-DD'));
    
    const wb = XLSX.utils.book_new();
    
    const efficiencyData = [
      ['钻井时效统计', '', '', '', ''],
      ['模块ID', '模块名称', '当日进尺(米)', '作业时长(小时)', '非作业时长(小时)'],
      ...report.drillingEfficiency.map(e => [e.moduleId, e.moduleName, e.footage.toFixed(2), e.operatingHours.toFixed(2), e.nonProductiveHours.toFixed(2)]),
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(efficiencyData);
    XLSX.utils.book_append_sheet(wb, ws1, '钻井时效');
    
    const productionData = [
      ['产量统计', '', '', ''],
      ['原油(桶)', '天然气(千立方英尺)', '水(桶)'],
      [report.production.oil.toFixed(2), report.production.gas.toFixed(2), report.production.water.toFixed(2)],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(productionData);
    XLSX.utils.book_append_sheet(wb, ws2, '产量统计');
    
    const safetyData = [
      ['安全事件统计', ''],
      ['事件类型', '数量'],
      ...report.safetyEvents.map(e => [e.type, e.count]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(safetyData);
    XLSX.utils.book_append_sheet(wb, ws3, '安全事件');
    
    XLSX.writeFile(wb, `生产日报_${report.date}.xlsx`);
    message.success('生产日报已导出');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      drillingModules.forEach(module => {
        useStore.getState().setDrillingData({
          id: module.id,
          currentDepth: module.currentDepth + Math.random() * 0.1,
          mudPressure: 18000 + Math.random() * 2000,
          weightOnBit: 180 + Math.random() * 30,
          rotationSpeed: 80 + Math.random() * 20,
        });
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [drillingModules]);

  const menuItems = [
    { key: 'drilling', icon: <DashboardOutlined />, label: '钻井监控' },
    { key: 'processing', icon: <SettingOutlined />, label: '油气处理' },
    { key: 'helipad', icon: <DashboardOutlined />, label: '直升机甲板' },
    { key: 'pipeline', icon: <AlertOutlined />, label: '海底管道' },
    { key: 'emergency', icon: <FireOutlined />, label: '应急指挥' },
    { key: 'supply', icon: <FileTextOutlined />, label: '物资调度' },
    { key: 'production', icon: <DashboardOutlined />, label: '产量预测' },
    { key: 'logs', icon: <FileTextOutlined />, label: '操作日志' },
  ];

  const userMenuItems = [
    { key: 'role', label: `角色: ${roleNames[currentUser?.role || '']}`, disabled: true },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: logout },
  ];

  return (
    <Layout className="h-screen">
      <Header className="bg-oil-dark/90 border-b border-oil-primary/30 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold glow-text text-oil-primary">
            3D智慧海上石油钻井平台
          </h1>
          {isDrillActive && (
            <Tag color="red" className="animate-pulse text-lg">
              <FireOutlined spin /> 应急演练进行中
            </Tag>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Dropdown menu={{ items: [{ key: '1', label: <AlertList /> }] }} placement="bottomRight" trigger={['click']}>
            <Badge count={unreadAlerts} size="small">
              <Button type="text" icon={<BellOutlined className="text-oil-primary" />} />
            </Badge>
          </Dropdown>
          
          {currentUser?.role !== 'operator' && (
            <Button
              type={isDrillActive ? 'primary' : 'default'}
              danger={isDrillActive}
              icon={<FireOutlined />}
              onClick={isDrillActive ? stopEmergencyDrill : startEmergencyDrill}
            >
              {isDrillActive ? '停止演练' : '启动应急演练'}
            </Button>
          )}
          
          {currentUser?.role === 'manager' && (
            <Button icon={<DownloadOutlined />} onClick={handleExportReport}>
              导出日报
            </Button>
          )}
          
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-3 py-1 rounded">
              <Avatar size="small" style={{ backgroundColor: '#00d4ff' }}>
                {currentUser?.name?.charAt(0)}
              </Avatar>
              <span>{currentUser?.name}</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      
      <Layout>
        <Sider width={280} className="bg-oil-dark/80 border-r border-oil-primary/30">
          <Menu
            mode="inline"
            selectedKeys={[activePanel]}
            onClick={({ key }) => setActivePanel(key)}
            className="h-full border-r-0 bg-transparent"
            theme="dark"
            items={menuItems}
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-oil-primary/30">
            <div className="text-xs text-gray-400">
              <p>系统时间: {new Date().toLocaleString('zh-CN')}</p>
              <p className="mt-1">版本: v1.0.0</p>
            </div>
          </div>
        </Sider>
        
        <Content className="relative overflow-hidden">
          <Scene3D />
          
          <div className="absolute top-4 right-4 w-96 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {activePanel === 'drilling' && <DrillingPanel />}
            {activePanel === 'processing' && <ProcessingPanel />}
            {activePanel === 'helipad' && <HelipadPanel />}
            {activePanel === 'pipeline' && <PipelinePanel />}
            {activePanel === 'emergency' && <EmergencyPanel />}
            {activePanel === 'supply' && <SupplyPanel />}
            {activePanel === 'production' && <ProductionPanel />}
            {activePanel === 'logs' && <LogsPanel />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
