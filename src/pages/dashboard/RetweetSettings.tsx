import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { Plus, Trash2, Check, X, Repeat2 } from 'lucide-react'

export default function RetweetSettings() {
  const [configs, setConfigs] = useState<any[]>([])
  const [rtAccounts, setRtAccounts] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [_loading, setLoading] = useState(true)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [accForm, setAccForm] = useState({ site_id: '', account_name: '', credentials: '{}', delay_seconds: 30 })

  const load = async () => {
    setLoading(true)
    const [c, a, s] = await Promise.all([api.get('/api/retweets/configs'), api.get('/api/retweets/accounts'), api.get('/api/sites')])
    setConfigs(c); setRtAccounts(a); setSites(s); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const toggleConfig = async (siteId: string) => {
    const existing = configs.find(c => c.site_id === siteId)
    if (existing) {
      await api.put(`/api/retweets/configs/${existing.id}`, { is_active: !existing.is_active })
    } else {
      await api.post('/api/retweets/configs', { site_id: siteId, is_active: true })
    }
    load()
  }

  const addAccount = async () => {
    if (!accForm.site_id || !accForm.account_name) return
    let creds = {}
    try { creds = JSON.parse(accForm.credentials) } catch {}
    await api.post('/api/retweets/accounts', { ...accForm, credentials: creds })
    setShowAccountForm(false); setAccForm({ site_id: '', account_name: '', credentials: '{}', delay_seconds: 30 }); load()
  }

  const deleteAccount = async (id: string) => { await api.delete(`/api/retweets/accounts/${id}`); load() }

  return (
    <div>
      <Header title="Retweet Ayarları" description="Otomatik RT yapılandırması" />
      <div className="p-6 space-y-6">
        {/* RT Config per site */}
        <Card>
          <CardHeader title="Site Bazlı RT Durumu" description="Her site için otomatik RT'yi aktifleştirin" />
          <div className="space-y-3">
            {sites.map((site: any) => {
              const config = configs.find(c => c.site_id === site.id)
              return (
                <div key={site.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-border last:border-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{site.name}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant={config?.is_active ? 'success' : 'gray'}>{config?.is_active ? 'Aktif' : 'Pasif'}</Badge>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={config?.is_active || false} onChange={() => toggleConfig(site.id)} />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* RT Accounts */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">RT Hesapları</h3>
          <Button onClick={() => setShowAccountForm(!showAccountForm)} icon={showAccountForm ? <X size={18} /> : <Plus size={18} />} size="sm" variant={showAccountForm ? 'secondary' : 'primary'}>
            {showAccountForm ? 'İptal' : 'Hesap Ekle'}
          </Button>
        </div>

        {showAccountForm && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Site</label>
                <select value={accForm.site_id} onChange={(e) => setAccForm({ ...accForm, site_id: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-300">
                  <option value="">Seçin</option>
                  {sites.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hesap Adı</label>
                <input value={accForm.account_name} onChange={(e) => setAccForm({ ...accForm, account_name: e.target.value })} placeholder="@rtbot1"
                  className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gecikme (sn)</label>
                <input type="number" value={accForm.delay_seconds} onChange={(e) => setAccForm({ ...accForm, delay_seconds: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-300" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Twitter Credentials (JSON)</label>
                <textarea value={accForm.credentials} onChange={(e) => setAccForm({ ...accForm, credentials: e.target.value })} rows={2}
                  className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-300 resize-none" />
              </div>
            </div>
            <div className="mt-4"><Button onClick={addAccount} icon={<Check size={18} />}>Ekle</Button></div>
          </Card>
        )}

        <Card padding={false}>
          {rtAccounts.length === 0 ? <div className="p-6 text-center text-gray-500 dark:text-gray-400">RT hesabı yok.</div> :
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
              {rtAccounts.map((acc: any) => (
                <div key={acc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                  <Repeat2 size={18} className="text-primary-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{acc.account_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{acc.sites?.name} - Gecikme: {acc.delay_seconds}sn</p>
                  </div>
                  <Badge variant={acc.is_active ? 'success' : 'gray'}>{acc.is_active ? 'Aktif' : 'Pasif'}</Badge>
                  <button onClick={() => deleteAccount(acc.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-error-500 transition-colors">
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
