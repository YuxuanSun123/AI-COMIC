// 剧本生成器 - 完整工作流实现

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import { generate, type ScriptGenerationResult, type ApiResponse } from '@/lib/aiClient';
import type { Work, EnhancedScriptContent, Character } from '@/types';
import ToolLayout from '@/components/layouts/ToolLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Save, FilePlus, Film } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";

// 本地扩展类型，用于UI动画的唯一ID
interface UiCharacter extends Character {
  _ui_id: string;
}

// 简单的ID生成器
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export default function ScriptGenerator() {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 基础设置
  const [genre, setGenre] = useState('romance');
  const [selectedLang, setSelectedLang] = useState<'zh' | 'en'>(language as 'zh' | 'en');
  const [sourceWorkId, setSourceWorkId] = useState<string>('');
  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);

  // 作者输入
  const [title, setTitle] = useState('');
  const [logline, setLogline] = useState('');
  const [world, setWorld] = useState('');
  const [characters, setCharacters] = useState<UiCharacter[]>([]);
  const [constraints, setConstraints] = useState('');

  // 生成参数
  const [lengthLevel, setLengthLevel] = useState<'short' | 'mid' | 'long'>('mid');
  const [pace, setPace] = useState<'slow' | 'mid' | 'fast'>('mid');
  const [temperature, setTemperature] = useState(0.7);
  const [styleTag, setStyleTag] = useState('国漫');

  // 生成结果
  const [scriptText, setScriptText] = useState('');
  const [generatedContent, setGeneratedContent] = useState<EnhancedScriptContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setDebugLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    setStatusMsg(msg);
  };

  // 获取所有剧本作品（用于来源选择）
  const allWorks = tableApi.get('works') as Work[] | Work | null;
  const scriptWorks = Array.isArray(allWorks)
    ? allWorks
        .filter(w => w.type === 'script' && w.author_id === currentUser?.id)
        .sort((a, b) => b.updated_ms - a.updated_ms)
    : [];

  useEffect(() => {
    document.title = `${t.scriptGenerator} - ${t.appTitle}`;

    // 如果有ID参数，加载作品
    const id = searchParams.get('id');
    if (id) {
      loadWork(id);
    }
  }, [t, searchParams]);

  // 加载作品
  const loadWork = (id: string) => {
    const work = tableApi.get<Work>('works', id) as Work | null;
    if (work && work.type === 'script') {
      setCurrentWorkId(id);
      setTitle(work.title);

      // 检查是否为新版结构
      const content = work.content as EnhancedScriptContent;
      if (content.script_text) {
        // 新版结构
        setGenre(content.genre || 'romance');
        setSelectedLang(content.lang || 'zh');
        setLogline(content.logline || '');
        setWorld(content.world || '');
        setCharacters((content.characters || []).map(c => ({ ...c, _ui_id: generateId() })));
        setConstraints(content.constraints || '');
        setLengthLevel(content.params?.length_level || 'mid');
        setPace(content.params?.pace || 'mid');
        setTemperature(content.params?.temperature || 0.7);
        setStyleTag(content.params?.style_tag || '国漫');
        setScriptText(content.script_text);
        setGeneratedContent(content);
      }
    }
  };

  // 从来源作品载入
  const loadFromSource = (sourceId: string) => {
    if (!sourceId) return;
    setSourceWorkId(sourceId);
    loadWork(sourceId);
  };

  // 角色管理
  const addCharacter = () => {
    setCharacters([...characters, { name: '', traits: '', relation: '', _ui_id: generateId() }]);
  };

  const updateCharacter = (index: number, field: keyof Character, value: string) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const deleteCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  // 生成剧本
  const handleGenerate = async () => {
    if (!currentUser) {
      toast({ title: t.pleaseLogin, variant: 'destructive' });
      return;
    }

    if (!logline.trim()) {
      toast({ title: '请填写故事概述', variant: 'destructive' });
      return;
    }

    if (characters.length === 0) {
      toast({ title: '请至少添加一个角色', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setStatusMsg('正在初始化请求...');
    setDebugLog([]); // Clear log
    addLog('开始生成流程...');

    try {
      // 组装payload
      const payload = {
        user: {
          id: currentUser.id,
          nickname: currentUser.nickname,
          membership_tier: currentUser.membership_tier
        },
        lang: selectedLang,
        genre,
        input: {
          logline,
          world,
          characters: characters.filter(c => c.name.trim()),
          constraints
        },
        params: {
          length_level: lengthLevel,
          pace,
          temperature,
          style_tag: styleTag
        },
        meta: {
          client: 'aicm-workshop',
          version: 'prototype'
        }
      };

      addLog('请求参数组装完成，正在发送...');

      // 临时存储流式内容
      let streamedText = '';
      
      // 调用AI生成
      const response = await generate('script', payload, (chunk) => {
        streamedText += chunk;
        setScriptText(streamedText); // 实时更新编辑器
        setStatusMsg(`正在生成中... (${streamedText.length} 字)`);
        // 自动滚动日志或保持状态活跃
      }) as ApiResponse<ScriptGenerationResult>;

      addLog(`请求返回，状态: ${response.ok ? '成功' : '失败'}`);

      if (response.ok && response.data) {
        addLog('正在解析生成结果...');
        // 构建完整内容结构
        const content: EnhancedScriptContent = {
          genre,
          lang: selectedLang,
          logline,
          world,
          characters: characters.filter(c => c.name.trim()),
          constraints,
          params: {
            length_level: lengthLevel,
            pace,
            temperature,
            style_tag: styleTag
          },
          script_text: response.data.script_text || (response.data as any).text || '',
          scenes: response.data.scenes || [],
          updated_from: {
            source_script_id: sourceWorkId || null
          }
        };

        setScriptText(content.script_text);
        setGeneratedContent(content);
        
        if (!content.script_text) {
             addLog('警告: 生成内容为空');
             toast({ title: '生成内容为空', variant: 'destructive' });
        } else if ((content.scenes || []).length === 0) {
             addLog('注意: 结构化解析失败，仅展示文本');
             toast({ title: '生成成功，但结构化解析失败', description: '仅展示文本内容' });
        } else {
             addLog('生成并解析成功！');
             toast({ title: '生成成功！' });
        }
      } else {
        const errorMsg = response.error?.message || '未知错误';
        addLog(`错误: ${errorMsg}`);
        toast({
          title: '生成失败',
          description: errorMsg,
          variant: 'destructive'
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      addLog(`异常捕获: ${errorMsg}`);
      toast({
        title: '生成失败',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  // 保存作品
  const handleSave = () => {
    if (!currentUser || !title.trim() || !generatedContent) {
      toast({ title: '请先生成剧本并填写标题', variant: 'destructive' });
      return;
    }

    // 移除UI ID
    const cleanCharacters = characters.map(({ _ui_id, ...rest }) => rest);

    // 更新script_text为当前编辑的内容
    const updatedContent: EnhancedScriptContent = {
      ...generatedContent,
      characters: cleanCharacters,
      script_text: scriptText
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
        type: 'script',
        title,
        content: updatedContent,
        author_id: currentUser.id,
        lang: selectedLang,
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
    if (!currentUser || !title.trim() || !generatedContent) {
      toast({ title: '请先生成剧本并填写标题', variant: 'destructive' });
      return;
    }

    // 移除UI ID
    const cleanCharacters = characters.map(({ _ui_id, ...rest }) => rest);

    const updatedContent: EnhancedScriptContent = {
      ...generatedContent,
      characters: cleanCharacters,
      script_text: scriptText
    };

    const newWork: Omit<Work, 'id'> = {
      type: 'script',
      title: title + ' (副本)',
      content: updatedContent,
      author_id: currentUser.id,
      lang: selectedLang,
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

  // 生成分镜
  const handleGenerateStoryboard = () => {
    if (!currentWorkId) {
      toast({ title: '请先保存剧本', variant: 'destructive' });
      return;
    }

    // 使用localStorage传递source_script_id
    localStorage.setItem('last_source_script_id', currentWorkId);
    navigate('/tools/storyboard');
    toast({ title: '正在跳转到分镜生成器...' });
  };

  // 题材选项
  const genres = [
    { value: 'romance', label: t.romance },
    { value: 'scifi', label: t.scifi },
    { value: 'mystery', label: t.mystery },
    { value: 'campus', label: t.campus },
    { value: 'family', label: t.family },
    { value: 'thriller', label: t.thriller }
  ];

  // 风格标签选项
  const styleTags = language === 'zh'
    ? ['国漫', '赛博', '热血', '恋爱喜剧', '悬疑推理', '科幻未来']
    : ['Chinese Style', 'Cyberpunk', 'Hot-blooded', 'Rom-Com', 'Mystery', 'Sci-Fi'];

  // 左栏：题材、语言、来源作品选择
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <Label className="font-semibold text-foreground mb-3 block">题材类型</Label>
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {genres.map(g => (
              <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="font-semibold text-foreground mb-3 block">语言</Label>
        <Select value={selectedLang} onValueChange={(v) => setSelectedLang(v as 'zh' | 'en')}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zh">中文</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="font-semibold text-foreground mb-3 block">来源作品（可选）</Label>
        <Select value={sourceWorkId || 'none'} onValueChange={(v) => v !== 'none' && loadFromSource(v)}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue placeholder="选择已有剧本..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">无</SelectItem>
            {scriptWorks.map(work => (
              <SelectItem key={work.id} value={work.id}>{work.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          选择后将载入该作品的设定
        </p>
      </div>
    </div>
  );

  // 中栏：作者输入表单 + 生成按钮 + 结果编辑器
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

      {/* 故事概述 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">故事概述（Logline）</Label>
        <Textarea
          value={logline}
          onChange={(e) => setLogline(e.target.value)}
          placeholder="用一句话概括你的故事..."
          rows={3}
          className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors resize-none"
        />
      </div>

      {/* 世界观设定 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">世界观/设定</Label>
        <Textarea
          value={world}
          onChange={(e) => setWorld(e.target.value)}
          placeholder="描述故事发生的世界、背景、时代..."
          rows={3}
          className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors resize-none"
        />
      </div>

      {/* 角色列表 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label className="font-semibold text-foreground text-lg">角色列表</Label>
          <Button onClick={addCharacter} size="sm" variant="outline" className="border-2 border-border hover:border-primary/50">
            <Plus className="h-4 w-4 mr-1" />
            添加角色
          </Button>
        </div>

        {characters.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            暂无角色，点击"添加角色"开始创建
          </p>
        )}

        <AnimatePresence mode="popLayout">
          {characters.map((char, index) => (
            <motion.div
              key={char._ui_id || index}
              layout
              initial={{ opacity: 0, scale: 0.95, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 mb-4 bg-muted/50 border-2 border-border">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-semibold text-foreground">角色 {index + 1}</Label>
                    <Button size="sm" variant="ghost" onClick={() => deleteCharacter(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="角色名"
                    value={char.name}
                    onChange={(e) => updateCharacter(index, 'name', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                  <Input
                    placeholder="性格特征"
                    value={char.traits}
                    onChange={(e) => updateCharacter(index, 'traits', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                  <Input
                    placeholder="关系/身份"
                    value={char.relation}
                    onChange={(e) => updateCharacter(index, 'relation', e.target.value)}
                    className="bg-background border-2 border-border h-10"
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 约束条件 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">约束条件（可选）</Label>
        <Textarea
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          placeholder="禁忌内容、必须出现的元素等..."
          rows={2}
          className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors resize-none"
        />
      </div>

      {/* 生成按钮 */}
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            '生成剧本'
          )}
        </Button>
      </motion.div>

          {/* 状态与调试信息 */}
          {loading && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-primary/20 animate-pulse">
              <p className="text-sm font-medium text-primary text-center">
                {statusMsg || 'AI正在思考中...'}
              </p>
            </div>
          )}
          
          {debugLog.length > 0 && (
            <div className="mt-4">
               <details className="text-xs text-muted-foreground cursor-pointer">
                 <summary>查看详细日志 (Debug Log)</summary>
                 <div className="mt-2 p-2 bg-black/5 rounded border border-border h-32 overflow-y-auto font-mono">
                   {debugLog.map((log, i) => (
                     <div key={i} className="mb-1 border-b border-border/10 pb-1 last:border-0">{log}</div>
                   ))}
                 </div>
               </details>
            </div>
          )}

          {/* 结果编辑器 */}
      {scriptText && (
        <div>
          <Label className="font-semibold text-foreground mb-3 block">生成结果（可编辑）</Label>
          <Textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            rows={20}
            className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors font-mono text-sm"
          />
        </div>
      )}

      {/* 操作按钮 */}
      {scriptText && (
        <div className="flex gap-3">
          <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSave}
              className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </motion.div>
          <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSaveAs}
              variant="outline"
              className="w-full h-11 border-2 border-border hover:border-primary/50"
            >
              <FilePlus className="h-4 w-4 mr-2" />
              另存为
            </Button>
          </motion.div>
          <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleGenerateStoryboard}
              variant="outline"
              className="w-full h-11 border-2 border-border hover:border-primary/50"
            >
              <Film className="h-4 w-4 mr-2" />
              生成分镜
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );

  // 右栏：参数面板
  const rightPanel = (
    <div className="space-y-6">
      {/* 长度级别 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">长度级别</Label>
        <Select value={lengthLevel} onValueChange={(v) => setLengthLevel(v as 'short' | 'mid' | 'long')}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">短篇（500-800字）</SelectItem>
            <SelectItem value="mid">中篇（800-1500字）</SelectItem>
            <SelectItem value="long">长篇（1500-2500字）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 节奏 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">节奏</Label>
        <Select value={pace} onValueChange={(v) => setPace(v as 'slow' | 'mid' | 'fast')}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="slow">慢节奏</SelectItem>
            <SelectItem value="mid">中等节奏</SelectItem>
            <SelectItem value="fast">快节奏</SelectItem>
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

      {/* 风格标签 */}
      <div>
        <Label className="font-semibold text-foreground mb-3 block">风格标签</Label>
        <Select value={styleTag} onValueChange={setStyleTag}>
          <SelectTrigger className="bg-background border-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {styleTags.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 统计信息 */}
      {generatedContent && (
        <div className="p-4 bg-muted/50 rounded-lg border-2 border-border">
          <Label className="font-semibold text-foreground mb-2 block">统计信息</Label>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>场景数：<span className="text-primary font-semibold">{generatedContent.scenes.length}</span></p>
            <p>角色数：<span className="text-primary font-semibold">{generatedContent.characters.length}</span></p>
            <p>字数：<span className="text-primary font-semibold">{scriptText.length}</span></p>
          </div>
        </div>
      )}
    </div>
  );

  return <ToolLayout leftPanel={leftPanel} centerPanel={centerPanel} rightPanel={rightPanel} />;
}
