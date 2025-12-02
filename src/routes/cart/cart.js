import express from "express";
import {
  createCart,
  updateCart,
  addCartItems,
  removeCartItem,
  getCarts,
  getCartById,
  getCartByDeviceMac,
} from "../../controllers/cart/cart.js";

const router = express.Router();

// Create Cart
router.post("/v1/carts", createCart);

// Update Cart (update vat or deviceMac)
router.put("/v1/carts/:id", updateCart);

// Add items to Cart
router.post("/v1/carts/:id/items", addCartItems);

// Remove item from Cart
router.delete("/v1/carts/:cartId/items/:cartItemId", removeCartItem);

// Get all Carts
router.get("/v1/carts", getCarts);

// Get Cart by ID
router.get("/v1/carts/:id", getCartById);

// Get Cart by deviceMac
router.get("/v1/cart/device", getCartByDeviceMac);

export default router;