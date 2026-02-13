import { computeActivityScore, generateUsers } from "@/lib/generateUsers";
import type { FiltersState, SortConfig, User } from "@/types/user";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";

const USER_COUNT = 10_000;

export function useUsersStore() {
  const [usersById, setUsersById] = useState<Record<string, User>>({});
  const [allIds, setAllIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<SortConfig>({
    field: "name",
    direction: "asc",
  });
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    department: "",
  });
  const debouncedSearch = useDebounce(filters.search, 400);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const timer = setTimeout(() => {
      try {
        const users = generateUsers(USER_COUNT);
        const byId: Record<string, User> = {};
        const ids: string[] = [];
        for (const u of users) {
          byId[u.id] = u;
          ids.push(u.id);
        }
        setUsersById(byId);
        setAllIds(ids);
        setLoading(false);
      } catch {
        setError("Failed to generate users");
        setLoading(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const id of allIds) set.add(usersById[id]?.department ?? "");
    return Array.from(set).filter(Boolean).sort();
  }, [allIds, usersById]);

  const filteredAndSorted = useMemo(() => {
    const search = debouncedSearch.toLowerCase();
    let result = allIds;

    if (search || filters.department) {
      result = result.filter((id) => {
        const u = usersById[id];
        if (!u) return false;
        if (filters.department && u.department !== filters.department)
          return false;
        if (search) {
          const full = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase();
          if (!full.includes(search)) return false;
        }
        return true;
      });
    }

    result = [...result].sort((a, b) => {
      const ua = usersById[a];
      const ub = usersById[b];
      if (!ua || !ub) return 0;
      const dir = sort.direction === "asc" ? 1 : -1;
      switch (sort.field) {
        case "name":
          return (
            dir *
            `${ua.firstName} ${ua.lastName}`.localeCompare(
              `${ub.firstName} ${ub.lastName}`,
            )
          );
        case "email":
          return dir * ua.email.localeCompare(ub.email);
        case "age":
          return dir * (ua.age - ub.age);
        case "activityScore":
          return dir * (ua.activityScore - ub.activityScore);
        default:
          return 0;
      }
    });

    return result;
  }, [allIds, usersById, debouncedSearch, filters.department, sort]);

  const toggleSort = useCallback((field: SortConfig["field"]) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" },
    );
  }, []);

  const updateSearch = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search }));
  }, []);

  const updateDepartment = useCallback((department: string) => {
    setFilters((f) => ({ ...f, department }));
  }, []);

  const updateUser = useCallback(
    async (
      userId: string,
      updates: Partial<
        Pick<User, "firstName" | "lastName" | "email" | "department">
      >,
    ) => {
      const prev = usersById[userId];
      if (!prev) throw new Error("User not found");

      // Optimistic update
      const updated = { ...prev, ...updates };
      // Recompute activity score if relevant fields changed
      if (updates.firstName || updates.lastName) {
        updated.activityScore = computeActivityScore(updated);
      }
      setUsersById((m) => ({ ...m, [userId]: updated }));

      // Simulate API call with ~20% failure
      await new Promise((resolve) => setTimeout(resolve, 500));
      const failed = Math.random() < 0.2;
      if (failed) {
        // Rollback
        setUsersById((m) => ({ ...m, [userId]: prev }));
        throw new Error(
          "Server error: update failed. Changes have been rolled back.",
        );
      }
    },
    [usersById],
  );

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    initialized.current = false;
    // re-trigger the effect
    setTimeout(() => {
      try {
        const users = generateUsers(USER_COUNT);
        const byId: Record<string, User> = {};
        const ids: string[] = [];
        for (const u of users) {
          byId[u.id] = u;
          ids.push(u.id);
        }
        setUsersById(byId);
        setAllIds(ids);
        setLoading(false);
      } catch {
        setError("Failed to generate users");
        setLoading(false);
      }
    }, 100);
  }, []);

  return {
    usersById,
    filteredIds: filteredAndSorted,
    loading,
    error,
    sort,
    filters,
    departments,
    toggleSort,
    updateSearch,
    updateDepartment,
    updateUser,
    retry,
    totalCount: allIds.length,
  };
}
