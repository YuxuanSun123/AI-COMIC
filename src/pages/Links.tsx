// 友情链接页面

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import type { Link } from '@/types';
import LinkCard from '@/components/common/LinkCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

export default function Links() {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<Link[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    desc: '',
    tags: ''
  });

  useEffect(() => {
    document.title = `${t.friendLinks} - ${t.appTitle}`;
    loadLinks();
  }, [t]);

  const loadLinks = () => {
    const data = tableApi.get<Link>('links') as Link[];
    setLinks(data.sort((a, b) => b.created_ms - a.created_ms));
  };

  const handleCreate = () => {
    if (!currentUser) {
      toast({ title: t.pleaseLogin, variant: 'destructive' });
      return;
    }

    if (!formData.name || !formData.url) {
      toast({ title: t.fieldRequired, variant: 'destructive' });
      return;
    }

    const newLink: Omit<Link, 'id'> = {
      name: formData.name,
      url: formData.url,
      desc: formData.desc,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      author_id: currentUser.id,
      created_ms: Date.now()
    };

    const result = tableApi.post<Link>('links', newLink);

    if ('code' in result) {
      toast({ title: t.operationFailed, description: result.message, variant: 'destructive' });
    } else {
      toast({ title: t.saveSuccess });
      setShowCreateDialog(false);
      setFormData({ name: '', url: '', desc: '', tags: '' });
      loadLinks();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold gradient-text">{t.friendLinks}</h1>
        {currentUser && (
          <Button onClick={() => setShowCreateDialog(true)} className="neon-glow-purple">
            <Plus className="mr-2 h-4 w-4" />
            {t.create}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>

      {links.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          暂无链接
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card border-border max-w-[90%] xl:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text">{t.create}{t.links}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t.linkName}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label>{t.linkUrl}</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label>{t.linkDesc}</Label>
              <Textarea
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                rows={3}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label>{t.linkTags} (逗号分隔)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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
