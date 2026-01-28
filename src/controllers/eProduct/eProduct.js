import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import validateInput from "../../utils/validateInput.js";
import uploadToCLoudinary from "../../utils/uploadToCloudinary.js";

// Helper function to get discount percent and dates for a product
async function getDiscountForEProduct(eProduct) {
  const today = new Date();
  const discounts = await prisma.discount.findMany({
    where: {
      OR: [
        { products: { has: eProduct.id } },
        { categories: { has: eProduct.eCategoryId } },
      ],
      fromDate: { lte: today },
      toDate: { gte: today },
    },
    orderBy: { discountPercent: "desc" },
  });
  if (discounts.length > 0) {
    const d = discounts[0];
    return {
      discountPercent: d.discountPercent,
      fromDate: d.fromDate,
      toDate: d.toDate,
    };
  }
  return null;
}

// Create EProduct

// export const createEProduct = async (req, res) => {
//   try {
//     let { name, description, color, size, eCategoryId, stocks, price } =
//       req.body;

//     // Parse stringified JSON fields
//     if (typeof stocks === "string") stocks = JSON.parse(stocks);
//     if (typeof color === "string") color = JSON.parse(color);
//     if (typeof size === "string") size = JSON.parse(size);
//     if (typeof price === "string") price = parseFloat(price);

//     // Input validation
//     const inputValidation = validateInput(
//       [name, eCategoryId, price],
//       ["Name", "Category", "Price"]
//     );
//     if (inputValidation) {
//       return res.status(400).json(jsonResponse(false, inputValidation, null));
//     }

//     // Check category existence
//     const eCategory = await prisma.eCategory.findUnique({
//       where: { id: eCategoryId },
//     });
//     if (!eCategory) {
//       return res
//         .status(404)
//         .json(jsonResponse(false, "ECategory not found", null));
//     }

//     // 🔹 Upload multiple images
//     let imageUrls = [];
//     if (req.files && req.files.length > 0) {
//       imageUrls = await uploadToCLoudinary(req.files, "eproduct");
//     }

//     // 🔹 Create new product in DB
//     const newEProduct = await prisma.eProduct.create({
//       data: {
//         name,
//         description,
//         color,
//         size,
//         images: imageUrls, // store multiple image URLs
//         price,
//         eCategoryId,
//         stocks: {
//           create:
//             stocks?.map((s) => ({
//               color: s.color,
//               size: s.size,
//               quantity: s.quantity ?? 0,
//             })) || [],
//         },
//       },
//       include: { stocks: true, eCategory: true },
//     });

//     // ✅ Response
//     return res
//       .status(201)
//       .json(jsonResponse(true, "EProduct created successfully", newEProduct));
//   } catch (error) {
//     console.error("Error creating product:", error);
//     return res.status(500).json(jsonResponse(false, error.message, null));
//   }
// };

// Create EProduct API
export const createEProduct = async (req, res) => {
  try {
    let { name, description, color, size, eCategoryId, stocks, price } = req.body;

    // Parse stringified JSON fields if needed
    if (typeof stocks === "string") stocks = JSON.parse(stocks);
    if (typeof color === "string") color = JSON.parse(color);
    if (typeof size === "string") size = JSON.parse(size);
    if (typeof price === "string") price = parseFloat(price);

    // Input validation
    const inputValidation = validateInput(
      [name, eCategoryId, price],
      ["Name", "Category", "Price"]
    );
    if (inputValidation) {
      return res.status(400).json(jsonResponse(false, inputValidation, null));
    }

    // Check category existence
    const eCategory = await prisma.eCategory.findUnique({
      where: { id: eCategoryId },
    });
    if (!eCategory) {
      return res.status(404).json(jsonResponse(false, "ECategory not found", null));
    }

    // 🔹 Upload multiple images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadToCLoudinary(req.files, "eproduct");
    }

    // 🔹 Create new product in DB
    const newEProduct = await prisma.eProduct.create({
      data: {
        name,
        description,
        color, // main product color (optional)
        size,
        images: imageUrls, // store multiple image URLs
        price,
        eCategoryId,
        stocks: {
          create:
            stocks?.map((s) => ({
              colorId: s.color?.id, // <-- store colorId relation
              size: s.size,
              quantity: s.quantity ?? 0,
            })) || [],
        },
      },
      include: {
        stocks: {
          include: { color: true }, // <-- include color relation
        },
        eCategory: true,
      },
    });

    // 🔹 Prepare email-friendly stock array
    const stocksWithColorName = newEProduct.stocks.map((stock) => ({
      ...stock,
      colorName: stock.color?.name || stock.color?.code || "N/A",
    }));

    // Optional: replace original stocks with colorName version
    const responseProduct = {
      ...newEProduct,
      stocks: stocksWithColorName,
    };

    // ✅ Response
    return res
      .status(201)
      .json(jsonResponse(true, "EProduct created successfully", responseProduct));
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};


