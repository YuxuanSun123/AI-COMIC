// 创作工坊 - 作品管理中心

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import type { Work, WorkType } from '@/types';
import WorkCard from '@/components/common/WorkCard';
// import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Studio() {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [works, setWorks] = useState<Work[]>([]);
  const [filterType, setFilterType] = useState<WorkType | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Work | null>(null);

  useEffect(() => {
    document.title = `${t.creativeWorkshop} - ${t.appTitle}`;
    loadWorks();
  }, [t]);

  const loadWorks = () => {
    const data = tableApi.get<Work>('works') as Work[];
    // 只显示当前用户的作品
    const userWorks = currentUser
      ? data.filter(w => w.author_id === currentUser.id)
      : [];
    setWorks(userWorks.sort((a, b) => b.updated_ms - a.updated_ms));
  };

  const filteredWorks = filterType === 'all'
    ? works
    : works.filter(w => w.type === filterType);

  const handleOpen = (work: Work) => {
    const pathMap: Record<WorkType, string> = {
      script: '/tools/script',
      storyboard: '/tools/storyboard',
      video_cards: '/tools/storyboard',
      edit_plan: '/tools/edit'
    };
    navigate(`${pathMap[work.type]}?id=${work.id}`);
  };

  const handleDelete = (work: Work) => {
    setDeleteTarget(work);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    const result = tableApi.delete('works', deleteTarget.id);

    if (result === true) {
      toast({
        title: t.deleteSuccess
      });
      loadWorks();
    } else {
      toast({
        title: t.operationFailed,
        description: result.message,
        variant: 'destructive'
      });
    }

    setDeleteTarget(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 space-y-4 xl:space-y-0">
        <h1 className="text-3xl font-bold gradient-text">{t.myWorks}</h1>
        <Select value={filterType} onValueChange={(value) => setFilterType(value as WorkType | 'all')}>
          <SelectTrigger className="w-[200px] bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="script">{t.scriptGenerator}</SelectItem>
            <SelectItem value="storyboard">{t.storyboardGenerator}</SelectItem>
            <SelectItem value="video_cards">{t.videoCards}</SelectItem>
            <SelectItem value="edit_plan">{t.editing}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!currentUser ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t.pleaseLogin}</p>
        </div>
      ) : filteredWorks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          暂无作品
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {filteredWorks.map((work) => (
            <WorkCard
              key={work.id}
              work={work}
              onOpen={handleOpen}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t.deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
