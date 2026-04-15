import type { ReactNode } from 'react'

type BadgeVariant = 'success' | 'warning' | 'error' | 'gray' | 'primary'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500',
  error: 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-400',
}

export default function Badge({
  variant = 'gray',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
