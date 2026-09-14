import type { Project } from "../types/content";

/**
 * Projects — the confirmed cull (§6, Q4 + §6.5): 6 tier-1 cards, 5 tier-2
 * tiles, 4 cut (Macro AI, Exercise Tracker, Spotify CD Visualiser, Soften
 * Music — nothing deleted from GitHub, they just stop occupying the page).
 *
 * Copy rules applied: L10 rewrite (Brisbane Transport no longer vents about
 * React), typo fixes from L9, Home Server names only the decided services
 * (§6.5) and carries no links — private by design.
 *
 * Images are self-hosted under /public/projects (L7); WebP conversion with
 * explicit dimensions is the Phase 8 pass.
 */
export const projects: Project[] = [
  {
    title: "Customer Support Bot",
    tier: 1,
    year: "2025",
    blurb:
      "An agentic chatbot that logs forms automatically from user requests. C#/.NET 9 with Semantic Kernel managing the AI agents, SignalR for real-time form and admin traffic, hosted on AWS Elastic Beanstalk with PostgreSQL on RDS and Redis for caching.",
    oneLiner: "",
    stack: [
      "C#",
      ".NET 9",
      "Semantic Kernel",
      "SignalR",
      "AWS Elastic Beanstalk",
      "PostgreSQL",
      "Redis",
    ],
    links: [
      {
        name: "GitHub",
        url: "https://github.com/lliamsymonds04/customer-support-bot",
      },
      {
        name: "Website",
        url: "https://customer-support-bot-lliam.vercel.app/",
      },
    ],
    media: {
      src: "/projects/customer-support-bot.webp",
      alt: "Customer Support Bot web interface showing logged forms",
      width: 602,
      height: 361,
    },
  },
  {
    title: "Trailrunners",
    tier: 1,
    year: "2025",
    blurb:
      "UQ capstone, team of 6 in an Agile environment, for a real client (UQ Health): tracking Olympic-level trail runners with LiDAR and GPS data, graphing trails and surfacing difficulty, gradient and section insights. I owned the data-processing streams and the FastAPI API.",
    oneLiner: "",
    stack: ["Python", "FastAPI", "LiDAR/GPS", "Signal Processing", "Agile"],
    links: [
      {
        name: "GitHub",
        url: "https://github.com/justjeromey/DECO3801-RuntimeTerror",
      },
    ],
    media: {
      src: "/projects/trailrunners.webp",
      alt: "Trailrunners application showing a tracked trail run",
      width: 1200,
      height: 770,
    },
  },
  {
    title: "Unemployment Rate Predictor",
    tier: 1,
    year: "2025",
    blurb:
      "An LSTM in PyTorch forecasting the Australian unemployment rate, trained on ABS unemployment, inflation and interest-rate data from 1991 to 2025. Flask backend, Dockerised and running on Google Cloud Run.",
    oneLiner: "",
    stack: ["Python", "PyTorch", "LSTM", "Flask", "Docker", "Google Cloud Run"],
    links: [
      {
        name: "GitHub",
        url: "https://github.com/lliamsymonds04/forecasting-unemployment",
      },
      {
        name: "Website",
        url: "https://forecasting-unemployment.vercel.app/",
      },
    ],
    media: {
      src: "/projects/unemployment-predictor.webp",
      alt: "Unemployment Rate Predictor showing forecast output",
      width: 1200,
      height: 593,
    },
  },
  {
    title: "Walker AI",
    tier: 1,
    year: "2025",
    blurb:
      "A 2D bipedal walker that learns to walk with the NEAT genetic algorithm, written from scratch from the paper rather than pulled from a library. TypeScript, Matter.js for physics, pixiJS for rendering; it trains in the browser and runs on any device with a web browser.",
    oneLiner: "",
    stack: ["TypeScript", "NEAT", "Matter.js", "pixiJS"],
    links: [
      { name: "GitHub", url: "https://github.com/lliamsymonds04/walker-ai" },
      { name: "Website", url: "https://walker-ai.vercel.app/" },
    ],
    media: {
      src: "/projects/walker-ai.webp",
      alt: "Walker AI browser interface showing a bipedal walker mid-training",
      width: 499,
      height: 372,
    },
  },
  {
    title: "Brisbane Public Transport App",
    tier: 1,
    year: "2025",
    blurb:
      "Fullstack Brisbane transport app: Express/Node.js backend with a Svelte frontend. Svelte compiles rather than shipping a virtual DOM, which keeps the client bundle small. Pulls real-time bus, train and ferry data from the Translink API, with the Google Routes API for directions.",
    oneLiner: "",
    stack: ["Svelte", "Node.js", "Express", "Translink API", "Google Routes API"],
    links: [
      { name: "GitHub", url: "https://github.com/lliamsymonds04/bne-transport" },
      { name: "Website", url: "https://bne-transport.vercel.app/" },
    ],
    media: {
      src: "/projects/bne-transport.webp",
      alt: "Brisbane Public Transport App showing real-time departures",
      width: 1200,
      height: 687,
    },
  },
  {
    title: "Home Server",
    tier: 1,
    year: "Ongoing",
    blurb:
      "A 15-service platform on a Ryzen-based Linux host, up 125 days and counting: Jellyfin for media, Home Assistant with a Matter server for the smart home, SearXNG for private search, Calibre-Web, and a Homepage dashboard tying it together. Every service gets real, browser-trusted HTTPS even though the host has no public DNS record: a custom Caddy build with the Cloudflare DNS plugin issues and auto-renews Let's Encrypt certificates over the DNS-01 challenge, the only ACME method that works for hosts that aren't reachable from the internet.",
    oneLiner: "",
    stack: [
      "Linux",
      "Docker",
      "Docker Compose",
      "Caddy",
      "Let's Encrypt/ACME",
      "Cloudflare DNS",
      "Jellyfin",
      "Home Assistant",
      "Matter",
      "Zigbee",
      "SearXNG",
      "systemd",
    ],
    links: [], // private by design (§6.5) — no empty link row
    media: {
      src: "/projects/home-server-diagram.svg",
      alt: "Architecture diagram: visitors connect over HTTPS to Caddy, which reverse-proxies 15 Docker Compose services on a Ubuntu host (Ryzen 5 5600G, up 125 days); Let's Encrypt certificates are issued via the Cloudflare DNS-01 challenge; data volumes with a shared data tree and ~124 GB of media sit alongside the containers.",
      width: 1040,
      height: 660,
    },
    private: true,
  },

  // ---- Tier 2: compact tiles (§6.2) -------------------------------------

  {
    title: "AI Pole Balancer",
    tier: 2,
    year: "2025",
    oneLiner:
      "Unity ML-Agents RL, GPU-trained, with a YouTube walkthrough explaining the concepts.",
    stack: ["Unity", "ML-Agents", "C#", "Reinforcement Learning"],
    links: [
      { name: "GitHub", url: "https://github.com/lliamsymonds04/cart-pole-unity" },
      {
        name: "Video",
        url: "https://www.youtube.com/watch?v=cMeu4qCxjbk",
      },
    ],
    media: null,
  },
  {
    title: "Inventory Management System",
    tier: 2,
    year: "2025",
    oneLiner: ".NET 9 + EF Core + Next.js, on Azure App Service + SQL Server.",
    stack: [".NET 9", "EF Core", "Next.js", "Azure App Service", "SQL Server"],
    links: [
      { name: "GitHub", url: "https://github.com/lliamsymonds04/inventory-api" },
      { name: "Website", url: "https://inventory-viewer-lliam.vercel.app/" },
    ],
    media: null,
  },
  {
    title: "Hand Stem Player",
    tier: 2,
    year: "2024",
    oneLiner:
      "Demucs stem separation driven by Mediapipe hand tracking in OpenCV.",
    stack: ["Python", "OpenCV", "Mediapipe", "Demucs"],
    links: [
      { name: "GitHub", url: "https://github.com/lliamsymonds04/HandStemPlayer" },
      {
        name: "Video",
        url: "https://www.youtube.com/watch?v=NQgYAUxvRFQ",
      },
    ],
    media: null,
  },
  {
    title: "Pool Shot Calculator",
    tier: 2,
    year: "2025",
    oneLiner: "OpenCV table/ball detection and best-shot geometry.",
    stack: ["Python", "OpenCV", "Computer Vision"],
    links: [
      {
        name: "GitHub",
        url: "https://github.com/lliamsymonds04/pool-shot-predictor",
      },
      {
        name: "Video",
        url: "https://www.youtube.com/watch?v=5Lc4tfRdDl0",
      },
    ],
    media: null,
  },
  {
    title: "Gesture Controlled Mouse",
    tier: 2,
    year: "2024",
    oneLiner: "Mediapipe hand tracking driving OS-level mouse control.",
    stack: ["Python", "OpenCV", "Mediapipe"],
    links: [
      { name: "GitHub", url: "https://github.com/lliamsymonds04/GestureMouse" },
      {
        name: "Video",
        url: "https://www.youtube.com/watch?v=_TF5U_LJeq8",
      },
    ],
    media: null,
  },
];

/** Tier 1 cards, in display order. */
export const featuredProjects = projects.filter((p) => p.tier === 1);

/** Tier 2 compact tiles, in display order. */
export const tileProjects = projects.filter((p) => p.tier === 2);
