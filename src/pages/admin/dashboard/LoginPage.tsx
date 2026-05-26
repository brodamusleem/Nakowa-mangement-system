import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginFormValues } from "@/lib/validation";
import { useLogin } from "@/api/hooks";
import { useAuth } from "@/state/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const roleOptions = [
  { label: "Admin", value: "admin", email: "admin@nakowa.com", pin: "1234" },
  { label: "Manager", value: "manager", email: "segun@nakowa.com", pin: "5555" },
  { label: "Cashier", value: "cashier", email: "amaka@nakowa.com", pin: "2222" },
  { label: "Kitchen", value: "kitchen", email: "fatima@nakowa.com", pin: "4444" },
];

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const login = useLogin();
  const [selectedRole, setSelectedRole] = useState(roleOptions[0].value);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: roleOptions[0].email,
      pin: roleOptions[0].pin,
    },
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onRoleSelect = (role: typeof roleOptions[number]) => {
    setSelectedRole(role.value);
    setValue("email", role.email, { shouldTouch: false });
    setValue("pin", role.pin, { shouldTouch: false });
  };

  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data, {
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <ChefHat className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle>Nakowa Management</CardTitle>
          <CardDescription>Choose a role and sign in to the right dashboard.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {roleOptions.map((role) => (
              <Button
                key={role.value}
                type="button"
                variant={selectedRole === role.value ? "secondary" : "outline"}
                className="capitalize"
                onClick={() => onRoleSelect(role)}
              >
                {role.label}
              </Button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            Selected role: <span className="font-semibold text-foreground">{selectedRole}</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@nakowa.com" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="••••"
                maxLength={6}
                {...register("pin")}
              />
              {errors.pin && <p className="text-xs text-destructive">{errors.pin.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="grid gap-2 rounded-xl border border-border bg-background p-4 text-sm">
            <p className="font-medium">Quick access</p>
            <p className="text-muted-foreground">Pick a role and credentials will populate automatically. Then sign in to reach that dashboard.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
