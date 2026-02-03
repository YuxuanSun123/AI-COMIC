// 镜头卡生成器 - 完整联动工作流实现

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import { generate, type VideoCardsGenerationResult, type ApiResponse } from '@/lib/aiClient';
import type { Work, EnhancedStoryboardContent, EnhancedVideoCardsContent, EnhancedVideoCard } from '@/types';
import ToolLayout from '@/components/layouts/ToolLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Save, FilePlus, Film, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

export default function VideoCards() {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 基础设置
  const [sourceStoryboardId, setSourceStoryboardId] = useState<string>('');
  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  // 来源分镜信息
  const [sourceStoryboard, setSourceStoryboard] = useState<Work | null>(null);

  // 生成参数
  const [renderStyle, setRenderStyle] = useState('国漫');
  const [characterConsistency, setCharacterConsistency] = useState<'low' | 'mid' | 'high'>('high');
  const [detailLevel, setDetailLevel] = useState<'low' | 'mid' | 'high'>('high');
  const [cameraEmphasis, setCameraEmphasis] = useState<'weak' | 'mid' | 'strong'>('mid');
  const [temperature, setTemperature] = useState(0.5);

  // 生成结果
  const [cards, setCards] = useState<EnhancedVideoCard[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [generatedContent, setGeneratedContent] = useState<EnhancedVideoCardsContent | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取所有分镜作品（用于来源选择）
  const allWorks = tableApi.get('works') as Work[] | Work | null;
  const storyboardWorks = Array.isArray(allWorks)
    ? allWorks
        .filter(w => w.type === 'storyboard' && w.author_id === currentUser?.id)
        .sort((a, b) => b.updated_ms - a.updated_ms)
    : [];

  useEffect(() => {
    document.title = `${t.videoCards} - ${t.appTitle}`;

    // 优先处理open_id（编辑现有作品）
    const openId = searchParams.get('open_id');
    if (openId) {
      loadWork(openId);
      return;
    }

    // 处理source_storyboard_id（从分镜生成镜头卡）
    const storyboardIdFromQuery = searchParams.get('source_storyboard_id');
    const storyboardIdFromStorage = localStorage.getItem('last_source_storyboard_id');
    const storyboardId = storyboardIdFromQuery || storyboardIdFromStorage;

    if (storyboardId) {
      setSourceStoryboardId(storyboardId);
      loadSourceStoryboard(storyboardId);
      // 清除localStorage
      if (storyboardIdFromStorage) {
        localStorage.removeItem('last_source_storyboard_id');
      }
    }
  }, [t, searchParams]);

  // 加载作品
  const loadWork = (id: string) => {
    const work = tableApi.get('works', id) as Work | null;
    if (work && work.type === 'video_cards') {
      setCurrentWorkId(id);
      setTitle(work.title);

      // 检查是否为新版结构
      const content = work.content as EnhancedVideoCardsContent;
      if (content.cards) {
        // 新版结构
        setCards(content.cards || []);
        setCharacters(content.characters || []);
        setRenderStyle(content.params?.render_style || '国漫');
        setCharacterConsistency(content.params?.character_consistency || 'high');
        setDetailLevel(content.params?.detail_level || 'high');
        setCameraEmphasis(content.params?.camera_emphasis || 'mid');
        setTemperature(content.params?.temperature || 0.5);
        setGeneratedContent(content);

        // 如果有来源分镜，加载它
        if (content.source?.storyboard_id) {
          setSourceStoryboardId(content.source.storyboard_id);
          loadSourceStoryboard(content.source.storyboard_id);
        }
      }
    }
  };

  // 加载来源分镜
  const loadSourceStoryboard = (storyboardId: string) => {
    const storyboard = tableApi.get('works', storyboardId) as Work | null;
    if (storyboard && storyboard.type === 'storyboard') {
      setSourceStoryboard(storyboard);
    }
  };

  // 从来源分镜选择
  const handleSourceStoryboardChange = (storyboardId: string) => {
    if (storyboardId === 'none') {
      setSourceStoryboardId('');
      setSourceStoryboard(null);
      return;
    }
    setSourceStoryboardId(storyboardId);
    loadSourceStoryboard(storyboardId);
  };

  // 角色卡管理
  const updateCharacter = (index: number, field: keyof Character, value: string) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const deleteCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const addCharacter = () => {
    setCharacters([...characters, { name: '新角色', traits: '', relation: '' }]);
  };

  // 镜头卡管理
  const addCard = () => {
    const newCard: EnhancedVideoCard = {
      card_no: cards.length + 1,
      shot_ref: 1,
      visual_desc: '',
      character_action: '',
      lighting_mood: '',
      camera_desc: '',
      dialogue_voiceover: '',
      prompt: '',
      negative_prompt: '',
      notes: ''
    };
    setCards([...cards, newCard]);
  };

  const updateCard = (index: number, field: keyof EnhancedVideoCard, value: string | number) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    setCards(updated);
  };

  const deleteCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const moveCard = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === cards.length - 1) return;

    const updated = [...cards];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setCards(updated);
  };

  const renumberCards = () => {
    const updated = cards.map((card, index) => ({
      ...card,
      card_no: index + 1
    }));
    setCards(updated);
    toast({ title: '重新编号完成' });
  };

  // 重新生成单个卡片的Prompt
  const regeneratePrompt = (index: number) => {
    const card = cards[index];
    const prompt = buildPrompt({
      render_style: renderStyle,
      visual_desc: card.visual_desc,
      character_action: card.character_action,
      lighting_mood: card.lighting_mood,
      camera_desc: card.camera_desc,
      genre: (sourceStoryboard?.content as EnhancedStoryboardContent)?.genre || 'romance',
      character_consistency: characterConsistency,
      detail_level: detailLevel,
      camera_emphasis: cameraEmphasis,
      isZh: language === 'zh'
    });

    const updated = [...cards];
    updated[index] = { ...updated[index], prompt };
    setCards(updated);
    toast({ title: `镜头卡 ${card.card_no} 的Prompt已重新生成` });
  };

  // 生成镜头卡
  const handleGenerate = async () => {
    if (!currentUser) {
      toast({ title: t.pleaseLogin, variant: 'destructive' });
      return;
    }

    // 验证输入
    if (!sourceStoryboard) {
      toast({ title: '请选择来源分镜', variant: 'destructive' });
      return;
    }

    const storyboardContent = sourceStoryboard.content as EnhancedStoryboardContent;
    if (!storyboardContent.shots || storyboardContent.shots.length === 0) {
      toast({ title: '来源分镜没有镜头数据', variant: 'destructive' });
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
        lang: sourceStoryboard.lang || (language as 'zh' | 'en'),
        genre: storyboardContent.genre || 'romance',
        source: {
          storyboard_id: sourceStoryboard.id,
          shots: storyboardContent.shots
        },
        params: {
          render_style: renderStyle,
          character_consistency: characterConsistency,
          detail_level: detailLevel,
          camera_emphasis: cameraEmphasis,
          temperature
        },
        meta: {
          client: 'aicm-workshop',
          version: 'prototype'
        }
      };

      // 调用AI生成
      const response = await generate('video_cards', payload) as ApiResponse<VideoCardsGenerationResult>;

      if (response.ok && response.data) {
        // 构建完整内容结构
        const content: EnhancedVideoCardsContent = {
          lang: sourceStoryboard.lang || (language as 'zh' | 'en'),
          genre: storyboardContent.genre || 'romance',
          source: {
            storyboard_id: sourceStoryboard.id,
            storyboard_title: sourceStoryboard.title,
            shot_count: storyboardContent.shots.length
          },
          params: {
            render_style: renderStyle,
            character_consistency: characterConsistency,
            detail_level: detailLevel,
            camera_emphasis: cameraEmphasis,
            temperature
          },
          cards: response.data.cards,
          characters: response.data.characters,
          updated_from: {
            source_video_cards_id: null
          }
        };

        setCards(response.data.cards);
        setCharacters(response.data.characters || []);
        // 不依赖 setCharacters，这里仅落地内容
        setGeneratedContent(content);
        renumberCards();
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
    if (!currentUser || !title.trim() || cards.length === 0) {
      toast({ title: '请先生成镜头卡并填写标题', variant: 'destructive' });
      return;
    }

    // 更新cards为当前编辑的内容
    const updatedContent: EnhancedVideoCardsContent = generatedContent
      ? {
          ...generatedContent,
          cards,
          characters
        }
      : {
          lang: sourceStoryboard?.lang || (language as 'zh' | 'en'),
          genre: (sourceStoryboard?.content as EnhancedStoryboardContent)?.genre || 'romance',
          source: {
            storyboard_id: sourceStoryboard?.id || null,
            storyboard_title: sourceStoryboard?.title || '无来源',
            shot_count: (sourceStoryboard?.content as EnhancedStoryboardContent)?.shots?.length || 0
          },
          params: {
            render_style: renderStyle,
            character_consistency: characterConsistency,
            detail_level: detailLevel,
            camera_emphasis: cameraEmphasis,
            temperature
          },
          cards,
          characters,
          updated_from: {
            source_video_cards_id: null
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
        type: 'video_cards',
        title,
        content: updatedContent,
        author_id: currentUser.id,
        lang: sourceStoryboard?.lang || (language as 'zh' | 'en'),
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
    if (!currentUser || !title.trim() || cards.length === 0) {
      toast({ title: '请先生成镜头卡并填写标题', variant: 'destructive' });
      return;
    }

    const updatedContent: EnhancedVideoCardsContent = generatedContent
      ? {
          ...generatedContent,
          cards,
          characters
        }
      : {
          lang: sourceStoryboard?.lang || (language as 'zh' | 'en'),
          genre: (sourceStoryboard?.content as EnhancedStoryboardContent)?.genre || 'romance',
          source: {
            storyboard_id: sourceStoryboard?.id || null,
            storyboard_title: sourceStoryboard?.title || '无来源',
            shot_count: (sourceStoryboard?.content as EnhancedStoryboardContent)?.shots?.length || 0
          },
          params: {
            render_style: renderStyle,
            character_consistency: characterConsistency,
            detail_level: detailLevel,
            camera_emphasis: cameraEmphasis,
            temperature
          },
          cards,
          characters,
          updated_from: {
            source_video_cards_id: null
          }
        };

    const newWork: Omit<Work, 'id'> = {
      type: 'video_cards',
      title: title + ' (副本)',
      content: updatedContent,
      author_id: currentUser.id,
      lang: sourceStoryboard?.lang || (language as 'zh' | 'en'),
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

  // 生成剪辑清单
  const handleGenerateEditPlan = () => {
    if (!currentWorkId) {
      toast({ title: '请先保存镜头卡', variant: 'destructive' });
      return;
    }

    // 使用localStorage传递source_video_cards_id
    localStorage.setItem('last_source_video_cards_id', currentWorkId);
    navigate('/tools/edit');
    toast({ title: '正在跳转到剪辑合成...' });
  };

  // 渲染风格选项
  const renderStyles = language === 'zh'
    ? ['国漫', '写实', '二次元', '赛博', '水墨']
    : ['Chinese Animation', 'Realistic', 'Anime', 'Cyberpunk', 'Ink Painting'];

  // 左栏：来源分镜选择
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <Label className="font-semibold text-foreground mb-3 block">来源分镜</Label>
        <Select value={sourceStoryboardId || 'none'} onValueChange={handleSourceStoryboardChange}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue placeholder="选择分镜..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">无</SelectItem>
            {storyboardWorks.map(work => (
              <SelectItem key={work.id} value={work.id}>{work.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sourceStoryboard && (
        <div className="p-4 bg-muted/50 rounded-lg border-2 border-border">
          <Label className="font-semibold text-foreground mb-2 block">分镜信息</Label>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>标题：<span className="text-foreground font-medium">{sourceStoryboard.title}</span></p>
            <p>题材：<span className="text-foreground font-medium">{(sourceStoryboard.content as EnhancedStoryboardContent).genre}</span></p>
            <p>语言：<span className="text-foreground font-medium">{sourceStoryboard.lang === 'zh' ? '中文' : 'English'}</span></p>
            {(sourceStoryboard.content as EnhancedStoryboardContent).shots && (
              <p>镜头数：<span className="text-primary font-semibold">{(sourceStoryboard.content as EnhancedStoryboardContent).shots.length}</span></p>
            )}
            {(sourceStoryboard.content as EnhancedStoryboardContent).source?.script_id && (
              <p>来源剧本：<span className="text-foreground font-medium">{(sourceStoryboard.content as EnhancedStoryboardContent).source.script_title}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // 中栏：按钮行 + 镜头卡列表编辑器
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
            '生成镜头卡'
          )}
        </Button>
      </div>

      {/* 镜头卡列表编辑器 */}
      {cards.length > 0 && (
        <div>
          {/* 角色卡列表 */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <Label className="font-semibold text-foreground text-lg">角色卡列表</Label>
              <Button onClick={addCharacter} size="sm" variant="outline" className="border-2 border-border hover:border-primary/50">
                <Plus className="h-4 w-4 mr-1" />
                添加角色
              </Button>
            </div>

            {characters.length === 0 ? (
              <div className="text-center p-4 bg-muted/30 rounded-lg border-2 border-dashed border-border/50 text-muted-foreground">
                暂无角色信息，请手动添加或等待生成
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((char, index) => (
                  <Card key={index} className="p-4 bg-primary/5 border-2 border-primary/20 relative group">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                      onClick={() => deleteCharacter(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground mb-1 block">角色名</Label>
                        <Input
                          value={char.name}
                          onChange={(e) => updateCharacter(index, 'name', e.target.value)}
                          className="bg-background/80 border-primary/30 h-8 font-semibold"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground mb-1 block">性格特征</Label>
                        <Textarea
                          value={char.traits}
                          onChange={(e) => updateCharacter(index, 'traits', e.target.value)}
                          className="bg-background/80 border-primary/30 min-h-[3rem] text-sm resize-none"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground mb-1 block">身份/关系</Label>
                        <Input
                          value={char.relation}
                          onChange={(e) => updateCharacter(index, 'relation', e.target.value)}
                          className="bg-background/80 border-primary/30 h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground mb-1 block">外貌特征</Label>
                        <Textarea
                          value={char.appearance || ''}
                          onChange={(e) => updateCharacter(index, 'appearance', e.target.value)}
                          className="bg-background/80 border-primary/30 min-h-[3rem] text-sm resize-none"
                          rows={2}
                          placeholder="例如：高大魁梧，黑色短发..."
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground mb-1 block">经历/背景</Label>
                        <Textarea
                          value={char.experience || ''}
                          onChange={(e) => updateCharacter(index, 'experience', e.target.value)}
                          className="bg-background/80 border-primary/30 min-h-[3rem] text-sm resize-none"
                          rows={2}
                          placeholder="例如：退役军人，曾参加过..."
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mb-3">
            <Label className="font-semibold text-foreground text-lg">镜头卡列表</Label>
            <div className="flex gap-2">
              <Button onClick={renumberCards} size="sm" variant="outline" className="border-2 border-border hover:border-primary/50">
                <RefreshCw className="h-4 w-4 mr-1" />
                重新编号
              </Button>
              <Button onClick={addCard} size="sm" variant="outline" className="border-2 border-border hover:border-primary/50">
                <Plus className="h-4 w-4 mr-1" />
                添加镜头卡
              </Button>
            </div>
          </div>

          {cards.map((card, index) => (
            <Card key={index} className="p-6 mb-4 bg-muted/50 border-2 border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="font-semibold text-foreground">镜头卡 {card.card_no}</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => moveCard(index, 'up')} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => moveCard(index, 'down')} disabled={index === cards.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteCard(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 block">镜头引用</Label>
                    <Input
                      type="number"
                      value={card.shot_ref}
                      onChange={(e) => updateCard(index, 'shot_ref', parseInt(e.target.value) || 1)}
                      className="bg-background border-2 border-border h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">画面描述（偏视觉）</Label>
                  <Textarea
                    value={card.visual_desc}
                    onChange={(e) => updateCard(index, 'visual_desc', e.target.value)}
                    rows={2}
                    className="bg-background border-2 border-border resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">人物与动作</Label>
                  <Input
                    value={card.character_action}
                    onChange={(e) => updateCard(index, 'character_action', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">光影/氛围/情绪</Label>
                  <Input
                    value={card.lighting_mood}
                    onChange={(e) => updateCard(index, 'lighting_mood', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">机位与运动</Label>
                  <Input
                    value={card.camera_desc}
                    onChange={(e) => updateCard(index, 'camera_desc', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">对白/旁白</Label>
                  <Textarea
                    value={card.dialogue_voiceover}
                    onChange={(e) => updateCard(index, 'dialogue_voiceover', e.target.value)}
                    rows={2}
                    className="bg-background border-2 border-border resize-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm text-muted-foreground">AI Prompt（可手动编辑）</Label>
                    <Button size="sm" variant="ghost" onClick={() => regeneratePrompt(index)}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      重新生成
                    </Button>
                  </div>
                  <Textarea
                    value={card.prompt}
                    onChange={(e) => updateCard(index, 'prompt', e.target.value)}
                    rows={4}
                    className="bg-background border-2 border-border resize-none font-mono text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">Negative Prompt（可选）</Label>
                  <Textarea
                    value={card.negative_prompt}
                    onChange={(e) => updateCard(index, 'negative_prompt', e.target.value)}
                    rows={2}
                    className="bg-background border-2 border-border resize-none font-mono text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">备注</Label>
                  <Input
                    value={card.notes}
                    onChange={(e) => updateCard(index, 'notes', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 操作按钮 */}
      {cards.length > 0 && (
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
            onClick={handleGenerateEditPlan}
            variant="outline"
            className="flex-1 h-11 border-2 border-border hover:border-primary/50"
          >
            <Film className="h-4 w-4 mr-2" />
            生成剪辑清单
          </Button>
        </div>
      )}
    </div>
  );

  // 右栏：Prompt生成参数
  const rightPanel = (
    <div className="space-y-6">
      {/* 渲染风格 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">渲染风格</Label>
        <Select value={renderStyle} onValueChange={setRenderStyle}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {renderStyles.map(style => (
              <SelectItem key={style} value={style}>{style}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 角色一致性 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">角色一致性</Label>
        <Select value={characterConsistency} onValueChange={(v) => setCharacterConsistency(v as 'low' | 'mid' | 'high')}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">低</SelectItem>
            <SelectItem value="mid">中</SelectItem>
            <SelectItem value="high">高</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 细节级别 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">细节级别</Label>
        <Select value={detailLevel} onValueChange={(v) => setDetailLevel(v as 'low' | 'mid' | 'high')}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">低</SelectItem>
            <SelectItem value="mid">中</SelectItem>
            <SelectItem value="high">高</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 镜头强调 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">镜头强调</Label>
        <Select value={cameraEmphasis} onValueChange={(v) => setCameraEmphasis(v as 'weak' | 'mid' | 'strong')}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weak">弱</SelectItem>
            <SelectItem value="mid">中</SelectItem>
            <SelectItem value="strong">强</SelectItem>
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
      {cards.length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg border-2 border-border">
          <Label className="font-semibold text-foreground mb-2 block">统计信息</Label>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>镜头卡数：<span className="text-primary font-semibold">{cards.length}</span></p>
            {sourceStoryboard && (
              <p>来源镜头：<span className="text-primary font-semibold">{(sourceStoryboard.content as EnhancedStoryboardContent).shots?.length || 0}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return <ToolLayout leftPanel={leftPanel} centerPanel={centerPanel} rightPanel={rightPanel} />;
}

/**
 * 构建Prompt（核心逻辑）
 */
function buildPrompt(options: {
  render_style: string;
  visual_desc: string;
  character_action: string;
  lighting_mood: string;
  camera_desc: string;
  genre: string;
  character_consistency: string;
  detail_level: string;
  camera_emphasis: string;
  isZh: boolean;
}): string {
  const {
    render_style,
    visual_desc,
    character_action,
    lighting_mood,
    camera_desc,
    genre,
    character_consistency,
    detail_level,
    camera_emphasis,
    isZh
  } = options;

  const parts: string[] = [];

  // 1. 渲染风格
  if (render_style) parts.push(render_style);

  // 2. 画面描述
  if (visual_desc) parts.push(visual_desc);

  // 3. 角色动作
  if (character_action && character_action !== '（无）' && character_action !== '(None)') {
    parts.push(character_action);
  }

  // 4. 光影氛围
  if (lighting_mood) parts.push(lighting_mood);

  // 5. 机位描述（根据camera_emphasis决定是否强调）
  if ((camera_emphasis === 'strong' || camera_emphasis === 'mid') && camera_desc) {
    parts.push(camera_desc);
  }

  // 6. 情绪氛围（根据题材推断）
  const emotion = inferEmotion(genre, isZh);
  if (emotion) parts.push(emotion);

  // 7. 通用质量词
  if (isZh) {
    parts.push('高质量');
    parts.push('电影级构图');
  } else {
    parts.push('high quality');
    parts.push('cinematic composition');
  }

  // 8. 角色一致性提示
  if (character_consistency === 'high') {
    if (isZh) {
      parts.push('角色形象高度一致');
    } else {
      parts.push('consistent character design');
      parts.push('same character appearance');
    }
  }

  // 9. 细节级别提示
  if (detail_level === 'high') {
    if (isZh) {
      parts.push('细节丰富');
      parts.push('精致画面');
    } else {
      parts.push('highly detailed');
      parts.push('intricate details');
    }
  } else if (detail_level === 'mid') {
    if (isZh) {
      parts.push('适度细节');
    } else {
      parts.push('moderate detail');
    }
  }

  // 拼接
  if (isZh) {
    return parts.join('，');
  } else {
    return parts.join(', ');
  }
}

/**
 * 根据题材推断情绪氛围
 */
function inferEmotion(genre: string, isZh: boolean): string {
  if (isZh) {
    const emotionMap: Record<string, string> = {
      romance: '浪漫温馨氛围',
      scifi: '科幻未来感',
      mystery: '紧张悬疑氛围',
      thriller: '惊悚紧张氛围',
      campus: '青春活力氛围',
      family: '温馨家庭氛围'
    };
    return emotionMap[genre] || '平衡氛围';
  } else {
    const emotionMap: Record<string, string> = {
      romance: 'romantic warm atmosphere',
      scifi: 'sci-fi futuristic feel',
      mystery: 'tense mysterious atmosphere',
      thriller: 'thrilling tense atmosphere',
      campus: 'youthful energetic atmosphere',
      family: 'warm family atmosphere'
    };
    return emotionMap[genre] || 'balanced atmosphere';
  }
}
