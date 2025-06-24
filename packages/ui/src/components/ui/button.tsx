import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-kori-500 text-white shadow hover:bg-kori-400 active:bg-kori-600 focus-visible:ring-kori-300",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-kori-500 text-kori-700 bg-white shadow-sm hover:bg-kori-50 hover:text-kori-800 active:bg-kori-100",
        secondary:
          "bg-kori-100 text-kori-700 shadow-sm hover:bg-kori-200 active:bg-kori-300",
        ghost: "hover:bg-kori-50 hover:text-kori-700 text-kori-600",
        link: "text-kori-600 underline-offset-4 hover:underline hover:text-kori-800",
        ice: "bg-gradient-to-r from-kori-400 to-kori-500 text-white shadow-lg hover:from-kori-300 hover:to-kori-400 active:from-kori-600 active:to-kori-700 transition-all duration-200",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }