// backend/middleware/x402.js
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const FACILITATOR_URL = process.env.FACILITATOR_URL;
const MERCHANT_WALLET = process.env.MERCHANT_WALLET;
const USDC_CONTRACT = process.env.USDC_CONTRACT;
const MERCHANT_NAME = process.env.MERCHANT_NAME;

function build402Response(req, price, description) {
  const resource = `https://${req.headers.host}${req.path}`;
  return {
    error: "X-PAYMENT header is required",
    accepts: [
      {
        scheme: "gokite-aa",
        network: "kite-testnet",
        maxAmountRequired: price, // in wei, so $0.02 = "20000000000000000"
        resource,
        description,
        mimeType: "application/json",
        outputSchema: {
          input: { discoverable: true, method: req.method, type: "http" },
          output: { type: "object" },
        },
        payTo: MERCHANT_WALLET,
        maxTimeoutSeconds: 300,
        asset: USDC_CONTRACT,
        extra: null,
        merchantName: MERCHANT_NAME,
      },
    ],
    x402Version: 1,
  };
}

// This calls Pieverse to actually settle the payment on-chain
async function settlePayment(xPaymentHeader) {
  const response = await fetch(`${FACILITATOR_URL}/v2/settle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payment: xPaymentHeader }),
  });
  const result = await response.json();
  return { success: response.ok, data: result };
}

