import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { CheckCircle, XCircle, Filter, BarChart3 } from 'lucide-react'

export default function PostHistory() {
  const [history, setHistory] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (platformFilter) params.set('platform', platformFilter)
    const [h, s] = await Promise.all([api.get(`/api/posts/history?${params}`), api.get('/api/stats/overview')])
    setHistory(h); setStats(s); setLoading(false)
  }
  useEffect(() => { load() }, [statusFilter, platformFilter])

  return (
    <div>
      <Header title="Post Geçmişi" description="Tüm paylaşım kayıtları" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"><BarChart3 size={20} /></div>
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Toplam</p><p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalPosts}</p></div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-success-50 dark:bg-success-500/15 text-success-500"><CheckCircle size={20} /></div>
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Başarılı</p><p className="text-xl font-bold text-gray-900 dark:text-white">{stats.successPosts}</p></div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-error-50 dark:bg-error-500/15 text-error-500"><XCircle size={20} /></div>
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Başarısız</p><p className="text-xl font-bold text-gray-900 dark:text-white">{stats.failedPosts}</p></div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-warning-50 dark:bg-warning-500/15 text-warning-500"><Filter size={20} /></div>
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Başarı Oranı</p><p className="text-xl font-bold text-gray-900 dark:text-white">%{stats.successRate}</p></div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button variant={statusFilter === '' ? 'primary' : 'secondary'} size="sm" onClick={() => setStatusFilter('')}>Tümü</Button>
          <Button variant={statusFilter === 'success' ? 'primary' : 'secondary'} size="sm" onClick={() => setStatusFilter('success')}>Başarılı</Button>
          <Button variant={statusFilter === 'failed' ? 'primary' : 'secondary'} size="sm" onClick={() => setStatusFilter('failed')}>Başarısız</Button>
          <span className="border-l border-gray-200 dark:border-dark-border mx-2" />
          <Button variant={platformFilter === '' ? 'primary' : 'secondary'} size="sm" onClick={() => setPlatformFilter('')}>Tümü</Button>
          <Button variant={platformFilter === 'twitter' ? 'primary' : 'secondary'} size="sm" onClick={() => setPlatformFilter('twitter')}>Twitter</Button>
          <Button variant={platformFilter === 'telegram' ? 'primary' : 'secondary'} size="sm" onClick={() => setPlatformFilter('telegram')}>Telegram</Button>
          <Button variant={platformFilter === 'instagram' ? 'primary' : 'secondary'} size="sm" onClick={() => setPlatformFilter('instagram')}>Instagram</Button>
        </div>

        {/* History Table */}
        <Card padding={false}>
          {loading ? <div className="p-8 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div> :
            history.length === 0 ? <div className="p-8 text-center text-gray-500 dark:text-gray-400">Kayıt bulunamadı.</div> :
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Durum</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Platform</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Hesap</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Maç</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tarih</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Hata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {history.map((h: any) => (
                    <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                      <td className="px-6 py-3">
                        <Badge variant={h.status === 'success' ? 'success' : 'error'}>{h.status === 'success' ? 'Başarılı' : 'Başarısız'}</Badge>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={h.platform === 'twitter' ? 'primary' : h.platform === 'telegram' ? 'success' : 'warning'}>{h.platform}</Badge>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{h.account_name || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {h.matches ? `${h.matches.home_team} vs ${h.matches.away_team}` : h.caption?.slice(0, 40) || '-'}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(h.posted_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-3 text-xs text-error-500 max-w-48 truncate" title={h.error_message}>{h.error_message || '-'}</td>
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
