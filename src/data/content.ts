export const FULL_STACK_BIO = {
  en: `
Hey 👋 I'm **Sebastián Reátegui** — a 26 year-old CS student at Universidad de Ingeniería y Tecnología - UTEC. I always enjoy learning new things and giving my best to every project.

Currently looking for opportunities to keep growing
and contribute to projects.

**Interests** 🎯

AI, Fintech, Full Stack Development, Infrastructure, Systems Optimization and Computer Architecture.
`.trim(),
  es: `
Hola 👋 Soy **Sebastián Reátegui** — un estudiante de Ciencia de la Computación de 26 años en la Universidad de Ingeniería y Tecnología - UTEC. Siempre disfruto aprender cosas nuevas y dar lo mejor de mí en cada proyecto.

Actualmente buscando oportunidades para seguir creciendo
y contribuir en proyectos.

**Intereses** 🎯

IA, Fintech, Desarrollo Full Stack, Infraestructura, Optimización de Sistemas y Arquitectura de Computadores.
`.trim()
};

export const SKILLS_CONTENT = {
  en: `
CS STUDENT @ UTEC
──────────────────────────────────────────

💻 LANGUAGES & FRAMEWORKS
• C++, Python, Go, Java, JavaScript, TypeScript
• React.js, Vue.js, Next.js, Spring Boot, Flask, FastApi, Express.js

☁️ CLOUD & INFRASTRUCTURE
• AWS (S3, Glue, Athena, Amplify, API Gateway, EC2)
• Docker, Microservices Architecture
• SQL (PostgreSQL, MySQL, SQLite) & NoSQL (MongoDB, DynamoDB)

🛠️ TOOLS & WORKFLOW
• Git & GitHub, Postman
• Cursor, Gemini, Codex, Claude Code
• Opencode, Openrouter, Hugging Face, Groq, MCP Servers, SKILLS.MD
`.trim(),
  es: `
ESTUDIANTE DE CC @ UTEC
──────────────────────────────────────────

💻 LENGUAJES Y FRAMEWORKS
• C++, Python, Java, Go, JavaScript, TypeScript
• React.js, Vue.js, Next.js, Spring Boot, Flask, FastApi, Express.js

☁️ NUBE E INFRAESTRUCTURA
• AWS (S3, Glue, Athena, Amplify, API Gateway, EC2)
• Docker, Arquitectura de Microservicios
• SQL (PostgreSQL, MySQL, SQLite) y MongoDB

🛠️ HERRAMIENTAS Y FLUJO DE TRABAJO
• Git y GitHub
• Vite, Tailwind CSS
• Pipelines de Datos y ETL
`.trim()
};

