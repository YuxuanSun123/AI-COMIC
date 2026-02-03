// 分镜生成器 - 完整联动工作流实现

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import { generate, type StoryboardGenerationResult, type VideoCardsGenerationResult, type ApiResponse } from '@/lib/aiClient';
import type { Work, EnhancedScriptContent, EnhancedStoryboardContent, EnhancedShot, EnhancedVideoCardsContent, EnhancedVideoCard, Character } from '@/types';
import ToolLayout from '@/components/layouts/ToolLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Save, FilePlus, Film, ArrowUp, ArrowDown, RefreshCw, ExternalLink, Download, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { CollapsibleSection } from '@/components/CollapsibleSection';

// 本地扩展类型，用于UI动画的唯一ID
interface UiShot extends EnhancedShot {
  _ui_id: string;
}

// 简单的ID生成器
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

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
  const [shots, setShots] = useState<UiShot[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [generatedContent, setGeneratedContent] = useState<EnhancedStoryboardContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [rawOutput, setRawOutput] = useState<string>('');
  const [vcOpen, setVcOpen] = useState(false);
  const [renderStyle, setRenderStyle] = useState('国漫');
  const [characterConsistency, setCharacterConsistency] = useState<'low' | 'mid' | 'high'>('high');
  const [detailLevel, setDetailLevel] = useState<'low' | 'mid' | 'high'>('high');
  const [cameraEmphasis, setCameraEmphasis] = useState<'weak' | 'mid' | 'strong'>('mid');
  const [vcTemperature, setVcTemperature] = useState(0.5);
  const [cards, setCards] = useState<EnhancedVideoCard[]>([]);
  const [cardsContent, setCardsContent] = useState<EnhancedVideoCardsContent | null>(null);
  const [vcRawOutput, setVcRawOutput] = useState('');
  const [vcLoading, setVcLoading] = useState(false);
  const [vcReceivedBytes, setVcReceivedBytes] = useState(0);

  // 获取所有剧本作品（用于来源选择）
  const allWorks = tableApi.get('works') as Work[] | Work | null;
  const scriptWorks = Array.isArray(allWorks)
    ? allWorks
        .filter(w => w.type === 'script' && w.author_id === currentUser?.id)
        .sort((a, b) => b.updated_ms - a.updated_ms)
    : [];

  // 获取所有分镜作品（用于加载）
  const storyboardWorks = Array.isArray(allWorks)
    ? allWorks
        .filter(w => w.type === 'storyboard' && w.author_id === currentUser?.id)
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
    if (!work) return;

    if (work.type === 'storyboard') {
      loadStoryboardData(work);
    } else if (work.type === 'video_cards') {
      const content = work.content as EnhancedVideoCardsContent;
      setCards(content.cards || []);
      setCardsContent(content);
      setVcOpen(true);
      
      // 回显参数
      if (content.params) {
        setRenderStyle(content.params.render_style || '国漫');
        setCharacterConsistency(content.params.character_consistency || 'high');
        setDetailLevel(content.params.detail_level || 'high');
        setCameraEmphasis(content.params.camera_emphasis || 'mid');
        setVcTemperature(content.params.temperature || 0.5);
      }
      
      if (content.raw_text) {
        setVcRawOutput(content.raw_text);
      }

      // 尝试加载关联的分镜
      if (content.source?.storyboard_id) {
        const sbWork = tableApi.get('works', content.source.storyboard_id) as Work | null;
        if (sbWork && sbWork.type === 'storyboard') {
          loadStoryboardData(sbWork);
        }
      } else {
        setTitle(work.title);
      }
    }
  };

  const loadStoryboardData = (work: Work) => {
    setCurrentWorkId(work.id);
    setTitle(work.title);

    // 检查是否为新版结构
    const content = work.content as EnhancedStoryboardContent;
    if (content.shots) {
      // 新版结构
      setShots((content.shots || []).map(s => ({ ...s, _ui_id: generateId() })));
      setCharacters(content.characters || []);
      setShotDensity(content.params?.shot_density || 'standard');
      setVisualStyle(content.params?.visual_style || '国漫');
      setCameraVariety(content.params?.camera_variety || 'mid');
      setTemperature(content.params?.temperature || 0.6);
      setMaxShots(content.params?.max_shots || 30);
      setGeneratedContent(content);

      if (content.raw_text) {
        setRawOutput(content.raw_text);
      }

      // 如果有来源剧本，加载它
      if (content.source?.script_id) {
        setSourceScriptId(content.source.script_id);
        loadSourceScript(content.source.script_id);
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
    const newShot: UiShot = {
      shot_no: shots.length + 1,
      scene_ref: 1,
      frame: '',
      action: '',
      camera: '',
      dialogue: '',
      duration_sec: 4,
      notes: '',
      _ui_id: generateId()
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

  const renumberCards = () => {
    const updated = cards.map((card, index) => ({
      ...card,
      card_no: index + 1
    }));
    setCards(updated);
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
    setGenerationLogs(['开始任务：分镜生成...']);

    try {
      setGenerationLogs(prev => [...prev, '正在组装请求数据...']);
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

      setGenerationLogs(prev => [...prev, '正在连接 AI Provider...', `参数: Density=${shotDensity}, Style=${visualStyle}`]);

      // 定义进度回调
      const onProgress = (chunk: string) => {
        const preview = chunk.length > 50 ? chunk.substring(0, 20) + '...' + chunk.substring(chunk.length - 20) : chunk;
        setGenerationLogs(prev => {
            const lastLog = prev[prev.length - 1];
            if (lastLog && lastLog.startsWith('接收数据:')) {
                return [...prev.slice(0, -1), `接收数据: ${preview} (累计 ${chunk.length} 字符)`];
            }
            return [...prev, `接收数据: ${preview}`];
        });
      };

      // 调用AI生成
      const response = await generate('storyboard', payload, onProgress) as ApiResponse<StoryboardGenerationResult>;

      if (response.ok && response.data) {
        // 保存原始输出
        const rawText = response.data.raw_text || '';
        setRawOutput(rawText);

        setGenerationLogs(prev => [...prev, '生成成功，正在解析结果...']);
        
        // 安全检查
        if (!response.data.shots || !Array.isArray(response.data.shots)) {
             console.error('Invalid response format:', response.data);
             if (rawText) {
                setGenerationLogs(prev => [...prev, '警告: 未能解析出结构化分镜，将显示原始文本']);
                toast({ 
                    title: '解析不完整', 
                    description: '未能自动生成分镜卡片，请查看下方原始生成内容',
                    variant: 'destructive' 
                });
                // 不抛出错误，允许用户查看原始文本
             } else {
                setGenerationLogs(prev => [...prev, `格式错误: 返回数据不包含有效的 shots 数组`, `Raw: ${JSON.stringify(response.data).substring(0, 100)}...`]);
                throw new Error('AI返回格式异常，未能解析出分镜列表');
             }
        } else {
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
              characters: response.data.characters || [],
              raw_text: rawText,
              updated_from: {
                source_storyboard_id: null
              }
            };

            // 预处理 shots 数据（确保ID和编号正确）
            const processedShots = response.data.shots.map((s, index) => ({ 
                ...s, 
                _ui_id: generateId(),
                shot_no: index + 1
            }));

            setShots(processedShots);
            setCharacters(response.data.characters || []);
            setGeneratedContent(content);
            // renumberShots(); // 移除此处调用，避免因闭包导致读取旧state覆盖新数据
            setGenerationLogs(prev => [...prev, `处理完成：共生成 ${response.data.shots.length} 个镜头`]);
            toast({ title: '生成成功！' });
        }
      } else {
        const errorMsg = response.error?.message || '未知错误';
        setGenerationLogs(prev => [...prev, `生成失败: ${errorMsg}`, `错误代码: ${response.error?.code || 'N/A'}`]);
        toast({
          title: '生成失败',
          description: errorMsg,
          variant: 'destructive'
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setGenerationLogs(prev => [...prev, `发生异常: ${errorMsg}`]);
      toast({
        title: '生成失败',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 保存作品
  const handleSave = () => {
    if (!currentUser) {
      toast({ title: t.pleaseLogin, variant: 'destructive' });
      return;
    }
    
    if (shots.length === 0 && !rawOutput) {
      toast({ title: '请先生成分镜', variant: 'destructive' });
      return;
    }

    // 自动填充标题
    let finalTitle = title.trim();
    if (!finalTitle) {
        finalTitle = `分镜_${new Date().toLocaleString()}`;
        setTitle(finalTitle);
    }

    // 移除UI ID
    const cleanShots = shots.map(({ _ui_id, ...rest }) => rest);

    // 更新shots为当前编辑的内容
    const updatedContent: EnhancedStoryboardContent = generatedContent
      ? {
          ...generatedContent,
          shots: cleanShots,
          characters: characters,
          raw_text: rawOutput
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
          shots: cleanShots,
          characters: characters,
          raw_text: rawOutput,
          updated_from: {
            source_storyboard_id: null
          }
        };

    if (currentWorkId) {
      // 更新现有作品
      tableApi.patch<Work>('works', currentWorkId, {
        title: finalTitle,
        content: updatedContent,
        updated_ms: Date.now()
      });
      toast({ title: t.saveSuccess });
    } else {
      // 创建新作品
      const newWork: Omit<Work, 'id'> = {
        type: 'storyboard',
        title: finalTitle,
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
    if (!currentUser) {
      toast({ title: t.pleaseLogin, variant: 'destructive' });
      return;
    }

    if (shots.length === 0 && !rawOutput) {
      toast({ title: '请先生成分镜', variant: 'destructive' });
      return;
    }

    // 自动填充标题
    let finalTitle = title.trim();
    if (!finalTitle) {
        finalTitle = `分镜_${new Date().toLocaleString()}`;
    }

    // 移除UI ID
    const cleanShots = shots.map(({ _ui_id, ...rest }) => rest);

    const updatedContent: EnhancedStoryboardContent = generatedContent
      ? {
          ...generatedContent,
          shots: cleanShots,
          characters: characters,
          raw_text: rawOutput
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
          shots: cleanShots,
          characters: characters,
          raw_text: rawOutput,
          updated_from: {
            source_storyboard_id: null
          }
        };

    const newWork: Omit<Work, 'id'> = {
      type: 'storyboard',
      title: finalTitle + ' (副本)',
      content: updatedContent,
      author_id: currentUser.id,
      lang: sourceScript?.lang || (language as 'zh' | 'en'),
      created_ms: Date.now(),
      updated_ms: Date.now()
    };
    const result = tableApi.post<Work>('works', newWork);
    if (result && 'id' in result) {
      setCurrentWorkId(result.id);
      setTitle(finalTitle + ' (副本)');
    }
    toast({ title: '另存为成功！' });
  };

  const handleGenerateVideoCards = async () => {
    if (!currentUser) {
      toast({ title: t.pleaseLogin, variant: 'destructive' });
      return;
    }
    if (shots.length === 0) {
      toast({ title: '请先生成分镜', variant: 'destructive' });
      return;
    }
    setVcOpen(true);
    setVcLoading(true);
    setVcRawOutput('');
    setVcReceivedBytes(0);
    try {
      // 1. 准备发送给AI的数据：强制重新编号，确保 1,2,3... 连续，以便AI更容易处理
      const cleanShots = shots.map(({ _ui_id, ...rest }) => rest);
      const payloadShots = cleanShots.map((s, i) => ({
          ...s,
          shot_no: i + 1 // 强制使用序列号
      }));

      const payload = {
        user: {
          id: currentUser.id,
          nickname: currentUser.nickname,
          membership_tier: currentUser.membership_tier
        },
        lang: sourceScript?.lang || (language as 'zh' | 'en'),
        genre: (sourceScript?.content as EnhancedScriptContent)?.genre || 'romance',
        source: {
          storyboard_id: currentWorkId || null,
          shots: payloadShots, // 发送重编号后的列表
          characters: characters // 传递角色信息
        },
        params: {
          render_style: renderStyle,
          character_consistency: characterConsistency,
          detail_level: detailLevel,
          camera_emphasis: cameraEmphasis,
          temperature: vcTemperature
        },
        meta: {
          client: 'aicm-workshop',
          version: 'prototype'
        }
      };
      const response = await generate('video_cards', payload, (log) => setVcReceivedBytes(prev => prev + log.length)) as ApiResponse<VideoCardsGenerationResult & { raw_text?: string }>;
      
      if (response.ok && response.data) {
        if (response.data.raw_text) {
          setVcRawOutput(response.data.raw_text);
        }

        // 2. 解析AI返回的卡片，建立映射
        // AI看到的镜头编号是 1, 2, 3...
        const aiCardsMap = new Map();
        
        // 辅助函数：标准化卡片数据
        const processCard = (c: any) => {
             // 尝试获取匹配键：shot_ref > shot_number > card_no
             // 因为我们发送的是 1,2,3...，所以我们期望 AI 返回对应的序号
             let key = c.shot_ref || c.shot_number || c.card_no;
             
             // 如果 AI 返回的 key 是字符串且包含非数字（虽然 Number() 会处理，但预防万一），这里假设 AI 返回的是数字或数字字符串
             if (key) {
                 aiCardsMap.set(Number(key), c);
             }
        };

        if (response.data.cards && Array.isArray(response.data.cards)) {
             response.data.cards.forEach(processCard);
        } else if (response.data.prompts && Array.isArray(response.data.prompts)) {
             (response.data.prompts as any[]).forEach(processCard);
        }

        // 3. 将 AI 卡片映射回原始镜头列表
        // cleanShots 保持了原始的 shot_no (可能是 1, 3, 5...)
        // 我们通过 index (0, 1, 2...) + 1 来查找对应的 AI 卡片 (因为 payloadShots 是 1, 2, 3...)
        const fullCards: EnhancedVideoCard[] = cleanShots.map((shot, index) => {
            // 查找逻辑：
            // 1. 优先使用序列号 (index + 1) 查找，因为这是我们在 payload 中指定的 shot_no
            // 2. 如果没找到，尝试用原始 shot_no 查找 (防备 AI 居然神奇地通过上下文猜到了原始编号？不太可能但作为兜底)
            // 3. 最后尝试直接按数组索引取 (如果 AI 返回了纯数组且没写编号)
            
            let aiCard = aiCardsMap.get(index + 1);
            
            if (!aiCard) {
                aiCard = aiCardsMap.get(shot.shot_no);
            }
            
            // 如果 Map 匹配全都失败，且 AI 返回的卡片数量与镜头数一致，尝试按顺序强制匹配
            if (!aiCard && (response.data?.cards?.length === cleanShots.length)) {
                aiCard = response.data.cards[index];
            }

            // 智能合并逻辑
            return {
                card_no: index + 1, // 重新编号卡片，使其连续
                shot_ref: shot.shot_no, // 关键：指向原始镜头的 shot_no
                visual_desc: aiCard?.visual_desc || shot.frame || '',
                character_action: aiCard?.character_action || shot.action || '',
                lighting_mood: aiCard?.lighting_mood || '',
                camera_desc: aiCard?.camera_desc || shot.camera || '',
                dialogue_voiceover: aiCard?.dialogue_voiceover || shot.dialogue || '',
                prompt: aiCard?.prompt || '',
                negative_prompt: aiCard?.negative_prompt || '',
                notes: aiCard?.notes || shot.notes || ''
            };
        });

        // 处理角色信息：合并/更新
        let finalCharacters: Character[] = characters;
        if (response.data?.characters && Array.isArray(response.data.characters)) {
            finalCharacters = response.data.characters.map(c => {
                // 尝试查找现有角色以保留未变更的字段（如经历）
                const existing = characters.find(ec => ec.name === c.name);
                return {
                    name: c.name,
                    traits: c.traits,
                    relation: c.relation,
                    // AI可能没返回appearance/experience，优先用AI返回的，否则用旧的，最后空字符串兜底
                    appearance: c.appearance || existing?.appearance || '',
                    experience: c.experience || existing?.experience || ''
                };
            });
            setCharacters(finalCharacters);
        }

        const content: EnhancedVideoCardsContent = {
          lang: sourceScript?.lang || (language as 'zh' | 'en'),
          genre: (sourceScript?.content as EnhancedScriptContent)?.genre || 'romance',
          source: {
            storyboard_id: currentWorkId || null,
            storyboard_title: title || '未命名分镜',
            shot_count: cleanShots.length
          },
          params: {
            render_style: renderStyle,
            character_consistency: characterConsistency,
            detail_level: detailLevel,
            camera_emphasis: cameraEmphasis,
            temperature: vcTemperature
          },
          cards: fullCards,
          characters: finalCharacters,
          updated_from: {
            source_video_cards_id: null
          }
        };
        
        setCards(fullCards);
        setCardsContent(content);
        
        if (aiCardsMap.size > 0) {
            toast({ title: `生成完成，覆盖 ${aiCardsMap.size}/${cleanShots.length} 个镜头` });
        } else {
            toast({ 
                title: 'AI返回格式异常，已重置为基础卡片', 
                description: '您可以尝试重新生成，或手动编辑 Prompt',
                variant: 'destructive' 
            });
        }

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
      setVcLoading(false);
    }
  };

  const handleSaveVideoCards = () => {
    if (!currentUser || !title.trim() || (cards.length === 0 && !vcRawOutput)) {
      toast({ title: '请先生成镜头卡并填写标题', variant: 'destructive' });
      return;
    }
    const updatedContent: EnhancedVideoCardsContent = cardsContent
      ? { ...cardsContent, cards, raw_text: vcRawOutput || cardsContent.raw_text }
      : {
          lang: sourceScript?.lang || (language as 'zh' | 'en'),
          genre: (sourceScript?.content as EnhancedScriptContent)?.genre || 'romance',
          source: {
            storyboard_id: currentWorkId || null,
            storyboard_title: title || '未命名分镜',
            shot_count: shots.length
          },
          params: {
            render_style: renderStyle,
            character_consistency: characterConsistency,
            detail_level: detailLevel,
            camera_emphasis: cameraEmphasis,
            temperature: vcTemperature
          },
          cards,
          raw_text: vcRawOutput,
          updated_from: {
            source_video_cards_id: null
          }
        };
    const newWork: Omit<Work, 'id'> = {
      type: 'video_cards',
      title,
      content: updatedContent,
      author_id: currentUser.id,
      lang: sourceScript?.lang || (language as 'zh' | 'en'),
      created_ms: Date.now(),
      updated_ms: Date.now()
    };
    const result = tableApi.post<Work>('works', newWork);
    if (result && 'id' in result) {
      toast({ title: t.saveSuccess });
    }
  };

  // 视觉风格选项
  const visualStyles = language === 'zh'
    ? ['国漫', '赛博', '写实', '轻松']
    : ['Chinese Style', 'Cyberpunk', 'Realistic', 'Casual'];

  // 动画变体配置
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // 左栏：来源剧本选择 + 加载分镜
  const leftPanel = (
    <div className="space-y-6">
      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-semibold text-foreground text-lg flex items-center">
              <span className="bg-primary/10 p-1.5 rounded-md mr-2">
                <Film className="h-4 w-4 text-primary" />
              </span>
              分镜加载
            </Label>
          </div>
          
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
             <div className="p-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
               已保存的分镜
             </div>
             <div className="p-4">
                <Select value={currentWorkId || 'none'} onValueChange={(val) => {
                    if (val === 'none') {
                        setCurrentWorkId(null);
                        setTitle('');
                        setShots([]);
                        return;
                    }
                    const work = storyboardWorks.find(w => w.id === val);
                    if (work) loadStoryboardData(work);
                }}>
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="选择要继续编辑的分镜..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">新建空白分镜</SelectItem>
                    {storyboardWorks.map(work => (
                      <SelectItem key={work.id} value={work.id}>{work.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
          </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
            <Label className="font-semibold text-foreground text-lg flex items-center">
              <span className="bg-primary/10 p-1.5 rounded-md mr-2">
                <FilePlus className="h-4 w-4 text-primary" />
              </span>
              来源剧本
            </Label>
        </div>
        
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
             <div className="p-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
               选择剧本以生成
             </div>
             <div className="p-4">
                <Select value={sourceScriptId || 'none'} onValueChange={handleSourceScriptChange}>
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="选择剧本..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无 (直接创作)</SelectItem>
                    {scriptWorks.map(work => (
                      <SelectItem key={work.id} value={work.id}>{work.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
        </div>
      </div>

      {sourceScript && (
        <div className="bg-primary/5 rounded-lg border border-primary/10 p-4 space-y-3">
          <Label className="font-semibold text-primary flex items-center text-sm">
            <CheckCircle2 className="w-3 h-3 mr-1.5" />
            已选择剧本
          </Label>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">标题</span>
              <span className="font-medium">{sourceScript.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">题材</span>
              <Badge variant="outline" className="text-xs">{(sourceScript.content as EnhancedScriptContent).genre}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">场景数</span>
              <span className="font-medium">{(sourceScript.content as EnhancedScriptContent).scenes?.length || 0}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-muted-foreground">更新时间</span>
              <span className="text-xs text-muted-foreground pt-0.5">{new Date(sourceScript.updated_ms).toLocaleDateString()}</span>
            </div>
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
        <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
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
              '生成分镜'
            )}
          </Button>
        </motion.div>
      </div>

      {/* 状态日志显示 */}
      {(loading || generationLogs.length > 0) && (
        <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="mt-4 p-4 bg-black/80 rounded-lg font-mono text-xs text-green-400 max-h-48 overflow-y-auto border border-green-900"
        >
            <div className="flex justify-between items-center mb-2 border-b border-green-900 pb-1">
                <span className="font-bold">SYSTEM LOGS</span>
                {loading && <Loader2 className="h-3 w-3 animate-spin" />}
            </div>
            {generationLogs.map((log, i) => (
                <div key={i} className="mb-1 break-words">
                    <span className="text-green-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                </div>
            ))}
        </motion.div>
      )}

      {/* 角色列表 */}
      {characters.length > 0 && (
        <CollapsibleSection title={`角色列表 (${characters.length})`} defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((char, idx) => (
                    <Card key={idx} className="p-4 bg-muted/30 border border-border hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-lg text-primary">{char.name}</div>
                            <Badge variant="outline">{char.relation}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="bg-background/50 p-2 rounded">
                                <span className="font-semibold text-foreground/80 block mb-1">性格</span>
                                <span className="text-muted-foreground">{char.traits}</span>
                            </div>
                            <div className="bg-background/50 p-2 rounded">
                                <span className="font-semibold text-foreground/80 block mb-1">外貌</span>
                                <span className="text-muted-foreground">{char.appearance}</span>
                            </div>
                            <div className="bg-background/50 p-2 rounded">
                                <span className="font-semibold text-foreground/80 block mb-1">经历</span>
                                <span className="text-muted-foreground">{char.experience}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </CollapsibleSection>
      )}

      {/* 分镜列表编辑器 */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="flex justify-between items-center mb-3">
          <Label className="font-semibold text-foreground text-lg">分镜列表</Label>
          <div className="flex gap-2">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleGenerateVideoCards} 
                size="sm" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                disabled={shots.length === 0}
              >
                <Film className="h-4 w-4 mr-1" />
                生成镜头卡
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button onClick={renumberShots} size="sm" variant="outline" className="border-2 border-border hover:border-primary/50" disabled={shots.length === 0}>
                <RefreshCw className="h-4 w-4 mr-1" />
                重新编号
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button onClick={addShot} size="sm" variant="outline" className="border-2 border-border hover:border-primary/50">
                <Plus className="h-4 w-4 mr-1" />
                添加镜头
              </Button>
            </motion.div>
          </div>
        </div>

        {shots.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {shots.map((shot, index) => (
              <motion.div
                key={shot._ui_id || index}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <Card className="p-0 mb-6 bg-card border border-border hover:shadow-lg transition-all overflow-hidden group">
                  {/* Card Header */}
                  <div className="bg-muted/30 px-4 py-3 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-md min-w-[3rem] text-center">
                        #{shot.shot_no}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-4">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">场景:</span>
                          <Input
                            type="number"
                            value={shot.scene_ref}
                            onChange={(e) => updateShot(index, 'scene_ref', parseInt(e.target.value) || 1)}
                            className="h-6 w-12 text-center bg-background border-border p-0"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">时长:</span>
                          <Input
                            type="number"
                            value={shot.duration_sec}
                            onChange={(e) => updateShot(index, 'duration_sec', parseInt(e.target.value) || 4)}
                            className="h-6 w-12 text-center bg-background border-border p-0"
                          />
                          <span>s</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveShot(index, 'up')} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveShot(index, 'down')} disabled={index === shots.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteShot(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">画面描述 (Visual)</Label>
                        <Textarea
                          value={shot.frame}
                          onChange={(e) => updateShot(index, 'frame', e.target.value)}
                          rows={3}
                          className="bg-muted/10 border-border resize-none focus:bg-background transition-colors"
                          placeholder="描述画面内容、构图..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">对白/旁白 (Audio)</Label>
                        <Textarea
                          value={shot.dialogue}
                          onChange={(e) => updateShot(index, 'dialogue', e.target.value)}
                          rows={2}
                          className="bg-muted/10 border-border resize-none focus:bg-background transition-colors"
                          placeholder="角色台词或画外音..."
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">动作 (Action)</Label>
                          <Input
                            value={shot.action}
                            onChange={(e) => updateShot(index, 'action', e.target.value)}
                            className="bg-muted/10 border-border focus:bg-background transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">运镜 (Camera)</Label>
                          <Input
                            value={shot.camera}
                            onChange={(e) => updateShot(index, 'camera', e.target.value)}
                            className="bg-muted/10 border-border focus:bg-background transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">备注 (Notes)</Label>
                        <Input
                          value={shot.notes}
                          onChange={(e) => updateShot(index, 'notes', e.target.value)}
                          className="bg-muted/10 border-border focus:bg-background transition-colors"
                          placeholder="光影、氛围或其他备注..."
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
          ))}
          </AnimatePresence>
        ) : rawOutput ? (
            <div className="space-y-4">
                <div className="p-4 bg-muted/50 border-2 border-border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <Label>原始生成内容</Label>
                        <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(rawOutput)}>
                            复制内容
                        </Button>
                    </div>
                    <Textarea 
                        value={rawOutput} 
                        readOnly 
                        rows={20} 
                        className="font-mono text-sm bg-background resize-y"
                    />
                </div>
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-md border border-yellow-500/20">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <p className="text-sm">
                        未能自动解析为镜头卡，您可以保存当前结果或复制内容手动处理。
                    </p>
                </div>
            </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/30">
            <p className="text-muted-foreground">暂无分镜内容，请点击上方"生成分镜"或手动"添加镜头"</p>
          </div>
        )}
      </motion.div>

      {/* 操作按钮 */}
      <div className="flex gap-3 mt-6">
        <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSave}
            disabled={shots.length === 0 && !rawOutput}
            className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
          >
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </motion.div>
        <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSaveAs}
            disabled={shots.length === 0 && !rawOutput}
            variant="outline"
            className="w-full h-11 border-2 border-border hover:border-primary/50"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            另存为
          </Button>
        </motion.div>
        <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleGenerateVideoCards}
            disabled={shots.length === 0}
            variant="outline"
            className="w-full h-11 border-2 border-border hover:border-primary/50"
          >
            <Film className="h-4 w-4 mr-2" />
            生成镜头卡
          </Button>
        </motion.div>
      </div>

      <CollapsibleSection
        title="镜头卡生成器"
        open={vcOpen}
        onOpenChange={setVcOpen}
        className="mt-8"
      >
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold text-foreground mb-3 block">渲染风格</Label>
                <Select value={renderStyle} onValueChange={setRenderStyle}>
                  <SelectTrigger className="bg-background border-2 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(language === 'zh' ? ['国漫','赛博','写实','轻松'] : ['Chinese Style','Cyberpunk','Realistic','Casual']).map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              <div>
                <Label className="font-semibold text-foreground mb-3 block">
                  创意度：{vcTemperature.toFixed(1)}
                </Label>
                <Slider
                  value={[vcTemperature * 100]}
                  onValueChange={(v) => setVcTemperature(v[0] / 100)}
                  min={0}
                  max={100}
                  step={10}
                  className="my-4"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateVideoCards}
                disabled={vcLoading || shots.length === 0}
                className="h-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex-1"
              >
                {vcLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Film className="h-4 w-4 mr-2" />}
                生成镜头卡
              </Button>

              {cards.length > 0 && !vcLoading && (
                <Button
                  onClick={handleSaveVideoCards}
                  className="h-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存镜头卡
                </Button>
              )}
            </div>

            {/* 镜头卡生成状态 */}
            {(vcLoading || vcReceivedBytes > 0) && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="mt-4 p-4 bg-muted/50 rounded-lg border border-border"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-sm">GENERATION STATUS</span>
                           {vcLoading ? (
                               <Badge variant="secondary" className="animate-pulse">生成中...</Badge>
                           ) : (
                               <Badge className="bg-green-600 hover:bg-green-700">生成完成</Badge>
                           )}
                        </div>
                        {vcLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            <span>已接收数据: {(vcReceivedBytes / 1024).toFixed(2)} KB</span>
                        </div>
                        {!vcLoading && cards.length > 0 && (
                            <div className="flex items-center gap-2 text-green-600 font-semibold">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>成功生成 {cards.length} 张镜头卡</span>
                            </div>
                        )}
                    </div>
                    
                    {vcLoading && (
                        <div className="w-full bg-secondary/30 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-1/3 animate-pulse rounded-full" />
                        </div>
                    )}
                </motion.div>
            )}

            {cards.length === 0 && vcRawOutput && (
              <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-md border border-yellow-500/20">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <p className="text-sm">
                          未能自动解析为镜头卡，您可以保存当前结果或复制内容手动处理。
                      </p>
                  </div>
                  <Textarea
                    value={vcRawOutput}
                    readOnly
                    className="font-mono text-xs h-64 bg-muted"
                  />
                   <Button onClick={handleSaveVideoCards} size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white w-full">
                      <Save className="h-4 w-4 mr-1" />
                      保存原始内容
                    </Button>
              </div>
            )}
            {cards.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="font-semibold text-foreground text-lg">镜头卡列表</Label>
                  <div className="flex gap-2">
                    <Button onClick={renumberCards} size="sm" variant="outline" className="border-2 border-border hover:border-primary/50">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      重新编号
                    </Button>
                    <Button onClick={handleSaveVideoCards} size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      <Save className="h-4 w-4 mr-1" />
                      保存镜头卡
                    </Button>
                  </div>
                </div>
                <AnimatePresence mode="popLayout">
                  {cards.map((card, index) => (
                    <motion.div
                      key={card.card_no + '-' + index}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                    >
                      <Card className="p-6 mb-4 bg-muted/50 border-2 border-border">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm text-muted-foreground mb-1 block">卡片编号</Label>
                            <Input
                              type="number"
                              value={card.card_no}
                              onChange={(e) => {
                                const updated = [...cards];
                                updated[index] = { ...updated[index], card_no: parseInt(e.target.value) || 1 };
                                setCards(updated);
                              }}
                              className="bg-background border-2 border-border h-10"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground mb-1 block">对应镜头</Label>
                            <Input
                              type="number"
                              value={card.shot_ref}
                              onChange={(e) => {
                                const updated = [...cards];
                                updated[index] = { ...updated[index], shot_ref: parseInt(e.target.value) || 1 };
                                setCards(updated);
                              }}
                              className="bg-background border-2 border-border h-10"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-sm text-muted-foreground mb-1 block">画面描述</Label>
                            <Textarea
                              value={card.visual_desc}
                              onChange={(e) => {
                                const updated = [...cards];
                                updated[index] = { ...updated[index], visual_desc: e.target.value };
                                setCards(updated);
                              }}
                              rows={2}
                              className="bg-background border-2 border-border resize-none"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground mb-1 block">人物与动作</Label>
                            <Input
                              value={card.character_action}
                              onChange={(e) => {
                                const updated = [...cards];
                                updated[index] = { ...updated[index], character_action: e.target.value };
                                setCards(updated);
                              }}
                              className="bg-background border-2 border-border h-10"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground mb-1 block">光影/氛围</Label>
                            <Input
                              value={card.lighting_mood}
                              onChange={(e) => {
                                const updated = [...cards];
                                updated[index] = { ...updated[index], lighting_mood: e.target.value };
                                setCards(updated);
                              }}
                              className="bg-background border-2 border-border h-10"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground mb-1 block">机位与运动</Label>
                            <Input
                              value={card.camera_desc}
                              onChange={(e) => {
                                const updated = [...cards];
                                updated[index] = { ...updated[index], camera_desc: e.target.value };
                                setCards(updated);
                              }}
                              className="bg-background border-2 border-border h-10"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground mb-1 block">对白/旁白</Label>
                            <Textarea
                              value={card.dialogue_voiceover}
                              onChange={(e) => {
                                const updated = [...cards];
                                updated[index] = { ...updated[index], dialogue_voiceover: e.target.value };
                                setCards(updated);
                              }}
                              rows={2}
                              className="bg-background border-2 border-border resize-none"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-sm text-muted-foreground mb-1 block">Prompt</Label>
                            <Textarea
                              value={card.prompt}
                              onChange={(e) => {
                                const updated = [...cards];
                                updated[index] = { ...updated[index], prompt: e.target.value };
                                setCards(updated);
                              }}
                              rows={3}
                              className="bg-background border-2 border-border resize-none font-mono text-xs"
                            />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
      </CollapsibleSection>
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
