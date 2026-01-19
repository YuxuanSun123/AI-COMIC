// 关于我们页面

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function About() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = `${t.aboutUs} - ${t.appTitle}`;
  }, [t]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl xl:text-4xl font-bold gradient-text mb-8 text-center">
        {t.aboutUs}
      </h1>

      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">关于 {t.appTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground leading-relaxed">
            <p>
              {t.appTitle} 是一款专为漫剧创作者打造的全流程创作工具平台。我们致力于通过智能化工具，帮助创作者更高效地完成从剧本创作到剪辑合成的全流程制作。
            </p>
            <p>
              我们的使命是降低漫剧创作的门槛，让每一位有创意的人都能轻松实现自己的创作梦想。通过提供剧本生成器、分镜生成器、镜头卡和剪辑合成等专业工具，我们为创作者提供了一站式的创作解决方案。
            </p>
            <p>
              无论您是独立创作者还是专业团队，{t.appTitle} 都能为您提供强大的创作支持。我们相信，优秀的工具能够激发无限的创造力。
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">我们的愿景</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground leading-relaxed">
            <p>
              成为全球领先的漫剧创作工具平台，赋能每一位创作者，推动漫剧行业的创新与发展。
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">核心价值观</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>创新驱动：</strong>持续探索新技术，为创作者提供最先进的工具</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>用户至上：</strong>始终以创作者的需求为核心，打造最佳用户体验</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>开放协作：</strong>构建开放的创作生态，促进创作者之间的交流与合作</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span><strong>追求卓越：</strong>不断优化产品，追求极致的创作体验</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
