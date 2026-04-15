import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { Plus, Trash2, Check, X, Shield } from 'lucide-react'

export default function Proxies() {
  const [proxies, setProxies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: '', host: '', port: '', username: '', password: '', protocol: 'http' })

  const load = async () => { setLoading(true); try { setProxies(await api.get('/api/proxies')) } catch {} setLoading(false) }
  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    if (!form.label || !form.host || !form.port) return
    await api.post('/api/proxies', { ...form, port: parseInt(form.port) })
    setForm({ label: '', host: '', port: '', username: '', password: '', protocol: 'http' }); setShowForm(false); load()
  }

  const handleDelete = async (id: string) => { await api.delete(`/api/proxies/${id}`); load() }

  const selectClass = "w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none transition-all"

  return (
    <div>
      <Header title="Proxy Yönetimi" description="Sosyal hesaplar için proxy ayarları" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">{proxies.length} proxy tanımlı</p>
          <Button onClick={() => { setShowForm(!showForm); if (showForm) setForm({ label: '', host: '', port: '', username: '', password: '', protocol: 'http' }) }}
            icon={showForm ? <X size={18} /> : <Plus size={18} />} variant={showForm ? 'secondary' : 'primary'}>
            {showForm ? 'İptal' : 'Yeni Proxy'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Etiket" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Twitter Proxy 1" />
              <Input label="Host" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="gw.dataimpulse.com" />
              <Input label="Port" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} placeholder="823" />
              <Input label="Kullanıcı Adı" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" />
              <Input label="Şifre" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="password" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Protokol</label>
                <select value={form.protocol} onChange={(e) => setForm({ ...form, protocol: e.target.value })} className={selectClass}>
                  <option value="http">HTTP</option>
                  <option value="https">HTTPS</option>
                  <option value="socks5">SOCKS5</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleSubmit} icon={<Check size={18} />}>Ekle</Button>
            </div>
          </Card>
        )}

        <Card padding={false}>
          {loading ? <div className="p-8 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div> :
            proxies.length === 0 ? <div className="p-8 text-center text-gray-500 dark:text-gray-400">Proxy bulunamadı.</div> :
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
              {proxies.map((p: any) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                  <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    <Shield size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{p.protocol}://{p.username ? `${p.username}:***@` : ''}{p.host}:{p.port}</p>
                  </div>
                  <Badge variant="gray">{p.protocol.toUpperCase()}</Badge>
                  <Badge variant={p.is_active ? 'success' : 'gray'}>{p.is_active ? 'Aktif' : 'Pasif'}</Badge>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-error-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          }
        </Card>
      </div>
    </div>
  )
}
