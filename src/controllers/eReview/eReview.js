import prisma from "../../utils/prismaClient.js";
import jsonResponse from "../../utils/jsonResponse.js";

// Create EReview
export const createEReview = async (req, res) => {
  try {
    const { rating, review, productId, email, phoneNumber } = req.body;

    const eProduct = await prisma.eProduct.findUnique({
      where: { id: productId },
    });
    if (!eProduct) {
      return res
        .status(404)
        .json(jsonResponse(false, "EProduct not found", null));
    }

    // Check if review already exists for this product and contact
    const existingReview = await prisma.eReview.findFirst({
      where: {
        productId,
        OR: [
          { phoneNumber: phoneNumber || undefined },
          { email: email || undefined },
        ],
      },
    });
    if (existingReview) {
      return res
        .status(400)
        .json(jsonResponse(false, "You have already reviewed this product", null));
    }

    // Check for delivered order with matching phoneNumber/email and product
    const deliveredOrder = await prisma.eOrder.findFirst({
      where: {
        status: "DELIVERED",
        OR: [
          { phoneNumber: phoneNumber || undefined },
          { email: email || undefined },
        ],
        cart: {
          items: {
            some: { eProductId: productId },
          },
        },
      },
    });

    if (!deliveredOrder) {
      return res
        .status(400)
        .json(
          jsonResponse(
            false,
            "No delivered order found for this product and contact",
            null
          )
        );
    }

    // Get name from deliveredOrder
    const name = deliveredOrder.name || "";

    const eReview = await prisma.eReview.create({
      data: { name, rating, review, productId, email, phoneNumber },
    });

    return res.status(201).json(jsonResponse(true, "Review created", eReview));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Update EReview
export const updateEReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review, email, phoneNumber } = req.body;

    const eReview = await prisma.eReview.update({
      where: { id },
      data: { rating, review, email, phoneNumber },
    });

    return res.status(200).json(jsonResponse(true, "Review updated", eReview));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get all EReviews
export const getEReviews = async (req, res) => {
  try {
    const eReviews = await prisma.eReview.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(jsonResponse(true, "Reviews found", eReviews));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get EReview by ID
export const getEReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const eReview = await prisma.eReview.findUnique({ where: { id } });
    if (!eReview) {
      return res
        .status(404)
        .json(jsonResponse(false, "Review not found", null));
    }
    return res.status(200).json(jsonResponse(true, "Review found", eReview));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Delete EReview
export const deleteEReview = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.eReview.delete({ where: { id } });
    return res.status(200).json(jsonResponse(true, "Review deleted", null));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get reviews for a particular product
export const getEReviewsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const eReviews = await prisma.eReview.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(jsonResponse(true, "Reviews found", eReviews));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
