// backend/middleware/x402.js
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const FACILITATOR_URL = process.env.FACILITATOR_URL;
const MERCHANT_WALLET = process.env.MERCHANT_WALLET;
const USDC_CONTRACT = process.env.USDC_CONTRACT;
const MERCHANT_NAME = process.env.MERCHANT_NAME;

