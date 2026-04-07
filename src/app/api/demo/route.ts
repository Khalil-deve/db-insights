import { NextRequest, NextResponse } from 'next/server';

// ===== Demo Mode API =====
// Demo mode is currently disabled pending MongoDB migration.

export async function GET() {
    return NextResponse.json({ success: false, error: 'Demo mode is currently disabled' }, { status: 501 });
}

export async function POST(req: NextRequest) {
    return NextResponse.json({ success: false, error: 'Demo mode is currently disabled' }, { status: 501 });
}

export async function PUT() {
    return NextResponse.json({ success: false, error: 'Demo mode is currently disabled' }, { status: 501 });
}

