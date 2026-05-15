import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-white/5', className)}
    />
  );
}

export function GameCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A]">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
