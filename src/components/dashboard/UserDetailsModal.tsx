import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types/user";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

interface UserDetailsModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    userId: string,
    updates: Partial<
      Pick<User, "firstName" | "lastName" | "email" | "department">
    >,
  ) => Promise<void>;
  departments: string[];
}

export default function UserDetailsModal({
  user,
  open,
  onOpenChange,
  onSave,
  departments,
}: UserDetailsModalProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
  });
  const { toast } = useToast();

  const startEdit = useCallback(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department,
    });
    setEditing(true);
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      await onSave(user.id, form);
      toast({
        title: "User updated",
        description: `${form.firstName} ${form.lastName} saved successfully.`,
      });
      setEditing(false);
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [user, form, onSave, toast]);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) setEditing(false);
      onOpenChange(v);
    },
    [onOpenChange],
  );

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>ID: {user.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {editing ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, department: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-foreground">
                {user.firstName} {user.lastName}
              </dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-foreground">{user.email}</dd>
              <dt className="text-muted-foreground">Age</dt>
              <dd className="text-foreground">{user.age}</dd>
              <dt className="text-muted-foreground">Department</dt>
              <dd className="text-foreground">{user.department}</dd>
              <dt className="text-muted-foreground">Joined</dt>
              <dd className="text-foreground">{user.joinDate}</dd>
              <dt className="text-muted-foreground">Activity Score</dt>
              <dd className="text-foreground font-mono">
                {user.activityScore}
              </dd>
            </dl>
          )}
        </div>

        <DialogFooter>
          {editing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </>
          ) : (
            <Button onClick={startEdit}>Edit</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
