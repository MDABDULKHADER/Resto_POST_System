import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const OrderHistory = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch order history:', err.message);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) =>
    (filterType === 'all' || o.order_type === filterType) &&
    (
      o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.order_id?.toString().includes(searchTerm)
    )
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Order History</h2>

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

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Showing {filteredOrders.length} result{filteredOrders.length !== 1 && 's'}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100 text-left border-b">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Type</th>
                <th className="p-3">Total</th>
                <th className="p-3">Date</th>
                <th className="p-3">Created By</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.order_id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 text-blue-600 font-medium">#{order.order_id}</td>
                  <td className="p-3">{order.customer_name || 'N/A'}</td>
                  <td className="p-3 capitalize">{order.order_type}</td>
                  <td className="p-3 text-green-600 font-semibold">${parseFloat(order.total_price).toFixed(2)}</td>
                  <td className="p-3">{new Date(order.order_date_time).toLocaleString()}</td>
                  <td className="p-3 capitalize">{order.created_by_user}</td>
                  <td className="p-3">
                    <Badge variant="default">Completed</Badge>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderHistory;
