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
    <header className="flex items-center justify-between border-b bg-card px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center gap-3">
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
        {icon && <div className="text-primary">{icon}</div>}
        <h1 className="text-lg md:text-xl font-bold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
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
