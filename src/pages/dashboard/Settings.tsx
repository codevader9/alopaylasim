import { useState } from 'react'
import Header from '@/components/layout/Header'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Save, User, Bell, Shield, Monitor } from 'lucide-react'

export default function Settings() {
  const { profile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profil', icon: <User size={18} /> },
    { id: 'appearance', label: 'Görünüm', icon: <Monitor size={18} /> },
    { id: 'notifications', label: 'Bildirimler', icon: <Bell size={18} /> },
    { id: 'security', label: 'Güvenlik', icon: <Shield size={18} /> },
  ]

  return (
    <div>
      <Header title="Ayarlar" description="Hesap ve uygulama ayarları" />

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tabs */}
          <div className="lg:w-56 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-hover hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader
                  title="Profil Bilgileri"
                  description="Kişisel bilgilerinizi güncelleyin"
                />
                <div className="space-y-5 max-w-lg">
                  <Input
                    label="Ad Soyad"
                    defaultValue={profile?.full_name || ''}
                  />
                  <Input
                    label="E-posta"
                    type="email"
                    defaultValue={profile?.email || ''}
                    disabled
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 dark:border-dark-border
                        bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        focus:border-primary-300 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none
                        transition-all resize-none"
                      placeholder="Kendinizden bahsedin..."
                    />
                  </div>
                  <Button icon={<Save size={18} />}>Kaydet</Button>
                </div>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card>
                <CardHeader
                  title="Görünüm"
                  description="Tema ve görünüm ayarlarınız"
                />
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-border">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Koyu Mod</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Arayüzü koyu tema ile kullanın</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                    </label>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader
                  title="Bildirim Tercihleri"
                  description="Bildirim ayarlarınızı yönetin"
                />
                <div className="space-y-4">
                  {[
                    { label: 'E-posta Bildirimleri', desc: 'Önemli güncellemeleri e-posta ile alın' },
                    { label: 'Tarayıcı Bildirimleri', desc: 'Push bildirimleri alın' },
                    { label: 'Haftalık Özet', desc: 'Her hafta aktivite özeti alın' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader
                  title="Güvenlik"
                  description="Şifre ve güvenlik ayarlarınız"
                />
                <div className="space-y-5 max-w-lg">
                  <Input label="Mevcut Şifre" type="password" placeholder="••••••••" />
                  <Input label="Yeni Şifre" type="password" placeholder="••••••••" />
                  <Input label="Yeni Şifre (Tekrar)" type="password" placeholder="••••••••" />
                  <Button icon={<Save size={18} />}>Şifreyi Güncelle</Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
