// 剪辑合成 - 完整联动工作流实现

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import { generate, type EditPlanGenerationResult, type ApiResponse } from '@/lib/aiClient';
import type { Work, EnhancedVideoCardsContent, EnhancedEditPlanContent, EnhancedEditItem } from '@/types';
import ToolLayout from '@/components/layouts/ToolLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Save, FilePlus, Download, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

export default function Editing() {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // 基础设置
  const [sourceVideoCardsId, setSourceVideoCardsId] = useState<string>('');
  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  // 来源镜头卡信息
  const [sourceVideoCards, setSourceVideoCards] = useState<Work | null>(null);

  // 生成参数
  const [pace, setPace] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [targetTotalSec, setTargetTotalSec] = useState(60);
  const [transitionStyle, setTransitionStyle] = useState<'clean' | 'cinematic' | 'dynamic'>('cinematic');
  const [audioStyle, setAudioStyle] = useState<'minimal' | 'rich' | 'dramatic'>('dramatic');
  const [subtitleDensity, setSubtitleDensity] = useState<'low' | 'mid' | 'high'>('mid');
  const [temperature, setTemperature] = useState(0.4);

  // 生成结果
  const [items, setItems] = useState<EnhancedEditItem[]>([]);
  const [generatedContent, setGeneratedContent] = useState<EnhancedEditPlanContent | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取所有镜头卡作品（用于来源选择）
  const allWorks = tableApi.get('works') as Work[] | Work | null;
  const videoCardsWorks = Array.isArray(allWorks)
    ? allWorks
        .filter(w => w.type === 'video_cards' && w.author_id === currentUser?.id)
        .sort((a, b) => b.updated_ms - a.updated_ms)
    : [];

  useEffect(() => {
    document.title = `${t.editPlan} - ${t.appTitle}`;

    // 优先处理open_id（编辑现有作品）
    const openId = searchParams.get('open_id');
    if (openId) {
      loadWork(openId);
      return;
    }

    // 处理source_video_cards_id（从镜头卡生成剪辑清单）
    const videoCardsIdFromQuery = searchParams.get('source_video_cards_id');
    const videoCardsIdFromStorage = localStorage.getItem('last_source_video_cards_id');
    const videoCardsId = videoCardsIdFromQuery || videoCardsIdFromStorage;

    if (videoCardsId) {
      setSourceVideoCardsId(videoCardsId);
      loadSourceVideoCards(videoCardsId);
      // 清除localStorage
      if (videoCardsIdFromStorage) {
        localStorage.removeItem('last_source_video_cards_id');
      }
    }
  }, [t, searchParams]);

  // 加载作品
  const loadWork = (id: string) => {
    const work = tableApi.get('works', id) as Work | null;
    if (work && work.type === 'edit_plan') {
      setCurrentWorkId(id);
      setTitle(work.title);

      // 检查是否为新版结构
      const content = work.content as EnhancedEditPlanContent;
      if (content.items) {
        // 新版结构
        setItems(content.items || []);
        setPace(content.params?.pace || 'normal');
        setTargetTotalSec(content.params?.target_total_sec || 60);
        setTransitionStyle(content.params?.transition_style || 'cinematic');
        setAudioStyle(content.params?.audio_style || 'dramatic');
        setSubtitleDensity(content.params?.subtitle_density || 'mid');
        setTemperature(content.params?.temperature || 0.4);
        setGeneratedContent(content);

        // 如果有来源镜头卡，加载它
        if (content.source?.video_cards_id) {
          setSourceVideoCardsId(content.source.video_cards_id);
          loadSourceVideoCards(content.source.video_cards_id);
        }
      }
    }
  };

  // 加载来源镜头卡
  const loadSourceVideoCards = (videoCardsId: string) => {
    const videoCards = tableApi.get('works', videoCardsId) as Work | null;
    if (videoCards && videoCards.type === 'video_cards') {
      setSourceVideoCards(videoCards);
    }
  };

  // 从来源镜头卡选择
  const handleSourceVideoCardsChange = (videoCardsId: string) => {
    if (videoCardsId === 'none') {
      setSourceVideoCardsId('');
      setSourceVideoCards(null);
      return;
    }
    setSourceVideoCardsId(videoCardsId);
    loadSourceVideoCards(videoCardsId);
  };

  // 剪辑条目管理
  const addItem = () => {
    const newItem: EnhancedEditItem = {
      item_no: items.length + 1,
      shot_ref: 1,
      source_prompt_ref: 1,
      asset_need: '',
      voice_sfx: '',
      transition: 'cut',
      duration_sec: 3,
      caption_subtitle: '',
      notes: ''
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof EnhancedEditItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const updated = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setItems(updated);
  };

  const renumberItems = () => {
    const updated = items.map((item, index) => ({
      ...item,
      item_no: index + 1
    }));
    setItems(updated);
    toast({ title: '重新编号完成' });
  };

  // 生成剪辑清单
  const handleGenerate = async () => {
    if (!currentUser) {
      toast({ title: t.pleaseLogin, variant: 'destructive' });
      return;
    }

    // 验证输入
    if (!sourceVideoCards) {
      toast({ title: '请选择来源镜头卡', variant: 'destructive' });
      return;
    }

    const videoCardsContent = sourceVideoCards.content as EnhancedVideoCardsContent;
    if (!videoCardsContent.cards || videoCardsContent.cards.length === 0) {
      toast({ title: '来源镜头卡没有数据', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      // 组装payload
      const payload = {
        user: {
          id: currentUser.id,
          nickname: currentUser.nickname,
          membership_tier: currentUser.membership_tier
        },
        lang: sourceVideoCards.lang || (language as 'zh' | 'en'),
        genre: videoCardsContent.genre || 'romance',
        source: {
          video_cards_id: sourceVideoCards.id,
          cards: videoCardsContent.cards,
          params_from_video_cards: videoCardsContent.params
        },
        params: {
          pace,
          target_total_sec: targetTotalSec,
          transition_style: transitionStyle,
          audio_style: audioStyle,
          subtitle_density: subtitleDensity,
          temperature
        },
        meta: {
          client: 'aicm-workshop',
          version: 'prototype'
        }
      };

      // 调用AI生成
      const response = await generate('edit_plan', payload) as ApiResponse<EditPlanGenerationResult>;

      if (response.ok && response.data) {
        // 计算总时长
        const totalSec = response.data.items.reduce((sum, item) => sum + item.duration_sec, 0);

        // 构建完整内容结构
        const content: EnhancedEditPlanContent = {
          lang: sourceVideoCards.lang || (language as 'zh' | 'en'),
          genre: videoCardsContent.genre || 'romance',
          source: {
            video_cards_id: sourceVideoCards.id,
            video_cards_title: sourceVideoCards.title,
            card_count: videoCardsContent.cards.length,
            storyboard_id: videoCardsContent.source?.storyboard_id || undefined
          },
          params: {
            pace,
            target_total_sec: targetTotalSec,
            transition_style: transitionStyle,
            audio_style: audioStyle,
            subtitle_density: subtitleDensity,
            temperature
          },
          items: response.data.items,
          totals: {
            total_items: response.data.items.length,
            total_sec: totalSec
          }
        };

        setItems(response.data.items);
        setGeneratedContent(content);
        renumberItems();
        toast({ title: '生成成功！' });
      } else {
        toast({
          title: '生成失败',
          description: response.error?.message || '未知错误',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '生成失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 保存作品
  const handleSave = () => {
    if (!currentUser || !title.trim() || items.length === 0) {
      toast({ title: '请先生成剪辑清单并填写标题', variant: 'destructive' });
      return;
    }

    // 计算总时长
    const totalSec = items.reduce((sum, item) => sum + item.duration_sec, 0);

    // 更新items为当前编辑的内容
    const updatedContent: EnhancedEditPlanContent = generatedContent
      ? {
          ...generatedContent,
          items,
          totals: {
            total_items: items.length,
            total_sec: totalSec
          }
        }
      : {
          lang: sourceVideoCards?.lang || (language as 'zh' | 'en'),
          genre: (sourceVideoCards?.content as EnhancedVideoCardsContent)?.genre || 'romance',
          source: {
            video_cards_id: sourceVideoCards?.id || null,
            video_cards_title: sourceVideoCards?.title || '无来源',
            card_count: (sourceVideoCards?.content as EnhancedVideoCardsContent)?.cards?.length || 0,
            storyboard_id: (sourceVideoCards?.content as EnhancedVideoCardsContent)?.source?.storyboard_id || undefined
          },
          params: {
            pace,
            target_total_sec: targetTotalSec,
            transition_style: transitionStyle,
            audio_style: audioStyle,
            subtitle_density: subtitleDensity,
            temperature
          },
          items,
          totals: {
            total_items: items.length,
            total_sec: totalSec
          }
        };

    if (currentWorkId) {
      // 更新现有作品
      tableApi.patch<Work>('works', currentWorkId, {
        title,
        content: updatedContent,
        updated_ms: Date.now()
      });
      toast({ title: t.saveSuccess });
    } else {
      // 创建新作品
      const newWork: Omit<Work, 'id'> = {
        type: 'edit_plan',
        title,
        content: updatedContent,
        author_id: currentUser.id,
        lang: sourceVideoCards?.lang || (language as 'zh' | 'en'),
        created_ms: Date.now(),
        updated_ms: Date.now()
      };
      const result = tableApi.post<Work>('works', newWork);
      if (result && 'id' in result) {
        setCurrentWorkId(result.id);
      }
      toast({ title: t.saveSuccess });
    }
  };

  // 另存为
  const handleSaveAs = () => {
    if (!currentUser || !title.trim() || items.length === 0) {
      toast({ title: '请先生成剪辑清单并填写标题', variant: 'destructive' });
      return;
    }

    const totalSec = items.reduce((sum, item) => sum + item.duration_sec, 0);

    const updatedContent: EnhancedEditPlanContent = generatedContent
      ? {
          ...generatedContent,
          items,
          totals: {
            total_items: items.length,
            total_sec: totalSec
          }
        }
      : {
          lang: sourceVideoCards?.lang || (language as 'zh' | 'en'),
          genre: (sourceVideoCards?.content as EnhancedVideoCardsContent)?.genre || 'romance',
          source: {
            video_cards_id: sourceVideoCards?.id || null,
            video_cards_title: sourceVideoCards?.title || '无来源',
            card_count: (sourceVideoCards?.content as EnhancedVideoCardsContent)?.cards?.length || 0,
            storyboard_id: (sourceVideoCards?.content as EnhancedVideoCardsContent)?.source?.storyboard_id || undefined
          },
          params: {
            pace,
            target_total_sec: targetTotalSec,
            transition_style: transitionStyle,
            audio_style: audioStyle,
            subtitle_density: subtitleDensity,
            temperature
          },
          items,
          totals: {
            total_items: items.length,
            total_sec: totalSec
          }
        };

    const newWork: Omit<Work, 'id'> = {
      type: 'edit_plan',
      title: title + ' (副本)',
      content: updatedContent,
      author_id: currentUser.id,
      lang: sourceVideoCards?.lang || (language as 'zh' | 'en'),
      created_ms: Date.now(),
      updated_ms: Date.now()
    };
    const result = tableApi.post<Work>('works', newWork);
    if (result && 'id' in result) {
      setCurrentWorkId(result.id);
      setTitle(title + ' (副本)');
    }
    toast({ title: '另存为成功！' });
  };

  // 导出TXT
  const handleExportTXT = () => {
    if (items.length === 0) {
      toast({ title: '没有可导出的内容', variant: 'destructive' });
      return;
    }

    const totalSec = items.reduce((sum, item) => sum + item.duration_sec, 0);
    
    let txt = `# 项目：${title || '未命名'}\n`;
    txt += `# 总时长：${totalSec}s  | 镜头数：${items.length}\n\n`;

    items.forEach(item => {
      txt += `${String(item.item_no).padStart(2, '0')} | ${item.duration_sec}s | ${item.transition}\n`;
      txt += `素材：${item.asset_need}\n`;
      txt += `声音：${item.voice_sfx}\n`;
      txt += `字幕：${item.caption_subtitle}\n`;
      if (item.notes) {
        txt += `备注：${item.notes}\n`;
      }
      txt += '\n';
    });

    // 下载文件
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || '剪辑清单'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: 'TXT导出成功！' });
  };

  // 导出JSON
  const handleExportJSON = () => {
    if (items.length === 0) {
      toast({ title: '没有可导出的内容', variant: 'destructive' });
      return;
    }

    const totalSec = items.reduce((sum, item) => sum + item.duration_sec, 0);

    const content: EnhancedEditPlanContent = generatedContent
      ? {
          ...generatedContent,
          items,
          totals: {
            total_items: items.length,
            total_sec: totalSec
          }
        }
      : {
          lang: sourceVideoCards?.lang || (language as 'zh' | 'en'),
          genre: (sourceVideoCards?.content as EnhancedVideoCardsContent)?.genre || 'romance',
          source: {
            video_cards_id: sourceVideoCards?.id || null,
            video_cards_title: sourceVideoCards?.title || '无来源',
            card_count: (sourceVideoCards?.content as EnhancedVideoCardsContent)?.cards?.length || 0,
            storyboard_id: (sourceVideoCards?.content as EnhancedVideoCardsContent)?.source?.storyboard_id || undefined
          },
          params: {
            pace,
            target_total_sec: targetTotalSec,
            transition_style: transitionStyle,
            audio_style: audioStyle,
            subtitle_density: subtitleDensity,
            temperature
          },
          items,
          totals: {
            total_items: items.length,
            total_sec: totalSec
          }
        };

    // 下载文件
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || '剪辑清单'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: 'JSON导出成功！' });
  };

  // 左栏：来源镜头卡选择
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <Label className="font-semibold text-foreground mb-3 block">来源镜头卡</Label>
        <Select value={sourceVideoCardsId || 'none'} onValueChange={handleSourceVideoCardsChange}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue placeholder="选择镜头卡..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">无</SelectItem>
            {videoCardsWorks.map(work => (
              <SelectItem key={work.id} value={work.id}>{work.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sourceVideoCards && (
        <div className="p-4 bg-muted/50 rounded-lg border-2 border-border">
          <Label className="font-semibold text-foreground mb-2 block">镜头卡信息</Label>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>标题：<span className="text-foreground font-medium">{sourceVideoCards.title}</span></p>
            <p>题材：<span className="text-foreground font-medium">{(sourceVideoCards.content as EnhancedVideoCardsContent).genre}</span></p>
            <p>语言：<span className="text-foreground font-medium">{sourceVideoCards.lang === 'zh' ? '中文' : 'English'}</span></p>
            {(sourceVideoCards.content as EnhancedVideoCardsContent).cards && (
              <p>镜头卡数：<span className="text-primary font-semibold">{(sourceVideoCards.content as EnhancedVideoCardsContent).cards.length}</span></p>
            )}
            {(sourceVideoCards.content as EnhancedVideoCardsContent).source?.storyboard_id && (
              <p>来源分镜：<span className="text-foreground font-medium">{(sourceVideoCards.content as EnhancedVideoCardsContent).source.storyboard_title}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // 中栏：按钮行 + 剪辑清单编辑器
  const centerPanel = (
    <div className="space-y-6">
      {/* 作品标题 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">作品标题</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入作品标题..."
          className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
        />
      </div>

      {/* 按钮行 */}
      <div className="flex gap-3">
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="flex-1 h-12 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            '生成剪辑清单'
          )}
        </Button>
      </div>

      {/* 剪辑清单编辑器 */}
      {items.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="font-semibold text-foreground text-lg">剪辑清单</Label>
            <div className="flex gap-2">
              <Button onClick={renumberItems} size="sm" variant="outline" className="border-2 border-border hover:border-primary/50">
                <RefreshCw className="h-4 w-4 mr-1" />
                重新编号
              </Button>
              <Button onClick={addItem} size="sm" variant="outline" className="border-2 border-border hover:border-primary/50">
                <Plus className="h-4 w-4 mr-1" />
                添加条目
              </Button>
            </div>
          </div>

          {items.map((item, index) => (
            <Card key={index} className="p-6 mb-4 bg-muted/50 border-2 border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="font-semibold text-foreground">条目 {item.item_no}</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => moveItem(index, 'up')} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 block">镜头引用</Label>
                    <Input
                      type="number"
                      value={item.shot_ref}
                      onChange={(e) => updateItem(index, 'shot_ref', parseInt(e.target.value) || 1)}
                      className="bg-background border-2 border-border h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 block">Prompt引用</Label>
                    <Input
                      type="number"
                      value={item.source_prompt_ref}
                      onChange={(e) => updateItem(index, 'source_prompt_ref', parseInt(e.target.value) || 1)}
                      className="bg-background border-2 border-border h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 block">时长（秒）</Label>
                    <Input
                      type="number"
                      value={item.duration_sec}
                      onChange={(e) => updateItem(index, 'duration_sec', parseInt(e.target.value) || 1)}
                      className="bg-background border-2 border-border h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">素材需求</Label>
                  <Textarea
                    value={item.asset_need}
                    onChange={(e) => updateItem(index, 'asset_need', e.target.value)}
                    rows={2}
                    className="bg-background border-2 border-border resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">配音/音效</Label>
                  <Textarea
                    value={item.voice_sfx}
                    onChange={(e) => updateItem(index, 'voice_sfx', e.target.value)}
                    rows={2}
                    className="bg-background border-2 border-border resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">转场</Label>
                  <Input
                    value={item.transition}
                    onChange={(e) => updateItem(index, 'transition', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">字幕要点</Label>
                  <Input
                    value={item.caption_subtitle}
                    onChange={(e) => updateItem(index, 'caption_subtitle', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">备注</Label>
                  <Input
                    value={item.notes}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 操作按钮 */}
      {items.length > 0 && (
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            className="flex-1 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
          >
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
          <Button
            onClick={handleSaveAs}
            variant="outline"
            className="flex-1 h-11 border-2 border-border hover:border-primary/50"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            另存为
          </Button>
          <Button
            onClick={handleExportTXT}
            variant="outline"
            className="flex-1 h-11 border-2 border-border hover:border-primary/50"
          >
            <Download className="h-4 w-4 mr-2" />
            导出TXT
          </Button>
          <Button
            onClick={handleExportJSON}
            variant="outline"
            className="flex-1 h-11 border-2 border-border hover:border-primary/50"
          >
            <Download className="h-4 w-4 mr-2" />
            导出JSON
          </Button>
        </div>
      )}
    </div>
  );

  // 右栏：生成参数
  const rightPanel = (
    <div className="space-y-6">
      {/* 节奏 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">节奏</Label>
        <Select value={pace} onValueChange={(v) => setPace(v as 'slow' | 'normal' | 'fast')}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="slow">慢（舒缓）</SelectItem>
            <SelectItem value="normal">正常</SelectItem>
            <SelectItem value="fast">快（紧凑）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 目标总时长 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">
          目标总时长：{targetTotalSec}秒
        </Label>
        <Slider
          value={[targetTotalSec]}
          onValueChange={(v) => setTargetTotalSec(v[0])}
          min={30}
          max={180}
          step={10}
          className="my-4"
        />
        <p className="text-xs text-muted-foreground">
          30秒 - 180秒
        </p>
      </div>

      {/* 转场风格 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">转场风格</Label>
        <Select value={transitionStyle} onValueChange={(v) => setTransitionStyle(v as 'clean' | 'cinematic' | 'dynamic')}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clean">简洁（cut/fade）</SelectItem>
            <SelectItem value="cinematic">电影感（cut/fade/flash）</SelectItem>
            <SelectItem value="dynamic">动感（cut/whip/flash/glitch）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 音频风格 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">音频风格</Label>
        <Select value={audioStyle} onValueChange={(v) => setAudioStyle(v as 'minimal' | 'rich' | 'dramatic')}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minimal">极简</SelectItem>
            <SelectItem value="rich">丰富</SelectItem>
            <SelectItem value="dramatic">戏剧化</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 字幕密度 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">字幕密度</Label>
        <Select value={subtitleDensity} onValueChange={(v) => setSubtitleDensity(v as 'low' | 'mid' | 'high')}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">低（≤12字）</SelectItem>
            <SelectItem value="mid">中（≤18字）</SelectItem>
            <SelectItem value="high">高（≤26字）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 温度 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">
          创意度：{temperature.toFixed(1)}
        </Label>
        <Slider
          value={[temperature * 100]}
          onValueChange={(v) => setTemperature(v[0] / 100)}
          min={0}
          max={100}
          step={10}
          className="my-4"
        />
        <p className="text-xs text-muted-foreground">
          数值越高，生成内容越有创意
        </p>
      </div>

      {/* 统计信息 */}
      {items.length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg border-2 border-border">
          <Label className="font-semibold text-foreground mb-2 block">统计信息</Label>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>剪辑条目：<span className="text-primary font-semibold">{items.length}</span></p>
            <p>总时长：<span className="text-primary font-semibold">{items.reduce((sum, item) => sum + item.duration_sec, 0)}秒</span></p>
            {sourceVideoCards && (
              <p>来源镜头卡：<span className="text-primary font-semibold">{(sourceVideoCards.content as EnhancedVideoCardsContent).cards?.length || 0}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return <ToolLayout leftPanel={leftPanel} centerPanel={centerPanel} rightPanel={rightPanel} />;
}
