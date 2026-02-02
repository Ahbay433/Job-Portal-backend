import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getAdminJobs,
  getAllJobs,
  getJobById,
  postJob,
} from "../controllers/job.controller.js";

const router = express.Router();

/*
========================
JOB ROUTES
========================
*/

// ✅ PUBLIC – anyone can see jobs
router.get("/get", getAllJobs);

// ✅ PUBLIC – job details page
router.get("/get/:id", getJobById);

// 🔒 PROTECTED – only logged-in recruiter/admin
router.post("/post", isAuthenticated, postJob);

// 🔒 PROTECTED – admin/recruiter jobs
router.get("/getadminjobs", isAuthenticated, getAdminJobs);

export default router;
