import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Compass,
  Home,
  Laptop,
  Menu,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X,
  Award,
  Code2,
  Database,
  Palette,
  Megaphone,
  Cloud,
  Shield,
  Cpu,
  Bookmark,
  Printer,
  Copy,
  Check,
  LogOut,
  LogIn,
  ExternalLink,
  HelpCircle,
  FileText,
  Play,
  Terminal,
  RotateCcw,
  Lock,
  Unlock,
  Video,
  VideoOff,
  ShieldAlert,
  Eye
} from "lucide-react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { LoginPage, SignupPage } from "./pages/auth.jsx";
import CameraModal from "./components/CameraModal.jsx";
import ExamSecurityBar from "./components/ExamSecurityBar.jsx";
import TaskStepper from "./components/TaskStepper.jsx";
import LearningVideo from "./components/LearningVideo.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import SimulationLab from "./pages/SimulationLab.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";

/* =========================================================
   8 CAREERS WITH 24 COMPLETELY SEPARATE QUESTIONS (3 PER CAREER)
========================================================= */

const careers = [
  // 1. SOFTWARE DEVELOPER
  {
    id: "software-developer",
    courseId: 1,
    hasCoding: true,
    title: "Software Developer",
    category: "Engineering",
    short: "Build applications and solve complex technical challenges.",
    description:
      "Software developers architect, code, test and maintain systems and applications used by people and organizations worldwide.",
    icon: Code2,
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1000&q=85",
    skills: ["Programming", "System Design", "Debugging", "Logical Reasoning"],
    stats: {
      salary: "$115,000 / yr",
      growth: "+25% (High Demand)",
      education: "Computer Science or Self-Taught",
      level: "Beginner Friendly",
    },
    dayInLife: [
      { time: "09:30 AM", task: "Daily engineering standup and sprint sync" },
      { time: "10:30 AM", task: "Implement core business logic & write unit tests" },
      { time: "02:00 PM", task: "Pull request code reviews & architectural design discussions" },
      { time: "04:00 PM", task: "Investigate and patch client-reported bug reports" },
    ],
    tools: ["JavaScript", "TypeScript", "React", "Node.js", "Git", "Docker", "REST APIs"],
    tasks: [
      {
        id: 1,
        level: 1,
        levelName: "Beginner",
        title: "Diagnose an Application Crash",
        description: "A student portal login button freezes. The browser console outputs 'TypeError: Cannot read properties of undefined (reading token)'.",
        question: "What is the most probable root cause and immediate debugging step?",
        options: [
          "Change the button background color in CSS",
          "The API response lacked a 'token' field, so accessing response.data.token threw an error; add null checking and validate API response payload",
          "Restart the production database server immediately",
          "Delete the login form HTML component"
        ],
        correct: 1,
        explanation: "The error indicates code tried to access .token on an undefined object, showing the login API response was either failing or structured differently than expected."
      },
      {
        id: 2,
        level: 2,
        levelName: "Intermediate",
        title: "REST API Endpoint Design",
        description: "You are building an API endpoint allowing users to modify their account email address.",
        question: "According to RESTful conventions, which HTTP method and status code are standard for updating an existing resource?",
        options: [
          "GET with status 200 OK",
          "PATCH or PUT with status 200 OK (or 204 No Content)",
          "DELETE with status 404 Not Found",
          "POST with status 301 Moved Permanently"
        ],
        correct: 1,
        explanation: "In RESTful architecture, PUT (complete replacement) or PATCH (partial update) are the standard methods used to modify existing resources."
      },
      {
        id: 3,
        level: 3,
        levelName: "Hard",
        title: "Resolving a Git Merge Conflict",
        description: "When merging your feature branch into main, Git halts with a merge conflict in App.jsx.",
        question: "What is the proper professional workflow to resolve this merge conflict?",
        options: [
          "Delete the .git directory and re-clone the repository",
          "Open the conflicted file, locate conflict markers (<<<<<<<, =======, >>>>>>>), discuss changes with peers if needed, keep the correct merged code, test, and commit",
          "Force push with --force to overwrite main branch history",
          "Rename App.jsx to App2.jsx and ignore the conflict"
        ],
        correct: 1,
        explanation: "Merge conflicts happen when two branches touch the same lines. Developers inspect the markers, reconcile the logic, test, and finalize the resolution commit."
      },
      {
        id: 4,
        level: 4,
        levelName: "Expert",
        title: "High-Concurrency Deadlocks & Transaction Scaling",
        description: "Under high write loads, your PostgreSQL microservice reports intermittent serialization deadlocks (error 40P01).",
        question: "What architectural strategy best resolves concurrent deadlocks without sacrificing data consistency?",
        options: [
          "Disable all database transaction isolation and foreign keys",
          "Implement consistent resource locking order across all endpoints, use optimistic locking with retry backoff, and offload asynchronous writes through a durable queue like Kafka",
          "Increase query timeout to 10 minutes",
          "Restart application server when a deadlock happens"
        ],
        correct: 1,
        explanation: "Enforcing deterministic resource locking order and optimistic concurrency with exponential backoff prevents circular lock dependencies."
      }
    ],
    get task() { return this.tasks[0]; }
  },

  // 2. DATA ANALYST
  {
    id: "data-analyst",
    courseId: 2,
    hasCoding: true,
    title: "Data Analyst",
    category: "Data & AI",
    short: "Analyze information and transform data into actionable insights.",
    description:
      "Data analysts examine raw datasets to uncover patterns, measure key performance metrics, and guide executive business decisions.",
    icon: Database,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=85",
    skills: ["SQL", "Excel", "Statistical Analysis", "Data Storytelling"],
    stats: {
      salary: "$92,000 / yr",
      growth: "+23% (Fast Growth)",
      education: "Data Analytics, Math, or Business",
      level: "Beginner Friendly",
    },
    dayInLife: [
      { time: "09:00 AM", task: "Query database pipelines for monthly performance data" },
      { time: "11:00 AM", task: "Clean and validate anomalies in customer sales spreadsheets" },
      { time: "01:30 PM", task: "Build interactive executive dashboards in Tableau or Power BI" },
      { time: "03:30 PM", task: "Present findings and conversion trends to product leaders" },
    ],
    tools: ["SQL", "Python", "Tableau", "Power BI", "Pandas", "Advanced Excel"],
    tasks: [
      {
        id: 1,
        level: 1,
        levelName: "Beginner",
        title: "Analyze Monthly Product Performance",
        description: "A retail company recorded March unit sales across four flagship product lines.",
        dataset: [
          ["Product", "January", "February", "March"],
          ["Laptop", "18", "22", "25"],
          ["Phone", "30", "27", "35"],
          ["Tablet", "16", "19", "21"],
          ["Headphones", "25", "31", "29"],
        ],
        question: "Which product achieved the highest unit sales volume in March?",
        options: ["Laptop", "Phone", "Tablet", "Headphones"],
        correct: 1,
        explanation: "Phone reached 35 units in March, higher than Headphones (29), Laptop (25), and Tablet (21)."
      },
      {
        id: 2,
        level: 2,
        levelName: "Intermediate",
        title: "SQL Query Aggregations",
        description: "You have an orders table and must list all customers whose cumulative spend exceeds $1,000.",
        question: "Which SQL clause is required to filter on grouped aggregate values like SUM(order_total)?",
        options: [
          "WHERE SUM(order_total) > 1000",
          "HAVING SUM(order_total) > 1000 after GROUP BY customer_id",
          "ORDER BY SUM(order_total) > 1000",
          "LIMIT 1000"
        ],
        correct: 1,
        explanation: "In SQL, WHERE filters individual rows prior to grouping. To filter on aggregate functions like SUM() or COUNT(), the HAVING clause is required."
      },
      {
        id: 3,
        level: 3,
        levelName: "Hard",
        title: "Selecting the Right Data Visualization",
        description: "An executive wants to see how 2026 total revenue is proportionally split across 5 global regions.",
        question: "Which chart format is most suitable for displaying proportional part-to-whole composition?",
        options: [
          "Scatter plot",
          "Pie chart or Donut chart (or 100% stacked bar chart)",
          "Logarithmic histogram",
          "Multi-line time series plot"
        ],
        correct: 1,
        explanation: "Pie charts, donut charts, and 100% stacked bar charts are explicitly designed to visualize proportional shares of a whole."
      },
      {
        id: 4,
        level: 4,
        levelName: "Expert",
        title: "Alleviating Data Skew in Distributed Reducers",
        description: "A petabyte warehouse JOIN suffers from severe data skew: one reducer runs for 4 hours while others finish in 2 minutes.",
        question: "What optimization technique directly resolves this distributed partition bottleneck?",
        options: [
          "Double the RAM on client laptops",
          "Salt the skewed join keys with a random prefix to distribute the heavy partition across multiple workers, paired with broadcast joins for dimensional tables",
          "Remove all indexes and write queries in plain text",
          "Switch the storage from SSD to magnetic tape"
        ],
        correct: 1,
        explanation: "Key salting introduces synthetic entropy to redistribute disproportionately frequent keys across parallel worker nodes."
      }
    ],
    get task() { return this.tasks[0]; }
  },

  // 3. UI/UX DESIGNER
  {
    id: "ui-ux-designer",
    courseId: 3,
    hasCoding: false,
    title: "UI/UX Designer",
    category: "Design",
    short: "Design intuitive digital experiences centered on human needs.",
    description:
      "UI/UX designers conduct user research, craft wireframes, build high-fidelity interactive prototypes, and design user journeys.",
    icon: Palette,
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&q=85",
    skills: ["User Research", "Wireframing", "Figma", "Design Systems"],
    stats: {
      salary: "$105,000 / yr",
      growth: "+16% (Steady Demand)",
      education: "Design, HCI, or Self-Taught Portfolio",
      level: "Creative & Methodical",
    },
    dayInLife: [
      { time: "10:00 AM", task: "Conduct user feedback session on mobile prototype" },
      { time: "11:30 AM", task: "Synthesize user journey maps and identify drop-off points" },
      { time: "02:00 PM", task: "Design high-fidelity design system components in Figma" },
      { time: "04:15 PM", task: "Handoff specs and spacing tokens to frontend developers" },
    ],
    tools: ["Figma", "FigJam", "Adobe XD", "Miro", "Design Systems", "Prototyping"],
    tasks: [
      {
        id: 1,
        level: 1,
        levelName: "Beginner",
        title: "Improve a Confusing Student Dashboard",
        description: "Students report that an educational portal feels cluttered and key course navigation links are difficult to find.",
        question: "What is the most effective first step before redesigning the user interface?",
        options: [
          "Immediately change all primary colors to vibrant gradients",
          "Conduct usability interviews with real students to pinpoint specific pain points and observe navigation",
          "Remove half the dashboard features arbitrarily",
          "Add fast spinning animations to all buttons"
        ],
        correct: 1,
        explanation: "Observing real user behavior during task execution pinpoints genuine friction points before jumping into visual layouts."
      },
      {
        id: 2,
        level: 2,
        levelName: "Intermediate",
        title: "Accessibility & Color Contrast Standards",
        description: "You are designing dark gray body text over a light gray card background.",
        question: "According to WCAG 2.1 AA accessibility guidelines, what is the minimum required contrast ratio for regular body text?",
        options: [
          "1.5:1",
          "4.5:1",
          "10:1",
          "Contrast does not matter on modern screens"
        ],
        correct: 1,
        explanation: "WCAG 2.1 AA mandates a minimum contrast ratio of 4.5:1 for standard text (and 3:1 for large text) to ensure readability for visually impaired users."
      },
      {
        id: 3,
        level: 3,
        levelName: "Hard",
        title: "Information Architecture Organization",
        description: "Your product team is organizing 40 tools and settings into an intuitive navigation menu.",
        question: "Which user research exercise helps structure these menu items based on users' mental models?",
        options: [
          "Card Sorting",
          "Eye tracking without users",
          "Random alphabetical sorting",
          "Putting all 40 items on the top navigation bar simultaneously"
        ],
        correct: 0,
        explanation: "Card sorting is a generative UX method where participants group labeled concept cards into categories that make sense to them."
      },
      {
        id: 4,
        level: 4,
        levelName: "Expert",
        title: "Enterprise Multi-Brand Design Token Architecture",
        description: "Your design system powers 15 web and mobile enterprise apps with distinct themes.",
        question: "How should tokens and component architecture be structured to guarantee accessibility, token inheritance, and zero-drift cross-platform updates?",
        options: [
          "Hardcode hexadecimal color codes in individual CSS files across all repositories",
          "Establish a 3-tier Design Token architecture (Global -> Semantic/Alias -> Component) managed via Style Dictionary, exported as platform packages with automated contrast validation tests",
          "Allow each developer to choose their own button radius and typography dynamically",
          "Replace all UI components with screenshots"
        ],
        correct: 1,
        explanation: "A 3-tier token hierarchy decouples raw values from semantic context, enabling multi-theme switching and dark mode without regressions."
      }
    ],
    get task() { return this.tasks[0]; }
  },

  // 4. DIGITAL MARKETER
  {
    id: "digital-marketer",
    courseId: 4,
    hasCoding: false,
    title: "Digital Marketer",
    category: "Marketing",
    short: "Connect innovative products with the right target audience.",
    description:
      "Digital marketers design omnichannel acquisition campaigns, craft persuasive brand messaging, and optimize conversions using data.",
    icon: Megaphone,
    image:
      "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=1000&q=85",
    skills: ["Campaign Strategy", "SEO & SEM", "Content Creation", "Analytics"],
    stats: {
      salary: "$84,000 / yr",
      growth: "+19% (Rapid Growth)",
      education: "Marketing, Communications, or Business",
      level: "Dynamic & Analytical",
    },
    dayInLife: [
      { time: "09:00 AM", task: "Audit social ad spend and cost-per-click metrics" },
      { time: "11:00 AM", task: "Draft copy and visual assets for email newsletter campaign" },
      { time: "01:30 PM", task: "Analyze landing page bounce rates and set up A/B tests" },
      { time: "03:45 PM", task: "Coordinate with SEO team on organic keyword rankings" },
    ],
    tools: ["Google Analytics 4", "Meta Ads Manager", "HubSpot", "Ahrefs", "Canva", "Mailchimp"],
    tasks: [
      {
        id: 1,
        level: 1,
        levelName: "Beginner",
        title: "Launch an Acquisition Campaign",
        description: "A coding academy is launching an intensive 8-week Python Bootcamp and needs qualified leads.",
        question: "Which audience acquisition strategy produces the highest quality prospective student enrollments?",
        options: [
          "Mass blast banner ads to unrelated gaming and entertainment blogs",
          "Targeted search ads for high-intent keywords like 'learn python for data' paired with social ads highlighting project portfolios and job outcomes",
          "Send unsolicited spam SMS messages to purchased phone lists",
          "Change the bootcamp title every hour"
        ],
        correct: 1,
        explanation: "Capturing high-intent search queries combined with proof of real outcomes targets individuals who are actively looking to gain job skills."
      },
      {
        id: 2,
        level: 2,
        levelName: "Intermediate",
        title: "Evaluate Campaign ROAS & Conversion",
        description: "An ad campaign spends $1,000 on social media, generating 50,000 impressions, 1,000 clicks, and 20 course sales at $100 each.",
        question: "What was the Click-Through Rate (CTR) and the Return on Ad Spend (ROAS)?",
        options: [
          "CTR: 2%, ROAS: 2.0x (200% / $2,000 revenue)",
          "CTR: 10%, ROAS: 0.5x",
          "CTR: 50%, ROAS: 10x",
          "CTR: 0.1%, ROAS: 1.0x"
        ],
        correct: 0,
        explanation: "CTR = (1,000 clicks / 50,000 impressions) × 100 = 2%. Total revenue = 20 × $100 = $2,000. ROAS = $2,000 / $1,000 = 2.0x (200%)."
      },
      {
        id: 3,
        level: 3,
        levelName: "Hard",
        title: "A/B Testing Email Open Rates",
        description: "Your course announcement newsletter has an open rate of only 11% (industry benchmark: 22%).",
        question: "Which element should you A/B test first to improve open rates?",
        options: [
          "The footer copyright notice text",
          "The email subject line and preview preheader snippet",
          "The size of the logo at the bottom of the email",
          "The server database configuration"
        ],
        correct: 1,
        explanation: "Open rate is determined by the sender name, subject line, and preview preheader text that subscribers see in their inboxes before opening."
      },
      {
        id: 4,
        level: 4,
        levelName: "Expert",
        title: "Server-Side Conversions & Attribution Infrastructure",
        description: "Third-party cookie deprecation and privacy frameworks cause severe client-side attribution loss.",
        question: "Which measurement and data infrastructure architecture best restores accurate conversion tracking?",
        options: [
          "Rely solely on last-click browser cookies without any server integrations",
          "Deploy Server-Side Tagging with Conversions API (CAPI) using first-party hashed customer parameters, combined with Marketing Mix Modeling (MMM) and geo-lift incrementality experiments",
          "Send unsolicited SMS messages to cold numbers",
          "Stop analyzing campaigns and spend budget equally across all networks"
        ],
        correct: 1,
        explanation: "Server-side tracking bypasses browser ad-blockers and cookie limits, while MMM and incrementality testing provide robust statistical proof of causal ad impact."
      }
    ],
    get task() { return this.tasks[0]; }
  },

  // 5. CLOUD & DEVOPS ENGINEER
  {
    id: "cloud-devops",
    courseId: 5,
    hasCoding: true,
    title: "Cloud & DevOps Engineer",
    category: "Engineering",
    short: "Architect reliable cloud platforms and automate rapid delivery.",
    description:
      "Cloud engineers design scalable cloud architectures on AWS/Azure and build automated CI/CD deployment pipelines.",
    icon: Cloud,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=85",
    skills: ["Cloud Architecture", "Linux", "Docker & Kubernetes", "CI/CD Automation"],
    stats: {
      salary: "$128,000 / yr",
      growth: "+28% (Very High Demand)",
      education: "Computer Science or Cloud Certifications",
      level: "Intermediate",
    },
    dayInLife: [
      { time: "09:00 AM", task: "Review automated cloud vulnerability scans and alerts" },
      { time: "10:30 AM", task: "Write Terraform scripts for infrastructure as code" },
      { time: "02:00 PM", task: "Optimize Kubernetes cluster resource limits and auto-scaling" },
      { time: "04:00 PM", task: "Streamline GitHub Actions build and release pipelines" },
    ],
    tools: ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Linux Bash"],
    tasks: [
      {
        id: 1,
        level: 1,
        levelName: "Beginner",
        title: "Mitigate High-Traffic Outages",
        description: "A student exam result portal crashes every time results are announced due to sudden traffic spikes.",
        question: "Which cloud infrastructure design resolves this scalability bottleneck reliably?",
        options: [
          "Deploy a single physical server in the office with manual restart scripts",
          "Configure an Auto Scaling Group behind an Application Load Balancer with database read replicas and CDN caching",
          "Block all incoming students from accessing the website on exam day",
          "Delete past exam records from the server to free up memory"
        ],
        correct: 1,
        explanation: "Auto-scaling provisions compute instances dynamically, while load balancers distribute load and read replicas prevent database query saturation."
      },
      {
        id: 2,
        level: 2,
        levelName: "Intermediate",
        title: "Docker Containerization Benefits",
        description: "Engineering teams package applications into Docker containers rather than distributing raw code.",
        question: "What is the primary technical benefit of containerizing applications?",
        options: [
          "To make the application run without an operating system",
          "To bundle application code with all dependencies, ensuring consistent behavior across development, testing, and production",
          "Because containers eliminate the need to write backend code",
          "To prevent developers from editing their code"
        ],
        correct: 1,
        explanation: "Containerization eliminates environment discrepancies ('works on my machine') by packaging the runtime, libraries, and binaries together."
      },
      {
        id: 3,
        level: 3,
        levelName: "Hard",
        title: "CI/CD Pipeline Secret Exposure Incident",
        description: "Your automated CI/CD pipeline triggers an alert: 'Secret Scanning: Found exposed AWS_SECRET_ACCESS_KEY in commit diff'.",
        question: "What immediate security action must you take?",
        options: [
          "Ignore the warning and proceed with production deployment",
          "Immediately revoke and rotate the compromised credential in AWS IAM, scrub the key from Git history, and store keys in a secret manager",
          "Change the repository to private and assume nobody saw it",
          "Delete the GitHub Actions pipeline"
        ],
        correct: 1,
        explanation: "Exposed keys can be compromised within seconds by automated web crawlers. Rotating the secret immediately neutralizes unauthorized access."
      },
      {
        id: 4,
        level: 4,
        levelName: "Expert",
        title: "Multi-Region Service Mesh Split-Brain Resolution",
        description: "During a multi-region Kubernetes upgrade, Istio experiences split-brain DNS, dropping inter-region mTLS handshakes.",
        question: "What is the correct immediate mitigation procedure?",
        options: [
          "Delete all namespaces immediately in production",
          "Enforce strict failover traffic routing via global anycast DNS/BGP to the healthy region, isolate control plane synchronization gossip protocols, roll back the ingress gateway mTLS policy, and verify cluster secret federation",
          "Disable encryption across the internet completely",
          "Reboot every physical router in the cloud provider's data center"
        ],
        correct: 1,
        explanation: "Mitigating cross-region mesh failures requires immediate edge rerouting to healthy clusters while isolating peer discovery sync to restore deterministic security tokens."
      }
    ],
    get task() { return this.tasks[0]; }
  },

  // 6. CYBERSECURITY ANALYST
  {
    id: "cybersecurity-analyst",
    courseId: 6,
    hasCoding: true,
    title: "Cybersecurity Analyst",
    category: "Security",
    short: "Safeguard networks, protect sensitive data, and mitigate cyber threats.",
    description:
      "Cybersecurity analysts monitor computer systems, perform vulnerability assessments, respond to intrusions, and enforce security policies.",
    icon: Shield,
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=85",
    skills: ["Network Security", "Threat Detection", "Incident Response", "Cryptography"],
    stats: {
      salary: "$112,000 / yr",
      growth: "+32% (Explosive Demand)",
      education: "Cybersecurity, IT, or Security+",
      level: "Detail Oriented",
    },
    dayInLife: [
      { time: "09:00 AM", task: "Inspect SIEM security event logs for anomalous login attempts" },
      { time: "11:00 AM", task: "Conduct vulnerability scans across company web servers" },
      { time: "01:30 PM", task: "Investigate flagged suspicious employee email attachments" },
      { time: "03:45 PM", task: "Update corporate firewall rules and zero-trust policies" },
    ],
    tools: ["Wireshark", "Splunk", "Nessus", "Burp Suite", "Kali Linux", "Firewalls"],
    tasks: [
      {
        id: 1,
        level: 1,
        levelName: "Beginner",
        title: "Responding to Phishing Attacks",
        description: "An employee receives an email marked 'Urgent: Payroll Direct Deposit Verification' from hr-support@payroll-quick-update.com.",
        question: "What is the proper immediate procedure following this incident?",
        options: [
          "Enter bank account details immediately to prevent payroll disruption",
          "Report the phishing email to the security operations team without clicking links or entering credentials",
          "Forward the email to all company colleagues asking if they received it",
          "Click the link and submit a fake password"
        ],
        correct: 1,
        explanation: "Artificial urgency and unverified external domains are classic phishing indicators. Reporting alerts SecOps to block the domain organization-wide."
      },
      {
        id: 2,
        level: 2,
        levelName: "Intermediate",
        title: "Multi-Factor Authentication (MFA)",
        description: "You are implementing authentication safeguards against stolen and leaked corporate passwords.",
        question: "Which authentication strategy provides the strongest defense against credential stuffing attacks?",
        options: [
          "Requiring passwords to be changed every 24 hours",
          "Multi-Factor Authentication (MFA) utilizing FIDO2/WebAuthn security keys or authenticator apps",
          "Allowing users to log in with only a 4-digit numeric PIN",
          "Writing passwords down in a shared notebook"
        ],
        correct: 1,
        explanation: "MFA requires an independent second factor (something you possess) that attackers cannot compromise merely by purchasing leaked passwords."
      },
      {
        id: 3,
        level: 3,
        levelName: "Hard",
        title: "Securing Exposed Network Management Ports",
        description: "A vulnerability audit finds Port 22 (SSH) and Port 3389 (RDP) on a database server are accessible to the public internet.",
        question: "What is the recommended security posture for administrative ports?",
        options: [
          "Leave them open for convenient developer access",
          "Restrict administrative ports behind a VPN or bastion host with IP allowlists and require key-based authentication",
          "Change the server desktop wallpaper",
          "Delete the database entirely"
        ],
        correct: 1,
        explanation: "Publicly accessible management ports are continuously targeted by automated brute-force attacks. Access should strictly require a secure VPN or bastion."
      },
      {
        id: 4,
        level: 4,
        levelName: "Expert",
        title: "Eradicating an Active Directory Golden Ticket Attack",
        description: "Threat intelligence indicates an APT actor forged a Kerberos Golden Ticket, obtaining domain-wide persistence.",
        question: "What remediation action is required to fully eradicate the attacker?",
        options: [
          "Change a single user's password once",
          "Reset the KRBTGT account password twice consecutively (with replication interval between resets) to invalidate all existing Ticket Granting Tickets (TGTs), followed by enterprise-wide credential resets and memory forensic sweeps on domain controllers",
          "Clear browser cache on employee workstations",
          "Uninstall antivirus software"
        ],
        correct: 1,
        explanation: "Because Kerberos ticket history remembers the previous KRBTGT password hash, resetting it twice consecutively invalidates any forged ticket granting tickets in circulation."
      }
    ],
    get task() { return this.tasks[0]; }
  },

  // 7. AI & MACHINE LEARNING SPECIALIST
  {
    id: "ai-specialist",
    courseId: 7,
    hasCoding: true,
    title: "AI & Machine Learning Specialist",
    category: "Data & AI",
    short: "Build predictive models and harness the frontier of intelligent systems.",
    description:
      "AI specialists develop neural networks, train machine learning algorithms, and integrate large language models into useful software products.",
    icon: Cpu,
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=85",
    skills: ["Machine Learning", "Python", "Deep Learning", "Mathematics & Statistics"],
    stats: {
      salary: "$135,000 / yr",
      growth: "+38% (Fastest Growing)",
      education: "Computer Science, AI, or Mathematics",
      level: "Advanced & Rewarding",
    },
    dayInLife: [
      { time: "09:30 AM", task: "Review benchmark loss curves for newly trained neural network" },
      { time: "11:00 AM", task: "Preprocess, clean, and tokenize training datasets" },
      { time: "02:00 PM", task: "Fine-tune open-source LLM for domain-specific questions" },
      { time: "04:30 PM", task: "Deploy model inference endpoint via low-latency API" },
    ],
    tools: ["Python", "PyTorch", "TensorFlow", "Hugging Face", "Scikit-Learn", "Jupyter"],
    tasks: [
      {
        id: 1,
        level: 1,
        levelName: "Beginner",
        title: "Diagnosing Model Overfitting",
        description: "A machine learning model achieves 99.8% accuracy on training data but drops to 52.3% on validation data.",
        question: "What problem is occurring, and which technique directly addresses it?",
        options: [
          "Underfitting; make the neural network smaller",
          "Overfitting; apply dropout regularization, data augmentation, and evaluate cross-validation",
          "Hardware screen resolution error; restart computer",
          "Optimal generalization; deploy model directly to production"
        ],
        correct: 1,
        explanation: "Overfitting happens when a model memorizes noise and idiosyncrasies in training data rather than underlying patterns. Regularization prevents co-adaptation of features."
      },
      {
        id: 2,
        level: 2,
        levelName: "Intermediate",
        title: "Feature Scaling in Machine Learning",
        description: "You have numerical features ranging from Age (18-80) to Annual Income ($20,000-$500,000).",
        question: "Why is feature scaling essential before feeding inputs into gradient-based models?",
        options: [
          "It compresses the file size for email transmission",
          "It prevents features with large numeric scales from dominating gradient updates, ensuring stable and faster convergence",
          "It automatically assigns labels to unlabelled datasets",
          "It encrypts sensitive user information"
        ],
        correct: 1,
        explanation: "Gradient descent updates parameters proportionally to feature magnitudes. Features with huge numbers cause severe oscillations without normalization."
      },
      {
        id: 3,
        level: 3,
        levelName: "Hard",
        title: "Evaluating Imbalanced Classification",
        description: "In a medical diagnostic dataset, only 0.5% of samples are positive for a rare illness. A model predicts 'Negative' 100% of the time and achieves 99.5% accuracy.",
        question: "Why is accuracy misleading here, and which metric must be prioritized?",
        options: [
          "Accuracy is fine; 99.5% is near perfect",
          "Accuracy ignores class imbalance; Recall (Sensitivity) and F1-Score must be prioritized to ensure sick patients are not missed",
          "Count total lines of code written instead",
          "Measure model training time in seconds only"
        ],
        correct: 1,
        explanation: "In rare-event detection, false negatives can be fatal. Recall measures the percentage of actual positive illness cases successfully detected."
      },
      {
        id: 4,
        level: 4,
        levelName: "Expert",
        title: "High-Throughput LLM Serving & KV-Cache Optimization",
        description: "You are deploying a 70B parameter LLM for real-time inference requiring <50ms time-to-first-token (TTFT).",
        question: "Which optimization stack delivers the highest throughput and memory efficiency?",
        options: [
          "Run 32-bit floating point weights on a single consumer CPU core",
          "Utilize 4-bit/8-bit weight-only or FP8 quantization (AWQ/GPTQ) with PagedAttention (vLLM / TensorRT-LLM), continuous batching, and KV-cache offloading across tensor-parallel GPU clusters",
          "Re-train the model from scratch every time a user sends a prompt",
          "Save the model weights as a CSV spreadsheet"
        ],
        correct: 1,
        explanation: "Modern high-throughput LLM serving relies on PagedAttention to eliminate memory fragmentation, coupled with low-bit quantization to fit KV caches on high-bandwidth VRAM."
      }
    ],
    get task() { return this.tasks[0]; }
  },

  // 8. PRODUCT MANAGER
  {
    id: "product-manager",
    courseId: 8,
    hasCoding: false,
    title: "Product Manager",
    category: "Product & Strategy",
    short: "Guide product vision, align teams, and deliver user value.",
    description:
      "Product managers sit at the intersection of business, technology, and user experience to decide what gets built and why.",
    icon: Compass,
    image:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=85",
    skills: ["Product Strategy", "User Empathy", "Data-Driven Prioritization", "Leadership"],
    stats: {
      salary: "$120,000 / yr",
      growth: "+20% (High Strategic Value)",
      education: "Business, Engineering, or Varied",
      level: "Strategic & Collaborative",
    },
    dayInLife: [
      { time: "09:00 AM", task: "Analyze user retention metrics and customer funnel drop-offs" },
      { time: "10:30 AM", task: "Lead product discovery sprint with design and tech leads" },
      { time: "01:30 PM", task: "Prioritize upcoming quarter roadmap using RICE framework" },
      { time: "03:45 PM", task: "Draft PRD (Product Requirement Document) for new feature" },
    ],
    tools: ["Jira", "Notion", "Mixpanel", "Linear", "Figma", "Google Docs"],
    tasks: [
      {
        id: 1,
        level: 1,
        levelName: "Beginner",
        title: "Prioritize Competing Feature Demands",
        description: "Your engineering squad has capacity for only two features this quarter out of ten client requests.",
        question: "Which approach provides the most objective, user-centric prioritization?",
        options: [
          "Select the feature requested by the loudest executive in the hallway",
          "Score proposals with an objective framework like RICE (Reach × Impact × Confidence / Effort) aligned with product goals",
          "Flip a coin to determine engineering priority",
          "Promise all ten features to clients without developer agreement"
        ],
        correct: 1,
        explanation: "The RICE framework balances quantifiable reach and user value against development cost, reducing political bias in roadmap planning."
      },
      {
        id: 2,
        level: 2,
        levelName: "Intermediate",
        title: "Minimum Viable Product (MVP) Purpose",
        description: "Your startup is preparing to release an MVP for a new peer-to-peer tutoring platform.",
        question: "What is the primary objective of launching an MVP?",
        options: [
          "To release a finalized, comprehensive platform with zero remaining questions",
          "To test core value hypotheses with real users using minimal effort and maximize validated learning",
          "To deliberately ship broken software permanently",
          "To delay talking to real users as long as possible"
        ],
        correct: 1,
        explanation: "An MVP tests core value hypotheses with real users with minimal resource expenditure, avoiding building software nobody wants."
      },
      {
        id: 3,
        level: 3,
        levelName: "Hard",
        title: "Diagnosing User Onboarding Churn",
        description: "A mobile productivity app gets thousands of downloads, but 70% of new users leave the app within 48 hours.",
        question: "Where should the Product Manager focus discovery research?",
        options: [
          "Spend more budget on billboard advertising",
          "Analyze the onboarding funnel and Time-to-Value (TTV) to eliminate friction preventing users from experiencing the core 'Aha!' moment",
          "Double the subscription fee immediately",
          "Delete the user registration page"
        ],
        correct: 1,
        explanation: "Rapid 48-hour drop-off signifies that users aren't quickly understanding or experiencing the value proposition during early onboarding."
      },
      {
        id: 4,
        level: 4,
        levelName: "Expert",
        title: "B2B Custom Enterprise Contracts vs High-Growth PLG",
        description: "80% of revenue comes from 5 enterprise clients demanding custom on-premise features, while self-serve PLG is growing 200% YoY.",
        question: "How do you resolve this resource allocation crisis?",
        options: [
          "Commit all engineering solely to the enterprise clients and shut down self-serve",
          "Decouple architecture to isolate enterprise compliance into a configurable add-on tier, ring-fence a dedicated solutions engineering squad for custom contracts, and protect core product teams to scale the high-margin PLG engine",
          "Ignore enterprise clients and refund their contracts without communication",
          "Let engineers randomly pick which tickets to code each morning"
        ],
        correct: 1,
        explanation: "Separating custom professional services from standardized product-led growth preserves product scalability while retaining strategic marquee enterprise revenue."
      }
    ],
    get task() { return this.tasks[0]; }
  }
];

