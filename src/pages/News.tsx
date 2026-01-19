// 行业动态页面

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import type { News as NewsType } from '@/types';
import NewsCard from '@/components/common/NewsCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

export default function News() {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [newsList, setNewsList] = useState<NewsType[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    tags: ''
  });

  useEffect(() => {
    document.title = `${t.news} - ${t.appTitle}`;
    loadNews();
  }, [t]);

  const loadNews = () => {
    const data = tableApi.get<NewsType>('news') as NewsType[];
    setNewsList(data.sort((a, b) => b.created_ms - a.created_ms));
  };

  const handleCreate = () => {
    if (!currentUser) {
      toast({
        title: t.pleaseLogin,
        variant: 'destructive'
      });
      return;
    }

    if (!formData.title || !formData.summary || !formData.content) {
      toast({
        title: t.fieldRequired,
        variant: 'destructive'
      });
      return;
    }

    const newNews: Omit<NewsType, 'id'> = {
      title: formData.title,
      summary: formData.summary,
      content: formData.content,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      author_id: currentUser.id,
      created_ms: Date.now(),
      updated_ms: Date.now()
    };

    const result = tableApi.post<NewsType>('news', newNews);

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
      setShowCreateDialog(false);
      setFormData({ title: '', summary: '', content: '', tags: '' });
      loadNews();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold gradient-text">{t.industryNews}</h1>
        {currentUser && (
          <Button onClick={() => setShowCreateDialog(true)} className="neon-glow-purple">
            <Plus className="mr-2 h-4 w-4" />
            {t.create}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {newsList.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>

      {newsList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          暂无新闻
        </div>
      )}

      {/* 创建新闻对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card border-border max-w-[90%] xl:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text">{t.create}{t.news}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t.newsTitle}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label>{t.newsSummary}</Label>
              <Input
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label>{t.newsContent}</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label>{t.newsTags} (逗号分隔)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="标签1, 标签2"
                className="bg-input border-border"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreate} className="flex-1 neon-glow-purple">
                {t.submit}
              </Button>
              <Button onClick={() => setShowCreateDialog(false)} variant="outline" className="border-border">
                {t.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
