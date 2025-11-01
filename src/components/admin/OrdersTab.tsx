import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Order {
  id: number;
  customer_name: string;
  items: any;
  total_price: number;
  status: string;
  created_at: string;
}

interface OrdersTabProps {
  orders: Order[];
}

const OrdersTab = ({ orders }: OrdersTabProps) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default OrdersTab;
