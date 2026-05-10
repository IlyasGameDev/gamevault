'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function Pagination({ page, hasMore, onPrev, onNext }: PaginationProps) {
  return (
    <div className="flex items-center gap-3 justify-center mt-8">
      <Button variant="secondary" size="sm" onClick={onPrev} disabled={page <= 1}>
        <ChevronLeft size={16} /> Previous
      </Button>
      <span className="text-sm text-gray-500">Page {page}</span>
      <Button variant="secondary" size="sm" onClick={onNext} disabled={!hasMore}>
        Next <ChevronRight size={16} />
      </Button>
    </div>
  );
}
