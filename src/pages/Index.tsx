import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface CartItem {
  id: number;
  title: string;
  price: string;
  quantity: number;
}

interface Product {
  id: number;
  title: string;
  price: string;
  description: string;
  icon: string;
  gradient: string;
}

const API_URL = 'https://functions.poehali.dev/663abff9-712f-46a8-bde0-86a764ef9c45';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [donateItems, setDonateItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setDonateItems(data.products);
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

  const faqItems = [
    {
      question: 'Как происходит выдача товара?',
      answer: 'Выдача товаров происходит через партнера или системно, в зависимости от типа товара.'
    }
  ];

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Сообщение отправлено!",
      description: "Мы свяжемся с вами в ближайшее время.",
    });
    setFormData({ name: '', email: '', message: '' });
  };

  const addToCart = (item: { id: number; title: string; price: string }) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    toast({
      title: "Добавлено в корзину!",
      description: `${item.title} добавлен в вашу корзину.`,
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = parseInt(item.price.replace('₽', ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-primary text-gradient animate-gradient-shift bg-[length:200%_200%]">MOMENTO STORE</h1>
            <div className="flex items-center gap-6">
              {['home', 'donate', 'faq', 'contacts'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`transition-colors hover:text-primary ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'donate' && 'Донат'}
                  {section === 'faq' && 'FAQ'}
                  {section === 'contacts' && 'Контакты'}
                </button>
              ))}
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Icon name="ShoppingCart" size={20} />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-gradient-primary border-0">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle>Корзина</SheetTitle>
                    <SheetDescription>
                      {cart.length === 0 ? 'Ваша корзина пуста' : `Товаров в корзине: ${getTotalItems()}`}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-8 space-y-4">
                    {cart.map((item) => (
                      <Card key={item.id} className="bg-card/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold">{item.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{item.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Icon name="Minus" size={14} />
                              </Button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Icon name="Plus" size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Icon name="Trash2" size={14} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {cart.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">Итого:</span>
                        <span className="text-2xl font-bold text-primary">{getTotalPrice()}₽</span>
                      </div>
                      <Button className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold">
                        <Icon name="CreditCard" className="mr-2" size={20} />
                        Оформить заказ
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-6xl font-bold mb-6 bg-gradient-primary text-gradient animate-gradient-shift bg-[length:200%_200%]">
              Лучший магазин для SAMP
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Автоматическая выдача товаров через API сервера. Мгновенно и безопасно!
            </p>
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-6 text-lg animate-float"
              onClick={() => scrollToSection('donate')}
            >
              <Icon name="ShoppingCart" className="mr-2" size={24} />
              Перейти к покупкам
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <Card className="border-primary/20 hover-scale animate-scale-in bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Icon name="Zap" size={24} className="text-white" />
                </div>
                <CardTitle>Моментальная выдача</CardTitle>
                <CardDescription>Товары выдаются автоматически сразу после оплаты</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-secondary/20 hover-scale animate-scale-in [animation-delay:100ms] bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-secondary flex items-center justify-center mb-4">
                  <Icon name="Shield" size={24} className="text-white" />
                </div>
                <CardTitle>Безопасность</CardTitle>
                <CardDescription>Все платежи защищены современными системами</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-accent/20 hover-scale animate-scale-in [animation-delay:200ms] bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center mb-4">
                  <Icon name="Headphones" size={24} className="text-white" />
                </div>
                <CardTitle>Поддержка 24/7</CardTitle>
                <CardDescription>Наша команда всегда готова помочь вам</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section id="donate" className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4 bg-gradient-secondary text-gradient animate-gradient-shift bg-[length:200%_200%]">
            Каталог товаров
          </h2>
          <p className="text-center text-muted-foreground mb-12">Выберите то, что вам нужно</p>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Icon name="Loader2" className="animate-spin" size={48} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donateItems.map((item, index) => (
              <Card
                key={item.id}
                className="border-border hover-scale animate-fade-in bg-card/50 backdrop-blur overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-2 ${item.gradient}`} />
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl ${item.gradient} flex items-center justify-center mb-4`}>
                    <Icon name={item.icon as any} size={32} className="text-white" />
                  </div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-primary">{item.price}</span>
                    <Button 
                      className={`${item.gradient} hover:opacity-90 text-white font-semibold`}
                      onClick={() => addToCart(item)}
                    >
                      <Icon name="ShoppingCart" className="mr-2" size={18} />
                      Купить
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="faq" className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-5xl font-bold text-center mb-4 bg-gradient-accent text-gradient animate-gradient-shift bg-[length:200%_200%]">
            Вопросы и ответы
          </h2>
          <p className="text-center text-muted-foreground mb-12">Ответы на популярные вопросы</p>

          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 bg-card/50 backdrop-blur"
              >
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="contacts" className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-primary text-gradient animate-gradient-shift bg-[length:200%_200%]">
              Контакты
            </h2>
            <p className="text-muted-foreground">Свяжитесь с нами удобным способом</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="border-primary/20 hover-scale bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Icon name="MessageCircle" size={32} className="text-white" />
                  </div>
                  <CardTitle>Discord</CardTitle>
                  <CardDescription className="text-base">discord.gg/sampstore</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-secondary/20 hover-scale bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="w-16 h-16 rounded-xl bg-gradient-secondary flex items-center justify-center mx-auto mb-4">
                    <Icon name="Send" size={32} className="text-white" />
                  </div>
                  <CardTitle>Telegram</CardTitle>
                  <CardDescription className="text-base">@Sashamomento</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card className="border-accent/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl">Форма обратной связи</CardTitle>
                <CardDescription>Напишите нам, и мы ответим в течение 24 часов</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Ваше имя"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Ваше сообщение"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="bg-background/50"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-accent hover:opacity-90 text-white font-semibold">
                    <Icon name="Send" className="mr-2" size={20} />
                    Отправить
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 SAMP Store. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;