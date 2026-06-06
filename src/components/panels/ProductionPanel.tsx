import { Card, Table, Tag, Alert, Space, Statistic, Row, Col } from 'antd';
import { RiseOutlined, FallOutlined, WarningOutlined, DashboardOutlined, BarChartOutlined } from '@ant-design/icons';
import { useStore } from '@/store/useStore';
import ReactECharts from 'echarts-for-react';

const ProductionPanel = () => {
  const productionPredictions = useStore((state) => state.productionPredictions);
  const drillingModules = useStore((state) => state.drillingModules);

  const lowYieldWells = drillingModules.filter((_, index) => index >= 2);

  const getPredictionChartOption = () => ({
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['预测产量', '实际产量'],
      textStyle: { color: '#999' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: productionPredictions.map(p => p.date.slice(5)),
      axisLine: { lineStyle: { color: '#00d4ff' } },
      axisLabel: { color: '#999' },
    },
    yAxis: {
      type: 'value',
      name: '产量 (桶/天)',
      axisLine: { lineStyle: { color: '#00d4ff' } },
      axisLabel: { color: '#999' },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
    },
    series: [
      {
        name: '预测产量',
        type: 'line',
        smooth: true,
        data: productionPredictions.map(p => p.predicted),
        lineStyle: { color: '#00d4ff', width: 2, type: 'dashed' },
        itemStyle: { color: '#00d4ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.05)' },
            ],
          },
        },
      },
      {
        name: '实际产量',
        type: 'line',
        smooth: true,
        data: productionPredictions.map(p => p.actual || null),
        lineStyle: { color: '#00ff88', width: 3 },
        itemStyle: { color: '#00ff88' },
      },
    ],
  });

  const getWellPerformanceChartOption = () => ({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: drillingModules.map(m => m.name),
      axisLine: { lineStyle: { color: '#00d4ff' } },
      axisLabel: { color: '#999', rotate: 30 },
    },
    yAxis: {
      type: 'value',
      name: '产量 (桶/天)',
      axisLine: { lineStyle: { color: '#00d4ff' } },
      axisLabel: { color: '#999' },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
    },
    series: [{
      type: 'bar',
      data: drillingModules.map((m, i) => ({
        value: 300 + i * 50 + Math.random() * 100,
        itemStyle: {
          color: i >= 2 ? '#ff3333' : '#00d4ff',
        },
      })),
      barWidth: '50%',
    }],
  });

  const wellColumns = [
    { title: '模块', dataIndex: 'name', key: 'name' },
    { 
      title: '当前钻深', 
      dataIndex: 'currentDepth', 
      key: 'currentDepth',
      render: (v: number) => `${v.toFixed(1)} m`
    },
    { 
      title: '日产量', 
      dataIndex: 'production', 
      key: 'production',
      render: (_: any, record: any, index: number) => {
        const prod = 300 + index * 50 + Math.random() * 100;
        return (
          <span className={index >= 2 ? 'text-red-500 font-bold' : 'text-oil-success'}>
            {prod.toFixed(0)} 桶
          </span>
        );
      }
    },
    { 
      title: '油层压力', 
      dataIndex: 'mudPressure', 
      key: 'mudPressure',
      render: (v: number) => `${(v / 1000).toFixed(1)} kPa`
    },
    { 
      title: '状态', 
      key: 'status',
      render: (_: any, __: any, index: number) => (
        <Tag color={index >= 2 ? 'red' : 'green'}>
          {index >= 2 ? '低产' : '正常'}
        </Tag>
      )
    },
  ];

  const suggestions = [
    {
      well: '钻井模块 3#',
      issue: '产量低于预期30%，油层压力下降明显',
      suggestion: '建议进行酸化压裂作业，提高渗透率',
      priority: 'high',
    },
    {
      well: '钻井模块 4#',
      issue: '产量低于预期25%，钻速放缓',
      suggestion: '建议检查钻头磨损情况，考虑更换钻头',
      priority: 'medium',
    },
  ];

  const totalPredicted = productionPredictions.reduce((sum, p) => sum + p.predicted, 0);
  const totalActual = productionPredictions.reduce((sum, p) => sum + (p.actual || 0), 0);

  return (
    <div className="space-y-4">
      <Card 
        title={
          <div className="flex items-center gap-2">
            <BarChartOutlined className="text-oil-primary" />
            <span>产量预测总览</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <Row gutter={16} className="mb-4">
          <Col span={8}>
            <Card size="small" className="panel-bg">
              <Statistic 
                title="7天预测总产量" 
                value={totalPredicted.toFixed(0)} 
                suffix="桶"
                valueStyle={{ color: '#00d4ff' }}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="panel-bg">
              <Statistic 
                title="实际总产量" 
                value={totalActual.toFixed(0)} 
                suffix="桶"
                valueStyle={{ color: '#00ff88' }}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="panel-bg">
              <Statistic 
                title="低产井数" 
                value={lowYieldWells.length} 
                suffix="口"
                valueStyle={{ color: '#ff3333' }}
                prefix={<FallOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Alert
          message="产量预测基于历史产量和油层压力数据分析"
          description="系统采用机器学习算法，结合钻井数据和油藏模型进行预测"
          type="info"
          showIcon
          className="mb-4"
        />
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <RiseOutlined className="text-oil-primary" />
            <span>未来7天产量预测曲线</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <ReactECharts option={getPredictionChartOption()} style={{ height: 250 }} theme="dark" />
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <DashboardOutlined className="text-oil-primary" />
            <span>各井产量对比</span>
            {lowYieldWells.length > 0 && (
              <Tag color="red" className="ml-2">
                <WarningOutlined /> {lowYieldWells.length} 口低产井
              </Tag>
            )}
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <ReactECharts option={getWellPerformanceChartOption()} style={{ height: 200 }} theme="dark" />
        <div className="mt-2 text-xs text-gray-500 text-center">
          <span className="inline-block w-3 h-3 bg-oil-primary mr-1" /> 正常井
          <span className="inline-block w-3 h-3 bg-red-500 mx-1 ml-3" /> 低产井
        </div>
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <DashboardOutlined className="text-oil-primary" />
            <span>钻井详情</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <Table
          dataSource={drillingModules}
          columns={wellColumns}
          size="small"
          pagination={false}
          rowKey="id"
          rowClassName={(_, index) => index >= 2 ? 'bg-red-900/20' : ''}
        />
      </Card>

      {suggestions.length > 0 && (
        <Card 
          title={
            <div className="flex items-center gap-2">
              <WarningOutlined className="text-oil-warning" />
              <span>调整建议</span>
            </div>
          }
          className="panel-bg glow-border"
          size="small"
        >
          <div className="space-y-3">
            {suggestions.map((s, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  s.priority === 'high' 
                    ? 'border-red-500/50 bg-red-900/20' 
                    : 'border-orange-500/50 bg-orange-900/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-oil-primary">{s.well}</span>
                  <Tag color={s.priority === 'high' ? 'red' : 'orange'}>
                    {s.priority === 'high' ? '高优先级' : '中优先级'}
                  </Tag>
                </div>
                <div className="text-sm text-gray-300 mb-2">
                  <WarningOutlined className="mr-1" /> {s.issue}
                </div>
                <div className="text-sm text-oil-success">
                  <RiseOutlined className="mr-1" /> 建议: {s.suggestion}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductionPanel;
