import { Card, Progress, Button, Table, Tag, Space } from 'antd';
import { SettingOutlined, WarningOutlined, ToolOutlined } from '@ant-design/icons';
import { useStore } from '@/store/useStore';
import ReactECharts from 'echarts-for-react';

const ProcessingPanel = () => {
  const separators = useStore((state) => state.separators);
  const workOrders = useStore((state) => state.workOrders);
  const switchSeparator = useStore((state) => state.switchSeparator);
  const currentUser = useStore((state) => state.currentUser);

  const getLevelColor = (level: number) => {
    if (level >= 80) return '#ff3333';
    if (level >= 60) return '#ffaa00';
    return '#00ff88';
  };

  const getPressureTrendOption = () => ({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      axisLine: { lineStyle: { color: '#00d4ff' } },
      axisLabel: { color: '#999' },
    },
    yAxis: {
      type: 'value',
      name: '压力 (MPa)',
      axisLine: { lineStyle: { color: '#00d4ff' } },
      axisLabel: { color: '#999' },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
    },
    series: separators.map((sep, index) => ({
      name: sep.name,
      type: 'line',
      smooth: true,
      data: [1.2, 1.3, 1.25, 1.4, 1.35, 1.3, 1.28].map(v => v + index * 0.1 + Math.random() * 0.1),
      lineStyle: { 
        color: ['#00d4ff', '#00ff88', '#ffaa00'][index], 
        width: 2 
      },
      itemStyle: { color: ['#00d4ff', '#00ff88', '#ffaa00'][index] },
    })),
    legend: {
      data: separators.map(s => s.name),
      textStyle: { color: '#999' },
    },
  });

  const workOrderColumns = [
    { title: '工单ID', dataIndex: 'id', key: 'id', width: 120 },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={t === 'maintenance' ? 'orange' : 'red'}>{t === 'maintenance' ? '维护' : '抢修'}</Tag> },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      render: (s: string) => {
        const colors: Record<string, string> = { pending: 'warning', 'in-progress': 'processing', 'completed': 'success' };
        const texts: Record<string, string> = { pending: '待处理', 'in-progress': '处理中', completed: '已完成' };
        return <Tag color={colors[s]}>{texts[s]}</Tag>;
      }
    },
    { 
      title: '优先级', 
      dataIndex: 'priority', 
      key: 'priority',
      render: (p: string) => {
        const colors: Record<string, string> = { low: 'green', medium: 'orange', high: 'red' };
        const texts: Record<string, string> = { low: '低', medium: '中', high: '高' };
        return <Tag color={colors[p]}>{texts[p]}</Tag>;
      }
    },
  ];

  return (
    <div className="space-y-4">
      <Card 
        title={
          <div className="flex items-center gap-2">
            <SettingOutlined className="text-oil-primary" />
            <span>油气处理模块 - 分离器监控</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <div className="space-y-4">
          {separators.map((separator) => (
            <div
              key={separator.id}
              className={`p-4 rounded-lg border transition-all ${
                separator.status === 'danger'
                  ? 'border-red-500 bg-red-900/30 danger-glow'
                  : separator.isActive
                    ? 'border-oil-primary bg-oil-primary/10'
                    : 'border-oil-primary/30 bg-white/5'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-oil-primary">{separator.name}</span>
                  {separator.isActive && <Tag color="success">运行中</Tag>}
                  {separator.isStandby && <Tag color="default">备用</Tag>}
                  {!separator.isActive && !separator.isStandby && <Tag color="error">故障</Tag>}
                </div>
                {currentUser?.role !== 'operator' && separator.liquidLevel > 75 && separator.isActive && (
                  <Button
                    size="small"
                    danger
                    icon={<WarningOutlined />}
                    onClick={() => switchSeparator(separator.id)}
                  >
                    切换到备用
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">液位</div>
                  <Progress
                    percent={separator.liquidLevel}
                    strokeColor={getLevelColor(separator.liquidLevel)}
                    size="small"
                    format={(percent) => `${percent?.toFixed(1)}%`}
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">温度</div>
                  <div className="text-lg font-bold" style={{ color: separator.temperature > 75 ? '#ff3333' : '#00d4ff' }}>
                    {separator.temperature.toFixed(1)} °C
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">压力</div>
                  <div className="text-lg font-bold" style={{ color: separator.pressure > 1.6 ? '#ff3333' : '#00ff88' }}>
                    {separator.pressure.toFixed(2)} MPa
                  </div>
                </div>
              </div>

              {separator.liquidLevel > 80 && (
                <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-sm flex items-center gap-2">
                  <WarningOutlined className="animate-pulse" />
                  <span>液位超过安全阈值！请立即切换分离器。</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <SettingOutlined className="text-oil-primary" />
            <span>压力趋势曲线</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <ReactECharts option={getPressureTrendOption()} style={{ height: 200 }} theme="dark" />
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <ToolOutlined className="text-oil-primary" />
            <span>维护工单</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        {workOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-4">暂无工单</div>
        ) : (
          <Table
            dataSource={workOrders}
            columns={workOrderColumns}
            size="small"
            pagination={{ pageSize: 3 }}
            rowKey="id"
            scroll={{ x: true }}
          />
        )}
      </Card>
    </div>
  );
};

export default ProcessingPanel;
