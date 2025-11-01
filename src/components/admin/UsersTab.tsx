import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  status: string;
  created_at: string;
}

interface UsersTabProps {
  users: User[];
  stats: {
    totalUsers: number;
    activeUsers: number;
  };
  onUsersChange: () => void;
  usersApi: string;
}

const UsersTab = ({ users, stats, onUsersChange, usersApi }: UsersTabProps) => {
  const { toast } = useToast();
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');

  const handleAddBalance = async () => {
    if (!selectedUser || !balanceAmount) return;

    try {
      const response = await fetch(usersApi, {
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
        onUsersChange();
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
      const response = await fetch(usersApi, {
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
        onUsersChange();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
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

      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Пополнить баланс</DialogTitle>
            <DialogDescription>
              Пополнение баланса для {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Сумма пополнения (₽)</label>
              <Input
                type="number"
                placeholder="0"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
            </div>
            <Button onClick={handleAddBalance} className="w-full">
              Пополнить баланс
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersTab;
