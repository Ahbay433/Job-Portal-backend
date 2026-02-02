import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";
import bcrypt from "bcryptjs";

dotenv.config();

const locations = ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai", "Noida", "Gurgaon", "Chennai", "Kolkata", "Ahmedabad"];
const titles = ["Frontend Developer", "Backend Developer", "FullStack Developer", "Data Science", "Graphic Designer", "UI/UX Designer", "Mobile Developer", "Software Engineer", "DevOps Engineer", "Project Manager"];

async function seed() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // 1. Create Recruiter
        let recruiter = await User.findOne({ email: "admin@jobportal.com" });
        if (!recruiter) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            recruiter = await User.create({
                fullname: "Admin Recruiter",
                email: "admin@jobportal.com",
                phoneNumber: 9876543210,
                password: hashedPassword,
                role: "recruiter"
            });
            console.log("Admin Recruiter created (Email: admin@jobportal.com, Password: password123)");
        }

        // 2. Create a few Companies
        const companyNames = ["Global Tech Solutions", "Creative Minds Studio", "Innovate Corp", "Astra Softwares", "Cloud Nine Systems"];
        const createdCompanies = [];

        for (const name of companyNames) {
            let company = await Company.findOne({ name });
            if (!company) {
                company = await Company.create({
                    name,
                    description: `A top-tier firm specializing in ${name.split(' ')[0]} solutions.`,
                    website: `https://${name.toLowerCase().replace(/ /g, '')}.com`,
                    location: locations[Math.floor(Math.random() * locations.length)],
                    userId: recruiter._id
                });
                console.log(`Company created: ${name}`);
            }
            createdCompanies.push(company);
        }

        const jobsToCreate = [];

        // 3. Create Specific Internships for the Internship Page
        console.log("Seeding specific internships...");
        const internshipData = [
            { title: "Frontend Web Intern", company: createdCompanies[0], loc: "Bangalore", salary: 0.2 },
            { title: "Backend Development Intern", company: createdCompanies[1], loc: "Hyderabad", salary: 0.3 },
            { title: "FullStack Developer Intern", company: createdCompanies[2], loc: "Pune", salary: 0.25 },
            { title: "UX/UI Design Intern", company: createdCompanies[3], loc: "Mumbai", salary: 0.15 },
            { title: "Software Engineering Intern", company: createdCompanies[4], loc: "Delhi NCR", salary: 0.4 },
            { title: "Data Analyst Intern", company: createdCompanies[0], loc: "Noida", salary: 0.22 },
            { title: "Marketing Intern", company: createdCompanies[1], loc: "Gurgaon", salary: 0.18 },
            { title: "HR Intern", company: createdCompanies[2], loc: "Chennai", salary: 0.12 }
        ];

        for (const inst of internshipData) {
            jobsToCreate.push({
                title: inst.title,
                description: `A highly rewarding 6-month internship program at ${inst.company.name}. You will work on live projects, gain hands-on industry experience, and receive professional mentorship to kickstart your career.`,
                requirements: ["Basic Programming", "Problem Solving", "Eagerness to learn", "Good Communication"],
                salary: inst.salary,
                location: inst.loc,
                jobType: "Internship",
                experienceLevel: 0,
                position: 5,
                company: inst.company._id,
                created_by: recruiter._id
            });
        }

        // 4. Create Jobs to cover all filters
        console.log("Seeding diverse jobs to cover all filter categories...");

        // Ensure every title exists in at least two random locations
        for (const title of titles) {
            const loc1 = locations[Math.floor(Math.random() * locations.length)];
            const loc2 = locations[Math.floor(Math.random() * locations.length)];

            const salary1 = (Math.floor(Math.random() * 5) + 1) * 5; // e.g., 5, 10, 15...
            const salary2 = (Math.floor(Math.random() * 20) + 10); // e.g., 10-30

            [loc1, loc2].forEach((loc, index) => {
                jobsToCreate.push({
                    title,
                    description: `Exciting opportunity for a ${title}. We are looking for passionate individuals to join our expanding team and build the future together.`,
                    requirements: ["React", "Node.js", "MongoDB", "Express", "API Integration"],
                    salary: index === 0 ? salary1 : salary2,
                    location: loc,
                    jobType: index === 0 ? "Full-Time" : "Part-Time",
                    experienceLevel: Math.floor(Math.random() * 5),
                    position: Math.floor(Math.random() * 5) + 1,
                    company: createdCompanies[Math.floor(Math.random() * createdCompanies.length)]._id,
                    created_by: recruiter._id
                });
            });
        }

        // Ensure every location has at least some jobs
        for (const loc of locations) {
            const existingInLoc = jobsToCreate.some(j => j.location === loc);
            if (!existingInLoc) {
                jobsToCreate.push({
                    title: titles[Math.floor(Math.random() * titles.length)],
                    description: `New opening in ${loc}! Great work environment, competitive salary, and many growth opportunities.`,
                    requirements: ["Problem Solving", "Teamwork", "Communication"],
                    salary: 12,
                    location: loc,
                    jobType: "Full-Time",
                    experienceLevel: 2,
                    position: 3,
                    company: createdCompanies[Math.floor(Math.random() * createdCompanies.length)]._id,
                    created_by: recruiter._id
                });
            }
        }

        await Job.insertMany(jobsToCreate);
        console.log(`\nSUCCESS: Seeded ${jobsToCreate.length} items (including specific internships) across all locations!`);
        console.log(`The Internship page and Sidebar filters are now fully populated. ✨\n`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Critical Seeding Error:", error);
        process.exit(1);
    }
}

seed();
