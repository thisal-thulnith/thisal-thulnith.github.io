// Everything personal on the site lives in this one file.
// Edit text here; the page and the terminal both read from it.

export const site = {
  name: "Thisal Thulnith",
  first: "Thisal",
  last: "Thulnith",
  role: "AI & Product Engineer",
  location: "Sri Lanka",
  timezone: "Asia/Colombo",
  status: "Available for work",

  // The opening screen.
  // The brand line. It is the band of large type after the tour: one sentence to a row.
  eyebrow: "Curious mind. Intelligent products.",
  title: ["Turning ambitious", "ideas into things", "that think."],
  hook: "AI & Product Engineer. I build AI systems and robotics that solve real problems.",
  // Two numbers of proof. They show on the opening screen, on the last branch of the project tree and by
  // the contact button. Keep them true.
  proofs: [
    { value: "10+", label: "products shipped in the real world" },
    { value: "10,000+", label: "people use what I've built" },
  ],
  // The button that asks for work.
  hire: { cta: "Work with me" },
  // How many projects the home page shows on its tree. Every project is on the work page.
  homeProjects: 4,
  // The last branch of the home page's tree leads to the work page.
  nextBranch: { kicker: "More work", title: "See it all.", text: "These are four of the products I've shipped. The work page has every one, with its case study.", cta: "See all work", href: "work.html" },
  // The work page: its opening words, and the offer at the end of its path.
  workPage: {
    label: "All work",
    title: "Everything I've shipped.",
    text: "Products I designed, built and put in front of real people. Scroll to walk the path.",
    end: { kicker: "The next one", title: "Yours?", text: "Bring the idea. I'll take it from “what if?” to something people use." },
  },
  // The three things I do. They are the links at the bottom of the opening screen and the three sections after it.
  // The three fields, shown as one small line under the button on the opening screen.
  fields: ["AI systems", "Digital products", "Robotics"],
  pillars: [
    { title: "Systems that think", sub: "AI/ML systems" },
    { title: "Machines that move", sub: "Robotics" },
    { title: "Solutions that matter", sub: "Real-world problems" },
  ],
  // Save your photo as assets/portrait.jpg and it fills the frame on the opening screen.
  portrait: "assets/portrait.webp",
  portraitAlt: "Professional black and white portrait of Thisal Thulnith seated with hands resting on his lap",

  // The person behind the products.
  about: {
    label: "The person behind the products",
    title: "Always curious. Always building.",
    short: "I take complex ideas and make them useful in the real world.",
    lead: "I'm Thisal, an AI and product engineer from Sri Lanka. I like taking a complex idea and making it useful in the real world.",
    body: [
      "My work brings together AI, software engineering, and a product mindset. Alongside my work at CodeGen International, I build and explore intelligent systems, from conversational agents and market analytics to robotics.",
      "I'm most interested in the space between \u201cwhat if?\u201d and \u201cit works.\u201d",
    ],
    tags: ["Agentic AI", "Full-stack development", "Product engineering", "Robotics"],
  },

  // Currently exploring.
  exploring: {
    label: "Currently exploring",
    title: "Intelligence. Outside the screen.",
    text: "Experimenting at the intersection of AI and robotics, from autonomous drones to systems that understand the world around them.",
    cta: "Talk about an idea",
  },

  // The dark window after the About text. The points spell `from`, scatter, and settle as `to`;
  // `lead` is the line written above them.
  think: { label: "How I think", lead: "I'm most interested in the space between", from: "what if?", to: "it works." },

  availability: "Open to relocation worldwide. Remote-friendly. Available now.",
  email: "thisalthulnith2024@gmail.com",
  links: {
    github: "https://github.com/thisal-thulnith",
    linkedin: "https://www.linkedin.com/in/thisal-thulnith",
  },
};

