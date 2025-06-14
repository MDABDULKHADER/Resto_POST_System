
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-600">Today is {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">{user.username}</span>
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
              {user.role.toUpperCase()}
            </Badge>
          </div>
          
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
