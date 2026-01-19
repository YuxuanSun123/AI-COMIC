// 新闻详情页面

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import tableApi from '@/lib/tableApi';
import type { News } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [news, setNews] = useState<News | null>(null);

  useEffect(() => {
    if (id) {
      const data = tableApi.get<News>('news', id) as News | null;
      setNews(data);
      if (data) {
        document.title = `${data.title} - ${t.appTitle}`;
      }
    }
  }, [id, t]);

  if (!news) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          新闻不存在
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/news')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t.back}
      </Button>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-3xl gradient-text">{news.title}</CardTitle>
          <div className="flex flex-wrap gap-2 mt-4">
            {news.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-border">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {formatDistanceToNow(news.created_ms, {
              addSuffix: true,
              locale: language === 'zh' ? zhCN : enUS
            })}
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">{news.summary}</p>
            <div className="text-foreground whitespace-pre-wrap leading-relaxed">
              {news.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
