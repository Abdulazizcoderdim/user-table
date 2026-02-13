import { SearchX } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-lg font-semibold text-foreground">No users found</h2>
      <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
    </div>
  );
}
