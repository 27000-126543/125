import { create } from 'zustand';
import type {
  User,
  DrillingModule,
  Separator,
  Helicopter,
  Pipeline,
  WorkOrder,
  SupplyShip,
  Alert,
  OperationLog,
  ProductionPrediction,
  DailyReport,
  UserRole,
} from '@/types';

interface StoreState {
  currentUser: User | null;
  drillingModules: DrillingModule[];
  separators: Separator[];
  helicopters: Helicopter[];
  pipelines: Pipeline[];
  workOrders: WorkOrder[];
  supplyShips: SupplyShip[];
  alerts: Alert[];
  operationLogs: OperationLog[];
  productionPredictions: ProductionPrediction[];
  dailyReports: DailyReport[];
  selectedModuleId: string | null;
  isDrillActive: boolean;
  evacuationPaths: { start: [number, number, number]; end: [number, number, number] }[];
  fireboatPaths: { start: [number, number, number]; end: [number, number, number] }[];
  login: (username: string, password: string, role: UserRole) => boolean;
  faceLogin: (imageData: string) => Promise<boolean>;
  logout: () => void;
  selectModule: (id: string | null) => void;
  acknowledgeAlert: (id: string) => void;
  triggerKickWarning: (moduleId: string) => void;
  closeBOP: (moduleId: string) => void;
  switchSeparator: (separatorId: string) => void;
  detectLeak: (pipelineId: string, pointId: string) => void;
  startEmergencyDrill: () => void;
  stopEmergencyDrill: () => void;
  approveSupplyShip: (shipId: string, level: 'warehouse' | 'procurement' | 'safety') => void;
  addOperationLog: (action: string, module: string) => void;
  generateDailyReport: (date: string) => DailyReport;
  setDrillingData: (data: Partial<DrillingModule>) => void;
  fuelReserve: number;
  deckStatus: 'empty' | 'occupied' | 'maintenance';
  unauthorizedAccess: boolean;
  setUnauthorizedAccess: (value: boolean) => void;
}

const generateMockData = () => {
  const modules: DrillingModule[] = [];
  for (let i = 1; i <= 4; i++) {
    const footageData = [];
    let depth = 2000 + i * 500;
    for (let h = 0; h < 24; h++) {
      depth += Math.random() * 10;
      footageData.push({
        time: `${h.toString().padStart(2, '0')}:00`,
        depth: Math.round(depth * 10) / 10,
      });
    }
    modules.push({
      id: `drill-${i}`,
      name: `钻井模块 ${i}#`,
      currentDepth: 2800 + i * 300 + Math.random() * 100,
      mudPressure: 18000 + Math.random() * 2000,
      weightOnBit: 180 + Math.random() * 30,
      rotationSpeed: 80 + Math.random() * 20,
      status: 'normal',
      footageData,
      wellStructure: [
        { section: '表层', depth: 500, diameter: 30, casing: '表层套管' },
        { section: '技术', depth: 2000, diameter: 24, casing: '技术套管' },
        { section: '生产', depth: 3500, diameter: 18, casing: '生产套管' },
      ],
      kickWarning: false,
      bopStatus: 'open',
    });
  }

  const separators: Separator[] = [];
  for (let i = 1; i <= 3; i++) {
    separators.push({
      id: `sep-${i}`,
      name: `分离器 ${i}#`,
      liquidLevel: 45 + Math.random() * 20,
      temperature: 65 + Math.random() * 15,
      pressure: 1.2 + Math.random() * 0.5,
      status: 'normal',
      isActive: i <= 2,
      isStandby: i === 3,
    });
  }

  const helicopters: Helicopter[] = [
    {
      id: 'heli-1',
      flightNumber: 'CN-OIL001',
      departure: '深圳',
      arrival: '平台',
      status: 'scheduled',
      passengerCount: 8,
      scheduledTime: '10:30',
    },
    {
      id: 'heli-2',
      flightNumber: 'CN-OIL002',
      departure: '平台',
      arrival: '湛江',
      status: 'boarding',
      passengerCount: 6,
      scheduledTime: '14:00',
    },
  ];

  const pipelines: Pipeline[] = [
    {
      id: 'pipe-1',
      name: '海底输油管道A',
      length: 25,
      points: Array.from({ length: 26 }, (_, i) => ({
        id: `point-${i}`,
        position: i,
        pressure: 10 - i * 0.1 + Math.random() * 0.5,
        status: 'normal',
        leakDetected: false,
      })),
      valveUpstream: 'open',
      valveDownstream: 'open',
    },
  ];

  const supplyShips: SupplyShip[] = [
    {
      id: 'ship-1',
      name: '海洋补给号',
      status: 'pending',
      cargo: '钻杆、泥浆材料、生活用品',
      eta: '2024-01-15 08:00',
      approvalProgress: 0,
    },
  ];

  const predictions: ProductionPrediction[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    predictions.push({
      date: date.toISOString().split('T')[0],
      predicted: 1200 + Math.random() * 300,
      actual: i < 2 ? 1150 + Math.random() * 200 : undefined,
    });
  }

  return { modules, separators, helicopters, pipelines, supplyShips, predictions };
};

