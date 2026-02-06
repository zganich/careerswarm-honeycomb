import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

console.log("🧪 Testing Stripe Webhook Integration\n");

// Create a test event payload
const testEvent = {
  id: "evt_test_" + Date.now(),
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_123",
      customer_email: "test@careerswarm.com",
      amount_total: 2900,
      currency: "usd",
      metadata: {
        user_id: "1",
        customer_email: "test@careerswarm.com",
        customer_name: "Test User",
      },
      subscription: "sub_test_123",
    },
  },
};

// Generate proper signature
const payload = JSON.stringify(testEvent);
const timestamp = Math.floor(Date.now() / 1000);
const signature = stripe.webhooks.generateTestHeaderString({
  payload,
  secret: webhookSecret,
  timestamp,
});

console.log("📦 Test Event:", testEvent.type);
console.log("🔐 Signature Generated");
console.log("\n📡 Sending to webhook endpoint...\n");

// Send to local webhook
const response = await fetch("http://localhost:3000/api/stripe/webhook", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Stripe-Signature": signature,
  },
  body: payload,
});

const result = await response.json();
console.log("✅ Response Status:", response.status);
console.log("📄 Response Body:", JSON.stringify(result, null, 2));

if (result.verified) {
  console.log("\n✨ SUCCESS: Webhook verified and processed!");
} else {
  console.log("\n❌ FAILED: Webhook verification failed");
}
