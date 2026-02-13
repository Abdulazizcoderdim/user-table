import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortConfig, User } from "@/types/user";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import UserRow from "./UserRow";

interface UsersTableProps {
  userIds: string[];
  usersById: Record<string, User>;
  sort: SortConfig;
  onToggleSort: (field: SortConfig["field"]) => void;
  onRowClick: (userId: string) => void;
}

const ROW_HEIGHT = 48;
const PAGE_SIZE_OPTIONS = [10, 50, 100, 250, 500];

const COLUMNS: {
  label: string;
  field: SortConfig["field"] | null;
  className: string;
}[] = [
  { label: "Name", field: "name", className: "flex-[2]" },
  { label: "Email", field: "email", className: "flex-[2]" },
  { label: "Age", field: "age", className: "w-16 text-center" },
  { label: "Department", field: null, className: "flex-1" },
  { label: "Activity", field: "activityScore", className: "w-24 text-right" },
];

function SortIcon({
  field,
  sort,
}: {
  field: SortConfig["field"] | null;
  sort: SortConfig;
}) {
  if (!field || sort.field !== field)
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
  return sort.direction === "asc" ? (
    <ArrowUp className="ml-1 h-3 w-3" />
  ) : (
    <ArrowDown className="ml-1 h-3 w-3" />
  );
}

export default function UsersTable({
  userIds,
  usersById,
  sort,
  onToggleSort,
  onRowClick,
}: UsersTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  const totalPages = Math.max(1, Math.ceil(userIds.length / pageSize));

  // Reset page when data changes
  const clampedPage = Math.min(page, totalPages - 1);
  if (clampedPage !== page) setPage(clampedPage);

  const pageIds = useMemo(() => {
    const start = clampedPage * pageSize;
    return userIds.slice(start, start + pageSize);
  }, [userIds, clampedPage, pageSize]);

  const rowVirtualizer = useVirtualizer({
    count: pageIds.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  const handleRowClick = useCallback(
    (userId: string) => {
      onRowClick(userId);
    },
    [onRowClick],
  );

  const handlePageSizeChange = useCallback((val: string) => {
    setPageSize(Number(val));
    setPage(0);
  }, []);

  return (
    <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center px-4 h-12 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground select-none">
        {COLUMNS.map((col) => (
          <div
            key={col.label}
            className={`${col.className} flex items-center ${col.field ? "cursor-pointer hover:text-foreground" : ""}`}
            onClick={col.field ? () => onToggleSort(col.field!) : undefined}
          >
            {col.label}
            {col.field && <SortIcon field={col.field} sort={sort} />}
          </div>
        ))}
      </div>

      {/* Virtualized body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: "calc(100vh - 280px)" }}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const userId = pageIds[virtualRow.index];
            const user = usersById[userId];
            if (!user) return null;
            return (
              <UserRow
                key={user.id}
                user={user}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={handleRowClick}
              />
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Rows per page</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-muted-foreground mr-2">
            Page {clampedPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={clampedPage === 0}
            onClick={() => setPage(0)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={clampedPage === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={clampedPage >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={clampedPage >= totalPages - 1}
            onClick={() => setPage(totalPages - 1)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
