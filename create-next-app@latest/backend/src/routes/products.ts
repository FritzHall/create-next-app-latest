import { Router, Request, Response } from "express";
import { pool } from "../db";

const router = Router();

// GET /products - all products
router.get("/", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET /products/:id - single product
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    const products = rows as any[];
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(products[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// POST /products - create
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, price, description, category, image } = req.body;

    if (!name || !price || !description || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [result] = await pool.query(
      "INSERT INTO products (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)",
      [name, price, description, category, image ?? null]
    );

    const insertResult = result as any;
    const id = insertResult.insertId;

    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    const products = rows as any[];
    res.status(201).json(products[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// PUT /products/:id - update
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, price, description, category, image } = req.body;
    const id = req.params.id;

    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, price = ?, description = ?, category = ?, image = ?
       WHERE id = ?`,
      [name, price, description, category, image ?? null, id]
    );

    const updateResult = result as any;
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    const products = rows as any[];
    res.json(products[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE /products/:id - delete
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);

    const deleteResult = result as any;
    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
