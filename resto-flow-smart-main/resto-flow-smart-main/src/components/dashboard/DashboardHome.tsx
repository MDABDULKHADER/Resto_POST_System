import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';

import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download } from 'lucide-react';

const OrderHistory = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    average: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [orderRes, customerRes] = await Promise.all([
          axios.get('http://localhost:3000/api/orders'),
          axios.get('http://localhost:3000/api/customers'),
        ]);

        const orders = orderRes.data.map(o => ({
          ...o,
          total_price: parseFloat(o.total_price),
        }));

        const revenue = orders.reduce((sum, o) => sum + o.total_price, 0);
        const avg = orders.length > 0 ? revenue / orders.length : 0;

        setStats({
          revenue,
          orders: orders.length,
          customers: customerRes.data.length,
          average: avg,
        });

        setOrders(orders);
        setRecentOrders(orders.slice(-4).reverse());
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchStats();
  }, []);

  const filteredOrders = orders.filter((o) =>
    (filterType === 'all' || o.order_type === filterType) &&
    (o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.order_id.toString().includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Order History</h2>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${stats.revenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.orders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.customers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${stats.average.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by customer or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger><SelectValue placeholder="Filter by type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="dine-in">Dine-In</SelectItem>
              <SelectItem value="take-out">Take-Out</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Showing {filteredOrders.length} results</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Order ID</th>
                <th className="p-2">Type</th>
                <th className="p-2">Total</th>
                <th className="p-2">Date</th>
                <th className="p-2">Created By</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.order_id} className="border-b">
                  <td className="p-2 text-blue-600 font-medium">#{order.order_id}</td>
                  <td className="p-2 capitalize">{order.order_type}</td>
                  <td className="p-2 text-green-600 font-semibold">${order.total_price.toFixed(2)}</td>
                  <td className="p-2">{new Date(order.order_date_time).toLocaleString()}</td>
                  <td className="p-2 capitalize">{order.created_by_user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderHistory;
