import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-primary text-primary-foreground",
        secondary:   "border-transparent bg-secondary text-secondary-foreground",
        outline:     "border-border text-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",

        // Semantic — all driven by CSS variables
        success: "border-transparent bg-success-bg text-success",
        warning: "border-transparent bg-warning-bg text-warning",
        error:   "border-transparent bg-error-bg text-error",
        info:    "border-transparent bg-info-bg text-info",

        // Order / kitchen statuses
        pending:   "border-transparent bg-warning-bg text-warning",
        preparing: "border-transparent bg-info-bg text-info",
        ready:     "border-transparent bg-success-bg text-success",
        completed: "border-border bg-muted text-muted-foreground",
        cancelled: "border-transparent bg-error-bg text-error",
        paid:      "border-transparent bg-success-bg text-success",
        unpaid:    "border-transparent bg-warning-bg text-warning",

        // Table statuses
        available: "border-transparent bg-success-bg text-success",
        occupied:  "border-transparent bg-error-bg text-error",
        reserved:  "border-transparent bg-warning-bg text-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
