import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-dark-bg">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="font-bold text-lg">P</span>
              </div>
              <span className="font-bold text-2xl">Paylaşım</span>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Projelerinizi yönetmenin en kolay yolu
            </h1>
            <p className="text-primary-200 text-lg">
              Güçlü yönetim paneli ile ekibinizi ve projelerinizi tek
              bir yerden kontrol edin.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full bg-white/20 border-2 border-primary-600"
                />
              ))}
            </div>
            <p className="text-primary-200 text-sm">500+ aktif kullanıcı</p>
          </div>
        </div>

        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute top-20 -right-10 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">Paylaşım</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Giriş Yap</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Hesabınıza giriş yaparak devam edin
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-50 dark:bg-error-500/15 text-error-700 dark:text-error-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="E-posta"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Şifre"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 dark:border-dark-border text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-600 dark:text-gray-400">Beni hatırla</span>
              </label>
              <a
                href="#"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Şifremi unuttum
              </a>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Giriş Yap
              <ArrowRight size={18} />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Hesabınız yok mu?{' '}
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold"
            >
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
