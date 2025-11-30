import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productsRouter from "./routes/products";

dotenv.config();

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" })); // large enough for base64 image strings

app.get("/", (_req, res) => {
  res.json({ message: "Store Product API is running" });
});

app.use("/products", productsRouter);

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
