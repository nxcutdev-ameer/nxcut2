import { Alert } from "react-native";

// Paymob Configuration
const PAYMOB_CONFIG = {
  API_KEY: process.env.PAYMOB_API_KEY || "your_api_key_here",
  INTEGRATION_ID: process.env.PAYMOB_INTEGRATION_ID || "your_integration_id_here",
  IFRAME_ID: process.env.PAYMOB_IFRAME_ID || "your_iframe_id_here",
  HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET || "your_hmac_secret_here",
  BASE_URL: "https://accept.paymob.com/api",
  PAYMENT_URL: "https://accept.paymob.com/api/acceptance/payment_keys",
};

interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  billingData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    country: string;
    zipCode: string;
  };
}

interface PaymentResponse {
  token: string;
  paymentUrl: string;
  orderId: string;
}

interface AuthenticationResponse {
  token: string;
}

class PaymobService {
  private authToken: string | null = null;

  /**
   * Authenticate with Paymob API
   */
  async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${PAYMOB_CONFIG.BASE_URL}/auth/tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: PAYMOB_CONFIG.API_KEY,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data: AuthenticationResponse = await response.json();
      this.authToken = data.token;
      return data.token;
    } catch (error) {
      console.error("Paymob authentication error:", error);
      throw new Error("Failed to authenticate with Paymob");
    }
  }

  /**
   * Register an order with Paymob
   */
  async registerOrder(paymentRequest: PaymentRequest): Promise<string> {
    if (!this.authToken) {
      await this.authenticate();
    }

    try {
      const orderData = {
        auth_token: this.authToken,
        delivery_needed: false,
        amount_cents: Math.round(paymentRequest.amount * 100), // Convert to cents
        currency: paymentRequest.currency,
        items: [
          {
            name: "Service Payment",
            amount_cents: Math.round(paymentRequest.amount * 100),
            description: "Payment for services",
            quantity: 1,
          },
        ],
        shipping_data: {
          first_name: paymentRequest.billingData.firstName,
          last_name: paymentRequest.billingData.lastName,
          email: paymentRequest.billingData.email,
          phone_number: paymentRequest.billingData.phone,
          street: paymentRequest.billingData.street,
          city: paymentRequest.billingData.city,
          country: paymentRequest.billingData.country,
          postal_code: paymentRequest.billingData.zipCode,
        },
      };

      const response = await fetch(`${PAYMOB_CONFIG.BASE_URL}/ecommerce/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Order registration failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Paymob order registration error:", error);
      throw new Error("Failed to register order with Paymob");
    }
  }

  /**
   * Generate payment key for iframe
   */
  async generatePaymentKey(
    orderId: string,
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    if (!this.authToken) {
      await this.authenticate();
    }

    try {
      const paymentKeyData = {
        auth_token: this.authToken,
        amount_cents: Math.round(paymentRequest.amount * 100),
        expiration: 3600, // 1 hour
        order_id: orderId,
        billing_data: {
          first_name: paymentRequest.billingData.firstName,
          last_name: paymentRequest.billingData.lastName,
          email: paymentRequest.billingData.email,
          phone_number: paymentRequest.billingData.phone,
          street: paymentRequest.billingData.street,
          city: paymentRequest.billingData.city,
          country: paymentRequest.billingData.country,
          zip_code: paymentRequest.billingData.zipCode,
        },
        currency: paymentRequest.currency,
        integration_id: PAYMOB_CONFIG.INTEGRATION_ID,
      };

      const response = await fetch(PAYMOB_CONFIG.PAYMENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentKeyData),
      });

      if (!response.ok) {
        throw new Error(`Payment key generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_CONFIG.IFRAME_ID}?payment_token=${data.token}`;

      return {
        token: data.token,
        paymentUrl,
        orderId,
      };
    } catch (error) {
      console.error("Paymob payment key generation error:", error);
      throw new Error("Failed to generate payment key");
    }
  }

  /**
   * Process payment with Paymob
   */
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Step 1: Authenticate
      await this.authenticate();

      // Step 2: Register order
      const orderId = await this.registerOrder(paymentRequest);

      // Step 3: Generate payment key
      const paymentResponse = await this.generatePaymentKey(orderId, paymentRequest);

      return paymentResponse;
    } catch (error) {
      console.error("Paymob payment processing error:", error);
      throw new Error("Failed to process payment");
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha512", PAYMOB_CONFIG.HMAC_SECRET)
      .update(payload)
      .digest("hex");

    return expectedSignature === signature;
  }

  /**
   * Handle payment success
   */
  handlePaymentSuccess(transactionData: any): void {
    console.log("Payment successful:", transactionData);
    // Handle successful payment
    // Update your database, send confirmation emails, etc.
  }

  /**
   * Handle payment failure
   */
  handlePaymentFailure(errorData: any): void {
    console.error("Payment failed:", errorData);
    // Handle failed payment
    // Log error, notify user, etc.
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): string[] {
    return [
      "Credit Card",
      "Debit Card",
      "Apple Pay",
      "Google Pay",
      "Bank Transfer",
      "Mobile Wallet",
    ];
  }

  /**
   * Check if payment method is supported
   */
  isPaymentMethodSupported(method: string): boolean {
    return this.getSupportedPaymentMethods().includes(method);
  }
}

export const paymobService = new PaymobService();
export default paymobService;
