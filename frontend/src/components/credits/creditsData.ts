export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  quote?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  email?: string;
  contributions?: string[];
}

export interface TechItem {
  name: string;
  category: string;
  colorClass: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
  description?: string;
  group?: "all" | "frontend" | "backend" | "infra";
}

export interface ProductDetails {
  name: string;
  tagline: string;
  version: string;
  releaseChannel: string;
  build: string;
  platform: string;
  status: string;
  lastUpdated: string;
}

export interface SpecialThanksItem {
  id: string;
  name: string;
  subtitle?: string;
  roleDescription?: string;
}

export interface ImpactStat {
  id: string;
  label: string;
  value: string;
  subtext: string;
  iconName: "Zap" | "Clock" | "ShieldCheck" | "Leaf";
}

export interface CoreValue {
  id: string;
  title: string;
  description: string;
  iconName: "Zap" | "Sparkles" | "Shield" | "Recycle";
}

export const PRODUCT_INFO: ProductDetails = {
  name: "QLex",
  tagline: "Upload to Pickup",
  version: "v1.0.0",
  releaseChannel: "Production",
  build: "2026.1",
  platform: "Web Application",
  status: "Stable",
  lastUpdated: "July 2026",
};

export const TRADEMARK_INFO = {
  pretext: "A Trademark Product of",
  companyName: "MINDURA TECHNOLOGIES",
  logoPath: "/mindura-logo.svg",
  year: "2026",
};

export const IMPACT_STATS: ImpactStat[] = [
  {
    id: "queue-free",
    label: "Queue Time Saved",
    value: "100%",
    subtext: "Instant digital token generation",
    iconName: "Clock",
  },
  {
    id: "campus-printing",
    label: "Campus Print Dispatch",
    value: "Real-Time",
    subtext: "Live queue tracking & state sync",
    iconName: "Zap",
  },
  {
    id: "accuracy",
    label: "Order Accuracy",
    value: "99.9%",
    subtext: "Automated page count & price calc",
    iconName: "ShieldCheck",
  },
  {
    id: "sustainability",
    label: "Waste Reduction",
    value: "Zero Waste",
    subtext: "Eco-friendly optimized batch prints",
    iconName: "Leaf",
  },
];

export const CORE_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "thirumalai-d",
    name: "THIRUMALAI D",
    role: "Core Creator",
    initials: "TD",
    quote: "Building seamless digital infrastructure for effortless campus printing.",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    email: "thirumalai@qlex.app",
    contributions: ["Full-Stack Architecture", "Real-Time Queue Engine", "Cloud Deployment"],
  },
  {
    id: "divagar-e",
    name: "DIVAGAR E",
    role: "Core Creator",
    initials: "DE",
    quote: "Designing intuitive, queue-free experiences with precision and care.",
    githubUrl: "https://github.com/divagarofficial",
    linkedinUrl: "https://linkedin.com/in/divagarofficial",
    email: "divagar@qlex.app",
    contributions: ["UI/UX Design System", "State Management & Tokens", "Client Interfaces"],
  },
];

export const TECH_STACK_ITEMS: TechItem[] = [
  {
    name: "Next.js",
    category: "Framework",
    group: "frontend",
    colorClass: "bg-white/[0.06]",
    borderColor: "border-white/20",
    textColor: "text-white",
    glowColor: "rgba(255, 255, 255, 0.2)",
    description: "App Router & SSR for ultra-fast page delivery.",
  },
  {
    name: "React",
    category: "UI Library",
    group: "frontend",
    colorClass: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    textColor: "text-cyan-300",
    glowColor: "rgba(6, 182, 212, 0.25)",
    description: "Component-driven reactive client views.",
  },
  {
    name: "TypeScript",
    category: "Language",
    group: "frontend",
    colorClass: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-300",
    glowColor: "rgba(59, 130, 246, 0.25)",
    description: "End-to-end type safety and reliable contracts.",
  },
  {
    name: "Tailwind CSS",
    category: "Styling",
    group: "frontend",
    colorClass: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    textColor: "text-sky-300",
    glowColor: "rgba(14, 165, 233, 0.25)",
    description: "Modern glassmorphism and ambient styling utility system.",
  },
  {
    name: "Framer Motion",
    category: "Animations",
    group: "frontend",
    colorClass: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-300",
    glowColor: "rgba(168, 85, 247, 0.25)",
    description: "Fluid layout transitions and micro-interactions.",
  },
  {
    name: "FastAPI",
    category: "Backend API",
    group: "backend",
    colorClass: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-300",
    glowColor: "rgba(16, 185, 129, 0.25)",
    description: "High-throughput asynchronous REST endpoints.",
  },
  {
    name: "Python",
    category: "Backend Runtime",
    group: "backend",
    colorClass: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-300",
    glowColor: "rgba(245, 158, 11, 0.25)",
    description: "Core algorithms for page analysis and price calculation.",
  },
  {
    name: "PostgreSQL",
    category: "Database",
    group: "infra",
    colorClass: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    textColor: "text-indigo-300",
    glowColor: "rgba(99, 102, 241, 0.25)",
    description: "ACID-compliant relational store for orders & balances.",
  },
  {
    name: "JWT Auth",
    category: "Security",
    group: "infra",
    colorClass: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-300",
    glowColor: "rgba(234, 179, 8, 0.25)",
    description: "Cryptographically signed session validation.",
  },
  {
    name: "REST API",
    category: "Architecture",
    group: "backend",
    colorClass: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    textColor: "text-rose-300",
    glowColor: "rgba(244, 63, 94, 0.25)",
    description: "Clean decoupled client-server interface.",
  },
];

export const SPECIAL_THANKS_LIST: SpecialThanksItem[] = [
  {
    id: "rit",
    name: "Rajalakshmi Institute of Technology",
    subtitle: "Academic Institution",
    roleDescription: "Empowering innovation and engineering excellence.",
  },
  {
    id: "aids-dept",
    name: "Department of Artificial Intelligence & Data Science",
    subtitle: "Department",
    roleDescription: "Fostering technological advancement & student mentorship.",
  },
];

export const VISION_STATEMENT =
  "Our mission is to eliminate queues and simplify campus printing through a seamless digital experience.";

export const CORE_VALUES: CoreValue[] = [
  {
    id: "speed",
    title: "Instant Speed",
    description: "Zero waiting in lines. Upload documents and collect on your schedule.",
    iconName: "Zap",
  },
  {
    id: "simplicity",
    title: "Pure Simplicity",
    description: "Minimalist flow designed for students and printing staff alike.",
    iconName: "Sparkles",
  },
  {
    id: "reliability",
    title: "100% Reliability",
    description: "Deterministic order tracking and secure digital receipt generation.",
    iconName: "Shield",
  },
  {
    id: "sustainability",
    title: "Sustainability",
    description: "Preventing misprints and paper waste through pre-print preview.",
    iconName: "Recycle",
  },
];

export const COPYRIGHT_INFO = {
  text: "© 2026 Mindura Technologies. All Rights Reserved.",
  brand: "QLex™",
  tagline: "Upload to Pickup",
};

