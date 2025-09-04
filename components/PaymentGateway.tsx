import React, { useState } from "react";
import { Alert } from "react-native";
import {
  useStripe,
  initPaymentSheet,
  presentPaymentSheet,
} from "@stripe/stripe-react-native";
import { createBooking, confirmBooking } from "@/services/bookingService";
import type { PaymentRequest } from "@/types/bookingTypes";

interface PaymentGatewayProps {
  onPaymentStart?: () => void;
  onPaymentSuccess?: (
    bookingId: number,
    paymentAmount: number,
    currency: string
  ) => void;
  onPaymentFailure?: (error: string) => void;
  onPaymentCancel?: () => void;
}

interface PaymentGatewayReturn {
  processPayment: (tripItemId: number) => Promise<void>;
  isProcessing: boolean;
}

export const usePaymentGateway = ({
  onPaymentStart,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentCancel,
}: PaymentGatewayProps): PaymentGatewayReturn => {
  const stripe = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = async (tripItemId: number): Promise<void> => {
    if (!stripe) {
      const errorMsg = "Stripe is not initialized. Please try again.";
      onPaymentFailure?.(errorMsg);
      Alert.alert("Error", errorMsg);
      return;
    }

    if (isProcessing) {
      Alert.alert("Processing", "Please wait, payment is being processed...");
      return;
    }

    setIsProcessing(true);
    onPaymentStart?.();

    try {
      // Step 1: Create booking and get payment intent
      console.log(`Creating booking for tripItemId: ${tripItemId}`);
      const bookingResponse = await createBooking(tripItemId);

      if (!bookingResponse.success || !bookingResponse.data) {
        const errorMsg = bookingResponse.message || "Failed to create booking";
        onPaymentFailure?.(errorMsg);
        Alert.alert("Error", errorMsg);
        return;
      }

      const paymentRequest: PaymentRequest = bookingResponse.data;
      const {
        bookingId,
        paymentIntentId,
        clientSecret,
        paymentAmount,
        currency,
      } = paymentRequest;

      console.log(
        `Booking created successfully. BookingId: ${bookingId}, PaymentIntentId: ${paymentIntentId}, Amount: ${paymentAmount} ${currency}`
      );

      // Step 2: Initialize Payment Sheet with client secret
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "LankaTrails",
        paymentIntentClientSecret: clientSecret,
        style: "automatic", // Follows system theme
        allowsDelayedPaymentMethods: false,
        returnURL: "lankatrailsmobileapp://payment-return",
      });

      if (initError) {
        console.error("Payment Sheet init error:", initError);
        const errorMsg =
          initError.message ||
          "Could not initialize payment. Please try again.";
        onPaymentFailure?.(errorMsg);
        Alert.alert("Payment Setup Failed", errorMsg);
        return;
      }

      // Step 3: Present Payment Sheet (shows card input UI)
      console.log("Presenting payment sheet...");
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.error("Payment error:", paymentError);

        // Handle different error types
        if (paymentError.code === "Canceled") {
          console.log("Payment was canceled by user");
          onPaymentCancel?.();
          Alert.alert("Payment Canceled", "Payment was canceled by user.");
        } else {
          const errorMsg =
            paymentError.message ||
            "Payment could not be processed. Please try again.";
          onPaymentFailure?.(errorMsg);
          Alert.alert("Payment Failed", errorMsg);
        }
        return;
      }

      // Step 4: Payment successful - confirm booking with backend
      console.log("✅ Payment successful, confirming booking...");

      try {
        const confirmResponse = await confirmBooking(paymentIntentId);

        if (confirmResponse.success) {
          console.log(
            `Booking confirmed successfully: ${bookingId}, PaymentIntentId: ${paymentIntentId}`
          );
          onPaymentSuccess?.(bookingId, paymentAmount, currency);

          Alert.alert(
            "Payment Successful! 🎉",
            `Your booking has been confirmed!\n\nBooking ID: ${bookingId}\nAmount Paid: ${paymentAmount} ${currency}`,
            [
              {
                text: "Great!",
                onPress: () => {
                  console.log("Payment flow completed successfully");
                },
              },
            ]
          );
        } else {
          // Payment went through but confirmation failed
          const errorMsg =
            "Payment was successful, but there was an issue confirming your booking. Please contact support.";
          console.error(
            "Booking confirmation failed:",
            confirmResponse.message
          );
          onPaymentFailure?.(errorMsg);

          Alert.alert(
            "Payment Processed - Confirmation Pending",
            `${errorMsg}\n\nBooking ID: ${bookingId}\nPayment Intent ID: ${paymentIntentId}\nReference these IDs when contacting support.`,
            [
              {
                text: "Contact Support",
                onPress: () => {
                  console.log(
                    "Need to contact support for booking:",
                    bookingId,
                    "PaymentIntentId:",
                    paymentIntentId
                  );
                },
              },
            ]
          );
        }
      } catch (confirmError: any) {
        // Payment went through but confirmation failed
        const errorMsg =
          "Payment was successful, but we couldn't confirm your booking automatically. Please contact support.";
        console.error("Booking confirmation error:", confirmError);
        onPaymentFailure?.(errorMsg);

        Alert.alert(
          "Payment Processed - Confirmation Error",
          `${errorMsg}\n\nBooking ID: ${bookingId}\nPayment Intent ID: ${paymentIntentId}\nError: ${confirmError.message}`,
          [
            {
              text: "Contact Support",
              onPress: () => {
                console.log(
                  "Confirmation error for booking:",
                  bookingId,
                  "PaymentIntentId:",
                  paymentIntentId,
                  confirmError
                );
              },
            },
          ]
        );
      }
    } catch (error: any) {
      // Booking creation failed
      const errorMsg =
        error.message || "Failed to create booking. Please try again.";
      console.error("Booking creation error:", error);
      onPaymentFailure?.(errorMsg);
      Alert.alert("Booking Error", errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
  };
};

// Export default hook for easier imports
export default usePaymentGateway;
