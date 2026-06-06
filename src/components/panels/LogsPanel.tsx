import { Card, Table, Tag, Input, Select, DatePicker } from 'antd';
import { FileTextOutlined, SearchOutlined, FilterOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const LogsPanel = () => {
  const operationLogs = useStore((state) => state.operationLogs);
  const [searchText, setSearchText] = useState('');
  const [filterModule, setFilterModule] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const modules = [...new Set(operationLogs.map(log => log.module))];

  const filteredLogs = operationLogs.filter(log => {
    const matchSearch = !searchText || 
      log.action.toLowerCase().includes(searchText.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchText.toLowerCase());
    const matchModule = !filterModule || log.module === filterModule;
    const matchDate = !dateRange || !dateRange[0] || !dateRange[1] || (
      dayjs(log.timestamp).isAfter(dateRange[0]) && 
      dayjs(log.timestamp).isBefore(dateRange[1])
    );
    return matchSearch && matchModule && matchDate;
  });

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (t: string) => (
        <div className="flex items-center gap-1">
          <ClockCircleOutlined className="text-oil-primary text-xs" />
          <span>{dayjs(t).format('YYYY-MM-DD HH:mm:ss')}</span>
        </div>
      ),
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
      render: (name: string) => (
        <div className="flex items-center gap-1">
          <UserOutlined className="text-oil-primary text-xs" />
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color="blue">{action}</Tag>
      ),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      render: (module: string) => {
        const moduleNames: Record<string, string> = {
          '系统': '系统管理',
          '应急指挥中心': '应急指挥',
          'drill-1': '钻井模块1#',
          'drill-2': '钻井模块2#',
          'drill-3': '钻井模块3#',
          'drill-4': '钻井模块4#',
          'sep-1': '分离器1#',
          'sep-2': '分离器2#',
          'sep-3': '分离器3#',
          'pipe-1': '海底管道A',
          '直升机甲板': '直升机甲板',
          'ship-1': '补给船',
        };
        return (
          <Tag color="purple">{moduleNames[module] || module}</Tag>
        );
      },
    },
    {
      title: '日志ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => <span className="text-xs text-gray-500">{id.slice(-8)}</span>,
    },
  ];

  const actionStats = operationLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moduleStats = operationLogs.reduce((acc, log) => {
    acc[log.module] = (acc[log.module] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <Card 
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-oil-primary" />
            <span>操作日志</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg border border-oil-primary/30 bg-white/5">
            <div className="text-xs text-gray-400 mb-1">总操作数</div>
            <div className="text-2xl font-bold text-oil-primary">{operationLogs.length}</div>
          </div>
          <div className="p-3 rounded-lg border border-oil-primary/30 bg-white/5">
            <div className="text-xs text-gray-400 mb-1">操作类型数</div>
            <div className="text-2xl font-bold text-oil-success">{Object.keys(actionStats).length}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Input
            placeholder="搜索操作或用户"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-48"
            size="small"
          />
          <Select
            placeholder="筛选模块"
            allowClear
            value={filterModule || undefined}
            onChange={setFilterModule}
            className="w-40"
            size="small"
            options={modules.map(m => ({ label: m, value: m }))}
          />
          <RangePicker
            size="small"
            value={dateRange}
            onChange={(dates) => setDateRange(dates as any)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(actionStats).map(([action, count]) => (
            <Tag key={action} color="blue" className="cursor-pointer hover:bg-blue-900/30">
              {action}: {count}
            </Tag>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(moduleStats).map(([module, count]) => (
            <Tag 
              key={module} 
              color="purple" 
              className={`cursor-pointer hover:bg-purple-900/30 ${filterModule === module ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setFilterModule(filterModule === module ? '' : module)}
            >
              <FilterOutlined className="mr-1" />
              {module}: {count}
            </Tag>
          ))}
        </div>

        <Table
          dataSource={filteredLogs}
          columns={columns}
          size="small"
          pagination={{ pageSize: 10 }}
          rowKey="id"
          scroll={{ x: true }}
        />
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-oil-primary" />
            <span>操作统计</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <div className="space-y-3">
          {Object.entries(actionStats).map(([action, count]) => (
            <div key={action} className="flex items-center justify-between">
              <span className="text-sm">{action}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-oil-primary rounded-full transition-all"
                    style={{ width: `${(count / operationLogs.length) * 100}%` }}
                  />
                </div>
                <Tag color="blue">{count}</Tag>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-oil-primary" />
            <span>权限说明</span>
          </div>
        }
        className="panel-bg glow-border"
        size="small"
      >
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-oil-primary/30 bg-white/5">
            <div className="font-bold text-oil-primary mb-1">操作员 (Operator)</div>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>查看各模块监控数据</li>
              <li>查看操作日志</li>
              <li>刷脸登机操作</li>
              <li>无法触发模拟预警和演练</li>
              <li>无法进行审批操作</li>
              <li>无法导出生产日报</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-900/20">
            <div className="font-bold text-orange-400 mb-1">平台经理 (Manager)</div>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>所有操作员权限</li>
              <li>触发井涌模拟预警</li>
              <li>启动/停止应急演练</li>
              <li>物资补给审批</li>
              <li>导出生产日报Excel</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-900/20">
            <div className="font-bold text-red-400 mb-1">公司应急中心 (Emergency)</div>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>所有平台经理权限</li>
              <li>全局应急指挥</li>
              <li>查看所有应急预案</li>
              <li>应急资源调度</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LogsPanel;
