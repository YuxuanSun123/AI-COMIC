// 工具页布局 - 三栏布局（左侧导航/中间编辑区/右侧参数面板）

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ToolLayoutProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
}

export default function ToolLayout({ leftPanel, centerPanel, rightPanel }: ToolLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6">
        {/* 左侧面板 - 工具导航/类型选择 */}
        <div className="xl:col-span-2">
          <Card className="bg-card border-border p-4 card-hover">
            <ScrollArea className="h-[200px] xl:h-[calc(100vh-200px)]">
              {leftPanel}
            </ScrollArea>
          </Card>
        </div>

        {/* 中间面板 - 编辑/生成区域 */}
        <div className="xl:col-span-7">
          <Card className="bg-card border-border p-6 card-hover">
            <ScrollArea className="h-[500px] xl:h-[calc(100vh-200px)]">
              {centerPanel}
            </ScrollArea>
          </Card>
        </div>

        {/* 右侧面板 - 参数设置 */}
        <div className="xl:col-span-3">
          <Card className="bg-card border-border p-4 card-hover">
            <ScrollArea className="h-[300px] xl:h-[calc(100vh-200px)]">
              {rightPanel}
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
