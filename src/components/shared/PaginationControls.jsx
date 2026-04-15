import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaginationControls({
  currentPage,
  pageSize,
  hasNextPage,
  hasPreviousPage,
  totalItems,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}) {
  return (
    <div className="flex items-center justify-between py-4 border-t">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
          className="px-2 py-1 text-xs border rounded-md bg-background"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">per page</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {totalItems === undefined ? (
            <>Page {currentPage}</>
          ) : (
            <>
              {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="outline"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={onNextPage}
          disabled={!hasNextPage}
          className="h-8 w-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}