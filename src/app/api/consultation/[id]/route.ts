import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    // Validate id is a valid integer
    const numericId = parseInt(id, 10)
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: 'Invalid consultation ID' },
        { status: 400 }
      )
    }

    if (!status || !['pending', 'contacted', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // تحديث في قاعدة البيانات المحلية
    const result = await query(
      `UPDATE leads_backup 
       SET payload = jsonb_set(payload, '{status}', $1::jsonb)
       WHERE id = $2::integer
       RETURNING *`,
      [JSON.stringify(status), numericId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      consultation: result.rows[0],
    })

  } catch (error) {
    console.error('Failed to update consultation:', error)
    return NextResponse.json(
      { error: 'Failed to update consultation' },
      { status: 500 }
    )
  }
}