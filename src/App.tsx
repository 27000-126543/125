import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Login from '@/components/Login';
import MainLayout from '@/components/MainLayout';

function App() {
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) {
    return <Login />;
  }

  return <MainLayout />;
}

export default App;
