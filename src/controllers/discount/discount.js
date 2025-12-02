import prisma from "../../utils/prismaClient.js";
import jsonResponse from "../../utils/jsonResponse.js";

// Create Discount
export const createDiscount = async (req, res) => {
  try {
    const { fromDate, toDate, categories, products, discountPercent } = req.body;

    const discount = await prisma.discount.create({
      data: {
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        categories,
        products,
        discountPercent,
      },
    });

    return res.status(201).json(jsonResponse(true, "Discount created", discount));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Update Discount
export const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { fromDate, toDate, categories, products, discountPercent } = req.body;

    const discount = await prisma.discount.update({
      where: { id },
      data: {
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
        categories,
        products,
        discountPercent,
      },
    });

    return res.status(200).json(jsonResponse(true, "Discount updated", discount));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// get all discounts
export const getDiscounts = async (req, res) => {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
    });

    // For each discount, fetch category and product names
    const discountsWithDetails = await Promise.all(
      discounts.map(async (discount) => {
        // Fetch categories
        const categories = await prisma.eCategory.findMany({
          where: { id: { in: discount.categories } },
          select: { id: true, name: true },
        });

        // Fetch products
        const products = await prisma.eProduct.findMany({
          where: { id: { in: discount.products } },
          select: { id: true, name: true },
        });

        return {
          ...discount,
          categoryDetails: categories,
          productDetails: products,
        };
      })
    );

    return res
      .status(200)
      .json(jsonResponse(true, "Discounts found", discountsWithDetails));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get Discount by ID
export const getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;
    const discount = await prisma.discount.findUnique({ where: { id } });
    if (!discount) {
      return res.status(404).json(jsonResponse(false, "Discount not found", null));
    }
    return res.status(200).json(jsonResponse(true, "Discount found", discount));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Delete Discount
export const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.discount.delete({ where: { id } });
    return res.status(200).json(jsonResponse(true, "Discount deleted", null));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};