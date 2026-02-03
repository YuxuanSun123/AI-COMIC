// 隐私政策页面

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';

export default function Privacy() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = `${t.privacyPolicy} - ${t.appTitle}`;
  }, [t]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl xl:text-4xl font-bold gradient-text mb-8 text-center">
        {t.privacyPolicy}
      </h1>

      <Card className="bg-card border-border">
        <CardContent className="space-y-6 pt-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">1. 信息收集</h2>
            <p className="text-muted-foreground">
              我们收集您在注册和使用服务时提供的信息，包括但不限于邮箱地址、昵称等基本信息。这些信息用于提供和改进我们的服务。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">2. 信息使用</h2>
            <p className="text-muted-foreground">
              我们使用收集的信息来：
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>提供、维护和改进我们的服务</li>
              <li>处理您的请求和交易</li>
              <li>向您发送技术通知和支持消息</li>
              <li>回应您的评论和问题</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">3. 信息保护</h2>
            <p className="text-muted-foreground">
              我们采取合理的安全措施来保护您的个人信息免遭未经授权的访问、使用或披露。但请注意，本应用为演示项目，密码存储采用简单哈希方式，不适用于生产环境。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">4. 数据存储</h2>
            <p className="text-muted-foreground">
              本应用使用浏览器本地存储（localStorage）保存您的数据。这意味着您的数据仅存储在您的设备上，不会上传到服务器。清除浏览器数据将导致所有信息丢失。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">5. Cookie使用</h2>
            <p className="text-muted-foreground">
              我们使用localStorage来存储您的登录状态和语言偏好，以提供更好的用户体验。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">6. 第三方服务</h2>
            <p className="text-muted-foreground">
              本应用不使用任何第三方分析或广告服务。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">7. 政策更新</h2>
            <p className="text-muted-foreground">
              我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，并在页面顶部注明最后更新日期。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">8. 联系我们</h2>
            <p className="text-muted-foreground">
              如果您对本隐私政策有任何疑问，请通过 contact@aicmworkshop.com 联系我们。
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            最后更新日期：2026年1月19日
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
