"use client";

import { useMemo, useState } from "react";

/**
 * Shared client-side pagination hooks (Phase A).
 *
 * Every Tier-1 list still fetches its full result set from the API, so
 * paging happens over the in-memory array here. Both hooks return slices
 * shaped after `PaginatedResult<T>` (`src/types`) so a page can move to
 * server-side paging in Phase B by swapping the source of `items` rather
 * than reworking its render code again.
 *
 * `resetKey` is an optional string describing the caller's current
 * filter/sort (e.g. `` `${search}|${status}` ``). When it changes the hook
 * behaves as if it were back on page 1 / first batch — done by derivation,
 * not by an effect: the stored cursor is only trusted while it was set
 * under the same key. That keeps the hooks free of setState-in-effect,
 * which this repo's lint config rejects.
 */

interface Cursor<K> {
  key: K | undefined;
  value: number;
}

export interface PaginationState<T> {
  /** 1-based, clamped so a shrunken list never strands the user on an empty page. */
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  total: number;
  totalPages: number;
  pagedItems: T[];
  rangeStart: number;
  rangeEnd: number;
}

export function usePagination<T>(
  items: readonly T[],
  pageSize = 10,
  resetKey?: string
): PaginationState<T> {
  const [cursor, setCursor] = useState<Cursor<string>>({ key: resetKey, value: 1 });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(cursor.key === resetKey ? cursor.value : 1, totalPages);

  const setPage = (next: number) =>
    setCursor({ key: resetKey, value: Math.min(Math.max(1, next), totalPages) });

  const pagedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  return {
    page,
    setPage,
    pageSize,
    total,
    totalPages,
    pagedItems,
    rangeStart: total === 0 ? 0 : (page - 1) * pageSize + 1,
    rangeEnd: Math.min(page * pageSize, total),
  };
}

export interface LoadMoreState<T> {
  /** The prefix of `items` currently revealed. */
  shown: T[];
  total: number;
  hasMore: boolean;
  loadMore: () => void;
}

export function useLoadMore<T>(
  items: readonly T[],
  batchSize = 12,
  resetKey?: string
): LoadMoreState<T> {
  const [cursor, setCursor] = useState<Cursor<string>>({ key: resetKey, value: batchSize });

  const total = items.length;
  const count = cursor.key === resetKey ? cursor.value : batchSize;

  const shown = useMemo(() => items.slice(0, count), [items, count]);
  const hasMore = count < total;
  const loadMore = () => setCursor({ key: resetKey, value: count + batchSize });

  return { shown, total, hasMore, loadMore };
}
