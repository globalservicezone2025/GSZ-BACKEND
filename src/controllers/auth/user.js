import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import uploadToCLoudinary from "../../utils/uploadToCloudinary.js";
import deleteFromCloudinary from "../../utils/deleteFromCloudinary.js";
import validateInput from "../../utils/validateInput.js";

const module_name = "user";

//get all users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
        AND: [
          {
            name: {
              contains: req.query.name || "",
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: req.query.email || "",
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: req.query.phone || "",
              mode: "insensitive",
            },
          },
          {
            address: {
              contains: req.query.address || "",
              mode: "insensitive",
            },
          },
          {
            isActive: req.query.active
              ? req.query.active.toLowerCase() === "active"
                ? true
                : false
              : true,
          },
        ],
      },
      include: {
        role: { include: { roleModules: true } },
        campaigns: true,
        suppliers: true,
        payments: true,
        categories: true,
        wishlist: true,
        review: true,
        order: true,
        preorder: true,
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

    if (users.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No user is available", null));

    if (users) {
      return res
        .status(200)
        .json(jsonResponse(true, `${users.length} users found`, users));
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

//get all users by users
export const getUsersByUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        parentId: req.user.id,
        isDeleted: false,
        AND: [
          {
            name: {
              contains: req.query.name,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: req.query.email,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: req.query.phone,
            },
          },
          {
            address: {
              contains: req.query.address,
              mode: "insensitive",
            },
          },
          {
            isActive: req.query.active
              ? req.query.active.toLowerCase() === "active"
                ? true
                : false
              : true,
          },
        ],
      },
      include: {
        role: { include: { roleModules: true } },
        products: true,
        campaigns: true,
        suppliers: true,
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

    if (users.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No user is available", null));

    if (users) {
      return res
        .status(200)
        .json(jsonResponse(true, `${users.length} users found`, users));
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

//get single user
export const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, isDeleted: false },
    });

    if (user) {
      return res.status(200).json(jsonResponse(true, `1 user found`, user));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No user is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update user
export const updateUser = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const {
        roleId,
        name,
        email,
        phone,
        address,
        billingAddress,
        city,
        country,
        postalCode,
        initialPaymentAmount,
        initialPaymentDue,
        installmentTime,
        designation,
      } = req.body;

      //validate input
      const inputValidation = validateInput(
        [name, email, phone, address],
        ["Name", "Email", "Phone", "Address"]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      // Find the user to be updated
      const findUser = await tx.user.findFirst({
        where: { id: req.params.id },
      });

      if (!findUser) {
        return res
          .status(404)
          .json(jsonResponse(false, "User not found", null));
      }

      // Handle image upload
      let imageUrl = findUser.image;
      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          uploadToCLoudinary(req.file, module_name, (error, result) => {
            if (error) {
              console.error("error", error);
              return reject(
                res.status(404).json(jsonResponse(false, error, null))
              );
            }

            if (!result.secure_url) {
              return reject(
                res
                  .status(404)
                  .json(
                    jsonResponse(
                      false,
                      "Something went wrong while uploading image. Try again",
                      null
                    )
                  )
              );
            }

            resolve(result);
          });
        });

        imageUrl = result.secure_url;

        // Delete previous uploaded image
        if (findUser.image && findUser.image !== "images/user/user.png") {
          await deleteFromCloudinary(findUser.image, (error, result) => {
            if (error) {
              console.log("Error deleting previous image:", error);
            }
          });
        }
      }

      // Update user
      const updateUser = await tx.user.update({
        where: { id: req.params.id },
        data: {
          roleId,
          name,
          email,
          phone,
          address,
          billingAddress,
          designation,
          city,
          country,
          postalCode,
          image: imageUrl,
          initialPaymentAmount: initialPaymentAmount
            ? parseFloat(initialPaymentAmount)
            : null, // Parse to float or set to null
          initialPaymentDue: initialPaymentDue
            ? parseFloat(initialPaymentDue)
            : null, // Parse to float or set to null
          installmentTime: installmentTime
            ? parseFloat(installmentTime)
            : null, // Parse to float or set to null
          updatedBy: req.user.id,
        },
      });

      if (updateUser) {
        return res
          .status(200)
          .json(jsonResponse(true, `Profile has been updated.`, updateUser));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Profile has not been updated", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//ban user
export const banUser = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      //ban user
      const getUser = await tx.user.findFirst({
        where: { id: req.params.id },
      });

      const user = await tx.user.update({
        where: { id: req.params.id },
        data: {
          isActive: getUser.isActive === true ? false : true,
        },
      });

      if (user) {
        return res
          .status(200)
          .json(jsonResponse(true, `User has been banned`, user));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "User has not been banned", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//delete user
export const deleteUser = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: req.params.id },
        data: { deletedBy: req.user.id, isDeleted: true },
      });

      if (user) {
        return res
          .status(200)
          .json(jsonResponse(true, `User has been deleted`, user));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "User has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
