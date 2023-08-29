import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const res = await query();
    const data = await JSON.parse(JSON.stringify(res));

    return NextResponse.json({ data })
}