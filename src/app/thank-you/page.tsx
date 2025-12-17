'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function ThankYouPage() {
  const [submissionCount, setSubmissionCount] = useState(0)

  useEffect(() => {
    // تتبع عرض صفحة الشكر فقط - بدون تتبع تحميل الصفحة
    if (typeof window !== 'undefined' && (window as any).spix) {
      (window as any).spix("init", "ID-20401");
      (window as any).spix("event", "pageload");

      ; (window as any).spix('event', 'thank_you_page_view', {
        page_type: 'conversion_page',
        timestamp: new Date().toISOString()
      })
    }

    // جلب عدد التسجيلات من API
    const fetchSubmissionCount = async () => {
      try {
        const response = await fetch('/api/submissions')
        const data = await response.json()

        if (data.count !== undefined) {
          setSubmissionCount(data.count)
        } else {
          setSubmissionCount(0)
        }
      } catch (error) {
        console.error('Error fetching submission count:', error)
        setSubmissionCount(0)
      }
    }

    fetchSubmissionCount()

    // إعادة توجيه بعد 10 ثواني
    const timer = setTimeout(() => {
      window.location.href = 'https://www.imperiumgate.com/ar'
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050509] via-[#0a0a0f] to-[#000000] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-black/40 backdrop-blur-md border border-[#d4af37]/30 rounded-3xl p-8 text-center">
          <CardContent className="space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-[#d4af37]" />
              </div>
            </div>

            {/* Thank You Message */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-white mb-2">
                شكراً لتسجيلك!
              </h1>
              <p className="text-gray-200 leading-relaxed">
                تم استلام طلبك بنجاح. سيتواصل معك مستشار من فريق Imperium Gate
                خلال 24 ساعة.
              </p>
            </div>

            {/* Submission Count */}
            <div className="bg-black/30 rounded-2xl p-4 border border-white/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#d4af37] mb-2">
                  {submissionCount}
                </div>
                <div className="text-sm text-gray-300">
                  شخص سجل اليوم
                </div>
              </div>
            </div>

            {/* Auto Redirect Notice */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                سيتم توجيهك تلقائياً خلال 10 ثواني
              </p>
              <div className="text-xs text-gray-500">
                Imperium Gate - شريكك الموثوق في عقارات دبي
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
