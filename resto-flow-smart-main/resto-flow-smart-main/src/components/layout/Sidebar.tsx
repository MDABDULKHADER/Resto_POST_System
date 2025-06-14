
import { Home, ShoppingCart, Users, Menu, Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sidebar = ({ activeTab, setActiveTab, userRole }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'staff'] },
    { id: 'take-order', label: 'Take New Order', icon: ShoppingCart, roles: ['admin', 'staff'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['admin', 'staff'] },
    { id: 'menu-management', label: 'Menu Management', icon: Menu, roles: ['admin'] },
    { id: 'order-history', label: 'Order History', icon: Clock, roles: ['admin', 'staff'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">SmartPOS</h2>
        <p className="text-sm text-gray-600 mt-1">Restaurant System</p>
      </div>
      
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start h-11 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
