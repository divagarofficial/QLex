export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  quote?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface TechItem {
  name: string;
  category: string;
  colorClass: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
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

export const CORE_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "thirumalai-d",
    name: "THIRUMALAI D",
    role: "Core Creator",
    initials: "TD",
    quote: "Building seamless digital infrastructure for effortless campus printing.",
  },
  {
    id: "divagar-e",
    name: "DIVAGAR E",
    role: "Core Creator",
    initials: "DE",
    quote: "Designing intuitive, queue-free experiences with precision and care.",
  },
];

export const TECH_STACK_ITEMS: TechItem[] = [
  {
    name: "Next.js",
    category: "Framework",
    colorClass: "bg-white/[0.06]",
    borderColor: "border-white/20",
    textColor: "text-white",
    glowColor: "rgba(255, 255, 255, 0.2)",
  },
  {
    name: "React",
    category: "UI Library",
    colorClass: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    textColor: "text-cyan-300",
    glowColor: "rgba(6, 182, 212, 0.25)",
  },
  {
    name: "TypeScript",
    category: "Language",
    colorClass: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-300",
    glowColor: "rgba(59, 130, 246, 0.25)",
  },
  {
    name: "Tailwind CSS",
    category: "Styling",
    colorClass: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    textColor: "text-sky-300",
    glowColor: "rgba(14, 165, 233, 0.25)",
  },
  {
    name: "Framer Motion",
    category: "Animations",
    colorClass: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-300",
    glowColor: "rgba(168, 85, 247, 0.25)",
  },
  {
    name: "FastAPI",
    category: "Backend API",
    colorClass: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-300",
    glowColor: "rgba(16, 185, 129, 0.25)",
  },
  {
    name: "Python",
    category: "Backend Runtime",
    colorClass: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-300",
    glowColor: "rgba(245, 158, 11, 0.25)",
  },
  {
    name: "PostgreSQL",
    category: "Database",
    colorClass: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    textColor: "text-indigo-300",
    glowColor: "rgba(99, 102, 241, 0.25)",
  },
  {
    name: "JWT Authentication",
    category: "Security",
    colorClass: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-300",
    glowColor: "rgba(234, 179, 8, 0.25)",
  },
  {
    name: "REST API",
    category: "Architecture",
    colorClass: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    textColor: "text-rose-300",
    glowColor: "rgba(244, 63, 94, 0.25)",
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

export const COPYRIGHT_INFO = {
  text: "© 2026 Mindura Technologies. All Rights Reserved.",
  brand: "QLex™",
  tagline: "Upload to Pickup",
};
