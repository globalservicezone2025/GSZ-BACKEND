import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import deleteFromCloudinary from "../../utils/deleteFromCloudinary.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import uploadToCLoudinary from "../../utils/uploadToCloudinary.js";
import validateInput from "../../utils/validateInput.js";
// import uploadImage from "../../utils/uploadImage.js";

const module_name = "slider";

//create slider
export const createSlider = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let { title, subtitle, url, isActive } = req.body;

      //validate input
      const inputValidation = validateInput(
        [title, subtitle, url],
        ["Title", "Subtitle", "URL"]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      const slider = await tx.photoSlider.findFirst({
        where: {
          title: title,
        },
      });

      if (
        slider &&
        slider?.title?.toLowerCase()?.trim() === title?.toLowerCase()?.trim()
      )
        return res
          .status(409)
          .json(jsonResponse(false, `${title} already exists.`, null));

      //if there is no image selected
      if (!req.file) {
        // return res
        //   .status(400)
        //   .json(jsonResponse(false, "Please select an image", null));
        //create brand
        const newSlider = await prisma.photoSlider.create({
          data: {
            title,
            subtitle,
            url,
            isActive: isActive === "true" ? true : false,
            // slug: `${slugify(name)}`,
          },
        });

        if (newSlider) {
          return res
            .status(200)
            .json(jsonResponse(true, "Slider has been created", newSlider));
        }
      }

      //upload image
      // const imageUpload = await uploadImage(req.file);
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

        //create slider
        const newSlider = await prisma.photoSlider.create({
          data: {
            title,
            subtitle,
            url,
            isActive: isActive === "true" ? true : false,
            image: result.secure_url,
            // slug: `${slugify(name)}`,
          },
        });

        if (newSlider) {
          return res
            .status(200)
            .json(jsonResponse(true, "Slider has been created", newSlider));
        }
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all sliders
export const getSliders = async (req, res) => {
  //   if (req.user.roleName !== "super-admin") {
  //     getCategoriesByUser(req, res);
  //   } else {
  try {
    const sliders = await prisma.photoSlider.findMany({
      where: {
        AND: [
          {
            title: {
              contains: req.query.title,
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

    if (sliders.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No slider is available", null));

    if (sliders) {
      return res
        .status(200)
        .json(jsonResponse(true, `${sliders.length} sliders found`, sliders));
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

export const getSlider = async (req, res) => {
  try {
    const slider = await prisma.photoSlider.findFirst({
      //   where: { slug: req.params.slug },
      where: { id: req.params.id },
      //   include: {
      //     serviceItem: true,
      //     serviceManufacturer: true,
      //     serviceModel: true,
      //   },
    });

    if (slider) {
      return res.status(200).json(jsonResponse(true, `1 slider found`, slider));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No slider is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update slider
export const updateSlider = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let { title, subtitle, url, isActive } = req.body;

      //validate input
      const inputValidation = validateInput(
        [title, subtitle, url],
        ["Title", "Subtitle", "URL"]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //get user id from brand and user name from user for slugify
      const findSlider = await tx.photoSlider.findFirst({
        where: { id: req.params.id },
      });

      if (!findSlider)
        return res
          .status(404)
          .json(jsonResponse(false, "This slider does not exist", null));

      //check if slug already exists
      if (title) {
        if (
          title?.toLowerCase()?.trim() !==
          findSlider?.title?.toLowerCase()?.trim()
        ) {
          const existingSlider = await tx.photoSlider.findFirst({
            where: {
              id: req.params.id,
            },
          });

          //   if (existingSlider && existingSlider.slug === `${slugify(name)}`) {
          if (
            existingSlider &&
            existingSlider.title?.toLowerCase()?.trim() ===
              title?.toLowerCase()?.trim()
          ) {
            return res
              .status(409)
              .json(
                jsonResponse(
                  false,
                  `${title} already exists. Change its name.`,
                  null
                )
              );
          }
        }
      }

      //upload image
      // let imageUpload;
      if (req.file) {
        // imageUpload = await uploadImage(req.file);
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

            //update slider
            const slider = await prisma.photoSlider.update({
              where: { id: req.params.id },
              data: {
                title,
                subtitle,
                url,
                isActive: isActive === "true" ? true : false,
                image: result.secure_url,
                // slug: name ? `${slugify(name)}` : findBrand.slug,
              },
            });

            //delete previous uploaded image
            await deleteFromCloudinary(
              findSlider.image,
              async (error, result) => {
                console.log("error", error);
                console.log("result", result);
              }
            );

            if (slider) {
              return res
                .status(200)
                .json(jsonResponse(true, `Slider has been updated`, slider));
            } else {
              return res
                .status(404)
                .json(jsonResponse(false, "Slider has not been updated", null));
            }
          }
        );
      } else {
        //if there is no image selected
        //update category
        const slider = await prisma.photoSlider.update({
          where: { id: req.params.id },
          data: {
            title,
            subtitle,
            url,
            isActive: isActive === "true" ? true : false,
            image: findSlider.image,
            // slug: name ? `${slugify(name)}` : findBrand.slug,
          },
        });

        if (slider) {
          return res
            .status(200)
            .json(jsonResponse(true, `Slider has been updated`, slider));
        } else {
          return res
            .status(404)
            .json(jsonResponse(false, "Slider has not been updated", null));
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

export const deleteSlider = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const slider = await tx.photoSlider.delete({
        where: { id: req.params.id },
      });

      if (slider) {
        // fs.unlinkSync(
        //   `public\\images\\${module_name}\\${category.image.split("/")[2]}`
        // );
        await deleteFromCloudinary(slider.image, async (error, result) => {
          console.log("error", error);
          console.log("result", result);
        });

        return res
          .status(200)
          .json(jsonResponse(true, `Slider has been deleted`, slider));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Slider has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//For Customer

//get all sliders for customer
export const getSlidersForCustomer = async (req, res) => {
  try {
    const sliders = await prisma.photoSlider.findMany({
      where: {
        isActive: true,
        AND: [
          {
            title: {
              contains: req.query.title,
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

    if (sliders.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No slider is available", null));

    if (sliders) {
      return res
        .status(200)
        .json(jsonResponse(true, `${sliders.length} sliders found`, sliders));
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

//get single slider for customer
export const getSliderForCustomer = async (req, res) => {
  try {
    const slider = await prisma.photoSlider.findFirst({
      where: {
        // slug: req.params.slug,
        id: req.params.id,
      },
    });

    if (slider) {
      return res.status(200).json(jsonResponse(true, `1 slider found`, slider));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No slider is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
