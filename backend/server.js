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