import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Customer {
  customer_id: number;
  name: string;
  phone: string;
  address: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrder?: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchCustomers = async () => {
    try {
      const [customerRes, orderRes] = await Promise.all([
        axios.get('http://localhost:3000/api/customers'),
        axios.get('http://localhost:3000/api/orders'),
      ]);

      const customersData = customerRes.data;
      const orders = orderRes.data;

      const enrichedCustomers = customersData.map((customer: Customer) => {
        const customerOrders = orders.filter((o: any) => o.customer_name === customer.name);
        const spent = customerOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total_price), 0);
        const lastOrder = customerOrders.length > 0 ? new Date(customerOrders[customerOrders.length - 1].order_date_time).toLocaleDateString() : '--';
        return {
          ...customer,
          totalOrders: customerOrders.length,
          totalSpent: spent,
          lastOrder: lastOrder,
        };
      });

      setCustomers(enrichedCustomers);

      setTotalOrders(orders.length);
      const revenue = orders.reduce((sum: number, o: any) => sum + parseFloat(o.total_price), 0);
      setTotalRevenue(revenue);
    } catch (err: any) {
      console.error('Error fetching customers/orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const averageSpent = customers.length > 0 ? totalRevenue / customers.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Customers</h2>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-green-600">{totalOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-purple-600">${totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-orange-600">${averageSpent.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Avg. Spent</div>
        </CardContent></Card>
      </div>

      {/* Customers List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading customers...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((customer) => (
            <Card key={customer.customer_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <CardDescription>Customer #{customer.customer_id}</CardDescription>
                  </div>
                  <Badge variant="outline">New</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone}</span>
                </div>

                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span className="flex-1">{customer.address}</span>
                </div>

                <div className="pt-3 border-t text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="font-semibold text-green-600">${customer.totalSpent?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Last Order:</span>
                    <span className="text-gray-800">{customer.lastOrder || '--'}</span>
                  </div>
                </div>

                <div className="pt-3">
                  <Button variant="outline" className="w-full" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Customers;
