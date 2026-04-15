import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import { BookOpen, MessageCircle, Mail, ExternalLink } from 'lucide-react'

const helpItems = [
  {
    title: 'Dökümanlar',
    description: 'Detaylı kullanım kılavuzu ve API dökümanları',
    icon: <BookOpen size={24} />,
    link: '#',
  },
  {
    title: 'Canlı Destek',
    description: 'Destek ekibimizle gerçek zamanlı sohbet edin',
    icon: <MessageCircle size={24} />,
    link: '#',
  },
  {
    title: 'E-posta Desteği',
    description: 'destek@paylasim.com adresine yazın',
    icon: <Mail size={24} />,
    link: 'mailto:destek@paylasim.com',
  },
]

const faqItems = [
  { q: 'Nasıl yeni kullanıcı ekleyebilirim?', a: 'Admin panelinden Kullanıcılar sayfasına giderek yeni kullanıcı ekleyebilirsiniz.' },
  { q: 'Şifremi nasıl değiştirebilirim?', a: 'Ayarlar > Güvenlik bölümünden şifrenizi güncelleyebilirsiniz.' },
  { q: 'Döküman yükleme limiti nedir?', a: 'Her bir dosya için maksimum 50MB yükleme limiti bulunmaktadır.' },
  { q: 'Verilerim güvende mi?', a: 'Tüm verileriniz end-to-end şifreleme ile korunmakta ve düzenli olarak yedeklenmektedir.' },
]

export default function Help() {
  return (
    <div>
      <Header title="Yardım" description="Destek ve sık sorulan sorular" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {helpItems.map((item) => (
            <a key={item.title} href={item.link} className="group">
              <Card className="h-full hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all">
                <div className="flex flex-col items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Sık Sorulan Sorular</h3>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <details key={item.q} className="group border border-gray-200 dark:border-dark-border rounded-lg">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-dark-hover rounded-lg transition-colors">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400">{item.a}</p>
              </details>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
