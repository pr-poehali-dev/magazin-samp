import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AdminStatsProps {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    pendingOrders: number;
  };
}

const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
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
  );
};

export default AdminStats;
