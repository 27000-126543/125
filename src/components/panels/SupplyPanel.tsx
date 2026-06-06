import { Card, Table, Tag, Button, Progress, Steps, Modal, Form, Input, message, Timeline } from 'antd';
import { ShoppingOutlined, SafetyOutlined, CheckCircleOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

const { Step } = Steps;

const SupplyPanel = () => {
  const supplyShips = useStore((state) => state.supplyShips);
  const approveSupplyShip = useStore((state) => state.approveSupplyShip);
  const currentUser = useStore((state) => state.currentUser);
  const [detailModal, setDetailModal] = useState<string | null>(null);

  const getApprovalSteps = (status: string) => {
    const steps = [
      { title: '仓储审批', description: '仓储部门审核' },
      { title: '采购审批', description: '采购部门审核' },
      { title: '安全审批', description: '安全部门审核' },
    ];
    let current = 0;
    if (status.includes('warehouse')) current = 1;
    if (status.includes('procurement')) current = 2;
    if (status.includes('safety')) current = 3;
    if (status === 'docked') current = 3;
    return { steps, current };
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: '待审批',
      'warehouse-approved': '仓储已审批',
      'procurement-approved': '采购已审批',
      'safety-approved': '安全已审批',
      docked: '已到港',
    };
    return texts[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'warning',
      'warehouse-approved': 'processing',
      'procurement-approved': 'processing',
      'safety-approved': 'success',
      docked: 'success',
    };
    return colors[status] || 'default';
  };

  const canApprove = (level: string, shipStatus: string) => {
    if (currentUser?.role === 'operator') return false;
    if (level === 'warehouse' && shipStatus === 'pending') return true;
    if (level === 'procurement' && shipStatus === 'warehouse-approved') return true;
    if (level === 'safety' && shipStatus === 'procurement-approved') return true;
    return false;
  };

  const handleApprove = (shipId: string, level: 'warehouse' | 'procurement' | 'safety') => {
    approveSupplyShip(shipId, level);
    message.success(`${level === 'warehouse' ? '仓储' : level === 'procurement' ? '采购' : '安全'}审批通过`);
  };

  const selectedShip = supplyShips.find(s => s.id === detailModal);

  return (
    <div className="space-y-4">
      <Card 
        title={
          <div className="flex items-center gap-2">
            <ShoppingOutlined className="text-oil-primary" />
            <span>物资补给调度大屏</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg border border-oil-primary/30 bg-white/5 text-center">
            <div className="text-2xl font-bold text-oil-primary">
              {supplyShips.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-400">待审批</div>
          </div>
          <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-900/20 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {supplyShips.filter(s => !['pending', 'docked'].includes(s.status)).length}
            </div>
            <div className="text-xs text-gray-400">审批中</div>
          </div>
          <div className="p-3 rounded-lg border border-green-500/30 bg-green-900/20 text-center">
            <div className="text-2xl font-bold text-green-400">
              {supplyShips.filter(s => s.status === 'docked').length}
            </div>
            <div className="text-xs text-gray-400">已到港</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-oil-primary mb-2">审批流程进度</div>
          <Steps direction="vertical" size="small" current={2}>
            <Step title="仓储审批" description="检查库存是否充足" icon={<FileTextOutlined />} />
            <Step title="采购审批" description="核对采购清单及预算" icon={<ShoppingOutlined />} />
            <Step title="安全审批" description="安全检查及准入许可" icon={<SafetyOutlined />} />
          </Steps>
        </div>
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <ShoppingOutlined className="text-oil-primary" />
            <span>补给船列表</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <div className="space-y-4">
          {supplyShips.map((ship) => {
            const { steps, current } = getApprovalSteps(ship.status);
            return (
              <div
                key={ship.id}
                className="p-4 rounded-lg border border-oil-primary/30 bg-white/5"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-oil-primary text-lg">{ship.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      <ClockCircleOutlined /> 预计到港: {ship.eta}
                    </div>
                  </div>
                  <Tag color={getStatusColor(ship.status)}>
                    {getStatusText(ship.status)}
                  </Tag>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">货物: {ship.cargo}</div>
                  <Progress
                    percent={ship.approvalProgress}
                    strokeColor={{
                      '0%': '#00d4ff',
                      '100%': '#00ff88',
                    }}
                    size="small"
                  />
                </div>

                <Steps size="small" current={current} className="mb-3">
                  {steps.map((step, index) => (
                    <Step key={index} title={step.title} />
                  ))}
                </Steps>

                {currentUser?.role !== 'operator' && (
                  <div className="flex gap-2">
                    {canApprove('warehouse', ship.status) && (
                      <Button
                        size="small"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApprove(ship.id, 'warehouse')}
                      >
                        仓储审批
                      </Button>
                    )}
                    {canApprove('procurement', ship.status) && (
                      <Button
                        size="small"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApprove(ship.id, 'procurement')}
                      >
                        采购审批
                      </Button>
                    )}
                    {canApprove('safety', ship.status) && (
                      <Button
                        size="small"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApprove(ship.id, 'safety')}
                      >
                        安全审批
                      </Button>
                    )}
                    <Button
                      size="small"
                      icon={<FileTextOutlined />}
                      onClick={() => setDetailModal(ship.id)}
                    >
                      详情
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Modal
        title="补给船审批详情"
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={null}
        width={500}
      >
        {selectedShip && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-oil-primary/30 bg-white/5">
                <div className="text-xs text-gray-400">船名</div>
                <div className="font-bold text-oil-primary">{selectedShip.name}</div>
              </div>
              <div className="p-3 rounded-lg border border-oil-primary/30 bg-white/5">
                <div className="text-xs text-gray-400">状态</div>
                <Tag color={getStatusColor(selectedShip.status)}>
                  {getStatusText(selectedShip.status)}
                </Tag>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-oil-primary/30 bg-white/5">
              <div className="text-xs text-gray-400">货物清单</div>
              <div className="mt-1">{selectedShip.cargo}</div>
            </div>

            <div className="p-3 rounded-lg border border-oil-primary/30 bg-white/5">
              <div className="text-xs text-gray-400 mb-2">审批记录</div>
              <Timeline>
                <Timeline.Item color="green">
                  申请提交 - {selectedShip.eta}
                </Timeline.Item>
                {selectedShip.status !== 'pending' && (
                  <Timeline.Item color="green">
                    仓储审批通过
                  </Timeline.Item>
                )}
                {['procurement-approved', 'safety-approved', 'docked'].includes(selectedShip.status) && (
                  <Timeline.Item color="green">
                    采购审批通过
                  </Timeline.Item>
                )}
                {['safety-approved', 'docked'].includes(selectedShip.status) && (
                  <Timeline.Item color="green">
                    安全审批通过
                  </Timeline.Item>
                )}
                {selectedShip.status === 'docked' && (
                  <Timeline.Item color="green">
                    已到港卸货
                  </Timeline.Item>
                )}
              </Timeline>
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-2">审批意见</div>
              <Form>
                <Form.Item>
                  <Input.TextArea rows={3} placeholder="请输入审批意见..." />
                </Form.Item>
              </Form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupplyPanel;
