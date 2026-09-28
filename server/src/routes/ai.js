import express from "express";

const router = express.Router();

// POST /api/ai/ask - AI Career Guidance Counselor endpoint
router.post("/ask", async (req, res) => {
    try {
        const { prompt, career, score } = req.body;

        if (!prompt && !career) {
            return res.status(400).json({
                success: false,
                message: "Prompt or career is required"
            });
        }

        const apiKey = process.env.AI_API_KEY;

        // If an API key is provided, the user can hook up their AI provider here
        if (apiKey && apiKey !== "PASTE_YOUR_KEY_HERE") {
            // Placeholder for real provider if desired
            return res.json({
                success: true,
                source: "ai-live",
                response: `AI Counselor analysis for ${career || "your career path"}: You scored ${score || "well"}. Continue developing core competencies, build portfolio projects, and connect with industry mentors.`
            });
        }

        // High-quality contextual fallback guidance when AI_API_KEY is not set
        const careerGuidance = {
            "Software Developer": {
                summary: "Software development is rooted in incremental problem solving, systematic debugging, and reading error logs carefully.",
                roadmap: ["Master Data Structures & Algorithms", "Build full-stack web projects with React and Node.js", "Contribute to open-source software"],
                recommendedNext: "Cloud & DevOps Engineer"
            },
            "Data Analyst": {
                summary: "Data analysis rewards curiosity, structured data manipulation, and storytelling through clear visualizations.",
                roadmap: ["Master SQL and window functions", "Explore Tableau / Power BI", "Learn Python for data wrangling with pandas"],
                recommendedNext: "AI & Machine Learning Specialist"
            },
            "UI/UX Designer": {
                summary: "UI/UX design is all about user empathy, accessibility principles, and iterative wireframing based on testing.",
                roadmap: ["Master Figma auto-layout and component systems", "Conduct 3 usability tests with real peers", "Build a case study detailing your problem-solving process"],
                recommendedNext: "Product Manager"
            },
            "Digital Marketer": {
                summary: "Digital marketing merges creative psychology with performance metrics and continuous AB testing.",
                roadmap: ["Learn Google Analytics 4 and conversion tracking", "Run a small search ad campaign to measure CPA", "Master content strategy and copywriting"],
                recommendedNext: "UI/UX Designer"
            },
            "Cloud & DevOps Engineer": {
                summary: "Cloud engineering focuses on automation, high-availability architecture, and rapid deployment pipelines.",
                roadmap: ["Learn Linux administration and Docker", "Deploy an infrastructure-as-code project with Terraform", "Obtain AWS or Azure associate certification"],
                recommendedNext: "Cybersecurity Analyst"
            },
            "Cybersecurity Analyst": {
                summary: "Cybersecurity requires vigilance, deep network fundamentals, and threat modeling capabilities.",
                roadmap: ["Learn TCP/IP network protocol analysis with Wireshark", "Practice ethical hacking labs on TryHackMe", "Study CompTIA Security+ fundamentals"],
                recommendedNext: "Cloud & DevOps Engineer"
            },
            "AI & Machine Learning Specialist": {
                summary: "AI engineering combines linear algebra, probability, and neural network architectures.",
                roadmap: ["Master PyTorch or TensorFlow fundamentals", "Implement transformer architectures from scratch", "Fine-tune open-weight models on custom datasets"],
                recommendedNext: "Data Analyst"
            },
            "Product Manager": {
                summary: "Product management ties together technical feasibility, business viability, and user desirability.",
                roadmap: ["Practice RICE scoring and product discovery interviews", "Write PRDs (Product Requirement Documents)", "Learn cohort retention metrics"],
                recommendedNext: "UI/UX Designer"
            }
        };

        const target = careerGuidance[career] || {
            summary: "Every career path thrives on curiosity, deliberate practice, and building real-world projects.",
            roadmap: ["Explore foundational coursework", "Connect with working practitioners", "Build evidence of practical work"],
            recommendedNext: "Software Developer"
        };

        return res.json({
            success: true,
            source: "counselor-engine",
            career: career || "Exploration",
            feedback: target.summary,
            roadmap: target.roadmap,
            recommendedNext: target.recommendedNext
        });

    } catch (error) {
        console.error("AI route error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process AI guidance"
        });
    }
});

export default router;
