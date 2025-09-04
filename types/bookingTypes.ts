import { Service } from "./serviceTypes";

export type BookingStatus = "CONFIRMED" | "PENDING" | "CANCELED" | "PAYMENT_FAILED" | "NOT_AVAILABLE";

export type BookingItem = {
    tripItemId : number
    status: BookingStatus
    startTime: string // Format: "YYYY-MM-DDTHH:mm:ssZ"
    endTime: string // Format: "YYYY-MM-DDTHH:mm:ssZ"
    noOfUnits: number
    numberOfAdults: number
    numberOfChildren: number
    totalPrice: number | null
    paidAmount: number | null
    dueAmount: number | null
    depositAmount: number | null
    bookingDate: string | null
    service : Service | null
}

export type PaymentRequest = {
  paymentIntentId : string;
  bookingId: number;
  paymentAmount: number;
  currency: string;
  clientSecret: string;
};