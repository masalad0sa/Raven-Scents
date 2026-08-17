import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import productRoutes from "./routes/products";
import authRoutes from "./routes/auth";
import orderRoutes from "./routes/orders";
import couponRoutes from "./routes/coupons";
import adminRoutes from "./routes/admin";
import paymentRoutes from "./routes/payments";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
];

// ── Security Middleware ─────────────────────────────
app.use(helmet());

// ── HTTP Request Logger ─────────────────────────────
// dev format: METHOD /path STATUS time - bytes
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      const isDeploymentHost =
        /^https:\/\/[a-z0-9-]+\.(vercel\.app|netlify\.app|railway\.app)$/i.test(
          origin,
        ) ||
        /^https:\/\/localhost(:\d+)?$/i.test(origin) ||
        /^https:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin);

      if (isDeploymentHost) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(
  express.json({
    limit: "10kb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// ── Global Rate Limit ───────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  }),
);

// ── Health Check ────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ──────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// ── 404 Handler ─────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error Handler ───────────────────────────────────
app.use(errorHandler);

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`\n🚀 Raven API running on port ${PORT}`);
  console.log(`   Health: /health`);
  console.log(`   Products: /api/products\n`);
});

export default app;
