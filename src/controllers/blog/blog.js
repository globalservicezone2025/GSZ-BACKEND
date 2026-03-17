import prisma from "../../utils/prismaClient.js";
import jsonResponse from "../../utils/jsonResponse.js";
import validateInput from "../../utils/validateInput.js";
import uploadToCLoudinary from "../../utils/uploadToCloudinary.js";
import deleteFromCloudinary from "../../utils/deleteFromCloudinary.js";

const module_name = "blog";

// Create Blog
// export const createBlog = async (req, res) => {
//   try {
//     return await prisma.$transaction(async (tx) => {
//       const { title, description, mainTopic, tags, socialMediaLinks } =
//         req.body;

//       // Validate input
//       const inputValidation = validateInput(
//         [title, mainTopic],
//         ["Title", "Main Topic"]
//       );

//       if (inputValidation) {
//         return res.status(400).json(jsonResponse(false, inputValidation, null));
//       }

//       //if there is no image selected
//       if (!req.file) {
//         //create category
//         const newBlog = await prisma.category.create({
//           data: {
//             title,
//             description,
//             image: null,
//             mainTopic,
//             tags,
//             socialMediaLinks: JSON.parse(socialMediaLinks),
//             authorId: req.user.id,
//           },
//         });

//         if (newBlog) {
//           return res
//             .status(200)
//             .json(jsonResponse(true, "Blog has been created", newCategory));
//         }
//       }

//       //upload image
//       // const imageUpload = await uploadImage(req.file);
//       await uploadToCLoudinary(req.file, module_name, async (error, result) => {
//         if (error) {
//           console.error("error", error);
//           return res.status(404).json(jsonResponse(false, error, null));
//         }

//         if (!result.secure_url) {
//           return res
//             .status(404)
//             .json(
//               jsonResponse(
//                 false,
//                 "Something went wrong while uploading image. Try again",
//                 null
//               )
//             );
//         }

//         //create category
//         const newBlog = await prisma.blog.create({
//           data: {
//             title,
//             description,
//             image: result.secure_url,
//             mainTopic,
//             tags,
//             socialMediaLinks: JSON.parse(socialMediaLinks),
//             authorId: req.user.id,
//           },
//         });

//         if (newBlog) {
//           return res
//             .status(200)
//             .json(jsonResponse(true, "Blog has been created", newBlog));
//         }
//       });
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(jsonResponse(false, error, null));
//   }
// };

export const createBlog = async (req, res) => {
  try {
    const { title, description, mainTopic, tags, socialMediaLinks } = req.body;

    const inputValidation = validateInput(
      [title, mainTopic],
      ["Title", "Main Topic"]
    );
    if (inputValidation) {
      return res.status(400).json(jsonResponse(false, inputValidation, null));
    }

    let parsedTags = [];
    let parsedSocialMediaLinks = {};

    try {
      parsedTags = tags ? JSON.parse(tags) : [];
    } catch {
      return res.status(400).json(jsonResponse(false, "Invalid tags format", null));
    }

    try {
      parsedSocialMediaLinks = socialMediaLinks ? JSON.parse(socialMediaLinks) : {};
    } catch {
      return res.status(400).json(jsonResponse(false, "Invalid social media links format", null));
    }

    // Image upload কে Promise-এ wrap করো
    let imageUrl = null;

    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        uploadToCLoudinary(req.file, module_name, (error, result) => {
          if (error) return reject(new Error("Image upload failed"));
          if (!result?.secure_url) return reject(new Error("Image upload failed, try again"));
          resolve(result.secure_url);
        });
      });
    }

    const newBlog = await prisma.blog.create({
      data: {
        title,
        description,
        image: imageUrl,
        mainTopic,
        tags: parsedTags,
        socialMediaLinks: parsedSocialMediaLinks,
        authorId: req.user.id,
      },
    });

    return res.status(200).json(jsonResponse(true, "Blog has been created", newBlog));

  } catch (error) {
    console.error("Create blog error:", error);
    return res.status(500).json(jsonResponse(false, error?.message || "Internal server error", null));
  }
};









// Update Blog
export const updateBlog = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { title, description, mainTopic, tags, socialMediaLinks } =
        req.body;

      // Validate input
      const inputValidation = validateInput(
        [title, mainTopic],
        ["Title", "Main Topic"]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      // Find the blog to be updated
      const findBlog = await tx.blog.findFirst({
        where: { id: req.params.id },
      });

      if (!findBlog) {
        return res
          .status(404)
          .json(jsonResponse(false, "Blog not found", null));
      }

      // Handle image upload
      let imageUrl = findBlog.image;
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

            imageUrl = result.secure_url;

            // Delete previous uploaded image
            if (findBlog.image) {
              await deleteFromCloudinary(
                findBlog.image,
                async (error, result) => {
                  console.log("error", error);
                  console.log("result", result);
                }
              );
            }
          }
        );
      }

      // Update blog
      const updatedBlog = await tx.blog.update({
        where: { id: req.params.id },
        data: {
          title,
          description,
          image: imageUrl,
          mainTopic,
          tags,
          socialMediaLinks: JSON.parse(socialMediaLinks),
          updatedBy: req.user.id,
        },
      });

      if (updatedBlog) {
        return res
          .status(200)
          .json(jsonResponse(true, "Blog has been updated", updatedBlog));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Blog has not been updated", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // Find the blog to be deleted
      const findBlog = await tx.blog.findFirst({
        where: { id: req.params.id },
      });

      if (!findBlog) {
        return res
          .status(404)
          .json(jsonResponse(false, "Blog not found", null));
      }

      // Delete the blog
      const deletedBlog = await tx.blog.delete({
        where: { id: req.params.id },
      });

      if (deletedBlog) {
        // Delete the blog image from Cloudinary
        if (findBlog.image) {
          await deleteFromCloudinary(findBlog.image, async (error, result) => {
            console.log("error", error);
            console.log("result", result);
          });
        }

        return res
          .status(200)
          .json(jsonResponse(true, "Blog has been deleted", deletedBlog));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Blog has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get All Blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
            image: true,
          },
        },
      },
    });

    if (blogs.length === 0) {
      return res
        .status(200)
        .json(jsonResponse(true, "No blogs available", null));
    }

    return res
      .status(200)
      .json(jsonResponse(true, `${blogs.length} blogs found`, blogs));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// Get Blog by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
            image: true,
          },
        },
      },
    });

    if (!blog) {
      return res.status(404).json(jsonResponse(false, "Blog not found", null));
    }

    return res.status(200).json(jsonResponse(true, "Blog found", blog));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
