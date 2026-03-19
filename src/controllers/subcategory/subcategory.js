import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import deleteFromCloudinary from "../../utils/deleteFromCloudinary.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import slugify from "../../utils/slugify.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import uploadToCLoudinary from "../../utils/uploadToCloudinary.js";
import validateInput from "../../utils/validateInput.js";
// import uploadImage from "../../utils/uploadImage.js";

const module_name = "subcategory";

//create subcategory
export const createSubcategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let { name, text, description, categoryId, isActive, serial } = req.body;

      // Validate input
      const inputValidation = validateInput(
        [name, categoryId],
        ["Name", "Category"]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      // Check if subcategory exists
      const subcategory = await tx.subcategory.findFirst({
        where: { slug: slugify(name) },
      });

      if (subcategory && subcategory?.slug === slugify(name)) {
        return res.status(409).json(
          jsonResponse(false, `${name} already exists. Please change it`, null)
        );
      }

      // Handle image upload
      let imageUrl = null;

      if (req.file) {
        const uploadedUrls = await uploadToCloudinary(req.file, module_name);

        if (!uploadedUrls || uploadedUrls.length === 0) {
          return res.status(400).json(
            jsonResponse(false, "Image upload failed. Try again.", null)
          );
        }

        imageUrl = uploadedUrls[0];
      }

      // Create subcategory
      const newSubcategory = await tx.subcategory.create({
        data: {
          name,
          text,
          description,
          categoryId,
          isActive: isActive === "true",
          image: imageUrl,
          serial: parseInt(serial) || 0,
          slug: `${slugify(name)}`,
        },
      });

      if (newSubcategory) {
        return res.status(200).json(
          jsonResponse(true, "Subcategory has been created", newSubcategory)
        );
      } else {
        return res.status(400).json(
          jsonResponse(false, "Subcategory has not been created", null)
        );
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};
//get all subcategories
export const getSubcategories = async (req, res) => {
  try {
    const subcategories = await prisma.subcategory.findMany({
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
        category: true,
      },
      orderBy: {
        categoryId: "asc",
      },
      skip:
        req.query.limit && req.query.page
          ? parseInt(req.query.limit * (req.query.page - 1))
          : parseInt(defaultLimit() * (defaultPage() - 1)),
      take: req.query.limit
        ? parseInt(req.query.limit)
        : parseInt(defaultLimit()),
    });

    if (subcategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No subcategory is available", null));

    if (subcategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${subcategories.length} subcategories found`,
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
  //   }
};

//get all subcategories by category
export const getSubcategoriesByCategory = async (req, res) => {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId: req.params.id, isActive: true },
      include: {
        category: true,
      },
      orderBy: {
        serial: "asc",
      },
    });

    if (subcategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No subcategory is available", null));

    if (subcategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${subcategories.length} subcategories found`,
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
  //   }
};

//get single subcategory
export const getSubcategory = async (req, res) => {
  try {
    const subcategory = await prisma.subcategory.findFirst({
      // where: { slug: req.params.slug },
      where: { id: req.params.id },
      include: {
        category: true,
      },
    });

    if (subcategory) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 subcategory found`, subcategory));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No subcategory is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update subcategory
export const updateSubcategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let { name, categoryId, isActive, serial } = req.body;

      //validate input
      const inputValidation = validateInput(
        [name, categoryId],
        ["Name", "Category"]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //get user id from brand and user name from user for slugify
      const findSubcategory = await tx.subcategory.findFirst({
        where: { id: req.params.id },
      });

      if (!findSubcategory)
        return res
          .status(404)
          .json(jsonResponse(false, "This subcategory does not exist", null));

      //check if slug already exists
      if (name) {
        if (
          name?.toLowerCase()?.trim() !==
          findSubcategory?.name?.toLowerCase()?.trim()
        ) {
          const existingSubcategory = await tx.subcategory.findFirst({
            where: {
              id: req.params.id,
            },
          });

          if (
            existingSubcategory &&
            existingSubcategory.name?.toLowerCase()?.trim() ===
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

            //update subcategory
            const subcategory = await prisma.subcategory.update({
              where: { id: req.params.id },
              data: {
                name,
                categoryId,
                isActive: isActive === "true" ? true : false,
                image: result.secure_url,
                serial: parseInt(serial) || findSubcategory.serial, // Parse serial to integer
                slug: name ? `${slugify(name)}` : findSubcategory.slug,
              },
            });

            //delete previous uploaded image
            await deleteFromCloudinary(
              findSubcategory.image,
              async (error, result) => {
                console.log("error", error);
                console.log("result", result);
              }
            );

            if (subcategory) {
              return res
                .status(200)
                .json(
                  jsonResponse(
                    true,
                    `Subcategory has been updated`,
                    subcategory
                  )
                );
            } else {
              return res
                .status(404)
                .json(
                  jsonResponse(false, "Subcategory has not been updated", null)
                );
            }
          }
        );
      } else {
        //if there is no image selected
        //update category
        const subcategory = await prisma.subcategory.update({
          where: { id: req.params.id },
          data: {
            name,
            categoryId,
            isActive: isActive === "true" ? true : false,
            image: findSubcategory.image,
            serial: parseInt(serial) || findSubcategory.serial, // Parse serial to integer
            slug: name ? `${slugify(name)}` : findSubcategory.slug,
          },
        });

        if (subcategory) {
          return res
            .status(200)
            .json(
              jsonResponse(true, `Subcategory has been updated`, subcategory)
            );
        } else {
          return res
            .status(404)
            .json(
              jsonResponse(false, "Subcategory has not been updated", null)
            );
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const subcategory = await tx.subcategory.update({
        where: { id: req.params.id },
        data: { isActive: false }, // Set isActive to false
      });

      if (subcategory) {
        await deleteFromCloudinary(subcategory.image, async (error, result) => {
          console.log("error", error);
          console.log("result", result);
        });

        return res
          .status(200)
          .json(
            jsonResponse(true, `Subcategory has been deleted`, subcategory)
          );
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Subcategory has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//For Customer

//get all subcategories for customer
export const getSubcategoriesForCustomer = async (req, res) => {
  try {
    const subcategories = await prisma.subcategory.findMany({
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
      //   include: {
      //     serviceItem: true,
      //     serviceManufacturer: true,
      //     serviceModel: true,
      //   },
      //   select: {
      //     user: { select: { name: true, image: true } },
      //     id: true,
      //     name: true,
      //     image: true,
      //     slug: true,
      //     createdAt: true,
      //   },
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

    if (subcategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No subcategory is available", null));

    if (subcategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${subcategories.length} subcategories found`,
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

//get single subcategory for customer
export const getSubcategoryForCustomer = async (req, res) => {
  try {
    const subcategory = await prisma.subcategory.findFirst({
      where: {
        // slug: req.params.slug,
        id: req.params.id,
      },
      //   include: {
      //     serviceItem: true,
      //     serviceManufacturer: true,
      //     serviceModel: true,
      //   },
      //   select: {
      //     user: { select: { name: true, image: true } },
      //     id: true,
      //     name: true,
      //     image: true,
      //     slug: true,
      //     createdAt: true,
      //   },
    });

    if (subcategory) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 subcategory found`, subcategory));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No subcategory is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//count total active subcategories
export const countActiveSubcategories = async (req, res) => {
  try {
    const count = await prisma.subcategory.count({
      where: {
        isActive: true,
      },
    });

    return res
      .status(200)
      .json(jsonResponse(true, "Total active subcategories count", { count }));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
