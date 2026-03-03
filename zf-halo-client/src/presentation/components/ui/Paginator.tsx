import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginatorProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

/** Returns an array of page numbers and "…" ellipsis markers */
function buildRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const delta = 1; // pages around current page
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  const pages: (number | "…")[] = [1];

  if (left > 2) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("…");
  pages.push(total);

  return pages;
}

export function Paginator({
  page,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className,
}: PaginatorProps) {
  if (totalPages <= 1) return null;

  const range = buildRange(page, totalPages);

  const start = itemsPerPage ? (page - 1) * itemsPerPage + 1 : undefined;
  const end =
    itemsPerPage && totalItems
      ? Math.min(page * itemsPerPage, totalItems)
      : undefined;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border border-border bg-card/50 px-5 py-3",
        className,
      )}
    >
      {/* Info text */}
      {start !== undefined && end !== undefined && totalItems !== undefined ? (
        <span className="hidden text-sm text-muted-foreground sm:block">
          Mostrando <span className="font-medium text-foreground">{start}</span>
          –<span className="font-medium text-foreground">{end}</span> de{" "}
          <span className="font-medium text-foreground">
            {totalItems.toLocaleString()}
          </span>
        </span>
      ) : (
        <span className="hidden text-sm text-muted-foreground sm:block">
          Página <span className="font-medium text-foreground">{page}</span> de{" "}
          <span className="font-medium text-foreground">{totalPages}</span>
        </span>
      )}

      {/* Page controls */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Prev */}
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Página anterior"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page buttons with ellipsis */}
        {range.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              aria-label={`Ir a página ${p}`}
              aria-current={page === p ? "page" : undefined}
              className={cn(
                "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-all",
                page === p
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {p}
            </button>
          ),
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Página siguiente"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
