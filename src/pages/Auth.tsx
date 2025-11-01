import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const token = searchParams.get('token');

  useEffect(() => {
    const authenticate = async () => {
      if (!token) {
        toast.error('Токен авторизации не найден');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://functions.poehali.dev/7958df4e-db92-476f-8311-71dd6d961e2e?action=auth&token=${token}`
        );
        
        if (!response.ok) {
          throw new Error('Ошибка авторизации');
        }

        const data = await response.json();
        
        if (data.user && data.session_token) {
          localStorage.setItem('session_token', data.session_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          toast.success(`Добро пожаловать, ${data.user.username}!`);
          
          setTimeout(() => {
            navigate('/profile');
          }, 1000);
        } else {
          throw new Error('Неверный ответ сервера');
        }
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Ошибка авторизации. Попробуйте снова.');
        setLoading(false);
      }
    };

    authenticate();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Вход в систему</CardTitle>
            <CardDescription className="text-purple-200">
              Проверяем ваши данные...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-purple-300" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Ошибка авторизации</CardTitle>
          <CardDescription className="text-purple-200">
            Не удалось войти в систему
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-white/80">
            Пожалуйста, попробуйте войти снова через Telegram бот
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            На главную
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
