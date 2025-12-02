import prisma from "../../utils/prismaClient.js";
import jsonResponse from "../../utils/jsonResponse.js";
import validateInput from "../../utils/validateInput.js";

// Create Pricing
export const createPricing = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId, type, title, description } = req.body;
    let { price } = req.body;

    // Convert price to number
    price = parseFloat(price);

    // Validate input
    const inputValidation = validateInput(
      [categoryId, subCategoryId, subSubCategoryId, type, price, title],
      ["Category ID", "Subcategory ID", "Subsubcategory ID", "Type", "Price", "Title"]
    );

    if (inputValidation) {
      return res.status(400).json(jsonResponse(false, inputValidation, null));
    }

    // Check if a pricing with the same categoryId, subCategoryId, subSubCategoryId, and type already exists
    const existingPricing = await prisma.pricing.findFirst({
      where: {
        categoryId,
        subCategoryId,
        subSubCategoryId,
        type,
      },
    });

    if (existingPricing) {
      return res
        .status(400)
        .json(
          jsonResponse(
            false,
            "Pricing with the same Category ID, Subcategory ID, Subsubcategory ID, and Type already exists",
            null
          )
        );
    }

    const newPricing = await prisma.pricing.create({
      data: {
        categoryId,
        subCategoryId,
        subSubCategoryId,
        type,
        price,
        title,
        description,
      },
    });

    return res
      .status(200)
      .json(jsonResponse(true, "Pricing has been created", newPricing));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Update Pricing
export const updatePricing = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId, type, price, title, description } =
      req.body;

    // Validate input
    const inputValidation = validateInput(
      [type, price, title],
      ["Type", "Price", "Title"]
    );

    if (inputValidation) {
      return res.status(400).json(jsonResponse(false, inputValidation, null));
    }

    const updatedPricing = await prisma.pricing.update({
      where: { id: req.params.id },
      data: {
        categoryId,
        subCategoryId,
        subSubCategoryId,
        type,
        price,
        title,
        description,
      },
    });

    return res
      .status(200)
      .json(jsonResponse(true, "Pricing has been updated", updatedPricing));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get All Pricings
export const getAllPricings = async (req, res) => {
  try {
    const pricings = await prisma.pricing.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
        subcategory: {
          select: {
            name: true,
          },
        },
        subsubcategory: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (pricings.length === 0) {
      return res
        .status(200)
        .json(jsonResponse(true, "No pricing is available", null));
    }

    return res
      .status(200)
      .json(jsonResponse(true, `${pricings.length} pricings found`, pricings));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get Pricings by Category ID
export const getPricingsByCategoryId = async (req, res) => {
  try {
    const pricings = await prisma.pricing.findMany({
      where: { categoryId: req.params.categoryId },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        subcategory: {
          select: {
            name: true,
          },
        },
        subsubcategory: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (pricings.length === 0) {
      return res
        .status(200)
        .json(
          jsonResponse(true, "No pricing is available for this category", null)
        );
    }

    return res
      .status(200)
      .json(jsonResponse(true, `${pricings.length} pricings found`, pricings));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get Pricings by Subcategory ID
export const getPricingsBySubCategoryId = async (req, res) => {
  try {
    const pricings = await prisma.pricing.findMany({
      where: { subCategoryId: req.params.subCategoryId },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        subcategory: {
          select: {
            name: true,
          },
        },
        subsubcategory: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (pricings.length === 0) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            "No pricing is available for this subcategory",
            null
          )
        );
    }

    return res
      .status(200)
      .json(jsonResponse(true, `${pricings.length} pricings found`, pricings));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get Pricings by SubSubCategory ID
export const getPricingsBySubSubCategoryId = async (req, res) => {
  try {
    const pricings = await prisma.pricing.findMany({
      where: { subSubCategoryId: req.params.subSubCategoryId },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        subcategory: {
          select: {
            name: true,
          },
        },
        subsubcategory: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (pricings.length === 0) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            "No pricing is available for this subsubcategory",
            null
          )
        );
    }

    return res
      .status(200)
      .json(jsonResponse(true, `${pricings.length} pricings found`, pricings));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Ban Pricing
export const banPricing = async (req, res) => {
  try {
    const pricing = await prisma.pricing.update({
      where: { id: req.params.id },
      data: {
        isActive: req.body.isActive,
      },
    });

    return res
      .status(200)
      .json(jsonResponse(true, "Pricing has been banned", pricing));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Delete Pricing
export const deletePricing = async (req, res) => {
  try {
    const pricing = await prisma.pricing.delete({
      where: { id: req.params.id },
    });

    return res
      .status(200)
      .json(jsonResponse(true, "Pricing has been deleted", pricing));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};