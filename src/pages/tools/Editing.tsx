// 剪辑合成工具 - 简化版

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import type { Work, EditPlanContent, EditClip } from '@/types';
import ToolLayout from '@/components/layouts/ToolLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

export default function Editing() {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState('');
  const [clips, setClips] = useState<EditClip[]>([]);

  useEffect(() => {
    document.title = `${t.editing} - ${t.appTitle}`;
    
    const id = searchParams.get('id');
    if (id) {
      const work = tableApi.get<Work>('works', id) as Work | null;
      if (work && work.type === 'edit_plan') {
        setTitle(work.title);
        const content = work.content as EditPlanContent;
        setClips(content.clips);
      }
    }
  }, [t, searchParams]);

  const addClip = () => {
    const newClip: EditClip = {
      id: `clip_${Date.now()}`,
      shot_number: '',
      material_requirement: '',
      audio_effect: '',
      transition: '',
      duration: '',
      notes: '',
      order: clips.length
    };
    setClips([...clips, newClip]);
  };

  const updateClip = (id: string, field: keyof EditClip, value: string) => {
    setClips(clips.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const deleteClip = (id: string) => {
    setClips(clips.filter(c => c.id !== id));
  };

  const saveClips = () => {
    if (!currentUser || !title) {
      toast({ title: t.fieldRequired, variant: 'destructive' });
      return;
    }

    const content: EditPlanContent = { clips };
    const id = searchParams.get('id');

    if (id) {
      tableApi.patch<Work>('works', id, { title, content, updated_ms: Date.now() });
    } else {
      const newWork: Omit<Work, 'id'> = {
        type: 'edit_plan',
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

  const leftPanel = <div className="text-sm text-muted-foreground">{t.editing}</div>;

  const centerPanel = (
    <div className="space-y-6">
      <div>
        <Label className="font-semibold text-foreground mb-3 block">{t.workTitle}</Label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11" 
        />
      </div>

      <div className="flex justify-between items-center">
        <Label className="font-semibold text-foreground text-lg">剪辑清单</Label>
        <Button onClick={addClip} size="sm" variant="outline" className="border-2 border-border hover:border-primary/50">
          <Plus className="h-4 w-4 mr-1" />
          {t.addItem}
        </Button>
      </div>

      {clips.map((clip, index) => (
        <Card key={clip.id} className="p-6 bg-muted/50 border-2 border-border">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="font-semibold text-foreground">片段 {index + 1}</Label>
              <Button size="sm" variant="ghost" onClick={() => deleteClip(clip.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder={t.shotNumber}
              value={clip.shot_number}
              onChange={(e) => updateClip(clip.id, 'shot_number', e.target.value)}
              className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
            />
            <Input
              placeholder={t.materialRequirement}
              value={clip.material_requirement}
              onChange={(e) => updateClip(clip.id, 'material_requirement', e.target.value)}
              className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
            />
            <Input
              placeholder={t.audioEffect}
              value={clip.audio_effect}
              onChange={(e) => updateClip(clip.id, 'audio_effect', e.target.value)}
              className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
            />
            <Input
              placeholder={t.transition}
              value={clip.transition}
              onChange={(e) => updateClip(clip.id, 'transition', e.target.value)}
              className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
            />
            <Input
              placeholder={t.duration}
              value={clip.duration}
              onChange={(e) => updateClip(clip.id, 'duration', e.target.value)}
              className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
            />
            <Input
              placeholder={t.notes}
              value={clip.notes}
              onChange={(e) => updateClip(clip.id, 'notes', e.target.value)}
              className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
            />
          </div>
        </Card>
      ))}

      <Button 
        onClick={saveClips} 
        className="w-full h-12 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        {t.save}
      </Button>
    </div>
  );

  const rightPanel = (
    <div className="space-y-6">
      <div className="p-4 bg-muted/50 rounded-lg border-2 border-border">
        <Label className="font-semibold text-foreground mb-2 block">统计信息</Label>
        <p className="text-sm text-muted-foreground">片段总数: <span className="text-primary font-semibold">{clips.length}</span></p>
      </div>
    </div>
  );

  return <ToolLayout leftPanel={leftPanel} centerPanel={centerPanel} rightPanel={rightPanel} />;
}
