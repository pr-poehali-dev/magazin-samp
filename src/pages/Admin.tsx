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

interface Product {
  id: number;
  title: string;
  price: string;
  description: string;
  icon: string;
}

interface Order {
  id: number;
  customerName: string;
  items: string;
  total: string;
  status: string;
  date: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    description: '',
    icon: 'Package'
  });

  const [products, setProducts] = useState<Product[]>([
    { id: 1, title: 'Готовый проект', price: '1000₽', description: 'Полностью готовый сервер SAMP', icon: 'Package' },
    { id: 2, title: 'Мод Arizona RP', price: '250₽', description: 'Модификация для Arizona RP', icon: 'Gamepad2' },
    { id: 3, title: 'Мод Rodina RP', price: '250₽', description: 'Модификация для Rodina RP', icon: 'Gamepad2' },
    { id: 4, title: 'Логи', price: '200₽', description: 'Система логирования сервера', icon: 'FileText' },
    { id: 5, title: 'Лаунчер PC', price: '200₽', description: 'Лаунчер для ПК', icon: 'Monitor' },
    { id: 6, title: 'Лаунчер Mobile', price: '250₽', description: 'Мобильный лаунчер', icon: 'Smartphone' }
  ]);

  const [orders] = useState<Order[]>([
    { id: 1, customerName: 'Иван Петров', items: 'VIP статус x1', total: '500₽', status: 'Выполнен', date: '2025-10-28' },
    { id: 2, customerName: 'Мария Сидорова', items: 'Готовый проект x1', total: '1000₽', status: 'В обработке', date: '2025-10-29' },
    { id: 3, customerName: 'Алексей Иванов', items: 'Мод Arizona RP x2', total: '500₽', status: 'Выполнен', date: '2025-10-30' }
  ]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    toast({
      title: "Выход выполнен",
      description: "Вы вышли из админ-панели.",
    });
    navigate('/admin/login');
  };

  const handleAddProduct = () => {
    if (!newProduct.title || !newProduct.price || !newProduct.description) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля товара.",
        variant: "destructive",
      });
      return;
    }

    const product: Product = {
      id: products.length + 1,
      ...newProduct
    };

    setProducts([...products, product]);
    setNewProduct({ title: '', price: '', description: '', icon: 'Package' });
    setIsDialogOpen(false);
    toast({
      title: "Товар добавлен!",
      description: `${product.title} успешно добавлен в каталог.`,
    });
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    toast({
      title: "Товар удален",
      description: "Товар успешно удален из каталога.",
    });
  };

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + parseInt(order.total.replace('₽', '')), 0),
    totalProducts: products.length,
    pendingOrders: orders.filter(o => o.status === 'В обработке').length
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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
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
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell className="font-semibold text-primary">{order.total}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Выполнен' 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
