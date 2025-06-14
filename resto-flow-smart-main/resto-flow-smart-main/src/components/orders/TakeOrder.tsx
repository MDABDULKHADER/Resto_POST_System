import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

const TakeOrder = ({ user }) => {
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [cardInfo, setCardInfo] = useState({ card_id: '', card_holder_name: '', card_number: '', card_expiry: '' });

  const categories = ['starter', 'main', 'dessert', 'drinks'];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/menu');
        setMenuItems(res.data);
      } catch (err) {
        console.error('Error fetching menu:', err.message);
      }
    };
    fetchMenu();
  }, []);

  const addToCart = (item) => {
    const exists = cart.find(i => i.item_id === item.item_id);
    if (exists) {
      setCart(cart.map(i => i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, newQty) => {
    if (newQty === 0) {
      setCart(cart.filter(i => i.item_id !== id));
    } else {
      setCart(cart.map(i => i.item_id === id ? { ...i, quantity: newQty } : i));
    }
  };

  const getSubtotal = () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const getTotalWithTax = () => {
    const subtotal = getSubtotal();
    const tax = subtotal * 0.13;
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal + tax).toFixed(2),
    };
  };

  const handleSubmitOrder = async () => {
    if (!orderType || !customerInfo.name || cart.length === 0) {
      toast({
        title: 'Missing info',
        description: 'Fill customer name, order type & add items.',
        variant: 'destructive',
      });
      return;
    }

    const { subtotal, tax, total } = getTotalWithTax();

    try {
      // First insert customer & order
      const orderRes = await axios.post('http://localhost:3000/api/orders', {
        customer: customerInfo,
        orderType,
        total,
        createdBy: user.username,
        cart,
      });

      // Then send card info separately
      if (cardInfo.card_number && cardInfo.card_holder_name) {
        await axios.post('http://localhost:3000/api/payment', {
          customer: customerInfo,
          card: cardInfo,
        });
      }

      toast({
        title: 'Order Placed',
        description: `Receipt:\nSubtotal: $${subtotal}\nHST (13%): $${tax}\nTotal: $${total}`,
      });

      alert(`🧾 Order Receipt\n\nSubtotal: $${subtotal}\nHST (13%): $${tax}\nTotal Payable: $${total}`);

      setCart([]);
      setCustomerInfo({ name: '', phone: '', address: '' });
      setOrderType('');
      setCardInfo({ card_id: '', card_holder_name: '', card_number: '', card_expiry: '' });
    } catch (err) {
      toast({
        title: 'Order Failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Take New Order</h2>
        <p className="text-gray-600">Select items and enter customer and payment details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-4">
          {categories.map(category => (
            <Card key={category}>
              <CardHeader><CardTitle className="capitalize">{category}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.filter(item => item.category === category).map(item => (
                    <div key={item.item_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <span className="font-semibold text-blue-600">${item.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant={item.is_available ? "default" : "secondary"}>
                          {item.is_available ? "Available" : "Out of Stock"}
                        </Badge>
                        <Button size="sm" onClick={() => addToCart(item)} disabled={!item.is_available}>
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary + Customer & Payment Info */}
        <div className="space-y-4">
          {/* Cart Summary */}
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items in cart</p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.item_id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500">${item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.item_id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.item_id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.item_id, 0)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-semibold"><span>Subtotal:</span><span>${getSubtotal().toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span>HST (13%):</span><span>${(getSubtotal() * 0.13).toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>${(getSubtotal() * 1.13).toFixed(2)}</span></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader><CardTitle>Customer & Payment Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Order Type</Label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger><SelectValue placeholder="Select order type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine-in">Dine-In</SelectItem>
                    <SelectItem value="take-out">Take-Out</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div><Label>Customer Name</Label>
                <Input value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} placeholder="Enter name" />
              </div>

              {(orderType === 'take-out' || orderType === 'delivery') && (
                <div><Label>Phone</Label>
                  <Input value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} placeholder="Phone number" />
                </div>
              )}

              {orderType === 'delivery' && (
                <div><Label>Address</Label>
                  <Input value={customerInfo.address} onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} placeholder="Delivery address" />
                </div>
              )}

              {/* Payment Section */}
              <div><Label>Card ID</Label>
                <Input value={cardInfo.card_id} onChange={(e) => setCardInfo({ ...cardInfo, card_id: e.target.value })} placeholder="Card ID" />
              </div>
              <div><Label>Cardholder Name</Label>
                <Input value={cardInfo.card_holder_name} onChange={(e) => setCardInfo({ ...cardInfo, card_holder_name: e.target.value })} placeholder="Cardholder name" />
              </div>
              <div><Label>Card Number</Label>
                <Input value={cardInfo.card_number} onChange={(e) => setCardInfo({ ...cardInfo, card_number: e.target.value })} placeholder="Card number" />
              </div>
              <div><Label>Expiry Date</Label>
                <Input value={cardInfo.card_expiry} onChange={(e) => setCardInfo({ ...cardInfo, card_expiry: e.target.value })} placeholder="MM/YY" />
              </div>

              <Button onClick={handleSubmitOrder} className="w-full">Submit Order</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TakeOrder;
