'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, Calendar, CheckCircle, Clock, Users, Copy, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface Consultation {
  id: string
  name: string
  phone: string
  email?: string
  message?: string
  status: 'pending' | 'contacted' | 'completed'
  createdAt: string
}

export default function AdminDashboard() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      const response = await fetch('/api/consultation')
      const data = await response.json()
      if (data.success) {
        setConsultations(data.consultations)
      }
    } catch (error) {
      console.error('Failed to fetch consultations:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/consultation/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setConsultations(prev =>
          prev.map(consultation =>
            consultation.id === id
              ? { ...consultation, status: status as 'pending' | 'contacted' | 'completed' }
              : consultation
          )
        )
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'contacted':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار'
      case 'contacted':
        return 'تم التواصل'
      case 'completed':
        return 'مكتمل'
      default:
        return status
    }
  }

  const stats = {
    total: consultations.length,
    pending: consultations.filter(c => c.status === 'pending').length,
    contacted: consultations.filter(c => c.status === 'contacted').length,
    completed: consultations.filter(c => c.status === 'completed').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم Imperium Gate</h1>
            <Button onClick={fetchConsultations}>
              تحديث
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Marketing Content Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>محتوى التسويق</CardTitle>
            <CardDescription>
              روابط سريعة لنسخ محتوى التسويق الجاهز
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.open('/', '_blank')}
              >
                <Eye className="w-4 h-4" />
                عرض دليل التسويق
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الاستشارات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">تم التواصل</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
                </div>
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">مكتمل</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consultations List */}
        <Card>
          <CardHeader>
            <CardTitle>طلبات الاستشارة</CardTitle>
            <CardDescription>
              قائمة بجميع طلبات الاستشارة الواردة من الموقع
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consultations.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد طلبات استشارة حالياً</p>
              ) : (
                consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg">{consultation.name}</h3>
                          <Badge className={getStatusColor(consultation.status)}>
                            {getStatusText(consultation.status)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{consultation.phone}</span>
                          </div>
                          {consultation.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{consultation.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(consultation.createdAt).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                        
                        {consultation.message && (
                          <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                            <p className="text-gray-700">{consultation.message}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {consultation.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(consultation.id, 'contacted')}
                          >
                            بدء التواصل
                          </Button>
                        )}
                        {consultation.status === 'contacted' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(consultation.id, 'completed')}
                          >
                            إكمال
                          </Button>
                        )}
                        {consultation.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(consultation.id, 'pending')}
                          >
                            إعادة فتح
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}