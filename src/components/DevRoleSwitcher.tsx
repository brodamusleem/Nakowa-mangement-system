import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { useAuthStore } from "@/state/authStore";

const ROLES = [
  { value: "admin", label: "Admin Dashboard", icon: "👨‍💼" },
  { value: "manager", label: "Manager Dashboard", icon: "📊" },
  { value: "cashier", label: "Cashier POS", icon: "💳" },
  { value: "kitchen", label: "Kitchen Display", icon: "👨‍🍳" },
];

export function DevRoleSwitcher() {
  const { devRole, setDevRole } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleChange = (role: string) => {
    setDevRole(role);
    setIsOpen(false);
    const routes: Record<string, string> = {
      admin: "/admin",
      manager: "/manager/dashboard",
      cashier: "/cashier",
      kitchen: "/kitchen",
    };
    window.location.href = routes[role] || "/";
  };

  const currentRole = ROLES.find((r) => r.value === devRole);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          title="Dev: Switch role for testing"
        >
          <Settings className="h-3 w-3" />
          <span>Dev</span>
          {devRole && (
            <Badge variant="secondary" className="ml-1">
              {currentRole?.icon} {currentRole?.label.split(" ")[0]}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Switch Role (Dev)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onSelect={() => handleRoleChange(role.value)}
            className="cursor-pointer"
          >
            <span className="mr-2">{role.icon}</span>
            {role.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            setDevRole(null);
            setIsOpen(false);
            window.location.href = "/";
          }}
          className="cursor-pointer text-xs text-muted-foreground"
        >
          ✕ Clear role
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
