// 会员方案页面

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import type { User } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';

export default function Pricing() {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    document.title = `${t.membershipPlans} - ${t.appTitle}`;
  }, [t]);

  const plans = [
    {
      tier: 'free' as const,
      name: t.freeTier,
      desc: t.freeDesc,
      features: ['基础剧本生成', '分镜工具', '最多5个作品', '社区支持']
    },
    {
      tier: 'pro' as const,
      name: t.proTier,
      desc: t.proDesc,
      features: ['高级剧本生成', '所有工具', '无限作品', '优先支持', 'AI辅助优化']
    },
    {
      tier: 'studio' as const,
      name: t.studioTierTitle,
      desc: t.studioDesc,
      features: ['所有Pro功能', '团队协作', '自定义模板', '专属客服', 'API访问']
    }
  ];

  const handleSelectPlan = (tier: 'free' | 'pro' | 'studio') => {
    if (!currentUser) {
      toast({ title: t.pleaseLogin, variant: 'destructive' });
      return;
    }

    // 更新用户会员等级
    const result = tableApi.patch<User>('users', currentUser.id, {
      membership_tier: tier
    });

    if ('code' in result) {
      toast({ title: t.operationFailed, description: result.message, variant: 'destructive' });
    } else {
      // 更新localStorage中的当前用户信息
      const updatedUser = { ...currentUser, membership_tier: tier };
      localStorage.setItem('current_user', JSON.stringify(updatedUser));
      
      toast({ title: t.upgradedSuccess });
      
      // 刷新页面以更新UI
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const tierColors = {
    free: 'border-muted',
    pro: 'border-secondary neon-glow-blue',
    studio: 'border-primary neon-glow-purple'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl xl:text-4xl font-bold gradient-text mb-4">
          {t.pricingTitle}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t.pricingDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.tier} className={`bg-card ${tierColors[plan.tier]} card-hover`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                {currentUser?.membership_tier === plan.tier && (
                  <Badge className="bg-primary text-primary-foreground">
                    {t.currentPlan}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-muted-foreground mt-2">
                {plan.desc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSelectPlan(plan.tier)}
                disabled={currentUser?.membership_tier === plan.tier}
                className="w-full"
                variant={plan.tier === 'studio' ? 'default' : 'outline'}
              >
                {currentUser?.membership_tier === plan.tier ? t.currentPlan : t.selectPlan}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
