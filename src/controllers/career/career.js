import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import validateInput from "../../utils/validateInput.js";

const module_name = "career";

// Create career
export const createCareer = async (req, res) => {
  try {
    const {
      title,
      position,
      location,
      salary,
      description,
      lastDateToApply,
      visibility,
    } = req.body;

    // Validate input
    const inputValidation = validateInput(
      [title, position],
      ["Title", "Position"],
    );

    if (inputValidation) {
      return res.status(400).json(jsonResponse(false, inputValidation, null));
    }

    // Create career
    const career = await prisma.career.create({
      data: {
        title,
        position,
        location,
        salary,
        description,
        lastDateToApply: lastDateToApply ? new Date(lastDateToApply) : null,
        visibility: visibility !== undefined ? visibility : true,
        createdBy: req.user?.id,
      },
    });

    if (career) {
      return res
        .status(201)
        .json(jsonResponse(true, "Career created successfully", career));
    } else {
      return res
        .status(400)
        .json(jsonResponse(false, "Career creation failed", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};

// Update career
export const updateCareer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      position,
      location,
      salary,
      description,
      lastDateToApply,
      visibility,
    } = req.body;

    // Check if career exists
    const existingCareer = await prisma.career.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existingCareer) {
      return res
        .status(404)
        .json(jsonResponse(false, "Career not found", null));
    }

    // Update career
    const career = await prisma.career.update({
      where: { id },
      data: {
        title,
        position,
        location,
        salary,
        description,
        lastDateToApply: lastDateToApply
          ? new Date(lastDateToApply)
          : undefined,
        visibility,
        updatedBy: req.user?.id,
      },
    });

    if (career) {
      return res
        .status(200)
        .json(jsonResponse(true, "Career updated successfully", career));
    } else {
      return res
        .status(400)
        .json(jsonResponse(false, "Career update failed", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};

// Search all careers (only id, title, position, location, lastDateToApply where visibility is true and isDeleted is false)
export const searchAllCareers = async (req, res) => {
  try {
    const careers = await prisma.career.findMany({
      where: {
        visibility: true,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        position: true,
        location: true,
        lastDateToApply: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip:
        req.query.limit && req.query.page
          ? parseInt(req.query.limit * (req.query.page - 1))
          : parseInt(defaultLimit() * (defaultPage() - 1)),
      take: req.query.limit
        ? parseInt(req.query.limit)
        : parseInt(defaultLimit()),
    });

    if (careers.length === 0) {
      return res
        .status(200)
        .json(jsonResponse(true, "No careers available", []));
    }

    return res
      .status(200)
      .json(jsonResponse(true, `${careers.length} careers found`, careers));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};

// Search career by ID (all info)
export const searchCareerById = async (req, res) => {
  try {
    const { id } = req.params;

    const career = await prisma.career.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        applications: {
          where: {
            isDeleted: false,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!career) {
      return res
        .status(404)
        .json(jsonResponse(false, "Career not found", null));
    }

    return res.status(200).json(jsonResponse(true, "Career found", career));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};

// Delete career (soft delete)
export const deleteCareer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if career exists
    const existingCareer = await prisma.career.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existingCareer) {
      return res
        .status(404)
        .json(jsonResponse(false, "Career not found", null));
    }

    // Soft delete career
    const career = await prisma.career.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedBy: req.user?.id,
      },
    });

    if (career) {
      return res
        .status(200)
        .json(jsonResponse(true, "Career has been deleted", career));
    } else {
      return res
        .status(400)
        .json(jsonResponse(false, "Career has not been deleted", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};
