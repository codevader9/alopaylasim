import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'
import { Plus, Trash2, X, Check, Twitter, Send, Instagram, Eye, EyeOff, Zap, Loader2, CheckCircle, XCircle, Pencil } from 'lucide-react'

const platformIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter size={18} />, telegram: <Send size={18} />, instagram: <Instagram size={18} />,
}

const defaultForm = { site_id: '', platform: 'twitter', account_name: '', proxy_id: '',
  tw_username: '', tw_email: '', tw_password: '', tw_totp: '', tw_cookies: '',
  tg_token: '', tg_chat_id: '', tg_menu_id: '', ig_token: '', ig_user_id: '' }

export default function SocialAccounts() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [proxies, setProxies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [showPw, setShowPw] = useState(false)
  const [tgMenus, setTgMenus] = useState<any[]>([])
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<Record<string, { success: boolean; message: string }>>({})

  const load = async () => {
    setLoading(true)
    try {
      const [a, s, p] = await Promise.all([api.get('/api/social-accounts'), api.get('/api/sites'), api.get('/api/proxies')])
      setAccounts(a); setSites(s); setProxies(p)
      try { const m = await api.get('/api/telegram/menus'); setTgMenus(m) } catch { setTgMenus([]) }
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const resetForm = () => { setForm(defaultForm); setEditId(null) }

  const setF = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  const buildCredentials = () => {
    switch (form.platform) {
      case 'twitter': return {
        user_name: form.tw_username, email: form.tw_email, password: form.tw_password,
        ...(form.tw_totp ? { totp_secret: form.tw_totp } : {}),
        ...(form.tw_cookies ? { login_cookies: form.tw_cookies } : {}),
      }
      case 'telegram': return { bot_token: form.tg_token, chat_id: form.tg_chat_id }
      case 'instagram': return { access_token: form.ig_token, ig_user_id: form.ig_user_id }
      default: return {}
    }
  }

  const handleSubmit = async () => {
    if (!form.site_id || !form.account_name) return
    const payload = { site_id: form.site_id, platform: form.platform, account_name: form.account_name,
      credentials: buildCredentials(), proxy_id: form.proxy_id || null }
    if (editId) { await api.put(`/api/social-accounts/${editId}`, payload) }
    else { await api.post('/api/social-accounts', payload) }
    resetForm(); setShowForm(false); load()
  }

  const handleEdit = (acc: any) => {
    const c = acc.credentials || {}
    const linkedMenu = tgMenus.find((m: any) => m.social_account_id === acc.id)
    setForm({
      site_id: acc.site_id, platform: acc.platform, account_name: acc.account_name,
      proxy_id: acc.proxy_id || '',
      tw_username: c.user_name || '', tw_email: c.email || '', tw_password: c.password || '',
      tw_totp: c.totp_secret || '', tw_cookies: c.login_cookies || '',
      tg_token: c.bot_token || '', tg_chat_id: c.chat_id || '',
      tg_menu_id: linkedMenu?.id || '',
      ig_token: c.access_token || '', ig_user_id: c.ig_user_id || '',
    })
    setEditId(acc.id); setShowForm(true)
  }

  const handleDelete = async (id: string) => { await api.delete(`/api/social-accounts/${id}`); load() }

  const handleTest = async (acc: any) => {
    setTestingId(acc.id)
    setTestResult(prev => ({ ...prev, [acc.id]: { success: false, message: 'Maç görseli gönderiliyor...' } }))
    try {
      const matches = await api.get('/api/matches?status=upcoming')
      const matchList = Array.isArray(matches) ? matches : []
      if (matchList.length === 0) {
        setTestResult(prev => ({ ...prev, [acc.id]: { success: false, message: 'Test için önce maç çekin' } }))
        setTestingId(null); return
      }
      const match = matchList[0]
      if (acc.platform === 'telegram') {
        await api.post('/api/test/publish-match', {
          bot_token: acc.credentials.bot_token, chat_id: acc.credentials.chat_id,
          match_id: match.id, site_id: acc.site_id,
        })
        setTestResult(prev => ({ ...prev, [acc.id]: { success: true, message: `"${match.home_team} vs ${match.away_team}" gönderildi!` } }))
      } else if (acc.platform === 'twitter') {
        await api.post('/api/posts/publish-now', {
          platform: 'twitter', social_account_id: acc.id, site_id: acc.site_id,
          caption: `⚽ ${match.home_team} vs ${match.away_team}\n🏆 ${match.league_name}`, match_id: match.id,
        })
        setTestResult(prev => ({ ...prev, [acc.id]: { success: true, message: `"${match.home_team} vs ${match.away_team}" tweet atıldı!` } }))
      } else {
        setTestResult(prev => ({ ...prev, [acc.id]: { success: false, message: 'Bu platform henüz desteklenmiyor' } }))
      }
    } catch (err: any) {
      setTestResult(prev => ({ ...prev, [acc.id]: { success: false, message: err.message } }))
    }
    setTestingId(null)
  }

  const sel = "w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none transition-all"

  return (
    <div>
      <Header title="Sosyal Hesaplar" description="Twitter, Telegram, Instagram hesaplarını yönet" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">{accounts.length} hesap</p>
          <Button onClick={() => { if (showForm) { resetForm(); setShowForm(false) } else { resetForm(); setShowForm(true) } }}
            icon={showForm ? <X size={18} /> : <Plus size={18} />} variant={showForm ? 'secondary' : 'primary'}>
            {showForm ? 'İptal' : 'Yeni Hesap'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Site</label>
                  <select value={form.site_id} onChange={(e) => setF('site_id', e.target.value)} className={sel}>
                    <option value="">Site seçin</option>
                    {sites.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Platform</label>
                  <select value={form.platform} onChange={(e) => setF('platform', e.target.value)} className={sel} disabled={!!editId}>
                    <option value="twitter">X / Twitter</option>
                    <option value="telegram">Telegram</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
                <div><Input label="Hesap Adı" value={form.account_name} onChange={(e) => setF('account_name', e.target.value)} placeholder={form.platform === 'twitter' ? '@kullaniciadi' : form.platform === 'telegram' ? 'Bot adı' : '@igkullanici'} /></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Proxy</label>
                  <select value={form.proxy_id} onChange={(e) => setF('proxy_id', e.target.value)} className={sel}>
                    <option value="">Proxy yok</option>
                    {proxies.map((p: any) => <option key={p.id} value={p.id}>{p.label} ({p.host}:{p.port})</option>)}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-dark-border pt-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {platformIcons[form.platform]}
                    {form.platform === 'twitter' ? 'Twitter Bilgileri' : form.platform === 'telegram' ? 'Telegram Bot Bilgileri' : 'Instagram Bilgileri'}
                  </h4>
                  <button onClick={() => setShowPw(!showPw)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />} {showPw ? 'Gizle' : 'Göster'}
                  </button>
                </div>

                {form.platform === 'twitter' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Kullanıcı Adı" value={form.tw_username} onChange={(e) => setF('tw_username', e.target.value)} placeholder="kullaniciadi" />
                    <Input label="E-posta" type="email" value={form.tw_email} onChange={(e) => setF('tw_email', e.target.value)} placeholder="email@ornek.com" />
                    <Input label="Şifre" type={showPw ? 'text' : 'password'} value={form.tw_password} onChange={(e) => setF('tw_password', e.target.value)} placeholder="••••••••" />
                    <Input label="TOTP Secret" type={showPw ? 'text' : 'password'} value={form.tw_totp} onChange={(e) => setF('tw_totp', e.target.value)} placeholder="Opsiyonel" />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Login Cookies</label>
                      <textarea value={form.tw_cookies} onChange={(e) => setF('tw_cookies', e.target.value)} rows={2} placeholder="Login sonrası otomatik dolar"
                        className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm font-mono text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-primary-300 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none resize-none" />
                    </div>
                  </div>
                )}
                {form.platform === 'telegram' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Bot Token" type={showPw ? 'text' : 'password'} value={form.tg_token} onChange={(e) => setF('tg_token', e.target.value)} placeholder="123456789:ABC..." />
                    <Input label="Chat / Kanal ID" value={form.tg_chat_id} onChange={(e) => setF('tg_chat_id', e.target.value)} placeholder="-1001234567890" />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">TG Menü Şablonu</label>
                      <select value={form.tg_menu_id} onChange={(e) => setF('tg_menu_id', e.target.value)} className={sel}>
                        <option value="">Menü seçin (opsiyonel)</option>
                        {tgMenus.filter((m: any) => !form.site_id || m.site_id === form.site_id).map((m: any) => (
                          <option key={m.id} value={m.id}>{m.menu_name} ({m.sites?.name})</option>
                        ))}
                      </select>
                      {form.tg_menu_id && (() => {
                        const selected = tgMenus.find((m: any) => m.id === form.tg_menu_id)
                        if (!selected) return null
                        const buttons = selected.menu_json?.inline_keyboard || selected.menu_json?.keyboard || []
                        if (buttons.length === 0) return null
                        return (
                          <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-dark-surface">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Buton önizleme:</p>
                            <div className="space-y-1">
                              {buttons.map((row: any[], ri: number) => (
                                <div key={ri} className="flex gap-1">
                                  {row.map((btn: any, bi: number) => (
                                    <div key={bi} className="flex-1 text-center px-2 py-1.5 rounded bg-primary-500/10 dark:bg-primary-500/20 text-xs font-medium text-primary-600 dark:text-primary-400">
                                      {btn.text || btn}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )}
                {form.platform === 'instagram' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Access Token" type={showPw ? 'text' : 'password'} value={form.ig_token} onChange={(e) => setF('ig_token', e.target.value)} placeholder="IG Graph API token" />
                    <Input label="IG User ID" value={form.ig_user_id} onChange={(e) => setF('ig_user_id', e.target.value)} placeholder="17841400..." />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button onClick={handleSubmit} icon={<Check size={18} />} disabled={!form.site_id || !form.account_name}>
                  {editId ? 'Güncelle' : 'Hesap Ekle'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card padding={false}>
          {loading ? <div className="p-8 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div> :
            accounts.length === 0 ? <div className="p-8 text-center text-gray-500 dark:text-gray-400">Hesap bulunamadı.</div> :
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
              {accounts.map((acc: any) => (
                <div key={acc.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      {platformIcons[acc.platform] || <Send size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{acc.account_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {acc.sites?.name || '-'}
                        {acc.platform === 'twitter' && acc.credentials?.user_name && ` • @${acc.credentials.user_name}`}
                        {acc.platform === 'telegram' && acc.credentials?.chat_id && ` • Chat: ${acc.credentials.chat_id}`}
                        {acc.platform === 'telegram' && (() => {
                          const menu = tgMenus.find((m: any) => m.social_account_id === acc.id)
                          return menu ? ` • 🔘 ${menu.menu_name}` : ''
                        })()}
                      </p>
                    </div>
                    <Badge variant={acc.platform === 'twitter' ? 'primary' : acc.platform === 'telegram' ? 'success' : 'warning'}>
                      {acc.platform === 'twitter' ? 'X / Twitter' : acc.platform === 'telegram' ? 'Telegram' : 'Instagram'}
                    </Badge>
                    <Badge variant={acc.is_active ? 'success' : 'gray'}>{acc.is_active ? 'Aktif' : 'Pasif'}</Badge>
                    {acc.proxies && <span className="text-xs text-gray-400">{acc.proxies.label}</span>}
                    <button onClick={() => handleTest(acc)} disabled={testingId === acc.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50">
                      {testingId === acc.id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Test
                    </button>
                    <button onClick={() => handleEdit(acc)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(acc.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-error-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {testResult[acc.id] && (
                    <div className={`mt-2 ml-12 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                      testResult[acc.id].success ? 'bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500'
                        : 'bg-error-50 dark:bg-error-500/15 text-error-700 dark:text-error-500'}`}>
                      {testResult[acc.id].success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {testResult[acc.id].message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
        </Card>
      </div>
    </div>
  )
}
