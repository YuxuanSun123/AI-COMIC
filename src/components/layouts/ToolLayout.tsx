// 工具页布局 - 优化三栏布局（减少滚动条，提升体验）

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface ToolLayoutProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
}

export default function ToolLayout({ leftPanel, centerPanel, rightPanel }: ToolLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* 使用 flex 布局，避免多个滚动条 */}
      <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
        {/* 左侧面板 - 工具导航/类型选择 */}
        <div className="xl:w-48 flex-shrink-0">
          <Card className="bg-card border-border p-4 shadow-card">
            {/* 移动端：不滚动，内容自适应 */}
            {/* 桌面端：固定高度，内容自适应 */}
            <div className="xl:max-h-[calc(100vh-12rem)]">
              {leftPanel}
            </div>
          </Card>
        </div>

        {/* 中间面板 - 编辑/生成区域 */}
        <div className="flex-1 min-w-0">
          <Card className="bg-card border-border p-6 shadow-card">
            {/* 使用自然滚动，不限制高度 */}
            <div className="space-y-4">
              {centerPanel}
            </div>
          </Card>
        </div>

        {/* 右侧面板 - 参数设置 */}
        <div className="xl:w-72 flex-shrink-0">
          <Card className="bg-card border-border p-4 shadow-card">
            {/* 桌面端：跟随页面滚动 */}
            <div className="xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)]">
              {rightPanel}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
