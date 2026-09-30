/**
 * PathPilot Task & Question Catalog
 * Defines the 4 difficulty levels across the 4 core career tracks:
 * - Level 1 (Beginner): Exactly 10 tasks (Coding at #4 and #8 for coding tracks)
 * - Level 2 (Intermediate): Exactly 16 tasks (Task #1 is Reassessment; exactly 5 coding tasks)
 * - Level 3 (Hard): Exactly 20 tasks (Topic-based questions; exactly 7 coding tasks with verified YouTube videos)
 * - Level 4 (Expert): Exactly 26 tasks (Advanced scenarios; exactly 10 coding tasks with verified YouTube videos)
 */

export const REAL_YOUTUBE_VIDEOS = {
    algorithms: "https://www.youtube.com/watch?v=kPRA0W1kECg", // Algorithms Full Course (freeCodeCamp)
    dataStructures: "https://www.youtube.com/watch?v=zg9ih6SVACc", // Data Structures Full Course
    sqlDatabase: "https://www.youtube.com/watch?v=HXV3zeQKqGY", // SQL Tutorial - Full Database Course
    reactLifecycle: "https://www.youtube.com/watch?v=bMknfKXIFA8", // React JS Full Course
    systemDesign: "https://www.youtube.com/watch?v=m8Icp_Cid5o", // System Design Primer
    pythonDataScience: "https://www.youtube.com/watch?v=r-uOLxNrNk8", // Python for Data Science
    pandasCleaning: "https://www.youtube.com/watch?v=vmEHCJofslg", // Pandas Data Analysis
    uiuxDesign: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU", // UI / UX Design Tutorial
    digitalMarketing: "https://www.youtube.com/watch?v=bixR-KIJKYM" // Digital Marketing Full Course
};

// Course 1: Software Developer
// Course 2: Data Analyst
// Course 3: UI/UX Designer
// Course 4: Digital Marketer

