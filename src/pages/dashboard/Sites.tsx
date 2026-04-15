import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { Plus, Globe, Trash2, Pencil, X, Check, Upload, XCircle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Sites() {
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', domain: '', description: '' })
  const [logoUploading, setLogoUploading] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const load = async () => { setLoading(true); try { setSites(await api.get('/api/sites')) } catch {} setLoading(false) }
  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    if (!form.name) return
    if (editId) { await api.put(`/api/sites/${editId}`, form) }
    else { await api.post('/api/sites', form) }
    setForm({ name: '', domain: '', description: '' }); setShowForm(false); setEditId(null); load()
  }

  const handleEdit = (site: any) => {
    setForm({ name: site.name, domain: site.domain || '', description: site.description || '' })
    setEditId(site.id); setShowForm(true)
  }

  const handleDelete = async (id: string) => { await api.delete(`/api/sites/${id}`); load() }

  const handleLogoUpload = useCallback((siteId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/jpeg,image/webp'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      setLogoUploading(siteId)
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          await api.post(`/api/sites/${siteId}/logo`, { logo: reader.result })
          setTick(t => t + 1)
        } catch (err: any) {
          console.error('Logo upload hatası:', err.message)
        }
        setLogoUploading(null)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [])

  const handleLogoDelete = async (siteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await api.delete(`/api/sites/${siteId}/logo`)
    setTick(t => t + 1)
  }

  return (
    <div>
      <Header title="Siteler" description="Çoklu site yönetimi" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">{sites.length} site kayıtlı</p>
          <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', domain: '', description: '' }) }}
            icon={showForm ? <X size={18} /> : <Plus size={18} />} variant={showForm ? 'secondary' : 'primary'}>
            {showForm ? 'İptal' : 'Yeni Site'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Site Adı" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn: BetSite1" />
              <Input label="Domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="ornek.com" />
              <Input label="Açıklama" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Kısa açıklama" />
            </div>
            <div className="mt-4">
              <Button onClick={handleSubmit} icon={<Check size={18} />}>{editId ? 'Güncelle' : 'Ekle'}</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">Yükleniyor...</p> :
            sites.length === 0 ? <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">Henüz site eklenmemiş.</p> :
            sites.map(site => (
              <Card key={site.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{site.name}</h3>
                      {site.domain && <p className="text-xs text-gray-500 dark:text-gray-400">{site.domain}</p>}
                    </div>
                  </div>
                  <Badge variant={site.is_active ? 'success' : 'gray'}>{site.is_active ? 'Aktif' : 'Pasif'}</Badge>
                </div>

                {site.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{site.description}</p>}

                {/* Logo alanı */}
                <SiteLogo
                  siteId={site.id}
                  tick={tick}
                  uploading={logoUploading === site.id}
                  onUpload={() => handleLogoUpload(site.id)}
                  onDelete={(e) => handleLogoDelete(site.id, e)}
                />

                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-dark-border">
                  <button onClick={() => handleEdit(site)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(site.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-error-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))
          }
        </div>
      </div>
    </div>
  )
}

function SiteLogo({ siteId, tick, uploading, onUpload, onDelete }: {
  siteId: string; tick: number; uploading: boolean
  onUpload: () => void; onDelete: (e: React.MouseEvent) => void
}) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setChecking(true)
    setLogoSrc(null)
    const url = `${API_BASE}/api/public/site-logo/${siteId}?v=${tick}`
    const img = new Image()
    img.onload = () => { setLogoSrc(url); setChecking(false) }
    img.onerror = () => { setLogoSrc(null); setChecking(false) }
    img.src = url
  }, [siteId, tick])

  if (uploading || checking) {
    return (
      <div className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl p-4 mb-3 text-center">
        <p className="text-xs text-gray-400 py-2">{uploading ? 'Yükleniyor...' : 'Kontrol ediliyor...'}</p>
      </div>
    )
  }

  if (logoSrc) {
    return (
      <div className="border border-gray-200 dark:border-dark-border rounded-xl p-4 mb-3 relative group bg-gray-900/5 dark:bg-white/5">
        <div className="flex items-center justify-center">
          <img src={logoSrc} alt="Site Logo" className="h-14 object-contain" />
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">Maç görselinin üst kısmına basılır</p>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onUpload}
            className="p-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm" title="Değiştir">
            <Upload size={14} />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg bg-error-500 text-white hover:bg-error-600 transition-colors shadow-sm" title="Sil">
            <XCircle size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div onClick={onUpload}
      className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl p-5 mb-3 text-center hover:border-primary-400 dark:hover:border-primary-600 transition-colors cursor-pointer">
      <Upload size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
      <p className="text-xs text-gray-400 dark:text-gray-500">Logo yükle</p>
      <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">PNG veya JPG - Tıkla veya sürükle</p>
    </div>
  )
}
