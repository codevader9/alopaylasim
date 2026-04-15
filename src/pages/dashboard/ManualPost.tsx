import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'
import { Upload, Send, Image, X } from 'lucide-react'

export default function ManualPost() {
  const [sites, setSites] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedSite, setSelectedSite] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [dragImage, setDragImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  useEffect(() => {
    api.get('/api/sites').then(setSites).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedSite) {
      api.get(`/api/social-accounts?site_id=${selectedSite}`).then(setAccounts).catch(() => {})
    }
  }, [selectedSite])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => setDragImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }, [])

  const handlePublish = async () => {
    if (!selectedAccount || !caption) return
    setLoading(true)
    setResult(null)
    try {
      const account = accounts.find((a: any) => a.id === selectedAccount)
      await api.post('/api/posts/publish-now', {
        platform: account?.platform,
        social_account_id: selectedAccount,
        site_id: selectedSite,
        caption,
        image_url: imageUrl || undefined,
      })
      setResult({ success: true })
      setCaption('')
      setImageUrl('')
      setDragImage(null)
    } catch (err: any) {
      setResult({ error: err.message })
    }
    setLoading(false)
  }

  return (
    <div>
      <Header title="Manuel Paylaşım" description="Hemen paylaşım yap" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Paylaşım Detayları" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Site</label>
                <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none transition-all">
                  <option value="">Site seçin</option>
                  {sites.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hesap</label>
                <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none transition-all">
                  <option value="">Hesap seçin</option>
                  {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.platform} - {a.account_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Caption / Metin</label>
                <textarea rows={4} value={caption} onChange={(e) => setCaption(e.target.value)}
                  placeholder="Paylaşım metnini yazın..."
                  className="w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary-300 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none transition-all resize-none" />
              </div>

              <Input label="Görsel URL (opsiyonel)" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} icon={<Image size={18} />} />

              {result?.success && <div className="p-3 rounded-lg bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500 text-sm">Paylaşım başarılı!</div>}
              {result?.error && <div className="p-3 rounded-lg bg-error-50 dark:bg-error-500/15 text-error-700 dark:text-error-500 text-sm">{result.error}</div>}

              <Button loading={loading} onClick={handlePublish} disabled={!selectedAccount || !caption} icon={<Send size={18} />} className="w-full">
                Şimdi Paylaş
              </Button>
            </div>
          </Card>

          {/* Drag & Drop Area */}
          <Card>
            <CardHeader title="Görsel Yükle" description="Sürükle bırak veya tıkla" />
            <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl p-8 text-center hover:border-primary-400 dark:hover:border-primary-600 transition-colors cursor-pointer min-h-[300px] flex flex-col items-center justify-center">
              {dragImage ? (
                <div className="relative">
                  <img src={dragImage} alt="Yüklenen" className="max-h-64 rounded-lg" />
                  <button onClick={() => setDragImage(null)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-error-500 text-white hover:bg-error-700 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Görseli buraya sürükleyin</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, WEBP</p>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
