"use client";

import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdmPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export default function AdmPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: AdmPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-6 py-4 border-t border-input bg-dark-300">
      <div className="text-sm text-light-400 whitespace-nowrap">
        {startItem}-{endItem} dan {totalItems} ta
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="gap-1"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Oldingi</span>
        </Button>
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              if (totalPages <= 7) return true;
              return (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              );
            })
            .map((page, idx, arr) => {
              const showEllipsis = idx > 0 && arr[idx - 1] !== page - 1;
              return (
                <div key={page} className="flex items-center gap-1">
                  {showEllipsis && <span className="text-light-400 px-2">...</span>}
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={currentPage === page ? "bg-primary-200 text-dark-100" : ""}
                  >
                    {page}
                  </Button>
                </div>
              );
            })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="gap-1"
        >
          <span className="hidden sm:inline">Keyingi</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

