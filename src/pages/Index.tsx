import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import ErrorState from "@/components/dashboard/ErrorState";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";
import UserDetailsModal from "@/components/dashboard/UserDetailsModal";
import UsersTable from "@/components/dashboard/UsersTable";
import { useUsersStore } from "@/hooks/useUsersStore";
import { useCallback, useState } from "react";

const Index = () => {
  const store = useUsersStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setModalOpen(true);
  }, []);

  const handleModalOpenChange = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) setSelectedUserId(null);
  }, []);

  const selectedUser = selectedUserId
    ? (store.usersById[selectedUserId] ?? null)
    : null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <DashboardHeader
          totalCount={store.totalCount}
          filteredCount={store.filteredIds.length}
          filters={store.filters}
          departments={store.departments}
          onSearchChange={store.updateSearch}
          onDepartmentChange={store.updateDepartment}
        />

        {store.loading ? (
          <LoadingSkeleton />
        ) : store.error ? (
          <ErrorState message={store.error} onRetry={store.retry} />
        ) : store.filteredIds.length === 0 ? (
          <EmptyState />
        ) : (
          <UsersTable
            userIds={store.filteredIds}
            usersById={store.usersById}
            sort={store.sort}
            onToggleSort={store.toggleSort}
            onRowClick={handleRowClick}
          />
        )}

        <UserDetailsModal
          user={selectedUser}
          open={modalOpen}
          onOpenChange={handleModalOpenChange}
          onSave={store.updateUser}
          departments={store.departments}
        />
      </div>
    </div>
  );
};

export default Index;
