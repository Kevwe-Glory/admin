'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import {
  BookingTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/bookingTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PaginationControl } from '@/components/ui/pagination-control'
import { Spinner } from '@/components/ui/spinner'

import { fetchFlights } from '@/lib/api'
import { Booking, BookingStatus, BookingType, SUPPORTED_CURRENCIES } from '@/types/booking'
import { fetchExchangeRates } from '@/lib/exchange-rate'
import { Currency } from '@/types'

const UI_PAGE_SIZE = 20

function StatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    Confirmed: 'bg-green-600',
    Pending: 'bg-yellow-500',
    Cancelled: 'bg-gray-500',
    Failed: 'bg-red-600',
    Initialized: 'bg-yellow-600',
  }

  return <Badge className={styles[status]}>{status}</Badge>
}
const normalizeStatus = <T extends string>(value: string): T =>
  (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()) as T


export default function BookingPage() {
  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [totalBookings, setTotalBookings] = useState(0)
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<BookingType | 'all'>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [rates, setRates] = useState<Record<string, number>>({})
  const [currency, setCurrency] = useState<Currency>('NGN')


  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase())
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(t)
  }, [search])


  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        const res = await fetchFlights({
          page: currentPage,           
          limit: UI_PAGE_SIZE,        
          status: statusFilter !== 'all' ? statusFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          date: dateFilter || undefined,
          search: debouncedSearch || undefined,
        })

        setAllBookings(Array.isArray(res.data) ? res.data : [])
        setTotalBookings(res.total ?? 0)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [currentPage, statusFilter, typeFilter, dateFilter, debouncedSearch])

  useEffect(() => {
    const loadRates = async () => {
      try {
        const data = await fetchExchangeRates("NGN")
        setRates(data)
      } catch (err) {
        console.error("Exchange rate error", err)
      }
    }

    loadRates()
  }, [])


  const filteredBookings = useMemo(() => {
    if (!debouncedSearch) return allBookings

    return allBookings.filter((b) =>
      b.id.toLowerCase().includes(debouncedSearch) ||
      b.user.toLowerCase().includes(debouncedSearch)
    )
  }, [allBookings, debouncedSearch])

  const effectiveTotal = debouncedSearch
    ? filteredBookings.length
    : totalBookings

  const totalPages = Math.max(1, Math.ceil(effectiveTotal / UI_PAGE_SIZE))

  const paginatedBookings = filteredBookings

const convertAmount = (totalAmount: number) => {
  if (currency === "NGN") return totalAmount
  return rates[currency]
    ? totalAmount * rates[currency]
    : totalAmount
}

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Booking Table</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by booking ID or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white max-w-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value === 'all'
                ? 'all'
                : normalizeStatus<BookingStatus>(e.target.value)
            )
          }
          className="border rounded px-2 py-1"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="failed">Failed</option>
          <option value="initialized">Initialized</option>
        </select>

        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="border rounded px-2 py-1 bg-white"
        >
          {SUPPORTED_CURRENCIES.map((cur) => (
            <option key={cur} value={cur}>
              {cur}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={() => {
            setSearch('')
            setDebouncedSearch('')
            setStatusFilter('all')
            setTypeFilter('all')
            setDateFilter('')
            setCurrentPage(1)
          }}
        >
          Reset
        </Button>
      </div>

      {/* Table */}
      <BookingTable>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Airline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedBookings.length ? (
            paginatedBookings.map((b) => (
              <TableRow
                key={b.id}
                onClick={() => router.push(`/admin/bookings/${b.id}`)}
                className="cursor-pointer"
              >
                <TableCell>{b.id}</TableCell>
                <TableCell>{b.user}</TableCell>
                <TableCell>{b.flightIdentifier}</TableCell>
                <TableCell>
                  <StatusBadge status={b.status} />
                </TableCell>
                <TableCell className="text-right">
                  {convertAmount(b.totalAmount).toLocaleString(
                    undefined, {
                    style: "currency",
                    currency,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {new Date(b.created).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                No bookings found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </BookingTable>

      {/* Pagination */}
      {effectiveTotal > UI_PAGE_SIZE && (
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

