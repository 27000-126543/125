import { List, Tag, Button, Empty } from 'antd';
import { WarningOutlined, CheckOutlined } from '@ant-design/icons';
import { useStore } from '@/store/useStore';
import dayjs from 'dayjs';

const AlertList = () => {
  const alerts = useStore((state) => state.alerts);
  const acknowledgeAlert = useStore((state) => state.acknowledgeAlert);

  const getAlertColor = (type: string) => {
    const colors: Record<string, string> = {
      kick: 'red',
      level: 'orange',
      leak: 'red',
      unauthorized: 'red',
      fire: 'red',
    };
    return colors[type] || 'blue';
  };

  const getAlertIcon = (type: string) => {
    const icons: Record<string, string> = {
      kick: '井涌',
      level: '液位',
      leak: '泄漏',
      unauthorized: '入侵',
      fire: '火灾',
    };
    return icons[type] || '告警';
  };

  const sortedAlerts = [...alerts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="w-80 max-h-96 overflow-y-auto">
      {sortedAlerts.length === 0 ? (
        <Empty description="暂无告警" className="py-8" />
      ) : (
        <List
          dataSource={sortedAlerts}
          renderItem={(alert) => (
            <List.Item
              className={`border-b border-oil-primary/20 ${!alert.acknowledged ? 'bg-red-900/20' : ''}`}
            >
              <List.Item.Meta
                avatar={<WarningOutlined className="text-red-500 text-xl" />}
                title={
                  <div className="flex items-center justify-between">
                    <Tag color={getAlertColor(alert.type)}>
                      {getAlertIcon(alert.type)}
                    </Tag>
                    {!alert.acknowledged && (
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        确认
                      </Button>
                    )}
                  </div>
                }
                description={
                  <div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dayjs(alert.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    </p>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default AlertList;
