import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Navigate } from "react-router-dom"
import { ArrowRight, ChefHat, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { loginSchema, type LoginFormValues } from "@/lib/validation"
import { useLogin } from "@/api/hooks"
import { useAuth } from "@/state/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const hospitalityImage =
  "https://images.unsplash.com/photo-1647483684830-7ddde27dcf4d?auto=format&fit=crop&w=1800&q=85"

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const login = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  if (isAuthenticated) return <Navigate to="/" replace />

  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data, {
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-2">
      <section className="relative isolate min-h-[300px] overflow-hidden bg-slate-950 text-white lg:min-h-screen">
        <img
          src={hospitalityImage}
          alt="Restaurant team member welcoming guests"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15" />

        <div className="relative flex min-h-[300px] flex-col justify-between p-6 sm:p-10 lg:min-h-screen lg:p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur-md">
              <ChefHat className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em]">NAKOWA</p>
              <p className="text-xs text-white/75">Events & Restaurants</p>
            </div>
          </div>

          <div className="max-w-xl py-12 lg:py-20">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium tracking-wide text-white/90 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              ONE CONNECTED WORKSPACE
            </div>
            <h1 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Great service starts behind the scenes.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/80 sm:text-lg">
              Keep your team, orders, and daily operations moving together.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-white/20 pt-5 text-xs text-white/70 sm:text-sm">
            <span>Built for the people who make every visit count.</span>
            <span className="hidden shrink-0 sm:inline">NAKOWA MANAGEMENT</span>
          </div>
        </div>
      </section>

      <section className="flex min-h-[calc(100vh-300px)] items-center justify-center px-5 py-12 sm:px-10 lg:min-h-screen lg:px-12 xl:px-20">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 lg:mb-12">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Staff portal
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Sign in with your Nakowa staff account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold">Work email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@nakowa.com"
                  aria-invalid={!!errors.email}
                  className="h-14 rounded-xl border-border/80 bg-card pl-11 pr-4 text-base shadow-sm placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <span className="text-xs text-muted-foreground">Keep your account secure</span>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={!!errors.password}
                  className="h-14 rounded-xl border-border/80 bg-card pl-11 pr-12 text-base shadow-sm placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
              {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-14 w-full rounded-xl text-base font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in…" : "Sign in to your account"}
              {!login.isPending && <ArrowRight className="ml-1 h-5 w-5" aria-hidden="true" />}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
            Need access? Contact your Nakowa administrator.
          </p>
        </div>
      </section>
    </main>
  )
}
