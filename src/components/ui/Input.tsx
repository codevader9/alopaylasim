import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-lg border border-gray-300 dark:border-dark-border
              bg-white dark:bg-dark-input px-3.5 py-2.5
              text-sm text-gray-900 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:border-primary-300 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none
              transition-all duration-150
              disabled:bg-gray-50 dark:disabled:bg-dark-surface disabled:text-gray-500 dark:disabled:text-gray-500
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-error-500 focus:border-error-500 focus:ring-red-100 dark:focus:ring-red-900/30' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
