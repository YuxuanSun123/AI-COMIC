// 首页 - 创作工坊

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import ToolCard from '@/components/common/ToolCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, Film, Image, Globe,
  Sparkles, Zap, Layout, Share2, 
  ArrowRight, Wand2, Rocket
} from 'lucide-react';
import { motion } from 'framer-motion';
import SpotlightCard from '@/components/common/SpotlightCard';

export default function Home() {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${t.studio} - ${t.appTitle}`;
  }, [t]);

  const tools = [
    {
      title: t.scriptGenerator,
      description: t.scriptGeneratorDesc,
      icon: FileText,
      path: '/tools/script'
    },
    {
      title: t.storyboardGenerator,
      description: t.storyboardGeneratorDesc,
      icon: Film,
      path: '/tools/storyboard'
    },
    {
      title: t.assetsGenerator,
      description: t.assetsGeneratorDesc,
      icon: Image,
      path: '/tools/assets'
    }
  ];

  const features = [
    {
      title: t.aiDrivenCreation,
      desc: t.aiDrivenCreationDesc,
      icon: Sparkles
    },
    {
      title: t.rapidIteration,
      desc: t.rapidIterationDesc,
      icon: Zap
    },
    {
      title: t.professionalStoryboard,
      desc: t.professionalStoryboardDesc,
      icon: Layout
    },
    {
      title: t.multiFormatExport,
      desc: t.multiFormatExportDesc,
      icon: Share2
    }
  ];

  const workflow = [
    { step: '01', title: t.workflowStep1, desc: t.workflowStep1Desc },
    { step: '02', title: t.workflowStep2, desc: t.workflowStep2Desc },
    { step: '03', title: t.workflowStep3, desc: t.workflowStep3Desc },
    { step: '04', title: t.workflowStep4, desc: t.workflowStep4Desc }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm rounded-full border-primary/20 bg-primary/5 text-primary">
              <Sparkles className="w-3 h-3 mr-2 fill-current" />
              {t.newGenerationPlatform}
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold gradient-text mb-8 tracking-tight leading-tight">
              {t.appTitle}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.appSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full gradient-button shadow-lg shadow-primary/25" onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}>
                <Rocket className="mr-2 h-5 w-5" />
                {t.startCreating}
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80" onClick={() => navigate('/about')}>
                {t.learnMore}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gradient-text">{t.coreCreativeTools}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.oneStopSolution}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tools.map((tool, index) => (
              <motion.div 
                key={index} 
                className="h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <SpotlightCard 
                  className="cursor-pointer border-border/60 hover:border-primary/50 h-full"
                  onClick={() => navigate(tool.path)}
                  spotlightColor="rgba(139, 92, 246, 0.25)" // Purple
                >
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <tool.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* External Tools Section */}
      <section className="py-12 bg-muted/30 border-y border-border/40">
        <div className="container mx-auto px-4">
          <SpotlightCard 
            className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/10"
            spotlightColor="rgba(59, 130, 246, 0.25)" // Blue
            onClick={() => navigate('/tools/external')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-background rounded-xl text-primary shadow-sm">
                <Globe className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1">{t.externalToolsLibrary}</h3>
                <p className="text-muted-foreground">{t.externalToolsDesc}</p>
              </div>
            </div>
            <Button size="lg" className="shrink-0 gap-2 shadow-sm pointer-events-none">
              {t.exploreTools} <ArrowRight className="w-4 h-4" />
            </Button>
          </SpotlightCard>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t.creativeWorkflow}</h2>
            <p className="text-muted-foreground">{t.workflowDesc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {workflow.map((item, index) => (
              <div key={index} className="relative group">
                <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors duration-300 h-full">
                  <div className="text-4xl font-black text-muted-foreground/10 mb-4 group-hover:text-primary/10 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.desc}
                  </p>
                </div>
                {index < workflow.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-muted-foreground/30 z-10">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t.whyChooseUs} <span className="gradient-text">{t.appTitle}</span>?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t.whyChooseUsDesc}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl rounded-full opacity-50 animate-blob" />
              <div className="relative bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 rounded-lg bg-background/80 border border-border">
                    <Wand2 className="w-6 h-6 text-purple-500" />
                    <div className="h-2 bg-muted rounded w-2/3 animate-pulse" />
                  </div>
                  <div className="flex items-center space-x-4 p-4 rounded-lg bg-background/80 border border-border ml-8">
                    <Layout className="w-6 h-6 text-blue-500" />
                    <div className="h-2 bg-muted rounded w-3/4 animate-pulse" />
                  </div>
                  <div className="flex items-center space-x-4 p-4 rounded-lg bg-background/80 border border-border">
                    <Image className="w-6 h-6 text-pink-500" />
                    <div className="h-2 bg-muted rounded w-1/2 animate-pulse" />
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t.whyChooseUsDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 rounded-3xl p-12 border border-primary/10">
            <h2 className="text-3xl font-bold mb-6">{t.readyToStart}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t.joinCommunity}
            </p>
            <Button size="lg" className="h-12 px-10 text-lg rounded-full gradient-button" onClick={() => navigate('/login')}>
              {t.startCreating}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
