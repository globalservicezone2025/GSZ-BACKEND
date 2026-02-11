import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import validateInput from "../../utils/validateInput.js";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";

const module_name = "jobApplication";

// Create job application
export const createJobApplication = async (req, res) => {
  try {
    const { name, email, number, description, careerId } = req.body;

    // If a file is uploaded via multipart/form-data, upload it to Cloudinary
    let file = req.body.file;
    if (req.file) {
      // upload raw/doc/pdf; use resource_type 'auto' or 'raw' so non-images are accepted
      const bufferToStream = (buffer) => {
        const readable = new Readable({
          read() {
            this.push(buffer);
            this.push(null);
          },
        });
        return readable;
      };

      const uploadFromBuffer = (buffer, folder) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "raw" }, // store as raw so pdf/doc are preserved
            (error, result) => {
              if (error) reject(error);
              else resolve(result?.secure_url);
            }
          );
          bufferToStream(buffer).pipe(stream);
        });

      try {
        const uploadedUrl = await uploadFromBuffer(req.file.buffer, "jobapplications");
        if (uploadedUrl) file = uploadedUrl;
      } catch (uploadErr) {
        console.log("File upload error:", uploadErr);
        return res.status(500).json(jsonResponse(false, "File upload failed", null));
      }
    }

    // Validate input (require name, email, number, careerId)
    const inputValidation = validateInput(
      [name, email, number, careerId],
      ["Name", "Email", "Number", "Career ID"],
    );

    if (inputValidation) {
      return res.status(400).json(jsonResponse(false, inputValidation, null));
    }

    // Ensure career exists and is not deleted
    const career = await prisma.career.findFirst({
      where: { id: careerId, isDeleted: false },
    });

    if (!career) {
      return res
        .status(404)
        .json(jsonResponse(false, "Career not found", null));
    }

    const application = await prisma.jobApplication.create({
      data: {
        name,
        email,
        number,
        description,
        file,
        careerId,
        createdBy: req.user?.id,
      },
    });

    if (application) {
      return res
        .status(201)
        .json(
          jsonResponse(true, "Application submitted successfully", application),
        );
    }

    return res
      .status(400)
      .json(jsonResponse(false, "Application submission failed", null));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};

// Update job application
export const updateJobApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, number, description, file, careerId } = req.body;

    const existing = await prisma.jobApplication.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return res
        .status(404)
        .json(jsonResponse(false, "Application not found", null));
    }

    // If careerId provided, ensure career exists
    if (careerId) {
      const career = await prisma.career.findFirst({
        where: { id: careerId, isDeleted: false },
      });
      if (!career) {
        return res
          .status(404)
          .json(jsonResponse(false, "Career not found", null));
      }
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: {
        name,
        email,
        number,
        description,
        file,
        careerId,
        updatedBy: req.user?.id,
      },
    });

    if (application) {
      return res
        .status(200)
        .json(
          jsonResponse(true, "Application updated successfully", application),
        );
    }

    return res
      .status(400)
      .json(jsonResponse(false, "Application update failed", null));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};

// List job applications (paginated)
export const searchAllJobApplications = async (req, res) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        number: true,
        description: true,
        file: true,
        careerId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip:
        req.query.limit && req.query.page
          ? parseInt(req.query.limit * (req.query.page - 1))
          : parseInt(defaultLimit() * (defaultPage() - 1)),
      take: req.query.limit
        ? parseInt(req.query.limit)
        : parseInt(defaultLimit()),
    });

    if (!applications || applications.length === 0) {
      return res
        .status(200)
        .json(jsonResponse(true, "No applications found", []));
    }

    return res
      .status(200)
      .json(
        jsonResponse(
          true,
          `${applications.length} applications found`,
          applications,
        ),
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};

// Get application by ID (with career info)
export const searchJobApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.jobApplication.findFirst({
      where: { id, isDeleted: false },
      include: {
        career: true,
      },
    });

    if (!application) {
      return res
        .status(404)
        .json(jsonResponse(false, "Application not found", null));
    }

    return res
      .status(200)
      .json(jsonResponse(true, "Application found", application));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};

// Soft delete application
export const deleteJobApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.jobApplication.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) {
      return res
        .status(404)
        .json(jsonResponse(false, "Application not found", null));
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: { isDeleted: true, deletedBy: req.user?.id },
    });

    if (application) {
      return res
        .status(200)
        .json(jsonResponse(true, "Application has been deleted", application));
    }

    return res
      .status(400)
      .json(jsonResponse(false, "Application has not been deleted", null));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error.message, null));
  }
};