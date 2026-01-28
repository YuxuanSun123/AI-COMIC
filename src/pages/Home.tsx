// 首页 - 创作工坊

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import ToolCard from '@/components/common/ToolCard';
import { Button } from '@/components/ui/button';
import { FileText, Film, Video, Scissors, Settings } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

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

      {/* 后台管理入口 - 调试模式 (已隐藏) */}
      {/* <div className="mt-12 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 border-2 border-primary/20 rounded-xl p-8">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center xl:text-left">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  后台管理
                </h3>
                <p className="text-sm text-muted-foreground">
                  配置系统参数、API设置、数据管理等
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/admin')}
              size="lg"
              className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all px-8 h-12"
            >
              <Settings className="h-5 w-5 mr-2" />
              进入后台管理
            </Button>
          </div>
        </div>
      </div> */}

      {/* 介绍文本 */}
      <div className="mt-16 max-w-4xl mx-auto text-center">
        <p className="text-muted-foreground leading-relaxed">
          {t.toolsIntro}
        </p>
      </div>
    </div>
  );
}