export function generateTasksForCourse(courseId, courseName, requiresCoding) {
    const tasks = [];

    // =========================================================================
    // LEVEL 1: BEGINNER (Exactly 10 Tasks)
    // Coding tasks at Task 4 and Task 8
    // =========================================================================
    const beginnerTopics = {
        1: ["Syntax & Variables", "Control Flow", "Functions", "Basic Algorithms", "Debugging", "Data Types", "Object Basics", "Array Methods", "Input/Output", "Capstone Review"],
        2: ["Spreadsheet Basics", "Data Types", "Basic Filtering", "Data Aggregation", "Summary Stats", "Null Values", "Sorting", "SQL SELECT Basics", "Data Visualization", "Capstone Analysis"],
        3: ["Design Principles", "Color Theory", "Typography", "Wireframe Layout", "User Empathy", "Accessibility", "Component Hierarchy", "Prototyping Interaction", "User Feedback", "Design Critique"],
        4: ["Marketing Channels", "Audience Persona", "Value Proposition", "Ad Copywriting", "Click-Through Rates", "Organic vs Paid", "Social Media Strategy", "Landing Page Audit", "Email Subject Lines", "Campaign Strategy"]
    };

    const courseTopics = beginnerTopics[courseId] || beginnerTopics[1];

    for (let t = 1; t <= 10; t++) {
        const isCodingTask = requiresCoding && (t === 4 || t === 8);
        const topic = courseTopics[t - 1];

        let taskType = "conceptual";
        let title = `${courseName}: ${topic}`;
        let desc = `Explore core fundamentals of ${topic.toLowerCase()} within ${courseName}.`;
        let starterCode = null;
        let testCases = null;
        let codeLang = "javascript";

        if (isCodingTask) {
            taskType = "coding";
            if (courseId === 1) { // Software Developer
                if (t === 4) {
                    title = "Coding Challenge: Sum of Array";
                    desc = "Write a function `sumArray(numbers)` that returns the sum of all elements in the given array.";
                    starterCode = "function sumArray(numbers) {\n  // Return sum of numbers array\n  return numbers.reduce((a, b) => a + b, 0);\n}";
                    testCases = JSON.stringify([
                        { call: "sumArray([1, 2, 3, 4])", expected: 10, description: "Sums positive integers" },
                        { call: "sumArray([10, -5, 20])", expected: 25, description: "Handles negative values" },
                        { call: "sumArray([])", expected: 0, description: "Empty array returns 0" }
                    ]);
                } else {
                    title = "Coding Challenge: Find Maximum Value";
                    desc = "Write a function `findMax(arr)` that returns the maximum value in an array, or null if empty.";
                    starterCode = "function findMax(arr) {\n  if (!arr || arr.length === 0) return null;\n  return Math.max(...arr);\n}";
                    testCases = JSON.stringify([
                        { call: "findMax([3, 7, 2, 9, 4])", expected: 9, description: "Returns highest integer" },
                        { call: "findMax([-10, -2, -50])", expected: -2, description: "Handles negative numbers" },
                        { call: "findMax([])", expected: null, description: "Empty array returns null" }
                    ]);
                }
            } else if (courseId === 2) { // Data Analyst
                if (t === 4) {
                    title = "Data Calculation: Calculate Average Value";
                    desc = "Write a function `calculateMean(values)` that computes the arithmetic mean rounded to 2 decimal places.";
                    starterCode = "function calculateMean(values) {\n  if (!values || values.length === 0) return 0;\n  const sum = values.reduce((acc, curr) => acc + curr, 0);\n  return Number((sum / values.length).toFixed(2));\n}";
                    testCases = JSON.stringify([
                        { call: "calculateMean([10, 20, 30, 40])", expected: 25, description: "Calculates average correctly" },
                        { call: "calculateMean([1, 2, 3])", expected: 2, description: "Calculates integer average" },
                        { call: "calculateMean([])", expected: 0, description: "Empty returns 0" }
                    ]);
                } else {
                    title = "Data Filtering: Filter Active Records";
                    desc = "Write a function `filterActive(records)` that returns only records with `isActive: true`.";
                    starterCode = "function filterActive(records) {\n  return records.filter(r => r.isActive === true);\n}";
                    testCases = JSON.stringify([
                        { call: "filterActive([{id:1, isActive:true}, {id:2, isActive:false}])", expected: [{id:1, isActive:true}], description: "Filters active records" },
                        { call: "filterActive([{id:3, isActive:false}])", expected: [], description: "Handles all inactive" }
                    ]);
                }
            }
        } else if (!requiresCoding && (t === 4 || t === 8)) {
            taskType = "practical";
            title = `Practical Challenge: ${topic}`;
            desc = `Analyze the workplace scenario on ${topic.toLowerCase()} and recommend the optimal solution.`;
        }

        tasks.push({
            course_id: courseId,
            difficulty_id: 1,
            task_number: t,
            title,
            topic,
            task_type: taskType,
            description: desc,
            instructions: isCodingTask ? "Write the required function and test it against all provided test cases." : "Read the scenario carefully, analyze the trade-offs, and choose the correct option.",
            video_url: null,
            marks: isCodingTask ? 20 : 10,
            starter_code: starterCode,
            test_cases: testCases,
            code_language: codeLang,
            passing_score: 60
        });
    }

    // =========================================================================
    // LEVEL 2: INTERMEDIATE (Exactly 16 Tasks)
    // Task 1: REASSESSMENT of Beginner topics
    // Exactly 5 coding tasks: Tasks 3, 6, 9, 12, 15
    // =========================================================================
    const intermediateTopics = [
        "Beginner Topics Comprehensive Reassessment", // Task 1
        "Component Modularization & State",
        "Data Transformation & Parsing",             // Task 3: Coding
        "Error Handling & Boundary Conditions",
        "API Request Orchestration",
        "Data Validation & Sanitization",            // Task 6: Coding
        "Database Relationships & Normalization",
        "Performance Optimization",
        "Array & String Processing",                 // Task 9: Coding
        "Authentication Tokens & Headers",
        "Event Handling & Asynchrony",
        "Algorithm Optimization (Sorting/Searching)",// Task 12: Coding
        "Microservices & Architecture Patterns",
        "Security: SQL Injection & XSS Defenses",
        "Recursion & Dynamic Programming",           // Task 15: Coding
        "Intermediate Final Capstone Evaluation"
    ];

    const codingIndicesLevel2 = [3, 6, 9, 12, 15];

    for (let t = 1; t <= 16; t++) {
        const isCodingTask = requiresCoding && codingIndicesLevel2.includes(t);
        const topic = intermediateTopics[t - 1] || `Intermediate Skill ${t}`;
        const isReassessment = (t === 1);

        let taskType = isReassessment ? "reassessment" : (isCodingTask ? "coding" : "conceptual");
        let title = isReassessment ? "Task 1: Beginner Knowledge Reassessment" : `${courseName}: ${topic}`;
        let desc = isReassessment
            ? "Reworded revision of fundamental concepts covered in the Beginner level to test concept retention before proceeding."
            : `Intermediate practical challenges focusing on ${topic.toLowerCase()}.`;
        let starterCode = null;
        let testCases = null;

        if (isCodingTask) {
            if (courseId === 1) { // Software Developer
                if (t === 3) {
                    title = "Coding Challenge: Palindrome Checker";
                    desc = "Write a function `isPalindrome(str)` that checks whether a string reads the same forwards and backwards (case-insensitive, ignoring non-alphanumeric chars).";
                    starterCode = "function isPalindrome(str) {\n  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return clean === clean.split('').reverse().join('');\n}";
                    testCases = JSON.stringify([
                        { call: "isPalindrome('A man, a plan, a canal: Panama')", expected: true, description: "Valid palindrome phrase" },
                        { call: "isPalindrome('race a car')", expected: false, description: "Invalid palindrome" },
                        { call: "isPalindrome('madam')", expected: true, description: "Single word palindrome" }
                    ]);
                } else if (t === 6) {
                    title = "Coding Challenge: Validate Email Format";
                    desc = "Write a function `isValidEmail(email)` that checks if a string is a valid email format using regex.";
                    starterCode = "function isValidEmail(email) {\n  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  return re.test(email);\n}";
                    testCases = JSON.stringify([
                        { call: "isValidEmail('student@pathpilot.org')", expected: true, description: "Standard valid email" },
                        { call: "isValidEmail('invalid-email')", expected: false, description: "Missing @ and domain" },
                        { call: "isValidEmail('@domain.com')", expected: false, description: "Missing username" }
                    ]);
                } else if (t === 9) {
                    title = "Coding Challenge: Chunk Array";
                    desc = "Write a function `chunkArray(array, size)` that splits an array into sub-arrays of specified size.";
                    starterCode = "function chunkArray(array, size) {\n  const result = [];\n  for (let i = 0; i < array.length; i += size) {\n    result.push(array.slice(i, i + size));\n  }\n  return result;\n}";
                    testCases = JSON.stringify([
                        { call: "chunkArray([1, 2, 3, 4, 5], 2)", expected: [[1, 2], [3, 4], [5]], description: "Chunks into groups of 2" },
                        { call: "chunkArray([1, 2, 3], 3)", expected: [[1, 2, 3]], description: "Single chunk when size equals length" }
                    ]);
                } else if (t === 12) {
                    title = "Coding Challenge: Two Sum Problem";
                    desc = "Write a function `twoSum(nums, target)` that returns the indices of the two numbers that add up to target.";
                    starterCode = "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}";
                    testCases = JSON.stringify([
                        { call: "twoSum([2, 7, 11, 15], 9)", expected: [0, 1], description: "Finds indices 0 and 1" },
                        { call: "twoSum([3, 2, 4], 6)", expected: [1, 2], description: "Finds indices 1 and 2" }
                    ]);
                } else {
                    title = "Coding Challenge: Flatten Deep Nested Array";
                    desc = "Write a function `flattenDeep(arr)` that flattens any arbitrarily nested array of numbers.";
                    starterCode = "function flattenDeep(arr) {\n  return arr.flat(Infinity);\n}";
                    testCases = JSON.stringify([
                        { call: "flattenDeep([1, [2, [3, [4]], 5]])", expected: [1, 2, 3, 4, 5], description: "Flattens deep nest" },
                        { call: "flattenDeep([1, 2, 3])", expected: [1, 2, 3], description: "Leaves flat array untouched" }
                    ]);
                }
            } else if (courseId === 2) { // Data Analyst
                if (t === 3) {
                    title = "Data Challenge: Calculate Median";
                    desc = "Write a function `calculateMedian(numbers)` that sorts numbers and returns the median.";
                    starterCode = "function calculateMedian(numbers) {\n  const s = [...numbers].sort((a,b)=>a-b);\n  const mid = Math.floor(s.length/2);\n  return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;\n}";
                    testCases = JSON.stringify([
                        { call: "calculateMedian([3, 1, 2])", expected: 2, description: "Odd length median" },
                        { call: "calculateMedian([4, 1, 3, 2])", expected: 2.5, description: "Even length median" }
                    ]);
                } else if (t === 6) {
                    title = "Data Challenge: Group By Category";
                    desc = "Write a function `groupByCategory(items)` that groups objects by their category property.";
                    starterCode = "function groupByCategory(items) {\n  return items.reduce((acc, item) => {\n    (acc[item.category] = acc[item.category] || []).push(item.name);\n    return acc;\n  }, {});\n}";
                    testCases = JSON.stringify([
                        { call: "groupByCategory([{name:'A', category:'X'}, {name:'B', category:'X'}, {name:'C', category:'Y'}])", expected: {X: ['A', 'B'], Y: ['C']}, description: "Groups items by category" }
                    ]);
                } else if (t === 9) {
                    title = "Data Challenge: Detect Outliers";
                    desc = "Write a function `detectOutliers(arr, threshold)` that returns all values strictly greater than threshold.";
                    starterCode = "function detectOutliers(arr, threshold) {\n  return arr.filter(v => v > threshold);\n}";
                    testCases = JSON.stringify([
                        { call: "detectOutliers([10, 15, 12, 100, 14], 50)", expected: [100], description: "Filters outlier values" }
                    ]);
                } else if (t === 12) {
                    title = "Data Challenge: Compute Moving Average";
                    desc = "Write a function `movingAverage(arr, windowSize)` that calculates the simple moving average for windowSize 2.";
                    starterCode = "function movingAverage(arr, windowSize) {\n  const res = [];\n  for (let i = 0; i <= arr.length - windowSize; i++) {\n    const slice = arr.slice(i, i + windowSize);\n    res.push(slice.reduce((a,b)=>a+b,0) / windowSize);\n  }\n  return res;\n}";
                    testCases = JSON.stringify([
                        { call: "movingAverage([2, 4, 6, 8], 2)", expected: [3, 5, 7], description: "Calculates 2-period moving averages" }
                    ]);
                } else {
                    title = "Data Challenge: Standardize Phone Formats";
                    desc = "Write a function `standardizePhone(digits)` that formats 10 digits as (XXX) XXX-XXXX.";
                    starterCode = "function standardizePhone(digits) {\n  const d = digits.replace(/\\D/g, '');\n  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;\n}";
                    testCases = JSON.stringify([
                        { call: "standardizePhone('1234567890')", expected: "(123) 456-7890", description: "Formats 10-digit string" }
                    ]);
                }
            }
        } else if (!requiresCoding && codingIndicesLevel2.includes(t)) {
            taskType = "practical";
            title = `Practical Case Study: ${topic}`;
            desc = `Analyze this simulated professional case study and make evidence-based decisions.`;
        }

        tasks.push({
            course_id: courseId,
            difficulty_id: 2,
            task_number: t,
            title,
            topic,
            task_type: taskType,
            description: desc,
            instructions: isCodingTask ? "Implement the solution in JavaScript and ensure all test cases pass." : "Answer the question carefully based on the stated scenario.",
            video_url: null,
            marks: isCodingTask ? 20 : (isReassessment ? 15 : 10),
            starter_code: starterCode,
            test_cases: testCases,
            code_language: "javascript",
            passing_score: 60
        });
    }

    // =========================================================================
    // LEVEL 3: HARD (Exactly 20 Tasks)
    // Exactly 7 coding tasks: Tasks 3, 6, 8, 11, 14, 17, 19
    // Learning videos embedded for coding tasks
    // Strict exam monitoring (Camera permission & live preview, Tab switch detection, Copy/Paste blocked)
    // =========================================================================
    const hardTopics = [
        "Advanced Data Structures & Big-O",
        "Memory Management & Garbage Collection",
        "Binary Search Algorithm",                    // Task 3: Coding (Video)
        "Database Indexing & Query Plans",
        "Distributed Locks & Race Conditions",
        "SQL Aggregation & Window Functions",         // Task 6: Coding (Video)
        "State Management & Immutable Updates",
        "LRU Cache Implementation",                   // Task 8: Coding (Video)
        "Microservice Circuit Breakers",
        "Eventual Consistency & CAP Theorem",
        "Graph Traversal (BFS/DFS)",                  // Task 11: Coding (Video)
        "OAuth2 Authorization & JWT Rotation",
        "Zero-Downtime Database Migrations",
        "Rate Limiting Token Bucket",                 // Task 14: Coding (Video)
        "Container Orchestration & Kubernetes",
        "WebSocket Scalability & Socket Clustering",
        "Debounce & Throttle High-Frequency Events",  // Task 17: Coding (Video)
        "Content Security Policy & XSS Mitigation",
        "Binary Tree Inversion & Validation",         // Task 19: Coding (Video)
        "Hard Level Comprehensive Architecture Audit"
    ];

    const hardCodingIndices = [3, 6, 8, 11, 14, 17, 19];

    for (let t = 1; t <= 20; t++) {
        const isCodingTask = requiresCoding && hardCodingIndices.includes(t);
        const topic = hardTopics[t - 1] || `Hard Technical Topic ${t}`;

        let taskType = isCodingTask ? "coding" : "conceptual";
        let title = `${courseName}: ${topic}`;
        let desc = `Hard-level comprehensive assessment on ${topic.toLowerCase()}.`;
        let videoUrl = null;
        let starterCode = null;
        let testCases = null;

        if (isCodingTask) {
            if (t === 3) {
                videoUrl = REAL_YOUTUBE_VIDEOS.algorithms;
                title = "Hard Coding Lab: Binary Search Algorithm";
                desc = "Implement `binarySearch(sortedArr, target)` returning the index of target in O(log n) time, or -1 if not found.";
                starterCode = "function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}";
                testCases = JSON.stringify([
                    { call: "binarySearch([1, 3, 5, 7, 9, 11], 7)", expected: 3, description: "Finds element in odd array" },
                    { call: "binarySearch([2, 4, 6, 8, 10], 8)", expected: 3, description: "Finds element in even array" },
                    { call: "binarySearch([1, 2, 3], 99)", expected: -1, description: "Returns -1 when missing" }
                ]);
            } else if (t === 6) {
                videoUrl = REAL_YOUTUBE_VIDEOS.sqlDatabase;
                title = "Hard Coding Lab: SQL-Style Record Joiner";
                desc = "Write `innerJoin(users, orders)` that joins records where `user.id === order.userId`.";
                starterCode = "function innerJoin(users, orders) {\n  const userMap = new Map(users.map(u => [u.id, u.name]));\n  return orders.filter(o => userMap.has(o.userId)).map(o => ({ orderId: o.id, userName: userMap.get(o.userId), amount: o.amount }));\n}";
                testCases = JSON.stringify([
                    { call: "innerJoin([{id:1, name:'Alice'}, {id:2, name:'Bob'}], [{id:101, userId:1, amount:50}, {id:102, userId:3, amount:80}])", expected: [{orderId: 101, userName: "Alice", amount: 50}], description: "Performs correct inner join" }
                ]);
            } else if (t === 8) {
                videoUrl = REAL_YOUTUBE_VIDEOS.dataStructures;
                title = "Hard Coding Lab: LRU Cache";
                desc = "Implement a simple `LRUCache(capacity)` with `.get(key)` and `.put(key, val)`.";
                starterCode = "class LRUCache {\n  constructor(cap) { this.cap = cap; this.map = new Map(); }\n  get(k) {\n    if (!this.map.has(k)) return -1;\n    const v = this.map.get(k);\n    this.map.delete(k); this.map.set(k, v);\n    return v;\n  }\n  put(k, v) {\n    if (this.map.has(k)) this.map.delete(k);\n    else if (this.map.size >= this.cap) this.map.delete(this.map.keys().next().value);\n    this.map.set(k, v);\n  }\n}\nfunction testLRU() {\n  const cache = new LRUCache(2);\n  cache.put(1, 1); cache.put(2, 2);\n  const g1 = cache.get(1); // 1\n  cache.put(3, 3); // evicts 2\n  const g2 = cache.get(2); // -1\n  return [g1, g2];\n}";
                testCases = JSON.stringify([
                    { call: "testLRU()", expected: [1, -1], description: "Correctly caches and evicts LRU item" }
                ]);
            } else if (t === 11) {
                videoUrl = REAL_YOUTUBE_VIDEOS.algorithms;
                title = "Hard Coding Lab: Breadth-First Graph Traversal";
                desc = "Implement `bfs(graph, startNode)` returning the visited nodes array in breadth-first order.";
                starterCode = "function bfs(graph, start) {\n  const visited = new Set([start]);\n  const queue = [start];\n  const result = [];\n  while (queue.length > 0) {\n    const node = queue.shift();\n    result.push(node);\n    for (const neighbor of (graph[node] || [])) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  return result;\n}";
                testCases = JSON.stringify([
                    { call: "bfs({A: ['B', 'C'], B: ['D'], C: [], D: []}, 'A')", expected: ['A', 'B', 'C', 'D'], description: "Traverses graph breadth-first" }
                ]);
            } else if (t === 14) {
                videoUrl = REAL_YOUTUBE_VIDEOS.systemDesign;
                title = "Hard Coding Lab: Token Bucket Rate Limiter";
                desc = "Implement `rateLimit(requests, limitPerSec)` allowing at most `limitPerSec` requests.";
                starterCode = "function rateLimit(timestamps, limit) {\n  const allowed = [];\n  const window = [];\n  for (const t of timestamps) {\n    while (window.length > 0 && window[0] <= t - 1000) window.shift();\n    if (window.length < limit) {\n      window.push(t);\n      allowed.push(true);\n    } else {\n      allowed.push(false);\n    }\n  }\n  return allowed;\n}";
                testCases = JSON.stringify([
                    { call: "rateLimit([100, 200, 300, 1500], 2)", expected: [true, true, false, true], description: "Limits bursts within 1-second window" }
                ]);
            } else if (t === 17) {
                videoUrl = REAL_YOUTUBE_VIDEOS.reactLifecycle;
                title = "Hard Coding Lab: Debounce High Frequency Function";
                desc = "Write `debounceSimulation(calls, delay)` that simulates debounce behavior on timestamps.";
                starterCode = "function debounceSimulation(calls, delay) {\n  let lastExecuted = null;\n  const executedAt = [];\n  for (let i = 0; i < calls.length; i++) {\n    const isLast = (i === calls.length - 1) || (calls[i + 1] - calls[i] >= delay);\n    if (isLast) executedAt.push(calls[i] + delay);\n  }\n  return executedAt;\n}";
                testCases = JSON.stringify([
                    { call: "debounceSimulation([10, 20, 30], 50)", expected: [80], description: "Only executes after last call cools down" }
                ]);
            } else {
                videoUrl = REAL_YOUTUBE_VIDEOS.dataStructures;
                title = "Hard Coding Lab: Validate Binary Search Tree";
                desc = "Write `isValidBST(treeNode)` to check if a binary tree satisfies the BST property.";
                starterCode = "function isValidBST(root, min = -Infinity, max = Infinity) {\n  if (!root) return true;\n  if (root.val <= min || root.val >= max) return false;\n  return isValidBST(root.left, min, root.val) && isValidBST(root.right, root.val, max);\n}";
                testCases = JSON.stringify([
                    { call: "isValidBST({val: 2, left: {val: 1}, right: {val: 3}})", expected: true, description: "Valid BST returns true" },
                    { call: "isValidBST({val: 5, left: {val: 6}, right: {val: 7}})", expected: false, description: "Invalid BST node returns false" }
                ]);
            }
        } else if (!requiresCoding && hardCodingIndices.includes(t)) {
            taskType = "practical";
            videoUrl = courseId === 3 ? REAL_YOUTUBE_VIDEOS.uiuxDesign : REAL_YOUTUBE_VIDEOS.digitalMarketing;
            title = `Hard Practical Lab: ${topic}`;
            desc = `Analyze complex real-world metrics, design components, and tactical constraints.`;
        }

        tasks.push({
            course_id: courseId,
            difficulty_id: 3,
            task_number: t,
            title,
            topic,
            task_type: taskType,
            description: desc,
            instructions: isCodingTask ? "Review the educational video if needed, inspect the constraints, and write your solution." : "Analyze the technical scenario and select the most resilient architectural decision.",
            video_url: videoUrl,
            marks: isCodingTask ? 25 : 15,
            starter_code: starterCode,
            test_cases: testCases,
            code_language: "javascript",
            passing_score: 60
        });
    }

    // =========================================================================
    // LEVEL 4: EXPERT (Exactly 26 Tasks)
    // Exactly 10 coding tasks: Tasks 2, 5, 7, 10, 12, 15, 17, 20, 22, 25
    // Real educational YouTube videos embedded for coding tasks
    // Strict exam monitoring (Camera check, Tab switch detection, Copy/Paste restrictions)
    // =========================================================================
    const expertTopics = [
        "Distributed Consensus (Raft & Paxos)",
        "Consistent Hashing Ring Implementation",      // Task 2: Coding (Video)
        "Multi-Region Database Replication & Conflict",
        "Disaster Recovery & Zero Data Loss (RPO/RTO)",
        "Thread-Safe Priority Queue",                  // Task 5: Coding (Video)
        "Zero-Trust Identity & Mutual TLS (mTLS)",
        "Trie (Prefix Tree) Autocomplete Engine",      // Task 7: Coding (Video)
        "Kernel Bypass, eBPF & High-Throughput I/O",
        "Dynamic Config Hot-Reloading & Gossip Protocol",
        "Topological Sort (Dependency Resolution)",    // Task 10: Coding (Video)
        "Fault-Tolerant Event Stream Processing",
        "Deadlock Detection in Resource Allocation",   // Task 12: Coding (Video)
        "Disaster Scenario: Ransomware Response Drill",
        "High-Concurrency Sharded Counter",
        "Bloom Filter Probabilistic Data Structure",   // Task 15: Coding (Video)
        "Graceful Shutdown & Drain Inflight Traffic",
        "Sliding Window Maximum (O(n) Deque)",         // Task 17: Coding (Video)
        "Micro-Frontends & Federation at Scale",
        "Chaos Engineering & Latency Injection",
        "A* Pathfinding Algorithm",                    // Task 20: Coding (Video)
        "Serverless Cold Start Optimization",
        "Merkle Tree Data Integrity Verification",     // Task 22: Coding (Video)
        "Enterprise Compliance: SOC2 & GDPR Audits",
        "Database Engine B-Tree Page Manager",
        "Longest Increasing Subsequence (O(n log n))", // Task 25: Coding (Video)
        "Expert Capstone: Enterprise System Architecture"
    ];

    const expertCodingIndices = [2, 5, 7, 10, 12, 15, 17, 20, 22, 25];

    for (let t = 1; t <= 26; t++) {
        const isCodingTask = requiresCoding && expertCodingIndices.includes(t);
        const topic = expertTopics[t - 1] || `Expert Challenge ${t}`;

        let taskType = isCodingTask ? "coding" : "conceptual";
        let title = `${courseName}: ${topic}`;
        let desc = `Expert-level mission-critical scenario evaluating deep reasoning on ${topic.toLowerCase()}.`;
        let videoUrl = null;
        let starterCode = null;
        let testCases = null;

        if (isCodingTask) {
            videoUrl = REAL_YOUTUBE_VIDEOS.systemDesign;
            if (t === 2) {
                title = "Expert Coding Lab: Consistent Hashing Ring";
                desc = "Implement `getNode(key, nodes)` returning the assigned node from a consistent hash ring of nodes.";
                starterCode = "function getNode(key, nodes) {\n  if (!nodes || nodes.length === 0) return null;\n  let hash = 0;\n  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;\n  return nodes[hash % nodes.length];\n}";
                testCases = JSON.stringify([
                    { call: "getNode('user_123', ['node-A', 'node-B', 'node-C'])", expected: "node-B", description: "Consistently maps key to specific server node" }
                ]);
            } else if (t === 5) {
                title = "Expert Coding Lab: Priority Queue";
                desc = "Write `PriorityQueue` with `insert(val, priority)` and `extractMin()`.";
                starterCode = "class PriorityQueue {\n  constructor() { this.items = []; }\n  insert(val, prio) {\n    this.items.push({val, prio});\n    this.items.sort((a,b)=>a.prio - b.prio);\n  }\n  extractMin() { return this.items.length ? this.items.shift().val : null; }\n}\nfunction testPQ() {\n  const pq = new PriorityQueue();\n  pq.insert('low', 10); pq.insert('high', 1); pq.insert('med', 5);\n  return [pq.extractMin(), pq.extractMin()];\n}";
                testCases = JSON.stringify([
                    { call: "testPQ()", expected: ['high', 'med'], description: "Pops lowest priority integer first" }
                ]);
            } else if (t === 7) {
                videoUrl = REAL_YOUTUBE_VIDEOS.dataStructures;
                title = "Expert Coding Lab: Trie (Prefix Tree)";
                desc = "Implement `Trie` with `insert(word)` and `startsWith(prefix)`.";
                starterCode = "class Trie {\n  constructor() { this.root = {}; }\n  insert(word) {\n    let node = this.root;\n    for (const ch of word) node = node[ch] = node[ch] || {};\n    node.isWord = true;\n  }\n  startsWith(prefix) {\n    let node = this.root;\n    for (const ch of prefix) { if (!node[ch]) return false; node = node[ch]; }\n    return true;\n  }\n}\nfunction testTrie() {\n  const t = new Trie();\n  t.insert('pathpilot');\n  return [t.startsWith('path'), t.startsWith('pilot')];\n}";
                testCases = JSON.stringify([
                    { call: "testTrie()", expected: [true, false], description: "Matches valid prefixes accurately" }
                ]);
            } else if (t === 10) {
                videoUrl = REAL_YOUTUBE_VIDEOS.algorithms;
                title = "Expert Coding Lab: Topological Sort";
                desc = "Write `topoSort(numTasks, prereqs)` returning a valid task execution order or empty if cyclic.";
                starterCode = "function topoSort(n, prereqs) {\n  const inDegree = new Array(n).fill(0);\n  const adj = Array.from({length: n}, () => []);\n  for (const [u, v] of prereqs) { adj[v].push(u); inDegree[u]++; }\n  const q = [];\n  for (let i = 0; i < n; i++) if (inDegree[i] === 0) q.push(i);\n  const order = [];\n  while (q.length) {\n    const node = q.shift();\n    order.push(node);\n    for (const nxt of adj[node]) {\n      if (--inDegree[nxt] === 0) q.push(nxt);\n    }\n  }\n  return order.length === n ? order : [];\n}";
                testCases = JSON.stringify([
                    { call: "topoSort(3, [[0, 1], [1, 2]])", expected: [2, 1, 0], description: "Resolves linear dependencies" }
                ]);
            } else if (t === 12) {
                title = "Expert Coding Lab: Cycle / Deadlock Detection";
                desc = "Write `hasDeadlock(connections)` detecting cycles in directed graph.";
                starterCode = "function hasDeadlock(adj) {\n  const visited = new Set();\n  const recStack = new Set();\n  function dfs(node) {\n    visited.add(node); recStack.add(node);\n    for (const nxt of (adj[node] || [])) {\n      if (!visited.has(nxt) && dfs(nxt)) return true;\n      if (recStack.has(nxt)) return true;\n    }\n    recStack.delete(node);\n    return false;\n  }\n  for (const node of Object.keys(adj)) {\n    if (!visited.has(node) && dfs(node)) return true;\n  }\n  return false;\n}";
                testCases = JSON.stringify([
                    { call: "hasDeadlock({A: ['B'], B: ['C'], C: ['A']})", expected: true, description: "Detects cyclic circular wait (deadlock)" },
                    { call: "hasDeadlock({A: ['B'], B: ['C'], C: []})", expected: false, description: "Acyclic graph has no deadlock" }
                ]);
            } else if (t === 15) {
                title = "Expert Coding Lab: Bloom Filter Membership";
                desc = "Implement `BloomFilter(size)` with `add(str)` and `mightContain(str)`.";
                starterCode = "class BloomFilter {\n  constructor(size = 32) { this.size = size; this.bits = new Array(size).fill(0); }\n  h1(s) { let h = 0; for (let c of s) h = (h * 31 + c.charCodeAt(0)) % this.size; return h; }\n  h2(s) { let h = 0; for (let c of s) h = (h * 17 + c.charCodeAt(0)) % this.size; return h; }\n  add(s) { this.bits[this.h1(s)] = 1; this.bits[this.h2(s)] = 1; }\n  mightContain(s) { return this.bits[this.h1(s)] === 1 && this.bits[this.h2(s)] === 1; }\n}\nfunction testBloom() {\n  const bf = new BloomFilter(64);\n  bf.add('hello');\n  return [bf.mightContain('hello'), bf.mightContain('world')];\n}";
                testCases = JSON.stringify([
                    { call: "testBloom()", expected: [true, false], description: "Accurately detects present items without false negatives" }
                ]);
            } else if (t === 17) {
                title = "Expert Coding Lab: Sliding Window Maximum";
                desc = "Write `maxSlidingWindow(nums, k)` in O(n) returning the max of each sliding window of size k.";
                starterCode = "function maxSlidingWindow(nums, k) {\n  const res = [];\n  const q = [];\n  for (let i = 0; i < nums.length; i++) {\n    while (q.length && q[0] <= i - k) q.shift();\n    while (q.length && nums[q[q.length - 1]] <= nums[i]) q.pop();\n    q.push(i);\n    if (i >= k - 1) res.push(nums[q[0]]);\n  }\n  return res;\n}";
                testCases = JSON.stringify([
                    { call: "maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3)", expected: [3, 3, 5, 5, 6, 7], description: "Calculates max sliding window" }
                ]);
            } else if (t === 20) {
                title = "Expert Coding Lab: Matrix Shortest Path";
                desc = "Write `shortestPath(grid)` returning length of shortest 8-directional clear path in binary matrix, or -1.";
                starterCode = "function shortestPath(grid) {\n  const n = grid.length;\n  if (grid[0][0] !== 0 || grid[n-1][n-1] !== 0) return -1;\n  const q = [[0, 0, 1]];\n  grid[0][0] = 1;\n  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];\n  while (q.length) {\n    const [r, c, d] = q.shift();\n    if (r === n - 1 && c === n - 1) return d;\n    for (const [dr, dc] of dirs) {\n      const nr = r + dr, nc = c + dc;\n      if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 0) {\n        grid[nr][nc] = 1;\n        q.push([nr, nc, d + 1]);\n      }\n    }\n  }\n  return -1;\n}";
                testCases = JSON.stringify([
                    { call: "shortestPath([[0,0,0],[1,1,0],[1,1,0]])", expected: 4, description: "Finds shortest clear path length" }
                ]);
            } else if (t === 22) {
                title = "Expert Coding Lab: Merkle Root Hash";
                desc = "Write `getMerkleRoot(leaves)` that computes the root hash of an array of string leaves.";
                starterCode = "function getMerkleRoot(leaves) {\n  if (!leaves.length) return '';\n  let layer = [...leaves];\n  while (layer.length > 1) {\n    const next = [];\n    for (let i = 0; i < layer.length; i += 2) {\n      const l = layer[i], r = layer[i+1] || layer[i];\n      next.push(`H(${l}+${r})`);\n    }\n    layer = next;\n  }\n  return layer[0];\n}";
                testCases = JSON.stringify([
                    { call: "getMerkleRoot(['L1', 'L2'])", expected: "H(L1+L2)", description: "Computes single-level merkle hash" }
                ]);
            } else {
                title = "Expert Coding Lab: Longest Increasing Subsequence";
                desc = "Write `lengthOfLIS(nums)` returning the length of the longest strictly increasing subsequence in O(n log n).";
                starterCode = "function lengthOfLIS(nums) {\n  const tails = [];\n  for (const x of nums) {\n    let i = 0, j = tails.length;\n    while (i < j) {\n      const m = Math.floor((i + j) / 2);\n      if (tails[m] < x) i = m + 1; else j = m;\n    }\n    tails[i] = x;\n  }\n  return tails.length;\n}";
                testCases = JSON.stringify([
                    { call: "lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])", expected: 4, description: "Finds LIS length of 4 ([2, 3, 7, 101])" }
                ]);
            }
        } else if (!requiresCoding && expertCodingIndices.includes(t)) {
            taskType = "practical";
            videoUrl = courseId === 3 ? REAL_YOUTUBE_VIDEOS.uiuxDesign : REAL_YOUTUBE_VIDEOS.digitalMarketing;
            title = `Expert Practical Lab: ${topic}`;
            desc = `Analyze mission-critical enterprise design systems or omnichannel growth strategies under pressure.`;
        }

        tasks.push({
            course_id: courseId,
            difficulty_id: 4,
            task_number: t,
            title,
            topic,
            task_type: taskType,
            description: desc,
            instructions: isCodingTask ? "Watch the recommended system architecture video if necessary, then construct the high-performance implementation." : "Analyze the enterprise case study and propose the fault-tolerant solution.",
            video_url: videoUrl,
            marks: isCodingTask ? 30 : 20,
            starter_code: starterCode,
            test_cases: testCases,
            code_language: "javascript",
            passing_score: 60
        });
    }

    return tasks;
}

