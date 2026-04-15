/**
 * FullPaginationComponent — Reusable pagination with page size, sorting, filtering
 * Integrates with React Query seamlessly
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function FullPaginationComponent({
  currentPage,
  pageSize,
  totalItems,
  isLoading,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  const canGoFirst = currentPage > 1;
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const canGoLast = currentPage < totalPages;

  return (
    <div className={cn('flex items-center justify-between gap-4 flex-wrap', className)}>
      {/* Item count */}
      <div className="text-sm text-muted-foreground">
        {totalItems === 0 ? (
          'No items'
        ) : (
          <>
            Showing <span className="font-semibold">{startIdx}</span>–<span className="font-semibold">{endIdx}</span> of{' '}
            <span className="font-semibold">{totalItems}</span>
          </>
        )}
      </div>

      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="text-sm text-muted-foreground">
          Per page:
        </label>
        <Select value={pageSize.toString()} onValueChange={(val) => onPageSizeChange(parseInt(val))}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={!canGoFirst || isLoading}
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev || isLoading}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page indicator */}
        <div className="px-3 text-sm font-medium text-foreground min-w-[80px] text-center">
          Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext || isLoading}
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoLast || isLoading}
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}