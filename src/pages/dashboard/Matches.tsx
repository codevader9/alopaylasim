import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { RefreshCw, Search, Filter, Trophy, Dribbble, CircleDot, Volleyball } from 'lucide-react'

interface Match {
  id: string
  sport: string
  league_name: string
  home_team: string
  away_team: string
  home_logo: string | null
  away_logo: string | null
  match_date: string
  status: string
  home_score: number | null
  away_score: number | null
}

const sportIcons: Record<string, React.ReactNode> = {
  football: <Trophy size={16} />,
  basketball: <Dribbble size={16} />,
  volleyball: <Volleyball size={16} />,
  tennis: <CircleDot size={16} />,
}

const sportLabels: Record<string, string> = {
  football: 'Futbol',
  basketball: 'Basketbol',
  volleyball: 'Voleybol',
  tennis: 'Tenis',
}

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'gray' | 'primary' }> = {
  upcoming: { label: 'Yaklaşan', variant: 'primary' },
  live: { label: 'Canlı', variant: 'error' },
  finished: { label: 'Bitti', variant: 'gray' },
  postponed: { label: 'Ertelendi', variant: 'warning' },
  cancelled: { label: 'İptal', variant: 'error' },
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [sportFilter, setSportFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const loadMatches = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (sportFilter) params.set('sport', sportFilter)
      const data = await api.get(`/api/matches?${params}`)
      setMatches(data)
    } catch { setMatches([]) }
    setLoading(false)
  }

  useEffect(() => { loadMatches() }, [sportFilter])

  const handleFetch = async (sport: string) => {
    setFetching(true)
    try {
      await api.post('/api/matches/fetch', { sport })
      await loadMatches()
    } catch (err) { console.error(err) }
    setFetching(false)
  }

  const filtered = matches.filter(m =>
    m.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.away_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.league_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <Header title="Maçlar" description="Spor maçlarını çek ve yönet" />
      <div className="p-6 space-y-6">
        {/* Fetch buttons */}
        <Card>
          <div className="flex flex-wrap gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center mr-2">Maç Çek:</span>
            {Object.entries(sportLabels).map(([key, label]) => (
              <Button key={key} variant="secondary" size="sm" loading={fetching} onClick={() => handleFetch(key)}
                icon={sportIcons[key]}>
                {label}
              </Button>
            ))}
            <Button variant="primary" size="sm" loading={fetching} onClick={() => {
              for (const s of Object.keys(sportLabels)) handleFetch(s)
            }} icon={<RefreshCw size={16} />}>
              Tümü
            </Button>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 sm:max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Takım veya lig ara..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-input text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all" />
          </div>
          <div className="flex gap-2">
            <Button variant={sportFilter === '' ? 'primary' : 'secondary'} size="sm" onClick={() => setSportFilter('')}
              icon={<Filter size={16} />}>Tümü</Button>
            {Object.entries(sportLabels).map(([key, label]) => (
              <Button key={key} variant={sportFilter === key ? 'primary' : 'secondary'} size="sm"
                onClick={() => setSportFilter(key)}>
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Match list */}
        <Card padding={false}>
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Maç bulunamadı. Yukarıdan maç çekebilirsiniz.</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
              {filtered.map((match) => (
                <div key={match.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                  <div className="flex items-center gap-2 w-24">
                    <Badge variant={statusLabels[match.status]?.variant || 'gray'}>
                      {statusLabels[match.status]?.label || match.status}
                    </Badge>
                  </div>
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    {match.home_logo && <img src={match.home_logo} alt="" className="h-8 w-8 object-contain" />}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{match.home_team}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">vs</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{match.away_team}</span>
                    {match.away_logo && <img src={match.away_logo} alt="" className="h-8 w-8 object-contain" />}
                  </div>
                  <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400 w-40 truncate">{match.league_name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 w-36 text-right">
                    {new Date(match.match_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {match.home_score !== null && (
                    <div className="text-sm font-bold text-gray-900 dark:text-white w-16 text-center">
                      {match.home_score} - {match.away_score}
                    </div>
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
