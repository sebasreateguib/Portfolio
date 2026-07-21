export const translations = {
  en: {
    nav: {
      about: "About Me",
      projects: "Projects",
      education: "Education",
      skills: "Stack & Workflow",
      contact: "Contact"
    },
    hero: {
      portfolio: "Portfolio",
      downloadResume: "Download Resume",
      role: "CS Student @ UTEC.",
      description: "Passionate about AI & ML Engineering, Full Stack Development, Systems Optimization and Cloud-Native Infrastructure.",
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
      readme: "README.md",
      hi: "Hi there 👋, I'm Sebastian!",
      bio: "I'm a 26 year old Computer Science student based in Lima, Perú. I always enjoy learning new things and giving my best to every project and challenge.",
      bullet1: "I'm currently a <span className=\"text-[#60a5fa] font-semibold\">3rd-year CS Student</span> at UTEC",
      bullet2: "I'm currently learning new languages and technologies like <span className=\"text-[#60a5fa] font-semibold\">Rust, NestJS & Nuxt.</span>",
      bullet3: "Fun fact: <span className=\"text-[#60a5fa] font-semibold\">I was inspired by Blue Lock's pentagon for the hero design!</span>",
      bullet4: "Focused on <span className=\"text-[#60a5fa] font-semibold\">clean code, modern infrastructure, and AI.</span>",
      bullet5: "<span className=\"text-[#60a5fa] font-semibold\">Open to internships</span> and freelance projects!",
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
          id: 7,
          title: "RRadar",
          description: "Interactive client-server app to explore geospatial Points of Interest across Lima. Compares Linear Search vs a custom R-Tree (range + KNN) for spatial queries, with a Vue.js + Leaflet map that visualizes MBRs and live performance benchmarks.",
          tech: ["C++", "Vue.js", "Leaflet", "Vite", "R-Tree"],
          github: "#",
          live: "#",
          image: "/rradar-compressed.mp4",
          year: "2026"
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
      badge: "Methodology",
    },
    skills: {
      title: "Skills & Technologies",
      frontend: "Frontend",
      backend: "Backend",
      tools: "Tools & Cloud"
    },
    logoCloud: {
      title: "Stack & Workflow",
      badge: "Tech_Stack_&_Tools",
      description: "Languages, frameworks, tools and infrastructure I use to build scalable applications."
    },
    contact: {
      title: "Contact",
      getInTouch: "Get_In_Touch",
      heading: "Let's build something great.",
      desc: "Currently open for new opportunities, collaborations, and interesting projects. Feel free to reach out!",
      email: "Email me",
      github: "GitHub",
      formNamePlaceholder: "Your Name",
      formEmailPlaceholder: "your@email.com",
      formMessagePlaceholder: "How can I help you?",
      formSubmit: "Send Message",
      formSubmitting: "Sending...",
      formSuccess: "Message sent successfully!",
      formError: "Failed to send message. Please try again."
    },
    copilot: {
      placeholder: "Ask SR Copilot...",
      dockTitle: "Chat with SR Copilot",
      dockSubtitle: "Projects, skills & contact",
      tapToOpen: "Tap to open",
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
      bullet1: "AI-Pair Programming",
      bullet2: "Automated Code Generation",
      bullet3: "Rapid Prototyping & CI/CD"
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
      education: "Educación",
      skills: "Stack & Workflow",
      contact: "Contacto"
    },
    hero: {
      portfolio: "Portafolio",
      downloadResume: "Descargar CV",
      role: "Estudiante de CS @ UTEC.",
      description: "Apasionado por Ingeniería IA & ML, Desarrollo Full Stack, Optimización de Sistemas e Infraestructura Cloud-Native.",
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
      readme: "README.md",
      hi: "¡Hola 👋, soy Sebastian!",
      bio: "Soy un estudiante de Ciencia de la Computación de 26 años viviendo en Lima, Perú. Siempre disfruto aprender cosas nuevas y dar lo mejor de mí en cada proyecto y desafío.",
      bullet1: "Actualmente soy un <span className=\"text-[#60a5fa] font-semibold\">Estudiante de 3er año de CC</span> en UTEC",
      bullet2: "Actualmente estoy aprendiendo tecnologías como <span className=\"text-[#60a5fa] font-semibold\">Rust, NestJS & Nuxt</span>",
      bullet3: "Dato curioso: <span className=\"text-[#60a5fa] font-semibold\">¡Me inspiré en el pentágono de Blue Lock para el diseño!</span>",
      bullet4: "Enfocado en <span className=\"text-[#60a5fa] font-semibold\">código limpio, infraestructura moderna e IA.</span>",
      bullet5: "¡<span className=\"text-[#60a5fa] font-semibold\">Abierto a prácticas</span> y proyectos freelance!",
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
          id: 7,
          title: "RRadar",
          description: "App cliente-servidor para explorar POIs geoespaciales en Lima. Compara Búsqueda Lineal vs un R-Tree propio (range + KNN), con un mapa en Vue.js + Leaflet que visualiza los MBRs y benchmarks de rendimiento en tiempo real.",
          tech: ["C++", "Vue.js", "Leaflet", "Vite", "R-Tree"],
          github: "#",
          live: "#",
          image: "/rradar-compressed.mp4",
          year: "2026"
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
      badge: "Metodología",
    },
    skills: {
      title: "Habilidades y Tecnologías",
      frontend: "Frontend",
      backend: "Backend",
      tools: "Herramientas y Nube"
    },
    logoCloud: {
      title: "Stack & Workflow",
      badge: "Tecnologías_y_Herramientas",
      description: "Lenguajes, frameworks, herramientas e infraestructura que uso para construir aplicaciones escalables."
    },
    contact: {
      title: "Contacto",
      getInTouch: "Contáctame",
      heading: "Construyamos algo increíble.",
      desc: "Actualmente abierto a nuevas oportunidades, colaboraciones y proyectos interesantes. ¡No dudes en contactarme!",
      email: "Escríbeme",
      github: "GitHub",
      formNamePlaceholder: "Tu Nombre",
      formEmailPlaceholder: "tu@correo.com",
      formMessagePlaceholder: "¿En qué te puedo ayudar?",
      formSubmit: "Enviar Mensaje",
      formSubmitting: "Enviando...",
      formSuccess: "¡Mensaje enviado con éxito!",
      formError: "Error al enviar el mensaje. Intenta de nuevo."
    },
    copilot: {
      placeholder: "Pregúntale a SR Copilot...",
      dockTitle: "Chatea con SR Copilot",
      dockSubtitle: "Proyectos, skills y contacto",
      tapToOpen: "Toca para abrir",
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
      bullet1: "Programación en Pareja con IA",
      bullet2: "Generación de Código Automatizada",
      bullet3: "Prototipado Rápido y CI/CD"
    },
    notFound: {
      title: "404 - Página no encontrada",
      description: "¡Oops! La página que estás buscando no existe o ha sido movida.",
      backHome: "Volver al Inicio"
    }
  }
};
