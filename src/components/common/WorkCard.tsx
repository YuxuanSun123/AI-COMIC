// 作品卡片组件

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Work } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

interface WorkCardProps {
  work: Work;
  onOpen: (work: Work) => void;
  onDelete: (work: Work) => void;
}

export default function WorkCard({ work, onOpen, onDelete }: WorkCardProps) {
  const { t, language } = useLanguage();

  const typeLabels = {
    script: t.scriptGenerator,
    storyboard: t.storyboardGenerator,
    video_cards: t.videoCards,
    edit_plan: t.editing
  };

  const typeColors = {
    script: 'bg-primary/20 text-primary',
    storyboard: 'bg-secondary/20 text-secondary',
    video_cards: 'bg-accent/20 text-accent',
    edit_plan: 'bg-chart-4/20 text-chart-4'
  };

  return (
    <Card className="bg-card border-border card-hover">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{work.title}</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              {formatDistanceToNow(work.created_ms, {
                addSuffix: true,
                locale: language === 'zh' ? zhCN : enUS
              })}
            </CardDescription>
          </div>
          <Badge className={typeColors[work.type]}>
            {typeLabels[work.type]}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex space-x-2">
        <Button onClick={() => onOpen(work)} size="sm" className="flex-1">
          {t.openWork}
        </Button>
        <Button onClick={() => onDelete(work)} variant="outline" size="sm" className="border-border">
          {t.deleteWork}
        </Button>
      </CardFooter>
    </Card>
  );
}
