// 分镜生成器 - 完整联动工作流实现

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import { generateStoryboard } from '@/lib/aiClient';
import type { Work, EnhancedScriptContent, EnhancedStoryboardContent, EnhancedShot } from '@/types';
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

export default function StoryboardGenerator() {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 基础设置
  const [sourceScriptId, setSourceScriptId] = useState<string>('');
  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  // 来源剧本信息
  const [sourceScript, setSourceScript] = useState<Work | null>(null);
  const [fallbackText, setFallbackText] = useState('');

  // 生成参数
  const [shotDensity, setShotDensity] = useState<'sparse' | 'standard' | 'dense'>('standard');
  const [visualStyle, setVisualStyle] = useState('国漫');
  const [cameraVariety, setCameraVariety] = useState<'low' | 'mid' | 'high'>('mid');
  const [temperature, setTemperature] = useState(0.6);
  const [maxShots, setMaxShots] = useState(30);

  // 生成结果
  const [shots, setShots] = useState<EnhancedShot[]>([]);
  const [generatedContent, setGeneratedContent] = useState<EnhancedStoryboardContent | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取所有剧本作品（用于来源选择）
  const allWorks = tableApi.get('works') as Work[] | Work | null;
  const scriptWorks = Array.isArray(allWorks)
    ? allWorks
        .filter(w => w.type === 'script' && w.author_id === currentUser?.id)
        .sort((a, b) => b.updated_ms - a.updated_ms)
    : [];

  useEffect(() => {
    document.title = `${t.storyboardGenerator} - ${t.appTitle}`;

    // 优先处理open_id（编辑现有作品）
    const openId = searchParams.get('open_id');
    if (openId) {
      loadWork(openId);
      return;
    }

    // 处理source_script_id（从剧本生成分镜）
    const scriptIdFromQuery = searchParams.get('source_script_id');
    const scriptIdFromStorage = localStorage.getItem('last_source_script_id');
    const scriptId = scriptIdFromQuery || scriptIdFromStorage;

    if (scriptId) {
      setSourceScriptId(scriptId);
      loadSourceScript(scriptId);
      // 清除localStorage
      if (scriptIdFromStorage) {
        localStorage.removeItem('last_source_script_id');
      }
    }
  }, [t, searchParams]);

  // 加载作品
  const loadWork = (id: string) => {
    const work = tableApi.get('works', id) as Work | null;
    if (work && work.type === 'storyboard') {
      setCurrentWorkId(id);
      setTitle(work.title);

      // 检查是否为新版结构
      const content = work.content as EnhancedStoryboardContent;
      if (content.shots) {
        // 新版结构
        setShots(content.shots || []);
        setShotDensity(content.params?.shot_density || 'standard');
        setVisualStyle(content.params?.visual_style || '国漫');
        setCameraVariety(content.params?.camera_variety || 'mid');
        setTemperature(content.params?.temperature || 0.6);
        setMaxShots(content.params?.max_shots || 30);
        setGeneratedContent(content);

        // 如果有来源剧本，加载它
        if (content.source?.script_id) {
          setSourceScriptId(content.source.script_id);
          loadSourceScript(content.source.script_id);
        }
      }
    }
  };

  // 加载来源剧本
  const loadSourceScript = (scriptId: string) => {
    const script = tableApi.get('works', scriptId) as Work | null;
    if (script && script.type === 'script') {
      setSourceScript(script);
    }
  };

  // 从来源剧本选择
  const handleSourceScriptChange = (scriptId: string) => {
    if (scriptId === 'none') {
      setSourceScriptId('');
      setSourceScript(null);
      return;
    }
    setSourceScriptId(scriptId);
    loadSourceScript(scriptId);
  };

  // 镜头管理
  const addShot = () => {
    const newShot: EnhancedShot = {
      shot_no: shots.length + 1,
      scene_ref: 1,
      frame: '',
      action: '',
      camera: '',
      dialogue: '',
      duration_sec: 4,
      notes: ''
    };
    setShots([...shots, newShot]);
  };

  const updateShot = (index: number, field: keyof EnhancedShot, value: string | number) => {
    const updated = [...shots];
    updated[index] = { ...updated[index], [field]: value };
    setShots(updated);
  };

  const deleteShot = (index: number) => {
    setShots(shots.filter((_, i) => i !== index));
  };

  const moveShot = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === shots.length - 1) return;

    const updated = [...shots];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setShots(updated);
  };

  const renumberShots = () => {
    const updated = shots.map((shot, index) => ({
      ...shot,
      shot_no: index + 1
    }));
    setShots(updated);
    toast({ title: '重新编号完成' });
  };

  // 生成分镜
  const handleGenerate = async () => {
    if (!currentUser) {
      toast({ title: t.pleaseLogin, variant: 'destructive' });
      return;
    }

    // 验证输入
    if (!sourceScript && !fallbackText.trim()) {
      toast({ title: '请选择来源剧本或粘贴剧本片段', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      // 组装payload
      const scriptContent = sourceScript?.content as EnhancedScriptContent;
      const payload = {
        user: {
          id: currentUser.id,
          nickname: currentUser.nickname,
          membership_tier: currentUser.membership_tier
        },
        lang: sourceScript?.lang || (language as 'zh' | 'en'),
        genre: scriptContent?.genre || 'romance',
        source: {
          script_id: sourceScript?.id || null,
          script_title: sourceScript?.title || '无来源',
          scenes: scriptContent?.scenes,
          script_text: scriptContent?.script_text
        },
        fallback_text: fallbackText,
        params: {
          shot_density: shotDensity,
          visual_style: visualStyle,
          camera_variety: cameraVariety,
          temperature,
          max_shots: maxShots
        },
        meta: {
          client: 'aicm-workshop',
          version: 'prototype'
        }
      };

      // 调用AI生成
      const response = await generateStoryboard(payload);

      if (response.ok && response.data) {
        // 构建完整内容结构
        const content: EnhancedStoryboardContent = {
          lang: sourceScript?.lang || (language as 'zh' | 'en'),
          genre: scriptContent?.genre || 'romance',
          source: {
            script_id: sourceScript?.id || null,
            script_title: sourceScript?.title || '无来源',
            script_updated_ms: sourceScript?.updated_ms || Date.now()
          },
          params: {
            shot_density: shotDensity,
            visual_style: visualStyle,
            camera_variety: cameraVariety,
            temperature,
            max_shots: maxShots
          },
          shots: response.data.shots,
          updated_from: {
            source_storyboard_id: null
          }
        };

        setShots(response.data.shots);
        setGeneratedContent(content);
        renumberShots();
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
    if (!currentUser || !title.trim() || shots.length === 0) {
      toast({ title: '请先生成分镜并填写标题', variant: 'destructive' });
      return;
    }

    // 更新shots为当前编辑的内容
    const updatedContent: EnhancedStoryboardContent = generatedContent
      ? {
          ...generatedContent,
          shots
        }
      : {
          lang: sourceScript?.lang || (language as 'zh' | 'en'),
          genre: (sourceScript?.content as EnhancedScriptContent)?.genre || 'romance',
          source: {
            script_id: sourceScript?.id || null,
            script_title: sourceScript?.title || '无来源',
            script_updated_ms: sourceScript?.updated_ms || Date.now()
          },
          params: {
            shot_density: shotDensity,
            visual_style: visualStyle,
            camera_variety: cameraVariety,
            temperature,
            max_shots: maxShots
          },
          shots,
          updated_from: {
            source_storyboard_id: null
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
        type: 'storyboard',
        title,
        content: updatedContent,
        author_id: currentUser.id,
        lang: sourceScript?.lang || (language as 'zh' | 'en'),
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
    if (!currentUser || !title.trim() || shots.length === 0) {
      toast({ title: '请先生成分镜并填写标题', variant: 'destructive' });
      return;
    }

    const updatedContent: EnhancedStoryboardContent = generatedContent
      ? {
          ...generatedContent,
          shots
        }
      : {
          lang: sourceScript?.lang || (language as 'zh' | 'en'),
          genre: (sourceScript?.content as EnhancedScriptContent)?.genre || 'romance',
          source: {
            script_id: sourceScript?.id || null,
            script_title: sourceScript?.title || '无来源',
            script_updated_ms: sourceScript?.updated_ms || Date.now()
          },
          params: {
            shot_density: shotDensity,
            visual_style: visualStyle,
            camera_variety: cameraVariety,
            temperature,
            max_shots: maxShots
          },
          shots,
          updated_from: {
            source_storyboard_id: null
          }
        };

    const newWork: Omit<Work, 'id'> = {
      type: 'storyboard',
      title: title + ' (副本)',
      content: updatedContent,
      author_id: currentUser.id,
      lang: sourceScript?.lang || (language as 'zh' | 'en'),
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

  // 生成镜头卡
  const handleGenerateVideoCards = () => {
    if (!currentWorkId) {
      toast({ title: '请先保存分镜', variant: 'destructive' });
      return;
    }

    // 使用localStorage传递source_storyboard_id
    localStorage.setItem('last_source_storyboard_id', currentWorkId);
    navigate('/tools/video');
    toast({ title: '正在跳转到镜头卡生成器...' });
  };

  // 视觉风格选项
  const visualStyles = language === 'zh'
    ? ['国漫', '赛博', '写实', '轻松']
    : ['Chinese Style', 'Cyberpunk', 'Realistic', 'Casual'];

  // 左栏：来源剧本选择
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <Label className="font-semibold text-foreground mb-3 block">来源剧本</Label>
        <Select value={sourceScriptId || 'none'} onValueChange={handleSourceScriptChange}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue placeholder="选择剧本..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">无</SelectItem>
            {scriptWorks.map(work => (
              <SelectItem key={work.id} value={work.id}>{work.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sourceScript && (
        <div className="p-4 bg-muted/50 rounded-lg border-2 border-border">
          <Label className="font-semibold text-foreground mb-2 block">剧本信息</Label>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>标题：<span className="text-foreground font-medium">{sourceScript.title}</span></p>
            <p>题材：<span className="text-foreground font-medium">{(sourceScript.content as EnhancedScriptContent).genre}</span></p>
            <p>语言：<span className="text-foreground font-medium">{sourceScript.lang === 'zh' ? '中文' : 'English'}</span></p>
            <p>更新：<span className="text-foreground font-medium">{new Date(sourceScript.updated_ms).toLocaleDateString()}</span></p>
            {(sourceScript.content as EnhancedScriptContent).scenes && (
              <p>场景数：<span className="text-primary font-semibold">{(sourceScript.content as EnhancedScriptContent).scenes.length}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // 中栏：输入区 + 按钮行 + 分镜列表编辑器
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

      {/* 输入区 */}
      {sourceScript ? (
        <div>
          <Label className="font-semibold text-foreground mb-3 block">剧本预览（只读）</Label>
          <Textarea
            value={(sourceScript.content as EnhancedScriptContent).script_text?.substring(0, 500) + '...'}
            readOnly
            rows={6}
            className="bg-muted/30 border-2 border-border text-sm font-mono resize-none"
          />
        </div>
      ) : (
        <div>
          <Label className="font-semibold text-foreground mb-3 block">剧本片段（可选）</Label>
          <Textarea
            value={fallbackText}
            onChange={(e) => setFallbackText(e.target.value)}
            placeholder="如果没有选择来源剧本，可以在此粘贴剧本片段..."
            rows={6}
            className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors resize-none"
          />
        </div>
      )}

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
            '生成分镜'
          )}
        </Button>
      </div>

      {/* 分镜列表编辑器 */}
      {shots.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="font-semibold text-foreground text-lg">分镜列表</Label>
            <div className="flex gap-2">
              <Button onClick={renumberShots} size="sm" variant="outline" className="border-2 border-border hover:border-primary/50">
                <RefreshCw className="h-4 w-4 mr-1" />
                重新编号
              </Button>
              <Button onClick={addShot} size="sm" variant="outline" className="border-2 border-border hover:border-primary/50">
                <Plus className="h-4 w-4 mr-1" />
                添加镜头
              </Button>
            </div>
          </div>

          {shots.map((shot, index) => (
            <Card key={index} className="p-6 mb-4 bg-muted/50 border-2 border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="font-semibold text-foreground">镜头 {shot.shot_no}</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => moveShot(index, 'up')} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => moveShot(index, 'down')} disabled={index === shots.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteShot(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 block">场景引用</Label>
                    <Input
                      type="number"
                      value={shot.scene_ref}
                      onChange={(e) => updateShot(index, 'scene_ref', parseInt(e.target.value) || 1)}
                      className="bg-background border-2 border-border h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 block">时长（秒）</Label>
                    <Input
                      type="number"
                      value={shot.duration_sec}
                      onChange={(e) => updateShot(index, 'duration_sec', parseInt(e.target.value) || 4)}
                      className="bg-background border-2 border-border h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">画面描述</Label>
                  <Textarea
                    value={shot.frame}
                    onChange={(e) => updateShot(index, 'frame', e.target.value)}
                    rows={2}
                    className="bg-background border-2 border-border resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">动作</Label>
                  <Input
                    value={shot.action}
                    onChange={(e) => updateShot(index, 'action', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">机位/焦段/运动</Label>
                  <Input
                    value={shot.camera}
                    onChange={(e) => updateShot(index, 'camera', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">对白/旁白</Label>
                  <Textarea
                    value={shot.dialogue}
                    onChange={(e) => updateShot(index, 'dialogue', e.target.value)}
                    rows={2}
                    className="bg-background border-2 border-border resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">备注</Label>
                  <Input
                    value={shot.notes}
                    onChange={(e) => updateShot(index, 'notes', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 操作按钮 */}
      {shots.length > 0 && (
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
            onClick={handleGenerateVideoCards}
            variant="outline"
            className="flex-1 h-11 border-2 border-border hover:border-primary/50"
          >
            <Film className="h-4 w-4 mr-2" />
            生成镜头卡
          </Button>
        </div>
      )}
    </div>
  );

  // 右栏：参数面板
  const rightPanel = (
    <div className="space-y-6">
      {/* 镜头密度 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">镜头密度</Label>
        <Select value={shotDensity} onValueChange={(v) => setShotDensity(v as 'sparse' | 'standard' | 'dense')}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sparse">稀疏（每场景3镜头）</SelectItem>
            <SelectItem value="standard">标准（每场景4镜头）</SelectItem>
            <SelectItem value="dense">密集（每场景6镜头）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 视觉风格 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">视觉风格</Label>
        <Select value={visualStyle} onValueChange={setVisualStyle}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {visualStyles.map(style => (
              <SelectItem key={style} value={style}>{style}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 镜头多样性 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">镜头多样性</Label>
        <Select value={cameraVariety} onValueChange={(v) => setCameraVariety(v as 'low' | 'mid' | 'high')}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">低（固定机位）</SelectItem>
            <SelectItem value="mid">中（常规变化）</SelectItem>
            <SelectItem value="high">高（丰富多样）</SelectItem>
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

      {/* 最大镜头数 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">
          最大镜头数：{maxShots}
        </Label>
        <Slider
          value={[maxShots]}
          onValueChange={(v) => setMaxShots(v[0])}
          min={10}
          max={50}
          step={5}
          className="my-4"
        />
        <p className="text-xs text-muted-foreground">
          限制生成的总镜头数量
        </p>
      </div>

      {/* 统计信息 */}
      {shots.length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg border-2 border-border">
          <Label className="font-semibold text-foreground mb-2 block">统计信息</Label>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>镜头数：<span className="text-primary font-semibold">{shots.length}</span></p>
            <p>总时长：<span className="text-primary font-semibold">{shots.reduce((sum, s) => sum + s.duration_sec, 0)}秒</span></p>
            {sourceScript && (
              <p>来源场景：<span className="text-primary font-semibold">{(sourceScript.content as EnhancedScriptContent).scenes?.length || 0}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return <ToolLayout leftPanel={leftPanel} centerPanel={centerPanel} rightPanel={rightPanel} />;
}
