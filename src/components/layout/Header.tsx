import { Bell, Search, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import Badge from '@/components/ui/Badge'

interface HeaderProps {
  title: string
  description?: string
}

export default function Header({ title, description }: HeaderProps) {
  const { profile, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Ara..."
            className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 dark:border-dark-border
              bg-white dark:bg-dark-input text-sm text-gray-900 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30
              transition-all"
          />
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-500 dark:text-gray-400 transition-colors"
          title={isDark ? 'Açık Mod' : 'Koyu Mod'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-500 dark:text-gray-400 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-error-500 rounded-full" />
        </button>

        {/* Role badge */}
        {isAdmin && <Badge variant="primary">Admin</Badge>}

        {/* User quick info */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-dark-border">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {profile?.full_name}
          </span>
        </div>
      </div>
    </header>
  )
}
