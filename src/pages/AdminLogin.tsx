import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isAdminAuthenticated', 'true');
        toast({
          title: "Успешный вход!",
          description: "Добро пожаловать в админ-панель.",
        });
        navigate('/admin');
      } else {
        toast({
          title: "Ошибка входа",
          description: "Неверный логин или пароль.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-primary opacity-10 animate-gradient-shift bg-[length:200%_200%]" />
      
      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur border-primary/20">
        <CardHeader className="space-y-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto">
            <Icon name="Shield" size={40} className="text-white" />
          </div>
          <CardTitle className="text-3xl bg-gradient-primary text-gradient animate-gradient-shift bg-[length:200%_200%]">
            Админ-панель
          </CardTitle>
          <CardDescription>Введите данные для входа в систему управления</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Логин</label>
              <Input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                  Вход...
                </>
              ) : (
                <>
                  <Icon name="LogIn" className="mr-2" size={20} />
                  Войти
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-primary"
            >
              <Icon name="ArrowLeft" className="mr-2" size={16} />
              Вернуться на главную
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
