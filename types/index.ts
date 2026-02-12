export * from "./user"
// export * from "./booking"
export * from "./payment"

import type { User } from "./user"
import type { BookingSummary, FlightDetails } from "./booking"
import type { PaymentDetails } from "./payment"

export type BookingDetail = {
  booking: BookingSummary
  user: User
  flight: FlightDetails
  payment: PaymentDetails
}