// Update EProduct
// export const updateEProduct = async (req, res) => {
//   try {
//     let { name, description, color, size, eCategoryId, stocks, price } =
//       req.body; // <-- add price
//     const { id } = req.params;

//     // Parse stocks if it's a string (from multipart/form-data)
//     if (typeof stocks === "string") {
//       stocks = JSON.parse(stocks);
//     }

//     // Parse color and size if sent as JSON strings
//     if (typeof color === "string") color = JSON.parse(color);
//     if (typeof size === "string") size = JSON.parse(size);
//     if (typeof price === "string") price = parseFloat(price); // <-- parse price if string

//     const eProduct = await prisma.eProduct.findUnique({ where: { id } });
//     if (!eProduct) {
//       return res
//         .status(404)
//         .json(jsonResponse(false, "EProduct not found", null));
//     }

//     let imageUrl = eProduct.image;
//     if (req.file) {
//       // Upload new image to Cloudinary
//       const uploadResult = await new Promise((resolve, reject) => {
//         uploadToCLoudinary(req.file, "eproduct", (error, result) => {
//           if (error || !result.secure_url) {
//             reject("Image upload failed");
//           } else {
//             resolve(result.secure_url);
//           }
//         });
//       }).catch((err) => null);
//       if (uploadResult) imageUrl = uploadResult;
//     }

//     // Update main product fields
//     const updatedEProduct = await prisma.eProduct.update({
//       where: { id },
//       data: {
//         name: name ?? eProduct.name,
//         description: description ?? eProduct.description,
//         color: color ?? eProduct.color,
//         size: size ?? eProduct.size,
//         eCategoryId: eCategoryId ?? eProduct.eCategoryId,
//         image: imageUrl,
//         price: price ?? eProduct.price, // <-- add price
//       },
//       include: { stocks: true, eCategory: true },
//     });

//     // Optionally update stocks (delete all and recreate, or upsert)
//     if (stocks && Array.isArray(stocks)) {
//       // Remove existing stocks
//       await prisma.eProductStock.deleteMany({ where: { eProductId: id } });
//       // Add new stocks
//       await prisma.eProductStock.createMany({
//         data: stocks.map((s) => ({
//           eProductId: id,
//           color: s.color,
//           size: s.size,
//           quantity: s.quantity ?? 0,
//         })),
//       });
//     }

//     // Return updated product with new stocks
//     const result = await prisma.eProduct.findUnique({
//       where: { id },
//       include: { stocks: true, eCategory: true },
//     });

//     return res.status(200).json(jsonResponse(true, "EProduct updated", result));
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(jsonResponse(false, error, null));
//   }
// };