/* =========================================================
   APP COMPONENT
========================================================= */

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("pathpilot_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Verify and maintain persistent login session on mount
  useEffect(() => {
    const token = localStorage.getItem("pathpilot_token");
    if (token) {
      fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            localStorage.setItem("pathpilot_user", JSON.stringify(data.user));
          } else {
            // Token expired or invalid
            localStorage.removeItem("pathpilot_user");
            localStorage.removeItem("pathpilot_token");
            setCurrentUser(null);
          }
        })
        .catch(() => {
          // Keep current state on network failure
        });
    }
  }, []);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3200);
  };

  const handleLogin = (user, token) => {
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("pathpilot_user", JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem("pathpilot_token", token);
    }
    showToast(`Welcome, ${user?.name || "Explorer"}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("pathpilot_user");
    localStorage.removeItem("pathpilot_token");
    setCurrentUser(null);
    showToast("Signed out successfully.");
  };

  return (
    <>
      <Layout currentUser={currentUser} onLogout={handleLogout} showToast={showToast}>
        <Routes>
          <Route path="/" element={<HomePage showToast={showToast} />} />
          <Route path="/careers" element={<CareerExplorer showToast={showToast} />} />
          <Route path="/careers/:id" element={<CareerDetails showToast={showToast} />} />
          <Route path="/simulation" element={<SimulationSelector />} />
          <Route path="/simulation/:id" element={<SimulationLab currentUser={currentUser} showToast={showToast} careers={careers} DIFFICULTY_LEVELS={DIFFICULTY_LEVELS} />} />
          <Route path="/report" element={<PerformanceReport showToast={showToast} />} />
          <Route path="/fit-insights" element={<CareerFit showToast={showToast} />} />
          <Route path="/dashboard" element={<StudentDashboard currentUser={currentUser} showToast={showToast} />} />
          <Route path="/admin" element={<AdminDashboard currentUser={currentUser} showToast={showToast} />} />
          <Route path="/resources" element={<Resources showToast={showToast} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage onLogin={handleLogin} />} />
        </Routes>
      </Layout>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <Sparkles size={17} style={{ color: "#38bdf8" }} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage("")}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", marginLeft: 8 }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}

/* =========================================================
   LAYOUT WITH TOPBAR & SIDEBAR
========================================================= */

function Layout({ children, currentUser, onLogout, showToast }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "All 8 Simulations Active",
      text: "Every career now has 3 distinct, authentic workplace scenario challenges.",
      time: "Just now",
      unread: true,
      icon: Sparkles,
    },
    {
      id: 2,
      title: "Fit Insight Ready",
      text: "Your multi-question simulation results generate deep skill diagnosis.",
      time: "1 hour ago",
      unread: true,
      icon: Target,
    },
    {
      id: 3,
      title: "Welcome to PathPilot",
      text: "Experience realistic tasks before deciding your career direction.",
      time: "Yesterday",
      unread: false,
      icon: Compass,
    },
  ]);

  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast("All notifications marked as read.");
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast("Notifications cleared.");
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (searchQuery.trim()) {
        navigate(`/careers?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate("/careers");
      }
    }
  };

  const navigation = [
    { path: "/", label: "Home", icon: Home },
    { path: "/careers", label: "Career Explorer", icon: Compass },
    { path: "/simulation", label: "Career Simulation", icon: Laptop },
    { path: "/dashboard", label: "My Dashboard", icon: BarChart3 },
    { path: "/report", label: "Performance Report", icon: BookOpen },
    { path: "/fit-insights", label: "Fit Insights", icon: Target },
    { path: "/resources", label: "Resources & Guides", icon: FileText },
    ...(currentUser?.role === "admin" ? [{ path: "/admin", label: "Admin Lab", icon: Shield }] : [])
  ];

  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : "G";

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <button
          className="close-mobile"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X />
        </button>

        <div className="brand">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <div className="brand-name">
              PathPilot <span>➤</span>
            </div>
            <div className="brand-subtitle">Career Simulation Lab</div>
          </Link>
        </div>

        <nav>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={active ? "active" : ""}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-quote">
            <strong>Try.</strong>
            <strong>Explore.</strong>
            <strong>Discover.</strong>
            <span>Your Career.</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main">
        {/* TOPBAR */}
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu />
          </button>

          {/* Search bar */}
          <div className="searchbar">
            <button
              onClick={handleSearchSubmit}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "grid", placeItems: "center", padding: 0 }}
              title="Search"
            >
              <Search size={18} />
            </button>
            <input
              placeholder="Search careers, skills, tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "grid", placeItems: "center" }}
                title="Clear"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Top Actions */}
          <div className="top-actions">
            {/* Notification Bell Button */}
            <button
              className="icon-btn"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && <b />}
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications ({unreadCount})</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={markAllNotificationsAsRead}>Mark read</button>
                    <button onClick={clearNotifications} style={{ color: "#ef4444" }}>Clear</button>
                  </div>
                </div>

                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: "12px" }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const Icon = n.icon;
                      return (
                        <div
                          key={n.id}
                          className={`notification-item ${n.unread ? "unread" : ""}`}
                        >
                          <div className="notification-item-icon">
                            <Icon size={16} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <strong style={{ display: "block", color: "#1e293b", fontSize: "12px" }}>
                              {n.title}
                            </strong>
                            <span>{n.text}</span>
                            <small style={{ display: "block", color: "#94a3b8", marginTop: 2, fontSize: "10px" }}>
                              {n.time}
                            </small>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* User Profile / Auth Area */}
            {currentUser ? (
              <button
                className="profile-trigger"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
              >
                <div className="avatar">{userInitial}</div>
                <span className="user-name">Hi, {(currentUser.name || currentUser.email || "Explorer").split(" ")[0]}</span>
                <ChevronDown size={16} style={{ color: "#64748b" }} />
              </button>
            ) : (
              <div className="auth-nav-buttons">
                <Link to="/login" className="btn-signin">Sign In</Link>
                <Link to="/signup" className="primary small">Get Started</Link>
              </div>
            )}

            {/* Profile Dropdown Menu */}
            {profileOpen && currentUser && (
              <div className="dropdown-menu">
                <div className="dropdown-user-header">
                  <strong>{currentUser.name}</strong>
                  <span>{currentUser.email}</span>
                </div>

                <Link
                  to="/dashboard"
                  className="dropdown-item"
                  onClick={() => setProfileOpen(false)}
                >
                  <BarChart3 size={16} />
                  <span>My Dashboard</span>
                </Link>

                <Link
                  to="/report"
                  className="dropdown-item"
                  onClick={() => setProfileOpen(false)}
                >
                  <Award size={16} />
                  <span>My Performance Report</span>
                </Link>

                <Link
                  to="/fit-insights"
                  className="dropdown-item"
                  onClick={() => setProfileOpen(false)}
                >
                  <Target size={16} />
                  <span>Career Fit Insights</span>
                </Link>

                <Link
                  to="/login"
                  className="dropdown-item"
                  onClick={() => setProfileOpen(false)}
                >
                  <UserRound size={16} />
                  <span>Switch Account / Sign In</span>
                </Link>

                <button
                  className="dropdown-item logout"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="content">{children}</section>
      </main>
    </div>
  );
}

