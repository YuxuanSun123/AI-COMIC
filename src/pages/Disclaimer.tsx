// 免责声明页面

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';

export default function Disclaimer() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = `${t.disclaimer} - ${t.appTitle}`;
  }, [t]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl xl:text-4xl font-bold gradient-text mb-8 text-center">
        {t.disclaimer}
      </h1>

      <Card className="bg-card border-border">
        <CardContent className="space-y-6 pt-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">1. AI生成内容声明</h2>
            <p className="text-muted-foreground">
              本平台提供的所有内容生成服务（包括但不限于剧本、分镜、图片、视频等）均由人工智能技术辅助生成。
              AI生成内容可能存在不准确、不完整或意外的情况，不代表本平台的立场或观点。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">2. 用户责任</h2>
            <p className="text-muted-foreground">
              用户在使用本平台生成内容时，应遵守相关法律法规。用户不得利用本平台制作、上传、复制、发布、传播含有违反法律法规、社会公德或侵犯他人合法权益的内容。
              对于用户使用本平台生成的任何内容，用户应自行承担全部责任。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">3. 知识产权</h2>
            <p className="text-muted-foreground">
              用户使用本平台生成的原创内容的知识产权归用户所有（具体以相关法律法规及平台服务条款为准）。
              但在生成过程中若使用了第三方素材，用户应自行确认授权情况。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">4. 服务中断与免责</h2>
            <p className="text-muted-foreground">
              鉴于网络服务的特殊性，本平台不保证服务不会中断，对服务的及时性、安全性、准确性不作担保。
              对于因不可抗力、网络攻击、系统故障等原因导致的服务中断或数据丢失，本平台不承担责任，但将尽力减少因此给用户造成的损失和影响。
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            最后更新日期：2026年1月28日
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
