import express from "express";
import {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  countActiveContacts, // Import the new function
} from "../../controllers/contact/contact.js";
import verify from "../../utils/verifyToken.js";

const router = express.Router();

router.post("/v1/contacts", createContact);
router.get("/v1/contacts", getContacts);
router.get("/v1/contacts/:id", getContact);
router.put("/v1/contacts/:id", verify, updateContact);
router.delete("/v1/contacts/:id", verify, deleteContact);

// New route for counting active contacts
router.get("/v1/contacts/count/active", countActiveContacts);

export default router;