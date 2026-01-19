// 使用条款页面

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';

export default function Terms() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = `${t.termsOfService} - ${t.appTitle}`;
  }, [t]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl xl:text-4xl font-bold gradient-text mb-8 text-center">
        {t.termsOfService}
      </h1>

      <Card className="bg-card border-border">
        <CardContent className="space-y-6 pt-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">1. 服务说明</h2>
            <p className="text-muted-foreground">
              {t.appTitle} 是一款面向漫剧创作者的工具型网站，提供从剧本创作到剪辑计划的全流程辅助功能。本应用为演示项目，所有数据存储在浏览器本地，不提供真实的AI生成服务。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">2. 用户责任</h2>
            <p className="text-muted-foreground">使用本服务时，您同意：</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>提供真实、准确的注册信息</li>
              <li>妥善保管您的账户信息</li>
              <li>不使用本服务从事违法或侵权活动</li>
              <li>尊重其他用户的权利</li>
              <li>不试图破坏或干扰服务的正常运行</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">3. 知识产权</h2>
            <p className="text-muted-foreground">
              您使用本服务创作的内容归您所有。本服务提供的工具和界面的知识产权归 {t.appTitle} 所有。未经许可，不得复制、修改或分发本服务的任何部分。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">4. 免责声明</h2>
            <p className="text-muted-foreground">
              本应用为演示项目，按"现状"提供服务，不提供任何明示或暗示的保证。我们不对以下情况承担责任：
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>服务中断或数据丢失</li>
              <li>用户创作内容的质量或准确性</li>
              <li>因使用本服务而产生的任何直接或间接损失</li>
              <li>第三方链接的内容或服务</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">5. 服务变更</h2>
            <p className="text-muted-foreground">
              我们保留随时修改、暂停或终止服务的权利，恕不另行通知。我们不对服务的修改、暂停或终止承担责任。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">6. 账户终止</h2>
            <p className="text-muted-foreground">
              我们保留在您违反本条款时暂停或终止您的账户的权利。您也可以随时停止使用本服务并清除本地数据。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">7. 条款修改</h2>
            <p className="text-muted-foreground">
              我们可能会不时更新本使用条款。更新后的条款将在本页面发布。继续使用本服务即表示您接受修改后的条款。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">8. 适用法律</h2>
            <p className="text-muted-foreground">
              本条款受中华人民共和国法律管辖。因本条款引起的任何争议应通过友好协商解决。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">9. 联系方式</h2>
            <p className="text-muted-foreground">
              如果您对本使用条款有任何疑问，请通过 contact@aicmworkshop.com 联系我们。
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
