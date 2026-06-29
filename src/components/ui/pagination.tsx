import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  total: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
  siblingCount?: number
  className?: string
}

type PageElement = number | "dots"

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, idx) => start + idx)
}

function getPageElements(totalPages: number, currentPage: number, siblingCount = 1): PageElement[] {
  if (totalPages <= 5 + siblingCount * 2) {
    return range(1, totalPages)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 2)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 1)

  const shouldShowLeftDots = leftSiblingIndex > 2
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1

  const pages: PageElement[] = [1]

  if (shouldShowLeftDots) {
    pages.push("dots")
  }

  pages.push(...range(leftSiblingIndex, rightSiblingIndex))

  if (shouldShowRightDots) {
    pages.push("dots")
  }

  pages.push(totalPages)
  return pages
}

export function Pagination({
  total,
  pageSize,
  currentPage,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const pageElements = getPageElements(totalPages, currentPage, siblingCount)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pageElements.map((item, index) =>
            item === "dots" ? (
              <span key={`dots-${index}`} className="px-2 text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(item)}
                aria-current={item === currentPage ? "page" : undefined}
              >
                {item}
              </Button>
            )
          )}
          <Button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  )
}
