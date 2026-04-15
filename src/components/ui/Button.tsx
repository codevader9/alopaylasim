import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  children: ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-200 dark:focus:ring-primary-900/40 shadow-sm',
  secondary:
    'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover focus:ring-gray-200 dark:focus:ring-gray-700 shadow-sm',
  ghost:
    'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover',
  danger:
    'bg-error-500 text-white hover:bg-error-700 focus:ring-red-200 dark:focus:ring-red-900/40 shadow-sm',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-all duration-150 focus:outline-none focus:ring-4
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : icon ? (
        <span className="h-4 w-4">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
