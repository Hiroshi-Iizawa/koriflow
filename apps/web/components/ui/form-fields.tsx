'use client'

import { ReactNode, forwardRef, HTMLInputTypeAttribute } from "react"
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@koriflow/ui"
import { cn } from "@lib/utils"

interface BaseFieldProps {
  id: string
  label: string
  className?: string
  required?: boolean
  error?: string
}

interface InputFieldProps extends BaseFieldProps {
  type?: HTMLInputTypeAttribute
  placeholder?: string
  unit?: string
  icon?: ReactNode
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
}

interface SelectFieldProps extends BaseFieldProps {
  options: { value: string; label: string }[]
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

interface TextareaFieldProps extends BaseFieldProps {
  rows?: number
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ id, label, className, required, error, type = "text", placeholder, unit, icon, ...props }, ref) => {
    return (
      <div className={cn("space-y-1", className)}>
        <Label htmlFor={id} className="text-sm text-kori-700 font-medium tracking-tight">
          {label}
          {required && <span className="text-kori-600 ml-1">*</span>}
        </Label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-kori-600">
              {icon}
            </div>
          )}
          <Input
            ref={ref}
            id={id}
            type={type}
            placeholder={placeholder}
            className={cn(
              "w-full h-10 border-kori-300 focus:ring-2 focus:ring-kori-400 focus:border-kori-400",
              "dark:bg-kori-900/40 dark:border-kori-700",
              icon && "pl-10",
              unit && "pr-12",
              error && "border-red-500"
            )}
            aria-required={required}
            aria-invalid={!!error}
            {...props}
          />
          {unit && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-kori-600 pointer-events-none">
              {unit}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    )
  }
)

InputField.displayName = "InputField"

export const SelectField = forwardRef<HTMLButtonElement, SelectFieldProps>(
  ({ id, label, className, required, error, options, placeholder, value, onChange, ...props }, ref) => {
    return (
      <div className={cn("space-y-1", className)}>
        <Label htmlFor={id} className="text-sm text-kori-700 font-medium tracking-tight">
          {label}
          {required && <span className="text-kori-600 ml-1">*</span>}
        </Label>
        <Select value={value} onValueChange={onChange} {...props}>
          <SelectTrigger
            ref={ref}
            id={id}
            className={cn(
              "w-full h-10 border-kori-300 focus:ring-2 focus:ring-kori-400 focus:border-kori-400",
              "dark:bg-kori-900/40 dark:border-kori-700",
              error && "border-red-500"
            )}
            aria-required={required}
            aria-invalid={!!error}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    )
  }
)

SelectField.displayName = "SelectField"

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ id, label, className, required, error, rows = 3, placeholder, ...props }, ref) => {
    return (
      <div className={cn("space-y-1", className)}>
        <Label htmlFor={id} className="text-sm text-kori-700 font-medium tracking-tight">
          {label}
          {required && <span className="text-kori-600 ml-1">*</span>}
        </Label>
        <Textarea
          ref={ref}
          id={id}
          rows={rows}
          placeholder={placeholder}
          className={cn(
            "w-full border-kori-300 focus:ring-2 focus:ring-kori-400 focus:border-kori-400 resize-none",
            "dark:bg-kori-900/40 dark:border-kori-700",
            error && "border-red-500"
          )}
          aria-required={required}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    )
  }
)

TextareaField.displayName = "TextareaField"

// Form section wrapper component
interface SectionProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function Section({ title, icon, children, className }: SectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="flex items-center gap-2 text-kori-700 font-semibold">
        {icon && <span className="text-kori-600">{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  )
}