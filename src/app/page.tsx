import TopBanner from '../components/ui/top-banner';
import HeroAscii from '../components/ui/hero-ascii';
import ScrollImageSequence from '../components/ui/scroll-image-sequence';
import GithubIntro from '../components/ui/github-intro';
import ProjectsSection from '../components/ui/projects-section';
import WorkPhilosophy from '../components/ui/work-philosophy';
import EducationSection from '../components/ui/education-section';
import LogoCloudMarquee from '../components/ui/logo-cloud';
import ContactSection from '../components/ui/contact-section';
import LazyMorphPanel from '../components/ui/lazy-morph-panel';
import { FloatingSectionNav } from '../components/ui/floating-section-nav';
import Footer from '../components/ui/footer';
import { ScrollReveal } from '../components/ui/scroll-reveal';
import PageLoader from '../components/ui/page-loader';

const projectsData = [
  {
    id: 1,
    artist: "SanaFlow",
    album: "REACT | PYTHON | AWS",
    tech: ["React.js", "Serverless", "Python", "AWS", "Groq", "WebSockets"],
    category: "SERVERLESS",
    label: "MEDTECH",
    year: "2026",
    image: "/sanaflow-compressed.mp4",
    description: "Intelligent Medical Triage Platform. 100% Serverless, event-driven architecture on AWS. Leverages Llama 3 via Groq API for real-time urgency prioritization.",
    github: "https://github.com/sebasreateguib/Sanaflow",
    live: "https://main.d3lsjzv5me8n6j.amplifyapp.com/"
  },
  {
    id: 2,
    artist: "FinTrend AI",
    album: "AWS GLUE | ATHENA | S3",
    tech: ["AWS Glue", "Athena", "S3", "Flask", "Spring Boot", "Express.js", "React.js", "MongoDB", "Postgres", "MySQL"],
    category: "DATA PIPELINE",
    label: "FINTECH",
    year: "2026",
    image: "/fintrend-compressed.mp4",
    description: "Cloud-Native Financial Data Pipeline & Analytics. End-to-end serverless ETL with AWS Glue, Athena, and a microservices backend.",
    github: "https://github.com/sebasreateguib/FinTrendAI",
    live: null
  },
  {
    id: 3,
    artist: "Mr Sushi Order",
    album: "LAMBDA | STEP FN | DYNAMO",
    tech: ["Serverless", "AWS Lambda", "DynamoDB", "Step Functions", "EventBridge"],
    category: "SERVERLESS",
    label: "E-COMMERCE",
    year: "2026",
    image: "/mrsushi-compressed.mp4",
    description: "Modern serverless & event-driven restaurant backend built with AWS Lambda, Step Functions (Wait for Callback) and EventBridge.",
    github: "https://github.com/sebasreateguib/MrSushiClone",
    live: null
  },
  {
    id: 4,
    artist: "MediGO",
    album: "SPRING BOOT | REACT | POSTGRES",
    tech: ["Spring Boot", "Postgres", "React.js", "TypeScript", "Whereby", "Stripe", "Gemini", "WebSockets"],
    category: "FULL STACK",
    label: "TELEMEDICINE",
    year: "2025",
    image: "/medigo-compressed.mp4",
    description: "Full-Stack Telemedicine Platform with JWT auth, real-time video via Whereby, Stripe payments, AI chatbot (Gemini), and WebSocket chat.",
    github: "https://github.com/sebasreateguib/MediGO-Repository",
    live: null
  },
  {
    id: 7,
    artist: "RRadar",
    album: "C++ | VUE | LEAFLET",
    tech: ["C++", "Vue.js", "Leaflet", "Vite", "R-Tree"],
    category: "ALGORITHMS",
    label: "GEOSPATIAL",
    year: "2026",
    image: "/rradar-compressed.mp4",
    description: "Interactive client-server app to explore geospatial POIs in Lima. Compares Linear Search vs a custom R-Tree (range + KNN), with a Vue.js + Leaflet map visualizing MBRs and live performance benchmarks.",
    github: "#",
    live: null
  },
  {
    id: 5,
    artist: "SparseExcel",
    album: "C++ | REACT | JS",
    tech: ["C++", "Javascript", "React.js", "Data Structures"],
    category: "DATA STRUCTURES",
    label: "SPREADSHEET",
    year: "2026",
    image: "/sparse-compressed.mp4",
    description: "Memory-Optimized Spreadsheet Engine in C++ using custom Sparse Matrix representations, with dual 2D/3D data visualization frontend.",
    github: "https://github.com/sebasreateguib/SparseExcel",
    live: null
  }
];

const config = {
  timeZone: "America/New_York",
  timeUpdateInterval: 1000,
  idleDelay: 4000,
  debounceDelay: 100
};

const socialLinks = {
  spotify: "https://spotify.com/your-profile",
  email: "mailto:your-email@example.com",
  x: "https://x.com/your-handle"
};

const location = {
  latitude: "40.7128° N",
  longitude: "74.0060° W",
  display: true
};

export default function Home() {

  return (
    <>
      <PageLoader>
        <div className="bg-black min-h-screen">
          <TopBanner />
          <HeroAscii />
          <ScrollImageSequence />
          <ScrollReveal>
            <GithubIntro />
          </ScrollReveal>
          <ScrollReveal>
            <ProjectsSection />
          </ScrollReveal>

          <ScrollReveal>
            <EducationSection />
          </ScrollReveal>

          <ScrollReveal id="WorkPhilosophy">
            <WorkPhilosophy />
          </ScrollReveal>

          <ScrollReveal id="Skills">
            <LogoCloudMarquee />
          </ScrollReveal>

          <ScrollReveal>
            <ContactSection />
          </ScrollReveal>
          <ScrollReveal>
            <Footer />
          </ScrollReveal>

          <FloatingSectionNav />
        </div>
      </PageLoader>

      {/* Floating AI Input — outside PageLoader so its fixed positioning
                is relative to the viewport, not the animated motion.div wrapper */}
      <LazyMorphPanel />
    </>
  );
}
