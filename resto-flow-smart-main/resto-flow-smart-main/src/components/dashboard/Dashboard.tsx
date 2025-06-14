
import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DashboardHome from '@/components/dashboard/DashboardHome';
import TakeOrder from '@/components/orders/TakeOrder';
import Customers from '@/components/customers/Customers';
import MenuManagement from '@/components/menu/MenuManagement';
import OrderHistory from '@/components/orders/OrderHistory';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome user={user} />;
      case 'take-order':
        return <TakeOrder user={user} />;
      case 'customers':
        return <Customers />;
      case 'menu-management':
        return user.role === 'admin' ? <MenuManagement /> : <div>Access Denied</div>;
      case 'order-history':
        return <OrderHistory user={user} />;
      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={user.role} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
