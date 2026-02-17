import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_API_BASE_URL } from '@/lib/constants';

export async function GET(
  _req: Request,
  context: { params: Promise<{ bookingId: string }> },
) {
  console.log('🛬 API HIT /api/bookings/[bookingId]');

  try {
    const { bookingId } = await context.params;
    console.log('📌 bookingId:', bookingId);
    if (!bookingId) {
      return NextResponse.json(
        { message: 'Invalid booking id format' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('treepz_admin_token')?.value;

    console.log('🔐 Token exists:', Boolean(token));

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('🌍 Proxying request to backend');

    const res = await fetch(
      `${ADMIN_API_BASE_URL}bookings/${bookingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );

    const data = await res.json();
    console.log('📬 Backend status:', res.status);
    console.log('📦 Backend payload:', data);

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message ?? 'Failed to fetch booking' },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('💥 API crashed:', err);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
