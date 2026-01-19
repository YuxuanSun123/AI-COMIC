// 注册对话框

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterDialog({ open, onOpenChange, onSwitchToLogin }: RegisterDialogProps) {
  const { register } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证密码匹配
    if (password !== confirmPassword) {
      toast({
        title: t.operationFailed,
        description: t.passwordNotMatch,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    const { error } = await register(email, nickname, password);

    if (error) {
      toast({
        title: t.operationFailed,
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: t.registerSuccess,
        description: `${t.registerSuccess}!`
      });
      onOpenChange(false);
      setEmail('');
      setNickname('');
      setPassword('');
      setConfirmPassword('');
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-[90%] xl:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">{t.register}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t.register}
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
            <Label htmlFor="nickname">{t.nickname}</Label>
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.nickname}
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
              minLength={6}
              className="bg-input border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.confirmPassword}
              required
              minLength={6}
              className="bg-input border-border"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Button type="submit" disabled={loading} className="w-full neon-glow-purple">
              {loading ? t.loading : t.register}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onSwitchToLogin}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              {t.login}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
