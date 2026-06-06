import { Card, Statistic, Row, Col, Button, Modal, Table, Tag, Space } from 'antd';
import { WarningOutlined, ThunderboltOutlined, RiseOutlined, DashboardOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useStore } from '@/store/useStore';

const DrillingPanel = () => {
  const drillingModules = useStore((state) => state.drillingModules);
  const selectedModuleId = useStore((state) => state.selectedModuleId);
  const selectModule = useStore((state) => state.selectModule);
  const triggerKickWarning = useStore((state) => state.triggerKickWarning);
  const currentUser = useStore((state) => state.currentUser);

  const selectedModule = drillingModules.find(m => m.id === selectedModuleId);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      normal: 'success',
      warning: 'warning',
      danger: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      normal: '正常',
      warning: '预警',
      danger: '危险',
    };
    return texts[status] || status;
  };

  const getBopStatusText = (status: string) => {
    const texts: Record<string, string> = {
      open: '开启',
      closed: '关闭',
      closing: '关井中',
    };
    return texts[status] || status;
  };

  const getFootageChartOption = (module: typeof drillingModules[0]) => ({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: module.footageData.map(d => d.time),
      axisLine: { lineStyle: { color: '#00d4ff' } },
      axisLabel: { color: '#999' },
    },
    yAxis: {
      type: 'value',
      name: '井深 (m)',
      axisLine: { lineStyle: { color: '#00d4ff' } },
      axisLabel: { color: '#999' },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
    },
    series: [{
      name: '井深',
      type: 'line',
      smooth: true,
      data: module.footageData.map(d => d.depth),
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 212, 255, 0.4)' },
            { offset: 1, color: 'rgba(0, 212, 255, 0.05)' },
          ],
        },
      },
      lineStyle: { color: '#00d4ff', width: 2 },
      itemStyle: { color: '#00d4ff' },
    }],
  });

  const wellStructureColumns = [
    { title: '井段', dataIndex: 'section', key: 'section' },
    { title: '深度(m)', dataIndex: 'depth', key: 'depth' },
    { title: '直径(mm)', dataIndex: 'diameter', key: 'diameter' },
    { title: '套管类型', dataIndex: 'casing', key: 'casing' },
  ];

  return (
    <div className="space-y-4">
      <Card 
        title={
          <div className="flex items-center gap-2">
            <DashboardOutlined className="text-oil-primary" />
            <span>钻井模块监控</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <div className="grid grid-cols-2 gap-2">
          {drillingModules.map((module) => (
            <div
              key={module.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                module.status === 'danger' 
                  ? 'border-red-500 bg-red-900/30 danger-glow' 
                  : selectedModuleId === module.id
                    ? 'border-oil-primary bg-oil-primary/20 glow-border'
                    : 'border-oil-primary/30 bg-white/5 hover:border-oil-primary/60'
              }`}
              onClick={() => selectModule(selectedModuleId === module.id ? null : module.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-oil-primary">{module.name}</span>
                <Tag color={getStatusColor(module.status)}>
                  {getStatusText(module.status)}
                </Tag>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">当前钻深:</span>
                  <span className="text-oil-success">{module.currentDepth.toFixed(1)} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">泥浆压力:</span>
                  <span>{(module.mudPressure / 1000).toFixed(1)} kPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">钻压:</span>
                  <span>{module.weightOnBit.toFixed(0)} kN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">转速:</span>
                  <span>{module.rotationSpeed.toFixed(0)} RPM</span>
                </div>
                <div className="flex justify-between mt-1 pt-1 border-t border-oil-primary/20">
                  <span className="text-gray-400">防喷器:</span>
                  <Tag 
                    color={module.bopStatus === 'closed' ? 'success' : module.bopStatus === 'closing' ? 'warning' : 'default'} 

                  >
                    {getBopStatusText(module.bopStatus)}
                  </Tag>
                </div>
              </div>
              {currentUser?.role !== 'operator' && (
                <Button
                  size="small"
                  danger
                  icon={<WarningOutlined />}
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerKickWarning(module.id);
                  }}
                  disabled={module.kickWarning}
                >
                  {module.kickWarning ? '已触发预警' : '模拟井涌'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <RiseOutlined className="text-oil-primary" />
            <span>{selectedModule?.name} - 详细数据</span>
          </div>
        }
        open={!!selectedModule}
        onCancel={() => selectModule(null)}
        footer={null}
        width={800}
      >
        {selectedModule && (
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={6}>
                <Card size="small" className="panel-bg">
                  <Statistic 
                    title="当前钻深" 
                    value={selectedModule.currentDepth.toFixed(1)} 
                    suffix="m"
                    valueStyle={{ color: '#00ff88' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" className="panel-bg">
                  <Statistic 
                    title="泥浆压力" 
                    value={(selectedModule.mudPressure / 1000).toFixed(1)} 
                    suffix="kPa"
                    valueStyle={{ color: '#00d4ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" className="panel-bg">
                  <Statistic 
                    title="钻压" 
                    value={selectedModule.weightOnBit.toFixed(0)} 
                    suffix="kN"
                    valueStyle={{ color: '#ffaa00' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" className="panel-bg">
                  <Statistic 
                    title="转速" 
                    value={selectedModule.rotationSpeed.toFixed(0)} 
                    suffix="RPM"
                    valueStyle={{ color: '#ff6600' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card 
              title={
                <div className="flex items-center gap-2">
                  <ThunderboltOutlined className="text-oil-primary" />
                  <span>近24小时进尺曲线</span>
                </div>
              }
              size="small"
              className="panel-bg"
            >
              <ReactECharts 
                option={getFootageChartOption(selectedModule)} 
                style={{ height: 200 }}
                theme="dark"
              />
            </Card>

            <Card 
              title={
                <div className="flex items-center gap-2">
                  <DashboardOutlined className="text-oil-primary" />
                  <span>井身结构数据</span>
                </div>
              }
              size="small"
              className="panel-bg"
            >
              <Table
                dataSource={selectedModule.wellStructure}
                columns={wellStructureColumns}
                size="small"
                pagination={false}
                rowKey="section"
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DrillingPanel;