/* =========================================================
   HOMEPAGE
========================================================= */

function HomePage({ showToast }) {
  return (
    <>
      <section className="hero-new">
        <div className="hero-overlay">
          <div className="hero-content">
            <span className="eyebrow">PATHPILOT • CAREER SIMULATION LAB</span>

            <h1>
              Experience Before
              <br />
              You Choose.
            </h1>

            <p>
              Try realistic career tasks, uncover your genuine strengths,
              <br />
              and experience what different careers actually feel like in practice.
            </p>

            <div className="hero-buttons">
              <Link className="primary" to="/careers">
                Start Exploring
                <ArrowRight size={18} />
              </Link>

              <Link className="secondary" to="/simulation">
                Try a Simulation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div>
          <span className="eyebrow">WHY PATHPILOT?</span>
          <h2>
            Don't choose a career only because
            <br />
            someone told you to.
          </h2>
        </div>

        <p>
          PathPilot gives students and early professionals a risk-free chance to
          solve real-world career dilemmas, evaluate their natural aptitudes,
          and discover what they truly enjoy before investing time and tuition.
        </p>
      </section>

      <section className="feature-grid">
        <Feature
          icon={<Compass />}
          title="Explore"
          text="Deeply understand responsibilities, tools, and daily realities across 8 career tracks."
        />

        <Feature
          icon={<Laptop />}
          title="Experience"
          text="Complete multi-step scenario challenges crafted specifically for each career."
        />

        <Feature
          icon={<BarChart3 />}
          title="Reflect"
          text="Receive immediate performance feedback and diagnostic skill maps."
        />

        <Feature
          icon={<Target />}
          title="Plan"
          text="Get concrete roadmaps and resources tailored to your personal fit."
        />
      </section>

      <SectionTitle
        title="Explore High-Demand Careers"
        link="View All Careers"
        to="/careers"
      />

      <div className="career-row">
        {careers.slice(0, 4).map((career) => (
          <CareerCard key={career.id} career={career} showToast={showToast} />
        ))}
      </div>
    </>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

/* =========================================================
   CAREER EXPLORER WITH CATEGORY FILTERS & BOOKMARKING
========================================================= */

function CareerExplorer({ showToast }) {
  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem("pathpilot_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const categories = [
    "All",
    "Engineering",
    "Data & AI",
    "Design",
    "Marketing",
    "Security",
    "Product & Strategy",
    "Bookmarked"
  ];

  const toggleBookmark = (careerId, title) => {
    let updated;
    if (bookmarks.includes(careerId)) {
      updated = bookmarks.filter((id) => id !== careerId);
      showToast(`Removed "${title}" from bookmarks.`);
    } else {
      updated = [...bookmarks, careerId];
      showToast(`Saved "${title}" to your bookmarks!`);
    }
    setBookmarks(updated);
    localStorage.setItem("pathpilot_bookmarks", JSON.stringify(updated));
  };

  const filtered = useMemo(() => {
    return careers.filter((career) => {
      if (selectedCategory === "Bookmarked") {
        if (!bookmarks.includes(career.id)) return false;
      } else if (selectedCategory !== "All" && career.category !== selectedCategory) {
        return false;
      }

      const term = search.toLowerCase();
      const matchText = (
        career.title +
        " " +
        career.short +
        " " +
        career.category +
        " " +
        career.skills.join(" ") +
        " " +
        career.tools.join(" ")
      ).toLowerCase();

      return matchText.includes(term);
    });
  }, [search, selectedCategory, bookmarks]);

  return (
    <>
      <PageHeader
        eyebrow="CAREER EXPLORER"
        title="Find a path worth trying."
        text="Explore in-depth profiles, typical days on the job, essential skills, and try hands-on simulation tasks."
      />

      <div className="large-search">
        <Search size={20} style={{ color: "#94a3b8" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, skill (e.g. Python, SQL, Figma), or keyword..."
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="filter-pills">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-pill ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === "Bookmarked" ? `⭐ Bookmarked (${bookmarks.length})` : cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Compass size={40} style={{ color: "#94a3b8", marginBottom: 10 }} />
          <h3>No careers found</h3>
          <p>Try adjusting your search terms or filter selection.</p>
          <button
            className="secondary-action-btn"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="career-grid-new">
          {filtered.map((career) => (
            <CareerCardLarge
              key={career.id}
              career={career}
              isBookmarked={bookmarks.includes(career.id)}
              onToggleBookmark={() => toggleBookmark(career.id, career.title)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function CareerCard({ career, showToast }) {
  const Icon = career.icon;

  return (
    <Link className="career-card-new" to={`/careers/${career.id}`}>
      <img src={career.image} alt={career.title} />

      <div className="career-card-content">
        <div className="mini-icon">
          <Icon size={17} />
        </div>

        <h3>{career.title}</h3>
        <p>{career.short}</p>

        <span>
          Explore <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

function CareerCardLarge({ career, isBookmarked, onToggleBookmark }) {
  const Icon = career.icon;

  return (
    <div className="career-large-card">
      <img src={career.image} alt={career.title} />

      <div className="career-large-body">
        <div className="career-title-row">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="mini-icon">
              <Icon size={18} />
            </div>
            <span className="demo-tag">{career.category}</span>
          </div>

          <button
            className={`card-bookmark-btn ${isBookmarked ? "bookmarked" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              onToggleBookmark();
            }}
            title={isBookmarked ? "Remove Bookmark" : "Save Career"}
          >
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>

        <h2>{career.title}</h2>
        <p>{career.description}</p>

        <div className="skill-tags">
          {career.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>

        <div className="card-actions">
          <Link className="outline-btn" to={`/careers/${career.id}`}>
            View Profile
          </Link>

          <Link className="primary small" to={`/simulation/${career.id}`}>
            Try 3-Step Simulation
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CAREER DETAILS PAGE
========================================================= */

function CareerDetails({ showToast }) {
  const { id } = useParams();
  const career = careers.find((item) => item.id === id) || careers[0];
  const Icon = career.icon;

  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const saved = localStorage.getItem("pathpilot_bookmarks");
      return saved ? JSON.parse(saved).includes(career.id) : false;
    } catch {
      return false;
    }
  });

  const toggleBookmark = () => {
    try {
      const saved = localStorage.getItem("pathpilot_bookmarks");
      let current = saved ? JSON.parse(saved) : [];
      let updated;
      if (current.includes(career.id)) {
        updated = current.filter((item) => item !== career.id);
        setBookmarked(false);
        showToast(`Removed "${career.title}" from bookmarks.`);
      } else {
        updated = [...current, career.id];
        setBookmarked(true);
        showToast(`Saved "${career.title}" to bookmarks!`);
      }
      localStorage.setItem("pathpilot_bookmarks", JSON.stringify(updated));
    } catch {}
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link className="back-link" to="/careers">
          ← Back to Career Explorer
        </Link>

        <button
          className={`secondary-action-btn ${bookmarked ? "bookmarked" : ""}`}
          onClick={toggleBookmark}
          style={{ marginTop: 25 }}
        >
          <Bookmark size={16} fill={bookmarked ? "#f59e0b" : "none"} color={bookmarked ? "#f59e0b" : "currentColor"} />
          {bookmarked ? "Bookmarked" : "Bookmark Career"}
        </button>
      </div>

      <div className="career-detail">
        <img src={career.image} alt={career.title} />

        <div className="career-detail-content">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div className="mini-icon">
              <Icon size={20} />
            </div>
            <span className="pill">{career.category}</span>
          </div>

          <h1>{career.title}</h1>
          <p>{career.description}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "20px 0" }}>
            <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <small style={{ color: "#64748b", display: "block" }}>Average Salary</small>
              <strong style={{ color: "#0f172a", fontSize: "15px" }}>{career.stats?.salary || "$95,000"}</strong>
            </div>
            <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <small style={{ color: "#64748b", display: "block" }}>Industry Growth</small>
              <strong style={{ color: "#16a34a", fontSize: "15px" }}>{career.stats?.growth || "+20%"}</strong>
            </div>
          </div>

          <h3>Essential Skills</h3>
          <div className="skill-tags">
            {career.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <Link className="primary" to={`/simulation/${career.id}`} style={{ width: "100%", justifyContent: "center" }}>
              Experience This Career (3 Challenges)
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }} className="panel">
        <h2>A Day in the Life of a {career.title}</h2>
        <p style={{ color: "var(--muted)", marginBottom: 18 }}>
          Here is a realistic snapshot of what a typical working day looks like:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {career.dayInLife.map((item, idx) => (
            <div key={idx} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontWeight: 800, color: "var(--blue)", fontSize: "13px", minWidth: 85 }}>{item.time}</span>
              <span style={{ color: "#334155", fontSize: "13px" }}>{item.task}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20 }} className="panel">
        <h2>Primary Tools & Technologies</h2>
        <div className="skill-tags" style={{ marginTop: 12 }}>
          {career.tools.map((tool) => (
            <span key={tool} style={{ background: "#eef5ff", color: "var(--blue)", fontWeight: 700, padding: "8px 12px", borderRadius: 8 }}>
              {tool}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   SIMULATION SELECTOR
========================================================= */

function SimulationSelector() {
  const [completedCareers, setCompletedCareers] = useState(() => {
    try {
      const saved = localStorage.getItem("pathpilot_attempts");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.map((a) => a.career);
    } catch {
      return [];
    }
  });

  return (
    <>
      <PageHeader
        eyebrow="CAREER SIMULATION LAB"
        title="Try the work. Not just the title."
        text="Choose a career. Each career features 3 completely unique, realistic workplace scenarios to test your intuition."
      />

      <div className="simulation-intro panel">
        <div className="simulation-intro-icon">
          <Sparkles />
        </div>

        <div>
          <h2>How it works</h2>
          <p>
            Choose a career → work through 3 realistic scenario questions → submit your answers →
            receive an itemized breakdown and diagnostic career fit insight.
          </p>
        </div>
      </div>

      <div className="simulation-selection-grid">
        {careers.map((career) => {
          const isDone = completedCareers.includes(career.title);

          return (
            <SimulationChoice
              key={career.id}
              career={career}
              isCompleted={isDone}
            />
          );
        })}
      </div>
    </>
  );
}

function SimulationChoice({ career, isCompleted }) {
  const Icon = career.icon;

  return (
    <div className="simulation-choice">
      <img src={career.image} alt={career.title} />

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div className="mini-icon">
            <Icon size={18} />
          </div>
          {isCompleted && (
            <span className="score-badge high">Completed ✓</span>
          )}
        </div>

        <h2>{career.title}</h2>
        <p>{career.tasks.length} Unique Challenges</p>

        <div className="simulation-meta">
          <span>
            <Clock3 size={15} />
            3 Questions • 10 mins
          </span>

          <Link to={`/simulation/${career.id}`}>
            {isCompleted ? "Retake" : "Start"} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIMULATION WORKSPACE (4 LEVELS + LIVE CODING LAB)
========================================================= */

const DIFFICULTY_LEVELS = [
  { id: 1, name: "Beginner", badge: "🟢 Beginner", desc: "Foundational principles & core concepts", color: "level-1" },
  { id: 2, name: "Intermediate", badge: "🔵 Intermediate", desc: "Real-world operational challenges", color: "level-2" },
  { id: 3, name: "Hard", badge: "🟡 Hard", desc: "Complex architectural & optimization dilemmas", color: "level-3" },
  { id: 4, name: "Expert", badge: "🟣 Expert", desc: "Mission-critical, production incidents & high-scale design", color: "level-4" }
];

function Simulation({ showToast }) {
  const { id } = useParams();
  const career = careers.find((item) => item.id === id) || careers[0];
  const courseId = career.courseId || 1;
  const hasCoding = career.hasCoding !== false;

  // Selected Difficulty (1: Beginner, 2: Intermediate, 3: Hard, 4: Expert)
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);
  const [activeMode, setActiveMode] = useState("scenario"); // "scenario" | "coding"

  // Scenario Mode State
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  // Coding Lab State
  const [codingChallenge, setCodingChallenge] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  // Filter tasks for selected difficulty
  const questionsForLevel = useMemo(() => {
    const matched = career.tasks.filter((t) => (t.level || t.id) === selectedDifficulty);
    return matched.length > 0 ? matched : [career.tasks[selectedDifficulty - 1] || career.tasks[0]];
  }, [career, selectedDifficulty]);

  const currentQ = questionsForLevel[0] || career.tasks[0];

  // Fetch coding challenge when difficulty or career changes
  useEffect(() => {
    if (!hasCoding) {
      setActiveMode("scenario");
      return;
    }

    let isMounted = true;
    setLoadingChallenge(true);

    fetch(`/api/coding/challenges/${courseId}?difficultyId=${selectedDifficulty}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.challenges && data.challenges.length > 0) {
          const ch = data.challenges[0];
          setCodingChallenge(ch);
          setUserCode(ch.starter_code || "");
        } else {
          // Fallback starter template
          const fallback = {
            id: 100 + selectedDifficulty,
            question: `${career.title} Level ${selectedDifficulty} Challenge: Implement core algorithm according to specification.`,
            starter_code: `function solution(input) {\n  // Write your Level ${selectedDifficulty} solution here\n  return input;\n}`,
            test_cases: [
              { call: "solution(42)", expected: 42, description: "Basic identity test" }
            ],
            marks: selectedDifficulty * 10
          };
          setCodingChallenge(fallback);
          setUserCode(fallback.starter_code);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        const fallback = {
          id: 100 + selectedDifficulty,
          question: `${career.title} Level ${selectedDifficulty} Challenge`,
          starter_code: `function solve(val) {\n  return val;\n}`,
          test_cases: [{ call: "solve(1)", expected: 1, description: "Test" }],
          marks: 10
        };
        setCodingChallenge(fallback);
        setUserCode(fallback.starter_code);
      })
      .finally(() => {
        if (isMounted) setLoadingChallenge(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseId, selectedDifficulty, hasCoding]);

  // Reset state on career switch
  useEffect(() => {
    setSelectedDifficulty(1);
    setAnswers({});
    setSubmitted(false);
    setEvaluation(null);
    setExecutionResult(null);
    setCodeSubmitted(false);
  }, [id]);

  const handleSelectDifficulty = (levelId) => {
    setSelectedDifficulty(levelId);
    setAnswers({});
    setSubmitted(false);
    setEvaluation(null);
    setExecutionResult(null);
    setCodeSubmitted(false);
    showToast(`Switched to Level ${levelId}: ${DIFFICULTY_LEVELS[levelId - 1].name}`);
  };

  const handleSelectOption = (optionIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const submitScenarioTask = async () => {
    const userSelectedIdx = answers[currentQ.id];
    if (userSelectedIdx === undefined) {
      alert("Please select an answer before submitting.");
      return;
    }

    const isCorrect = userSelectedIdx === currentQ.correct;
    const finalScore = isCorrect ? 100 : 0;

    const evalResult = {
      career: career.title,
      careerId: career.id,
      difficultyLevel: selectedDifficulty,
      difficultyName: DIFFICULTY_LEVELS[selectedDifficulty - 1].name,
      score: finalScore,
      correctCount: isCorrect ? 1 : 0,
      totalQuestions: 1,
      details: [
        {
          questionId: currentQ.id,
          title: currentQ.title,
          question: currentQ.question,
          userAnswer: currentQ.options[userSelectedIdx],
          correctAnswer: currentQ.options[currentQ.correct],
          isCorrect,
          explanation: currentQ.explanation,
        },
      ],
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    setEvaluation(evalResult);
    setSubmitted(true);

    localStorage.setItem("pathpilot-last-result", JSON.stringify(evalResult));

    try {
      const historyStr = localStorage.getItem("pathpilot_attempts");
      const history = historyStr ? JSON.parse(historyStr) : [];
      history.unshift({
        id: Date.now(),
        ...evalResult,
      });
      localStorage.setItem("pathpilot_attempts", JSON.stringify(history.slice(0, 15)));
    } catch {}

    // Send attempt to server API with difficultyId
    try {
      const token = localStorage.getItem("pathpilot_token");
      fetch("/api/tests/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: currentUser?.id || null,
          courseId,
          difficultyId: selectedDifficulty,
          answers: [
            {
              questionId: currentQ.id,
              selectedAnswer: currentQ.options[userSelectedIdx],
            },
          ],
        }),
      }).catch(() => {});
    } catch {}

    showToast(isCorrect ? `Correct! 100% on Level ${selectedDifficulty} challenge!` : "Incorrect. Review the explanation below.");
  };

  const handleRunCode = async () => {
    if (!userCode.trim()) {
      showToast("Please enter code before running tests.");
      return;
    }

    setIsRunningCode(true);
    setExecutionResult(null);

    try {
      const res = await fetch("/api/coding/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "javascript",
          code: userCode,
          testCases: codingChallenge?.test_cases || [],
        }),
      });

      const data = await res.json();
      setExecutionResult(data);

      if (data.allPassed) {
        showToast("🎉 Perfect! All unit tests passed in " + data.durationMs + "ms!");
      } else if (data.success) {
        showToast("Some tests failed. Check console output.");
      } else {
        showToast("Error: " + (data.error || "Execution failed"));
      }
    } catch (err) {
      showToast("Execution request failed: " + err.message);
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!executionResult) {
      showToast("Please run and test your code first before submitting.");
      return;
    }

    const passedCount = executionResult.results?.filter((r) => r.passed).length || 0;
    const totalCases = executionResult.results?.length || 1;
    const finalScore = Math.round((passedCount / totalCases) * 100);

    const evalResult = {
      career: career.title,
      careerId: career.id,
      difficultyLevel: selectedDifficulty,
      difficultyName: DIFFICULTY_LEVELS[selectedDifficulty - 1].name,
      score: finalScore,
      correctCount: passedCount,
      totalQuestions: totalCases,
      type: "coding",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    localStorage.setItem("pathpilot-last-result", JSON.stringify(evalResult));

    try {
      const historyStr = localStorage.getItem("pathpilot_attempts");
      const history = historyStr ? JSON.parse(historyStr) : [];
      history.unshift({ id: Date.now(), ...evalResult });
      localStorage.setItem("pathpilot_attempts", JSON.stringify(history.slice(0, 15)));
    } catch {}

    try {
      const token = localStorage.getItem("pathpilot_token");
      fetch("/api/tests/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: currentUser?.id || null,
          courseId,
          difficultyId: selectedDifficulty,
          answers: [],
        }),
      }).catch(() => {});
    } catch {}

    setCodeSubmitted(true);
    showToast(`Coding Challenge Submitted! Score: ${finalScore}%`);
  };

  const handleLevelUp = () => {
    if (selectedDifficulty < 4) {
      const next = selectedDifficulty + 1;
      setSelectedDifficulty(next);
      setSubmitted(false);
      setAnswers({});
      setEvaluation(null);
      setExecutionResult(null);
      setCodeSubmitted(false);
      showToast(`Leveled up to Level ${next}: ${DIFFICULTY_LEVELS[next - 1].name}!`);
    }
  };

  const resetCurrentScenario = () => {
    setAnswers({});
    setSubmitted(false);
    setEvaluation(null);
  };

  const resetStarterCode = () => {
    if (codingChallenge?.starter_code) {
      setUserCode(codingChallenge.starter_code);
      setExecutionResult(null);
      setCodeSubmitted(false);
      showToast("Starter code restored.");
    }
  };

  const activeLevelConfig = DIFFICULTY_LEVELS[selectedDifficulty - 1];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link className="back-link" to="/simulation">
          ← Back to Simulations
        </Link>
      </div>

      <PageHeader
        eyebrow={`${career.title.toUpperCase()} • SIMULATION & CODING LAB`}
        title={activeMode === "coding" ? `Live Coding Challenge: ${career.title}` : `Workplace Dilemma: ${currentQ.title}`}
        text={activeMode === "coding" ? "Solve real-world algorithm and systems challenges directly in the isolated sandbox." : currentQ.description}
      />

      {/* =========================================================
          1. 4-LEVEL DIFFICULTY SELECTOR
      ========================================================= */}
      <div className="difficulty-pill-bar">
        <span className="difficulty-label">Difficulty Level:</span>
        {DIFFICULTY_LEVELS.map((lvl) => (
          <button
            key={lvl.id}
            className={`diff-btn ${lvl.color} ${selectedDifficulty === lvl.id ? "active" : ""}`}
            onClick={() => handleSelectDifficulty(lvl.id)}
            title={lvl.desc}
          >
            <span>{lvl.badge}</span>
          </button>
        ))}

        <div style={{ marginLeft: "auto", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          {activeLevelConfig.desc}
        </div>
      </div>

      {/* =========================================================
          2. MODE SWITCHER TABS (Scenario vs Coding Lab)
      ========================================================= */}
      {hasCoding && (
        <div className="sim-mode-toggle">
          <button
            className={`sim-mode-tab ${activeMode === "scenario" ? "active" : ""}`}
            onClick={() => setActiveMode("scenario")}
          >
            <BookOpen size={16} />
            Scenario Challenge (Level {selectedDifficulty})
          </button>

          <button
            className={`sim-mode-tab ${activeMode === "coding" ? "active" : ""}`}
            onClick={() => setActiveMode("coding")}
          >
            <Code2 size={16} />
            Live Coding Lab (Level {selectedDifficulty})
          </button>
        </div>
      )}

      <div className="simulation-layout">
        <div className="simulation-main panel">
          {/* =========================================================
              A. SCENARIO CHALLENGE MODE
          ========================================================= */}
          {activeMode === "scenario" && (
            <>
              <div className="question-nav-header">
                <div>
                  <span className={`pill ${activeLevelConfig.color}`} style={{ marginBottom: 4 }}>
                    {activeLevelConfig.badge} • {currentQ.levelName || activeLevelConfig.name}
                  </span>
                  <h3 style={{ margin: "4px 0 0" }}>{currentQ.title}</h3>
                </div>
              </div>

              {/* Optional Dataset table (e.g. for Data Analyst) */}
              {currentQ.dataset && (
                <div className="dataset-box">
                  <h3>Scenario Dataset</h3>
                  <table>
                    <tbody>
                      {currentQ.dataset.map((row, index) => (
                        <tr key={index}>
                          {row.map((cell, cellIndex) =>
                            index === 0 ? (
                              <th key={cellIndex}>{cell}</th>
                            ) : (
                              <td key={cellIndex}>{cell}</td>
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Active Question Box */}
              <div className="question-box">
                <span>SCENARIO LEVEL {selectedDifficulty}</span>
                <h2>{currentQ.question}</h2>

                <div className="answer-options">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = answers[currentQ.id] === optIdx;
                    let btnClass = isSelected ? "answer selected" : "answer";

                    if (submitted && evaluation) {
                      if (optIdx === currentQ.correct) {
                        btnClass = "answer selected";
                      }
                    }

                    return (
                      <button
                        key={option}
                        disabled={submitted}
                        className={btnClass}
                        onClick={() => handleSelectOption(optIdx)}
                      >
                        <span>{String.fromCharCode(65 + optIdx)}</span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation / Submit Controls */}
              {!submitted ? (
                <div className="simulation-footer-nav">
                  <div style={{ color: "#64748b", fontSize: "13px" }}>
                    Select your best response to complete Level {selectedDifficulty}.
                  </div>

                  <button className="primary" onClick={submitScenarioTask}>
                    Submit Level {selectedDifficulty} Answer
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              ) : (
                <div>
                  {/* Score Summary */}
                  <div
                    style={{
                      padding: "16px 20px",
                      borderRadius: 12,
                      background: evaluation.score >= 70 ? "#ecfdf5" : "#eff6ff",
                      border: `1px solid ${evaluation.score >= 70 ? "#a7f3d0" : "#bfdbfe"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "18px", color: evaluation.score >= 70 ? "#065f46" : "#1e40af" }}>
                        {evaluation.score === 100 ? "Level Passed with 100%!" : "Scenario Attempted: 0%"}
                      </strong>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#475569" }}>
                        {evaluation.score === 100
                          ? `Great intuition! You demonstrated strong reasoning for ${activeLevelConfig.name} situations.`
                          : "Review the correct analysis below to strengthen your approach."}
                      </p>
                    </div>

                    <Link className="primary" to="/report">
                      View Full Report
                      <ArrowRight size={16} />
                    </Link>
                  </div>

                  {/* Adaptive Level Up Banner */}
                  {evaluation.score >= 70 && selectedDifficulty < 4 && (
                    <div className="level-up-card">
                      <div>
                        <strong style={{ color: "#065f46", fontSize: "16px", display: "block" }}>
                          🎉 Level {selectedDifficulty} Mastered!
                        </strong>
                        <span style={{ color: "#047857", fontSize: "13px" }}>
                          You are ready to advance to Level {selectedDifficulty + 1} ({DIFFICULTY_LEVELS[selectedDifficulty].name}).
                        </span>
                      </div>
                      <button className="primary" onClick={handleLevelUp}>
                        Level Up to {DIFFICULTY_LEVELS[selectedDifficulty].name} →
                      </button>
                    </div>
                  )}

                  {/* Review Detail */}
                  <h3 style={{ marginTop: 24 }}>Diagnostic Review:</h3>
                  <div className="all-questions-review">
                    {evaluation.details.map((item, idx) => (
                      <div key={idx} className={`review-item-card ${item.isCorrect ? "correct" : "wrong"}`}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <strong style={{ fontSize: "14px" }}>
                            {activeLevelConfig.badge}: {item.title}
                          </strong>
                          <span className={`score-badge ${item.isCorrect ? "high" : "low"}`}>
                            {item.isCorrect ? "Correct ✓" : "Incorrect ✗"}
                          </span>
                        </div>

                        <p style={{ fontSize: "13px", color: "#334155", margin: "4px 0 8px" }}>
                          <strong>Prompt:</strong> {item.question}
                        </p>

                        <div style={{ fontSize: "12px", marginBottom: 6 }}>
                          <span style={{ color: item.isCorrect ? "#15803d" : "#b91c1c", fontWeight: 700 }}>
                            Your Choice: {item.userAnswer}
                          </span>
                        </div>

                        {!item.isCorrect && (
                          <div style={{ fontSize: "12px", color: "#15803d", fontWeight: 700, marginBottom: 6 }}>
                            Correct Solution: {item.correctAnswer}
                          </div>
                        )}

                        <div className="explanation-card" style={{ marginTop: 8, fontSize: "12px" }}>
                          <strong>Why this matters:</strong> {item.explanation}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="action-row-buttons" style={{ marginTop: 20 }}>
                    <button className="secondary-action-btn" onClick={resetCurrentScenario}>
                      Try This Question Again
                    </button>

                    {selectedDifficulty < 4 && (
                      <button className="primary" onClick={handleLevelUp}>
                        Advance to Level {selectedDifficulty + 1} →
                      </button>
                    )}

                    <Link className="secondary-action-btn" to="/simulation">
                      Try Another Career
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}

          {/* =========================================================
              B. LIVE INTERACTIVE CODING LAB
          ========================================================= */}
          {activeMode === "coding" && (
            <div className="coding-lab-panel">
              {/* Problem Prompt */}
              <div className="coding-prompt-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span className={`pill ${activeLevelConfig.color}`}>
                    {activeLevelConfig.badge} • Coding Challenge
                  </span>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
                    {codingChallenge?.marks || 10} Marks
                  </span>
                </div>
                <h3>{codingChallenge?.question ? codingChallenge.question.split(":")[0] : "Problem Statement"}</h3>
                <p>{codingChallenge?.question ? codingChallenge.question : "Loading problem specification..."}</p>
              </div>

              {/* Code Editor */}
              <div className="coding-editor-container">
                <div className="coding-editor-header">
                  <div className="editor-header-left">
                    <div className="editor-dots">
                      <span className="editor-dot red"></span>
                      <span className="editor-dot yellow"></span>
                      <span className="editor-dot green"></span>
                    </div>
                    <span className="editor-filename">solution.js</span>
                    <span style={{ color: "#64748b", marginLeft: 6 }}>• Node.js Sandbox</span>
                  </div>

                  <button
                    onClick={resetStarterCode}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    <RotateCcw size={13} /> Reset Starter Code
                  </button>
                </div>

                <textarea
                  className="coding-textarea"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="// Write your solution here..."
                  spellCheck="false"
                  rows={10}
                />
              </div>

              {/* Action Controls */}
              <div className="coding-controls-bar">
                <button
                  className="run-btn"
                  onClick={handleRunCode}
                  disabled={isRunningCode || loadingChallenge}
                >
                  <Play size={16} fill="white" />
                  {isRunningCode ? "Running In Sandbox..." : "Run Code & Run Tests"}
                </button>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="submit-code-btn"
                    onClick={handleSubmitCode}
                    disabled={!executionResult || codeSubmitted}
                  >
                    <CheckCircle2 size={16} />
                    {codeSubmitted ? "Submitted ✓" : "Submit Solution"}
                  </button>
                </div>
              </div>

              {/* Execution Console Output */}
              {executionResult && (
                <div className="coding-output-console">
                  <div className="console-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Terminal size={14} />
                      <span style={{ fontWeight: 700, color: "#e2e8f0" }}>Test Execution Console</span>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <span className={`test-badge ${executionResult.allPassed ? "pass" : "fail"}`}>
                        {executionResult.allPassed ? "All Tests Passed ✓" : "Tests Failed"}
                      </span>
                      <span className="test-badge duration">
                        ⏱️ {executionResult.durationMs}ms
                      </span>
                    </div>
                  </div>

                  <div className="console-body">
                    {/* Test Case Cards */}
                    <div className="test-cases-summary">
                      {executionResult.results?.map((tc) => (
                        <div key={tc.testIndex} className={`test-case-card ${tc.passed ? "passed" : "failed"}`} style={{ width: "100%" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="test-case-call">
                              <strong>Test {tc.testIndex}:</strong> <code>{tc.call}</code>
                            </span>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: tc.passed ? "#34d399" : "#f87171" }}>
                              {tc.passed ? "PASS ✓" : "FAIL ✗"}
                            </span>
                          </div>

                          <div className="test-case-diff">
                            <div className="expected-box">
                              Expected: <code>{JSON.stringify(tc.expected)}</code>
                            </div>
                            <div className={`actual-box ${tc.passed ? "match" : "mismatch"}`}>
                              Actual: <code>{JSON.stringify(tc.actual)}</code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Standard Output Log */}
                    {executionResult.stdout && (
                      <div className="stdout-box">
                        <div style={{ color: "#94a3b8", marginBottom: 4, fontWeight: 700 }}>Console Standard Output:</div>
                        <code>{executionResult.stdout}</code>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Level Up Banner on Successful Coding Run */}
              {executionResult?.allPassed && selectedDifficulty < 4 && (
                <div className="level-up-card">
                  <div>
                    <strong style={{ color: "#065f46", fontSize: "16px", display: "block" }}>
                      🌟 Level {selectedDifficulty} ({activeLevelConfig.name}) Challenge Solved!
                    </strong>
                    <span style={{ color: "#047857", fontSize: "13px" }}>
                      All tests passed! Ready to tackle the Level {selectedDifficulty + 1} ({DIFFICULTY_LEVELS[selectedDifficulty].name}) challenge?
                    </span>
                  </div>
                  <button className="primary" onClick={handleLevelUp}>
                    Advance to Level {selectedDifficulty + 1} ({DIFFICULTY_LEVELS[selectedDifficulty].name}) Challenge →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Practice Skills Sidebar */}
        <aside className="simulation-side panel">
          <h3>Skills Evaluated</h3>

          {career.skills.map((skill) => (
            <div className="practice-skill" key={skill}>
              <CheckCircle2 size={17} />
              {skill}
            </div>
          ))}

          <div className="demo-note" style={{ marginTop: 20 }}>
            <Sparkles size={18} />
            <p>
              4 difficulty levels (Beginner, Intermediate, Hard, Expert) with instant sandboxed code testing and performance-based level up.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

/* =========================================================
   PERFORMANCE REPORT WITH EXPORT & PRINT
========================================================= */

function PerformanceReport({ showToast }) {
  const stored = (() => {
    try {
      const raw = localStorage.getItem("pathpilot-last-result");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const careerName = stored?.career || "Software Developer";
  const score = stored?.score !== undefined ? stored.score : 88;
  const isHigh = score >= 70;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `PathPilot Simulation Report: ${careerName} - Score: ${score}/100. Strengths: Problem solving, structured reasoning. Explore at ${window.location.origin}`;
    navigator.clipboard.writeText(summary);
    showToast("Report summary copied to clipboard!");
  };

  const strengths = isHigh
    ? [
        "Structured technical problem diagnosis across multi-step scenarios",
        "Validating assumptions before executing decisions",
        "Clear adherence to industry best practices and standards",
      ]
    : [
        "Engagement with unfamiliar problem domains",
        "Willingness to explore technical processes",
        "Curiosity for troubleshooting methods",
      ];

  const improvements = isHigh
    ? [
        "Deepen familiarity with enterprise production tooling",
        "Practice handling edge cases in distributed architectures",
        "Refine trade-off articulation with cross-functional stakeholders",
      ]
    : [
        "Review foundational domain fundamentals",
        "Inspect error logs and console messages systematically",
        "Develop structured heuristics before guessing solutions",
      ];

  const skillsToBuild = [
    `${careerName} Core Tooling`,
    "Analytical Problem Solving",
    "Systems Architecture & Data Flow",
    "Effective Technical Communication",
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <PageHeader
          eyebrow="PERFORMANCE REPORT"
          title="Your Simulation Results."
          text="A comprehensive breakdown of your diagnostic behaviors and actionable next steps."
        />

        <div className="action-row-buttons" style={{ marginTop: 0 }}>
          <button className="secondary-action-btn" onClick={handlePrint} title="Print or Save PDF">
            <Printer size={16} />
            Print Report
          </button>
          <button className="secondary-action-btn" onClick={handleCopySummary} title="Copy Summary">
            <Copy size={16} />
            Share Result
          </button>
        </div>
      </div>

      <div className="report-warning">
        <Sparkles size={18} />
        <span>
          Simulation feedback generated for <strong>{careerName}</strong>.
          {stored?.correctCount !== undefined && ` (${stored.correctCount} of ${stored.totalQuestions || 3} scenario challenges mastered).`}
        </span>
      </div>

      <div className="report-top-grid">
        <div className="score-card panel">
          <span>Simulation Score</span>
          <strong>{score}</strong>
          <small>/ 100 Overall Performance</small>

          <div
            className="score-ring"
            style={{
              background: `radial-gradient(circle, white 55%, transparent 57%), conic-gradient(${
                isHigh ? "#16a064" : "#1469eb"
              } ${score}%, #e8eef7 ${score}%)`,
            }}
          >
            <div style={{ color: isHigh ? "#16a064" : "#1469eb" }}>{score}%</div>
          </div>
        </div>

        <div className="panel">
          <span className="eyebrow">CAREER EVALUATED</span>
          <h2>{careerName}</h2>
          <p>
            Your responses demonstrated behaviors aligned with analytical problem
            solving and systematic investigation in this field.
          </p>

          <div className="action-row-buttons">
            <Link className="primary" to="/fit-insights">
              View Career Fit Insight
              <ArrowRight size={18} />
            </Link>

            <Link className="secondary-action-btn" to={`/simulation/${stored?.careerId || "software-developer"}`}>
              Retake Simulation
            </Link>
          </div>
        </div>
      </div>

      <div className="report-grid-new">
        <div className="panel">
          <h2>
            <Award /> Strengths Exhibited
          </h2>
          {strengths.map((item) => (
            <div className="report-item positive" key={item}>
              <CheckCircle2 size={18} />
              {item}
            </div>
          ))}
        </div>

        <div className="panel">
          <h2>
            <TrendingUp /> Areas for Growth
          </h2>
          {improvements.map((item) => (
            <div className="report-item" key={item}>
              <TrendingUp size={18} />
              {item}
            </div>
          ))}
        </div>

        <div className="panel">
          <h2>
            <Target /> Recommended Skills
          </h2>
          {skillsToBuild.map((item) => (
            <div className="report-item" key={item}>
              <Target size={18} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Itemized Questions Review if present */}
      {stored?.details && (
        <div className="panel" style={{ marginTop: 24 }}>
          <h2>Detailed Challenge Breakdown</h2>
          <div className="all-questions-review">
            {stored.details.map((item, idx) => (
              <div key={idx} className={`review-item-card ${item.isCorrect ? "correct" : "wrong"}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>Challenge {idx + 1}: {item.title}</strong>
                  <span className={`score-badge ${item.isCorrect ? "high" : "low"}`}>
                    {item.isCorrect ? "Mastered ✓" : "Needs Review ✗"}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#475569", margin: "6px 0" }}>{item.question}</p>
                <div style={{ fontSize: "12px", color: item.isCorrect ? "#15803d" : "#b91c1c", fontWeight: 700 }}>
                  Selected: {item.userAnswer}
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fit-disclaimer" style={{ background: "#fffbeb", border: "1px solid #fef08a", color: "#854d0e", padding: "12px 16px", borderRadius: "10px", marginTop: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
        <Sparkles size={18} style={{ color: "#eab308", flexShrink: 0 }} />
        <div>
          <strong>Demo Career-Fit Insight — Not a professional assessment</strong>
          <div style={{ marginTop: 2, fontSize: 12, color: "#a16207" }}>
            PathPilot fit signals reflect diagnostic performance patterns across your completed simulation challenges to guide self-directed learning.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Link className="secondary-action-btn" to="/careers">
          Explore Other Career Pathways →
        </Link>
      </div>
    </>
  );
}

/* =========================================================
   CAREER FIT INSIGHTS (DYNAMICALLY MATCHED TO SIMULATION)
========================================================= */

function CareerFit({ showToast }) {
  const stored = (() => {
    try {
      const raw = localStorage.getItem("pathpilot-last-result");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const currentCareer = stored?.career || "Software Developer";
  const fitScore = stored?.score !== undefined ? stored.score : 85;

  return (
    <>
      <PageHeader
        eyebrow="CAREER FIT INSIGHTS"
        title="What did your experience reveal?"
        text="Reflect on how your natural problem-solving tendencies match the demands of this profession."
      />

      <div className="fit-card">
        <div className="fit-header">
          <div className="fit-icon">
            <Target />
          </div>

          <div>
            <span className="pill">Fit Analysis</span>
            <h2>{currentCareer}</h2>
          </div>
        </div>

        <div className="fit-meter">
          <div>
            <span>Observed Alignment Signal</span>
            <strong>{fitScore}%</strong>
          </div>

          <div className="meter">
            <i style={{ width: `${fitScore}%`, background: fitScore >= 70 ? "#16a064" : "#1469eb" }} />
          </div>
        </div>

        <p className="fit-description">
          Based on your simulation approach for <strong>{currentCareer}</strong>,
          you demonstrated behavioral affinity for structured investigation,
          validating premises, and executing deliberate decisions.
        </p>

        <div className="fit-columns">
          <div>
            <h3>Why this field fits you</h3>
            <ul>
              <li>Comfortable decomposing unstructured challenges</li>
              <li>Instinctively verifies data before committing decisions</li>
              <li>Values practical, measurable outcomes over guesswork</li>
            </ul>
          </div>

          <div>
            <h3>What to explore next</h3>
            <ul>
              <li>Hands-on starter projects and portfolio builds</li>
              <li>Foundational principles & industry terminology</li>
              <li>Connecting with working professionals for informal coffee chats</li>
            </ul>
          </div>
        </div>

        <div className="fit-disclaimer" style={{ background: "#fffbeb", border: "1px solid #fef08a", color: "#854d0e", padding: "12px 16px", borderRadius: "10px", marginTop: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
          <Sparkles size={18} style={{ color: "#eab308", flexShrink: 0 }} />
          <div>
            <strong>Demo Career-Fit Insight — Not a professional assessment</strong>
            <div style={{ marginTop: 2, fontSize: 12, color: "#a16207" }}>
              PathPilot fit signals reflect diagnostic performance patterns across your completed simulation challenges to guide self-directed learning.
            </div>
          </div>
        </div>
      </div>

      <div className="next-step">
        <h2>Continue exploring before you commit.</h2>
        <p>
          Compare your comfort and enthusiasm across multiple simulations to find
          what excites you most.
        </p>

        <div className="action-row-buttons">
          <Link className="primary" to="/simulation">
            Try Another Career Simulation
            <ArrowRight />
          </Link>

          <Link className="secondary-action-btn" to="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   DASHBOARD (LIVE REAL-TIME STATS & ATTEMPTS)
========================================================= */

function Dashboard({ currentUser, showToast }) {
  const [attempts, setAttempts] = useState(() => {
    try {
      const saved = localStorage.getItem("pathpilot_attempts");
      return saved ? JSON.parse(saved) : [
        { id: 1, career: "Software Developer", score: 100, date: "Yesterday" },
        { id: 2, career: "Data Analyst", score: 67, date: "3 days ago" },
        { id: 3, career: "UI/UX Designer", score: 100, date: "Last week" },
      ];
    } catch {
      return [];
    }
  });

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem("pathpilot_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const clearHistory = () => {
    localStorage.removeItem("pathpilot_attempts");
    setAttempts([]);
    showToast("Simulation history cleared.");
  };

  const totalSimulations = attempts.length;
  const distinctCareers = new Set(attempts.map((a) => a.career)).size;
  const avgScore =
    totalSimulations > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalSimulations)
      : 0;

  const stats = [
    ["Simulations Completed", String(totalSimulations), CheckCircle2],
    ["Average Score", `${avgScore}%`, Award],
    ["Careers Explored", String(distinctCareers || careers.length), Compass],
    ["Bookmarked Paths", String(bookmarks.length), Bookmark],
  ];

  const userName = currentUser?.name ? currentUser.name.split(" ")[0] : "Rani";

  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">STUDENT DASHBOARD</span>

          <h1>
            Welcome back, {userName} <span>👋</span>
          </h1>

          <p>
            Track your completed simulations, review feedback, and build momentum.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="primary" to="/careers">
            Explore Careers
            <ArrowRight />
          </Link>
        </div>
      </div>

      <div className="dashboard-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {stats.map(([label, value, Icon]) => (
          <div className="dashboard-stat panel" key={label}>
            <div className="dashboard-stat-icon">
              <Icon />
            </div>

            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionTitle title="Recent Simulation Activity" />
            {attempts.length > 0 && (
              <button
                onClick={clearHistory}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "12px", cursor: "pointer" }}
              >
                Clear History
              </button>
            )}
          </div>

          {attempts.length === 0 ? (
            <div className="empty-state" style={{ marginTop: 14 }}>
              <Laptop size={32} style={{ color: "#94a3b8", marginBottom: 8 }} />
              <p>You haven't completed any simulations yet.</p>
              <Link className="primary small" to="/simulation">
                Start Your First Simulation
              </Link>
            </div>
          ) : (
            <div className="activity-list">
              {attempts.map((attempt) => (
                <div className="activity-row" key={attempt.id}>
                  <div className="activity-icon">
                    <CheckCircle2 />
                  </div>

                  <div>
                    <strong>{attempt.career}</strong>
                    <span>Completed {attempt.date}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <b className={`score-badge ${attempt.score >= 70 ? "high" : "medium"}`}>
                      {attempt.score}%
                    </b>
                    <Link
                      to="/report"
                      onClick={() => {
                        localStorage.setItem("pathpilot-last-result", JSON.stringify(attempt));
                      }}
                      className="text-btn"
                      style={{ fontSize: "12px" }}
                    >
                      Report →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Career Card */}
        <div className="panel recommendation">
          <Sparkles size={28} />

          <span className="eyebrow" style={{ marginTop: 12 }}>RECOMMENDED NEXT STEP</span>

          <h2>Try Cloud & DevOps</h2>

          <p>
            You have shown strong problem-solving instinct. Discover how cloud
            engineers architect systems for resilience and automated scale across 3 challenges.
          </p>

          <Link className="primary" to="/simulation/cloud-devops" style={{ marginTop: 14 }}>
            Try Simulation
            <ArrowRight />
          </Link>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   RESOURCES & INTERACTIVE GUIDE READER MODAL
========================================================= */

function Resources({ showToast }) {
  const [activeGuide, setActiveGuide] = useState(null);
  const [readGuides, setReadGuides] = useState(() => {
    try {
      const saved = localStorage.getItem("pathpilot_read_guides");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markGuideAsRead = (title) => {
    if (!readGuides.includes(title)) {
      const updated = [...readGuides, title];
      setReadGuides(updated);
      localStorage.setItem("pathpilot_read_guides", JSON.stringify(updated));
      showToast(`Marked "${title}" as completed!`);
    }
    setActiveGuide(null);
  };

  const guides = [
    {
      title: "Understanding Career Skills: Hard vs Soft",
      category: "Skill Strategy",
      readTime: "4 min read",
      icon: Compass,
      summary: "Understand how technical skills combine with communication and problem solving to unlock career mobility.",
      body: `
### The Power of Complementary Skills
In modern technology and business careers, technical knowledge alone rarely guarantees advancement. What differentiates top performers is the synergy between **Hard Skills** (tools, frameworks, syntax) and **Soft Skills** (active listening, empathy, structured communication).

### Key Takeaways:
1. **Tool Agility Over Tool Dogmatism**: Frameworks evolve every 3-5 years. Focus on underlying architectural principles rather than memorizing libraries.
2. **Clear Written Communication**: Remote and distributed teams rely on concise pull request descriptions, documentation, and RFCs.
3. **Structured Decomposition**: Learn to break high-stakes ambiguity into three to four testable hypotheses.

### Action Checklist:
- Audit your past academic or personal projects: what evidence shows your technical depth?
- Practice explaining a complex concept to someone outside your field in under 2 minutes.
      `,
    },
    {
      title: "Building Your First Portfolio That Gets Noticed",
      category: "Portfolio & Projects",
      readTime: "5 min read",
      icon: BookOpen,
      summary: "Practical guide to turning coursework and simulations into compelling evidence that hiring teams respect.",
      body: `
### Quality Over Quantity
Hiring managers spend an average of 45 seconds scanning an applicant's portfolio. Three deeply polished projects with complete readmes outperform twenty superficial tutorial clones.

### What Makes a Project Stand Out:
- **Solve a Concrete Problem**: Build something that answers a real friction point rather than a cookie-cutter to-do app.
- **Document Your Thought Process**: Include architectural diagrams, technical trade-offs considered, and what you would do differently.
- **Deploy Live Demos**: Ensure your application has a live URL and clean GitHub repository.

### Action Checklist:
- Polish your top project's README with installation instructions and screenshot walkthroughs.
- Write a short case study on the biggest bug you encountered and how you diagnosed it.
      `,
    },
    {
      title: "Preparing for Internships: The Student Playbook",
      category: "Career Launch",
      readTime: "6 min read",
      icon: Award,
      summary: "Actionable roadmap for finding, applying, and interviewing for your first professional internship.",
      body: `
### Demystifying the Early Career Search
The earliest stage of any career feels like a catch-22: you need experience to get an internship, but need an internship to get experience. Simulations and self-directed work bridge this gap.

### Strategic Steps:
1. **Target Growth Domains**: Apply to mid-sized teams where interns touch production systems early.
2. **Network Informally**: Reach out to university alumni working at target companies for 15-minute informational interviews.
3. **Practice Behavioral Storytelling**: Use the STAR method (Situation, Task, Action, Result) to articulate past teamwork.

### Action Checklist:
- Draft a single-page resume emphasizing project outcomes over course lists.
- Set a goal to connect with 3 working engineers or designers this month.
      `,
    },
    {
      title: "Choosing Between Tech, Data, and Design",
      category: "Direction & Fit",
      readTime: "5 min read",
      icon: Target,
      summary: "Compare day-to-day realities and cognitive demands across the three biggest digital career disciplines.",
      body: `
### Finding Where You Naturally Thrive
- **Engineering / Development**: Best for those who enjoy systemic logic, debugging puzzles, building resilient mechanics, and seeing code run.
- **Data & Analytics**: Ideal for individuals who love hunting for patterns, formulating statistical hypotheses, and translating numbers into business direction.
- **UI/UX Design**: Perfect for visually minded problem solvers who champion user accessibility, empathy, and intuitive flow.

### Next Steps:
Try simulations across each domain on PathPilot to feel which tasks energize you rather than exhaust you!
      `,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="RESOURCES & STUDENT GUIDES"
        title="Keep learning after your simulation."
        text="Practical guides written for students and early professionals navigating career choices."
      />

      <div className="resource-grid-new">
        {guides.map((guide) => {
          const Icon = guide.icon;
          const isCompleted = readGuides.includes(guide.title);

          return (
            <div className="resource-card panel" key={guide.title}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="resource-icon">
                  <Icon />
                </div>
                {isCompleted && (
                  <span className="score-badge high">Read ✓</span>
                )}
              </div>

              <div className="reading-badge" style={{ marginBottom: 6 }}>
                <Clock3 size={13} />
                <span>{guide.readTime}</span> • <span>{guide.category}</span>
              </div>

              <h2>{guide.title}</h2>
              <p>{guide.summary}</p>

              <button
                className="text-btn"
                onClick={() => setActiveGuide(guide)}
                style={{ marginTop: "auto", paddingTop: 14 }}
              >
                Read Guide
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Interactive Guide Reader Modal */}
      {activeGuide && (
        <div className="modal-backdrop" onClick={() => setActiveGuide(null)}>
          <div className="guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="guide-modal-header">
              <div>
                <span className="pill">{activeGuide.category}</span>
                <h2>{activeGuide.title}</h2>
                <div className="reading-badge" style={{ marginTop: 4 }}>
                  <Clock3 size={13} />
                  <span>{activeGuide.readTime}</span>
                </div>
              </div>

              <button onClick={() => setActiveGuide(null)} title="Close">
                <X size={18} />
              </button>
            </div>

            <div className="guide-modal-body">
              <div
                dangerouslySetInnerHTML={{
                  __html: activeGuide.body
                    .replace(/### (.*?)\n/g, "<h3>$1</h3>")
                    .replace(/\n- (.*?)(?=\n|$)/g, "<li>$1</li>")
                    .replace(/<li>/g, "<ul><li>")
                    .replace(/<\/li>(?!<li>)/g, "</li></ul>")
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                }}
              />
            </div>

            <div className="guide-modal-footer">
              <button
                className="secondary-action-btn"
                onClick={() => setActiveGuide(null)}
              >
                Close
              </button>

              <button
                className="primary"
                onClick={() => markGuideAsRead(activeGuide.title)}
              >
                Mark as Completed ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   COMMON UI COMPONENTS
========================================================= */

function PageHeader({ eyebrow, title, text }) {
  return (
    <div className="page-header-new">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

function SectionTitle({ title, link, to }) {
  return (
    <div className="section-title-new">
      <h2>{title}</h2>

      {link && to && (
        <Link to={to}>
          {link}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

export default App;