// Projects. To add one, copy a block and change the text.
// To show a real screenshot for a project, save it in assets/projects/ and add a line to its block,
// for example:  image: "assets/projects/stocknetwork.jpg",
// Without an image the site draws a diagram of the project's `flow` steps.
// `art` picks the animated cover: chart, chat, wave, calendar, devices or docs.
// `color` is the cover's background. The covers are drawn for these three: ink #0E0F11, orange #FF4F1A and sand #E6E1D4.
// `ink` is "light" on a dark cover and "dark" on a light one.
export const projects = [
  {
    id: "stocknetwork",
    title: "StockNetwork",
    short: "Multi-agent stock analysis for the Colombo Stock Exchange",
    kind: "Multi-agent platform",
    status: "Live",
    role: "Sole architect",
    art: "chart",
    color: "#0E0F11",
    ink: "light",
    metric: { value: "500+", label: "active users" },
    summary:
      "A live Colombo Stock Exchange platform with more than 500 users. I architected and built it alone, from the agents to the servers.",
    built: [
      "Architected a LangGraph supervisor that hands each question to seven specialist analyst agents.",
      "Added checkpointed state so long, multi-step analyses survive failures and resume.",
      "Built a 100-question eval suite with regression reports that track answer quality.",
      "Shipped GitHub Actions CI/CD that deploys Docker images to AWS EC2 on every push to main.",
      "Routed calls across OpenAI and Groq behind one interface for speed and cost headroom.",
      "Built scheduled pandas market-data pipelines that feed the agents' analysis tools.",
      "Built the backend on FastAPI, SQLAlchemy and PostgreSQL with Redis caching.",
    ],
    flow: ["Investor question", "Supervisor", "7 analyst agents", "Market data tools", "Checked answer"],
    stack: ["Python", "FastAPI", "LangGraph", "SQLAlchemy", "PostgreSQL", "Redis", "Docker", "AWS EC2", "GitHub Actions", "OpenAI", "Groq"],
    link: { label: "stocknetwork.net", url: "https://stocknetwork.net" },
  },
  {
    id: "zorum",
    title: "Zorum AI",
    short: "A multi-tenant WhatsApp commerce platform run by AI agents",
    kind: "Conversational commerce",
    status: "In production",
    role: "Agent platform build",
    art: "chat",
    color: "#FF4F1A",
    ink: "dark",
    metric: { value: "<1 s", label: "average reply time, 24/7" },
    summary:
      "AI agents that handle customers, orders and payments end to end on WhatsApp. In production for a leading Sri Lankan brand.",
    built: [
      "Built multilingual agents for Sinhala, Tamil and English with automatic language detection.",
      "Held the average response time under one second on 24/7 customer conversations.",
      "Automated orders end to end: cart, payment links and receipt verification.",
      "Shipped appointment booking with staff assignment, reminders and loyalty tracking.",
      "Built 12 modules on a multi-tenant architecture across self-serve and enterprise tiers.",
    ],
    flow: ["WhatsApp message", "Language detection", "Agent", "Orders, bookings, payments", "Reply"],
    stack: ["Python", "LangGraph", "FastAPI", "WhatsApp Business API", "PostgreSQL"],
    link: { label: "zorumai.com", url: "https://zorumai.com" },
  },
  {
    id: "whisper",
    title: "Sinhala Whisper",
    short: "Open-source speech-to-text for a low-resource language",
    kind: "Model fine-tuning",
    status: "Open source",
    role: "Fine-tuning and evaluation",
    art: "wave",
    color: "#E6E1D4",
    ink: "dark",
    metric: { value: "88%", label: "validation accuracy on 5,365 held-out clips" },
    summary:
      "Sinhala has little speech tooling. I fine-tuned Whisper Small to transcribe it and published the weights openly on Hugging Face.",
    built: [
      "Fine-tuned Whisper Small to 88% validation accuracy on 5,365 held-out clips.",
      "Ran the full PyTorch training loop: data preparation, hyperparameter tuning and evaluation.",
      "Published the weights openly on Hugging Face for a language with little tooling.",
    ],
    flow: ["Sinhala audio", "Whisper Small, fine-tuned", "Sinhala text"],
    stack: ["Python", "PyTorch", "Hugging Face Transformers", "Whisper"],
    // No link is shown until the real model page is known. To show it, put the address in and remove the two slashes:
    // link: { label: "Hugging Face", url: "https://huggingface.co/your-name/your-model" },
  },
  {
    id: "buffsalon",
    title: "Buff Salon AI",
    short: "A booking agent that runs two models behind one interface",
    kind: "Booking agent",
    status: "Shipped",
    role: "Design and build",
    art: "calendar",
    color: "#0E0F11",
    ink: "light",
    metric: { value: "2", label: "models behind one shared interface" },
    summary:
      "A salon booking agent built on LangGraph. It runs Claude and Gemini behind one shared interface, so the model can be swapped without touching the rest of the system.",
    built: [
      "Built the booking agent on LangGraph, from the first message to a confirmed appointment.",
      "Put Claude and Gemini behind one shared interface so either model can answer.",
    ],
    flow: ["Customer message", "Booking agent", "Claude or Gemini", "Appointment"],
    stack: ["Python", "LangGraph", "Claude", "Gemini"],
    link: { label: "GitHub", url: "https://github.com/thisal-thulnith" },
  },
  {
    id: "sales",
    title: "Sales Agent",
    short: "A multi-turn sales agent on web and mobile",
    kind: "Sales agent",
    status: "Shipped",
    role: "Build",
    art: "devices",
    color: "#E6E1D4",
    ink: "dark",
    metric: { value: "2", label: "platforms from one REST API" },
    summary:
      "A multi-turn, context-aware sales agent, delivered to web and mobile through one shared REST API.",
    built: [
      "Built a multi-turn, context-aware sales agent with LLMs and LangGraph.",
      "Delivered it to web (React) and mobile (Flutter) through one shared REST API.",
    ],
    flow: ["Customer", "Web or mobile app", "REST API", "Sales agent", "Reply"],
    stack: ["Python", "LangChain", "LangGraph", "GPT-4", "React", "Flutter", "REST APIs"],
    link: { label: "GitHub", url: "https://github.com/thisal-thulnith" },
  },
  {
    id: "construction",
    title: "Construction Agent",
    short: "Messy construction documents turned into answers",
    kind: "RAG platform",
    status: "Shipped",
    role: "Build",
    art: "docs",
    color: "#0E0F11",
    ink: "light",
    metric: { value: "3", label: "roles: managers, workers and clients" },
    summary:
      "A chat-based multi-agent platform that turns unstructured construction documents into queryable knowledge, with a different workflow for each role.",
    built: [
      "Built a RAG pipeline that turns unstructured construction documents into queryable knowledge.",
      "Designed role-based workflows for managers, workers and clients.",
    ],
    flow: ["Documents", "Unstructured parsing", "RAG index", "Role-aware agent", "Answer"],
    stack: ["Python", "LangChain", "LangGraph", "GPT-4", "Unstructured", "RAG"],
    link: { label: "GitHub", url: "https://github.com/thisal-thulnith" },
  },
];