export const PROJECTS_DATA = [
  {
    id: 'project-sanaflow.txt',
    name: {
      en: 'SanaFlow – Intelligent Medical Triage Platform',
      es: 'SanaFlow – Plataforma de Triaje Médico Inteligente'
    },
    content: {
      en: `SANAFLOW:
Stack: Serverless Framework · Python · AWS (Lambda, SQS, DynamoDB, API Gateway WebSocket) · React · Groq Llama 3
Challenge: Build a resilient system to process, classify, and prioritize massive patient clinical notes automatically.
Solution: Designed a 100% Serverless, event-driven architecture using SQS decoupled queues. Built an automated pipeline that queries Llama 3 to extract symptoms and urgency. Integrated a realtime WebSocket dashboard for live updates.
Repo: https://github.com/sebasreateguib/Sanaflow`,
      es: `SANAFLOW:
Stack: Serverless Framework · Python · AWS (Lambda, SQS, DynamoDB, API Gateway WebSocket) · React · Groq Llama 3
Desafío: Construir un sistema resiliente para procesar, clasificar y priorizar notas clínicas masivamente.
Solución: Diseñé una arquitectura orientada a eventos 100% Serverless con colas desacopladas (SQS). Implementé un pipeline que consulta a Llama 3 para extraer síntomas y urgencia, y un dashboard con WebSockets en tiempo real.
Repo: https://github.com/sebasreateguib/Sanaflow`
    }
  },
  {
    id: 'project-fintrend.txt',
    name: {
      en: 'FinTrendAI – Cloud-Native Financial Analytics',
      es: 'FinTrendAI – Analítica Financiera Nube-Nativa'
    },
    content: {
      en: `FINTRENDAI:
Stack: Python · Java · Node.js · AWS · React.js · TypeScript
Challenge: Build a scalable financial analytics platform on cloud infrastructure.
Solution: Architected 5 microservices (Python, Java, Node.js) deployed on AWS.
Integrated a full data pipeline: VM Ingesta → S3 → Glue → Athena → API Gateway.
Frontend on AWS Amplify with real-time market dashboards and AI-driven signals.
Repo: https://github.com/sebasreateguib/FinTrendAI`,
      es: `FINTRENDAI:
Stack: Python · Java · Node.js · AWS · React.js · TypeScript
Desafío: Construir una plataforma de analítica financiera escalable en infraestructura cloud.
Solución: Arquitecturé 5 microservicios (Python, Java, Node.js) desplegados en AWS.
Integré un pipeline de datos completo: VM Ingesta → S3 → Glue → Athena → API Gateway.
Frontend en AWS Amplify con dashboards de mercado en tiempo real y señales impulsadas por IA.
Repo: https://github.com/sebasreateguib/FinTrendAI`
    }
  },
  {
    id: 'project-mrsushi.txt',
    name: {
      en: 'Mr Sushi Order Platform – Serverless EDA Backend',
      es: 'Plataforma de Pedidos Mr Sushi – Backend Serverless EDA'
    },
    content: {
      en: `MR SUSHI ORDER PLATFORM:
Stack: Node.js · Serverless Framework · AWS (Lambda, API Gateway, DynamoDB, Step Functions, EventBridge)
Challenge: Build a scalable, event-driven restaurant order management system.
Solution: Designed a 100% Serverless architecture with decoupled microservices using EventBridge. Managed complex order lifecycles (Kitchen ➔ Packing ➔ Delivery) using AWS Step Functions with the Wait for Callback (Task Token) pattern. Implemented custom JWT security for both clients and workers.
Repo: https://github.com/sebasreateguib/MrSushiClone`,
      es: `PLATAFORMA DE PEDIDOS MR SUSHI:
Stack: Node.js · Serverless Framework · AWS (Lambda, API Gateway, DynamoDB, Step Functions, EventBridge)
Desafío: Construir un sistema escalable y orientado a eventos para la gestión de pedidos de un restaurante.
Solución: Diseñé una arquitectura 100% Serverless con microservicios desacoplados mediante EventBridge. Orquesté flujos de vida de pedidos (Cocina ➔ Empaque ➔ Entrega) usando AWS Step Functions con el patrón Wait for Callback (Task Token). Implementé seguridad JWT a medida para clientes y trabajadores.
Repo: https://github.com/sebasreateguib/MrSushiClone`
    }
  },
  {
    id: 'project-medigo.txt',
    name: {
      en: 'MediGO – Healthcare Platform (CS 2031 @ UTEC)',
      es: 'MediGO – Plataforma de Salud (CS 2031 @ UTEC)'
    },
    content: {
      en: `MEDIGO:
Stack: Spring Boot · React.js · PostgreSQL
Challenge: Build a production-ready healthcare management platform for a university course.
Solution: Developed MediGO from scratch as a full-stack project, covering frontend,
backend, and database layers with a focus on usability and real-world constraints.
Repo: https://github.com/sebasreateguib/MediGO-Repository`,
      es: `MEDIGO:
Stack: Spring Boot · React.js · PostgreSQL
Desafío: Construir una plataforma de gestión de salud lista para producción para un curso universitario.
Solución: Desarrollé MediGO desde cero como un proyecto full-stack, cubriendo las capas de frontend,
backend y base de datos con un enfoque en la usabilidad y restricciones del mundo real.
Repo: https://github.com/sebasreateguib/MediGO-Repository`
    }
  },
  {
    id: 'project-sparseexcel.txt',
    name: {
      en: 'SparseExcel – Sparse Matrix Engine in C++',
      es: 'SparseExcel – Motor de Matriz Dispersa en C++'
    },
    content: {
      en: `SPARSEEXCEL:
Stack: C++ · React.js
Challenge: Implement an efficient sparse matrix from scratch for Algorithms & Data Structures.
Solution: Built a full sparse matrix engine in C++ using std::variant for type-safe cell values,
with support for formulas, memory-efficient node storage, and a visual GUI frontend
to inspect the matrix state, memory addresses, and 3D structure in real time.
Repo: https://github.com/sebasreateguib/SparseExcel`,
      es: `SPARSEEXCEL:
Stack: C++ · React.js
Desafío: Implementar una matriz dispersa eficiente desde cero para Algoritmos y Estructuras de Datos.
Solución: Construí un motor completo de matriz dispersa en C++ usando std::variant para valores de celda seguros,
con soporte para formulas, almacenamiento de nodos eficiente en memoria y un frontend visual GUI
para inspeccionar el estado de la matriz, direcciones de memoria y la estructura 3D en tiempo real.
Repo: https://github.com/sebasreateguib/SparseExcel`
    }
  },
  {
    id: 'project-quadtree.txt',
    name: {
      en: 'QuadTree Simulation – 2D Collision Physics Engine',
      es: 'QuadTree Simulation – Motor Físico de Colisiones 2D'
    },
    content: {
      en: `QUADTREE SIMULATION:
Stack: C++ · Vue.js · Tailwind CSS
Challenge: Optimize 2D particle collision detection beyond naive O(N²) brute force.
Solution: Built a physics engine in C++ implementing a QuadTree spatial partitioning algorithm. Connected the high-performance backend to a Vue.js web client using Server-Sent Events (SSE) to stream physics computations at ~30 FPS for real-time visualization and performance comparison.
Repo: https://github.com/sebasreateguib/QuadTreeParticleSimulator`,
      es: `QUADTREE SIMULATION:
Stack: C++ · Vue.js · Tailwind CSS
Desafío: Optimizar la detección de colisiones 2D más allá de la fuerza bruta O(N²).
Solución: Construí un motor físico en C++ implementando el algoritmo QuadTree de partición espacial. Conecté el backend de alto rendimiento a un cliente web en Vue.js usando Server-Sent Events (SSE) para enviar la simulación física a ~30 FPS para visualización en tiempo real y comparación empírica.
Repo: https://github.com/sebasreateguib/QuadTreeParticleSimulator`
    }
  },
  {
    id: 'project-applemusictui.txt',
    name: {
      en: 'AppleMusicTUI – Terminal Music Player in Go',
      es: 'AppleMusicTUI – Reproductor de Música de Terminal en Go'
    },
    content: {
      en: `APPLEMUSICTUI:
Stack: Go · macOS · Terminal UI
Challenge: Control Apple Music from the command line with a keyboard-driven interface.
Solution: Built a sleek TUI in Go that interfaces with the Apple Music library on macOS.
Features full keyboard navigation, a glitch-animated header, and a red-themed aesthetic.
The kind of tool you build because you can — and then actually use every day.
Repo: https://github.com/sebasreateguib/AppleMusicTUI`,
      es: `APPLEMUSICTUI:
Stack: Go · macOS · Terminal UI
Desafío: Controlar Apple Music desde la línea de comandos con una interfaz guiada por teclado.
Solución: Construí una elegante TUI en Go que se conecta con la biblioteca de Apple Music en macOS.
Cuenta con navegación completa por teclado, un encabezado animado con glitch y una estética temática roja.
El tipo de herramienta que construyes porque puedes, y luego terminas usando todos los días.
Repo: https://github.com/sebasreateguib/AppleMusicTUI`
    }
  },
  {
    id: 'project-openmultimodal.txt',
    name: {
      en: 'OpenMultimodal – Multimodal RAG Agent',
      es: 'OpenMultimodal – Agente Multimodal RAG'
    },
    content: {
      en: `OPENMULTIMODAL:
Stack: Python · FastAPI · LlamaIndex · Gemini · Qdrant · React
Challenge: Build an AI system to index and query complex multimodal data (PDFs, images).
Solution: Engineered an end-to-end AI system using LlamaIndex, LlamaParse, Google Gemini, and Qdrant. It indexes complex PDFs and images to answer queries backed by retrieved multimodal evidence.
Repo: https://github.com/sebasreateguib/OpenMultimodal`,
      es: `OPENMULTIMODAL:
Stack: Python · FastAPI · LlamaIndex · Gemini · Qdrant · React
Desafío: Construir un sistema de IA para indexar y consultar datos multimodales complejos (PDFs, imágenes).
Solución: Diseñé un sistema de IA usando LlamaIndex, LlamaParse, Google Gemini y Qdrant. Indexa documentos complejos e imágenes para responder consultas respaldadas por evidencia multimodal.
Repo: https://github.com/sebasreateguib/OpenMultimodal`
    }
  },
  {
    id: 'project-fraudnet.txt',
    name: {
      en: 'FraudNet – Neural Network Fraud Detection System',
      es: 'FraudNet – Sistema de Detección de Fraude con Redes Neuronales'
    },
    content: {
      en: `FRAUDNET:
Stack: C++ · Neural Networks · React.js · Node.js · Express
Challenge: Build a Neural Network for fraud detection from scratch without external ML libraries.
Solution: Built a Multi-Layer Perceptron entirely from scratch in C++ using custom linear algebra tensors. Connected to an enterprise-grade React dashboard via a Node.js Bridge API for real-time transaction monitoring and testing.
Repo: https://github.com/sebasreateguib/FraudNet`,
      es: `FRAUDNET:
Stack: C++ · Redes Neuronales · React.js · Node.js · Express
Desafío: Construir una Red Neuronal para detección de fraude desde cero sin usar librerías de ML externas.
Solución: Construí un Perceptrón Multicapa (MLP) desde cero en C++ usando tensores propios. Conectado a un dashboard empresarial en React mediante una API en Node.js para monitoreo y pruebas en tiempo real.
Repo: https://github.com/sebasreateguib/FraudNet`
    }
  }
];

