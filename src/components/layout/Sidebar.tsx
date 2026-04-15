import { NavLink, useNavigate } from 'react-router-dom'
import {
  Users, Settings, LogOut, HelpCircle,
  ChevronLeft, ChevronRight, Trophy, Calendar, Send, Globe, Share2, Repeat2,
  MessageSquare, History, Bot, Waypoints,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Avatar from '@/components/ui/Avatar'
import { useState } from 'react'

interface NavItem { label: string; path: string; icon: React.ReactNode; adminOnly?: boolean }

const mainNav: NavItem[] = [
  { label: 'Maçlar', path: '/dashboard', icon: <Trophy size={20} /> },
  { label: 'Zamanlanmış', path: '/dashboard/scheduled', icon: <Calendar size={20} /> },
  { label: 'Manuel Paylaşım', path: '/dashboard/manual-post', icon: <Send size={20} /> },
  { label: 'Post Geçmişi', path: '/dashboard/history', icon: <History size={20} /> },
]

const manageNav: NavItem[] = [
  { label: 'Siteler', path: '/dashboard/sites', icon: <Globe size={20} />, adminOnly: true },
  { label: 'Sosyal Hesaplar', path: '/dashboard/social-accounts', icon: <Share2 size={20} />, adminOnly: true },
  { label: 'RT Ayarları', path: '/dashboard/retweets', icon: <Repeat2 size={20} />, adminOnly: true },
  { label: 'TG Ayarları', path: '/dashboard/telegram-settings', icon: <Bot size={20} />, adminOnly: true },
  { label: 'Tweet Şablonları', path: '/dashboard/templates', icon: <MessageSquare size={20} />, adminOnly: true },
  { label: 'Proxy', path: '/dashboard/proxies', icon: <Waypoints size={20} />, adminOnly: true },
  { label: 'Kullanıcılar', path: '/dashboard/users', icon: <Users size={20} />, adminOnly: true },
]

const bottomNav: NavItem[] = [
  { label: 'Ayarlar', path: '/dashboard/settings', icon: <Settings size={20} /> },
  { label: 'Yardım', path: '/dashboard/help', icon: <HelpCircle size={20} /> },
]

export default function Sidebar() {
  const { profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => { await signOut(); navigate('/login') }

  const filterItems = (items: NavItem[]) => items.filter(i => !i.adminOnly || isAdmin)

  const renderLink = (item: NavItem) => (
    <NavLink key={item.path} to={item.path} end={item.path === '/dashboard'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-hover hover:text-gray-900 dark:hover:text-white'}
        ${collapsed ? 'justify-center' : ''}`
      } title={collapsed ? item.label : undefined}>
      {item.icon}
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )

  return (
    <aside className={`h-screen bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-dark-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Paylaşım</span>
          </div>
        )}
        {collapsed && (
          <div className="h-7 w-7 rounded-lg bg-primary-600 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xs">P</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${collapsed ? 'hidden' : ''}`}>
          <ChevronLeft size={16} />
        </button>
      </div>

      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="mx-auto mt-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 transition-colors">
          <ChevronRight size={16} />
        </button>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {!collapsed && <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-1">Ana Menü</p>}
        <div className="space-y-0.5">{filterItems(mainNav).map(renderLink)}</div>

        {filterItems(manageNav).length > 0 && (
          <>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">
              {!collapsed && <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-1">Yönetim</p>}
            </div>
            <div className="space-y-0.5">{filterItems(manageNav).map(renderLink)}</div>
          </>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border space-y-0.5">
          {bottomNav.map(renderLink)}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-gray-200 dark:border-dark-border p-3">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <Avatar name={profile?.full_name || 'Kullanıcı'} src={profile?.avatar_url} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{profile?.full_name || 'Kullanıcı'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleSignOut} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Çıkış Yap">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
