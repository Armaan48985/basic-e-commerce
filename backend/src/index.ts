import express from "express";
import "dotenv/config";
import cors from "cors";
import { addToCart, fetchProducts, getCartForUser } from "./cart";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // frontend
    credentials: true,
  })
);
app.use(express.json());

app.post("/cart/add", async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    await addToCart(userId, productId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/cart", async (req, res) => {
  const { userId } = req.query as { userId: string };

   if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }

  try {
    const cartItems = await getCartForUser(userId);
    res.json(cartItems);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
})

app.get("/products", async (req, res) => {
  try {
    const products = await fetchProducts();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
})

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});