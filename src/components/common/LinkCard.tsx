// 友情链接卡片组件

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link as LinkType } from '@/types';
import { ExternalLink } from 'lucide-react';

interface LinkCardProps {
  link: LinkType;
}

export default function LinkCard({ link }: LinkCardProps) {
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer">
      <Card className="bg-card border-border card-hover cursor-pointer group">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center">
                {link.name}
                <ExternalLink className="ml-2 h-4 w-4" />
              </CardTitle>
              <CardDescription className="mt-2 text-muted-foreground">
                {link.desc}
              </CardDescription>
              <div className="flex flex-wrap gap-2 mt-3">
                {link.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-border">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </a>
  );
}
