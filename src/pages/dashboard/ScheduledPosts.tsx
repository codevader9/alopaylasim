import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { Calendar, Trash2, Clock } from 'lucide-react'

interface ScheduledPost {
  id: string
  platform: string
  caption: string
  scheduled_at: string
  status: string
  error_message: string | null
  matches?: { home_team: string; away_team: string; league_name: string; sport: string } | null
  sites?: { name: string } | null
}

const platformLabels: Record<string, { label: string; color: string }> = {
  twitter: { label: 'X / Twitter', color: 'primary' },
  telegram: { label: 'Telegram', color: 'success' },
  instagram: { label: 'Instagram', color: 'warning' },
}

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'gray' | 'primary' }> = {
  pending: { label: 'Bekliyor', variant: 'warning' },
  processing: { label: 'İşleniyor', variant: 'primary' },
  sent: { label: 'Gönderildi', variant: 'success' },
  failed: { label: 'Başarısız', variant: 'error' },
  cancelled: { label: 'İptal', variant: 'gray' },
}

export default function ScheduledPosts() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)

  const loadPosts = async () => {
    setLoading(true)
    try {
      const data = await api.get('/api/posts/scheduled')
      setPosts(data)
    } catch { setPosts([]) }
    setLoading(false)
  }

  useEffect(() => { loadPosts() }, [])

  const handleCancel = async (id: string) => {
    await api.put(`/api/posts/scheduled/${id}`, { status: 'cancelled' })
    loadPosts()
  }

  const handleDelete = async (id: string) => {
    await api.delete(`/api/posts/scheduled/${id}`)
    loadPosts()
  }

  return (
    <div>
      <Header title="Zamanlanmış Paylaşımlar" description="Bekleyen ve geçmiş paylaşımlar" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['pending', 'processing', 'sent', 'failed'].map(status => {
            const count = posts.filter(p => p.status === status).length
            const s = statusLabels[status]
            return (
              <Card key={status}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                  </div>
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>
              </Card>
            )
          })}
        </div>

        <Card padding={false}>
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Zamanlanmış paylaşım yok.</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
              {posts.map(post => (
                <div key={post.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                  <Badge variant={statusLabels[post.status]?.variant || 'gray'}>
                    {statusLabels[post.status]?.label}
                  </Badge>
                  <Badge variant={(platformLabels[post.platform]?.color || 'gray') as any}>
                    {platformLabels[post.platform]?.label || post.platform}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    {post.matches ? (
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {post.matches.home_team} vs {post.matches.away_team}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{post.caption || 'Manuel paylaşım'}</p>
                    )}
                    {post.sites && <p className="text-xs text-gray-400">{post.sites.name}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={14} />
                    {new Date(post.scheduled_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {post.status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => handleCancel(post.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-warning-500 transition-colors" title="İptal">
                        <Calendar size={16} />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-error-500 transition-colors" title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  {post.error_message && (
                    <span className="text-xs text-error-500 max-w-32 truncate" title={post.error_message}>{post.error_message}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
