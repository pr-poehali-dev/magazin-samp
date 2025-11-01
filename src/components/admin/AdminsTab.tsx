import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AdminsTabProps {
  admins: AdminUser[];
  onAdminsChange: () => void;
  adminsApi: string;
}

const AdminsTab = ({ admins, onAdminsChange, adminsApi }: AdminsTabProps) => {
  const { toast } = useToast();
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', email: '', role: 'admin' });

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
      const response = await fetch(adminsApi, {
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
        onAdminsChange();
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
      const response = await fetch(adminsApi, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive }),
      });

      if (response.ok) {
        toast({
          title: "Успешно!",
          description: "Статус администратора изменен",
        });
        onAdminsChange();
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление администраторами</CardTitle>
              <CardDescription>Создавайте и управляйте администраторами системы</CardDescription>
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
                  <DialogDescription>Создайте нового администратора системы</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Логин</label>
                    <Input
                      placeholder="Логин"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Пароль</label>
                    <Input
                      type="password"
                      placeholder="Пароль"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email (опционально)</label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddAdmin} className="w-full bg-gradient-primary text-white">
                    Создать администратора
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
                  <TableCell>{admin.email || '-'}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-500">
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
                      {admin.is_active ? 'Блокировать' : 'Активировать'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminsTab;
