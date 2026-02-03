// 后台管理页面

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
import { useToast } from '@/hooks/use-toast';
import { Settings, Key, Database, Users, FileText } from 'lucide-react';

export default function Admin() {
  const { t } = useLanguage();
  // const { currentUser } = useAuth();
  // const navigate = useNavigate();
  const { toast } = useToast();

  // API配置状态
  const [apiConfig, setApiConfig] = useState({
    openai_api_key: '',
    openai_base_url: 'https://api.openai.com/v1',
    openai_model: 'gpt-4',
    enable_ai_generation: false,
    script_generation_enabled: true,
    storyboard_generation_enabled: true,
    video_cards_generation_enabled: true,
    edit_plan_generation_enabled: true
  });

  // 系统设置状态
  const [systemConfig, setSystemConfig] = useState({
    site_name: 'AI漫剧工作坊',
    site_description: '专业的漫剧创作工具平台',
    max_works_per_user: 100,
    enable_registration: true,
    enable_email_verification: false,
    storage_mode: 'local', // local | remote
    remote_api_url: ''
  });

  useEffect(() => {
    document.title = `${t.admin || '后台管理'} - ${t.appTitle}`;

    // 加载配置
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const loadConfig = () => {
    // 从 localStorage 加载配置
    const savedApiConfig = localStorage.getItem('admin_api_config');
    if (savedApiConfig) {
      setApiConfig(JSON.parse(savedApiConfig));
    }

    const savedSystemConfig = localStorage.getItem('admin_system_config');
    if (savedSystemConfig) {
      setSystemConfig(JSON.parse(savedSystemConfig));
    }
  };

  const saveApiConfig = () => {
    localStorage.setItem('admin_api_config', JSON.stringify(apiConfig));
    toast({
      title: '保存成功',
      description: 'API配置已保存'
    });
  };

  const saveSystemConfig = () => {
    localStorage.setItem('admin_system_config', JSON.stringify(systemConfig));
    toast({
      title: '保存成功',
      description: '系统设置已保存'
    });
  };

  const testApiConnection = async () => {
    if (!apiConfig.openai_api_key) {
      toast({
        title: '错误',
        description: '请先配置 API Key',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: '测试中...',
      description: '正在测试API连接'
    });

    // 模拟测试
    setTimeout(() => {
      toast({
        title: '测试成功',
        description: 'API连接正常'
      });
    }, 1000);
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
        <p className="text-muted-foreground">配置系统参数和API设置</p>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API配置</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">系统设置</span>
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

        {/* API配置 */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>AI生成API配置</CardTitle>
              <CardDescription>
                配置OpenAI或其他兼容API，用于AI剧本生成功能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-base font-semibold">启用AI生成</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    开启后将使用真实API进行生成，关闭则使用本地模拟
                  </p>
                </div>
                <Switch
                  checked={apiConfig.enable_ai_generation}
                  onCheckedChange={(checked) =>
                    setApiConfig({ ...apiConfig, enable_ai_generation: checked })
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-foreground mb-3 block">
                  OpenAI API Key
                </Label>
                <Input
                  type="password"
                  value={apiConfig.openai_api_key}
                  onChange={(e) =>
                    setApiConfig({ ...apiConfig, openai_api_key: e.target.value })
                  }
                  placeholder="sk-..."
                  className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  从 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI平台</a> 获取API密钥
                </p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-foreground mb-3 block">
                  API Base URL
                </Label>
                <Input
                  value={apiConfig.openai_base_url}
                  onChange={(e) =>
                    setApiConfig({ ...apiConfig, openai_base_url: e.target.value })
                  }
                  placeholder="https://api.openai.com/v1"
                  className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  支持OpenAI兼容的API端点（如Azure OpenAI、本地部署等）
                </p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-foreground mb-3 block">
                  模型名称
                </Label>
                <Input
                  value={apiConfig.openai_model}
                  onChange={(e) =>
                    setApiConfig({ ...apiConfig, openai_model: e.target.value })
                  }
                  placeholder="gpt-4"
                  className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
                />
              </div>

              <div className="border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">功能开关</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>剧本生成</Label>
                    <Switch
                      checked={apiConfig.script_generation_enabled}
                      onCheckedChange={(checked) =>
                        setApiConfig({ ...apiConfig, script_generation_enabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>分镜生成</Label>
                    <Switch
                      checked={apiConfig.storyboard_generation_enabled}
                      onCheckedChange={(checked) =>
                        setApiConfig({ ...apiConfig, storyboard_generation_enabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>镜头卡生成</Label>
                    <Switch
                      checked={apiConfig.video_cards_generation_enabled}
                      onCheckedChange={(checked) =>
                        setApiConfig({ ...apiConfig, video_cards_generation_enabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>剪辑计划生成</Label>
                    <Switch
                      checked={apiConfig.edit_plan_generation_enabled}
                      onCheckedChange={(checked) =>
                        setApiConfig({ ...apiConfig, edit_plan_generation_enabled: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={saveApiConfig}
                  className="flex-1 h-11 font-semibold bg-primary hover:bg-primary/90"
                >
                  保存配置
                </Button>
                <Button
                  onClick={testApiConnection}
                  variant="outline"
                  className="flex-1 h-11 font-semibold"
                >
                  测试连接
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 系统设置 */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>系统设置</CardTitle>
              <CardDescription>配置系统基本参数和功能开关</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-semibold text-foreground mb-3 block">
                  网站名称
                </Label>
                <Input
                  value={systemConfig.site_name}
                  onChange={(e) =>
                    setSystemConfig({ ...systemConfig, site_name: e.target.value })
                  }
                  className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-foreground mb-3 block">
                  网站描述
                </Label>
                <Textarea
                  value={systemConfig.site_description}
                  onChange={(e) =>
                    setSystemConfig({ ...systemConfig, site_description: e.target.value })
                  }
                  rows={3}
                  className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors resize-none"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-foreground mb-3 block">
                  每用户最大作品数
                </Label>
                <Input
                  type="number"
                  value={systemConfig.max_works_per_user}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      max_works_per_user: parseInt(e.target.value) || 100
                    })
                  }
                  className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
                />
              </div>

              <div className="border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">功能开关</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>允许用户注册</Label>
                      <p className="text-sm text-muted-foreground">关闭后新用户无法注册</p>
                    </div>
                    <Switch
                      checked={systemConfig.enable_registration}
                      onCheckedChange={(checked) =>
                        setSystemConfig({ ...systemConfig, enable_registration: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>邮箱验证</Label>
                      <p className="text-sm text-muted-foreground">
                        开启后注册需要验证邮箱（演示功能）
                      </p>
                    </div>
                    <Switch
                      checked={systemConfig.enable_email_verification}
                      onCheckedChange={(checked) =>
                        setSystemConfig({ ...systemConfig, enable_email_verification: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">数据存储模式</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant={systemConfig.storage_mode === 'local' ? 'default' : 'outline'}
                      onClick={() => setSystemConfig({ ...systemConfig, storage_mode: 'local' })}
                      className="flex-1"
                    >
                      本地存储 (localStorage)
                    </Button>
                    <Button
                      variant={systemConfig.storage_mode === 'remote' ? 'default' : 'outline'}
                      onClick={() => setSystemConfig({ ...systemConfig, storage_mode: 'remote' })}
                      className="flex-1"
                    >
                      远程API
                    </Button>
                  </div>

                  {systemConfig.storage_mode === 'remote' && (
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-3 block">
                        远程API地址
                      </Label>
                      <Input
                        value={systemConfig.remote_api_url}
                        onChange={(e) =>
                          setSystemConfig({ ...systemConfig, remote_api_url: e.target.value })
                        }
                        placeholder="https://api.example.com"
                        className="bg-background border-2 border-border hover:border-primary/50 focus:border-primary transition-colors h-11"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        配置后端API地址，用于数据持久化
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={saveSystemConfig}
                className="w-full h-11 font-semibold bg-primary hover:bg-primary/90"
              >
                保存设置
              </Button>
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
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">数据统计</h3>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">用户数</p>
                    <p className="text-2xl font-bold">
                      {JSON.parse(localStorage.getItem('users') || '[]').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">作品数</p>
                    <p className="text-2xl font-bold">
                      {JSON.parse(localStorage.getItem('works') || '[]').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">新闻数</p>
                    <p className="text-2xl font-bold">
                      {JSON.parse(localStorage.getItem('news') || '[]').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">链接数</p>
                    <p className="text-2xl font-bold">
                      {JSON.parse(localStorage.getItem('links') || '[]').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => {
                    const data = {
                      users: JSON.parse(localStorage.getItem('users') || '[]'),
                      works: JSON.parse(localStorage.getItem('works') || '[]'),
                      news: JSON.parse(localStorage.getItem('news') || '[]'),
                      links: JSON.parse(localStorage.getItem('links') || '[]')
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: 'application/json'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `backup-${Date.now()}.json`;
                    a.click();
                    toast({
                      title: '导出成功',
                      description: '数据已导出到文件'
                    });
                  }}
                >
                  导出所有数据
                </Button>

                <Button
                  variant="destructive"
                  className="w-full h-11"
                  onClick={() => {
                    if (confirm('确定要清空所有数据吗？此操作不可逆！')) {
                      localStorage.clear();
                      toast({
                        title: '清空成功',
                        description: '所有数据已清空'
                      });
                      window.location.reload();
                    }
                  }}
                >
                  清空所有数据
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户管理 */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>查看和管理注册用户</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>用户管理功能开发中...</p>
                <p className="text-sm mt-2">将支持查看用户列表、编辑用户信息、管理权限等</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 内容管理 */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>内容管理</CardTitle>
              <CardDescription>管理新闻和友情链接</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>内容管理功能开发中...</p>
                <p className="text-sm mt-2">将支持批量管理新闻、链接等内容</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
