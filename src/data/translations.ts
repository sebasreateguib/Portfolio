export const translations = {
  en: {
    nav: {
      about: "About Me",
      projects: "Projects",
      experience: "Experience",
      education: "Education",
      skills: "Stack & Workflow",
      contact: "Contact"
    },
    hero: {
      portfolio: "Portfolio",
      downloadResume: "Download Resume",
      letsTalk: "Let's talk",
      role: "CS Student @ UTEC.",
      description: "Passionate about AI Engineering, Full Stack Development, Systems Optimization, Cloud-Native & Data Infrastructure.",
      metrics: {
        metric1: { value: "3rd", label: "YEAR CS" },
        metric2: { value: "5+", label: "FEATURED PROJECTS" },
        metric3: { value: "AI & SW", label: "FOCUSED ENG." }
      }
    },
    motivation: {
      stage1: {
        cmd: "$ cat /var/log/motivation.log",
        headline: "> SYSTEM: MAGIC_INITIALIZED",
        description: "I chose Computer Science for its scale of impact. With a simple keyboard and structured logic, you can solve problems on a global scale."
      },
      stage2: {
        cmd: "$ import { Innovation } from 'cs'",
        headline: "> SYSTEM: PUZZLE_SOLVED",
        description: "From pixel-perfect frontends to complex databases. Connecting human creativity with computational logic is what drives me every day."
      },
      stage3: {
        cmd: "$ execute --goal=\"Impact\"",
        headline: "> SYSTEM: BUILDING_THE_FUTURE",
        description: "I transform abstract ideas into digital products that people enjoy using. Writing the future, one commit at a time."
      },
      stage4: {
        cmd: "$ status --current",
        headline: "> SYSTEM: READY_TO_BUILD",
        description: "Code is just the beginning. Always exploring new technologies and ready to turn the next big challenge into reality."
      }
    },
    intro: {
      hi: "Hi there 👋, I'm Sebastian!",
      bio: "I'm a 26 year old Computer Science student based in Lima, Perú. I always enjoy learning new things and giving my best to every project and challenge.",
      bullet2: "I'm currently learning new languages and technologies like <span className=\"text-[#60a5fa] font-semibold\">Rust & NestJS.</span>",
      bullet3: "Fun fact: <span className=\"text-[#60a5fa] font-semibold\">I was inspired by Blue Lock's pentagon for the hero design!</span>",
      bullet4: "Focused on <span className=\"text-[#60a5fa] font-semibold\">clean code, modern infrastructure, and AI.</span>",
      activity: "ACTIVITY",
      less: "Less",
      more: "More"
    },
    projects: {
      title: "Projects",
      featured: "Featured_Projects",
      archiveCta: "View project archive",
      archiveTitle: "Project_Archive",
      archiveHint: "Browse the rest by category — open a file to jump to its repo.",
      list: [
        {
          id: 12,
          title: "FORMA",
          description: "Financial & Operations Risk Management Assistant, a virtual CFO and autonomous construction auditor. Designed a multi-agent hybrid system (Text-to-SQL + document RAG) that cross-checks ERP data with field logs to detect cost overruns, explain their cause and project the margin impact. Built the product landing page with an interactive risk console.",
          tech: ["React", "TypeScript", "Vite", "GSAP", "Lenis", "Multi-Agent Design"],
          github: "https://github.com/sebasreateguib/FORMA",
          live: "#",
          image: "/forma-compressed.webm",
          year: "2026"
        },
        {
          id: 11,
          title: "MedSimulator AI",
          description: "AI Clinical Case Simulator. Students interview a virtual patient, order labs and imaging, consult specialists and make diagnoses, while an async tutor agent evaluates clinical reasoning with a rubric. Every dose and diagnostic criterion is validated against a medical corpus via RAG (Docling + pgvector).",
          tech: ["Python", "FastAPI", "Next.js", "TypeScript", "Postgres", "pgvector", "Groq", "Anthropic"],
          github: "https://github.com/sebasreateguib/MedSimulatorAI",
          live: "#",
          image: "/medsimu-compressed.webm",
          year: "2026"
        },
        {
          id: 4,
          title: "SanaFlow",
          description: "Intelligent Medical Triage Platform. Designed a 100% Serverless, event-driven architecture using AWS (Lambda, SQS, DynamoDB). Engineered an automated data pipeline that processes massive clinical notes in real-time, leveraging Llama 3 via Groq API for extraction and urgency prioritization.",
          tech: ["React.js", "Serverless", "Python", "AWS", "Groq", "WebSockets"],
          github: "https://github.com/sebasreateguib/Sanaflow",
          live: "https://main.d3lsjzv5me8n6j.amplifyapp.com/",
          image: "/sanaflow-compressed.mp4",
          year: "2026"
        },
        {
          id: 1,
          title: "FinTrend AI",
          description: "Cloud-Native Financial Data Pipeline & Analytics developed with a microservices architecture. Designed and built an end-to-end serverless data pipeline using AWS Glue to automate ETL workflows and structured analytical querying.",
          tech: ["AWS Glue", "Athena", "S3", "Flask", "Spring Boot", "Express.js", "React.js", "MongoDB", "Postgres", "MySQL"],
          github: "https://github.com/sebasreateguib/FinTrendAI",
          live: "#",
          image: "/fintrend-compressed.mp4",
          year: "2026"
        },
        {
          id: 5,
          title: "Mr Sushi Order Platform",
          description: "Modern Serverless and Event-Driven architecture backend for a restaurant platform. Built with Serverless Framework utilizing AWS Lambda, API Gateway, DynamoDB, Step Functions (Wait for Callback pattern) and EventBridge.",
          tech: ["Serverless", "AWS Lambda", "DynamoDB", "Step Functions", "EventBridge"],
          github: "https://github.com/sebasreateguib/MrSushiClone",
          live: "#",
          image: "/mrsushi-compressed.mp4",
          year: "2026"
        },
        {
          id: 2,
          title: "MediGO",
          description: "Full-Stack Telemedicine Platform. Architected a secure REST API with JWT authentication. Developed a responsive SPA using React 19, integrated real-time video via Whereby SDK, Stripe sandbox payments, an AI chatbot powered by Gemini, and real-time WebSocket chat between patients and doctors.",
          tech: ["Spring Boot", "Postgres", "React.js", "TypeScript", "Whereby", "Stripe", "Gemini", "WebSockets"],
          github: "https://github.com/sebasreateguib/MediGO-Repository",
          live: "#",
          image: "/medigo-compressed.mp4",
          year: "2025"
        },
        {
          id: 0,
          title: "OpenMultimodal",
          description: "Multimodal RAG Agent. Engineered an end-to-end AI system using LlamaIndex, LlamaParse, Google Gemini, and Qdrant. It indexes complex PDFs and images to answer queries backed by retrieved multimodal evidence.",
          tech: ["Python", "FastAPI", "LlamaIndex", "Gemini", "Qdrant", "React"],
          github: "https://github.com/sebasreateguib/OpenMultimodal",
          live: "#",
          image: "/demo.png",
          year: "2026"
        },
        {
          id: 10,
          title: "FraudNet",
          description: "Neural Network Fraud Detection System. Built a Multi-Layer Perceptron entirely from scratch in C++ using custom linear algebra tensors. Connected to an enterprise-grade React dashboard via a Node.js Bridge API for real-time transaction monitoring and testing.",
          tech: ["C++", "Neural Networks", "React.js", "Node.js", "Express"],
          github: "https://github.com/sebasreateguib/FraudNet",
          live: "#",
          image: "LUCIDE:Brain",
          year: "2025"
        },
        {
          id: 3,
          title: "SparseExcel",
          description: "Memory-Optimized Spreadsheet Engine. Implemented a memory-efficient backend in C++ leveraging custom Sparse Matrix representations, paired with a frontend featuring dual 2D and 3D data visualization.",
          tech: ["C++", "Javascript", "React.js", "Data Structures"],
          github: "https://github.com/sebasreateguib/SparseExcel",
          live: "#",
          image: "/sparse-compressed.mp4",
          year: "2026"
        }
      ]
    },
    experience: {
      title: "Experience",
      badge: "Freelance_&_Client_Work",
      current: "CURRENT",
      stackLabel: "STACK",
      clientsLabel: "CLIENTS",
      capabilitiesLabel: "What I built",
      periodLabel: "Period",
      locationLabel: "Location",
      availability: [
        "Open to AI Engineering internships",
        "Open to Software Engineering internships",
        "Open to freelance projects",
      ],
      list: [
        {
          id: "frontend-freelance",
          role: "Frontend Developer",
          company: "Yeyo Maki · Buena Vista",
          type: "Freelance",
          period: "Aug 2026",
          duration: "1 mo",
          location: "Lima, Peru · Remote",
          ongoing: false,
          focus: "Front-End Development and Motion Design",
          capabilities: ["Canvas image sequence", "GSAP ScrollTrigger", "Interactive galleries", "Responsive layouts", "WhatsApp conversion", "Live in production"],
          summary:
            "Two scroll-driven sites built with React on Vite and choreographed with GSAP ScrollTrigger — for a premium sushi restaurant and a residential real estate developer in Lima.",
          tech: ["React", "TypeScript", "Vite", "GSAP ScrollTrigger", "ScrollSmoother", "Lenis", "Framer Motion", "HTML5 Canvas", "CSS3"],
          highlights: [
            "Scroll-linked image sequence rendered frame by frame on an HTML5 Canvas",
            "Immersive scroll choreography with GSAP ScrollTrigger, ScrollSmoother, and Lenis: pinned sections, scrubbed timelines, and reveal animations",
            "Drag, pinch, and zoom image galleries for building renders and floor plans",
            "Premium CSS3 styling: glassmorphism, CSS variables, and mobile-first responsive layouts",
            "Conversion paths wired straight to the client: WhatsApp ordering and a pre-filled WhatsApp chat widget"
          ],
          clients: [
            {
              name: "Yeyo Maki",
              detail: "Landing page for a premium sushi restaurant: 240-frame Canvas sequence, interactive menu with prices and tags, offers, delivery schedule, and WhatsApp ordering.",
              link: "https://yeyo-maki.vercel.app"
            },
            {
              name: "Buena Vista Inmobiliaria",
              detail: "Site for a residential real estate developer: the Virginia 281 project in San Miguel with a virtual tour, zoomable renders and floor plans, a neighborhood map, and a WhatsApp chat for inquiries.",
              link: "https://buenavistainmobiliaria.com"
            }
          ]
        },
        {
          id: "vk-studio",
          role: "Software Engineer",
          company: "VK STUDIO.HN S.A.C.",
          type: "Freelance",
          period: "Aug 2026",
          duration: "1 mo",
          location: "Lima, Peru · Remote",
          ongoing: false,
          focus: "Software Infrastructure and Full-Stack Development",
          capabilities: ["Quoting engine", "PDF quotes", "Kanban appointments", "Client directory", "Admin dashboard", "Roles & RLS"],
          summary:
            "Full-Stack Quoting & Management System for a Nail Art Studio. Built a web application for a professional nail art studio to replace spreadsheets and manual workflows with a unified platform for quoting, appointment tracking, client management, and team administration.",
          tech: ["Next.js 16", "React 19", "TypeScript", "Supabase", "PostgreSQL", "Auth + RLS", "Tailwind CSS"],
          highlights: [
            "Smart quoting engine with 80+ configurable services and automatic per-nail pricing, tax, and totals",
            "Kanban appointment board with status flow, date navigation, and inactive client alerts",
            "Client directory with visit history, average ticket, and favorite service tracking",
            "Admin dashboard with technician leaderboard, commission management, revenue metrics, and editable service catalog",
            "PDF quote generation for client sharing",
            "Role-based auth (admin/technician) with PostgreSQL Row-Level Security and granular access policies",
            "Optimized server-side PostgreSQL RPCs for pagination, aggregations, and reporting"
          ],
          clients: []
        }
      ]
    },
    education: {
      title: "Education",
      background: "Academic_Background",
      utec: "Universidad de Ingeniería y Tecnología - UTEC",
      degree: "Bachelor of Science in Computer Science",
      award: "Tim Berners Lee Contest Finalist - CS2031 Platform-Based Development",
      hackathonTitle: "Cloud Computing Hackathon Participant",
      hackathonDesc: "Developed SanaFlow, a scalable cloud solution using serverless technologies, during an intensive 24-hour hackathon.",
      inProgress: "IN_PROGRESS"
    },
    workPhilosophy: {
      title: "Work Philosophy",
      badge: "Methodology"
    },
    logoCloud: {
      title: "Stack & Workflow",
      badge: "Tech_Stack_&_Tools"
    },
    contact: {
      title: "Contact",
      getInTouch: "Get_In_Touch",
      heading: "Let's build something great.",
      desc: "Currently open for new opportunities, collaborations, and interesting projects. Feel free to reach out!",
      email: "Copy email",
      emailCopied: "Copied!",
      linkedin: "LinkedIn",
      formNamePlaceholder: "Your Name",
      formEmailPlaceholder: "your@email.com",
      formMessagePlaceholder: "How can I help you?",
      formSubmit: "Send Message",
      formSuccess: "Message sent successfully!",
      formError: "Failed to send message. Please try again."
    },
    copilot: {
      heroCta: "Talk to SR Copilot",
      coachmarkTitle: "Curious about my work?",
      coachmarkBody: "Tap below to chat with SR Copilot",
      coachmarkDismiss: "Got it"
    },
    banner: {
      text: "SR Copilot can answer questions about projects, stack & contact",
      textShort: "Ask SR Copilot about my work",
      live: "Live",
      cta: "Try it"
    },
    agentic: {
      title: "Agentic Development Workflow",
      subtitle: "10x PRODUCTIVITY MULTIPLIER",
      desc: "Prototyping and scaling through parallel agent orchestration, MCP Servers, and custom Skills.",
      tools: "Tools_I_Orchestrate"
    },
    notFound: {
      title: "404 - Page Not Found",
      description: "Oops! The page you are looking for doesn't exist or has been moved.",
      backHome: "Go Back Home"
    }
  },
  es: {
    nav: {
      about: "Sobre Mí",
      projects: "Proyectos",
      experience: "Experiencia",
      education: "Educación",
      skills: "Stack & Workflow",
      contact: "Contacto"
    },
    hero: {
      portfolio: "Portafolio",
      downloadResume: "Descargar CV",
      letsTalk: "Hablemos",
      role: "Estudiante de CS @ UTEC.",
      description: "Apasionado por Ingeniería de IA, Desarrollo Full Stack, Optimización de Sistemas e Infraestructura Cloud-Native y de Datos.",
      metrics: {
        metric1: { value: "3er", label: "AÑO CS" },
        metric2: { value: "5+", label: "PROYECTOS DESTACADOS" },
        metric3: { value: "IA & SW", label: "ENFOQUE TÉC." }
      }
    },
    motivation: {
      stage1: {
        cmd: "$ cat /var/log/motivation.log",
        headline: "> SYSTEM: MAGIC_INITIALIZED",
        description: "Elegí Computer Science por su poder de impacto. Con un simple teclado y lógica estructurada, puedes resolver problemas a escala global."
      },
      stage2: {
        cmd: "$ import { Innovation } from 'cs'",
        headline: "> SYSTEM: PUZZLE_SOLVED",
        description: "Desde el frontend más pulido hasta bases de datos complejas. Conectar la creatividad humana con la lógica computacional es lo que me mueve cada día."
      },
      stage3: {
        cmd: "$ execute --goal=\"Impact\"",
        headline: "> SYSTEM: BUILDING_THE_FUTURE",
        description: "Transformo ideas abstractas en productos digitales que las personas disfrutan usar. Escribiendo el futuro, un commit a la vez."
      },
      stage4: {
        cmd: "$ status --current",
        headline: "> SYSTEM: READY_TO_BUILD",
        description: "El código es solo el comienzo. Siempre explorando nuevas tecnologías y listo para convertir el próximo gran desafío en realidad."
      }
    },
    intro: {
      hi: "¡Hola 👋, soy Sebastian!",
      bio: "Soy un estudiante de Ciencia de la Computación de 26 años viviendo en Lima, Perú. Siempre disfruto aprender cosas nuevas y dar lo mejor de mí en cada proyecto y desafío.",
      bullet2: "Actualmente estoy aprendiendo tecnologías como <span className=\"text-[#60a5fa] font-semibold\">Rust & NestJS</span>",
      bullet3: "Dato curioso: <span className=\"text-[#60a5fa] font-semibold\">¡Me inspiré en el pentágono de Blue Lock para el diseño!</span>",
      bullet4: "Enfocado en <span className=\"text-[#60a5fa] font-semibold\">código limpio, infraestructura moderna e IA.</span>",
      activity: "ACTIVIDAD",
      less: "Menos",
      more: "Más"
    },
    projects: {
      title: "Proyectos",
      featured: "Proyectos_Destacados",
      archiveCta: "Ver archivo de proyectos",
      archiveTitle: "Archivo_de_Proyectos",
      archiveHint: "Explora el resto por categoría — abre un archivo para ir a su repo.",
      list: [
        {
          id: 12,
          title: "FORMA",
          description: "Financial & Operations Risk Management Assistant, un CFO virtual y auditor autónomo de obras. Diseñé un sistema multiagente híbrido (Text-to-SQL + RAG documental) que cruza el ERP con las bitácoras de campo para detectar sobrecostos, explicar su causa y proyectar el impacto en el margen. Construí la landing del producto con una consola de riesgo interactiva.",
          tech: ["React", "TypeScript", "Vite", "GSAP", "Lenis", "Multi-Agent Design"],
          github: "https://github.com/sebasreateguib/FORMA",
          live: "#",
          image: "/forma-compressed.webm",
          year: "2026"
        },
        {
          id: 11,
          title: "MedSimulator AI",
          description: "Simulador de Casos Clínicos con IA. El estudiante interroga a un paciente virtual, pide laboratorios e imágenes, consulta especialistas y diagnostica, mientras un agente tutor asíncrono evalúa su razonamiento clínico con rúbrica. Cada dosis y criterio diagnóstico se valida contra un corpus médico vía RAG (Docling + pgvector).",
          tech: ["Python", "FastAPI", "Next.js", "TypeScript", "Postgres", "pgvector", "Groq", "Anthropic"],
          github: "https://github.com/sebasreateguib/MedSimulatorAI",
          live: "#",
          image: "/medsimu-compressed.webm",
          year: "2026"
        },
        {
          id: 4,
          title: "SanaFlow",
          description: "Plataforma de Triaje Médico Inteligente. Arquitectura 100% Serverless orientada a eventos usando AWS (Lambda, SQS, DynamoDB). Diseñé un pipeline automático que procesa notas clínicas masivamente en tiempo real usando Llama 3 (vía Groq) para extraer síntomas y priorizar la urgencia médica.",
          tech: ["React.js", "Serverless", "Python", "AWS", "Groq", "WebSockets"],
          github: "https://github.com/sebasreateguib/Sanaflow",
          live: "https://main.d3lsjzv5me8n6j.amplifyapp.com/",
          image: "/sanaflow-compressed.mp4",
          year: "2026"
        },
        {
          id: 1,
          title: "FinTrend AI",
          description: "Analítica Financiera Nube-Nativa desarrollada con una arquitectura de microservicios. Diseñé y construí un pipeline de datos serverless usando AWS Glue para automatizar flujos ETL y consultas analíticas estructuradas.",
          tech: ["AWS Glue", "Athena", "S3", "Flask", "Spring Boot", "Express.js", "React.js", "MongoDB", "Postgres", "MySQL"],
          github: "https://github.com/sebasreateguib/FinTrendAI",
          live: "#",
          image: "/fintrend-compressed.mp4",
          year: "2026"
        },
        {
          id: 5,
          title: "Plataforma de Pedidos Mr Sushi",
          description: "Backend Serverless y Orientado a Eventos (EDA) moderno y robusto para una plataforma de restaurante. Construido con Serverless Framework utilizando AWS Lambda, API Gateway, DynamoDB, Step Functions y EventBridge.",
          tech: ["Serverless", "AWS Lambda", "DynamoDB", "Step Functions", "EventBridge"],
          github: "https://github.com/sebasreateguib/MrSushiClone",
          live: "#",
          image: "/mrsushi-compressed.mp4",
          year: "2026"
        },
        {
          id: 2,
          title: "MediGO",
          description: "Plataforma Full-Stack de Telemedicina. Diseñé una API REST segura con autenticación JWT. Desarrollé la SPA usando React 19, integrando consultas por video vía Whereby SDK, pagos en modo sandbox con Stripe, un chatbot con Gemini y chat en tiempo real con WebSockets entre pacientes y médicos.",
          tech: ["Spring Boot", "Postgres", "React.js", "TypeScript", "Whereby", "Stripe", "Gemini", "WebSockets"],
          github: "https://github.com/sebasreateguib/MediGO-Repository",
          live: "#",
          image: "/medigo-compressed.mp4",
          year: "2025"
        },
        {
          id: 0,
          title: "OpenMultimodal",
          description: "Agente Multimodal RAG. Diseñé un sistema de IA usando LlamaIndex, LlamaParse, Google Gemini y Qdrant. Indexa documentos complejos e imágenes para responder consultas respaldadas por evidencia multimodal.",
          tech: ["Python", "FastAPI", "LlamaIndex", "Gemini", "Qdrant", "React"],
          github: "https://github.com/sebasreateguib/OpenMultimodal",
          live: "#",
          image: "/demo.png",
          year: "2026"
        },
        {
          id: 10,
          title: "FraudNet",
          description: "Sistema de Detección de Fraude con Redes Neuronales. Construí un Perceptrón Multicapa (MLP) desde cero en C++ usando tensores propios. Conectado a un dashboard empresarial en React mediante una API en Node.js para monitoreo y pruebas en tiempo real.",
          tech: ["C++", "Neural Networks", "React.js", "Node.js", "Express"],
          github: "https://github.com/sebasreateguib/FraudNet",
          live: "#",
          image: "LUCIDE:Brain",
          year: "2025"
        },
        {
          id: 3,
          title: "SparseExcel",
          description: "Motor de Hoja de Cálculo Optimizado en Memoria. Implementé un backend eficiente en C++ aprovechando representaciones personalizadas de Matrices Dispersas, junto a un frontend con visualización dual 2D y 3D.",
          tech: ["C++", "Javascript", "React.js", "Estructuras de Datos"],
          github: "https://github.com/sebasreateguib/SparseExcel",
          live: "#",
          image: "/sparse-compressed.mp4",
          year: "2026"
        }
      ]
    },
    experience: {
      title: "Experiencia",
      badge: "Freelance_&_Clientes",
      current: "ACTUAL",
      stackLabel: "STACK",
      clientsLabel: "CLIENTES",
      capabilitiesLabel: "Lo que construí",
      periodLabel: "Periodo",
      locationLabel: "Ubicación",
      availability: [
        "Abierto a prácticas en AI Engineering",
        "Abierto a prácticas en Software Engineering",
        "Abierto a proyectos freelance",
      ],
      list: [
        {
          id: "frontend-freelance",
          role: "Frontend Developer",
          company: "Yeyo Maki · Buena Vista",
          type: "Freelance",
          period: "Ago 2026",
          duration: "1 mes",
          location: "Lima, Perú · Remoto",
          ongoing: false,
          focus: "Desarrollo Front-End y Motion Design",
          capabilities: ["Secuencia en Canvas", "GSAP ScrollTrigger", "Galerías interactivas", "Layouts responsive", "Conversión por WhatsApp", "En producción"],
          summary:
            "Dos sitios ligados al scroll construidos con React sobre Vite y coreografiados con GSAP ScrollTrigger — para un restaurante de sushi premium y una inmobiliaria de proyectos residenciales en Lima.",
          tech: ["React", "TypeScript", "Vite", "GSAP ScrollTrigger", "ScrollSmoother", "Lenis", "Framer Motion", "HTML5 Canvas", "CSS3"],
          highlights: [
            "Secuencia de imágenes ligada al scroll, renderizada cuadro por cuadro sobre un Canvas HTML5",
            "Coreografía de scroll inmersiva con GSAP ScrollTrigger, ScrollSmoother y Lenis: secciones fijadas, timelines scrubbeados y animaciones de aparición",
            "Galerías con arrastre, pellizco y zoom para renders del edificio y planos",
            "Estilos CSS3 premium: glassmorphism, variables CSS y layouts responsive mobile-first",
            "Rutas de conversión conectadas directo al cliente: pedidos por WhatsApp y un chat de WhatsApp con mensaje prellenado"
          ],
          clients: [
            {
              name: "Yeyo Maki",
              detail: "Landing para un restaurante de sushi premium: secuencia de 240 frames en Canvas, carta interactiva con precios y etiquetas, ofertas, horarios de delivery y pedidos por WhatsApp.",
              link: "https://yeyo-maki.vercel.app"
            },
            {
              name: "Buena Vista Inmobiliaria",
              detail: "Sitio para una inmobiliaria de proyectos residenciales: el proyecto Virginia 281 en San Miguel con recorrido virtual, renders y planos con zoom, mapa del entorno y chat de WhatsApp para consultas.",
              link: "https://buenavistainmobiliaria.com"
            }
          ]
        },
        {
          id: "vk-studio",
          role: "Software Engineer",
          company: "VK STUDIO.HN S.A.C.",
          type: "Freelance",
          period: "Ago 2026",
          duration: "1 mes",
          location: "Lima, Perú · Remoto",
          ongoing: false,
          focus: "Infraestructura de Software y Desarrollo Full-Stack",
          capabilities: ["Motor de cotización", "Cotizaciones en PDF", "Citas en Kanban", "Directorio de clientes", "Dashboard admin", "Roles y RLS"],
          summary:
            "Sistema Full-Stack de Cotización y Gestión para un estudio de Nail Art. Desarrollé una aplicación web para un estudio profesional de nail art que reemplaza hojas de cálculo y procesos manuales con una plataforma unificada de cotización, seguimiento de citas, gestión de clientes y administración del equipo.",
          tech: ["Next.js 16", "React 19", "TypeScript", "Supabase", "PostgreSQL", "Auth + RLS", "Tailwind CSS"],
          highlights: [
            "Motor de cotización inteligente con más de 80 servicios configurables y cálculo automático de precio por uña, impuestos y totales",
            "Tablero Kanban de citas con flujo de estados, navegación por fecha y alertas de clientes inactivos",
            "Directorio de clientes con historial de visitas, ticket promedio y seguimiento de servicio favorito",
            "Dashboard de administración con ranking de técnicas, gestión de comisiones, métricas de ingresos y catálogo de servicios editable",
            "Generación de cotizaciones en PDF para compartir con el cliente",
            "Autenticación por roles (admin/técnica) con Row-Level Security de PostgreSQL y políticas de acceso granulares",
            "RPCs de PostgreSQL optimizados en el servidor para paginación, agregaciones y reportes"
          ],
          clients: []
        }
      ]
    },
    education: {
      title: "Educación",
      background: "Historial_Académico",
      utec: "Universidad de Ingeniería y Tecnología - UTEC",
      degree: "Bachiller en Ciencias de la Computación",
      award: "Finalista Concurso Tim Berners Lee - CS2031 Desarrollo Basado en Plataformas",
      hackathonTitle: "Participante de Hackathon de Cloud Computing",
      hackathonDesc: "Desarrollé SanaFlow, una solución cloud escalable usando tecnologías serverless, durante un hackathon intensivo de 24 horas.",
      inProgress: "EN_CURSO"
    },
    workPhilosophy: {
      title: "Filosofía de Trabajo",
      badge: "Metodología"
    },
    logoCloud: {
      title: "Stack & Workflow",
      badge: "Tecnologías_y_Herramientas"
    },
    contact: {
      title: "Contacto",
      getInTouch: "Contáctame",
      heading: "Construyamos algo increíble.",
      desc: "Actualmente abierto a nuevas oportunidades, colaboraciones y proyectos interesantes. ¡No dudes en contactarme!",
      email: "Copiar correo",
      emailCopied: "¡Copiado!",
      linkedin: "LinkedIn",
      formNamePlaceholder: "Tu Nombre",
      formEmailPlaceholder: "tu@correo.com",
      formMessagePlaceholder: "¿En qué te puedo ayudar?",
      formSubmit: "Enviar Mensaje",
      formSuccess: "¡Mensaje enviado con éxito!",
      formError: "Error al enviar el mensaje. Intenta de nuevo."
    },
    copilot: {
      heroCta: "Hablar con SR Copilot",
      coachmarkTitle: "¿Curioso sobre mi trabajo?",
      coachmarkBody: "Toca abajo para chatear con SR Copilot",
      coachmarkDismiss: "Entendido"
    },
    banner: {
      text: "SR Copilot responde sobre proyectos, stack y contacto",
      textShort: "Pregúntale a SR Copilot sobre mí",
      live: "En vivo",
      cta: "Probar"
    },
    agentic: {
      title: "Agentic Development Workflow",
      subtitle: "MULTIPLICADOR DE PRODUCTIVIDAD 10X",
      desc: "Prototipando y escalando mediante orquestación de agentes en paralelo, MCP Servers y Skills personalizados.",
      tools: "Herramientas_que_Orquesto"
    },
    notFound: {
      title: "404 - Página no encontrada",
      description: "¡Oops! La página que estás buscando no existe o ha sido movida.",
      backHome: "Volver al Inicio"
    }
  }
};
