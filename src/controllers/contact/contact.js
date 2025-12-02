import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import validateInput from "../../utils/validateInput.js";
// import uploadImage from "../../utils/uploadImage.js";

const module_name = "contact";

//create contact
export const createContact = async (req, res) => {
  try {
    return await prisma.$transaction(
      async (tx) => {
        let {
          firstName,
          lastName,
          email,
          country,
          phoneNumber,
          hearFrom,
          date,
          toDate, // New field
          time,
          description,
          subSubServiceId,
          isFreeContact, // New field
        } = req.body;

        // Validate input
        const inputValidation = validateInput(
          [
            firstName,
            lastName,
            email,
            country,
            phoneNumber,
            hearFrom,
            date,
            time,
            description,
          ],
          [
            "First Name",
            "Last Name",
            "Email",
            "Country",
            "Phone Number",
            "Hear From",
            "Date",
            "Time",
            "Description",
          ]
        );

        if (inputValidation) {
          return res
            .status(400)
            .json(jsonResponse(false, inputValidation, null));
        }

        // Check if subServiceId exists if isFreeContact is false
        if (!isFreeContact) {
          const subService = await tx.subsubcategory.findUnique({
            where: { id: subSubServiceId },
          });

          if (!subService) {
            return res
              .status(404)
              .json(jsonResponse(false, "Sub Service ID does not exist", null));
          }
        }

        // Create new contact
        const newContact = await tx.contact.create({
          data: {
            firstName,
            lastName,
            email,
            country,
            phoneNumber,
            hearFrom,
            date,
            toDate, // New field
            time,
            description,
            subSubServiceId: subSubServiceId, // Set subSubServiceId to null if isFreeContact is true
            isFreeContact: isFreeContact || false, // Default to false if not provided
          },
        });

        if (newContact) {
          return res
            .status(200)
            .json(jsonResponse(true, "Contact has been created.", newContact));
        }
      },
      { timeout: 10000 } // Increase the timeout to 10 seconds
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all contacts
export const getContacts = async (req, res) => {
  try {
    const filters = {
      AND: [
        {
          email: {
            contains: req.query.email,
            mode: "insensitive",
          },
        },
        {
          firstName: {
            contains: req.query.firstName,
            mode: "insensitive",
          },
        },
      ],
    };

    if (req.query.isFreeContact !== undefined) {
      filters.AND.push({
        isFreeContact: req.query.isFreeContact === "true",
      });
    }

    const contacts = await prisma.contact.findMany({
      where: filters,
      include: {
        subsubcategory: {
          select: {
            name: true,
          },
        },
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

    if (contacts.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No message is available", null));

    if (contacts) {
      return res
        .status(200)
        .json(
          jsonResponse(true, `${contacts.length} messages found`, contacts)
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

//get all manufacturers by user
// export const getManufacturersByUser = async (req, res) => {
//   try {
//     const categories = await prisma.category.findMany({
//       where: {
//         userId: req.user.parentId ? req.user.parentId : req.user.id,
//         isDeleted: false,
//         AND: [
//           {
//             name: {
//               contains: req.query.name,
//               mode: "insensitive",
//             },
//           },
//         ],
//       },
//       include: { user: true },
//       orderBy: {
//         createdAt: "desc",
//       },
//       skip:
//         req.query.limit && req.query.page
//           ? parseInt(req.query.limit * (req.query.page - 1))
//           : parseInt(defaultLimit() * (defaultPage() - 1)),
//       take: req.query.limit
//         ? parseInt(req.query.limit)
//         : parseInt(defaultLimit()),
//     });

//     if (categories.length === 0)
//       return res
//         .status(200)
//         .json(jsonResponse(true, "No category is available", null));

//     if (categories) {
//       return res
//         .status(200)
//         .json(
//           jsonResponse(
//             true,
//             `${categories.length} categories found`,
//             categories
//           )
//         );
//     } else {
//       return res
//         .status(404)
//         .json(jsonResponse(false, "Something went wrong. Try again", null));
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(jsonResponse(false, error, null));
//   }
// };

//get single newsletter
export const getContact = async (req, res) => {
  try {
    const newsletter = await prisma.contact.findFirst({
      //   where: { slug: req.params.slug },
      where: { id: req.params.id },
      //   include: {
      //     serviceItem: true,
      //     serviceManufacturer: true,
      //     serviceModel: true,
      //   },
    });

    if (newsletter) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 contact found`, newsletter));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No contact is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update contact
export const updateContact = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let {
        firstName,
        lastName,
        email,
        country,
        phoneNumber,
        hearFrom,
        date,
        toDate, // New field
        time,
        description,
        subSubServiceId,
        isFreeContact, // New field
      } = req.body;

      // Validate input
      const inputValidation = validateInput(
        [
          firstName,
          lastName,
          email,
          country,
          phoneNumber,
          hearFrom,
          date,
          time,
          description,
        ],
        [
          "First Name",
          "Last Name",
          "Email",
          "Country",
          "Phone Number",
          "Hear From",
          "Date",
          "Time",
          "Description",
        ]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      // Check if subServiceId exists if isFreeContact is false
      if (!isFreeContact) {
        const subService = await tx.subsubcategory.findUnique({
          where: { id: subSubServiceId },
        });

        if (!subService) {
          return res
            .status(404)
            .json(jsonResponse(false, "Sub Service ID does not exist", null));
        }
      }

      // Update contact
      const updatedContact = await tx.contact.update({
        where: { id: req.params.id },
        data: {
          firstName,
          lastName,
          email,
          country,
          phoneNumber,
          hearFrom,
          date,
          toDate, // New field
          time,
          description,
          subSubServiceId: subSubServiceId, // Set subSubServiceId to null if isFreeContact is true
          isFreeContact: isFreeContact || false, // Default to false if not provided
        },
      });

      if (updatedContact) {
        return res
          .status(200)
          .json(
            jsonResponse(true, "Contact has been updated.", updatedContact)
          );
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//ban category
// export const banCategory = async (req, res) => {
//   try {
//     return await prisma.$transaction(async (tx) => {
//       //ban category
//       const getCategory = await tx.category.findFirst({
//         where: { id: req.params.id },
//       });

//       const category = await tx.category.update({
//         where: { id: req.params.id },
//         data: {
//           isActive: getCategory.isActive === true ? false : true,
//         },
//       });

//       if (category) {
//         return res
//           .status(200)
//           .json(jsonResponse(true, `Category has been banned`, category));
//       } else {
//         return res
//           .status(404)
//           .json(jsonResponse(false, "Category has not been banned", null));
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(jsonResponse(false, error, null));
//   }
// };

//delete newsletter
export const deleteContact = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const newsletter = await tx.contact.delete({
        where: { id: req.params.id },
      });

      if (newsletter) {
        // fs.unlinkSync(
        //   `public\\images\\${module_name}\\${category.image.split("/")[2]}`
        // );
        // await deleteFromCloudinary(banner.image, async (error, result) => {
        //   console.log("error", error);
        //   console.log("result", result);
        // });

        return res
          .status(200)
          .json(
            jsonResponse(true, `Contact message has been deleted`, newsletter)
          );
      } else {
        return res
          .status(404)
          .json(
            jsonResponse(false, "Contact message has not been deleted", null)
          );
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//For Customer

//get all coupons for customer
// export const getCouponsForCustomer = async (req, res) => {
//   try {
//     const coupons = await prisma.coupon.findMany({
//       where: {
//         isActive: true,
//         AND: [
//           {
//             code: {
//               contains: req.query.code,
//               mode: "insensitive",
//             },
//           },
//         ],
//       },
//       //   include: {
//       //     serviceItem: true,
//       //     serviceManufacturer: true,
//       //     serviceModel: true,
//       //   },
//       //   select: {
//       //     user: { select: { name: true, image: true } },
//       //     id: true,
//       //     name: true,
//       //     image: true,
//       //     slug: true,
//       //     createdAt: true,
//       //   },
//       orderBy: {
//         createdAt: "desc",
//       },
//       skip:
//         req.query.limit && req.query.page
//           ? parseInt(req.query.limit * (req.query.page - 1))
//           : parseInt(defaultLimit() * (defaultPage() - 1)),
//       take: req.query.limit
//         ? parseInt(req.query.limit)
//         : parseInt(defaultLimit()),
//     });

//     if (coupons.length === 0)
//       return res
//         .status(200)
//         .json(jsonResponse(true, "No coupon is available", null));

//     if (coupons) {
//       return res
//         .status(200)
//         .json(jsonResponse(true, `${coupons.length} coupons found`, coupons));
//     } else {
//       return res
//         .status(404)
//         .json(jsonResponse(false, "Something went wrong. Try again", null));
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(jsonResponse(false, error, null));
//   }
// };

//get single coupon for customer
// export const getCouponForCustomer = async (req, res) => {
//   try {
//     const coupon = await prisma.coupon.findFirst({
//       where: {
//         // slug: req.params.slug,
//         code: req.params.id,
//         isActive: true,
//       },
//       //   include: {
//       //     serviceItem: true,
//       //     serviceManufacturer: true,
//       //     serviceModel: true,
//       //   },
//       //   select: {
//       //     user: { select: { name: true, image: true } },
//       //     id: true,
//       //     name: true,
//       //     image: true,
//       //     slug: true,
//       //     createdAt: true,
//       //   },
//     });

//     if (coupon) {
//       return res
//         .status(200)
//         .json(jsonResponse(true, `Coupon is added`, coupon));
//     } else {
//       return res
//         .status(404)
//         .json(jsonResponse(false, "No coupon is available", null));
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(jsonResponse(false, error, null));
//   }
// };

//count total active contacts
export const countActiveContacts = async (req, res) => {
  try {
    const filters = {};

    if (req.query.isFreeContact !== undefined) {
      filters.isFreeContact = req.query.isFreeContact === "true";
    }

    const count = await prisma.contact.count({
      where: filters,
    });

    return res
      .status(200)
      .json(jsonResponse(true, "Total active contacts count", { count }));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
