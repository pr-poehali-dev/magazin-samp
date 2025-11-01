import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import SiteToggle from '@/components/SiteToggle';
import AdminStats from '@/components/admin/AdminStats';
import ProductsTab from '@/components/admin/ProductsTab';
import OrdersTab from '@/components/admin/OrdersTab';
import UsersTab from '@/components/admin/UsersTab';
import AdminsTab from '@/components/admin/AdminsTab';
import LogsTab from '@/components/admin/LogsTab';

interface Product {
  id: number;
  title: string;
  price: string;
  description: string;
  icon: string;
  gradient?: string;
}

interface Order {
  id: number;
  customer_name: string;
  items: any;
  total_price: number;
  status: string;
  created_at: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  status: string;
  created_at: string;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AuthLog {
  id: number;
  user_id: number | null;
  username: string;
  action: string;
  ip_address: string;
  user_agent: string;
  status: string;
  created_at: string;
}

const PRODUCTS_API = 'https://functions.poehali.dev/663abff9-712f-46a8-bde0-86a764ef9c45';
const ORDERS_API = 'https://functions.poehali.dev/eb4b86b7-416f-4dbe-9004-793dca0a233e';
const USERS_API = 'https://functions.poehali.dev/7958df4e-db92-476f-8311-71dd6d961e2e';
const ADMINS_API = 'https://functions.poehali.dev/cda1d047-4908-491c-8603-cf39dffad0b3';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
    } else {
      fetchProducts();
      fetchOrders();
      fetchUsers();
      fetchAdmins();
      fetchAuthLogs();
    }
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(PRODUCTS_API);
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(ORDERS_API);
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(USERS_API);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive",
      });
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch(ADMINS_API);
      const data = await response.json();
      setAdmins(data.admins);
    } catch (error) {
      console.error('Ошибка загрузки админов:', error);
    }
  };

  const fetchAuthLogs = async () => {
    try {
      const response = await fetch(`${ADMINS_API}?action=logs&limit=50`);
      const data = await response.json();
      setAuthLogs(data.logs || []);
    } catch (error) {
      console.error('Ошибка загрузки логов:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    toast({
      title: "Выход выполнен",
      description: "Вы вышли из админ-панели.",
    });
    navigate('/admin/login');
  };

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_price, 0),
    totalProducts: products.length,
    pendingOrders: orders.filter(o => o.status === 'В обработке').length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-primary text-gradient animate-gradient-shift bg-[length:200%_200%]">
              Админ-панель
            </h1>
            <div className="flex items-center gap-4">
              <SiteToggle />
              <Button variant="outline" onClick={() => navigate('/')}>
                <Icon name="Home" className="mr-2" size={18} />
                На главную
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <Icon name="LogOut" className="mr-2" size={18} />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <AdminStats stats={stats} />

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="admins">Админы</TabsTrigger>
            <TabsTrigger value="logs">Логи</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab 
              products={products} 
              onProductsChange={fetchProducts} 
              productsApi={PRODUCTS_API}
            />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab orders={orders} />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab 
              users={users} 
              stats={{ totalUsers: stats.totalUsers, activeUsers: stats.activeUsers }}
              onUsersChange={fetchUsers} 
              usersApi={USERS_API}
            />
          </TabsContent>

          <TabsContent value="admins">
            <AdminsTab 
              admins={admins} 
              onAdminsChange={fetchAdmins} 
              adminsApi={ADMINS_API}
            />
          </TabsContent>

          <TabsContent value="logs">
            <LogsTab authLogs={authLogs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