// The site is one scroll story. Each entry below is one step of it: a label, a title and ONE short line.
// Keep the lines short; the 3D beside them does the rest.

// Steps 1 to 3: what I do.
export const services = [
  { label: "01 · AI/ML systems", title: "Systems that think.", text: "Agents, models, and the evals that keep them honest.", shown: "One supervisor bringing seven agents online" },
  { label: "02 · Robotics", title: "Machines that move.", text: "Intelligence, outside the screen.", shown: "A drone scanning the ground below it" },
  { label: "03 · Real-world problems", title: "Solutions that matter.", text: "Built for real people and the problems they actually have.", shown: "One point reaching out across the world" },
];

// One line per project for the story, keyed by the project's id. Lead with the outcome.
export const pitches = {
  stocknetwork: "Seven AI analysts, live for 500+ investors.",
  zorum: "AI agents that run a shop's WhatsApp.",
  whisper: "Speech-to-text for an overlooked language.",
  buffsalon: "A booking agent on two models.",
  sales: "A sales agent on web and mobile.",
  construction: "Messy documents turned into answers.",
};

// The story section. `big` is the huge outlined word behind each step. Keep every line this short.
export const story = [
  { big: "2024", title: "A question.", text: "Foundation in Computer Science with AI. 1st at SSQCAS." },
  { big: "24–25", title: "First real users.", text: "AI/ML intern at Trinet Innovations." },
  { big: "2025", title: "CodeGen International.", text: "Trainee. A BSc in Computer Science with AI begins." },
  { big: "2026", title: "Associate engineer.", text: "AI/ML research and product, end to end." },
  { big: "Tools", title: "The toolbox.", text: "Python · LangGraph · PyTorch · FastAPI · AWS" },
  { big: "Next", title: "Outside the screen.", text: "Where AI meets robotics." },
];

