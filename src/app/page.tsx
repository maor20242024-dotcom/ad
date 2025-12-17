'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Phone, Mail, MapPin, CheckCircle, Building2, FileText, Shield, Users, ArrowRight, Star } from 'lucide-react'

export default function Home() {
  // Client-side only state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: '',
    email: '',
    message: '',
    contactMethod: 'whatsapp'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Capture UTM and tracking data
  const [trackingData, setTrackingData] = useState({
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmTerm: '',
    utmContent: '',
    landingPath: '',
    referer: '',
    userAgent: '',
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    const params = url.searchParams

    setTrackingData({
      utmSource: params.get('utm_source') ?? '',
      utmMedium: params.get('utm_medium') ?? '',
      utmCampaign: params.get('utm_campaign') ?? '',
      utmTerm: params.get('utm_term') ?? '',
      utmContent: params.get('utm_content') ?? '',
      landingPath: url.pathname + url.search,
      referer: document.referrer,
      userAgent: navigator.userAgent,
    })

    // تتبع تحميل الصفحة مع بيانات إضافية - فقط على صفحة الهبوط
    if ((window as any).spix && url.pathname === '/') {
      ; (window as any).spix("event", "pageload", {
        page: "landing_page",
        utm_source: params.get('utm_source') ?? '',
        utm_medium: params.get('utm_medium') ?? '',
        utm_campaign: params.get('utm_campaign') ?? '',
        timestamp: new Date().toISOString()
      })
    }
  }, [])

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const trackButtonClick = (buttonName: string) => {
    if (typeof window !== 'undefined' && (window as any).spix) {
      (window as any).spix('event', 'click', {
        button_name: buttonName
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hasSubmitted) return

    setIsSubmitting(true)
    setHasSubmitted(true)

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          marketingChannel: 'native_ad',
          pageSlug: 'imperium_native_v1',
          language: 'ar',
          ...trackingData,
        }),
      })

      if (res.ok) {
        toast.success('تم استلام طلبك بنجاح! سنتواصل معك خلال 24 ساعة.')
        setFormData({ fullName: '', phone: '', country: '', email: '', message: '', contactMethod: 'whatsapp' })

        // تتبع التحويلات المتقدم
        try {
          if (typeof window !== 'undefined') {
            // Native Ads tracking مع بيانات شاملة
            if ((window as any).spix) {
              ; (window as any).spix('event', 'lead', {
                event_category: 'form_submission',
                event_label: 'main_form',
                form_name: 'main_lead_form',
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                value: 1
              })

                ; (window as any).spix('event', 'conversion', {
                  conversion_type: 'lead_generation',
                  conversion_value: 1,
                  currency: 'AED',
                  page: 'landing_page'
                })
            }

            // Facebook Pixel tracking
            if ((window as any).fbq) {
              ; (window as any).fbq('track', 'Lead', {
                content_name: 'Real Estate Consultation',
                content_category: 'Lead Generation',
                value: 1,
                currency: 'AED'
              })
            }

            // Google Analytics tracking
            if ((window as any).gtag) {
              ; (window as any).gtag('event', 'lead', {
                event_category: 'form_submission',
                event_label: 'imperiumgate_native',
                value: 1,
                currency: 'AED'
              })
            }
          }
        } catch (trkErr) {
          console.error('Tracking error:', trkErr)
        }

        // Auto redirect to thank you page
        setTimeout(() => {
          // Fallback to window.location if router is not available (though we will add it)
          window.location.href = '/thank-you'
        }, 1500)
      }
    } catch (error) {
      toast.error('حدث خطأ ما. يرجى المحاولة مرة أخرى.')
      setHasSubmitted(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--deep-navy)' }} dir="rtl">
      <style jsx global>{`
        :root {
          --gold: #d4af37;
          --soft-gold: #f1d07e;
          --deep-navy: #040406;
        }
        body {
          font-family: 'Tajawal', sans-serif;
          background:
            radial-gradient(circle at top, rgba(241,208,126,0.08), transparent 55%),
            radial-gradient(circle at bottom, rgba(27,44,88,0.7), #040406);
          color: #f8f7f2;
        }
        .font-amiri {
          font-family: 'Amiri', serif;
        }
        .font-tajawal {
          font-family: 'Tajawal', sans-serif;
        }
        .glass-card {
          background: rgba(10,10,12,0.7);
          border: 1px solid rgba(212,175,55,0.25);
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        }
        .gold-border {
          border-color: rgba(212,175,55,0.35);
        }
        .hero-gradient {
          position: relative;
          overflow: hidden;
          border-radius: 32px;
          background:
            radial-gradient(circle at top, rgba(241,208,126,0.12), transparent 45%),
            linear-gradient(135deg, rgba(37,55,84,0.8), rgba(4,4,6,0.95));
        }
        .hero-gradient::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url('/media/ads/hero-imperium.jpg');
          background-size: cover;
          background-position: center;
          opacity: 0.22;
          mix-blend-mode: screen;
          pointer-events: none;
        }
        .hero-inner {
          position: relative;
          z-index: 1;
        }
        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.55);
          border-color: rgba(212,175,55,0.55);
        }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[rgba(4,4,6,0.96)] border-b border-[rgba(212,175,55,0.25)] backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/media/ads/logo.png"
                  alt="Imperium Gate Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-xs text-[#f1d07e] tracking-wider">IMPERIUM GATE</p>
                <p className="text-sm text-white">شريكك الموثوق في عقارات دبي</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-gray-300 hover:text-[var(--soft-gold)] transition">خدماتنا</a>
              <a href="#why-us" className="text-gray-300 hover:text-[var(--soft-gold)] transition">لماذا نحن</a>
              <a href="#contact" className="text-gray-300 hover:text-[var(--soft-gold)] transition">تواصل معنا</a>
              <Button
                className="bg-[var(--gold)] text-black hover:bg-[#caa449] px-6"
                onClick={() => trackButtonClick('header_consultation')}
              >
                استشارة مجانية
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section
          id="top"
          className="hero-gradient mx-4 mt-6 mb-10 sm:mt-8 sm:mb-12 px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-14"
        >
          <div className="hero-inner max-w-6xl mx-auto grid gap-10 lg:gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-start">
            {/* Form first on mobile */}
            <div className="order-2 lg:order-2">
              <div className="glass-card card-hover rounded-[28px] border border-[rgba(212,175,55,0.35)] p-5 sm:p-6 lg:p-7 backdrop-blur-md">
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">ابدأ استثمارك الآمن</h3>
                  <p className="text-gray-300 text-sm sm:text-base">املأ النموذج وسيتواصل معك مستشارنا خلال 24 ساعة</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="full-name" className="block text-sm text-gray-300 mb-2">الاسم الكامل *</Label>
                    <Input
                      id="full-name"
                      name="full-name"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--gold)] text-white placeholder:text-gray-400"
                      placeholder="اكتب اسمك الكامل"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="block text-sm text-gray-300 mb-2">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--gold)] text-white placeholder:text-gray-400"
                        placeholder="+971 50 123 4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="block text-sm text-gray-300 mb-2">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full rounded-xl bg-white/5 border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--gold)] text-white placeholder:text-gray-400"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country" className="block text-sm text-gray-300 mb-2">البلد *</Label>
                    <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                      <SelectTrigger className="w-full rounded-xl bg-white/5 border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--gold)] text-white">
                        <SelectValue placeholder="اختر بلدك" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border border-gray-700">
                        <SelectItem value="الإمارات">الإمارات العربية المتحدة</SelectItem>
                        <SelectItem value="السعودية">المملكة العربية السعودية</SelectItem>
                        <SelectItem value="قطر">قطر</SelectItem>
                        <SelectItem value="الكويت">الكويت</SelectItem>
                        <SelectItem value="البحرين">البحرين</SelectItem>
                        <SelectItem value="سلطنة عمان">سلطنة عمان</SelectItem>
                        <SelectItem value="الأردن">الأردن</SelectItem>
                        <SelectItem value="مصر">مصر</SelectItem>
                        <SelectItem value="فلسطين">فلسطين</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contactMethod" className="block text-sm text-gray-300 mb-2">طريقة التواصل المفضلة *</Label>
                    <Select
                      value={formData.contactMethod}
                      onValueChange={(value) => setFormData({ ...formData, contactMethod: value })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full rounded-xl bg-white/5 border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--gold)] text-white">
                        <SelectValue placeholder="اختر طريقة التواصل" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border border-gray-700">
                        <SelectItem value="whatsapp">واتساب (موصى به)</SelectItem>
                        <SelectItem value="facetime">فيس تايم</SelectItem>
                        <SelectItem value="phone">مكالمة هاتفية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="block text-sm text-gray-300 mb-2">ما هو هدفك الاستثماري؟ *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl bg-white/5 border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--gold)] text-white placeholder:text-gray-400 resize-none"
                      placeholder="أخبرنا عن ميزانيتك ونوع العقار الذي تبحث عنه..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[var(--gold)] text-black hover:bg-[#caa449] py-4 text-lg font-semibold rounded-xl"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'جاري تحميل بياناتك' : 'أرسل طلب الاستشارة المجانية'}
                  </Button>
                </form>

                <p className="text-xs text-gray-400 text-center mt-4">
                  بالضغط على زر الإرسال، أنت توافق على سياسة الخصوصية وشروط الاستخدام
                </p>
              </div>
            </div>

            {/* Content second on mobile */}
            <div className="order-1 lg:order-1 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-black/40 border border-[rgba(241,208,126,0.35)] px-4 py-2 text-xs sm:text-sm text-[var(--soft-gold)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                استثمار آمن في عقارات دبي · نفس سعر المطوّر، مع حليف يمثّلك
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h1 className="font-amiri text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
                  استثمر في دبي بنفس السعر...
                  <br />
                  <span className="text-[var(--gold)]">لكن مع حليف يحميك في كل خطوة</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-200 leading-relaxed max-w-xl">
                  Imperium Gate تمثّل المُشتري، لا المطوّر. نفس الأسعار الرسمية للمشاريع
                  الفاخرة في دبي، مع فريق عربي يشرح لك المخاطر والفرص، ويفاوض عنك
                  حتى توقيع العقد واستلام المفاتيح.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm sm:text-base text-white/90">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />
                  أكثر من 160 مشروع من 50+ مطوّر رائد
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />
                  استشارة أولى مجانية عبر مكالمة أونلاين
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--gold)] mb-2">160+</div>
              <p className="text-gray-300">مشروع عقاري</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--gold)] mb-2">50+</div>
              <p className="text-gray-300">مطوّر معتمد</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--gold)] mb-2">100%</div>
              <p className="text-gray-300">نفس سعر المطوّر</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--gold)] mb-2">24/7</div>
              <p className="text-gray-300">دعم عربي</p>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="mx-4 mb-10 sm:mb-14 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-amiri text-white mb-4">كيف نساعدك؟</h2>
              <p className="text-xl text-gray-300">خدماتنا مصممة لحماية استثمارك وتحقيق أهدافك</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card card-hover rounded-2xl border-[rgba(212,175,55,0.25)] p-8">
                <div className="w-16 h-16 rounded-full bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.3)] flex items-center justify-center mb-6">
                  <Building2 className="h-8 w-8 text-[var(--gold)]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">اختيار العقار المناسب</h3>
                <p className="text-gray-300 leading-relaxed">
                  نحلّل ميزانيتك وأهدافك ونرشّح لك أفضل المشاريع من بين 160+ مشروع فاخر في دبي. نستخدم الذكاء الاصطناعي والخبرة البشرية لضمان الاختيار الأمثل.
                </p>
              </div>

              <div className="glass-card card-hover rounded-2xl border-[rgba(212,175,55,0.25)] p-8">
                <div className="w-16 h-16 rounded-full bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.3)] flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-[var(--gold)]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">مراجعة العقد</h3>
                <p className="text-gray-300 leading-relaxed">
                  فريقنا القانوني يراجع كل بند في العقد، يوضح لك المخاطر المحتملة، ويضمن شروط عادلة تحمي حقوقك كمستثمر.
                </p>
              </div>

              <div className="glass-card card-hover rounded-2xl border-[rgba(212,175,55,0.25)] p-8">
                <div className="w-16 h-16 rounded-full bg-[rgba(212,175,55,0.15)] border-[rgba(212,175,55,0.3)] flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-[var(--gold)]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">حماية الاستثمار</h3>
                <p className="text-gray-300 leading-relaxed">
                  نكون معك من أول مكالمة حتى استلام المفاتيح. نتابع كل التفاصيل، نتفاوض نيابة عنك، ونضمن حقوقك في كل مرحلة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY US SECTION */}
        <section id="why-us" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-amiri text-white mb-4">لماذا Imperium Gate؟</h2>
              <p className="text-xl text-gray-300">نحن الوحيدون الذين نضع مصلحتك أولاً</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-[var(--gold)] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">نفس سعر المطوّر تماماً</h3>
                    <p className="text-gray-300">بتدفع نفس السعر الذي تدفعه مباشرة للمطوّر، بدون أي عمولة إضافية أو رسوم خفية.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-[var(--gold)] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">خبراء حقيقيون في سوق دبي</h3>
                    <p className="text-gray-300">فريقنا يعرف سوق دبي العقاري عن قرب، ويمكنك من تجنب الأخطاء المكلفة التي يقع فيها الكثير من المستثمرين.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-[var(--gold)] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">مستشار عربي متخصص</h3>
                    <p className="text-gray-300">تتعامل مع مستشار يتكلم لغتك ويفهم ثقافتك، مما يسهل عملية التواصل ويضمن فهمك الكامل لكل التفاصيل.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-[var(--gold)] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">متابعة شاملة حتى النهاية</h3>
                    <p className="text-gray-300">من اختيار العقار إلى توقيع العقد إلى استلام المفاتيح، نكون معك في كل خطوة لضمان تجربة استثمارية ناجحة.</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img
                  src="/media/ads/hero-imperium.jpg"
                  alt="Dubai luxury real estate"
                  className="rounded-2xl w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-amiri text-white mb-4">تواصل معنا</h2>
              <p className="text-xl text-gray-300">نحن هنا للإجابة على جميع استفساراتك</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card card-hover rounded-2xl border-[rgba(212,175,55,0.25)] p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(212,175,55,0.15)] border-[rgba(212,175,55,0.3)] flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-[var(--gold)]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">الهاتف</h3>
                <p className="text-gray-300 mb-2">971567022702</p>
                <p className="text-gray-400">متواصل 24/7</p>
              </div>

              <div className="glass-card card-hover rounded-2xl border-[rgba(212,175,55,0.25)] p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(212,175,55,0.15)] border-[rgba(212,175,55,0.3)] flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-[var(--gold)]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">البريد الإلكتروني</h3>
                <p className="text-gray-300 mb-2">info@imperiumgate.com</p>
                <p className="text-gray-400">رد خلال 24 ساعة</p>
              </div>

              <div className="glass-card card-hover rounded-2xl border-[rgba(212,175,55,0.25)] p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(212,175,55,0.15)] border-[rgba(212,175,55,0.3)] flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-8 w-8 text-[var(--gold)]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">المكتب الرئيسي</h3>
                <p className="text-gray-300 mb-2">دبي، الإمارات</p>
                <p className="text-gray-400">العنوان التفصيلي هنا</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-3xl border-[rgba(212,175,55,0.35)] p-12 text-center">
              <h2 className="text-3xl lg:text-4xl font-amiri text-white mb-6">
                مستعد تبدأ رحلتك الاستثمارية في دبي؟
              </h2>
              <p className="text-xl text-gray-200 mb-8">
                احجز استشارة مجانية الآن، ودع فريق Imperium Gate يساعدك على اختيار
                العقار الأنسب لهدفك وميزانيتك.
              </p>
              <Button
                onClick={() => {
                  trackButtonClick('cta_consultation')
                  if (typeof window === 'undefined') return
                  const formEl = document.querySelector<HTMLFormElement>(
                    'form'
                  )
                  formEl?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-2.5 text-sm font-semibold text-black shadow-[0_14px_40px_rgba(0,0,0,0.6)] hover:bg-[#caa449]"
              >
                احجز استشارة مجانية
                <ArrowRight className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(212,175,55,0.2)] py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[rgba(212,175,55,0.15)] border-[rgba(212,175,55,0.5)] flex items-center justify-center">
                  <span className="text-sm font-bold text-[#d4af37]">IG</span>
                </div>
                <div>
                  <p className="text-xs text-[#f1d07e] tracking-wider">IMPERIUM GATE</p>
                  <p className="text-sm text-white">شريكك الموثوق في عقارات دبي</p>
                </div>
              </div>
              <p className="text-gray-400">
                نحن نمثّل المشتري، لا المطوّر. نفس الأسعار الرسمية مع حماية كاملة لاستثمارك.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">خدماتنا</h4>
              <ul className="space-y-2 text-gray-400">
                <li>اختيار العقار المناسب</li>
                <li>مراجعة العقود</li>
                <li>استشارات استثمارية</li>
                <li>متابعة المشروع</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-[var(--soft-gold)] transition">خدماتنا</a></li>
                <li><a href="#why-us" className="hover:text-[var(--soft-gold)] transition">لماذا نحن</a></li>
                <li><a href="#contact" className="hover:text-[var(--soft-gold)] transition">تواصل معنا</a></li>
                <li><a href="#" className="hover:text-[var(--soft-gold)] transition">المدونة</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">تابعنا</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-[var(--soft-gold)] transition">فيسبوك</a>
                <a href="#" className="text-gray-400 hover:text-[var(--soft-gold)] transition">لينكدإن</a>
                <a href="#" className="text-gray-400 hover:text-[var(--soft-gold)] transition">واتساب</a>
              </div>
            </div>
          </div>

          <div className="border-t border-[rgba(212,175,55,0.2)] mt-8 pt-8 text-center text-gray-500">
            Imperium Gate © {new Date().getFullYear()} – جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  )
}