// 新闻卡片组件

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { News } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface NewsCardProps {
  news: News;
}

export default function NewsCard({ news }: NewsCardProps) {
  const { t, language } = useLanguage();

  return (
    <Card className="bg-card border-border card-hover">
      <CardHeader>
        <CardTitle className="text-xl">{news.title}</CardTitle>
        <CardDescription className="mt-2 text-muted-foreground line-clamp-2">
          {news.summary}
        </CardDescription>
        <div className="flex flex-wrap gap-2 mt-3">
          {news.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="border-border">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDistanceToNow(news.created_ms, {
            addSuffix: true,
            locale: language === 'zh' ? zhCN : enUS
          })}
        </p>
      </CardHeader>
      <CardFooter>
        <Link to={`/news/${news.id}`} className="w-full">
          <Button variant="outline" className="w-full border-border">
            {t.readMore}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
