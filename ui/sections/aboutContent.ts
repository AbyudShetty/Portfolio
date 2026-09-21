/**
 * aboutContent — who is behind the field, as data.
 *
 * Held apart from the markup so the desktop section and the mobile telling
 * say exactly the same thing. Nothing here is inferred: the education,
 * coursework and achievements are as given by Abyud; the prose is his own
 * profile line, rewritten to lead with curiosity rather than a stack list.
 */

export interface EducationStop {
  years: string;
  place: string;
  location?: string;
  stage: string;
  current?: boolean;
  coursework?: string[];
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Highlight {
  lead: string;
  detail: string;
}

export const ABOUT = {
  statement:
    "I build intelligent systems — and stay curious about everything around them.",

  paragraphs: [
    "I'm a computer science undergraduate working across AI, machine learning, computer vision, immersive tech and simulation.",
    "What draws me in is the problem more than the tool: finding the real-world friction, and getting a computer to take on the boring part so people don't have to. If a problem needs something I don't know yet, that's usually the part I enjoy most.",
  ],

  // Most recent first: the line is read upward, from school to now.
  education: [
    {
      years: "2023 — Present",
      place: "PES University",
      stage: "Undergraduate · Computer Science",
      current: true,
      coursework: [
        "Augmented & Virtual Reality",
        "Digital Twins",
        "Image Processing",
        "Machine Learning",
        "Data Structures & Algorithms",
        "Operating Systems",
        "Computer Networks",
        "Database Systems",
        "Cloud Computing",
      ],
    },
    {
      years: "2021 — 2023",
      place: "Expert PU College",
      location: "Valachil",
      stage: "Pre-University",
    },
    {
      years: "2011 — 2021",
      place: "Presidency School",
      location: "Nandini Layout",
      stage: "Schooling",
    },
  ] satisfies EducationStop[],

  toolkitTitle: "Toolkit",

  /**
   * What he actually works in, grouped the way the work groups. Taken from
   * the résumé and kept to what has been used in something real, so the list
   * is a claim he can answer questions about rather than a word cloud.
   */
  toolkit: [
    {
      label: "Languages",
      items: ["Python", "Java", "TypeScript", "Kotlin", "SQL", "C++"],
    },
    {
      label: "Backend",
      items: [
        "Spring Boot",
        "Django REST",
        "FastAPI",
        "PostgreSQL",
        "Celery",
        "WebSockets",
      ],
    },
    {
      label: "AI / ML",
      items: [
        "PyTorch",
        "scikit-learn",
        "OpenCV",
        "XGBoost",
        "LLM APIs",
        "NumPy · Pandas",
      ],
    },
    {
      label: "3D & XR",
      items: ["Three.js", "React Three Fiber", "OpenGL", "Unity", "Blender"],
    },
    {
      label: "Systems",
      items: [
        "Distributed systems",
        "RAFT",
        "Secure MPC",
        "ESP32 · ESP-NOW",
        "Quaternions & IK",
      ],
    },
    {
      label: "Testing & DevOps",
      items: ["JUnit 5", "PyTest", "Locust", "Docker", "CI/CD", "Linux"],
    },
  ] satisfies SkillGroup[],

  highlightsTitle: "Along the way",

  highlights: [
    {
      lead: "Runner-up",
      detail: "National Techathon, Whiz Juniors · 2019",
    },
    {
      lead: "3-time gold medalist",
      detail: "NSO Math Olympiad · Zonal level",
    },
    {
      lead: "Hackathons across India",
      detail:
        "Technically demanding builds across domains — each one sharpening how I think and work under pressure.",
    },
  ] satisfies Highlight[],

  closing:
    "Still learning, still building — and always up for the next hard problem.",
} as const;
