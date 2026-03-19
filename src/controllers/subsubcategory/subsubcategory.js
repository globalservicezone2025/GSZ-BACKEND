import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import deleteFromCloudinary from "../../utils/deleteFromCloudinary.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import slugify from "../../utils/slugify.js";
import uploadToCLoudinary from "../../utils/uploadToCloudinary.js";
import validateInput from "../../utils/validateInput.js";
import { updateSubcategory } from "../subcategory/subcategory.js";
// import uploadImage from "../../utils/uploadImage.js";

const module_name = "subsubcategory";

//create subsubcategory
export const createSubsubcategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let {
        name, description, text, categoryId, subcategoryId, isActive, serial,
      } = req.body;

      // Validate input
      const inputValidation = validateInput(
        [name, categoryId, subcategoryId],
        ["Name", "Category", "Subcategory"]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      // Check if subsubcategory exists
      const subsubcategory = await tx.subsubcategory.findFirst({
        where: { slug: slugify(name) },
      });

      if (subsubcategory && subsubcategory?.slug === slugify(name)) {
        return res.status(409).json(
          jsonResponse(false, `${name} already exists. Please change it`, null)
        );
      }

      // Handle image upload
      let imageUrl = null;

      if (req.file) {
        const uploadedUrls = await updateSubcategory(req.file, module_name);

        if (!uploadedUrls || uploadedUrls.length === 0) {
          return res.status(400).json(
            jsonResponse(false, "Image upload failed. Try again.", null)
          );
        }

        imageUrl = uploadedUrls[0];
      }

      // Create subsubcategory
      const newSubsubcategory = await tx.subsubcategory.create({
        data: {
          name,
          description,
          text,
          isActive: isActive === "true",
          image: imageUrl,
          serial: parseInt(serial) || 0,
          slug: `${slugify(name)}`,
          category: {
            connect: { id: categoryId },
          },
          subcategory: {
            connect: { id: subcategoryId },
          },
        },
      });

      if (newSubsubcategory) {
        return res.status(200).json(
          jsonResponse(true, "Subsubcategory has been created", newSubsubcategory)
        );
      } else {
        return res.status(400).json(
          jsonResponse(false, "Subsubcategory has not been created", null)
        );
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};
//get all subsubcategories
export const getSubsubcategories = async (req, res) => {
  try {
    const subsubcategories = await prisma.subsubcategory.findMany({
      where: {
        isActive: true,
        AND: [
          {
            name: {
              contains: req.query.name,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        subcategory: true,
        category: true,
      },
      orderBy: {
        subCategoryId: "desc",
      },
      skip:
        req.query.limit && req.query.page
          ? parseInt(req.query.limit * (req.query.page - 1))
          : parseInt(defaultLimit() * (defaultPage() - 1)),
      take: req.query.limit
        ? parseInt(req.query.limit)
        : parseInt(defaultLimit()),
    });

    if (subsubcategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No subsubcategory is available", null));

    if (subsubcategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${subsubcategories.length} subsubcategories found`,
            subsubcategories
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

//get all subsubcategories by subcategory
export const getSubsubcategoriesBySubcategory = async (req, res) => {
  try {
    const subcategories = await prisma.subsubcategory.findMany({
      where: { subCategoryId: req.params.id, isActive: true },
      include: {
        subcategory: true,
      },
      orderBy: {
        serial: "asc",
      },
    });

    if (subcategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No subsubcategory is available", null));

    if (subcategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${subcategories.length} subsubcategories found`,
            subcategories
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

//get single subsubcategory
export const getSubsubcategory = async (req, res) => {
  try {
    const subsubcategory = await prisma.subsubcategory.findFirst({
      where: { slug: req.params.slug },
      include: {
        subcategory: true,
        category: true,
      },
    });

    if (subsubcategory) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 subsubcategory found`, subsubcategory));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No subsubcategory is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update subsubcategory
//update subsubcategory
export const updateSubsubcategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let {
        name,
        description,
        text,
        categoryId,
        subCategoryId,
        isActive,
        serial,
      } = req.body;

      //validate input
      const inputValidation = validateInput(
        [name, categoryId, subCategoryId],
        ["Name", "Category", "Subcategory"]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      const findSubsubcategory = await tx.subsubcategory.findFirst({
        where: { id: req.params.id },
      });

      if (!findSubsubcategory)
        return res
          .status(404)
          .json(
            jsonResponse(false, "This subsubcategory does not exist", null)
          );

      //check if slug already exists
      if (name) {
        if (
          name?.toLowerCase()?.trim() !==
          findSubsubcategory?.name?.toLowerCase()?.trim()
        ) {
          const existingSubsubcategory = await tx.subsubcategory.findFirst({
            where: {
              id: req.params.id,
            },
          });

          if (
            existingSubsubcategory &&
            existingSubsubcategory.name?.toLowerCase()?.trim() ===
              name?.toLowerCase()?.trim()
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

      //upload image
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

            //update subsubcategory
            const subsubcategory = await prisma.subsubcategory.update({
              where: { id: req.params.id },
              data: {
                name,
                description,
                text,
                categoryId,
                subCategoryId,
                isActive: isActive === "true" ? true : false,
                image: result.secure_url,
                serial: parseInt(serial) || findSubsubcategory.serial, // Parse serial to integer
                slug: name ? `${slugify(name)}` : findSubsubcategory.slug,
              },
            });

            //delete previous uploaded image
            await deleteFromCloudinary(
              findSubsubcategory.image,
              async (error, result) => {
                console.log("error", error);
                console.log("result", result);
              }
            );

            if (subsubcategory) {
              return res
                .status(200)
                .json(
                  jsonResponse(
                    true,
                    `Subsubcategory has been updated`,
                    subsubcategory
                  )
                );
            } else {
              return res
                .status(404)
                .json(
                  jsonResponse(
                    false,
                    "Subsubcategory has not been updated",
                    null
                  )
                );
            }
          }
        );
      } else {
        //if there is no image selected
        const subsubcategory = await prisma.subsubcategory.update({
          where: { id: req.params.id },
          data: {
            name,
            description,
            text,
            categoryId,
            subCategoryId,
            isActive: isActive === "true" ? true : false,
            image: findSubsubcategory.image,
            serial: parseInt(serial) || findSubsubcategory.serial, // Parse serial to integer
            slug: name ? `${slugify(name)}` : findSubsubcategory.slug,
          },
        });

        if (subsubcategory) {
          return res
            .status(200)
            .json(
              jsonResponse(
                true,
                `Subsubcategory has been updated`,
                subsubcategory
              )
            );
        } else {
          return res
            .status(404)
            .json(
              jsonResponse(false, "Subsubcategory has not been updated", null)
            );
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//delete subsubcategory
export const deleteSubsubcategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const subsubcategory = await tx.subsubcategory.update({
        where: { id: req.params.id },
        data: { isActive: false },
      });

      if (subsubcategory) {
        await deleteFromCloudinary(
          subsubcategory.image,
          async (error, result) => {
            console.log("error", error);
            console.log("result", result);
          }
        );

        return res
          .status(200)
          .json(
            jsonResponse(
              true,
              `Subsubcategory has been deleted`,
              subsubcategory
            )
          );
      } else {
        return res
          .status(404)
          .json(
            jsonResponse(false, "Subsubcategory has not been deleted", null)
          );
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//For Customer

//get all subcategories for customer
export const getSubsubcategoriesForCustomer = async (req, res) => {
  try {
    const subsubcategories = await prisma.subsubcategory.findMany({
      where: {
        isActive: true,
        AND: [
          {
            name: {
              contains: req.query.name,
              mode: "insensitive",
            },
          },
        ],
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

    if (subsubcategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No subsubcategory is available", null));

    if (subsubcategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${subsubcategories.length} subsubcategories found`,
            subsubcategories
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

//get single subsubcategory for customer
export const getSubsubcategoryForCustomer = async (req, res) => {
  try {
    const subsubcategory = await prisma.subsubcategory.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        subcategory: true,
        category: true,
      },
    });

    if (subsubcategory) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 subsubcategory found`, subsubcategory));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No subsubcategory is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//count total active subsubcategories
export const countActiveSubsubcategories = async (req, res) => {
  try {
    const count = await prisma.subsubcategory.count({
      where: {
        isActive: true,
      },
    });

    return res
      .status(200)
      .json(
        jsonResponse(true, "Total active subsubcategories count", { count })
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
