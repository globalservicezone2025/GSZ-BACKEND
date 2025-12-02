import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import deleteFromCloudinary from "../../utils/deleteFromCloudinary.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import slugify from "../../utils/slugify.js";
import uploadToCLoudinary from "../../utils/uploadToCloudinary.js";
import validateInput from "../../utils/validateInput.js";
// import uploadImage from "../../utils/uploadImage.js";

const module_name = "ecategory";

// Create ECategory
export const createECategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { name, text, serial } = req.body;

      const inputValidation = validateInput([name], ["Name"]);
      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      const user = await tx.user.findFirst({
        where: { id: req.user.parentId ? req.user.parentId : req.user.id },
      });
      if (!user)
        return res
          .status(404)
          .json(jsonResponse(false, "This user does not exist", null));

      const eCategory = await tx.eCategory.findFirst({
        where: {
          userId: req.user.parentId ? req.user.parentId : req.user.id,
          name: name,
          isDeleted: false,
        },
      });

      if (
        eCategory &&
        eCategory.slug === `${slugify(user.name)}-${slugify(name)}`
      )
        return res
          .status(409)
          .json(
            jsonResponse(
              false,
              `${name} already exists. Change its name.`,
              null
            )
          );

      if (!req.file) {
        const newECategory = await prisma.eCategory.create({
          data: {
            userId: req.user.parentId ? req.user.parentId : req.user.id,
            name,
            text,
            serial: parseInt(serial) || 0,
            createdBy: req.user.id,
            slug: `${slugify(user.name)}-${slugify(name)}`,
          },
        });

        if (newECategory) {
          return res
            .status(200)
            .json(jsonResponse(true, "ECategory has been created", newECategory));
        }
      }

      await uploadToCLoudinary(req.file, module_name, async (error, result) => {
        if (error) {
          console.error("error", error);
          return res.status(404).json(jsonResponse(false, error, null));
        }

        if (!result.secure_url) {
          return res
            .status(404)
            .json(
              jsonResponse(
                false,
                "Something went wrong while uploading image. Try again",
                null
              )
            );
        }

        const newECategory = await prisma.eCategory.create({
          data: {
            userId: req.user.parentId ? req.user.parentId : req.user.id,
            name,
            text,
            image: result.secure_url,
            serial: parseInt(serial) || 0,
            createdBy: req.user.id,
            slug: `${slugify(user.name)}-${slugify(name)}`,
          },
        });

        if (newECategory) {
          return res
            .status(200)
            .json(jsonResponse(true, "ECategory has been created", newECategory));
        }
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get all ECategories
export const getECategories = async (req, res) => {
  try {
    const eCategories = await prisma.eCategory.findMany({
      where: {
        isDeleted: false,
        AND: [
          {
            name: {
              contains: req.query.name,
              mode: "insensitive",
            },
          },
        ],
      },
      include: { user: true },
      orderBy: {
        serial: "asc",
      },
      skip:
        req.query.limit && req.query.page
          ? parseInt(req.query.limit * (req.query.page - 1))
          : parseInt(defaultLimit() * (defaultPage() - 1)),
      take: req.query.limit
        ? parseInt(req.query.limit)
        : parseInt(defaultLimit()),
    });

    if (eCategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No eCategory is available", null));

    if (eCategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${eCategories.length} eCategories found`,
            eCategories
          )
        );
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "Something went wrong. Try again", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get single ECategory
export const getECategory = async (req, res) => {
  try {
    const eCategory = await prisma.eCategory.findFirst({
      where: { id: req.params.id, isDeleted: false },
    });

    if (eCategory) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 eCategory found`, eCategory));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No eCategory is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Update ECategory
export const updateECategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { name, serial } = req.body;

      const inputValidation = validateInput([name], ["Name"]);
      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      const findECategory = await tx.eCategory.findFirst({
        where: { id: req.params.id },
      });

      if (!findECategory)
        return res
          .status(404)
          .json(jsonResponse(false, "This eCategory does not exist", null));

      const user = await tx.user.findFirst({
        where: { id: findECategory.userId },
      });

      if (!user)
        return res
          .status(404)
          .json(jsonResponse(false, "This user does not exist", null));

      if (name) {
        if (name !== findECategory.name) {
          const existingECategory = await tx.eCategory.findFirst({
            where: {
              userId: req.user.parentId ? req.user.parentId : req.user.id,
              name: name,
              isDeleted: false,
            },
          });

          if (
            existingECategory &&
            existingECategory.slug === `${slugify(user.name)}-${slugify(name)}`
          ) {
            return res
              .status(409)
              .json(
                jsonResponse(
                  false,
                  `${name} already exists. Change its name.`,
                  null
                )
              );
          }
        }
      }

      if (req.file) {
        await uploadToCLoudinary(
          req.file,
          module_name,
          async (error, result) => {
            if (error) {
              console.error("error", error);
              return res.status(404).json(jsonResponse(false, error, null));
            }

            if (!result.secure_url) {
              return res
                .status(404)
                .json(
                  jsonResponse(
                    false,
                    "Something went wrong while uploading image. Try again",
                    null
                  )
                );
            }

            const eCategory = await prisma.eCategory.update({
              where: { id: req.params.id },
              data: {
                name,
                image: result.secure_url,
                serial: parseInt(serial) || findECategory.serial,
                updatedBy: req.user.id,
                slug: name
                  ? `${slugify(user.name)}-${slugify(name)}`
                  : findECategory.slug,
              },
            });

            await deleteFromCloudinary(
              findECategory.image,
              async (error, result) => {
                console.log("error", error);
                console.log("result", result);
              }
            );

            if (eCategory) {
              return res
                .status(200)
                .json(
                  jsonResponse(true, `ECategory has been updated`, eCategory)
                );
            } else {
              return res
                .status(404)
                .json(
                  jsonResponse(false, "ECategory has not been updated", null)
                );
            }
          }
        );
      } else {
        const eCategory = await prisma.eCategory.update({
          where: { id: req.params.id },
          data: {
            name,
            image: findECategory.image,
            serial: parseInt(serial) || findECategory.serial,
            updatedBy: req.user.id,
            slug: name
              ? `${slugify(user.name)}-${slugify(name)}`
              : findECategory.slug,
          },
        });

        if (eCategory) {
          return res
            .status(200)
            .json(jsonResponse(true, `ECategory has been updated`, eCategory));
        } else {
          return res
            .status(404)
            .json(jsonResponse(false, "ECategory has not been updated", null));
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Delete ECategory
export const deleteECategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const eCategory = await tx.eCategory.update({
        where: { id: req.params.id },
        data: { deletedBy: req.user.id, isDeleted: true },
      });

      if (eCategory) {
        await deleteFromCloudinary(eCategory.image, async (error, result) => {
          console.log("error", error);
          console.log("result", result);
        });

        return res
          .status(200)
          .json(jsonResponse(true, `ECategory has been deleted`, eCategory));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "ECategory has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
