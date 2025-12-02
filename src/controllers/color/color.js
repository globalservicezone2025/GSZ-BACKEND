import prisma from "../../utils/prismaClient.js";
import jsonResponse from "../../utils/jsonResponse.js";

// Create Color
export const createColor = async (req, res) => {
  try {
    const { name, code } = req.body;
    const color = await prisma.color.create({
      data: { name, code },
    });
    return res.status(201).json(jsonResponse(true, "Color created", color));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Update Color
export const updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const color = await prisma.color.update({
      where: { id },
      data: { name, code },
    });
    return res.status(200).json(jsonResponse(true, "Color updated", color));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get all Colors
export const getColors = async (req, res) => {
  try {
    const colors = await prisma.color.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(jsonResponse(true, "Colors found", colors));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get Color by ID
export const getColorById = async (req, res) => {
  try {
    const { id } = req.params;
    const color = await prisma.color.findUnique({ where: { id } });
    if (!color) {
      return res.status(404).json(jsonResponse(false, "Color not found", null));
    }
    return res.status(200).json(jsonResponse(true, "Color found", color));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Delete Color
export const deleteColor = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.color.delete({ where: { id } });
    return res.status(200).json(jsonResponse(true, "Color deleted", null));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};