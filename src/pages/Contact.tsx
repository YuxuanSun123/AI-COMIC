// 联系我们页面

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, MessageSquare, Globe } from 'lucide-react';

export default function Contact() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = `${t.contactUs} - ${t.appTitle}`;
  }, [t]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl xl:text-4xl font-bold gradient-text mb-8 text-center">
        {t.contactUs}
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card border-border card-hover">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">邮箱联系</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">contact@aicmworkshop.com</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border card-hover">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-secondary/10">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-lg">在线客服</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">工作日 9:00-18:00</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border card-hover">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-accent/10">
                <Globe className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-lg">官方网站</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">www.aicmworkshop.com</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">联系方式</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground leading-relaxed">
          <p>
            如果您在使用过程中遇到任何问题，或者有任何建议和反馈，欢迎通过以下方式联系我们：
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• 邮箱：contact@aicmworkshop.com</li>
            <li>• 客服热线：400-123-4567（工作日 9:00-18:00）</li>
            <li>• 官方微信：AICM_Workshop</li>
            <li>• 官方微博：@AI漫剧工作坊</li>
          </ul>
          <p className="mt-6">
            我们的团队会在收到您的消息后尽快回复。感谢您对 {t.appTitle} 的支持！
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
