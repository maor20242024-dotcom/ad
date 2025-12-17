import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'contacted', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const consultation = await db.consultation.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
    })

    return NextResponse.json({
      success: true,
      consultation,
    })

  } catch (error) {
    console.error('Failed to update consultation:', error)
    return NextResponse.json(
      { error: 'Failed to update consultation' },
      { status: 500 }
    )
  }
}