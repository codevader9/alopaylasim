import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import { api } from '@/lib/api'
import { Search, UserPlus, Shield, Trash2, X, Check, Loader2 } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'user' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try { setUsers(await api.get('/api/users')) } catch { setUsers([]) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.email || !form.password) { setError('Email ve şifre gerekli'); return }
    setCreating(true); setError('')
    try {
      await api.post('/api/users', form)
      setForm({ email: '', password: '', full_name: '', role: 'user' })
      setShowForm(false); load()
    } catch (err: any) { setError(err.message) }
    setCreating(false)
  }

  const handleToggleRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    try {
      await api.put(`/api/users/${user.id}/role`, { role: newRole })
      load()
    } catch (err: any) { alert(err.message) }
  }

  const handleDelete = async (user: UserProfile) => {
    if (!confirm(`"${user.full_name || user.email}" kullanıcısını silmek istediğinize emin misiniz?`)) return
    setDeletingId(user.id)
    try {
      await api.delete(`/api/users/${user.id}`)
      load()
    } catch (err: any) { alert(err.message) }
    setDeletingId(null)
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sel = "w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none transition-all"

  return (
    <div>
      <Header title="Kullanıcı Yönetimi" description="Kullanıcıları görüntüle ve yönet" />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Kullanıcı ara..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all" />
          </div>
          <Button onClick={() => { setShowForm(!showForm); setError('') }}
            icon={showForm ? <X size={18} /> : <UserPlus size={18} />} variant={showForm ? 'secondary' : 'primary'}>
            {showForm ? 'İptal' : 'Kullanıcı Ekle'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Ad Soyad" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Ad Soyad" />
              <Input label="E-posta" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@ornek.com" />
              <Input label="Şifre" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 karakter" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Rol</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={sel}>
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            {error && <div className="mt-3 p-3 rounded-lg bg-error-50 dark:bg-error-500/15 text-error-700 dark:text-error-500 text-sm">{error}</div>}
            <div className="mt-4">
              <Button onClick={handleCreate} loading={creating} icon={<Check size={18} />}>Oluştur</Button>
            </div>
          </Card>
        )}

        <Card padding={false}>
          {loading ? <div className="p-8 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div> :
            filtered.length === 0 ? <div className="p-8 text-center text-gray-500 dark:text-gray-400">Kullanıcı bulunamadı.</div> :
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kullanıcı</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kayıt Tarihi</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.full_name || user.email} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.full_name || '-'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'admin' ? 'primary' : 'gray'}>
                          {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleToggleRole(user)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            title={user.role === 'admin' ? 'Kullanıcı yap' : 'Admin yap'}>
                            <Shield size={14} />
                            {user.role === 'admin' ? 'User yap' : 'Admin yap'}
                          </button>
                          <button onClick={() => handleDelete(user)} disabled={deletingId === user.id}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-error-600 dark:hover:text-error-500 transition-colors disabled:opacity-50"
                            title="Sil">
                            {deletingId === user.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </Card>
      </div>
    </div>
  )
}
