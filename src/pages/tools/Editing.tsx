// 剪辑合成 - 完整联动工作流实现

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import tableApi from '@/lib/tableApi';
import { generate, generateImage, type EditPlanGenerationResult, type ApiResponse } from '@/lib/aiClient';
import type { Work, EnhancedVideoCardsContent, EnhancedEditPlanContent, EnhancedEditItem, EnhancedStoryboardContent, EnhancedScriptContent, Character } from '@/types';
import ToolLayout from '@/components/layouts/ToolLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Save, FilePlus, Download, ArrowUp, ArrowDown, RefreshCw, Film, Users, CheckCircle2 } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { type UseEmblaCarouselType } from "embla-carousel-react";

type CarouselApi = UseEmblaCarouselType[1];

export default function Editing() {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  // const location = useLocation();
  const pageTitle = "角色与分镜生成"; // t.assetEditor

  // 基础设置
  const [sourceVideoCardsId, setSourceVideoCardsId] = useState<string>('');
  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  // 来源镜头卡信息
  const [sourceVideoCards, setSourceVideoCards] = useState<Work | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);

  // 生成参数
  const [temperature, setTemperature] = useState(0.4);

  // 状态
  const [generatingCharacters, setGeneratingCharacters] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);

  // Auto-scroll logs
  useEffect(() => {
    if (generationLogs.length > 0) {
      const el = document.getElementById('log-end');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generationLogs]);

  const addLog = (msg: string) => {
    setGenerationLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // 生成结果
  const [items, setItems] = useState<EnhancedEditItem[]>([]);
  const [generatedContent, setGeneratedContent] = useState<EnhancedEditPlanContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  // Carousel 3D Effect
  useEffect(() => {
    if (!carouselApi) return;

    const onScroll = () => {
      // const scrollProgress = carouselApi.scrollProgress();
      const nodes = carouselApi.slideNodes();
      const rootNode = carouselApi.rootNode();
      const rootRect = rootNode.getBoundingClientRect();
      const center = rootRect.width / 2;
      
      nodes.forEach((node) => {
        const nodeRect = node.getBoundingClientRect();
        const nodeCenter = nodeRect.left - rootRect.left + nodeRect.width / 2;
        const dist = nodeCenter - center;
        const percent = dist / (rootRect.width / 1.5); // Adjust divisor for sensitivity

        // Clamp percent
        const clampedPercent = Math.max(-1, Math.min(1, percent));
        const absPercent = Math.abs(clampedPercent);

        // 3D Effects
        const baseScale = 1.08;
        const scale = baseScale - 0.12 * absPercent; // Center slightly enlarged, side cards ~0.96
        const rotateY = -clampedPercent * 20; // Subtler rotation
        const translateX = 0; 
        const translateZ = -40 * absPercent; // Less push back for bigger appearance
        const opacity = 1 - 0.15 * absPercent; // Slight fade only

        // Apply styles to the inner div (first child) to avoid conflict with embla layout if necessary,
        // but applying to node (CarouselItem) is also okay if it doesn't break layout.
        // Embla uses flexbox/grid for layout, so transform on item is fine.
        // However, we need to ensure we target the *content* of the item if we want to preserve spacing,
        // OR transform the item itself. Transforming item itself is standard for 3D carousels.
        
        node.style.transform = `perspective(1000px) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        node.style.opacity = opacity.toString();
        node.style.zIndex = Math.round((1 - absPercent) * 100).toString(); // Center items on top
      });
    };

    carouselApi.on("scroll", onScroll);
    carouselApi.on("reInit", onScroll);
    carouselApi.on("resize", onScroll);
    
    // Initial call
    onScroll();

    return () => {
      carouselApi.off("scroll", onScroll);
      carouselApi.off("reInit", onScroll);
      carouselApi.off("resize", onScroll);
    };
  }, [carouselApi]);

  // 获取所有镜头卡作品（用于来源选择）
  const allWorks = tableApi.get('works') as Work[] | Work | null;
  const videoCardsWorks = Array.isArray(allWorks)
    ? allWorks
        .filter(w => w.type === 'video_cards' && w.author_id === currentUser?.id)
        .sort((a, b) => b.updated_ms - a.updated_ms)
    : [];

  useEffect(() => {
    document.title = `${pageTitle} - ${t.appTitle}`;

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
      
      const vcContent = videoCards.content as EnhancedVideoCardsContent;
      // 优先使用镜头卡作品中已生成的人物集合
      if (vcContent.characters && vcContent.characters.length > 0) {
        setCharacters(vcContent.characters);
        return;
      }
      // 推导“整篇出现人物集合”
      let scriptContent: EnhancedScriptContent | null = null;
      let sbContent: EnhancedStoryboardContent | null = null;
      const nameSet = new Set<string>();

      // 从 Storyboard → Script 获取结构化角色与对话说话人
      if (vcContent.source?.storyboard_id) {
        const storyboard = tableApi.get('works', vcContent.source.storyboard_id) as Work | null;
        if (storyboard && storyboard.type === 'storyboard') {
          sbContent = storyboard.content as EnhancedStoryboardContent;
          if (sbContent.source?.script_id) {
            const script = tableApi.get('works', sbContent.source.script_id) as Work | null;
            if (script && script.type === 'script') {
              scriptContent = script.content as EnhancedScriptContent;
              // 说话人集合
              if (scriptContent.scenes) {
                scriptContent.scenes.forEach(scene => {
                  scene.dialogues?.forEach(d => {
                    if (d.speaker && d.speaker.trim()) {
                      nameSet.add(d.speaker.trim());
                    }
                  });
                });
              }
              // 结构化角色集合
              if (scriptContent.characters) {
                scriptContent.characters.forEach(c => {
                  if (c.name && c.name.trim()) {
                    nameSet.add(c.name.trim());
                  }
                });
              }
            }
          }
        }
      }

      // 从镜头卡的对白文本里粗略提取“姓名:内容”模式
      const tryExtractNames = (text: string) => {
        const names: string[] = [];
        const t = text || '';
        const lines = t.split(/\n/);
        lines.forEach(line => {
          const m = line.match(/^([\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5A-Za-z\s]{0,15})[：:]/);
          if (m && m[1]) {
            names.push(m[1].trim());
          }
        });
        return names;
      };
      if (vcContent.cards?.length) {
        vcContent.cards.forEach(card => {
          // 对白中常见的“姓名：台词”格式
          if (card.dialogue_voiceover) {
            tryExtractNames(card.dialogue_voiceover).forEach(n => nameSet.add(n));
          }
          // 角色动作里可能包含“某某做了XX”，这里不做复杂NLP，仅跳过
        });
      }

      // 根据出现集合筛选角色卡
      let appearingCharacters: Character[] = [];
      const lowerSet = new Set(Array.from(nameSet).map(n => n.toLowerCase()));
      const isZh = language === 'zh';

      if (scriptContent?.characters?.length) {
        appearingCharacters = scriptContent.characters.filter(c => lowerSet.has(c.name.toLowerCase()));
        // 如果集合为空，回退为剧本中的全部角色（避免空白）
        if (appearingCharacters.length === 0) {
          appearingCharacters = scriptContent.characters;
        }
      } 
      
      // 如果仍然为空（没有剧本或剧本没角色），或者我们需要补充缺失的角色（只有名字的）
      if (appearingCharacters.length === 0) {
        // 如果连名字都没提取到，强制添加一个默认主角
        if (lowerSet.size === 0) {
          lowerSet.add(isZh ? '主角' : 'Protagonist');
        }
        
        // 生成带详情的角色卡
        appearingCharacters = Array.from(lowerSet).map(n => generateMockCharacter(n, vcContent.genre || 'romance', isZh));
      }

      setCharacters(appearingCharacters);
    }
  };

  // API调用：生成角色样貌
  const performGenerateCharacterImage = async (char: Character): Promise<string> => {
    // 优化：移除 name 和 relation 以规避 "Real Person" (如威廉王子/戴安娜) 的安全策略限制
    // 仅使用 visual_desc (appearance) 和 traits。如果 appearance 为空，使用 generic fallback。
    const visualDesc = char.appearance || 'comic book character, detailed face';
    const traits = char.traits || '';
    
    const prompt = `comic book character concept art, ${visualDesc}, ${traits}, masterpiece, best quality, vibrant colors, white background`;
    
    // 使用统一的AI客户端调用已配置的Image Provider (如 Google Vertex AI)
    const result = await generateImage(prompt);
    
    if (result.ok && result.data?.image_url) {
      return result.data.image_url;
    }

    // Check if we got raw text instead (often safety refusal or text response)
    if (result.ok && result.data?.raw_text) {
        throw new Error(`AI Refusal/Text: ${result.data.raw_text.substring(0, 200)}...`);
    }
    
    throw new Error(result.error?.message || '生成图片失败');
  };

  // API调用：生成漫画分格图
  const performGeneratePanelImage = async (item: EnhancedEditItem, availableCharacters: Character[] = []): Promise<string> => {
    let prompt = `comic book panel, ${item.visual_desc || ''}, ${item.character_action || ''}, ${item.lighting_mood || ''}, ${item.camera_desc || ''}`;
    
    // 智能附加角色外观描述
    const relevantChars = availableCharacters.filter(c => {
      const textToCheck = `${item.visual_desc} ${item.character_action} ${item.caption_subtitle}`.toLowerCase();
      return textToCheck.includes(c.name.toLowerCase());
    });

    if (relevantChars.length > 0) {
      const charDescriptions = relevantChars.map(c => `(Character ${c.name}: ${c.appearance || 'detailed face'})`).join(', ');
      prompt += `, featuring ${charDescriptions}`;
    }

    prompt += `, webtoon style, high quality, detailed background, masterpiece, best quality`;
    
    const result = await generateImage(prompt);
    
    if (result.ok && result.data?.image_url) {
      return result.data.image_url;
    }

    // Check if we got raw text instead (often safety refusal or text response)
    if (result.ok && result.data?.raw_text) {
        throw new Error(`AI Refusal/Text: ${result.data.raw_text.substring(0, 200)}...`);
    }
    
    throw new Error(result.error?.message || '生成图片失败');
  };

  // 生成角色样貌
  const handleGenerateCharacters = async () => {
    if (characters.length === 0) {
      toast({ title: '没有检测到角色', variant: 'destructive' });
      return;
    }
    
    setGeneratingCharacters(true);
    setGenerationLogs([]); // Clear previous logs
    addLog('开始生成角色样貌...');
    toast({ title: '正在生成角色样貌...' });

    try {
      // Create a deep copy to ensure state updates trigger re-renders properly
      const updatedCharacters = characters.map(c => ({...c}));
      
      for (let i = 0; i < updatedCharacters.length; i++) {
        if (!updatedCharacters[i].image_url) {
          addLog(`正在生成角色: ${updatedCharacters[i].name}...`);
          
          let retryCount = 0;
          const MAX_RETRIES = 3;
          let success = false;

          while (retryCount <= MAX_RETRIES && !success) {
            try {
              const imageUrl = await performGenerateCharacterImage(updatedCharacters[i]);
              updatedCharacters[i].image_url = imageUrl;
              
              // Update state incrementally to show progress
              setCharacters([...updatedCharacters]); 
              addLog(`角色 ${updatedCharacters[i].name} 生成成功. URL: ${imageUrl.substring(0, 30)}...`);
              success = true;

            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : String(err);
              
              // Check for Rate Limit (429)
              if (errorMessage.includes('429') || errorMessage.includes('Rate limit') || errorMessage.includes('Throttling')) {
                 retryCount++;
                 if (retryCount <= MAX_RETRIES) {
                    const waitTime = 20000 * retryCount; // 20s, 40s, 60s
                    addLog(`角色 ${updatedCharacters[i].name} 生成遭遇限流 (429). 等待 ${waitTime/1000}秒后重试 (${retryCount}/${MAX_RETRIES})...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue; // Retry loop
                 }
              }

              console.error(err);
              addLog(`角色 ${updatedCharacters[i].name} 生成失败: ${errorMessage}`);
              break; // Break retry loop for non-429 or max retries
            }
          }

          // Add a delay to avoid rate limiting (e.g., Aliyun QPS limit), even if failed
          if (i < updatedCharacters.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 10000)); // Increased to 10s
          }
        } else {
            addLog(`角色 ${updatedCharacters[i].name} 已存在，跳过`);
        }
      }
      // Final update
      setCharacters(updatedCharacters);
      addLog('所有角色样貌生成流程结束');
      toast({ title: '角色样貌生成完成！' });
    } catch (error) {
      addLog(`生成过程发生错误: ${error}`);
      toast({ title: '生成失败', variant: 'destructive' });
    } finally {
      setGeneratingCharacters(false);
    }
  };

  // 生成单格漫画图
  const handleGeneratePanelImage = async (index: number) => {
    // 1. 设置临时状态 (使用函数式更新以获取最新状态)
    setItems(prevItems => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], notes: '正在生成图片...' };
      return updated;
    });
    
    addLog(`开始生成分格 ${index + 1} 图片...`);

    try {
      // 注意：这里我们使用 items[index] 可能不是最新的，但作为生成参数通常没问题
      // 如果需要最新的 items，应该用 useRef 或者在函数式更新里获取，但 generate 是异步的
      // 我们假设生成参数在点击瞬间确定
      const itemToGenerate = items[index]; 
      const imageUrl = await performGeneratePanelImage(itemToGenerate, characters);
      
      // 2. 更新结果 (再次使用函数式更新，确保不覆盖期间的其他修改)
      setItems(prevItems => {
        const finalUpdated = [...prevItems];
        finalUpdated[index] = { 
          ...finalUpdated[index], 
          image_url: imageUrl,
          notes: '' // 清除临时状态
        };
        return finalUpdated;
      });

      addLog(`分格 ${index + 1} 图片生成成功`);
      toast({ title: `分格 ${index + 1} 生成完成` });
    } catch (error) {
      setItems(prevItems => {
        const updated = [...prevItems];
        updated[index] = { ...updated[index], notes: '生成失败' }; // 恢复或显示错误
        return updated;
      });
      addLog(`分格 ${index + 1} 图片生成失败: ${error}`);
      toast({ title: '图片生成失败', variant: 'destructive' });
    }
  };

  // 辅助：生成Mock角色详情 (与mockGenerator保持一致的逻辑，确保前端也能补全)
  const generateMockCharacter = (name: string, genre: string, isZh: boolean): Character => {
    // 预设的性格库
    const traitsMap: Record<string, string[]> = {
      romance: isZh 
        ? ['温柔体贴，眼神深情', '活泼开朗，喜欢恶作剧', '高冷傲娇，内心柔软', '成熟稳重，值得信赖'] 
        : ['Gentle and caring, deep eyes', 'Bubbly and outgoing, likes pranks', 'Cool and tsundere, soft inside', 'Mature and reliable'],
      scifi: isZh 
        ? ['理智冷静，技术宅', '果断勇敢，富有领袖气质', '神秘莫测，拥有特殊能力', '忠诚可靠，执行力强'] 
        : ['Rational and calm, tech-savvy', 'Decisive and brave, leadership material', 'Mysterious, has special abilities', 'Loyal and reliable'],
      mystery: isZh 
        ? ['敏锐多疑，观察力强', '看似普通，实则深藏不露', '焦虑神经质，容易惊慌', '沉稳老练，经验丰富'] 
        : ['Sharp and suspicious, observant', 'Seemingly ordinary, hiding secrets', 'Anxious and neurotic, easily panicked', 'Calm and experienced'],
      default: isZh 
        ? ['性格开朗，乐于助人', '沉默寡言，行动派', '幽默风趣，气氛组', '认真严谨，一丝不苟'] 
        : ['Outgoing and helpful', 'Silent type, action-oriented', 'Humorous, mood maker', 'Serious and meticulous']
    };
  
    // 预设的关系库
    const relationsMap: Record<string, string[]> = {
      romance: isZh 
        ? ['青梅竹马', '暗恋对象', '竞争对手', '偶遇的路人'] 
        : ['Childhood friend', 'Crush', 'Rival', 'Passerby'],
      family: isZh 
        ? ['父亲', '母亲', '兄弟姐妹', '亲戚'] 
        : ['Father', 'Mother', 'Sibling', 'Relative'],
      campus: isZh 
        ? ['同班同学', '社团学长', '辅导员', '转校生'] 
        : ['Classmate', 'Club senior', 'Counselor', 'Transfer student'],
      default: isZh 
        ? ['主要角色', '关键证人', '反派', '路人角色'] 
        : ['Main Character', 'Key Witness', 'Villain', 'NPC']
    };

    // 预设的外貌库
    const appearanceMap: Record<string, string[]> = {
      default: isZh 
        ? ['身材匀称，穿着时尚', '高大帅气，眼神明亮', '娇小可爱，长发飘飘', '普通路人装扮'] 
        : ['Average build, stylish', 'Tall and handsome, bright eyes', 'Petite and cute, long hair', 'Ordinary look']
    };

    // 预设的经历库
    const experienceMap: Record<string, string[]> = {
      default: isZh
        ? ['一直生活在这个城市', '刚从外地搬来不久', '有着不为人知的过去', '普通的学生/上班族']
        : ['Lived in this city forever', 'Just moved here recently', 'Has a secret past', 'Ordinary student/office worker']
    };
  
    const genreKey = (traitsMap[genre] ? genre : 'default');
    const availableTraits = traitsMap[genreKey] || traitsMap['default'];
    const availableRelations = relationsMap[genreKey] || relationsMap['default'];
    const availableAppearance = appearanceMap['default'];
    const availableExperience = experienceMap['default'];
  
    // 简单的哈希选择
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const traitIndex = Math.abs(hash) % availableTraits.length;
    const relationIndex = Math.abs(hash) % availableRelations.length;
    const appearanceIndex = Math.abs(hash) % availableAppearance.length;
    const experienceIndex = Math.abs(hash) % availableExperience.length;
  
    return {
      name,
      traits: availableTraits[traitIndex],
      relation: availableRelations[relationIndex],
      appearance: availableAppearance[appearanceIndex],
      experience: availableExperience[experienceIndex]
    };
  };

  // 从来源镜头卡选择
  const handleSourceVideoCardsChange = (videoCardsId: string) => {
    if (videoCardsId === 'none') {
      setSourceVideoCardsId('');
      setSourceVideoCards(null);
      setCharacters([]);
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

    // const totalSec = items.reduce((sum, item) => sum + item.duration_sec, 0);
    
    let txt = `# 项目：${title || '未命名'}\n`;
    txt += `# 总条目数：${items.length}\n\n`;

    items.forEach(item => {
      txt += `${String(item.item_no).padStart(2, '0')} | 镜头/分镜引用: ${item.shot_ref}\n`;
      txt += `画面描述：${item.asset_need}\n`;
      txt += `对白/字幕：${item.caption_subtitle}\n`;
      txt += `提示词引用：${item.source_prompt_ref}\n`;
      if (item.voice_sfx) txt += `音效/配音：${item.voice_sfx}\n`;
      if (item.notes) txt += `备注：${item.notes}\n`;
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-semibold text-foreground text-lg flex items-center">
            <span className="bg-primary/10 p-1.5 rounded-md mr-2">
              <Film className="h-4 w-4 text-primary" />
            </span>
            资源加载
          </Label>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
           <div className="p-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
             来源镜头卡
           </div>
           <div className="p-4">
              <Select value={sourceVideoCardsId || 'none'} onValueChange={handleSourceVideoCardsChange}>
                <SelectTrigger className="bg-background border-input">
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
        </div>
      </div>

      {sourceVideoCards && (
        <div className="bg-primary/5 rounded-lg border border-primary/10 p-4 space-y-3">
          <Label className="font-semibold text-primary flex items-center text-sm">
            <CheckCircle2 className="w-3 h-3 mr-1.5" />
            镜头卡信息
          </Label>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
               <span className="text-muted-foreground">标题</span>
               <span className="font-medium truncate max-w-[150px]">{sourceVideoCards.title}</span>
            </div>
            <div className="flex justify-between">
               <span className="text-muted-foreground">题材</span>
               <span className="font-medium">{(sourceVideoCards.content as EnhancedVideoCardsContent).genre}</span>
            </div>
            <div className="flex justify-between">
               <span className="text-muted-foreground">卡片数</span>
               <span className="font-medium">{(sourceVideoCards.content as EnhancedVideoCardsContent).cards?.length || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* 角色列表 (始终显示) */}
      {characters.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
              <Label className="font-semibold text-foreground text-lg flex items-center">
                <span className="bg-primary/10 p-1.5 rounded-md mr-2">
                  <Users className="h-4 w-4 text-primary" />
                </span>
                登场角色
              </Label>
          </div>
          
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
               <div className="p-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                 角色概览 ({characters.length})
               </div>
               <div className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {characters.map((char, idx) => (
                      <div key={idx} className="relative group">
                        <div className="aspect-[2/3] bg-muted rounded-md overflow-hidden border border-border">
                          {char.image_url ? (
                            <img 
                              src={char.image_url} 
                              alt={char.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-red-500 p-2 text-center bg-gray-100 dark:bg-gray-800">加载失败</div>';
                                console.error(`Image load failed for ${char.name}: ${char.image_url}`);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center bg-gray-100 dark:bg-gray-800">
                              待生成
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-center mt-1 truncate font-medium">{char.name}</div>
                      </div>
                    ))}
                  </div>
               </div>
          </div>
        </div>
      )}
    </div>
  );

  // 中栏：按钮行 + 剪辑清单编辑器
  const centerPanel = (
    <div className="space-y-6 animate-slide-in">
      {/* 生成日志面板 (仅在有日志时显示) */}
      {generationLogs.length > 0 && (
        <Card className="bg-black/90 text-green-400 font-mono text-sm p-4 max-h-48 overflow-y-auto border-green-900/50 shadow-inner">
          <div className="flex justify-between items-center mb-2 border-b border-green-900/50 pb-1 sticky top-0 bg-black/90">
            <span className="font-bold flex items-center gap-2">
              <Loader2 className={`h-3 w-3 ${generatingCharacters ? 'animate-spin' : ''}`} />
              生成日志
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 text-xs text-green-600 hover:text-green-400 hover:bg-green-900/20"
              onClick={() => setGenerationLogs([])}
            >
              清除
            </Button>
          </div>
          <div className="space-y-1">
            {generationLogs.map((log, i) => (
              <div key={i} className="break-all whitespace-pre-wrap">{log}</div>
            ))}
            <div id="log-end" />
          </div>
        </Card>
      )}

      {/* 卡组预览 (Moved from Left Panel) */}
      {sourceVideoCards && Boolean((sourceVideoCards.content as EnhancedVideoCardsContent).cards?.length) && (
        <div className="mb-6">
          <Label className="font-semibold text-foreground mb-3 flex items-center text-lg">
             <span className="bg-primary/10 p-1.5 rounded-md mr-2">
                <span className="text-primary text-sm font-bold">🖼️</span>
              </span>
            卡组预览
          </Label>
          <div className="relative perspective-1000">
            <Carousel 
              className="w-full"
              setApi={setCarouselApi}
              opts={{
                align: 'center',
                loop: true,
              }}
            >
              <CarouselContent className="-ml-2 xl:-ml-3 py-12">
                {/* 角色卡 */}
                {characters.map((char, idx) => (
                  <CarouselItem key={`char-${idx}`} className="pl-4 basis-[95%] md:basis-[90%] transition-all duration-300 ease-out">
                    <div className="group relative h-full overflow-hidden rounded-xl border-2 border-primary/20 bg-card text-card-foreground shadow-sm transition-all hover:shadow-md mx-auto max-w-4xl flex flex-col md:flex-row">
                      {char.image_url && (
                        <div className="w-full md:w-1/3 h-64 md:h-auto relative bg-muted border-r border-border/50">
                           <img 
                             src={char.image_url} 
                             alt={char.name} 
                             className="absolute inset-0 w-full h-full object-cover" 
                             referrerPolicy="no-referrer"
                             onError={(e) => {
                               const target = e.target as HTMLImageElement;
                               target.style.display = 'none';
                               console.error(`Carousel Image load failed for ${char.name}: ${char.image_url}`);
                             }}
                           />
                        </div>
                      )}
                      <div className={`relative p-8 space-y-6 ${char.image_url ? 'w-full md:w-2/3' : 'w-full'}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                          <span className="text-8xl font-black">CHAR</span>
                        </div>
                        
                        <div className="flex items-center justify-between border-b pb-4 relative z-10">
                          <span className="text-lg font-semibold text-primary">角色卡</span>
                          <span className="text-2xl font-bold">{char.name}</span>
                        </div>
                        
                        <div className="space-y-4 relative z-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">身份/关系</Label>
                              <p className="text-base font-medium text-foreground bg-primary/5 p-3 rounded-lg shadow-sm min-h-[3rem] flex items-center">
                                {char.relation}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">性格特征</Label>
                              <p className="text-base leading-relaxed text-foreground/90 bg-primary/5 p-3 rounded-lg min-h-[3rem] shadow-sm flex items-center">
                                {char.traits}
                              </p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">外貌特征</Label>
                            <p className="text-base leading-relaxed text-foreground/90 bg-primary/5 p-4 rounded-lg min-h-[4rem] shadow-sm">
                              {char.appearance || '暂无描述'}
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">经历/背景</Label>
                            <p className="text-base leading-relaxed text-foreground/90 bg-primary/5 p-4 rounded-lg min-h-[4rem] shadow-sm">
                              {char.experience || '暂无描述'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}

                {/* 镜头卡 */}
                {(sourceVideoCards.content as EnhancedVideoCardsContent).cards.map((card, idx) => (
                  <CarouselItem key={idx} className="pl-4 basis-[95%] md:basis-[90%] transition-all duration-300 ease-out">
                    <div className="group relative h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md mx-auto max-w-4xl">
                      <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                          <span className="text-lg font-semibold text-muted-foreground">卡片 #{card.card_no}</span>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                              镜头 {card.shot_ref}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">画面描述</Label>
                            <p className="text-base leading-relaxed text-foreground/90 bg-muted/30 p-4 rounded-lg min-h-[6rem] shadow-inner">
                              {card.visual_desc || '暂无描述'}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">机位/镜头</Label>
                              <p className="text-base font-medium text-foreground truncate bg-muted/30 p-3 rounded-lg shadow-sm">
                                {card.camera_desc || '-'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">出场人物/动作/对白</Label>
                              <div className="bg-muted/30 p-3 rounded-lg shadow-sm space-y-2">
                                <p className="text-base font-medium text-foreground" title={card.character_action}>
                                  <span className="text-xs text-muted-foreground block mb-1">动作:</span>
                                  {card.character_action || '-'}
                                </p>
                                {card.dialogue_voiceover && (
                                  <p className="text-base font-medium text-foreground border-t pt-2 mt-2 border-border/50" title={card.dialogue_voiceover}>
                                    <span className="text-xs text-muted-foreground block mb-1">对白:</span>
                                    {card.dialogue_voiceover}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 lg:-left-8 h-12 w-12 border-2" />
              <CarouselNext className="-right-4 lg:-right-8 h-12 w-12 border-2" />
            </Carousel>
          </div>
        </div>
      )}

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
          onClick={handleGenerateCharacters}
          disabled={generatingCharacters || characters.length === 0}
          className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {generatingCharacters ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              生成角色样貌...
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5 mr-2" />
              生成角色样貌
            </>
          )}
        </Button>
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
            <>
              <FilePlus className="h-5 w-5 mr-2" />
              生成分镜清单
            </>
          )}
        </Button>
      </div>

      {/* 进度日志 */}
      {generationLogs.length > 0 && (
        <div className="p-4 bg-muted/30 rounded-lg border border-border text-xs font-mono max-h-40 overflow-y-auto">
          <Label className="text-sm font-semibold text-muted-foreground mb-2 block">生成日志</Label>
          <div className="space-y-1">
            {generationLogs.map((log, i) => (
              <div key={i} className="text-muted-foreground">{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* 剪辑清单编辑器 */}
      {items.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="font-semibold text-foreground text-lg flex items-center">
              <span className="bg-primary/10 p-1.5 rounded-md mr-2">
                <span className="text-primary text-sm font-bold">📋</span>
              </span>
              分镜/资源清单
            </Label>
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
            <Card key={index} className="p-0 mb-6 bg-card border border-border hover:shadow-lg transition-all overflow-hidden group">
              <div className="bg-muted/30 px-4 py-3 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-md min-w-[3rem] text-center">
                     #{item.item_no}
                   </div>
                   <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">镜头引用:</span>
                        <Input
                          type="number"
                          value={item.shot_ref}
                          onChange={(e) => updateItem(index, 'shot_ref', parseInt(e.target.value) || 1)}
                          className="h-6 w-12 text-center bg-background border-border p-0"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Prompt引用:</span>
                        <Input
                          type="number"
                          value={item.source_prompt_ref}
                          onChange={(e) => updateItem(index, 'source_prompt_ref', parseInt(e.target.value) || 1)}
                          className="h-6 w-12 text-center bg-background border-border p-0"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">时长:</span>
                        <Input
                          type="number"
                          value={item.duration_sec}
                          onChange={(e) => updateItem(index, 'duration_sec', parseInt(e.target.value) || 1)}
                          className="h-6 w-12 text-center bg-background border-border p-0"
                        />
                        <span>s</span>
                      </div>
                   </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveItem(index, 'up')} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">画面描述</Label>
                    <Textarea
                      value={item.asset_need}
                      onChange={(e) => updateItem(index, 'asset_need', e.target.value)}
                      rows={2}
                      className="bg-muted/10 border-border resize-none focus:bg-background transition-colors"
                      placeholder="画面详细描述..."
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">音效/配音</Label>
                    <Textarea
                      value={item.voice_sfx}
                      onChange={(e) => updateItem(index, 'voice_sfx', e.target.value)}
                      rows={2}
                      className="bg-muted/10 border-border resize-none focus:bg-background transition-colors"
                      placeholder="所需的音效或配音内容..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">转场/边框</Label>
                      <Input
                        value={item.transition}
                        onChange={(e) => updateItem(index, 'transition', e.target.value)}
                        className="bg-muted/10 border-border focus:bg-background transition-colors"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">对白/字幕</Label>
                      <Input
                        value={item.caption_subtitle}
                        onChange={(e) => updateItem(index, 'caption_subtitle', e.target.value)}
                        className="bg-muted/10 border-border focus:bg-background transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">备注</Label>
                    <Input
                      value={item.notes}
                      onChange={(e) => updateItem(index, 'notes', e.target.value)}
                      className="bg-muted/10 border-border focus:bg-background transition-colors"
                      placeholder="其他制作备注..."
                    />
                  </div>
                </div>

                {/* 图片预览区域 */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">生成结果</Label>
                  <div className="aspect-[4/3] bg-muted/10 border-2 border-dashed border-border rounded-lg overflow-hidden flex items-center justify-center relative group hover:border-primary/50 transition-colors">
                    {item.image_url ? (
                      <img src={item.image_url} alt={`Panel ${item.item_no}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-muted-foreground text-sm flex flex-col items-center">
                        <RefreshCw className="h-8 w-8 mb-2 opacity-30" />
                        <span className="opacity-50">等待生成</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          size="sm" 
                          onClick={() => handleGeneratePanelImage(index)}
                          className="bg-white text-black hover:bg-gray-200"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          {item.image_url ? '重新生成' : '生成图片'}
                        </Button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    *基于角色卡和画面描述生成
                  </p>
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
            className="flex-1 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md"
          >
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
          <Button
            onClick={handleSaveAs}
            variant="outline"
            className="flex-1 h-11 border-2 border-border hover:border-primary/50 hover:bg-muted/50"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            另存为
          </Button>
          <Button
            onClick={handleExportTXT}
            variant="outline"
            className="flex-1 h-11 border-2 border-border hover:border-primary/50 hover:bg-muted/50"
          >
            <Download className="h-4 w-4 mr-2" />
            导出TXT
          </Button>
          <Button
            onClick={handleExportJSON}
            variant="outline"
            className="flex-1 h-11 border-2 border-border hover:border-primary/50 hover:bg-muted/50"
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
            <p>条目数量：<span className="text-primary font-semibold">{items.length}</span></p>
            {sourceVideoCards && (
              <p>来源镜头卡：<span className="text-primary font-semibold">{(sourceVideoCards.content as EnhancedVideoCardsContent).cards?.length || 0}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return <ToolLayout leftPanel={leftPanel} centerPanel={centerPanel} rightPanel={rightPanel} transparentCenter={true} />;
}