const mockData = generateMockData();

export const useStore = create<StoreState>((set, get) => ({
  currentUser: null,
  drillingModules: mockData.modules,
  separators: mockData.separators,
  helicopters: mockData.helicopters,
  pipelines: mockData.pipelines,
  workOrders: [],
  supplyShips: mockData.supplyShips,
  alerts: [],
  operationLogs: [],
  productionPredictions: mockData.predictions,
  dailyReports: [],
  selectedModuleId: null,
  isDrillActive: false,
  evacuationPaths: [],
  fireboatPaths: [],
  fuelReserve: 85,
  deckStatus: 'empty',
  unauthorizedAccess: false,

  login: (username, password, role) => {
    const users: Record<string, { password: string; name: string }> = {
      operator: { password: '123456', name: '操作员' },
      manager: { password: '123456', name: '平台经理' },
      emergency: { password: '123456', name: '应急中心' },
    };
    if (users[role]?.password === password) {
      set({
        currentUser: { id: role, name: users[role].name, role, lastLogin: new Date().toISOString() } });
      get().addOperationLog('登录系统', '系统');
      return true;
    }
    return false;
  },

  faceLogin: async (imageData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    set({
      currentUser: { id: 'operator', name: '张三', role: 'operator', lastLogin: new Date().toISOString() } });
    get().addOperationLog('人脸识别登录', '系统');
    return true;
  },

  logout: () => {
    get().addOperationLog('退出系统', '系统');
    set({ currentUser: null });
  },

  selectModule: (id) => set({ selectedModuleId: id }),

  acknowledgeAlert: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a),
  })),

  triggerKickWarning: (moduleId) => {
    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      type: 'kick',
      severity: 'danger',
      message: `钻井模块 ${moduleId} 检测到井涌预警！`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      moduleId,
    };
    set((state) => ({
      drillingModules: state.drillingModules.map(m =>
        m.id === moduleId ? { ...m, status: 'danger', kickWarning: true } : m
      ),
      alerts: [...state.alerts, newAlert],
    }));
    get().addOperationLog('触发井涌预警', moduleId);
    setTimeout(() => get().closeBOP(moduleId), 2000);
  },

  closeBOP: (moduleId) => {
    set((state) => ({
      drillingModules: state.drillingModules.map(m =>
        m.id === moduleId ? { ...m, bopStatus: 'closing' } : m
      ),
    }));
    setTimeout(() => {
      set((state) => ({
        drillingModules: state.drillingModules.map(m =>
          m.id === moduleId ? { ...m, bopStatus: 'closed' } : m
        ),
      }));
      get().addOperationLog('防喷器关闭完成', moduleId);
    }, 3000);
  },

  switchSeparator: (separatorId) => {
    const newWorkOrder: WorkOrder = {
      id: `wo-${Date.now()}`,
      type: 'maintenance',
      title: `分离器 ${separatorId} 液位超限维护`,
      status: 'pending',
      priority: 'high',
      createdAt: new Date().toISOString(),
      description: '液位超过安全阈值，需要紧急维护',
    };
    set((state) => ({
      separators: state.separators.map(s => {
        if (s.id === separatorId) return { ...s, status: 'danger', isActive: false };
        if (s.isStandby) return { ...s, isActive: true, isStandby: false };
        return s;
      }),
      workOrders: [...state.workOrders, newWorkOrder],
    }));
    get().addOperationLog('切换分离器', separatorId);
  },

  detectLeak: (pipelineId, pointId) => {
    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      type: 'leak',
      severity: 'danger',
      message: `海底管道 ${pipelineId} 在 ${pointId} 处检测到泄漏！`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      moduleId: pipelineId,
    };
    const newWorkOrder: WorkOrder = {
      id: `wo-${Date.now()}`,
      type: 'repair',
      title: `管道泄漏抢修 - ${pipelineId}`,
      status: 'pending',
      priority: 'high',
      createdAt: new Date().toISOString(),
      description: '海底管道压力突降，检测到泄漏，需要紧急抢修',
    };
    set((state) => ({
      pipelines: state.pipelines.map(p => {
        if (p.id === pipelineId) {
          return {
            ...p,
            valveUpstream: 'closed',
            valveDownstream: 'closed',
            points: p.points.map(pt =>
              pt.id === pointId ? { ...pt, status: 'danger', leakDetected: true } : pt
            ),
          };
        }
        return p;
      }),
      alerts: [...state.alerts, newAlert],
      workOrders: [...state.workOrders, newWorkOrder],
    }));
    get().addOperationLog('管道泄漏检测', pipelineId);
  },

  startEmergencyDrill: () => {
    const evacuationPaths: { start: [number, number, number]; end: [number, number, number] }[] = [
      { start: [-5, 0, 5], end: [0, 0, 0] },
      { start: [5, 0, 5], end: [0, 0, 0] },
      { start: [0, 0, -5], end: [0, 0, 0] },
    ];
    const fireboatPaths: { start: [number, number, number]; end: [number, number, number] }[] = [
      { start: [-20, 0, -10], end: [0, 0, 0] },
      { start: [20, 0, -10], end: [0, 0, 0] },
    ];
    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      type: 'fire',
      severity: 'danger',
      message: '应急演练启动：模拟井喷火灾！',
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    set((state) => ({
      isDrillActive: true,
      evacuationPaths,
      fireboatPaths,
      alerts: [...state.alerts, newAlert],
    }));
    get().addOperationLog('启动应急演练', '应急指挥中心');
  },

  stopEmergencyDrill: () => {
    set({
      isDrillActive: false,
      evacuationPaths: [],
      fireboatPaths: [],
    });
    get().addOperationLog('结束应急演练', '应急指挥中心');
  },

  approveSupplyShip: (shipId, level) => {
    const statusMap = {
      warehouse: 'warehouse-approved' as const,
      procurement: 'procurement-approved' as const,
      safety: 'safety-approved' as const,
    };
    const progressMap = { warehouse: 33, procurement: 66, safety: 100 };
    set((state) => ({
      supplyShips: state.supplyShips.map(s =>
        s.id === shipId ? {
          ...s,
          status: statusMap[level],
          approvalProgress: progressMap[level],
        } : s
      ),
    }));
    get().addOperationLog(`${level}审批通过`, shipId);
  },

  addOperationLog: (action, module) => {
    const state = get();
    if (!state.currentUser) return;
    const log: OperationLog = {
      id: `log-${Date.now()}`,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      action,
      module,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      operationLogs: [log, ...state.operationLogs].slice(0, 100),
    }));
  },

  generateDailyReport: (date) => {
    const report: DailyReport = {
      date,
      drillingEfficiency: get().drillingModules.map(m => ({
        moduleId: m.id,
        moduleName: m.name,
        footage: Math.random() * 100 + 50,
        operatingHours: 20 + Math.random() * 4,
        nonProductiveHours: 4 - Math.random() * 2,
      })),
      production: {
        oil: 1200 + Math.random() * 300,
        gas: 500 + Math.random() * 100,
        water: 200 + Math.random() * 50,
      },
      safetyEvents: [
        { type: '井涌预警', count: Math.floor(Math.random() * 2) },
        { type: '设备故障', count: Math.floor(Math.random() * 3) },
        { type: '泄漏检测', count: Math.floor(Math.random() * 2) },
      ],
    };
    set((state) => ({
      dailyReports: [...state.dailyReports, report],
    }));
    return report;
  },

  setDrillingData: (data) => {
    set((state) => ({
      drillingModules: state.drillingModules.map(m =>
        m.id === data.id ? { ...m, ...data } : m
      ),
    }));
  },

  setUnauthorizedAccess: (value) => {
    if (value) {
      const newAlert: Alert = {
        id: `alert-${Date.now()}`,
        type: 'unauthorized',
        severity: 'danger',
        message: '直升机甲板检测到非授权人员进入！',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      };
      set((state) => ({
        unauthorizedAccess: value,
        alerts: [...state.alerts, newAlert],
      }));
      get().addOperationLog('非授权进入报警', '直升机甲板');
    } else {
      set({ unauthorizedAccess: value });
    }
  },
}));

// 调试用：暴露store到window对象
if (typeof window !== 'undefined') {
  (window as any).useStore = useStore;
}
