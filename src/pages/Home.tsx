// 首页 - 创作工坊

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ToolCard from '@/components/common/ToolCard';
import { FileText, Film, Video, Scissors } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = `${t.studio} - ${t.appTitle}`;
  }, [t]);

  const tools = [
    {
      title: t.scriptGenerator,
      description: '从故事创意到完整剧本，AI辅助创作',
      icon: FileText,
      path: '/tools/script'
    },
    {
      title: t.storyboardGenerator,
      description: '将剧本转换为分镜脚本，规划镜头',
      icon: Film,
      path: '/tools/storyboard'
    },
    {
      title: t.videoCards,
      description: '生成详细的镜头卡，包含画面和提示词',
      icon: Video,
      path: '/tools/video'
    },
    {
      title: t.editing,
      description: '制定剪辑计划，整合素材和音效',
      icon: Scissors,
      path: '/tools/edit'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 标题区 */}
      <div className="text-center mb-12">
        <h1 className="text-3xl xl:text-5xl font-bold gradient-text mb-4">
          {t.appTitle}
        </h1>
        <p className="text-lg xl:text-xl text-muted-foreground">
          {t.appSubtitle}
        </p>
      </div>

      {/* 工具卡片网格 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {tools.map((tool) => (
          <ToolCard key={tool.path} {...tool} />
        ))}
      </div>

      {/* 介绍文本 */}
      <div className="mt-16 max-w-4xl mx-auto text-center">
        <p className="text-muted-foreground leading-relaxed">
          {t.toolsIntro}
        </p>
      </div>
    </div>
  );
}
