import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import allRoutes from "./routes/index.js";

dotenv.config();

//cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// CORS configuration
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(cookieParser());

//serve static files
app.use(express.static("public"));

// Increase the maximum allowed size for the request body
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const port = process.env.PORT || 8000;

//middlewares
app.use(express.json());

//routes
app.get("/", (req, res) => {
  res.json({ msg: "Voltech API is working..." });
});

app.use("/api", allRoutes);

app.listen(port, () => {
  console.log(`Voltech API is working on port ${port}`);
});