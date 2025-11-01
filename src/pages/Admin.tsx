import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import SiteToggle from '@/components/SiteToggle';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    description: '',
    icon: 'Package',
    gradient: 'bg-gradient-primary'
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', email: '', role: 'admin' });

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

  const handleAddAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password) {
      toast({
        title: "Ошибка",
        description: "Заполните логин и пароль",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(ADMINS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успешно!",
          description: "Администратор добавлен",
        });
        setAdminDialogOpen(false);
        setNewAdmin({ username: '', password: '', email: '', role: 'admin' });
        fetchAdmins();
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось добавить администратора",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Ошибка добавления админа:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить администратора",
        variant: "destructive",
      });
    }
  };

  const toggleAdminStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(ADMINS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive }),
      });

      if (response.ok) {
        toast({
          title: "Успешно!",
          description: "Статус администратора изменен",
        });
        fetchAdmins();
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
    }
  };

  const handleAddBalance = async () => {
    if (!selectedUser || !balanceAmount) return;

    try {
      const response = await fetch(USERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_balance',
          user_id: selectedUser.id,
          amount: parseFloat(balanceAmount),
          description: 'Пополнение баланса администратором'
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: `Баланс пользователя ${selectedUser.username} пополнен на ${balanceAmount}₽`,
        });
        setBalanceDialogOpen(false);
        setBalanceAmount('');
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось пополнить баланс",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserStatus = async (userId: number, newStatus: string) => {
    try {
      const response = await fetch(USERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          user_id: userId,
          status: newStatus
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: `Статус пользователя изменен на ${newStatus}`,
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус",
        variant: "destructive",
      });
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

  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.price || !newProduct.description) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля товара.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(PRODUCTS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        await fetchProducts();
        setNewProduct({ title: '', price: '', description: '', icon: 'Package', gradient: 'bg-gradient-primary' });
        setIsDialogOpen(false);
        toast({
          title: "Товар добавлен!",
          description: "Товар успешно добавлен в каталог.",
        });
      }
    } catch (error) {
      console.error('Ошибка добавления товара:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`${PRODUCTS_API}?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProducts();
        toast({
          title: "Товар удален",
          description: "Товар успешно удален из каталога.",
        });
      }
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive",
      });
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Всего заказов</CardDescription>
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Icon name="ShoppingBag" size={20} className="text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Выручка</CardDescription>
                <div className="w-10 h-10 rounded-lg bg-gradient-secondary flex items-center justify-center">
                  <Icon name="DollarSign" size={20} className="text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRevenue}₽</div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Товаров</CardDescription>
                <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center">
                  <Icon name="Package" size={20} className="text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>В обработке</CardDescription>
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="admins">Админы</TabsTrigger>
            <TabsTrigger value="logs">Логи</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Управление товарами</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:opacity-90 text-white">
                    <Icon name="Plus" className="mr-2" size={18} />
                    Добавить товар
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Добавить новый товар</DialogTitle>
                    <DialogDescription>Заполните информацию о товаре</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Название</label>
                      <Input
                        placeholder="Название товара"
                        value={newProduct.title}
                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Цена</label>
                      <Input
                        placeholder="1000₽"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Описание</label>
                      <Textarea
                        placeholder="Описание товара"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAddProduct} className="w-full bg-gradient-primary hover:opacity-90 text-white">
                      Добавить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="border-border bg-card/50 backdrop-blur">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.id}</TableCell>
                        <TableCell>{product.title}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-2xl font-bold">Все заказы</h2>
            <Card className="border-border bg-card/50 backdrop-blur">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Товары</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>
                          {Array.isArray(order.items) 
                            ? order.items.map((item: any) => `${item.title} x${item.quantity}`).join(', ')
                            : 'Нет товаров'}
                        </TableCell>
                        <TableCell className="font-semibold text-primary">{order.total_price}₽</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Выполнен' 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString('ru-RU')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Управление пользователями</h2>
              <div className="flex gap-4">
                <Card className="border-primary/20 bg-card/50 backdrop-blur px-6 py-3">
                  <div className="flex items-center gap-3">
                    <Icon name="Users" size={20} className="text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Всего пользователей</div>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </div>
                  </div>
                </Card>
                <Card className="border-green-500/20 bg-card/50 backdrop-blur px-6 py-3">
                  <div className="flex items-center gap-3">
                    <Icon name="UserCheck" size={20} className="text-green-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Активных</div>
                      <div className="text-2xl font-bold">{stats.activeUsers}</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Имя пользователя</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Баланс</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="font-semibold text-primary">{user.balance}₽</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.status === 'active' 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-red-500/20 text-red-500'
                          }`}>
                            {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString('ru-RU')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setBalanceDialogOpen(true);
                              }}
                            >
                              <Icon name="Wallet" className="mr-1" size={14} />
                              Пополнить
                            </Button>
                            <Button 
                              size="sm"
                              variant={user.status === 'active' ? 'destructive' : 'default'}
                              onClick={() => handleUpdateUserStatus(user.id, user.status === 'active' ? 'blocked' : 'active')}
                            >
                              <Icon name={user.status === 'active' ? 'Ban' : 'CheckCircle'} className="mr-1" size={14} />
                              {user.status === 'active' ? 'Блокировать' : 'Разблокировать'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Администраторы</CardTitle>
                    <CardDescription>Управление администраторами системы</CardDescription>
                  </div>
                  <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-primary text-white">
                        <Icon name="UserPlus" className="mr-2" size={18} />
                        Добавить админа
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Добавить администратора</DialogTitle>
                        <DialogDescription>Создайте нового администратора</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-medium">Логин</label>
                          <Input
                            placeholder="admin123"
                            value={newAdmin.username}
                            onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Пароль</label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            value={newAdmin.password}
                            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <Input
                            type="email"
                            placeholder="admin@example.com"
                            value={newAdmin.email}
                            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setAdminDialogOpen(false)} className="flex-1">
                          Отмена
                        </Button>
                        <Button onClick={handleAddAdmin} className="flex-1 bg-gradient-primary text-white">
                          Создать
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Логин</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата создания</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.id}</TableCell>
                        <TableCell>{admin.username}</TableCell>
                        <TableCell>{admin.email || '—'}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                            {admin.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            admin.is_active 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-red-500/20 text-red-500'
                          }`}>
                            {admin.is_active ? 'Активен' : 'Заблокирован'}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(admin.created_at).toLocaleDateString('ru-RU')}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm"
                            variant={admin.is_active ? 'destructive' : 'default'}
                            onClick={() => toggleAdminStatus(admin.id, admin.is_active)}
                          >
                            <Icon name={admin.is_active ? 'Ban' : 'CheckCircle'} className="mr-1" size={14} />
                            {admin.is_active ? 'Блокировать' : 'Разблокировать'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Логи авторизации</CardTitle>
                <CardDescription>История входов пользователей в систему</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата и время</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Действие</TableHead>
                      <TableHead>IP адрес</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {new Date(log.created_at).toLocaleString('ru-RU')}
                        </TableCell>
                        <TableCell>{log.username}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-500">
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{log.ip_address || '—'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            log.status === 'success' 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-red-500/20 text-red-500'
                          }`}>
                            {log.status === 'success' ? 'Успешно' : 'Ошибка'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {authLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Логов пока нет</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Пополнение баланса</DialogTitle>
              <DialogDescription>
                Пользователь: {selectedUser?.username} ({selectedUser?.email})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Текущий баланс</label>
                <div className="text-2xl font-bold text-primary mt-1">{selectedUser?.balance}₽</div>
              </div>
              <div>
                <label className="text-sm font-medium">Сумма пополнения</label>
                <Input
                  type="number"
                  placeholder="Введите сумму"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="mt-1"
                />
              </div>
              {balanceAmount && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-sm text-muted-foreground">Новый баланс</div>
                  <div className="text-xl font-bold text-primary">
                    {(parseFloat(selectedUser?.balance.toString() || '0') + parseFloat(balanceAmount)).toFixed(2)}₽
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setBalanceDialogOpen(false)} className="flex-1">
                Отмена
              </Button>
              <Button onClick={handleAddBalance} className="flex-1 bg-gradient-primary text-white">
                Пополнить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;