export type BookingType  = "flight" | "hotel"

export type ApiBooking = {
  id: string;
  status: string;
  type: string;
  created: string;
  totalAmount: string | number;
  user: string;
  flightIdentifier: string;
};

export type ApiBookingDetailResponse = {
  status: boolean;
  message: string;
  data: {
    bookingSummary: {
      id: string;
      type: string;
      status: string;
      createdDate: string;
      totalAmount: number;
      currency: string;
    };
    userInfo: {
      fullName: string;
      email: string;
      phoneNumber: string;
    };
    flightInfo: {
      airlineName: string;
      flightNumber: string;
      BookingType: string;
      departureAirport: string;
      arrivalAirport: string;
      departureDateTime: string;
      arrivalDateTime: string;
      passengerCount: number;
    };
    paymentInfo: {
      provider: string;
      status: string;
      amountPaid: number;
      reference: string;
      failureReason: string | null;
    };
  };
};

export type FetchFlightsBookingParams = {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  date?: string;
  search?: string;
};

export type FetchFlightPaymentParams = {
  page?: number;
  limit?: number;
  status?: string;
  date?: string;
  search?: string;
  type?: string
};
