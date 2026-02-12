export type PaymentStatus =   
  | 'Success'
  | 'Paid'
  | 'Pending'
  | 'Cancelled'
  | 'Failed'

export type PaymentType = "flight" | "hotel"

export type Currency = "NGN" | "USD" | "EUR" | "GBP"

export const SUPPORTED_CURRENCIES: Currency[] = [
  "NGN",
  "USD",
  "EUR",
  "GBP",
]

export type flightProvider = 'Stripe' | 'PayStack'

export type Payment = {
  user: string;
  type: PaymentType
  bookingId: string;
  paymentId: string;
  status: PaymentStatus,
  amount: number;
  method: string;
  provider: string;
  createdAt: string;
  currency?: 'NGN'
};

export interface PaymentQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: PaymentStatus
  provider?: flightProvider
  date?: string 
}

export type PaymentDetails = {
  paymentProvider: string
  status: PaymentStatus
  amount: number
  currency: "USD" | "NGN" | "GBP"
  paymentReference: string
  failureReason?: string
}

export type RevenueSummary = {
  totalRevenue: number
  currency: string
}
