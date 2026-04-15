import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password, fullName)

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
            <h1 className="text-4xl font-bold leading-tight mb-4">Hemen başlayın</h1>
            <p className="text-primary-200 text-lg">
              Ücretsiz hesap oluşturun ve güçlü yönetim araçlarına hemen erişin.
            </p>
          </div>

          <div className="space-y-3">
            {['Sınırsız proje yönetimi', 'Gerçek zamanlı istatistikler', 'Ekip işbirliği araçları'].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-primary-100 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute top-20 -right-10 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* Right - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">Paylaşım</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kayıt Ol</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Yeni bir hesap oluşturun</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-50 dark:bg-error-500/15 text-error-700 dark:text-error-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Ad Soyad"
              type="text"
              placeholder="Adınız Soyadınız"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User size={18} />}
              required
            />
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
            <Input
              label="Şifre Tekrar"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Hesap Oluştur
              <ArrowRight size={18} />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Zaten hesabınız var mı?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold"
            >
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
