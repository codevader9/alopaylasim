import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import AuthGuard from '@/guards/AuthGuard'
import AdminGuard from '@/guards/AdminGuard'
import DashboardLayout from '@/components/layout/DashboardLayout'

import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Settings from '@/pages/dashboard/Settings'
import Help from '@/pages/dashboard/Help'
import UsersManagement from '@/pages/admin/UsersManagement'

import Matches from '@/pages/dashboard/Matches'
import ScheduledPosts from '@/pages/dashboard/ScheduledPosts'
import ManualPost from '@/pages/dashboard/ManualPost'
import Sites from '@/pages/dashboard/Sites'
import SocialAccounts from '@/pages/dashboard/SocialAccounts'
import RetweetSettings from '@/pages/dashboard/RetweetSettings'
import TelegramSettings from '@/pages/dashboard/TelegramSettings'
import TweetTemplates from '@/pages/dashboard/TweetTemplates'
import PostHistory from '@/pages/dashboard/PostHistory'
import Proxies from '@/pages/dashboard/Proxies'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={<AuthGuard><DashboardLayout /></AuthGuard>}>
              <Route index element={<Matches />} />
              <Route path="matches" element={<Matches />} />
              <Route path="scheduled" element={<ScheduledPosts />} />
              <Route path="manual-post" element={<ManualPost />} />
              <Route path="history" element={<PostHistory />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />

              {/* Admin only */}
              <Route path="sites" element={<AdminGuard><Sites /></AdminGuard>} />
              <Route path="social-accounts" element={<AdminGuard><SocialAccounts /></AdminGuard>} />
              <Route path="retweets" element={<AdminGuard><RetweetSettings /></AdminGuard>} />
              <Route path="telegram-settings" element={<AdminGuard><TelegramSettings /></AdminGuard>} />
              <Route path="templates" element={<AdminGuard><TweetTemplates /></AdminGuard>} />
              <Route path="proxies" element={<AdminGuard><Proxies /></AdminGuard>} />
              <Route path="users" element={<AdminGuard><UsersManagement /></AdminGuard>} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
