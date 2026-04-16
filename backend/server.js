// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { x402Gate } from "./middleware/x402.js";
import { scanContract, scoreContract } from "./services/scanner.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8099;

// Health check — free, no payment needed
app.get("/health", (req, res) => {
  res.json({ status: "BuzzShield is live", chain: "kite-testnet", chainId: 2368 });
});

// PAID ENDPOINT 1: Full security scan — costs $0.02 (in wei: 20000000000000000)
app.post(
  "/shield",
  x402Gate("20000000000000000", "BuzzShield - Full smart contract security scan"),
  (req, res) => {
    const { contractAddress } = req.body;
    if (!contractAddress) {
      return res.status(400).json({ error: "contractAddress is required" });
    }
    const result = scanContract(contractAddress);
    res.json({
      ...result,
      paymentReceipt: req.paymentReceipt,
    });
  }
);

// PAID ENDPOINT 2: Quick risk score — costs $0.01
app.get(
  "/score",
  x402Gate("10000000000000000", "BuzzShield - Quick risk score check"),
  (req, res) => {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: "address query param is required" });
    }
    const result = scoreContract(address);
    res.json({
      ...result,
      paymentReceipt: req.paymentReceipt,
    });
  }
);

app.listen(PORT, () => {
  console.log(`🛡️ BuzzShield PISP running on port ${PORT}`);
  console.log(`💰 Merchant wallet: ${process.env.MERCHANT_WALLET}`);
  console.log(`🔗 Network: Kite Testnet (Chain ID 2368)`);
});