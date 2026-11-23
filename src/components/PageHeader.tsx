import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronLeft, LogOut } from "lucide-react"
import { useAuthStore } from "@/state/authStore"

interface PageHeaderProps {
  title: string
  icon?: React.ReactNode
  showBackButton?: boolean
  backTo?: string
  rightContent?: React.ReactNode
}

export function PageHeader({
  title,
  icon,
  showBackButton = true,
  backTo,
  rightContent,
}: PageHeaderProps) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b bg-card px-4 py-3 md:px-6 md:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            title="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        {icon && <div className="shrink-0 text-primary">{icon}</div>}
        <h1 className="truncate text-lg font-bold md:text-xl">{title}</h1>
      </div>

      <div className="ml-auto flex max-w-full items-center justify-end gap-2">
        {rightContent}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
