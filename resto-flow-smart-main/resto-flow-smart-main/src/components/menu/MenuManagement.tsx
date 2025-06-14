import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

const MenuManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    price: '',
    available: true,
  });

  const categories = ['starter', 'main', 'dessert', 'drinks'];

  const fetchMenuItems = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/menu');
      setMenuItems(res.data);
    } catch (err: any) {
      console.error('Failed to fetch menu:', err.message);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleAddItem = async () => {
    const { name, category, price, available } = newItem;

    if (!name || !category || !price) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/menu', {
        name,
        category,
        price: parseFloat(price),
        is_available: available,
      });

      toast({
        title: 'Item Added',
        description: `${name} added to menu.`,
      });

      setNewItem({ name: '', category: '', price: '', available: true });
      setShowAddForm(false);
      fetchMenuItems(); // refresh list
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add item.',
        variant: 'destructive',
      });
    }
  };

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAvailability = async (id: number, current: boolean) => {
    try {
      await axios.patch(`http://localhost:3000/api/menu/${id}`, {
        is_available: !current,
      });
      setMenuItems((prev) =>
        prev.map((item) =>
          item.item_id === id ? { ...item, is_available: !current } : item
        )
      );
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update availability.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Menu Management</h2>
          <p className="text-gray-600">Manage your restaurant menu items</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Menu Item</CardTitle>
            <CardDescription>Enter details for the new item</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="itemName">Name</Label>
                <Input
                  id="itemName"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={newItem.available}
                  onCheckedChange={(checked) =>
                    setNewItem({ ...newItem, available: checked })
                  }
                />
                <Label>Available</Label>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <Button onClick={handleAddItem}>Add Item</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Card key={cat}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {menuItems.filter((item) => item.category === cat).length}
                </div>
                <div className="text-sm text-gray-600 capitalize">{cat} Items</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.item_id} className="hover:shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription className="capitalize">{item.category}</CardDescription>
                </div>
                <Badge variant={item.is_available ? 'default' : 'secondary'}>
                  {item.is_available ? 'Available' : 'Out of Stock'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold text-green-600">
                ${parseFloat(item.price).toFixed(2)}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={item.is_available}
                    onCheckedChange={() => toggleAvailability(item.item_id, item.is_available)}
                  />
                  <Label className="text-sm">Available</Label>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuManagement;