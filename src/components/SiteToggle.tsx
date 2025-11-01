import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ADMINS_API = 'https://functions.poehali.dev/cda1d047-4908-491c-8603-cf39dffad0b3';

const SiteToggle = () => {
  const [siteEnabled, setSiteEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSiteStatus();
  }, []);

  const fetchSiteStatus = async () => {
    try {
      const response = await fetch(`${ADMINS_API}?action=site_status`);
      const data = await response.json();
      setSiteEnabled(data.site_enabled);
    } catch (error) {
      console.error('Ошибка загрузки статуса сайта:', error);
    }
  };

  const toggleSite = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(ADMINS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'toggle_site',
          site_enabled: enabled 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSiteEnabled(enabled);
        toast.success(
          enabled ? 'Сайт включен' : 'Сайт отключен',
          {
            description: enabled 
              ? 'Пользователи могут посещать сайт' 
              : 'Сайт недоступен для пользователей'
          }
        );
      } else {
        toast.error('Ошибка', {
          description: data.error || 'Не удалось изменить статус сайта'
        });
      }
    } catch (error) {
      console.error('Ошибка переключения сайта:', error);
      toast.error('Ошибка', {
        description: 'Не удалось изменить статус сайта'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border">
      <Label htmlFor="site-toggle" className="text-sm font-medium cursor-pointer">
        {siteEnabled ? '🟢 Сайт включен' : '🔴 Сайт отключен'}
      </Label>
      <Switch
        id="site-toggle"
        checked={siteEnabled}
        onCheckedChange={toggleSite}
        disabled={isLoading}
      />
    </div>
  );
};

export default SiteToggle;