export const CONTACT_INFO = {
  email: 'reateguisebastian1@gmail.com',
  github: 'github.com/sebasreateguib',
  status: {
    en: 'Open to internships & new opportunities',
    es: 'Abierto a pasantías y nuevas oportunidades'
  }
};

export const RESUME_URL = 'https://github.com/sebasreateguib';

export const PERSONAL_EXTRA = {
  en: `
- **Age**: 26 years old.
- **Academic Cycle**: Currently in his 3rd year / 5th semester of Computer Science at UTEC (Peru). Expected graduation: 2029.
- **Hobbies**: Coding Terminal User Interfaces (TUI) in Go, customizing his terminal setup, watching NBA, and anime (recently he became a fan of Blue Lock!).
- **Goals**: Specialize in Artificial Intelligence (AI) and Machine Learning Engineering, design high-performance distributed systems, and join a global tech company.
  `.trim(),
  es: `
- **Edad**: 26 años.
- **Ciclo Académico**: Actualmente cursando el 3er año / 5to ciclo de Ciencia de la Computación en UTEC (Perú). Año de graduación esperado: 2029.
- **Hobbies**: Programar interfaces de usuario para la terminal (TUI) en Go, personalizar su entorno de desarrollo, ver NBA y anime (recientemente es fan de Blue Lock!).
- **Metas**: Especializarse en Inteligencia Artificial (IA) e Ingeniería de Aprendizaje Automático (ML), diseñar sistemas distribuidos de alto rendimiento y trabajar en una empresa tecnológica global.
  `.trim()
};
export const FAQ_KNOWLEDGE = {
  es: `PREGUNTAS FRECUENTES (FAQ) PARA EL CHATBOT:
- ¿Cuánto cobras por hacer una página web / Cuál es tu tarifa? Si es una página visual sin funcionalidades pesadas que requieran servidores externos (pagos, almacenar datos, etc.), cobro 30 dólares o 120 soles.
- ¿El pago es por adelantado o al finalizar? El pago es 30% por adelantado y el resto al finalizar el proyecto.
- ¿Estás disponible para trabajar a tiempo completo/part-time? ¡Sí! Estoy disponible para trabajar part-time.
- ¿Aceptas proyectos freelance en este momento? Por supuesto, acepto trabajos relacionados con desarrollo web.
- ¿Qué nivel de inglés tienes para entornos internacionales? No tengo certificado actual como IELTS o TOEFL, pero en 2018 obtuve un B2 cuando recién me mudé a Estados Unidos. Después de vivir 2 años y medio en San Francisco, tengo la total seguridad de que no tendré problemas para comunicarme y trabajar en un entorno internacional.`,
  en: `CHATBOT FREQUENTLY ASKED QUESTIONS (FAQ):
- How much do you charge for a website / What is your rate? For a visual page without heavy features requiring external servers (payments, data storage, etc.), I charge 30 USD or 120 PEN.
- Is payment upfront or at the end? Payment is 30% upfront and the rest upon project completion.
- Are you available for full-time/part-time work? Yes! I am available for part-time work.
- Are you accepting freelance projects right now? Of course, I am currently accepting web development freelance projects.
- What is your English level for international environments? I don't have a current IELTS or TOEFL certificate, but I had a B2 level in 2018 when I first moved to the US. After living in San Francisco for 2.5 years, I am highly confident that I will have no issues communicating and working in an international environment.`
};
