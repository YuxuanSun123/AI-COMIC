// 镜头卡生成器 - 简化版

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import type { Work, VideoCardsContent, VideoCard } from '@/types';
import ToolLayout from '@/components/layouts/ToolLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

export default function VideoCards() {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState('');
  const [cards, setCards] = useState<VideoCard[]>([]);

  useEffect(() => {
    document.title = `${t.videoCards} - ${t.appTitle}`;
    
    const id = searchParams.get('id');
    if (id) {
      const work = tableApi.get<Work>('works', id) as Work | null;
      if (work && work.type === 'video_cards') {
        setTitle(work.title);
        const content = work.content as VideoCardsContent;
        setCards(content.cards);
      }
    }
  }, [t, searchParams]);

  const addCard = () => {
    const newCard: VideoCard = {
      id: `card_${Date.now()}`,
      image_description: '',
      action: '',
      lighting: '',
      narration: '',
      prompt: '',
      order: cards.length
    };
    setCards([...cards, newCard]);
  };

  const updateCard = (id: string, field: keyof VideoCard, value: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const saveCards = () => {
    if (!currentUser || !title) {
      toast({ title: t.fieldRequired, variant: 'destructive' });
      return;
    }

    const content: VideoCardsContent = { cards };
    const id = searchParams.get('id');

    if (id) {
      tableApi.patch<Work>('works', id, { title, content, updated_ms: Date.now() });
    } else {
      const newWork: Omit<Work, 'id'> = {
        type: 'video_cards',
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

  const leftPanel = <div className="text-sm text-muted-foreground">{t.videoCards}</div>;

  const centerPanel = (
    <div className="space-y-4">
      <div>
        <Label>{t.workTitle}</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-input border-border" />
      </div>

      <div className="flex justify-between items-center">
        <Label>镜头卡列表</Label>
        <Button onClick={addCard} size="sm" variant="outline" className="border-border">
          <Plus className="h-4 w-4 mr-1" />
          {t.addItem}
        </Button>
      </div>

      {cards.map((card, index) => (
        <Card key={card.id} className="p-4 bg-muted border-border">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>镜头卡 {index + 1}</Label>
              <Button size="sm" variant="ghost" onClick={() => deleteCard(card.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder={t.imageDescription}
              value={card.image_description}
              onChange={(e) => updateCard(card.id, 'image_description', e.target.value)}
              rows={2}
              className="bg-input border-border"
            />
            <Input
              placeholder={t.action}
              value={card.action}
              onChange={(e) => updateCard(card.id, 'action', e.target.value)}
              className="bg-input border-border"
            />
            <Input
              placeholder={t.lighting}
              value={card.lighting}
              onChange={(e) => updateCard(card.id, 'lighting', e.target.value)}
              className="bg-input border-border"
            />
            <Input
              placeholder={t.narration}
              value={card.narration}
              onChange={(e) => updateCard(card.id, 'narration', e.target.value)}
              className="bg-input border-border"
            />
            <Textarea
              placeholder={t.prompt}
              value={card.prompt}
              onChange={(e) => updateCard(card.id, 'prompt', e.target.value)}
              rows={2}
              className="bg-input border-border"
            />
          </div>
        </Card>
      ))}

      <Button onClick={saveCards} className="w-full">{t.save}</Button>
    </div>
  );

  const rightPanel = <div className="text-sm text-muted-foreground">镜头卡总数: {cards.length}</div>;

  return <ToolLayout leftPanel={leftPanel} centerPanel={centerPanel} rightPanel={rightPanel} />;
}
