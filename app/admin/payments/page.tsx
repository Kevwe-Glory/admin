'use client'

import {
  PaymentTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/paymentTable"
import { Badge } from "@/components/ui/badge"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Currency, Payment, PaymentStatus, PaymentType, SUPPORTED_CURRENCIES } from "@/types"
import { fetchAllPayment } from "@/lib/api"
import { Spinner } from "@/components/ui/spinner"
import { PaginationControl } from "@/components/ui/pagination-control"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchExchangeRates } from "@/lib/exchange-rate"

const PAGE_SIZE = 20

function StatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    Success: "bg-green-600",
    Paid: "bg-green-600",
    Pending: "bg-yellow-500",
    Cancelled: "bg-gray-500",
    Failed: "bg-red-600",
  }

  return <Badge className={styles[status]}>{status}</Badge>
}

const normalizeStatus = <T extends string>(value: string): T =>
  (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()) as T

const PaymentPage = () => {
  const [paymentType, setPaymentsType] = useState<PaymentType>('flight')
  const [payments, setPayments] = useState<Payment[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPayments, setTotalPayments] = useState(0)
  const [currency, setCurrency] = useState<Currency>('NGN')
  const [rates, setRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase())
      setCurrentPage(1)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (paymentType === 'hotel') {
      setPayments([])
      setTotalPayments(0)
      setLoading(false)
      return
    }

    const loadPayments = async () => {
      try {
        setLoading(true)

        const res = await fetchAllPayment({
          page: currentPage,
          limit: PAGE_SIZE,
          type: paymentType,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: debouncedSearch || undefined,
        })

        setPayments(res.data ?? [])
        setTotalPayments(res.total ?? 0)
      } catch (err) {
        console.error("Payment fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [
    currentPage,
    paymentType,
    statusFilter,
    debouncedSearch,
  ])

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

    const filteredPayments = useMemo(() => {
      if (!debouncedSearch) return payments
  
      return payments.filter((payments) =>
        payments.paymentId.toLowerCase().includes(debouncedSearch) ||
        payments.user.toLowerCase().includes(debouncedSearch)
      )
    }, [payments, debouncedSearch])

      const effectiveTotal = debouncedSearch
    ? filteredPayments.length
    : totalPayments

      const totalPages = Math.max(1, Math.ceil(effectiveTotal / PAGE_SIZE))

      const paginatedPayment = filteredPayments

  const convertAmount = (amount: number) => {
    if (currency === "NGN") return amount
    return rates[currency]
      ? amount * rates[currency]
      : amount
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
      <h1 className="text-3xl font-bold mb-6">Payment Table</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by payment ID or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white max-w-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value === "all"
                ? "all"
                : normalizeStatus<PaymentStatus>(e.target.value)
            )
          }
          className="border rounded px-2 py-1"
        >
          <option value="all">All</option>
          <option value="success">Success</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="failed">Failed</option>
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
            setStatusFilter("all")
            setCurrentPage(1)
          }}
        >
          Reset
        </Button>
      </div>

      <div className="p-2 flex justify-between">
        <Tabs
          value={paymentType}
          onValueChange={(value) => {
            if (value === 'hotel') return
            setPaymentsType(value as PaymentType)
            setCurrentPage(1)
          }}
          className="mb-6">
          <TabsList>
            <TabsTrigger value="flight">Flight</TabsTrigger>
            <TabsTrigger
              value="hotel"
              disabled
              className="opacity-50 cursor-not-allowed">
              Hotel(Coming soon)
            </TabsTrigger>
          </TabsList>
        </Tabs>

      </div>
      {paymentType === 'hotel' ? (
        <div className="py-16 text-center text-gray-500">
          Hotel payments are not available yet
        </div>
      ) : (
        <>
          <PaymentTable>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Booking ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Provider</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedPayment.length > 0 ? (
                paginatedPayment.map((payment) => (
                  <TableRow key={payment.paymentId}>
                    <TableCell>{payment.user}</TableCell>
                    <TableCell>{payment.paymentId}</TableCell>
                    <TableCell>{payment.bookingId}</TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>
                      {convertAmount(payment.amount).toLocaleString(undefined, {
                        style: "currency",
                        currency,
                      })}
                    </TableCell>

                    <TableCell>{payment.provider}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </PaymentTable>

          {totalPages > 1 && (
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  )
}

export default PaymentPage
