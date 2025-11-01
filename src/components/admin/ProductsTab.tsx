import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface Product {
  id: number;
  title: string;
  price: string;
  description: string;
  icon: string;
  gradient?: string;
}

interface ProductsTabProps {
  products: Product[];
  onProductsChange: () => void;
  productsApi: string;
}

const ProductsTab = ({ products, onProductsChange, productsApi }: ProductsTabProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    description: '',
    icon: 'Package',
    gradient: 'bg-gradient-primary'
  });

  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.price || !newProduct.description) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля товара.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(productsApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        onProductsChange();
        setNewProduct({ title: '', price: '', description: '', icon: 'Package', gradient: 'bg-gradient-primary' });
        setIsDialogOpen(false);
        toast({
          title: "Товар добавлен!",
          description: "Товар успешно добавлен в каталог.",
        });
      }
    } catch (error) {
      console.error('Ошибка добавления товара:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`${productsApi}?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onProductsChange();
        toast({
          title: "Товар удален",
          description: "Товар успешно удален из каталога.",
        });
      }
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление товарами</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 text-white">
              <Icon name="Plus" className="mr-2" size={18} />
              Добавить товар
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Добавить новый товар</DialogTitle>
              <DialogDescription>Заполните информацию о товаре</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Название</label>
                <Input
                  placeholder="Название товара"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Цена</label>
                <Input
                  placeholder="1000₽"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Описание</label>
                <Textarea
                  placeholder="Описание товара"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>
              <Button onClick={handleAddProduct} className="w-full bg-gradient-primary hover:opacity-90 text-white">
                Добавить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.title}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Icon name="Trash2" size={16} />
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

export default ProductsTab;
