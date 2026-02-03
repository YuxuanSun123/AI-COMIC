import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonCard() {
  return (
    <Card className="border-border/60">
      <CardHeader className="gap-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}
