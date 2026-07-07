"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function getPageNumbers(page: number, totalPages: number): (number | "ellipsis")[] {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let previous: number | undefined;
  sorted.forEach((p) => {
    if (previous !== undefined && p - previous > 1) {
      result.push("ellipsis");
    }
    result.push(p);
    previous = p;
  });
  return result;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;

  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  filters?: ReactNode;

  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;

  getRowHref?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  renderRowActions?: (row: TData) => ReactNode;

  createHref?: string;
  createLabel?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyMessage = "No results found.",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  page,
  totalPages,
  onPageChange,
  getRowHref,
  onRowClick,
  renderRowActions,
  createHref,
  createLabel = "Create",
}: DataTableProps<TData>) {
  const router = useRouter();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  const showToolbar =
    onSearchChange !== undefined || filters !== undefined || createHref !== undefined;
  const showPagination =
    page !== undefined &&
    totalPages !== undefined &&
    onPageChange !== undefined;

  return (
    <div className="flex flex-col gap-4">
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-3">
          {onSearchChange && (
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="max-w-xs"
            />
          )}
          {filters}
          {createHref && (
            <Button className="ml-auto" onClick={() => router.push(createHref)}>
              {createLabel}
            </Button>
          )}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
                {renderRowActions && <TableHead className="w-px" />}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (renderRowActions ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const href = getRowHref?.(row.original);
                const clickable = Boolean(href || onRowClick);
                return (
                  <TableRow
                    key={row.id}
                    className={clickable ? "cursor-pointer" : undefined}
                    onClick={
                      href
                        ? () => router.push(href)
                        : onRowClick
                          ? () => onRowClick(row.original)
                          : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                    {renderRowActions && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {renderRowActions(row.original)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (renderRowActions ? 1 : 0)}
                  className="h-48 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="h-8 w-8 opacity-50" />
                    <span>{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && totalPages! > 1 && (
        <div className="flex items-center justify-center gap-1">
          {getPageNumbers(page!, totalPages!).map((p, i) =>
            p === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                className="w-9"
                onClick={() => onPageChange!(p)}
              >
                {p}
              </Button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