export const updateEProduct = async (req, res) => {
  try {
    let {
      name,
      description,
      color,
      size,
      eCategoryId,
      stocks,
      price,
      removedImages, // 🔹 images to remove
    } = req.body;

    const { id } = req.params;

    // Parse JSON/string fields
    if (typeof stocks === "string") stocks = JSON.parse(stocks);
    if (typeof color === "string") color = JSON.parse(color);
    if (typeof size === "string") size = JSON.parse(size);
    if (typeof removedImages === "string")
      removedImages = JSON.parse(removedImages);
    if (typeof price === "string") price = parseFloat(price);

    // Find product
    const eProduct = await prisma.eProduct.findUnique({ where: { id } });
    if (!eProduct) {
      return res
        .status(404)
        .json(jsonResponse(false, "EProduct not found", null));
    }

    // 🔹 Start with existing images
    let updatedImages = [...(eProduct.images || [])];

    // 🔹 Remove selected images
    if (Array.isArray(removedImages) && removedImages.length > 0) {
      updatedImages = updatedImages.filter(
        (img) => !removedImages.includes(img)
      );
    }

    // 🔹 Upload new images
    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadToCLoudinary(req.files, "eproduct");
      updatedImages.push(...newImageUrls);
    }

    // 🔹 Update product
    await prisma.eProduct.update({
      where: { id },
      data: {
        name: name ?? eProduct.name,
        description: description ?? eProduct.description,
        color: color ?? eProduct.color,
        size: size ?? eProduct.size,
        eCategoryId: eCategoryId ?? eProduct.eCategoryId,
        images: updatedImages,
        price: price ?? eProduct.price,
      },
    });

    // 🔹 Update stocks (reset & recreate)
    if (Array.isArray(stocks)) {
      await prisma.eProductStock.deleteMany({
        where: { eProductId: id },
      });

      await prisma.eProductStock.createMany({
        data: stocks.map((s) => ({
          eProductId: id,
          color: s.color,
          size: s.size,
          quantity: s.quantity ?? 0,
        })),
      });
    }

    // 🔹 Final response
    const result = await prisma.eProduct.findUnique({
      where: { id },
      include: { stocks: true, eCategory: true },
    });

    return res
      .status(200)
      .json(jsonResponse(true, "EProduct updated successfully", result));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(jsonResponse(false, error.message, null));
  }
};






// Get EProduct by ID
export const getEProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const eProduct = await prisma.eProduct.findUnique({
      where: { id },
      include: { eCategory: true, stocks: true },
    });

    if (!eProduct) {
      return res
        .status(404)
        .json(jsonResponse(false, "EProduct not found", null));
    }

    // Check for discount
    const discount = await getDiscountForEProduct(eProduct);
    const responseProduct = discount ? { ...eProduct, ...discount } : eProduct;

    return res
      .status(200)
      .json(jsonResponse(true, "EProduct found", responseProduct));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get all EProducts with filters and sorting
export const getEProducts = async (req, res) => {
  try {
    const {
      color,
      size,
      eCategoryId,
      sortBy = "latest", // "latest", "price_asc", "price_desc"
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
    } = req.query;

    // Build filters
    const filters = {
      isActive: true,
    };
    if (color) filters.color = { has: color };
    if (size) filters.size = { has: size };
    if (eCategoryId) filters.eCategoryId = eCategoryId;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(minPrice);
      if (maxPrice) filters.price.lte = parseFloat(maxPrice);
    }

    // Build sorting
    let orderBy = { createdAt: "desc" };
    if (sortBy === "price_asc") orderBy = { price: "asc" };
    else if (sortBy === "price_desc") orderBy = { price: "desc" };
    else if (sortBy === "latest") orderBy = { createdAt: "desc" };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Query total count
    const total = await prisma.eProduct.count({ where: filters });

    // Query paginated products
    const eProducts = await prisma.eProduct.findMany({
      where: filters,
      orderBy,
      skip,
      take,
      include: { eCategory: true, stocks: true },
    });

    // For each product, check for discount
    const productsWithDiscount = await Promise.all(
      eProducts.map(async (product) => {
        const discount = await getDiscountForEProduct(product);
        return discount ? { ...product, ...discount } : product;
      })
    );

    return res.status(200).json(
      jsonResponse(true, "EProducts found", {
        products: productsWithDiscount,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      })
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Delete (deactivate) EProduct
export const deleteEProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const eProduct = await prisma.eProduct.findUnique({ where: { id } });
    if (!eProduct) {
      return res
        .status(404)
        .json(jsonResponse(false, "EProduct not found", null));
    }

    const updatedEProduct = await prisma.eProduct.update({
      where: { id },
      data: { isActive: false },
    });

    return res
      .status(200)
      .json(jsonResponse(true, "EProduct deactivated", updatedEProduct));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Re-stock (activate) EProduct
export const reStockEProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const eProduct = await prisma.eProduct.findUnique({ where: { id } });
    if (!eProduct) {
      return res
        .status(404)
        .json(jsonResponse(false, "EProduct not found", null));
    }

    const updatedEProduct = await prisma.eProduct.update({
      where: { id },
      data: { isActive: true },
    });

    return res
      .status(200)
      .json(jsonResponse(true, "EProduct re-activated", updatedEProduct));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
