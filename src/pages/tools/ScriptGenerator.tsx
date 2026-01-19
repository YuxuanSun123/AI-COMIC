// 剧本生成器

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import type { Work, ScriptContent } from '@/types';
import ToolLayout from '@/components/layouts/ToolLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ScriptGenerator() {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [genre, setGenre] = useState('romance');
  const [storyPrompt, setStoryPrompt] = useState('');
  const [characters, setCharacters] = useState('');
  const [worldview, setWorldview] = useState('');
  const [scriptContent, setScriptContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [length, setLength] = useState([50]);
  const [pace, setPace] = useState([50]);
  const [temperature, setTemperature] = useState([70]);

  useEffect(() => {
    document.title = `${t.scriptGenerator} - ${t.appTitle}`;
    
    // 如果有ID参数，加载作品
    const id = searchParams.get('id');
    if (id) {
      const work = tableApi.get<Work>('works', id) as Work | null;
      if (work && work.type === 'script') {
        setTitle(work.title);
        setScriptContent(JSON.stringify(work.content, null, 2));
      }
    }
  }, [t, searchParams]);

  const genres = [
    { value: 'romance', label: t.romance },
    { value: 'scifi', label: t.scifi },
    { value: 'mystery', label: t.mystery },
    { value: 'campus', label: t.campus },
    { value: 'family', label: t.family },
    { value: 'thriller', label: t.thriller }
  ];

  // 本地模拟生成剧本
  const generateScript = () => {
    if (!currentUser) {
      toast({
        title: t.pleaseLogin,
        variant: 'destructive'
      });
      return;
    }

    if (!storyPrompt) {
      toast({
        title: t.fieldRequired,
        description: '请输入故事提示',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    // 模拟生成延迟
    setTimeout(() => {
      const mockScript: ScriptContent = {
        acts: [
          {
            act_number: 1,
            scenes: [
              {
                scene_number: 1,
                location: language === 'zh' ? '场景地点' : 'Scene Location',
                characters: characters ? characters.split(',').map(c => c.trim()) : ['角色A', '角色B'],
                dialogues: [
                  {
                    speaker: characters ? characters.split(',')[0].trim() : '角色A',
                    line: language === 'zh' 
                      ? `基于您的故事提示：${storyPrompt}` 
                      : `Based on your story prompt: ${storyPrompt}`
                  },
                  {
                    speaker: characters ? characters.split(',')[1]?.trim() || '角色B' : '角色B',
                    line: language === 'zh'
                      ? '这是一个模拟生成的对话内容'
                      : 'This is a simulated dialogue content'
                  }
                ],
                actions: [
                  language === 'zh' ? '角色进行动作描述' : 'Character performs action',
                  language === 'zh' ? '场景氛围变化' : 'Scene atmosphere changes'
                ],
                camera_suggestions: language === 'zh' 
                  ? '中景镜头，展现人物互动' 
                  : 'Medium shot, showing character interaction'
              }
            ]
          }
        ]
      };

      setScriptContent(JSON.stringify(mockScript, null, 2));
      setLoading(false);
      
      toast({
        title: language === 'zh' ? '生成成功' : 'Generated successfully'
      });
    }, 2000);
  };

  const saveScript = () => {
    if (!currentUser) {
      toast({
        title: t.pleaseLogin,
        variant: 'destructive'
      });
      return;
    }

    if (!title || !scriptContent) {
      toast({
        title: t.fieldRequired,
        variant: 'destructive'
      });
      return;
    }

    try {
      const content = JSON.parse(scriptContent);
      
      const id = searchParams.get('id');
      
      if (id) {
        // 更新现有作品
        const result = tableApi.patch<Work>('works', id, {
          title,
          content,
          updated_ms: Date.now()
        });
        
        if ('code' in result) {
          toast({
            title: t.operationFailed,
            description: result.message,
            variant: 'destructive'
          });
        } else {
          toast({
            title: t.saveSuccess
          });
        }
      } else {
        // 创建新作品
        const newWork: Omit<Work, 'id'> = {
          type: 'script',
          title,
          content,
          author_id: currentUser.id,
          lang: language,
          created_ms: Date.now(),
          updated_ms: Date.now()
        };
        
        const result = tableApi.post<Work>('works', newWork);
        
        if ('code' in result) {
          toast({
            title: t.operationFailed,
            description: result.message,
            variant: 'destructive'
          });
        } else {
          toast({
            title: t.saveSuccess
          });
        }
      }
    } catch (error) {
      toast({
        title: t.operationFailed,
        description: 'JSON格式错误',
        variant: 'destructive'
      });
    }
  };

  const leftPanel = (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">{t.selectGenre}</Label>
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="w-full mt-2 bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {genres.map(g => (
              <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const centerPanel = (
    <div className="space-y-4">
      <div>
        <Label>{t.workTitle}</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.workTitle}
          className="bg-input border-border"
        />
      </div>
      <div>
        <Label>{t.storyPrompt}</Label>
        <Textarea
          value={storyPrompt}
          onChange={(e) => setStoryPrompt(e.target.value)}
          placeholder="描述您的故事创意..."
          rows={3}
          className="bg-input border-border"
        />
      </div>
      <div>
        <Label>{t.characters} (逗号分隔)</Label>
        <Input
          value={characters}
          onChange={(e) => setCharacters(e.target.value)}
          placeholder="角色1, 角色2"
          className="bg-input border-border"
        />
      </div>
      <div>
        <Label>{t.worldview}</Label>
        <Textarea
          value={worldview}
          onChange={(e) => setWorldview(e.target.value)}
          placeholder="描述故事的世界观设定..."
          rows={2}
          className="bg-input border-border"
        />
      </div>
      <Button onClick={generateScript} disabled={loading} className="w-full neon-glow-purple">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t.loading}
          </>
        ) : (
          t.generateScript
        )}
      </Button>
      <div>
        <Label>{t.scriptInput}</Label>
        <Textarea
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          placeholder="生成的剧本内容将显示在这里..."
          rows={15}
          className="bg-input border-border font-mono text-sm"
        />
      </div>
      <Button onClick={saveScript} className="w-full">
        {t.save}
      </Button>
    </div>
  );

  const rightPanel = (
    <div className="space-y-6">
      <div>
        <Label className="text-sm">{t.length}: {length[0]}%</Label>
        <Slider
          value={length}
          onValueChange={setLength}
          max={100}
          step={10}
          className="mt-2"
        />
      </div>
      <div>
        <Label className="text-sm">{t.pace}: {pace[0]}%</Label>
        <Slider
          value={pace}
          onValueChange={setPace}
          max={100}
          step={10}
          className="mt-2"
        />
      </div>
      <div>
        <Label className="text-sm">{t.temperature}: {temperature[0]}%</Label>
        <Slider
          value={temperature}
          onValueChange={setTemperature}
          max={100}
          step={10}
          className="mt-2"
        />
      </div>
    </div>
  );

  return <ToolLayout leftPanel={leftPanel} centerPanel={centerPanel} rightPanel={rightPanel} />;
}
