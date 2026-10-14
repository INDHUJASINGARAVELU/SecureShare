import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800',
            className
          )}
        />
      ))}
    </>
  );
};
