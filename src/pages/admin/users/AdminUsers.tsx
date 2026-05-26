import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useUsers } from "@/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/types/userTypes";

const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  manager: "bg-secondary/10 text-secondary border-secondary/20",
  cashier: "bg-accent/10 text-accent border-accent/20",
  kitchen: "bg-info/10 text-info border-info/20",
  waiter: "bg-muted/50 text-muted-foreground border-muted/20",
};

export default function AdminUsers() {
  const { data: users = [], isLoading } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Users & Roles</h1>
          <p className="text-sm text-muted-foreground md:text-base">Manage team members and permissions</p>
        </div>
        <Button className="w-full gap-2 md:w-auto">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No users found</p>
          </Card>
        ) : (
          filtered.map((user) => (
            <Card key={user.id} className="p-3 md:p-4">
              <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-0">
                <div className="flex-1">
                  <div className="font-medium text-sm md:text-base">{user.name}</div>
                  <div className="text-xs text-muted-foreground md:text-sm">{user.email}</div>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <Badge className={roleColors[user.role] || roleColors.waiter}>{user.role}</Badge>
                  <Badge variant="outline">{user.active ? "✓ Active" : "Inactive"}</Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}