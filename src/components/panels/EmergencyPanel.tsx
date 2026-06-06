import { Card, Button, Table, Tag, Alert, Timeline, Space } from 'antd';
import { FireOutlined, SafetyOutlined, WarningOutlined, CheckCircleOutlined, RocketOutlined } from '@ant-design/icons';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';

const EmergencyPanel = () => {
  const isDrillActive = useStore((state) => state.isDrillActive);
  const startEmergencyDrill = useStore((state) => state.startEmergencyDrill);
  const stopEmergencyDrill = useStore((state) => state.stopEmergencyDrill);
  const evacuationPaths = useStore((state) => state.evacuationPaths);
  const fireboatPaths = useStore((state) => state.fireboatPaths);
  const alerts = useStore((state) => state.alerts);
  const currentUser = useStore((state) => state.currentUser);

  const [drillStep, setDrillStep] = useState(0);

  useEffect(() => {
    if (isDrillActive) {
      const steps = [
        { delay: 0, message: '启动井喷火灾模拟' },
        { delay: 1000, message: '触发火灾警报' },
        { delay: 2000, message: '生成人员疏散路径' },
        { delay: 3000, message: '调度消防船响应' },
        { delay: 4000, message: '推送通知到所有终端' },
        { delay: 5000, message: '应急演练正常进行中' },
      ];

      steps.forEach((step, index) => {
        setTimeout(() => setDrillStep(index + 1), step.delay);
      });
    } else {
      setDrillStep(0);
    }
  }, [isDrillActive]);

  const drillTimeline = [
    { color: 'red', title: '井喷火灾模拟', icon: <FireOutlined /> },
    { color: 'orange', title: '火灾警报触发', icon: <WarningOutlined /> },
    { color: 'green', title: '疏散路径生成', icon: <SafetyOutlined /> },
    { color: 'blue', title: '消防船响应', icon: <RocketOutlined /> },
    { color: 'purple', title: '通知推送', icon: <CheckCircleOutlined /> },
    { color: 'cyan', title: '演练进行中', icon: <SafetyOutlined /> },
  ];

  const emergencyContacts = [
    { id: '1', name: '平台经理', role: '总指挥', phone: '138****8888', status: 'online' },
    { id: '2', name: '安全总监', role: '现场指挥', phone: '139****9999', status: 'online' },
    { id: '3', name: '钻井监督', role: '技术支持', phone: '137****7777', status: 'online' },
    { id: '4', name: '医疗救护', role: '医疗支援', phone: '136****6666', status: 'standby' },
    { id: '5', name: '岸基支持', role: '后勤协调', phone: '135****5555', status: 'online' },
  ];

  const fireEmergencies = alerts.filter(a => a.type === 'fire');

  return (
    <div className="space-y-4">
      <Card 
        title={
          <div className="flex items-center gap-2">
            <FireOutlined className={isDrillActive ? 'text-red-500 animate-pulse' : 'text-oil-primary'} />
            <span>应急指挥中心</span>
            {isDrillActive && <Tag color="red" className="animate-pulse">演练中</Tag>}
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        {isDrillActive ? (
          <div className="space-y-4">
            <Alert
              message="应急演练进行中"
              description="模拟井喷火灾事件正在进行，所有应急响应已自动启动。"
              type="error"
              showIcon
              icon={<FireOutlined className="animate-pulse" />}
              action={
                currentUser?.role !== 'operator' && (
                  <Button danger size="small" onClick={stopEmergencyDrill}>
                    停止演练
                  </Button>
                )
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-green-500/50 bg-green-900/20">
                <div className="text-xs text-gray-400 mb-1">疏散路径</div>
                <div className="text-lg font-bold text-green-400">
                  {evacuationPaths.length} 条
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <SafetyOutlined className="text-green-400" /> 绿色箭头指示
                </div>
              </div>
              <div className="p-3 rounded-lg border border-blue-500/50 bg-blue-900/20">
                <div className="text-xs text-gray-400 mb-1">消防船响应</div>
                <div className="text-lg font-bold text-blue-400">
                  {fireboatPaths.length} 艘
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <RocketOutlined className="text-blue-400" /> 蓝色箭头指示
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-oil-primary mb-2">演练进度</div>
              <Timeline
                mode="left"
                items={drillTimeline.slice(0, drillStep).map((item, index) => ({
                  color: item.color,
                  dot: item.icon,
                  children: <span className={index === drillStep - 1 ? 'text-white font-bold' : 'text-gray-400'}>{item.title}</span>,
                }))}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-8">
              <SafetyOutlined className="text-6xl text-oil-success mb-4" />
              <p className="text-lg font-bold text-oil-success">系统运行正常</p>
              <p className="text-sm text-gray-400 mt-2">当前无应急事件</p>
            </div>

            {currentUser?.role !== 'operator' && (
              <Button
                type="primary"
                danger
                block
                size="large"
                icon={<FireOutlined />}
                onClick={startEmergencyDrill}
              >
                一键启动应急演练
              </Button>
            )}

            <div className="text-xs text-gray-500 text-center">
              模拟井喷火灾，自动生成人员疏散路径和消防船响应轨迹
            </div>
          </div>
        )}
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <SafetyOutlined className="text-oil-primary" />
            <span>应急联系人</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <Table
          dataSource={emergencyContacts}
          columns={[
            { title: '姓名', dataIndex: 'name', key: 'name' },
            { title: '角色', dataIndex: 'role', key: 'role' },
            { title: '电话', dataIndex: 'phone', key: 'phone' },
            { 
              title: '状态', 
              dataIndex: 'status', 
              key: 'status',
              render: (s: string) => (
                <Tag color={s === 'online' ? 'success' : 'warning'}>
                  {s === 'online' ? '在线' : '待命'}
                </Tag>
              )
            },
          ]}
          size="small"
          pagination={false}
          rowKey="id"
        />
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <WarningOutlined className="text-oil-primary" />
            <span>火灾事件记录</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        {fireEmergencies.length === 0 ? (
          <div className="text-center text-gray-500 py-4">暂无火灾事件</div>
        ) : (
          <Table
            dataSource={fireEmergencies}
            columns={[
              { title: '时间', dataIndex: 'timestamp', key: 'timestamp', render: (t: string) => new Date(t).toLocaleString() },
              { title: '消息', dataIndex: 'message', key: 'message' },
              { 
                title: '状态', 
                dataIndex: 'acknowledged', 
                key: 'acknowledged',
                render: (a: boolean) => (
                  <Tag color={a ? 'success' : 'warning'}>
                    {a ? '已确认' : '未确认'}
                  </Tag>
                )
              },
            ]}
            size="small"
            pagination={{ pageSize: 3 }}
            rowKey="id"
          />
        )}
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <SafetyOutlined className="text-oil-primary" />
            <span>应急预案</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <div className="space-y-2">
          {[
            { name: '井喷应急预案', level: '一级', desc: '井涌/井喷事件应急处置流程' },
            { name: '火灾应急预案', level: '一级', desc: '平台火灾事故应急处置流程' },
            { name: '人员疏散预案', level: '二级', desc: '紧急情况下人员疏散方案' },
            { name: '溢油回收预案', level: '二级', desc: '海面溢油污染应急处置' },
            { name: '医疗救援预案', level: '三级', desc: '人员伤亡医疗救援流程' },
          ].map((plan, index) => (
            <div key={index} className="p-3 rounded-lg border border-oil-primary/30 bg-white/5 flex justify-between items-center">
              <div>
                <div className="font-medium text-oil-primary">{plan.name}</div>
                <div className="text-xs text-gray-400">{plan.desc}</div>
              </div>
              <Tag color={plan.level === '一级' ? 'red' : plan.level === '二级' ? 'orange' : 'blue'}>
                {plan.level}
              </Tag>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EmergencyPanel;
