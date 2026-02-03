// 后台管理页面 - 多API接入版本

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
// import { useAuth } from '@/contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Settings, Key, Database, Users, FileText, Plus, Trash2, Copy, TestTube, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import type { ApiProvider, ApiRouting, FunctionRouting, ProviderType, TaskType, ProviderTestResult } from '@/types';
import { testProvider as testProviderApi } from '@/lib/aiClient';

export default function Admin() {
  const { t } = useLanguage();
  // const { currentUser } = useAuth();
  // const navigate = useNavigate();
  const { toast } = useToast();

  // Providers状态
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [editingProvider, setEditingProvider] = useState<ApiProvider | null>(null);
  const [showProviderDialog, setShowProviderDialog] = useState(false);

  // Routing状态
  const [routing, setRouting] = useState<ApiRouting | null>(null);
  const [expandedParams, setExpandedParams] = useState<Record<TaskType, boolean>>({
    script: false,
    storyboard: false,
    video_cards: false,
    edit_plan: false,
    image_storyboard: false,
    image_shot: false,
    image_generation: false
  });

  // UI状态
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  useEffect(() => {
    document.title = `后台管理 - ${t.appTitle}`;
    loadConfig();
  }, [t]);

  // 加载配置
  const loadConfig = () => {
    // 加载Providers
    let currentProviders: ApiProvider[] = [];
    const providersStr = localStorage.getItem('api_providers');
    if (providersStr) {
      try {
        currentProviders = JSON.parse(providersStr);
      } catch (e) {
        console.error('加载Providers失败:', e);
      }
    }

    // Auto-inject Google Vertex AI (Image Generation)
    const googleProviderId = 'provider_google_vertex_ai';
    const googleApiKey = 'AQ.Ab8RN6KQHMc-n2XNz2qj2EmzeIctmBikq6IovUPEM7h7vFLg9Q';
    // Check if we already have this provider (by ID or Key)
    const existingGoogleIndex = currentProviders.findIndex(p => p.id === googleProviderId || p.api_key === googleApiKey);
    
    const googleProviderConfig: ApiProvider = {
        id: googleProviderId,
        name: 'Google Vertex AI (Image)',
        type: 'image',
        enabled: true,
        base_url: 'https://generativelanguage.googleapis.com/v1beta',
        api_key: 'AIzaSyC7TS8aHjN_WbYRWLj8tsg2mRvhBC-IWuY',
        default_model: 'gemini-2.0-flash', // For AI Studio API Key, use Gemini 2.0 Native Image Generation
        created_ms: Date.now(),
        updated_ms: Date.now()
    };

    if (existingGoogleIndex >= 0) {
        // Update existing to ensure type is image
        currentProviders[existingGoogleIndex] = {
            ...currentProviders[existingGoogleIndex],
            ...googleProviderConfig,
            id: currentProviders[existingGoogleIndex].id // keep original ID if matched by key
        };
    } else {
        currentProviders.push(googleProviderConfig);
    }

    // Auto-inject DeepSeek (LLM)
    const deepseekProviderId = 'provider_deepseek';
    const deepseekApiKey = 'sk-ec1f6aba72ab4a359f5fb32d24ccc562';
    const existingDeepseekIndex = currentProviders.findIndex(p => p.id === deepseekProviderId || p.api_key === deepseekApiKey);

    const deepseekProviderConfig: ApiProvider = {
        id: deepseekProviderId,
        name: 'DeepSeek',
        type: 'llm',
        enabled: true,
        base_url: 'https://api.deepseek.com',
        api_key: deepseekApiKey,
        default_model: 'deepseek-chat',
        created_ms: Date.now(),
        updated_ms: Date.now()
    };

    if (existingDeepseekIndex >= 0) {
         currentProviders[existingDeepseekIndex] = {
            ...currentProviders[existingDeepseekIndex],
            ...deepseekProviderConfig,
            id: currentProviders[existingDeepseekIndex].id
        };
    } else {
        currentProviders.push(deepseekProviderConfig);
    }

    // Auto-inject SiliconFlow Template (Recommended for Flux)
    const siliconProviderId = 'provider_siliconflow';
    // Only add if not present to avoid overwriting user settings
    const existingSiliconIndex = currentProviders.findIndex(p => p.id === siliconProviderId || p.base_url.includes('siliconflow'));
    
    if (existingSiliconIndex === -1) {
         currentProviders.push({
            id: siliconProviderId,
            name: 'SiliconFlow (Flux.1) - 国内访问快',
            type: 'image',
            enabled: false, // Disabled by default until user adds key
            base_url: 'https://api.siliconflow.cn/v1',
            api_key: '', 
            default_model: 'black-forest-labs/FLUX.1-schnell',
            created_ms: Date.now(),
            updated_ms: Date.now()
        });
    }

    // Auto-inject Zhipu AI (CogView) Template
    const zhipuProviderId = 'provider_zhipu';
    const existingZhipuIndex = currentProviders.findIndex(p => p.id === zhipuProviderId || p.base_url.includes('bigmodel.cn'));

    if (existingZhipuIndex === -1) {
        currentProviders.push({
            id: zhipuProviderId,
            name: '智谱 AI (CogView-3)',
            type: 'image',
            enabled: false,
            base_url: 'https://open.bigmodel.cn/api/paas/v4',
            api_key: '',
            default_model: 'cogview-3',
            created_ms: Date.now(),
            updated_ms: Date.now()
        });
    }

    // Auto-inject Aliyun (Tongyi Wanxiang/Qwen) Template
    const aliyunProviderId = 'provider_aliyun_wanx';
    const aliyunApiKey = 'sk-49d45893cee643f39d295a96a4386aca'; // Pre-filled from user request
    const existingAliyunIndex = currentProviders.findIndex(p => p.id === aliyunProviderId || p.base_url.includes('dashscope'));

    const aliyunProviderConfig: ApiProvider = {
        id: aliyunProviderId,
        name: '阿里云 (通义万相 - Qwen)',
        type: 'image',
        enabled: true, // Enable by default since we have a key
        base_url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
        api_key: aliyunApiKey,
        default_model: 'qwen-image-max',
        created_ms: Date.now(),
        updated_ms: Date.now()
    };

    if (existingAliyunIndex >= 0) {
        // Update existing if key is missing or to ensure settings
        if (!currentProviders[existingAliyunIndex].api_key) {
             currentProviders[existingAliyunIndex] = {
                ...currentProviders[existingAliyunIndex],
                ...aliyunProviderConfig,
                id: currentProviders[existingAliyunIndex].id
            };
        }
    } else {
        currentProviders.push(aliyunProviderConfig);
    }
    
    // Save updated providers
    localStorage.setItem('api_providers', JSON.stringify(currentProviders));
    setProviders(currentProviders);

    // 加载Routing
    let currentRouting: ApiRouting | null = null;
    const routingStr = localStorage.getItem('api_routing');
    
    // Default Routing Structure
    const defaultRoutingStruct: ApiRouting = {
        script: createDefaultRouting(),
        storyboard: createDefaultRouting(),
        video_cards: createDefaultRouting(),
        edit_plan: createDefaultRouting(),
        image_storyboard: createDefaultRouting(),
        image_shot: createDefaultRouting(),
        image_generation: createDefaultRouting()
    };

    if (routingStr) {
      try {
        currentRouting = JSON.parse(routingStr);
        // Ensure image_generation exists in currentRouting if loaded from old config
        if (currentRouting && !currentRouting.image_generation) {
            currentRouting.image_generation = createDefaultRouting();
        }
      } catch (e) {
        console.error('加载Routing失败:', e);
      }
    }
    
    if (!currentRouting) {
        currentRouting = defaultRoutingStruct;
    }
    
    // Apply Routing Logic
    let routingUpdated = false;

    // 1. Configure DeepSeek for Text Tasks (Script, Storyboard, Video Cards, Edit Plan)
    const textTasks: TaskType[] = ['script', 'storyboard', 'video_cards', 'edit_plan'];
    textTasks.forEach(task => {
        if (currentRouting && currentRouting[task]) {
            // Only set if not configured or if we want to force DeepSeek as default for text
            // Here we only set if provider is empty to respect user choice, 
            // OR if it was using the old default OpenAI but we want to recommend DeepSeek
            if (!currentRouting[task].provider_id || currentRouting[task].provider_id === 'provider_openai') {
                currentRouting[task].enabled = true;
                currentRouting[task].provider_id = deepseekProviderId;
                currentRouting[task].model = 'deepseek-chat';
                routingUpdated = true;
            }
        }
    });

    // 2. Configure Image Tasks (Image Storyboard, Image Shot, Image Generation)
    // Priority: Aliyun (User Request) > Google (Fallback) > SiliconFlow
    const imageTasks: TaskType[] = ['image_storyboard', 'image_shot', 'image_generation'];
    const preferredImageProviderId = aliyunProviderId; // Prioritize Aliyun Qwen-Image
    
    imageTasks.forEach(task => {
        if (currentRouting && currentRouting[task]) {
             // If not configured, or if we want to switch to the new preferred provider (Aliyun)
             // We'll switch to Aliyun if it's currently Google or empty, to ensure the user's new key is used.
             if (!currentRouting[task].provider_id || currentRouting[task].provider_id === googleProviderId) {
                currentRouting[task].enabled = true;
                currentRouting[task].provider_id = preferredImageProviderId;
                currentRouting[task].model = 'qwen-image-max';
                routingUpdated = true;
             }
        }
    });

    if (routingUpdated) {
        localStorage.setItem('api_routing', JSON.stringify(currentRouting));
        setTimeout(() => toast({ title: '系统配置更新', description: '已自动配置通义万相(Qwen)为绘图引擎' }), 1000);
    }

    setRouting(currentRouting);
  };

  // 创建默认路由配置
  const createDefaultRouting = (): FunctionRouting => ({
    enabled: false,
    provider_id: '',
    model: '',
    output_format: 'json',
    params: {
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 0.9
    }
  });

  // 保存Providers
  const saveProviders = () => {
    localStorage.setItem('api_providers', JSON.stringify(providers));
    toast({
      title: '保存成功',
      description: 'Providers配置已保存'
    });
  };

  // 保存Routing
  const saveRouting = () => {
    if (!routing) return;
    localStorage.setItem('api_routing', JSON.stringify(routing));
    toast({
      title: '保存成功',
      description: '路由配置已保存'
    });
  };

  // 新增Provider
  const addProvider = () => {
    const newProvider: ApiProvider = {
      id: `provider_${Date.now()}`,
      name: '新Provider',
      type: 'llm',
      enabled: true,
      base_url: 'https://api.openai.com/v1',
      api_key: '',
      default_model: 'gpt-4',
      created_ms: Date.now(),
      updated_ms: Date.now()
    };
    setEditingProvider(newProvider);
    setShowProviderDialog(true);
  };

  // 编辑Provider
  const editProvider = (provider: ApiProvider) => {
    setEditingProvider({ ...provider });
    setShowProviderDialog(true);
  };

  // 删除Provider
  const deleteProvider = (id: string) => {
    if (confirm('确定要删除这个Provider吗？')) {
      setProviders(providers.filter(p => p.id !== id));
      toast({
        title: '删除成功',
        description: 'Provider已删除'
      });
    }
  };

  // 复制Provider
  const duplicateProvider = (provider: ApiProvider) => {
    const newProvider: ApiProvider = {
      ...provider,
      id: `provider_${Date.now()}`,
      name: `${provider.name} (副本)`,
      created_ms: Date.now(),
      updated_ms: Date.now()
    };
    setProviders([...providers, newProvider]);
    toast({
      title: '复制成功',
      description: 'Provider已复制'
    });
  };

  // 保存Provider编辑
  const saveProviderEdit = () => {
    if (!editingProvider) return;

    const index = providers.findIndex(p => p.id === editingProvider.id);
    if (index >= 0) {
      // 更新现有Provider
      const updated = [...providers];
      updated[index] = { ...editingProvider, updated_ms: Date.now() };
      setProviders(updated);
    } else {
      // 新增Provider
      setProviders([...providers, editingProvider]);
    }

    setShowProviderDialog(false);
    setEditingProvider(null);
    toast({
      title: '保存成功',
      description: 'Provider配置已更新'
    });
  };

  // 测试Provider
  const testProvider = async (provider: ApiProvider) => {
    setTestingProvider(provider.id);
    try {
      const result: ProviderTestResult = await testProviderApi(provider);
      if (result.success) {
        toast({
          title: '测试成功',
          description: result.message || `连接成功！延迟: ${result.latency}ms`
        });
      } else {
        toast({
          title: '测试失败',
          description: result.error || '连接失败',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '测试失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setTestingProvider(null);
    }
  };

  // 更新路由配置
  const updateRouting = (taskType: TaskType, updates: Partial<FunctionRouting>) => {
    if (!routing) return;
    setRouting({
      ...routing,
      [taskType]: {
        ...routing[taskType],
        ...updates
      }
    });
  };

  // 获取指定类型的Providers
  const getProvidersByType = (type: ProviderType): ApiProvider[] => {
    return providers.filter(p => p.type === type && p.enabled);
  };

  // 调试阶段：暂时移除登录限制，方便开发调试
  // TODO: 生产环境需要恢复登录验证
  /*
  // 未登录时显示提示
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">需要登录</CardTitle>
            <CardDescription className="text-center">
              请先登录以访问后台管理功能
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Key className="h-16 w-16 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground text-center">
              后台管理功能仅对登录用户开放
            </p>
            <Button
              onClick={() => navigate('/')}
              className="w-full"
            >
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  */

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">后台管理</h1>
        <p className="text-muted-foreground">配置多API接入与路由</p>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Providers</span>
          </TabsTrigger>
          <TabsTrigger value="routing" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">功能路由</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">数据管理</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">用户管理</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">内容管理</span>
          </TabsTrigger>
        </TabsList>

        {/* Providers管理 */}
        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Providers管理</CardTitle>
                  <CardDescription>
                    管理多个API服务提供商（LLM、Image、TTS、ASR）
                  </CardDescription>
                </div>
                <Button onClick={addProvider}>
                  <Plus className="h-4 w-4 mr-2" />
                  新增Provider
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {providers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Key className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>还没有配置Provider</p>
                  <p className="text-sm mt-2">点击"新增Provider"开始配置</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {providers.map((provider) => (
                    <Card key={provider.id} className={`${!provider.enabled ? 'opacity-50' : ''}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{provider.name}</CardTitle>
                            <CardDescription>
                              类型: {provider.type.toUpperCase()} | 模型: {provider.default_model}
                            </CardDescription>
                          </div>
                          <Switch
                            checked={provider.enabled}
                            onCheckedChange={(checked) => {
                              const updated = providers.map(p =>
                                p.id === provider.id ? { ...p, enabled: checked } : p
                              );
                              setProviders(updated);
                            }}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Base URL</Label>
                          <p className="text-sm truncate">{provider.base_url}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">API Key</Label>
                          <div className="flex items-center gap-2">
                            <p className="text-sm flex-1 truncate">
                              {showApiKey[provider.id]
                                ? provider.api_key
                                : '••••••••••••••••'}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowApiKey({
                                ...showApiKey,
                                [provider.id]: !showApiKey[provider.id]
                              })}
                            >
                              {showApiKey[provider.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testProvider(provider)}
                            disabled={testingProvider === provider.id}
                          >
                            <TestTube className="h-4 w-4 mr-1" />
                            {testingProvider === provider.id ? '测试中...' : '测试连接'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editProvider(provider)}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateProvider(provider)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteProvider(provider.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={saveProviders}>保存配置</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 功能路由 */}
        <TabsContent value="routing">
          <Card>
            <CardHeader>
              <CardTitle>功能路由配置</CardTitle>
              <CardDescription>
                为每个功能点配置使用的Provider和参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {routing && (
                <>
                  {/* 剧本生成 */}
                  {renderRoutingConfig('script', '剧本生成', 'llm')}
                  
                  {/* 分镜生成 */}
                  {renderRoutingConfig('storyboard', '分镜生成', 'llm')}
                  
                  {/* 镜头卡生成 */}
                  {renderRoutingConfig('video_cards', '镜头卡生成', 'llm')}
                  
                  {/* 剪辑计划生成 */}
                  {renderRoutingConfig('edit_plan', '剪辑计划生成', 'llm')}
                  
                  {/* 分镜图生成 */}
                  {renderRoutingConfig('image_storyboard', '分镜图生成', 'image')}
                  
                  {/* 镜头图生成 */}
                  {renderRoutingConfig('image_shot', '镜头图生成', 'image')}
                </>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={saveRouting}>保存配置</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据管理 */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>数据管理</CardTitle>
              <CardDescription>管理本地存储的数据</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">数据管理功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户管理 */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>管理用户账号和权限</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">用户管理功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 内容管理 */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>内容管理</CardTitle>
              <CardDescription>管理新闻、链接等内容</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">内容管理功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Provider编辑对话框 */}
      {showProviderDialog && editingProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {providers.find(p => p.id === editingProvider.id) ? '编辑Provider' : '新增Provider'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Provider名称</Label>
                <Input
                  value={editingProvider.name}
                  onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                  placeholder="例如: OpenAI-主用"
                />
              </div>

              <div>
                <Label>类型</Label>
                <Select
                  value={editingProvider.type}
                  onValueChange={(value: ProviderType) =>
                    setEditingProvider({ ...editingProvider, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llm">LLM (文本生成)</SelectItem>
                    <SelectItem value="image">Image (文生图)</SelectItem>
                    <SelectItem value="tts">TTS (文本转语音)</SelectItem>
                    <SelectItem value="asr">ASR (语音转文本)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Base URL</Label>
                <Input
                  value={editingProvider.base_url}
                  onChange={(e) => setEditingProvider({ ...editingProvider, base_url: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                />
              </div>

              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={editingProvider.api_key}
                  onChange={(e) => setEditingProvider({ ...editingProvider, api_key: e.target.value })}
                  placeholder="sk-..."
                />
              </div>

              <div>
                <Label>默认模型</Label>
                <Input
                  value={editingProvider.default_model}
                  onChange={(e) => setEditingProvider({ ...editingProvider, default_model: e.target.value })}
                  placeholder="gpt-4"
                />
              </div>

              <div>
                <Label>自定义Headers (JSON格式，可选)</Label>
                <div className="text-xs text-muted-foreground mb-1">
                    对于 Google Vertex AI，请在此处配置 Project ID 和 Location：
                    <code className="block bg-muted p-1 rounded mt-1">
                        {`{"project_id": "YOUR_PROJECT_ID", "location": "us-central1"}`}
                    </code>
                </div>
                <Textarea
                  value={editingProvider.headers_json || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, headers_json: e.target.value })}
                  placeholder='{"X-Custom-Header": "value"}'
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowProviderDialog(false);
                    setEditingProvider(null);
                  }}
                >
                  取消
                </Button>
                <Button onClick={saveProviderEdit}>保存</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  // 渲染路由配置
  function renderRoutingConfig(taskType: TaskType, label: string, providerType: ProviderType) {
    if (!routing) return null;
    const config = routing[taskType];
    const availableProviders = getProvidersByType(providerType);

    return (
      <Card key={taskType}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{label}</CardTitle>
              <CardDescription>
                配置{label}使用的Provider和参数
              </CardDescription>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => updateRouting(taskType, { enabled: checked })}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div>
              <Label>Provider</Label>
              <Select
                value={config.provider_id}
                onValueChange={(value) => updateRouting(taskType, { provider_id: value })}
                disabled={!config.enabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择Provider" />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.length === 0 ? (
                    <SelectItem value="none" disabled>
                      没有可用的{providerType.toUpperCase()} Provider
                    </SelectItem>
                  ) : (
                    availableProviders.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>模型</Label>
              <Input
                value={config.model}
                onChange={(e) => updateRouting(taskType, { model: e.target.value })}
                placeholder="留空使用Provider默认模型"
                disabled={!config.enabled}
              />
            </div>

            {providerType === 'llm' && (
              <>
                <div>
                  <Label>输出格式</Label>
                  <Select
                    value={config.output_format}
                    onValueChange={(value: 'json' | 'md') =>
                      updateRouting(taskType, { output_format: value })
                    }
                    disabled={!config.enabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="md">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fallback Provider (可选)</Label>
                  <Select
                    value={config.fallback_provider_id || 'none'}
                    onValueChange={(value) =>
                      updateRouting(taskType, {
                        fallback_provider_id: value === 'none' ? undefined : value
                      })
                    }
                    disabled={!config.enabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="无" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无</SelectItem>
                      {availableProviders
                        .filter((p) => p.id !== config.provider_id)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {/* 高级参数 */}
          {providerType === 'llm' && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setExpandedParams({
                    ...expandedParams,
                    [taskType]: !expandedParams[taskType]
                  })
                }
                disabled={!config.enabled}
              >
                {expandedParams[taskType] ? (
                  <ChevronUp className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                高级参数
              </Button>

              {expandedParams[taskType] && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Temperature</Label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.params.temperature}
                      onChange={(e) =>
                        updateRouting(taskType, {
                          params: {
                            ...config.params,
                            temperature: parseFloat(e.target.value)
                          }
                        })
                      }
                      disabled={!config.enabled}
                    />
                  </div>

                  <div>
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      min="100"
                      max="32000"
                      step="100"
                      value={config.params.max_tokens}
                      onChange={(e) =>
                        updateRouting(taskType, {
                          params: {
                            ...config.params,
                            max_tokens: parseInt(e.target.value)
                          }
                        })
                      }
                      disabled={!config.enabled}
                    />
                  </div>

                  <div>
                    <Label>Top P</Label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.params.top_p}
                      onChange={(e) =>
                        updateRouting(taskType, {
                          params: {
                            ...config.params,
                            top_p: parseFloat(e.target.value)
                          }
                        })
                      }
                      disabled={!config.enabled}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}
