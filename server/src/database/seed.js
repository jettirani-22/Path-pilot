export async function seedDatabaseIfEmpty(engine, queryOneFn, executeFn) {
    try {
        console.log(`🌱 Checking & Seeding PathPilot ${engine} database with 4 difficulty levels, 32 scenario simulations, and 20 live coding challenges...`);

        // =========================================================================
        // 1. DIFFICULTY LEVELS (Beginner, Intermediate, Hard, Expert)
        // =========================================================================
        const difficulties = [
            [1, "Beginner", "Foundational introduction to key principles and baseline concepts", 1],
            [2, "Intermediate", "Real-world operational challenges and practical problem solving", 2],
            [3, "Hard", "Complex architectural, diagnostic, and optimization dilemmas", 3],
            [4, "Expert", "Mission-critical, production incident response and enterprise system design", 4]
        ];

        for (const [id, name, desc, order] of difficulties) {
            await executeFn(
                engine === "postgres"
                    ? "INSERT INTO difficulty_levels (id, name, description, sort_order) VALUES (?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order"
                    : "INSERT OR REPLACE INTO difficulty_levels (id, name, description, sort_order) VALUES (?, ?, ?, ?)",
                [id, name, desc, order]
            );
        }

        // =========================================================================
        // 2. COURSES / CAREERS (8 Core Tracks)
        // =========================================================================
        const courses = [
            [1, "Software Developer", "Design, build and improve modern applications and solve technical challenges.", "Engineering", "Code2", 1],
            [2, "Data Analyst", "Work with datasets to discover patterns, explain business trends and support decisions.", "Data & AI", "Database", 1],
            [3, "UI/UX Designer", "Research user needs and design clear, intuitive and engaging digital interfaces.", "Design", "Palette", 0],
            [4, "Digital Marketer", "Connect innovative products with targeted audiences and drive impactful engagement.", "Marketing", "Megaphone", 0],
            [5, "Cloud & DevOps Engineer", "Architect resilient cloud infrastructure and automate rapid software delivery pipelines.", "Engineering", "Cloud", 1],
            [6, "Cybersecurity Analyst", "Protect organizations from cyber threats, secure systems, and respond to breaches.", "Security", "Shield", 1],
            [7, "AI & Machine Learning Specialist", "Train intelligent models, optimize algorithms, and solve domain problems with predictive AI.", "Data & AI", "Cpu", 1],
            [8, "Product Manager", "Define product roadmaps, align business goals with user needs, and guide cross-functional teams.", "Product & Strategy", "Compass", 0]
        ];

        for (const [id, name, desc, cat, icon, reqCoding] of courses) {
            await executeFn(
                engine === "postgres"
                    ? "INSERT INTO courses (id, name, description, category, icon, requires_coding) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET requires_coding = EXCLUDED.requires_coding"
                    : "INSERT OR REPLACE INTO courses (id, name, description, category, icon, requires_coding) VALUES (?, ?, ?, ?, ?, ?)",
                [id, name, desc, cat, icon, reqCoding]
            );
        }

        // =========================================================================
        // 3. SCENARIO / MCQ QUESTIONS (4 levels: Beginner, Intermediate, Hard, Expert)
        // =========================================================================
        const scenarioQuestions = [
            // ---------- 1. Software Developer ----------
            [
                1, 1,
                "A student application has a login button that stops responding. The browser console shows 'TypeError: Cannot read properties of undefined (reading token)'. What is the most likely root cause?",
                "Change the login button styling color",
                "The API response did not contain a 'token' property, causing code accessing response.data.token to throw a runtime error; add null checking and validate API response structure",
                "Reboot the production database immediately",
                "Delete the HTML form from source code",
                "The API response did not contain a 'token' property, causing code accessing response.data.token to throw a runtime error; add null checking and validate API response structure",
                "The error indicates that JavaScript tried to read .token on an undefined object, meaning the authentication API response was either missing, unsuccessful, or formatted differently than expected.",
                1
            ],
            [
                1, 2,
                "Which HTTP method and status code are standard for updating an existing user record in a RESTful API?",
                "GET with status 200 OK",
                "PATCH or PUT with status 200 OK (or 204 No Content)",
                "DELETE with status 404 Not Found",
                "POST with status 301 Moved Permanently",
                "PATCH or PUT with status 200 OK (or 204 No Content)",
                "In REST conventions, PUT (full replacement) or PATCH (partial update) are the standard HTTP methods for modifying existing resources.",
                2
            ],
            [
                1, 3,
                "During a team sprint, Git reports a merge conflict in App.jsx when merging your branch into main. What is the standard procedure to resolve this?",
                "Delete the .git folder and start a new repository",
                "Open the conflicted file, locate the conflict markers (<<<<<<<, =======, >>>>>>>), reconcile changes with teammates if needed, test, and commit the resolution",
                "Force push with --force to overwrite main branch history",
                "Rename App.jsx to App2.jsx and ignore the conflict",
                "Open the conflicted file, locate the conflict markers (<<<<<<<, =======, >>>>>>>), reconcile changes with teammates if needed, test, and commit the resolution",
                "Merge conflicts occur when two branches touch the same lines. Developers inspect the conflict markers, reconcile the logic, test, and commit the clean resolution.",
                3
            ],
            [
                1, 4,
                "Under high concurrent write traffic, a microservice using PostgreSQL experiences intermittent deadlocks and transaction serialization failures (error 40P01). What architectural strategy best resolves this without sacrificing data consistency?",
                "Disable all database transaction isolation and foreign keys",
                "Implement consistent resource locking order across all endpoints, use optimistic locking with retry backoff, and offload asynchronous event writes through a durable message queue like Kafka",
                "Increase PostgreSQL query timeout to 10 minutes",
                "Restart the application server whenever a deadlock occurs",
                "Implement consistent resource locking order across all endpoints, use optimistic locking with retry backoff, and offload asynchronous event writes through a durable message queue like Kafka",
                "Deadlocks occur when transactions acquire locks in conflicting orders. Consistent lock ordering, exponential retry backoff, and asynchronous queuing decouple high-velocity updates.",
                4
            ],

            // ---------- 2. Data Analyst ----------
            [
                2, 1,
                "A retail platform recorded March unit sales: Laptops (25), Phones (35), Tablets (21), Headphones (29). Which product achieved the highest volume in March?",
                "Laptop",
                "Phone",
                "Tablet",
                "Headphones",
                "Phone",
                "Comparing the numerical quantities shows Phone achieved 35 units, surpassing Headphones (29), Laptop (25), and Tablet (21).",
                1
            ],
            [
                2, 2,
                "You have an orders table and need to filter for customers whose total spending exceeds $1,000 across all orders. Which SQL clause is required to filter on aggregate sums?",
                "WHERE SUM(order_total) > 1000",
                "HAVING SUM(order_total) > 1000 after a GROUP BY customer_id",
                "ORDER BY SUM(order_total) > 1000",
                "LIMIT 1000",
                "HAVING SUM(order_total) > 1000 after a GROUP BY customer_id",
                "In SQL, WHERE filters individual rows before aggregation. To filter grouped aggregates like SUM(), the HAVING clause must be used with GROUP BY.",
                2
            ],
            [
                2, 3,
                "A stakeholder wants to see how market share percentages are divided among five direct industry competitors in 2026. Which visualization best shows proportional composition?",
                "Scatter plot",
                "Pie chart or Donut chart (or 100% stacked bar chart)",
                "Logarithmic histogram",
                "Multi-line time series plot",
                "Pie chart or Donut chart (or 100% stacked bar chart)",
                "Pie charts, donut charts, and 100% stacked bar charts are specifically designed to communicate part-to-whole proportional relationships.",
                3
            ],
            [
                2, 4,
                "A petabyte-scale data warehouse query performing a multi-table JOIN suffers from extreme data skew, causing a single reducer node to run for 4 hours while other nodes finish in 2 minutes. What optimization technique directly alleviates this?",
                "Double the RAM on all client laptops",
                "Salt the skewed join keys with a random prefix to distribute the heavy key across multiple partitions, combined with broadcast joins for smaller dimensional tables",
                "Remove all indexes and write queries in plain text",
                "Switch the storage from SSD to magnetic tape",
                "Salt the skewed join keys with a random prefix to distribute the heavy key across multiple partitions, combined with broadcast joins for smaller dimensional tables",
                "Key salting appends a pseudo-random integer to heavily skewed keys, distributing the load uniformly across parallel worker nodes to eliminate stragglers.",
                4
            ],

            // ---------- 3. UI/UX Designer ----------
            [
                3, 1,
                "Students report that an educational portal is confusing and key links are hard to find. What should you do before sketching wireframes?",
                "Immediately change all primary colors to vibrant gradients",
                "Conduct usability interviews with real students to pinpoint specific pain points and observe navigation",
                "Remove half the dashboard features arbitrarily",
                "Add fast spinning animations to all buttons",
                "Conduct usability interviews with real students to pinpoint specific pain points and observe navigation",
                "User empathy and usability testing uncover genuine behavioral hurdles before drafting layouts, ensuring redesigns solve real frustrations.",
                1
            ],
            [
                3, 2,
                "According to WCAG (Web Content Accessibility Guidelines) AA standards, what is the minimum contrast ratio required for standard body text against its background?",
                "1.5:1",
                "4.5:1",
                "10:1",
                "Contrast does not matter on modern screens",
                "4.5:1",
                "WCAG 2.1 AA mandates a minimum contrast ratio of 4.5:1 for regular text to ensure readability for users with low vision or color vision deficiencies.",
                2
            ],
            [
                3, 3,
                "Your team is organizing a complex navigation menu with 40 tools and settings. What UX exercise helps organize these items into intuitive categories based on how users think?",
                "Card Sorting",
                "Eye tracking without users",
                "Random alphabetical sorting",
                "Putting all 40 items on the top navigation bar at once",
                "Card Sorting",
                "Card sorting is a generative UX research method where participants group labeled cards into categories that feel logical to them, directly informing intuitive site architecture.",
                3
            ],
            [
                3, 4,
                "Your design system is used across 15 enterprise web and mobile applications with distinct brand themes. How should tokens and component architecture be structured to guarantee accessibility, token inheritance, and zero-drift cross-platform updates?",
                "Hardcode hexadecimal color codes in individual CSS files across all 15 repositories",
                "Establish a 3-tier Design Token architecture (Global -> Semantic/Alias -> Component) managed via Style Dictionary, exported as platform-specific packages with automated contrast validation tests",
                "Allow each developer to choose their own button radius and typography dynamically",
                "Replace all UI components with screenshots",
                "Establish a 3-tier Design Token architecture (Global -> Semantic/Alias -> Component) managed via Style Dictionary, exported as platform-specific packages with automated contrast validation tests",
                "A 3-tier token hierarchy decouples raw values from semantic context, enabling multi-theme switching, dark mode, and multi-platform compilation without regressions.",
                4
            ],

            // ---------- 4. Digital Marketer ----------
            [
                4, 1,
                "A coding academy is launching an intensive 8-week Python Bootcamp. Which targeting approach produces the highest quality prospective student leads?",
                "Mass blast display banners to random cooking and gaming websites",
                "Targeted search ads for keywords like 'learn python for data' paired with social ads highlighting project portfolios and job placement proof",
                "Send unsolicited email blasts to random purchased email lists",
                "Change the bootcamp title every hour",
                "Targeted search ads for keywords like 'learn python for data' paired with social ads highlighting project portfolios and job placement proof",
                "Capturing high-intent search traffic and validating credibility with portfolio outcomes directly appeals to students actively looking to acquire career skills.",
                1
            ],
            [
                4, 2,
                "A campaign spends $1,000 on social media ads, generating 50,000 impressions, 1,000 clicks, and 20 sales at $100 per course. What was the Click-Through Rate (CTR) and the Return on Ad Spend (ROAS)?",
                "CTR: 2%, ROAS: 2.0x (200% / $2,000 revenue)",
                "CTR: 10%, ROAS: 0.5x",
                "CTR: 50%, ROAS: 10x",
                "CTR: 0.1%, ROAS: 1.0x",
                "CTR: 2%, ROAS: 2.0x (200% / $2,000 revenue)",
                "CTR = (1,000 clicks / 50,000 impressions) × 100 = 2%. Revenue = 20 sales × $100 = $2,000. ROAS = $2,000 / $1,000 = 2.0x (200%).",
                2
            ],
            [
                4, 3,
                "An email newsletter announcing a new course has an open rate of only 11% (industry benchmark: 22%). Which element should you A/B test first to improve the open rate?",
                "The footer copyright notice",
                "The email subject line and preview preheader text",
                "The size of the logo at the bottom of the email",
                "The server database configuration",
                "The email subject line and preview preheader text",
                "Open rate is almost entirely determined by the subject line, sender name, and preview text displayed in the user's inbox before opening the message.",
                3
            ],
            [
                4, 4,
                "With third-party cookie deprecation and Apple ATT privacy frameworks limiting client-side tracking, paid acquisition models show severe attribution loss. Which measurement and data infrastructure architecture best restores accurate conversion tracking?",
                "Rely solely on last-click browser cookies without any server integrations",
                "Deploy Server-Side Tagging with Conversions API (CAPI) using first-party hashed customer parameters, combined with Marketing Mix Modeling (MMM) and geo-lift incrementality experiments",
                "Send unsolicited SMS messages to cold numbers",
                "Stop analyzing campaigns and spend budget equally across all networks",
                "Deploy Server-Side Tagging with Conversions API (CAPI) using first-party hashed customer parameters, combined with Marketing Mix Modeling (MMM) and geo-lift incrementality experiments",
                "Server-side tracking bypasses browser ad-blockers and cookie limits, while MMM and incrementality testing provide robust statistical proof of causal ad impact.",
                4
            ],

            // ---------- 5. Cloud & DevOps Engineer ----------
            [
                5, 1,
                "A student result portal slows down drastically and crashes during exam publication day. Which cloud pattern ensures resilience under peak load?",
                "Deploy a single physical server in the office with manual restart scripts",
                "Configure an Auto Scaling Group behind an Application Load Balancer with database read replicas and CDN caching",
                "Disable all student access during peak hours",
                "Delete past exam records to free up memory",
                "Configure an Auto Scaling Group behind an Application Load Balancer with database read replicas and CDN caching",
                "Auto-scaling dynamically scales compute nodes horizontally as CPU or request metrics climb, while CDNs cache static assets and read replicas relieve database load.",
                1
            ],
            [
                5, 2,
                "Why do engineering teams package applications into Docker containers rather than distributing raw code to production servers?",
                "To make the application run without an operating system",
                "To bundle code with all its dependencies, libraries, and configurations, ensuring identical behavior across development, staging, and production environments",
                "Because containers completely replace the need for writing code",
                "To prevent developers from editing their code",
                "To bundle code with all its dependencies, libraries, and configurations, ensuring identical behavior across development, staging, and production environments",
                "Containerization solves the 'works on my machine' syndrome by packaging the application with its complete runtime environment.",
                2
            ],
            [
                5, 3,
                "During a code push, your automated CI/CD pipeline fails with the alert: 'Secret Scanning: Found exposed AWS_SECRET_ACCESS_KEY in commit diff'. What must you do immediately?",
                "Ignore the alert and proceed with deployment",
                "Immediately revoke/rotate the compromised AWS credential in IAM, remove the secret from Git history, and store keys in a secure secret manager or environment variable",
                "Change the repository name to private and assume nobody saw it",
                "Delete the GitHub Actions pipeline",
                "Immediately revoke/rotate the compromised AWS credential in IAM, remove the secret from Git history, and store keys in a secure secret manager or environment variable",
                "Exposed credentials can be scraped by automated bots in seconds. Rotating the key immediately neutralizes potential compromise, followed by proper secrets management.",
                3
            ],
            [
                5, 4,
                "During a multi-region Kubernetes cluster upgrade, a service mesh control plane (e.g. Istio) experiences split-brain DNS resolution, causing inter-service mTLS handshake drops between US-East and EU-West. What is the correct mitigation procedure?",
                "Delete all namespaces immediately in production",
                "Enforce strict failover traffic routing via global anycast DNS/BGP to the healthy region, isolate control plane synchronization gossip protocols, roll back the ingress gateway mTLS policy, and verify cluster secret federation",
                "Disable encryption across the internet completely",
                "Reboot every physical router in the cloud provider's data center",
                "Enforce strict failover traffic routing via global anycast DNS/BGP to the healthy region, isolate control plane synchronization gossip protocols, roll back the ingress gateway mTLS policy, and verify cluster secret federation",
                "Mitigating cross-region mesh failures requires immediate edge rerouting to healthy clusters while isolating peer discovery sync to restore deterministic security tokens.",
                4
            ],

            // ---------- 6. Cybersecurity Analyst ----------
            [
                6, 1,
                "An employee receives an email marked 'Urgent: Payroll Direct Deposit Verification' from hr-support@payroll-quick-update.com. What should the employee do?",
                "Enter their bank account number immediately to ensure payday is not delayed",
                "Report the suspicious email to the security team without clicking links or providing credentials",
                "Forward the email to all company colleagues asking if their pay is affected",
                "Click the link and enter a dummy password",
                "Report the suspicious email to the security team without clicking links or providing credentials",
                "Artificial urgency, external unofficial domains, and financial requests are classic phishing hallmarks. Reporting immediately allows SecOps to block the domain and protect other employees.",
                1
            ],
            [
                6, 2,
                "Which authentication strategy provides the strongest defense against credential stuffing and compromised password attacks?",
                "Requiring passwords to be changed every 24 hours",
                "Multi-Factor Authentication (MFA) utilizing FIDO2/WebAuthn hardware security keys or authenticator apps",
                "Allowing users to log in using only a 4-digit numeric PIN",
                "Writing passwords in shared sticky notes",
                "Multi-Factor Authentication (MFA) utilizing FIDO2/WebAuthn hardware security keys or authenticator apps",
                "Even if an attacker steals a valid password through breaches, MFA requires a physical or cryptographic second factor they do not possess.",
                2
            ],
            [
                6, 3,
                "A network vulnerability scan reveals that Port 22 (SSH) and Port 3389 (RDP) on a production database server are directly accessible to the public internet. What is the immediate recommended security posture?",
                "Leave them open for developer convenience",
                "Restrict management ports behind a VPN or bastion host with IP allowlisting and require key-based authentication",
                "Change the server wallpaper",
                "Delete the database",
                "Restrict management ports behind a VPN or bastion host with IP allowlisting and require key-based authentication",
                "Administrative ports exposed to the public internet are subject to continuous brute force and exploit attempts. Access should strictly be brokered through a hardened bastion host or VPN.",
                3
            ],
            [
                6, 4,
                "Threat intelligence alerts indicate an advanced persistent threat (APT) actor has executed a Golden Ticket Kerberos attack in your Active Directory domain, granting domain-wide administrative persistence. What remediation action is required to fully eradicate the attacker?",
                "Change a single user's password once",
                "Reset the KRBTGT account password twice consecutively (with replication interval between resets) to invalidate all existing Ticket Granting Tickets (TGTs), followed by enterprise-wide credential resets and memory forensic sweeps on domain controllers",
                "Clear browser cache on employee workstations",
                "Uninstall antivirus software",
                "Reset the KRBTGT account password twice consecutively (with replication interval between resets) to invalidate all existing Ticket Granting Tickets (TGTs), followed by enterprise-wide credential resets and memory forensic sweeps on domain controllers",
                "Because Kerberos ticket history remembers the previous KRBTGT password hash, resetting it twice consecutively invalidates any forged ticket granting tickets in circulation.",
                4
            ],

            // ---------- 7. AI & Machine Learning Specialist ----------
            [
                7, 1,
                "A convolutional neural network scores 99.8% accuracy on training images, but drops to 52.3% accuracy on real-world validation images. What is happening and what is an effective countermeasure?",
                "Underfitting; make the model smaller",
                "Overfitting; apply data augmentation, dropout regularization, and collect more diverse training samples",
                "Hardware monitor defect; buy a new screen",
                "Perfect generalization; deploy directly to production",
                "Overfitting; apply data augmentation, dropout regularization, and collect more diverse training samples",
                "Overfitting occurs when a high-capacity model memorizes noise in the training set. Regularization techniques (like dropout) and data augmentation force the model to learn invariant, generalizable features.",
                1
            ],
            [
                7, 2,
                "Why is feature scaling (such as standardization or Min-Max normalization) essential before training algorithms like Logistic Regression, SVMs, or Neural Networks?",
                "It compresses file size for email attachment",
                "It prevents features with large numeric scales (e.g. Income $100,000) from dominating gradients over features with smaller scales (e.g. Age 25), enabling stable and faster convergence",
                "It automatically labels unlabelled data",
                "It encrypts sensitive user data",
                "It prevents features with large numeric scales (e.g. Income $100,000) from dominating gradients over features with smaller scales (e.g. Age 25), enabling stable and faster convergence",
                "Gradient descent updates parameters proportionally to input feature magnitudes. Features with huge numbers cause elongated contours and erratic oscillations unless normalized to a standard scale.",
                2
            ],
            [
                7, 3,
                "In an AI disease diagnosis system where only 1% of patients actually have the disease, a naive model predicts 'Healthy' 100% of the time and achieves 99% accuracy. Why is accuracy misleading, and what metric should be prioritized?",
                "Accuracy is fine; 99% is outstanding",
                "Accuracy ignores class imbalance; Recall (Sensitivity) and F1-Score should be prioritized to ensure true positive cases are not missed",
                "Measure only training speed in seconds",
                "Count total lines of Python code written",
                "Accuracy ignores class imbalance; Recall (Sensitivity) and F1-Score should be prioritized to ensure true positive cases are not missed",
                "In high-stakes imbalanced classification (disease detection, fraud), false negatives can be fatal. Recall measures what proportion of actual positive cases were correctly caught.",
                3
            ],
            [
                7, 4,
                "When deploying a 70B parameter Large Language Model (LLM) for real-time inference with strict <50ms time-to-first-token (TTFT) requirements, which optimization stack delivers the highest throughput and memory efficiency?",
                "Run 32-bit floating point weights on a single consumer CPU core",
                "Utilize 4-bit/8-bit weight-only or FP8 quantization (AWQ/GPTQ) with PagedAttention (vLLM / TensorRT-LLM), continuous batching, and KV-cache offloading across tensor-parallel GPU clusters",
                "Re-train the model from scratch every time a user sends a prompt",
                "Save the model weights as a CSV spreadsheet",
                "Utilize 4-bit/8-bit weight-only or FP8 quantization (AWQ/GPTQ) with PagedAttention (vLLM / TensorRT-LLM), continuous batching, and KV-cache offloading across tensor-parallel GPU clusters",
                "Modern high-throughput LLM serving relies on PagedAttention to eliminate memory fragmentation, coupled with low-bit quantization to fit KV caches on high-bandwidth VRAM.",
                4
            ],

            // ---------- 8. Product Manager ----------
            [
                8, 1,
                "Your engineering squad has bandwidth to build only two features this quarter out of ten customer requests. How do you objectively rank them?",
                "Pick whatever the loudest executive shouted in the hallway",
                "Score each feature with a structured framework like RICE (Reach × Impact × Confidence / Effort) aligned with company OKRs",
                "Roll a 10-sided die",
                "Start building all ten simultaneously without finishing any",
                "Score each feature with a structured framework like RICE (Reach × Impact × Confidence / Effort) aligned with company OKRs",
                "RICE framework balances quantifiable customer reach and business impact against engineering cost and confidence level, removing political bias from roadmap decisions.",
                1
            ],
            [
                8, 2,
                "What is the primary objective of releasing a Minimum Viable Product (MVP) to early adopters?",
                "To release a complete, finalized enterprise suite with zero remaining hypotheses",
                "To test core value propositions with real users using minimal effort and maximize validated learning",
                "To deliberately release poor quality code without caring about users",
                "To delay talking to customers as long as possible",
                "To test core value propositions with real users using minimal effort and maximize validated learning",
                "An MVP is a learning vehicle designed to validate or invalidate foundational product hypotheses with the least development expenditure.",
                2
            ],
            [
                8, 3,
                "A SaaS productivity app has high new user signups, but 70% of new users abandon the product within 48 hours. Where should the Product Manager focus discovery efforts?",
                "Spend more money on billboard advertising",
                "Analyze the onboarding funnel and Time-to-Value (TTV) to understand what friction prevents users from reaching their 'Aha!' moment",
                "Double the subscription price immediately",
                "Delete the signup page",
                "Analyze the onboarding funnel and Time-to-Value (TTV) to understand what friction prevents users from reaching their 'Aha!' moment",
                "High top-of-funnel acquisition combined with rapid 48-hour drop-off indicates an onboarding breakdown where users fail to experience core product value quickly.",
                3
            ],
            [
                8, 4,
                "Your core enterprise B2B product generates 80% of revenue from 5 enterprise clients demanding custom on-premise features, while your PLG (Product-Led Growth) self-serve tier is growing 200% YoY with high retention. How do you resolve this resource allocation crisis?",
                "Commit all engineering solely to the enterprise clients and shut down self-serve",
                "Decouple architecture to isolate enterprise compliance into a configurable add-on tier, ring-fence a dedicated solutions engineering squad for custom contracts, and protect core product teams to scale the high-margin PLG engine",
                "Ignore enterprise clients and refund their contracts without communication",
                "Let engineers randomly pick which tickets to code each morning",
                "Decouple architecture to isolate enterprise compliance into a configurable add-on tier, ring-fence a dedicated solutions engineering squad for custom contracts, and protect core product teams to scale the high-margin PLG engine",
                "Separating custom professional services from standardized product-led growth preserves product scalability while retaining strategic marquee enterprise revenue.",
                4
            ]
        ];

        // Ensure all scenario questions exist
        for (const [courseId, diffId, qText, optA, optB, optC, optD, correctAns, exp, marks] of scenarioQuestions) {
            const existingQ = await queryOneFn(
                "SELECT id FROM questions WHERE course_id = ? AND difficulty_id = ? AND question_type = 'mcq' AND question = ?",
                [courseId, diffId, qText]
            );

            if (!existingQ) {
                await executeFn(
                    `INSERT INTO questions
                    (course_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, marks, question_type)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'mcq')`,
                    [courseId, diffId, qText, optA, optB, optC, optD, correctAns, exp, marks]
                );
            }
        }

        // =========================================================================
        // 4. INTERACTIVE CODING CHALLENGES (4 levels for coding-enabled careers)
        // =========================================================================
        const codingChallenges = [
            // ================= 1. Software Developer =================
            {
                courseId: 1,
                difficultyId: 1, // Beginner
                question: "Sum of Even Numbers: Write a function `sumEvenNumbers(numbers)` that takes an array of integers and returns the sum of all even numbers. If there are no even numbers, return 0.",
                codeLanguage: "javascript",
                starterCode: `function sumEvenNumbers(numbers) {\n  // Return the sum of all even numbers in the array\n  let sum = 0;\n  for (const n of numbers) {\n    if (n % 2 === 0) sum += n;\n  }\n  return sum;\n}`,
                testCases: [
                    { call: "sumEvenNumbers([1, 2, 3, 4, 5, 6])", expected: 12, description: "Sums even numbers 2 + 4 + 6 = 12" },
                    { call: "sumEvenNumbers([1, 3, 5, 7])", expected: 0, description: "Array with no even numbers returns 0" },
                    { call: "sumEvenNumbers([10, -2, 7])", expected: 8, description: "Correctly handles negative even numbers: 10 + (-2) = 8" }
                ],
                explanation: "Iterate through the array and use the modulo operator (%) to test if an element is divisible by 2. Time complexity is O(N), Space complexity is O(1).",
                marks: 10
            },
            {
                courseId: 1,
                difficultyId: 2, // Intermediate
                question: "Filter Duplicate IDs: Write a function `findDuplicates(ids)` that finds all duplicate items in an array and returns them as an array sorted in ascending order with each duplicate appearing only once.",
                codeLanguage: "javascript",
                starterCode: `function findDuplicates(ids) {\n  // Find duplicate numbers and return sorted array of unique duplicates\n  const counts = {};\n  const duplicates = [];\n  for (const id of ids) {\n    counts[id] = (counts[id] || 0) + 1;\n    if (counts[id] === 2) {\n      duplicates.push(id);\n    }\n  }\n  return duplicates.sort((a, b) => a - b);\n}`,
                testCases: [
                    { call: "findDuplicates([1, 2, 3, 2, 4, 1, 5])", expected: [1, 2], description: "Identifies duplicate IDs 1 and 2 in sorted order" },
                    { call: "findDuplicates([5, 6, 7, 8])", expected: [], description: "Returns empty array when all elements are unique" },
                    { call: "findDuplicates([3, 3, 3, 3])", expected: [3], description: "Handles multiple occurrences without duplicating in output" }
                ],
                explanation: "Use a hash map to count occurrences. Add to output only when an element is seen for the second time. Sort at the end. Time complexity is O(N log N).",
                marks: 20
            },
            {
                courseId: 1,
                difficultyId: 3, // Hard
                question: "Two Sum Target Lookup: Write a function `twoSum(nums, target)` that returns the indices [i, j] of the two numbers such that they add up to `target`. Assume each input has exactly one solution and return indices in ascending order.",
                codeLanguage: "javascript",
                starterCode: `function twoSum(nums, target) {\n  // Return [i, j] indices of numbers that sum to target\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
                testCases: [
                    { call: "twoSum([2, 7, 11, 15], 9)", expected: [0, 1], description: "nums[0] + nums[1] = 2 + 7 = 9" },
                    { call: "twoSum([3, 2, 4], 6)", expected: [1, 2], description: "nums[1] + nums[2] = 2 + 4 = 6" },
                    { call: "twoSum([3, 3], 6)", expected: [0, 1], description: "Handles identical values at distinct indices" }
                ],
                explanation: "Using a single-pass hash map achieves O(N) time complexity by looking up the required complement (target - current value) in O(1) time.",
                marks: 30
            },
            {
                courseId: 1,
                difficultyId: 4, // Expert
                question: "Validate Balanced Delimiters: Write a function `isValidSyntax(str)` that validates whether an input string containing parentheses '()', brackets '[]', and braces '{}' has balanced and correctly nested delimiters.",
                codeLanguage: "javascript",
                starterCode: `function isValidSyntax(str) {\n  // Validate balanced brackets, parentheses, and braces\n  const stack = [];\n  const map = { ')': '(', ']': '[', '}': '{' };\n  for (const char of str) {\n    if (char === '(' || char === '[' || char === '{') {\n      stack.push(char);\n    } else if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}`,
                testCases: [
                    { call: "isValidSyntax('{[()]}')", expected: true, description: "Correctly recognizes perfectly nested brackets" },
                    { call: "isValidSyntax('{[(])}')", expected: false, description: "Correctly identifies interleaved closing bracket error" },
                    { call: "isValidSyntax('(()[{}])')", expected: true, description: "Validates complex compound bracket sequence" },
                    { call: "isValidSyntax('(')", expected: false, description: "Catches unclosed opening delimiter" }
                ],
                explanation: "A Last-In-First-Out (LIFO) stack data structure guarantees that the most recently opened delimiter is the first one closed. Time O(N), Space O(N).",
                marks: 40
            },

            // ================= 2. Data Analyst =================
            {
                courseId: 2,
                difficultyId: 1, // Beginner
                question: "Calculate Average Value: Write a function `calculateAverage(numbers)` that returns the arithmetic mean of an array of numbers rounded to 2 decimal places. Return 0 for an empty array.",
                codeLanguage: "javascript",
                starterCode: `function calculateAverage(numbers) {\n  if (!numbers || numbers.length === 0) return 0;\n  const sum = numbers.reduce((a, b) => a + b, 0);\n  return Number((sum / numbers.length).toFixed(2));\n}`,
                testCases: [
                    { call: "calculateAverage([10, 20, 30, 40])", expected: 25, description: "Computes mean of integer values" },
                    { call: "calculateAverage([15, 25, 35])", expected: 25, description: "Computes symmetric distribution mean" },
                    { call: "calculateAverage([10, 10, 11])", expected: 10.33, description: "Rounds decimal result to two decimal places" },
                    { call: "calculateAverage([])", expected: 0, description: "Handles empty dataset safely" }
                ],
                explanation: "Sum the array elements using reduce() and divide by array length, rounding with Number(val.toFixed(2)).",
                marks: 10
            },
            {
                courseId: 2,
                difficultyId: 2, // Intermediate
                question: "Filter High-Value Transactions: Write a function `filterHighValue(transactions, threshold)` that filters an array of objects { id, amount } and returns an array of transaction IDs whose amount is greater than or equal to threshold.",
                codeLanguage: "javascript",
                starterCode: `function filterHighValue(transactions, threshold) {\n  return transactions\n    .filter(t => t.amount >= threshold)\n    .map(t => t.id);\n}`,
                testCases: [
                    { call: "filterHighValue([{id: 1, amount: 120}, {id: 2, amount: 80}, {id: 3, amount: 250}], 100)", expected: [1, 3], description: "Filters transactions exceeding 100 threshold" },
                    { call: "filterHighValue([{id: 10, amount: 50}], 100)", expected: [], description: "Returns empty array when none satisfy threshold" }
                ],
                explanation: "Functional filter and map pipelines cleanly process tabular/record datasets without state mutations.",
                marks: 20
            },
            {
                courseId: 2,
                difficultyId: 3, // Hard
                question: "Customer Spending Aggregation: Write a function `aggregateCustomerSpending(orders)` that takes an array of { customerId, total } and returns an object mapping each customerId to their total spend.",
                codeLanguage: "javascript",
                starterCode: `function aggregateCustomerSpending(orders) {\n  const result = {};\n  for (const o of orders) {\n    result[o.customerId] = (result[o.customerId] || 0) + o.total;\n  }\n  return result;\n}`,
                testCases: [
                    { call: "aggregateCustomerSpending([{customerId: 'c1', total: 50}, {customerId: 'c2', total: 30}, {customerId: 'c1', total: 70}])", expected: { c1: 120, c2: 30 }, description: "Aggregates multiple orders for c1 to 120 and c2 to 30" }
                ],
                explanation: "Performs SQL GROUP BY customer_id SUM(total) equivalent in JavaScript using an accumulator object.",
                marks: 30
            },
            {
                courseId: 2,
                difficultyId: 4, // Expert
                question: "Moving Window Rolling Average: Write a function `rollingAverage(values, windowSize)` that computes an array of moving averages for the given window size rounded to 2 decimal places.",
                codeLanguage: "javascript",
                starterCode: `function rollingAverage(values, windowSize) {\n  const result = [];\n  for (let i = 0; i <= values.length - windowSize; i++) {\n    const slice = values.slice(i, i + windowSize);\n    const avg = slice.reduce((a, b) => a + b, 0) / windowSize;\n    result.push(Number(avg.toFixed(2)));\n  }\n  return result;\n}`,
                testCases: [
                    { call: "rollingAverage([10, 20, 30, 40, 50], 3)", expected: [20, 30, 40], description: "Computes 3-period moving average windows: [20, 30, 40]" }
                ],
                explanation: "Moving averages smooth out volatility in continuous financial and metric telemetry.",
                marks: 40
            },

            // ================= 5. Cloud & DevOps Engineer =================
            {
                courseId: 5,
                difficultyId: 1, // Beginner
                question: "Classify HTTP Status Code: Write a function `classifyHttpStatus(code)` that returns 'Success' for 2xx codes, 'Redirection' for 3xx, 'Client Error' for 4xx, and 'Server Error' for 5xx. Otherwise return 'Invalid'.",
                codeLanguage: "javascript",
                starterCode: `function classifyHttpStatus(code) {\n  if (code >= 200 && code < 300) return 'Success';\n  if (code >= 300 && code < 400) return 'Redirection';\n  if (code >= 400 && code < 500) return 'Client Error';\n  if (code >= 500 && code < 600) return 'Server Error';\n  return 'Invalid';\n}`,
                testCases: [
                    { call: "classifyHttpStatus(200)", expected: "Success", description: "200 is Success" },
                    { call: "classifyHttpStatus(404)", expected: "Client Error", description: "404 is Client Error" },
                    { call: "classifyHttpStatus(503)", expected: "Server Error", description: "503 is Server Error" }
                ],
                explanation: "HTTP status code ranges categorize service responses and drive load balancer health-check decisions.",
                marks: 10
            },
            {
                courseId: 5,
                difficultyId: 2, // Intermediate
                question: "Extract Error Logs: Write a function `extractErrors(logs)` that takes an array of log strings and returns only those strings containing '[ERROR]' or '[CRITICAL]'.",
                codeLanguage: "javascript",
                starterCode: `function extractErrors(logs) {\n  return logs.filter(line => line.includes('[ERROR]') || line.includes('[CRITICAL]'));\n}`,
                testCases: [
                    { call: "extractErrors(['[INFO] Server started', '[ERROR] DB connection timed out', '[DEBUG] Retrying', '[CRITICAL] Disk full'])", expected: ["[ERROR] DB connection timed out", "[CRITICAL] Disk full"], description: "Extracts only critical and error severity log lines" }
                ],
                explanation: "Log ingestion pipelines filter and index incident-triggering log lines for real-time alerting systems.",
                marks: 20
            },
            {
                courseId: 5,
                difficultyId: 3, // Hard
                question: "Compare Semantic Versions: Write a function `compareVersions(v1, v2)` that compares two semantic version strings ('x.y.z'). Returns 1 if v1 > v2, -1 if v1 < v2, and 0 if v1 === v2.",
                codeLanguage: "javascript",
                starterCode: `function compareVersions(v1, v2) {\n  const p1 = v1.split('.').map(Number);\n  const p2 = v2.split('.').map(Number);\n  for (let i = 0; i < 3; i++) {\n    if (p1[i] > p2[i]) return 1;\n    if (p1[i] < p2[i]) return -1;\n  }\n  return 0;\n}`,
                testCases: [
                    { call: "compareVersions('1.2.3', '1.2.0')", expected: 1, description: "1.2.3 is greater than 1.2.0" },
                    { call: "compareVersions('2.0.1', '2.1.0')", expected: -1, description: "2.0.1 is less than 2.1.0" },
                    { call: "compareVersions('1.0.0', '1.0.0')", expected: 0, description: "Identical versions return 0" }
                ],
                explanation: "Semantic versioning checks determine backward-compatible rollouts and package manager dependency resolution.",
                marks: 30
            },
            {
                courseId: 5,
                difficultyId: 4, // Expert
                question: "Rate Limiter Capacity Monitor: Write a function `simulateRateLimiter(requestCounts, threshold)` that counts how many request batches are accepted under a threshold limit.",
                codeLanguage: "javascript",
                starterCode: `function simulateRateLimiter(requestCounts, threshold) {\n  let accepted = 0;\n  for (const c of requestCounts) {\n    if (c <= threshold) accepted++;\n  }\n  return accepted;\n}`,
                testCases: [
                    { call: "simulateRateLimiter([5, 12, 8, 15, 3], 10)", expected: 3, description: "3 batches (5, 8, 3) are under limit 10" }
                ],
                explanation: "Token bucket and sliding window rate limiters safeguard API gateways against denial-of-service traffic spikes.",
                marks: 40
            },

            // ================= 6. Cybersecurity Analyst =================
            {
                courseId: 6,
                difficultyId: 1, // Beginner
                question: "Password Policy Validator: Write a function `isStrongPassword(password)` that returns true if password is at least 8 characters, contains at least one uppercase letter, one lowercase letter, and one digit. Otherwise return false.",
                codeLanguage: "javascript",
                starterCode: `function isStrongPassword(password) {\n  if (!password || password.length < 8) return false;\n  const hasUpper = /[A-Z]/.test(password);\n  const hasLower = /[a-z]/.test(password);\n  const hasDigit = /[0-9]/.test(password);\n  return hasUpper && hasLower && hasDigit;\n}`,
                testCases: [
                    { call: "isStrongPassword('SecureP@ss1')", expected: true, description: "Validates complex compliant password" },
                    { call: "isStrongPassword('weak')", expected: false, description: "Rejects password under 8 characters" },
                    { call: "isStrongPassword('ALLUPPERCASE1')", expected: false, description: "Rejects password missing lowercase characters" }
                ],
                explanation: "Password entropy requirements prevent brute-force attacks by increasing the keyspace exponentially.",
                marks: 10
            },
            {
                courseId: 6,
                difficultyId: 2, // Intermediate
                question: "Detect Brute Force Attacks: Write a function `detectBruteForce(attempts, maxAllowed)` that takes an array of { ip, success } objects and returns an array of unique IPs that had maxAllowed or more failed attempts (success === false).",
                codeLanguage: "javascript",
                starterCode: `function detectBruteForce(attempts, maxAllowed) {\n  const failedCounts = {};\n  const flagged = new Set();\n  for (const att of attempts) {\n    if (!att.success) {\n      failedCounts[att.ip] = (failedCounts[att.ip] || 0) + 1;\n      if (failedCounts[att.ip] >= maxAllowed) {\n        flagged.add(att.ip);\n      }\n    }\n  }\n  return Array.from(flagged);\n}`,
                testCases: [
                    { call: "detectBruteForce([{ip: '10.0.0.1', success: false}, {ip: '10.0.0.1', success: false}, {ip: '10.0.0.1', success: false}, {ip: '10.0.0.2', success: false}], 3)", expected: ["10.0.0.1"], description: "Flags IP with 3 failed logins" }
                ],
                explanation: "Security Information and Event Management (SIEM) systems detect anomalous spikes in consecutive failed authentications.",
                marks: 20
            },
            {
                courseId: 6,
                difficultyId: 3, // Hard
                question: "Sanitize SQL / HTML Input: Write a function `sanitizeInput(input)` that strips malicious <script> and </script> tags (case-insensitive) and escapes single quotes (') to double single quotes ('').",
                codeLanguage: "javascript",
                starterCode: `function sanitizeInput(input) {\n  return input\n    .replace(/<script[^>]*>([\\s\\S]*?)<\\/script>/gi, '$1')\n    .replace(/'/g, \"''\");\n}`,
                testCases: [
                    { call: "sanitizeInput(\"<script>alert('xss')</script>\")", expected: "alert(''xss'')", description: "Strips script tags and escapes SQL quotes" }
                ],
                explanation: "Input sanitation and parameterized queries eliminate Cross-Site Scripting (XSS) and SQL Injection vectors.",
                marks: 30
            },
            {
                courseId: 6,
                difficultyId: 4, // Expert
                question: "Caesar Cipher Cryptography: Write a function `caesarCipher(str, shift)` that shifts each letter in str forward by shift positions in the alphabet, wrapping around from Z to A. Preserve case and non-alphabetic characters.",
                codeLanguage: "javascript",
                starterCode: `function caesarCipher(str, shift) {\n  return str.split('').map(char => {\n    if (char >= 'a' && char <= 'z') {\n      return String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97);\n    }\n    if (char >= 'A' && char <= 'Z') {\n      return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);\n    }\n    return char;\n  }).join('');\n}`,
                testCases: [
                    { call: "caesarCipher('ABC', 3)", expected: "DEF", description: "Shifts uppercase letters forward by 3" },
                    { call: "caesarCipher('xyz', 2)", expected: "zab", description: "Wraps lowercase letters around end of alphabet" }
                ],
                explanation: "Foundational classical cryptography illustrates substitution ciphers and modular arithmetic principles.",
                marks: 40
            },

            // ================= 7. AI & Machine Learning Specialist =================
            {
                courseId: 7,
                difficultyId: 1, // Beginner
                question: "Min-Max Feature Normalization: Write a function `minMaxNormalize(values)` that scales an array of numbers between 0 and 1 using the formula: (x - min) / (max - min). If max === min, return an array of 0s.",
                codeLanguage: "javascript",
                starterCode: `function minMaxNormalize(values) {\n  const min = Math.min(...values);\n  const max = Math.max(...values);\n  if (max === min) return values.map(() => 0);\n  return values.map(v => Number(((v - min) / (max - min)).toFixed(2)));\n}`,
                testCases: [
                    { call: "minMaxNormalize([10, 20, 30])", expected: [0, 0.5, 1], description: "Normalizes [10, 20, 30] to [0, 0.5, 1]" },
                    { call: "minMaxNormalize([5, 5, 5])", expected: [0, 0, 0], description: "Uniform array returns all zeros" }
                ],
                explanation: "Normalization brings all features to an identical scale, ensuring gradient descent converges smoothly.",
                marks: 10
            },
            {
                courseId: 7,
                difficultyId: 2, // Intermediate
                question: "Classification Evaluation Metrics: Write a function `calculateMetrics(tp, fp, fn)` that returns { precision, recall } rounded to 2 decimal places. Precision = tp / (tp + fp), Recall = tp / (tp + fn).",
                codeLanguage: "javascript",
                starterCode: `function calculateMetrics(tp, fp, fn) {\n  const precision = Number((tp / (tp + fp)).toFixed(2));\n  const recall = Number((tp / (tp + fn)).toFixed(2));\n  return { precision, recall };\n}`,
                testCases: [
                    { call: "calculateMetrics(80, 20, 10)", expected: { precision: 0.8, recall: 0.89 }, description: "Computes 0.80 precision and 0.89 recall" }
                ],
                explanation: "Precision measures positive predictive value, while recall measures how many actual positives were identified.",
                marks: 20
            },
            {
                courseId: 7,
                difficultyId: 3, // Hard
                question: "Euclidean Distance Calculation: Write a function `euclideanDistance(p1, p2)` that calculates the Euclidean distance between two n-dimensional points (arrays of numbers), rounded to 2 decimal places.",
                codeLanguage: "javascript",
                starterCode: `function euclideanDistance(p1, p2) {\n  let sumSquares = 0;\n  for (let i = 0; i < p1.length; i++) {\n    sumSquares += Math.pow(p1[i] - p2[i], 2);\n  }\n  return Number(Math.sqrt(sumSquares).toFixed(2));\n}`,
                testCases: [
                    { call: "euclideanDistance([0, 0], [3, 4])", expected: 5, description: "Calculates classic 3-4-5 right triangle distance" },
                    { call: "euclideanDistance([1, 2, 3], [4, 6, 3])", expected: 5, description: "Calculates 3D vector Euclidean distance" }
                ],
                explanation: "Euclidean distance is the mathematical core of K-Nearest Neighbors (KNN) and K-Means clustering algorithms.",
                marks: 30
            },
            {
                courseId: 7,
                difficultyId: 4, // Expert
                question: "Softmax Probability Activation: Write a function `softmax(logits)` that returns the softmax probability distribution for an array of numbers, rounded to 3 decimal places.",
                codeLanguage: "javascript",
                starterCode: `function softmax(logits) {\n  const maxVal = Math.max(...logits);\n  const exp = logits.map(l => Math.exp(l - maxVal));\n  const sumExp = exp.reduce((a, b) => a + b, 0);\n  return exp.map(e => Number((e / sumExp).toFixed(3)));\n}`,
                testCases: [
                    { call: "softmax([1.0, 2.0, 3.0])", expected: [0.09, 0.245, 0.665], description: "Computes normalized softmax probability distribution" }
                ],
                explanation: "Softmax converts raw neural network logits into a valid categorical probability distribution that sums to 1.0.",
                marks: 40
            }
        ];

        // Seed coding challenges
        for (const ch of codingChallenges) {
            const existingCode = await queryOneFn(
                "SELECT id FROM questions WHERE course_id = ? AND difficulty_id = ? AND question_type = 'code' AND question = ?",
                [ch.courseId, ch.difficultyId, ch.question]
            );

            if (!existingCode) {
                await executeFn(
                    `INSERT INTO questions
                    (course_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, marks, question_type, code_language, starter_code, test_cases)
                    VALUES (?, ?, ?, '', '', '', '', 'Pass all unit tests', ?, ?, 'code', ?, ?, ?)`,
                    [
                        ch.courseId,
                        ch.difficultyId,
                        ch.question,
                        ch.explanation,
                        ch.marks,
                        ch.codeLanguage,
                        ch.starterCode,
                        JSON.stringify(ch.testCases)
                    ]
                );
            }
        }

        console.log(`✅ PathPilot ${engine} database ready: 4 difficulty levels, scenario tests, and coding challenges seeded!`);

    } catch (error) {
        console.error("Database seeding error:", error);
    }
}
