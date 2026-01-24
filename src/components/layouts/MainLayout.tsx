// 主布局组件 - 顶部导航栏 + 面包屑

import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useMemo } from 'react';
import LoginDialog from '@/components/auth/LoginDialog';
import RegisterDialog from '@/components/auth/RegisterDialog';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 导航菜单项类型定义
  interface NavItem {
    path?: string;
    label: string;
    children?: Array<{ path: string; label: string }>;
  }

  // 导航菜单项 - 使用useMemo动态生成
  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { path: '/', label: t.studio },
      { path: '/news', label: t.news },
      {
        label: t.tools,
        children: [
          { path: '/tools/script', label: t.scriptGenerator },
          { path: '/tools/storyboard', label: t.storyboardGenerator },
          { path: '/tools/video', label: t.videoCards },
          { path: '/tools/edit', label: t.editing }
        ]
      },
      { path: '/links', label: t.links },
      { path: '/pricing', label: t.pricing },
      { path: '/about', label: t.about }
    ];

    // 调试阶段：始终显示后台管理入口，方便开发调试
    // TODO: 生产环境需要恢复登录验证（只有登录用户可见）
    items.push({ path: '/admin', label: t.admin || '后台管理' });
    
    /*
    // 生产环境代码：添加后台管理入口（仅登录用户可见）
    if (currentUser) {
      items.push({ path: '/admin', label: t.admin || '后台管理' });
    }
    */

    return items;
  }, [currentUser, t]);

  // 生成面包屑
  const getBreadcrumbs = () => {
    const pathMap: Record<string, string> = {
      '/': t.studio,
      '/news': t.news,
      '/studio': t.studio,
      '/tools/script': t.scriptGenerator,
      '/tools/storyboard': t.storyboardGenerator,
      '/tools/video': t.videoCards,
      '/tools/edit': t.editing,
      '/links': t.links,
      '/pricing': t.pricing,
      '/about': t.about,
      '/contact': t.contact,
      '/privacy': t.privacy,
      '/terms': t.terms,
      '/admin': t.admin || '后台管理'
    };

    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ path: '/', label: t.home }];

    let currentPath = '';
    for (const path of paths) {
      currentPath += `/${path}`;
      if (pathMap[currentPath]) {
        breadcrumbs.push({ path: currentPath, label: pathMap[currentPath] });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // 会员等级徽章颜色
  const tierColors = {
    free: 'bg-muted text-muted-foreground',
    pro: 'bg-secondary text-secondary-foreground',
    studio: 'bg-primary text-primary-foreground'
  };

  const NavContent = () => (
    <>
      {navItems.map((item, index) =>
        item.children ? (
          <DropdownMenu key={item.label || index}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-foreground hover:text-primary">
                {item.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border">
              {item.children.map((child) => (
                <DropdownMenuItem key={child.path} asChild>
                  <Link to={child.path} className="cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                    {child.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : item.path ? (
          <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
            <Button
              variant="ghost"
              className={`text-foreground hover:text-primary ${
                location.pathname === item.path ? 'text-primary' : ''
              }`}
            >
              {item.label}
            </Button>
          </Link>
        ) : null
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-xl xl:text-2xl font-bold gradient-text">{t.appTitle}</h1>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden xl:flex items-center space-x-1">
            <NavContent />
          </nav>

          {/* 右侧操作区 */}
          <div className="flex items-center space-x-2 xl:space-x-4">
            {/* 语言切换 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-border">
                  {language === 'zh' ? '🇨🇳' : '🇺🇸'} {language === 'zh' ? '中文' : 'EN'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border">
                <DropdownMenuItem onClick={() => setLanguage('zh')} className="cursor-pointer">
                  🇨🇳 中文
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
                  🇺🇸 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 用户信息/登录注册 */}
            {currentUser ? (
              <div className="hidden xl:flex items-center space-x-2">
                <span className="text-sm text-foreground">{currentUser.nickname}</span>
                <Badge className={tierColors[currentUser.membership_tier]}>
                  {currentUser.membership_tier.toUpperCase()}
                </Badge>
                <Button variant="outline" size="sm" onClick={logout} className="border-border">
                  {t.logout}
                </Button>
              </div>
            ) : (
              <div className="hidden xl:flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowLogin(true)} className="border-border">
                  {t.login}
                </Button>
                <Button size="sm" onClick={() => setShowRegister(true)} className="neon-glow-purple">
                  {t.register}
                </Button>
              </div>
            )}

            {/* 移动端菜单按钮 */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="xl:hidden">
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-card border-border">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* 移动端用户信息 */}
                  {currentUser ? (
                    <div className="flex flex-col space-y-2 pb-4 border-b border-border">
                      <span className="text-sm text-foreground">{currentUser.nickname}</span>
                      <Badge className={`w-fit ${tierColors[currentUser.membership_tier]}`}>
                        {currentUser.membership_tier.toUpperCase()}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => { logout(); setMobileMenuOpen(false); }} className="border-border">
                        {t.logout}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2 pb-4 border-b border-border">
                      <Button variant="outline" size="sm" onClick={() => { setShowLogin(true); setMobileMenuOpen(false); }} className="border-border">
                        {t.login}
                      </Button>
                      <Button size="sm" onClick={() => { setShowRegister(true); setMobileMenuOpen(false); }} className="neon-glow-purple">
                        {t.register}
                      </Button>
                    </div>
                  )}
                  
                  {/* 移动端导航 */}
                  <nav className="flex flex-col space-y-2">
                    <NavContent />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* 面包屑 */}
      {breadcrumbs.length > 1 && (
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-3">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="text-primary">{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.path} className="text-muted-foreground hover:text-foreground">
                            {crumb.label}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col xl:flex-row justify-between items-center space-y-4 xl:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2026 {t.appTitle}. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                {t.privacy}
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                {t.terms}
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                {t.contact}
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* 登录/注册对话框 */}
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
      <RegisterDialog open={showRegister} onOpenChange={setShowRegister} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
    </div>
  );
}
