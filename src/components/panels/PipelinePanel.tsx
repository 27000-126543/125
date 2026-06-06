import { Card, Table, Tag, Button, Progress, Space, Alert, message } from 'antd';
import { ThunderboltOutlined, WarningOutlined, ToolOutlined, SafetyOutlined } from '@ant-design/icons';
import { useStore } from '@/store/useStore';
import ReactECharts from 'echarts-for-react';

const PipelinePanel = () => {
  const pipelines = useStore((state) => state.pipelines);
  const workOrders = useStore((state) => state.workOrders);
  const detectLeak = useStore((state) => state.detectLeak);
  const currentUser = useStore((state) => state.currentUser);

  const pipeline = pipelines[0];

  const getPressureChartOption = () => {
    if (!pipeline) return {};
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: pipeline.points.map((_, i) => `${i}km`),
        axisLine: { lineStyle: { color: '#00d4ff' } },
        axisLabel: { color: '#999', rotate: 45 },
      },
      yAxis: {
        type: 'value',
        name: '压力 (MPa)',
        axisLine: { lineStyle: { color: '#00d4ff' } },
        axisLabel: { color: '#999' },
        splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
      },
      series: [{
        name: '压力',
        type: 'line',
        smooth: true,
        data: pipeline.points.map(p => p.pressure),
        lineStyle: { 
          color: '#00d4ff', 
          width: 2 
        },
        itemStyle: { 
          color: pipeline.points.map(p => p.leakDetected ? '#ff0000' : p.status === 'danger' ? '#ff6600' : '#00ff88') 
        },
        markLine: {
          silent: true,
          lineStyle: { color: '#ff3333', type: 'dashed' },
          data: [{ yAxis: 5, label: { formatter: '安全阈值' } }],
        },
      }],
    };
  };

  const pointColumns = [
    { title: '监测点', dataIndex: 'id', key: 'id', width: 100 },
    { title: '位置(km)', dataIndex: 'position', key: 'position' },
    { 
      title: '压力(MPa)', 
      dataIndex: 'pressure', 
      key: 'pressure',
      render: (v: number, record: any) => (
        <span className={record.leakDetected ? 'text-red-500 font-bold' : record.status === 'danger' ? 'text-orange-500' : 'text-oil-success'}>
          {v.toFixed(2)}
        </span>
      )
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (s: string, record: any) => {
        if (record.leakDetected) return <Tag color="red">泄漏</Tag>;
        const colors: Record<string, string> = { normal: 'success', warning: 'warning', danger: 'error' };
        const texts: Record<string, string> = { normal: '正常', warning: '预警', danger: '危险' };
        return <Tag color={colors[s]}>{texts[s]}</Tag>;
      }
    },
  ];

  const repairWorkOrders = workOrders.filter(wo => wo.type === 'repair');

  const simulateLeak = () => {
    if (pipeline) {
      const randomPoint = pipeline.points[Math.floor(Math.random() * pipeline.points.length)];
      detectLeak(pipeline.id, randomPoint.id);
      message.warning(`已模拟管道在 ${randomPoint.position}km 处泄漏`);
    }
  };

  return (
    <div className="space-y-4">
      {pipeline && (
        <Card 
          title={
            <div className="flex items-center gap-2">
              <ThunderboltOutlined className="text-oil-primary" />
              <span>{pipeline.name} - 总览</span>
            </div>
          }
          className="panel-bg glow-border"
          size="small"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-lg border border-oil-primary/30 bg-white/5">
              <div className="text-xs text-gray-400 mb-1">管道长度</div>
              <div className="text-xl font-bold text-oil-primary">{pipeline.length} km</div>
            </div>
            <div className="p-3 rounded-lg border border-oil-primary/30 bg-white/5">
              <div className="text-xs text-gray-400 mb-1">监测点数</div>
              <div className="text-xl font-bold text-oil-success">{pipeline.points.length} 个</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">上游阀门</span>
                <Tag color={pipeline.valveUpstream === 'open' ? 'success' : 'error'}>
                  {pipeline.valveUpstream === 'open' ? '开启' : '关闭'}
                </Tag>
              </div>
              <Progress 
                percent={pipeline.valveUpstream === 'open' ? 100 : 0} 
                size="small"
                strokeColor={pipeline.valveUpstream === 'open' ? '#00ff88' : '#ff3333'}
                showInfo={false}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">下游阀门</span>
                <Tag color={pipeline.valveDownstream === 'open' ? 'success' : 'error'}>
                  {pipeline.valveDownstream === 'open' ? '开启' : '关闭'}
                </Tag>
              </div>
              <Progress 
                percent={pipeline.valveDownstream === 'open' ? 100 : 0} 
                size="small"
                strokeColor={pipeline.valveDownstream === 'open' ? '#00ff88' : '#ff3333'}
                showInfo={false}
              />
            </div>
          </div>

          {pipeline.points.some(p => p.leakDetected) && (
            <Alert
              className="mt-4"
              message="管道泄漏警报"
              description="检测到管道泄漏，上下游阀门已自动关闭，抢修工单已生成。"
              type="error"
              showIcon
              icon={<WarningOutlined className="animate-pulse" />}
            />
          )}

          {currentUser?.role !== 'operator' && (
            <Button
              danger
              block
              icon={<WarningOutlined />}
              className="mt-4"
              onClick={simulateLeak}
            >
              模拟管道泄漏
            </Button>
          )}
        </Card>
      )}

      <Card 
        title={
          <div className="flex items-center gap-2">
            <ThunderboltOutlined className="text-oil-primary" />
            <span>压力分布曲线</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <ReactECharts option={getPressureChartOption()} style={{ height: 250 }} theme="dark" />
        <div className="mt-2 text-xs text-gray-500 text-center">
          <SafetyOutlined className="text-oil-success" /> 绿色=正常
          <span className="mx-2">|</span>
          <WarningOutlined className="text-orange-500" /> 橙色=预警
          <span className="mx-2">|</span>
          <WarningOutlined className="text-red-500" /> 红色=泄漏
        </div>
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <ThunderboltOutlined className="text-oil-primary" />
            <span>监测点详情</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        {pipeline && (
          <Table
            dataSource={pipeline.points}
            columns={pointColumns}
            size="small"
            pagination={{ pageSize: 5 }}
            rowKey="id"
          />
        )}
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <ToolOutlined className="text-oil-primary" />
            <span>抢修工单</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        {repairWorkOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-4">暂无抢修工单</div>
        ) : (
          <Table
            dataSource={repairWorkOrders}
            columns={[
              { title: '工单ID', dataIndex: 'id', key: 'id', width: 120 },
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
            ]}
            size="small"
            pagination={{ pageSize: 3 }}
            rowKey="id"
          />
        )}
      </Card>
    </div>
  );
};

export default PipelinePanel;
