import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const { toast } = useToast();

  const donateItems = [
    {
      id: 1,
      title: 'Готовый проект',
      price: '1000₽',
      description: 'Полностью готовый сервер SAMP',
      icon: 'Package',
      gradient: 'bg-gradient-primary'
    },
    {
      id: 2,
      title: 'Мод Arizona RP',
      price: '250₽',
      description: 'Модификация для Arizona RP',
      icon: 'Gamepad2',
      gradient: 'bg-gradient-secondary'
    },
    {
      id: 3,
      title: 'Мод Rodina RP',
      price: '250₽',
      description: 'Модификация для Rodina RP',
      icon: 'Gamepad2',
      gradient: 'bg-gradient-accent'
    },
    {
      id: 4,
      title: 'Логи',
      price: '200₽',
      description: 'Система логирования сервера',
      icon: 'FileText',
      gradient: 'bg-gradient-primary'
    },
    {
      id: 5,
      title: 'Лаунчер PC',
      price: '200₽',
      description: 'Лаунчер для ПК',
      icon: 'Monitor',
      gradient: 'bg-gradient-secondary'
    },
    {
      id: 6,
      title: 'Лаунчер Mobile',
      price: '250₽',
      description: 'Мобильный лаунчер',
      icon: 'Smartphone',
      gradient: 'bg-gradient-accent'
    }
  ];

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

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-primary text-gradient animate-gradient-shift bg-[length:200%_200%]">MOMENTO STORE</h1>
            <div className="flex gap-6">
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
                    <Button className={`${item.gradient} hover:opacity-90 text-white font-semibold`}>
                      Купить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                  <CardDescription className="text-base">@sampstore_bot</CardDescription>
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