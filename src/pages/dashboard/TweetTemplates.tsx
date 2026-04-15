import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { Plus, Trash2, Check, X, FileText } from 'lucide-react'

export default function TweetTemplates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ site_id: '', name: '', template: '', sport: 'all', is_default: false })

  const load = async () => {
    setLoading(true)
    const [t, s] = await Promise.all([api.get('/api/templates/tweet'), api.get('/api/sites')])
    setTemplates(t); setSites(s); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    if (!form.site_id || !form.name || !form.template) return
    await api.post('/api/templates/tweet', form)
    setShowForm(false); setForm({ site_id: '', name: '', template: '', sport: 'all', is_default: false }); load()
  }

  const handleDelete = async (id: string) => { await api.delete(`/api/templates/tweet/${id}`); load() }

  const previewTemplate = (t: string) => {
    return t.replace('{{home_team}}', 'Galatasaray').replace('{{away_team}}', 'Fenerbahçe')
      .replace('{{league}}', 'Süper Lig').replace('{{date}}', '17 Şubat').replace('{{time}}', '20:00')
      .replace('{{venue}}', 'Ali Sami Yen')
  }

  return (
    <div>
      <Header title="Tweet Şablonları" description="Site bazlı tweet/caption şablonları" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">{templates.length} şablon</p>
          <Button onClick={() => setShowForm(!showForm)} icon={showForm ? <X size={18} /> : <Plus size={18} />} variant={showForm ? 'secondary' : 'primary'}>
            {showForm ? 'İptal' : 'Yeni Şablon'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Site</label>
                <select value={form.site_id} onChange={(e) => setForm({ ...form, site_id: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-300">
                  <option value="">Seçin</option>
                  {sites.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Şablon Adı</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Maç Öncesi Tweet"
                  className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Spor</label>
                <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-300">
                  <option value="all">Tümü</option>
                  <option value="football">Futbol</option>
                  <option value="basketball">Basketbol</option>
                  <option value="volleyball">Voleybol</option>
                  <option value="tennis">Tenis</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Şablon <span className="text-gray-400 font-normal">{'({{home_team}}, {{away_team}}, {{league}}, {{date}}, {{time}}, {{venue}})'}</span>
                </label>
                <textarea value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} rows={3}
                  placeholder="🔥 {{home_team}} vs {{away_team}} - {{league}} 📅 {{date}} {{time}}"
                  className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-300 resize-none" />
                {form.template && (
                  <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-dark-surface">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Önizleme:</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{previewTemplate(form.template)}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4"><Button onClick={handleSubmit} icon={<Check size={18} />}>Kaydet</Button></div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">Yükleniyor...</p> :
            templates.length === 0 ? <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">Şablon yok.</p> :
            templates.map((t: any) => (
              <Card key={t.id}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="gray">{t.sport}</Badge>
                    {t.is_default && <Badge variant="primary">Varsayılan</Badge>}
                    <button onClick={() => handleDelete(t.id)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-error-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t.sites?.name}</p>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300">{t.template}</div>
              </Card>
            ))
          }
        </div>
      </div>
    </div>
  )
}
