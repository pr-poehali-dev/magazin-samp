import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Register = () => {
  const telegramBotUrl = 'https://t.me/MOMENTOGAMES_BOT';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-500/20 p-4 rounded-full">
              <Icon name="Send" size={48} className="text-purple-300" />
            </div>
          </div>
          <CardTitle className="text-3xl text-white mb-2">
            Регистрация через Telegram
          </CardTitle>
          <CardDescription className="text-purple-200 text-base">
            Быстрая и безопасная регистрация
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-purple-500/20 rounded-full p-2 mt-1">
                <span className="text-purple-300 font-bold">1</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Откройте бота</h3>
                <p className="text-purple-200 text-sm">Перейдите в Telegram бот по кнопке ниже</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-purple-500/20 rounded-full p-2 mt-1">
                <span className="text-purple-300 font-bold">2</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Нажмите /start</h3>
                <p className="text-purple-200 text-sm">Бот автоматически создаст ваш аккаунт</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-purple-500/20 rounded-full p-2 mt-1">
                <span className="text-purple-300 font-bold">3</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Получите ссылку</h3>
                <p className="text-purple-200 text-sm">Используйте /login для входа на сайт</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => window.open(telegramBotUrl, '_blank')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
            size="lg"
          >
            <Icon name="Send" className="mr-2" size={20} />
            Открыть Telegram бот
          </Button>

          <div className="text-center">
            <p className="text-purple-300 text-sm">
              Уже есть аккаунт?{' '}
              <a href={telegramBotUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-semibold">
                Войти через бота
              </a>
            </p>
          </div>

          <div className="bg-purple-500/10 rounded-lg p-4 mt-6">
            <div className="flex gap-3">
              <Icon name="Shield" className="text-purple-300 flex-shrink-0" size={20} />
              <p className="text-purple-200 text-sm">
                Мы не храним ваши личные данные. Авторизация происходит через безопасный Telegram API.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;