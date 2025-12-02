import prisma from "../../utils/prismaClient.js";
import jsonResponse from "../../utils/jsonResponse.js";
import validateInput from "../../utils/validateInput.js";

// Create Faq
export const createFaq = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId, question, answer } = req.body;

    // Validate input
    const inputValidation = validateInput(
      [categoryId, subCategoryId, question, answer],
      ["Category ID", "Subcategory ID", "Question", "Answer"]
    );

    if (inputValidation) {
      return res.status(400).json(jsonResponse(false, inputValidation, null));
    }

    const newFaq = await prisma.faq.create({
      data: {
        categoryId,
        subCategoryId,
        subSubCategoryId,
        question,
        answer,
      },
    });

    return res.status(200).json(jsonResponse(true, "Faq has been created", newFaq));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Create Faq with SubSubCategoryId
export const createFaqWithSubSubCategoryId = async (req, res) => {
  try {
    const { subSubCategoryId, question } = req.body;

    // Validate input
    const inputValidation = validateInput(
      [subSubCategoryId, question],
      ["SubSubCategory ID", "Question"]
    );

    if (inputValidation) {
      return res.status(400).json(jsonResponse(false, inputValidation, null));
    }

    // Find the corresponding categoryId and subCategoryId from Subsubcategory table
    const subSubCategory = await prisma.subsubcategory.findUnique({
      where: { id: subSubCategoryId },
      select: {
        categoryId: true,
        subCategoryId: true,
      },
    });

    if (!subSubCategory) {
      return res.status(404).json(jsonResponse(false, "SubSubCategory not found", null));
    }

    const { categoryId, subCategoryId } = subSubCategory;

    // Create the FAQ with the provided question and an empty answer
    const newFaq = await prisma.faq.create({
      data: {
        categoryId,
        subCategoryId,
        subSubCategoryId,
        question,
        answer: "",
        isActive: false,
      },
    });

    return res.status(200).json(jsonResponse(true, "Faq has been created", newFaq));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Update Faq
export const updateFaq = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId, question, answer } = req.body;

    // Validate input
    const inputValidation = validateInput(
      [categoryId, subCategoryId, question, answer],
      ["Category ID", "Subcategory ID", "Question", "Answer"]
    );

    if (inputValidation) {
      return res.status(400).json(jsonResponse(false, inputValidation, null));
    }

    const updatedFaq = await prisma.faq.update({
      where: { id: req.params.id },
      data: {
        categoryId,
        subCategoryId,
        subSubCategoryId,
        question,
        answer,
      },
    });

    return res.status(200).json(jsonResponse(true, "Faq has been updated", updatedFaq));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get All Faqs
export const getAllFaqs = async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({
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

    if (faqs.length === 0) {
      return res.status(200).json(jsonResponse(true, "No faq is available", null));
    }

    return res.status(200).json(jsonResponse(true, `${faqs.length} faqs found`, faqs));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get Faqs by Category ID
export const getFaqsByCategoryId = async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({
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

    if (faqs.length === 0) {
      return res.status(200).json(jsonResponse(true, "No faq is available for this category", null));
    }

    return res.status(200).json(jsonResponse(true, `${faqs.length} faqs found`, faqs));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get Faqs by Subcategory ID
export const getFaqsBySubCategoryId = async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({
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

    if (faqs.length === 0) {
      return res.status(200).json(jsonResponse(true, "No faq is available for this subcategory", null));
    }

    return res.status(200).json(jsonResponse(true, `${faqs.length} faqs found`, faqs));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get Faqs by Subsubcategory ID
export const getFaqsBySubSubCategoryId = async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({
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

    if (faqs.length === 0) {
      return res.status(200).json(jsonResponse(true, "No faq is available for this subsubcategory", null));
    }

    return res.status(200).json(jsonResponse(true, `${faqs.length} faqs found`, faqs));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Ban Faq
export const banFaq = async (req, res) => {
  try {
    const faq = await prisma.faq.update({
      where: { id: req.params.id },
      data: {
        isActive: req.body.isActive,
      },
    });

    return res.status(200).json(jsonResponse(true, "Faq has been banned", faq));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Delete Faq
export const deleteFaq = async (req, res) => {
  try {
    const faq = await prisma.faq.delete({
      where: { id: req.params.id },
    });

    return res.status(200).json(jsonResponse(true, "Faq has been deleted", faq));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};