import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Plus, Trash2, Check, X, MessageSquare, Pencil } from 'lucide-react'

export default function TelegramSettings() {
  const [menus, setMenus] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    site_id: '', social_account_id: '', menu_name: '',
    menu_json: '{\n  "inline_keyboard": [\n    [\n      {"text": "📺 Canlı Maç İzle", "url": "https://siteadi.com/canli"},\n      {"text": "🎁 250 TL Bonus Al", "url": "https://siteadi.com/bonus"}\n    ]\n  ]\n}'
  })

  const load = async () => {
    setLoading(true)
    const [m, s, a] = await Promise.all([api.get('/api/telegram/menus'), api.get('/api/sites'), api.get('/api/social-accounts?platform=telegram')])
    setMenus(m); setSites(s); setAccounts(a); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const resetForm = () => {
    setEditId(null)
    setForm({
      site_id: '', social_account_id: '', menu_name: '',
      menu_json: '{\n  "inline_keyboard": [\n    [\n      {"text": "📺 Canlı Maç İzle", "url": "https://siteadi.com/canli"},\n      {"text": "🎁 250 TL Bonus Al", "url": "https://siteadi.com/bonus"}\n    ]\n  ]\n}'
    })
  }

  const handleSubmit = async () => {
    if (!form.menu_name) return
    let json = {}
    try { json = JSON.parse(form.menu_json) } catch { alert('Geçersiz JSON'); return }

    if (editId) {
      await api.put(`/api/telegram/menus/${editId}`, { menu_name: form.menu_name, menu_json: json })
    } else {
      if (!form.site_id || !form.social_account_id) return
      await api.post('/api/telegram/menus', { ...form, menu_json: json })
    }
    resetForm(); setShowForm(false); load()
  }

  const handleEdit = (menu: any) => {
    setForm({
      site_id: menu.site_id,
      social_account_id: menu.social_account_id,
      menu_name: menu.menu_name,
      menu_json: JSON.stringify(menu.menu_json, null, 2),
    })
    setEditId(menu.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => { await api.delete(`/api/telegram/menus/${id}`); load() }

  const sel = "w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-300"

  // Site'ye göre filtrelenen hesaplar
  const filteredAccounts = form.site_id
    ? accounts.filter((a: any) => a.site_id === form.site_id)
    : accounts

  return (
    <div>
      <Header title="Telegram Ayarları" description="Inline butonlar ve menü şablonları" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">{menus.length} menü tanımlı</p>
          <Button onClick={() => { if (showForm) { resetForm(); setShowForm(false) } else { resetForm(); setShowForm(true) } }}
            icon={showForm ? <X size={18} /> : <Plus size={18} />} variant={showForm ? 'secondary' : 'primary'}>
            {showForm ? 'İptal' : 'Yeni Menü'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Site</label>
                <select value={form.site_id} onChange={(e) => setForm({ ...form, site_id: e.target.value, social_account_id: '' })}
                  className={sel} disabled={!!editId}>
                  <option value="">Seçin</option>
                  {sites.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">TG Hesabı</label>
                <select value={form.social_account_id} onChange={(e) => setForm({ ...form, social_account_id: e.target.value })}
                  className={sel} disabled={!!editId}>
                  <option value="">Seçin</option>
                  {filteredAccounts.map((a: any) => <option key={a.id} value={a.id}>{a.account_name} {a.credentials?.chat_id ? `(${a.credentials.chat_id})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Menü Adı</label>
                <input value={form.menu_name} onChange={(e) => setForm({ ...form, menu_name: e.target.value })} placeholder="Maç Butonları"
                  className={sel} />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Inline Keyboard JSON</label>
                <textarea value={form.menu_json} onChange={(e) => setForm({ ...form, menu_json: e.target.value })} rows={8}
                  className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-300 resize-none" />

                {/* Önizleme */}
                {(() => {
                  try {
                    const parsed = JSON.parse(form.menu_json)
                    const buttons = parsed.inline_keyboard || parsed.keyboard || []
                    if (buttons.length === 0) return null
                    return (
                      <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-surface">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Önizleme:</p>
                        <div className="space-y-1.5">
                          {buttons.map((row: any[], ri: number) => (
                            <div key={ri} className="flex gap-1.5">
                              {row.map((btn: any, bi: number) => (
                                <div key={bi} className="flex-1 text-center px-3 py-2 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 text-xs font-medium text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                                  {btn.text || btn}
                                  {btn.url && <span className="block text-[10px] text-gray-400 mt-0.5 truncate">{btn.url}</span>}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  } catch { return null }
                })()}
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleSubmit} icon={<Check size={18} />}>
                {editId ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">Yükleniyor...</p> :
            menus.length === 0 ? <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">Menü bulunamadı.</p> :
            menus.map((menu: any) => (
              <Card key={menu.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-primary-500" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{menu.menu_name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{menu.sites?.name} / {menu.social_accounts?.account_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(menu)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-primary-500 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(menu.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-error-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Buton önizleme */}
                {(() => {
                  const buttons = menu.menu_json?.inline_keyboard || menu.menu_json?.keyboard || []
                  if (buttons.length === 0) return <pre className="text-xs bg-gray-50 dark:bg-dark-surface p-3 rounded-lg overflow-x-auto text-gray-700 dark:text-gray-300">{JSON.stringify(menu.menu_json, null, 2)}</pre>
                  return (
                    <div className="space-y-1.5">
                      {buttons.map((row: any[], ri: number) => (
                        <div key={ri} className="flex gap-1.5">
                          {row.map((btn: any, bi: number) => (
                            <div key={bi} className="flex-1 text-center px-2 py-1.5 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 text-xs font-medium text-primary-600 dark:text-primary-400">
                              {btn.text || btn}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </Card>
            ))
          }
        </div>
      </div>
    </div>
  )
}