// Experience: newest first. The track record draws these as a ladder, oldest at the bottom.
export const experience = [
  {
    role: "Associate AI/ML Research & Product Engineer",
    org: "CodeGen International",
    period: "2026 – now",
    note: "Agentic AI features end to end: architecture, build, evaluation and release.",
  },
  {
    role: "Trainee, AI/ML Research & Product",
    org: "CodeGen International",
    period: "2025 – 2026",
    note: "RAG pipelines and multi-agent orchestration, from research prototype to internal release.",
  },
  {
    role: "AI/ML Intern",
    org: "Trinet Innovations",
    period: "2024 – 2025",
    note: "LLM-powered chatbots and conversational agents for support automation.",
  },
];

// Education: newest first. `state` is the short line under each one; `done: false` draws it as still running.
export const education = [
  {
    title: "BSc (Hons) Computer Science with Artificial Intelligence",
    org: "NIBM Sri Lanka, with Coventry University (UK)",
    state: "In progress",
    done: false,
    period: "2025 – now",
  },
  {
    title: "Foundation in Computer Science with Artificial Intelligence",
    org: "NIBM Sri Lanka",
    state: "Completed · Merit",
    done: true,
    period: "2024 – 2025",
  },
];

export const awards = [
  { place: "1st", title: "SSQCAS AI Competition", note: "International selection" },
  { place: "3rd", title: "AURORA 2024 AI Competition", note: "" },
  { place: "Top 10", title: "AgCelerator Pitching Event", note: "" },
  { place: "Top 20", title: "HackX 2024", note: "University of Kelaniya" },
  { place: "Top 100", title: "Dialog Innovation Competition", note: "" },
];

export const skills = [
  { group: "Generative AI", items: ["LangGraph", "LangChain", "Multi-agent orchestration", "Supervisor patterns", "RAG", "Tool calling", "Structured outputs", "Fine-tuning", "MCP"] },
  { group: "LLM evaluation", items: ["Eval harness design", "Golden datasets", "LLM-as-a-judge", "Regression suites", "Hallucination reduction", "Tracing", "Cost optimisation"] },
  { group: "Machine learning", items: ["Deep learning", "NLP", "Transformers", "Speech recognition", "Transfer learning", "PyTorch", "TensorFlow", "Hugging Face", "scikit-learn"] },
  { group: "Models", items: ["Claude", "GPT-4", "Gemini", "Groq", "Whisper", "Llama via Ollama"] },
  { group: "Backend and data", items: ["Python", "FastAPI", "Django", "PostgreSQL", "pgvector", "Redis", "SQLAlchemy", "ChromaDB", "Neo4j"] },
  { group: "Cloud and DevOps", items: ["Docker", "AWS EC2", "GitHub Actions", "pytest", "mypy", "Git"] },
  { group: "Full-stack", items: ["Next.js", "React", "TypeScript", "Tailwind", "Flutter"] },
];
