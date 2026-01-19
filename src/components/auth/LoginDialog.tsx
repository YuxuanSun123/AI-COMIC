// 登录对话框

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister: () => void;
}

export default function LoginDialog({ open, onOpenChange, onSwitchToRegister }: LoginDialogProps) {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await login(email, password);

    if (error) {
      toast({
        title: t.operationFailed,
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: t.loginSuccess,
        description: `${t.loginSuccess}!`
      });
      onOpenChange(false);
      setEmail('');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-[90%] xl:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">{t.login}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t.pleaseLogin}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.email}
              required
              className="bg-input border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
              required
              className="bg-input border-border"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Button type="submit" disabled={loading} className="w-full neon-glow-purple">
              {loading ? t.loading : t.login}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onSwitchToRegister}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              {t.register}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