/**
 * Question generator creating multiple randomized questions per task
 */
export function generateQuestionsForTask(task) {
    const questions = [];
    const { course_id, difficulty_id, task_number, topic, task_type, marks } = task;

    if (task_type === "coding") {
        questions.push({
            course_id,
            difficulty_id,
            task_number,
            topic,
            question: task.description,
            option_a: "Automated unit tests execution",
            option_b: "Static syntax analysis",
            option_c: "Manual peer review",
            option_d: "Runtime error reproduction",
            correct_answer: "Automated unit tests execution",
            explanation: `Coding challenge for ${topic}. All provided unit tests must pass in the sandbox environment.`,
            marks: marks || 20,
            question_type: "code",
            code_language: task.code_language || "javascript",
            starter_code: task.starter_code,
            test_cases: task.test_cases
        });
        return questions;
    }

    if (task_type === "reassessment") {
        // Intermediate Task 1 - Beginner Reassessment Questions (2-3 questions per reassessment)
        questions.push(
            {
                course_id,
                difficulty_id,
                task_number,
                topic: "Beginner Reassessment: Variables & Scope",
                question: "In modern JavaScript, what is the key difference in scoping between variables declared with `let` versus `var`?",
                option_a: "`var` is block-scoped while `let` is function-scoped",
                option_b: "`let` is block-scoped while `var` is function-scoped (or globally scoped if declared outside a function)",
                option_c: "There is no difference in runtime scoping rules",
                option_d: "`let` can be redeclared in the same block whereas `var` cannot",
                correct_answer: "`let` is block-scoped while `var` is function-scoped (or globally scoped if declared outside a function)",
                explanation: "`let` and `const` provide lexical block scoping within braces `{}`, preventing accidental leaking and hoisting bugs associated with `var`.",
                marks: 5,
                question_type: "reassessment"
            },
            {
                course_id,
                difficulty_id,
                task_number,
                topic: "Beginner Reassessment: Asynchronous JavaScript",
                question: "Which keyword is paired with `async` to pause execution until a Promise settles without blocking the Node event loop?",
                option_a: "defer",
                option_b: "await",
                option_c: "yield",
                option_d: "pause",
                correct_answer: "await",
                explanation: "The `await` expression causes `async` function execution to pause until a Promise is resolved or rejected, while allowing the event loop to continue handling other operations.",
                marks: 5,
                question_type: "reassessment"
            },
            {
                course_id,
                difficulty_id,
                task_number,
                topic: "Beginner Reassessment: HTTP Protocols",
                question: "Which HTTP status code indicates that the server successfully processed the request and is returning the requested content?",
                option_a: "200 OK",
                option_b: "201 Created",
                option_c: "204 No Content",
                option_d: "304 Not Modified",
                correct_answer: "200 OK",
                explanation: "200 OK is the standard response for successful HTTP requests with an entity payload.",
                marks: 5,
                question_type: "reassessment"
            }
        );
        return questions;
    }

    // Default Scenario / Conceptual Questions (at least 2 questions per task to allow randomization)
    questions.push(
        {
            course_id,
            difficulty_id,
            task_number,
            topic,
            question: `In a production workplace setting, when applying principles of ${topic}, which approach delivers the most reliable, maintainable outcome?`,
            option_a: "Apply standardized industry patterns, validate input boundaries, and handle edge cases systematically",
            option_b: "Bypass error handling to minimize code line count and maximize initial execution velocity",
            option_c: "Hardcode configuration constants into the root module to prevent environment dependencies",
            option_d: "Disable monitoring and logging to conserve application CPU and disk storage",
            correct_answer: "Apply standardized industry patterns, validate input boundaries, and handle edge cases systematically",
            explanation: "Industry best practices emphasize strict boundary verification, defensive input handling, and transparent instrumentation to ensure resilience and maintainability.",
            marks: 5,
            question_type: "mcq"
        },
        {
            course_id,
            difficulty_id,
            task_number,
            topic,
            question: `Which metric or indicator best measures success when evaluating the effectiveness of ${topic}?`,
            option_a: "Consistency of operational outcomes, lower error frequencies, and clear architectural modularity",
            option_b: "Number of commits made in a single calendar day regardless of code quality",
            option_c: "Total lines of documentation generated by automated generators",
            option_d: "Immediate deprecation of all legacy systems without testing replacement pathways",
            correct_answer: "Consistency of operational outcomes, lower error frequencies, and clear architectural modularity",
            explanation: "High quality engineering and design is measured by predictable stability, measurable reduction in defect rates, and ease of code maintainability.",
            marks: 5,
            question_type: "mcq"
        }
    );

    return questions;
}
