import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00d4ff',
          colorInfo: '#00d4ff',
          colorSuccess: '#00ff88',
          colorWarning: '#ffaa00',
          colorError: '#ff3333',
          borderRadius: 6,
          colorBgContainer: '#0a1628',
          colorText: '#e0e0e0',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
