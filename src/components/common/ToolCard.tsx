// 工具卡片组件

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ToolCard({ title, description, icon: Icon, path, className, style }: ToolCardProps) {
  return (
    <Link to={path} className={className} style={style}>
      <Card className="bg-card border-border card-hover cursor-pointer group h-full">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {title}
              </CardTitle>
              <CardDescription className="mt-2 text-muted-foreground">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
