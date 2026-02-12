import { NextResponse } from "next/server"

const BASE_URL = "https://api.exchangerate-api.com/v4/latest"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const base = searchParams.get("base") || "USD"

  try {
    const res = await fetch(
      `${BASE_URL}/${base}?apikey=${process.env.EXCHANGE_RATE_API_KEY}`,
      {
        // Cache for 1 hour
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { status: false, message: "Failed to fetch exchange rate" },
        { status: 500 }
      )
    }

    const data = await res.json()

    return NextResponse.json({
      status: true,
      base: data.base,
      rates: data.rates,
    })
  } catch (error) {
    return NextResponse.json(
      { status: false, message: "Server error" },
      { status: 500 }
    )
  }
}
