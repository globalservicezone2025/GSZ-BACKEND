import prisma from "../../utils/prismaClient.js";
import jsonResponse from "../../utils/jsonResponse.js";

// Create Cart
export const createCart = async (req, res) => {
  try {
    const { vat, items } = req.body; // items: [{ eProductId, quantity, discountPercent, color, size }]
    const deviceMac = req.headers["x-device-mac"] || req.body.deviceMac;

    // Fetch product prices and discounts for all items
    let itemsWithPrice = [];
    if (items?.length) {
      const eProductIds = items.map((item) => item.eProductId);
      const eProducts = await prisma.eProduct.findMany({
        where: { id: { in: eProductIds } },
        select: { id: true, price: true /*, discountPercent: true*/ },
      });
      const eProductMap = Object.fromEntries(eProducts.map((p) => [p.id, p]));
      itemsWithPrice = items.map((item) => ({
        eProductId: item.eProductId,
        quantity: item.quantity ?? 1,
        price: eProductMap[item.eProductId]?.price ?? 0,
        discountPercent: item.discountPercent ?? 0,
        color: item.color ?? null,
        size: item.size ?? null,
      }));
    }

    const cart = await prisma.cart.create({
      data: {
        vat: vat ?? 0,
        deviceMac,
        items: {
          create: itemsWithPrice,
        },
      },
      include: { items: true },
    });

    return res.status(201).json(jsonResponse(true, "Cart created", cart));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Update Cart (update vat)
export const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { vat } = req.body;
    const deviceMac = req.headers["x-device-mac"] || req.body.deviceMac;

    const cart = await prisma.cart.update({
      where: { id },
      data: {
        vat,
        deviceMac,
      },
      include: { items: true },
    });

    return res.status(200).json(jsonResponse(true, "Cart updated", cart));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Add Items to Cart (add new or update quantity)
export const addCartItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // items: [{ eProductId, quantity, color, size }]
    const deviceMac = req.headers["x-device-mac"] || req.body.deviceMac;

    // Ensure cart exists
    const cart = await prisma.cart.findUnique({ where: { id } });
    if (!cart) {
      return res.status(404).json(jsonResponse(false, "Cart not found", null));
    }

    const results = [];
    for (const item of items) {
      // Find by cartId, eProductId, color, and size
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: id,
          eProductId: item.eProductId,
          color: item.color ?? null,
          size: item.size ?? null,
        },
      });

      if (existingItem) {
        // Update quantity
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + (item.quantity ?? 1) },
        });
        results.push(updatedItem);
      } else {
        // Fetch product price and discount
        const eProduct = await prisma.eProduct.findUnique({
          where: { id: item.eProductId },
          select: { price: true /*, discountPercent: true*/ },
        });
        const createdItem = await prisma.cartItem.create({
          data: {
            cartId: id,
            eProductId: item.eProductId,
            quantity: item.quantity ?? 1,
            price: eProduct?.price ?? 0,
            discountPercent: 0, // Set to eProduct?.discountPercent ?? 0 if available
            color: item.color ?? null,
            size: item.size ?? null,
          },
        });
        results.push(createdItem);
      }
    }

    return res
      .status(200)
      .json(jsonResponse(true, "Items added/updated", results));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Remove Item from Cart (decrease quantity or remove if 0)
export const removeCartItem = async (req, res) => {
  try {
    const { cartId, cartItemId } = req.params;

    // Ensure cart exists
    const cart = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) {
      return res.status(404).json(jsonResponse(false, "Cart not found", null));
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });
    if (!cartItem) {
      return res
        .status(404)
        .json(jsonResponse(false, "Cart item not found", null));
    }

    if (cartItem.quantity <= 1) {
      // Remove item if quantity is 1 or less
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return res
        .status(200)
        .json(jsonResponse(true, "Item removed from cart", null));
    } else {
      // Decrease quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: cartItem.quantity - 1 },
      });
      return res
        .status(200)
        .json(jsonResponse(true, "Item quantity decreased", updatedItem));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get all Carts
export const getCarts = async (req, res) => {
  try {
    const carts = await prisma.cart.findMany({
      include: { items: true },
    });
    return res.status(200).json(jsonResponse(true, "Carts found", carts));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get Cart by ID
export const getCartById = async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await prisma.cart.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!cart) {
      return res.status(404).json(jsonResponse(false, "Cart not found", null));
    }
    return res.status(200).json(jsonResponse(true, "Cart found", cart));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get Cart by deviceMac
export const getCartByDeviceMac = async (req, res) => {
  try {
    const deviceMac =
      req.headers["x-device-mac"] || req.query.deviceMac || req.body.deviceMac;
    if (!deviceMac) {
      return res
        .status(400)
        .json(jsonResponse(false, "deviceMac is required", null));
    }

    const cart = await prisma.cart.findFirst({
      where: { deviceMac },
      include: { items: true },
    });

    if (!cart) {
      return res.status(404).json(jsonResponse(false, "Cart not found", null));
    }
    return res.status(200).json(jsonResponse(true, "Cart found", cart));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
