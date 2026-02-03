import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Image, Video, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import SpotlightCard from '@/components/common/SpotlightCard';

const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (e) {
    return '';
  }
};

export default function ExternalToolsPage() {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = `${t.externalToolsLibrary} - ${t.appTitle}`;
  }, [t]);

  const toolsItems = {
    zh: {
      image: [
        { 
          name: "Midjourney", 
          url: "https://www.midjourney.com/",
          tags: ["高质量", "艺术感", "付费"],
          pros: "目前行业标杆，生成的图像艺术感极强，光影效果出色，适合生成风格化强烈的漫剧场景和角色立绘。"
        },
        { 
          name: "LiblibAI (哩布哩布)", 
          url: "https://www.liblib.art/",
          tags: ["国产", "Stable Diffusion", "模型丰富"],
          pros: "国内领先的AI绘画平台，汇集大量针对亚洲审美的LoRA模型，特别适合生成二次元、古风等特定风格的漫剧素材。"
        },
        { 
          name: "Leonardo.ai", 
          url: "https://leonardo.ai/",
          tags: ["资产生成", "游戏风", "每日免费额度"],
          pros: "擅长生成游戏资产和一致性角色，提供丰富的微调工具，界面友好，适合需要精确控制画面元素的用户。"
        },
        { 
          name: "Stable Diffusion (WebUI)", 
          url: "https://stability.ai/",
          tags: ["开源", "高可控", "本地部署"],
          pros: "可控性最强，配合ControlNet可以精确控制构图和姿势，适合对分镜画面有严格要求的专业创作者。"
        },
      ],
      video: [
        { 
          name: "Runway Gen-2/Gen-3", 
          url: "https://runwayml.com/",
          tags: ["行业领袖", "可控性强", "多功能"],
          pros: "视频生成领域的领跑者，提供运动笔刷等高级控制功能，画面稳定性高，适合制作高质量的过场动画。"
        },
        { 
          name: "Kling (可灵)", 
          url: "https://kling.kuaishou.com/",
          tags: ["国产之光", "长视频", "高动态"],
          pros: "快手推出的视频模型，在生成大幅度动作和长视频方面表现优异，生成的视频流畅度极高。"
        },
        { 
          name: "Pika Labs", 
          url: "https://pika.art/",
          tags: ["动画风格", "易上手", "Discord社区"],
          pros: "在动画和二次元风格视频生成上表现出色，非常契合漫剧的视觉风格，且生成速度较快。"
        },
        { 
          name: "Luma Dream Machine", 
          url: "https://lumalabs.ai/dream-machine",
          tags: ["物理模拟", "写实", "快速"],
          pros: "对物理规律的模拟非常真实，生成的视频具有很强的电影感，适合制作写实风格的漫剧片段。"
        },
        { 
          name: "Jimeng (即梦)", 
          url: "https://jimeng.jianying.com/",
          tags: ["国产", "剪映生态", "中文理解好"],
          pros: "字节跳动出品，对中文提示词理解深刻，且与剪映生态打通，方便后续剪辑处理。"
        },
      ]
    },
    en: {
      image: [
        { 
          name: "Midjourney", 
          url: "https://www.midjourney.com/",
          tags: ["High Quality", "Artistic", "Paid"],
          pros: "Industry benchmark, extremely artistic images, excellent lighting, suitable for stylized comic scenes and character art."
        },
        { 
          name: "LiblibAI", 
          url: "https://www.liblib.art/",
          tags: ["Domestic", "Stable Diffusion", "Rich Models"],
          pros: "Leading platform with massive Asian-aesthetic LoRA models, perfect for anime and ancient style assets."
        },
        { 
          name: "Leonardo.ai", 
          url: "https://leonardo.ai/",
          tags: ["Asset Gen", "Game Style", "Free Daily Credits"],
          pros: "Great for game assets and consistent characters, rich fine-tuning tools, user-friendly, precise control."
        },
        { 
          name: "Stable Diffusion (WebUI)", 
          url: "https://stability.ai/",
          tags: ["Open Source", "High Control", "Local Host"],
          pros: "Most controllable, precise composition/pose with ControlNet, for professional creators with strict requirements."
        },
      ],
      video: [
        { 
          name: "Runway Gen-2/Gen-3", 
          url: "https://runwayml.com/",
          tags: ["Industry Leader", "High Control", "Versatile"],
          pros: "Video generation leader, advanced controls like motion brush, high stability, high quality transitions."
        },
        { 
          name: "Kling", 
          url: "https://kling.kuaishou.com/",
          tags: ["Domestic Top", "Long Video", "High Dynamic"],
          pros: "Excellent at large movements and long videos, very smooth generation."
        },
        { 
          name: "Pika Labs", 
          url: "https://pika.art/",
          tags: ["Anime Style", "Easy to Use", "Discord"],
          pros: "Great at anime style, easy to use, fits comic visual style, fast generation."
        },
        { 
          name: "Luma Dream Machine", 
          url: "https://lumalabs.ai/dream-machine",
          tags: ["Physics Sim", "Realistic", "Fast"],
          pros: "Realistic physics simulation, cinematic feel, suitable for realistic comic clips."
        },
        { 
          name: "Jimeng", 
          url: "https://jimeng.jianying.com/",
          tags: ["Domestic", "CapCut Eco", "Chinese Prompts"],
          pros: "Deep understanding of Chinese prompts, integrated with CapCut ecosystem for easy editing."
        },
      ]
    }
  };

  const currentItems = toolsItems[language];

  const tools = [
    {
      category: t.imageGeneration,
      description: t.imageGenerationDesc,
      icon: <Image className="w-6 h-6 text-purple-500" />,
      items: currentItems.image
    },
    {
      category: t.videoGeneration,
      description: t.videoGenerationDesc,
      icon: <Video className="w-6 h-6 text-blue-500" />,
      items: currentItems.video
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold gradient-text flex items-center justify-center gap-3">
          <Globe className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          {t.externalToolsLibrary}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t.externalToolsPageIntro}
        </p>
      </motion.div>

      <div className="space-y-12">
        {tools.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {group.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{group.category}</h2>
                <p className="text-muted-foreground text-sm">{group.description}</p>
              </div>
            </div>

            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {group.items.map((tool, idx) => (
                <motion.div key={idx} variants={item} className="h-full">
                  <SpotlightCard 
                    className="flex flex-col h-full border-border/60 hover:border-primary/50"
                    spotlightColor="rgba(59, 130, 246, 0.25)" // Blue-ish
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted/30 border border-border/50 p-1.5 flex items-center justify-center flex-shrink-0 group-hover:border-primary/20 transition-colors">
                            <img 
                              src={getFaviconUrl(tool.url)} 
                              alt={`${tool.name} icon`}
                              className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">
                            {tool.name}
                          </CardTitle>
                        </div>
                        <a 
                          href={tool.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3 ml-1">
                        {tool.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs px-2 h-6 bg-primary/5 text-primary border-primary/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.pros}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        className="w-full bg-muted/50 hover:bg-primary hover:text-primary-foreground text-foreground border border-border/50 group-hover:border-primary/20 transition-all"
                        variant="outline"
                        onClick={() => window.open(tool.url, '_blank')}
                      >
                        {t.visitWebsite}
                      </Button>
                    </CardFooter>
                  </SpotlightCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
