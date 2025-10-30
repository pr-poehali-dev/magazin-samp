import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Transaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

const BALANCE_API = 'https://functions.poehali.dev/3b3637f1-eac4-4faa-b9e4-4fbe71007e7c';

const UserProfile = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id') || '1';
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserBalance();
    fetchTransactions();
  }, [userId]);

  const fetchUserBalance = async () => {
    try {
      const response = await fetch(`${BALANCE_API}?user_id=${userId}&action=balance`);
      const data = await response.json();
      setUsername(data.username);
      setBalance(data.balance);
    } catch (error) {
      console.error('Ошибка загрузки баланса:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить баланс",
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BALANCE_API}?user_id=${userId}&action=transactions`);
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Ошибка загрузки транзакций:', error);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректную сумму",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(BALANCE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          amount: amount,
          description: 'Пополнение баланса'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setBalance(data.new_balance);
        setDepositAmount('');
        setIsDepositOpen(false);
        toast({
          title: "Успешно!",
          description: `Баланс пополнен на ${amount}₽`,
        });
        fetchTransactions();
      }
    } catch (error) {
      console.error('Ошибка пополнения:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось пополнить баланс",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-primary text-gradient animate-gradient-shift bg-[length:200%_200%]">
              Профиль пользователя
            </h1>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-primary"
            >
              <Icon name="ArrowLeft" className="mr-2" size={16} />
              На главную
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-gradient-primary text-white border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl">{username}</CardTitle>
                  <CardDescription className="text-white/80 mt-2">
                    ID: {userId}
                  </CardDescription>
                </div>
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon name="User" size={32} className="text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">Ваш баланс</p>
                  <p className="text-4xl font-bold">{balance.toFixed(2)}₽</p>
                </div>
                <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90 font-semibold"
                    >
                      <Icon name="Plus" className="mr-2" size={20} />
                      Пополнить
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Пополнение баланса</DialogTitle>
                      <DialogDescription>
                        Введите сумму для пополнения вашего баланса
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Сумма (₽)</label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          min="1"
                        />
                      </div>
                      <div className="flex gap-2">
                        {[100, 500, 1000, 5000].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setDepositAmount(amount.toString())}
                          >
                            {amount}₽
                          </Button>
                        ))}
                      </div>
                      <Button
                        onClick={handleDeposit}
                        disabled={isLoading}
                        className="w-full bg-gradient-primary text-white"
                      >
                        {isLoading ? (
                          <>
                            <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                            Обработка...
                          </>
                        ) : (
                          <>
                            <Icon name="CreditCard" className="mr-2" size={20} />
                            Пополнить баланс
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="History" size={24} />
                История операций
              </CardTitle>
              <CardDescription>
                {transactions.length === 0 
                  ? 'Операций пока не было' 
                  : `Всего операций: ${transactions.length}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>История операций пуста</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge
                            variant={transaction.type === 'deposit' ? 'default' : 'secondary'}
                            className={transaction.type === 'deposit' ? 'bg-green-500' : ''}
                          >
                            {transaction.type === 'deposit' ? 'Пополнение' : 'Списание'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}₽
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
