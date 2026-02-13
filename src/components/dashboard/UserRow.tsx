import type { User } from "@/types/user";
import React from "react";

interface UserRowProps {
  user: User;
  style: React.CSSProperties;
  onClick: (userId: string) => void;
}

const UserRow = React.memo(function UserRow({
  user,
  style,
  onClick,
}: UserRowProps) {
  return (
    <div
      role="row"
      style={style}
      className="flex items-center border-b border-border px-4 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onClick(user.id)}
    >
      <div className="flex-[2] truncate font-medium text-foreground">
        {user.firstName} {user.lastName}
      </div>
      <div className="flex-[2] truncate text-muted-foreground">
        {user.email}
      </div>
      <div className="w-16 text-center text-foreground">{user.age}</div>
      <div className="flex-1 truncate text-foreground">{user.department}</div>
      <div className="w-24 text-right font-mono text-foreground">
        {user.activityScore}
      </div>
    </div>
  );
});

export default UserRow;
