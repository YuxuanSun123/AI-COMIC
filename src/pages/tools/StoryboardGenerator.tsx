// 分镜生成器

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import type { Work, StoryboardContent, Shot } from '@/types';
import ToolLayout from '@/components/layouts/ToolLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';

export default function StoryboardGenerator() {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState('');
  const [scriptInput, setScriptInput] = useState('');
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `${t.storyboardGenerator} - ${t.appTitle}`;
    
    const id = searchParams.get('id');
    if (id) {
      const work = tableApi.get<Work>('works', id) as Work | null;
      if (work && work.type === 'storyboard') {
        setTitle(work.title);
        const content = work.content as StoryboardContent;
        setShots(content.shots);
      }
    }
  }, [t, searchParams]);

  const generateStoryboard = () => {
    if (!currentUser) {
      toast({ title: t.pleaseLogin, variant: 'destructive' });
      return;
    }

    if (!scriptInput) {
      toast({ title: t.fieldRequired, variant: 'destructive' });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const mockShots: Shot[] = [
        {
          shot_number: 1,
          image_description: language === 'zh' ? '画面描述示例' : 'Image description example',
          action: language === 'zh' ? '动作描述' : 'Action description',
          camera_position: language === 'zh' ? '中景' : 'Medium shot',
          dialogue: language === 'zh' ? '对白内容' : 'Dialogue content'
        }
      ];

      setShots(mockShots);
      setLoading(false);
      toast({ title: language === 'zh' ? '生成成功' : 'Generated successfully' });
    }, 2000);
  };

  const addShot = () => {
    const newShot: Shot = {
      shot_number: shots.length + 1,
      image_description: '',
      action: '',
      camera_position: '',
      dialogue: ''
    };
    setShots([...shots, newShot]);
  };

  const updateShot = (index: number, field: keyof Shot, value: string | number) => {
    const updated = [...shots];
    updated[index] = { ...updated[index], [field]: value };
    setShots(updated);
  };

  const deleteShot = (index: number) => {
    setShots(shots.filter((_, i) => i !== index));
  };

  const moveShot = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === shots.length - 1)) return;
    const updated = [...shots];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setShots(updated);
  };

  const saveStoryboard = () => {
    if (!currentUser || !title) {
      toast({ title: t.fieldRequired, variant: 'destructive' });
      return;
    }

    const content: StoryboardContent = { shots };
    const id = searchParams.get('id');

    if (id) {
      tableApi.patch<Work>('works', id, { title, content, updated_ms: Date.now() });
    } else {
      const newWork: Omit<Work, 'id'> = {
        type: 'storyboard',
        title,
        content,
        author_id: currentUser.id,
        lang: language,
        created_ms: Date.now(),
        updated_ms: Date.now()
      };
      tableApi.post<Work>('works', newWork);
    }

    toast({ title: t.saveSuccess });
  };

  const leftPanel = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.storyboardGenerator}</p>
    </div>
  );

  const centerPanel = (
    <div className="space-y-4">
      <div>
        <Label>{t.workTitle}</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-input border-border"
        />
      </div>
      <div>
        <Label>{t.scriptInput}</Label>
        <Textarea
          value={scriptInput}
          onChange={(e) => setScriptInput(e.target.value)}
          rows={4}
          className="bg-input border-border"
        />
      </div>
      <Button onClick={generateStoryboard} disabled={loading} className="w-full neon-glow-purple">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.loading}</> : t.generateStoryboard}
      </Button>

      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center">
          <Label>分镜列表</Label>
          <Button onClick={addShot} size="sm" variant="outline" className="border-border">
            <Plus className="h-4 w-4 mr-1" />
            {t.addItem}
          </Button>
        </div>

        {shots.map((shot, index) => (
          <Card key={index} className="p-4 bg-muted border-border">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>镜头 {index + 1}</Label>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => moveShot(index, 'up')} disabled={index === 0}>
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => moveShot(index, 'down')} disabled={index === shots.length - 1}>
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteShot(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Input
                placeholder={t.imageDescription}
                value={shot.image_description}
                onChange={(e) => updateShot(index, 'image_description', e.target.value)}
                className="bg-input border-border"
              />
              <Input
                placeholder={t.action}
                value={shot.action}
                onChange={(e) => updateShot(index, 'action', e.target.value)}
                className="bg-input border-border"
              />
              <Input
                placeholder={t.cameraPosition}
                value={shot.camera_position}
                onChange={(e) => updateShot(index, 'camera_position', e.target.value)}
                className="bg-input border-border"
              />
              <Input
                placeholder={t.dialogue}
                value={shot.dialogue}
                onChange={(e) => updateShot(index, 'dialogue', e.target.value)}
                className="bg-input border-border"
              />
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={saveStoryboard} className="w-full">
        {t.save}
      </Button>
    </div>
  );

  const rightPanel = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">分镜总数: {shots.length}</p>
    </div>
  );

  return <ToolLayout leftPanel={leftPanel} centerPanel={centerPanel} rightPanel={rightPanel} />;
}
