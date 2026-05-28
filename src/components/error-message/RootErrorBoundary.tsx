import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export function RootErrorBoundary() {
  const error = useRouteError()

  let title   = "Something went wrong"
  let message = "An unexpected error occurred. Please try again."

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title   = "Page not found"
      message = "The page you're looking for doesn't exist."
    } else if (error.status === 403) {
      title   = "Access denied"
      message = "You don't have permission to view this page."
    }
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="max-w-sm text-muted-foreground">{message}</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload
        </Button>
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </div>
  )
}
