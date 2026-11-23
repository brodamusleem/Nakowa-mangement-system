import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Navigate } from "react-router-dom"
import { ChefHat } from "lucide-react"
import { toast } from "sonner"
import { loginSchema, type LoginFormValues } from "@/lib/validation"
import { useLogin } from "@/api/hooks"
import { useAuth } from "@/state/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      pin: "",
    },
  })

  if (isAuthenticated) return <Navigate to="/" replace />

  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data, {
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <ChefHat className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle>Nakowa Management</CardTitle>
          <CardDescription>Sign in with your staff email and PIN.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>
    </div>
  )
}
