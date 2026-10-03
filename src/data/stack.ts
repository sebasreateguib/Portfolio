export type StackLogo = { name: string; image: string };

const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

/** Two rows: cloud, data, languages and frontend, then backend and tooling. */
export const STACK_GROUPS: { label: string; logos: StackLogo[] }[] = [
  {
    label: "Cloud, databases, languages & frontend",
    logos: [
      { name: "AWS", image: "/AWS Logo Light.svg" },
      { name: "GCP", image: `${DEVICON}/googlecloud/googlecloud-original.svg` },
      { name: "Cloudflare", image: `${DEVICON}/cloudflare/cloudflare-original.svg` },
      { name: "Vercel", image: "https://cdn.simpleicons.org/vercel/white" },
      { name: "PostgreSQL", image: `${DEVICON}/postgresql/postgresql-original.svg` },
      { name: "pgvector", image: "https://cdn.simpleicons.org/postgresql/white" },
      { name: "MySQL", image: `${DEVICON}/mysql/mysql-original.svg` },
      { name: "SQLite", image: `${DEVICON}/sqlite/sqlite-original.svg` },
      { name: "MongoDB", image: `${DEVICON}/mongodb/mongodb-original.svg` },
      { name: "Supabase", image: `${DEVICON}/supabase/supabase-original.svg` },
      { name: "DynamoDB", image: "/AWS DynamoDB.svg" },
      { name: "Qdrant", image: "https://cdn.simpleicons.org/qdrant" },
      { name: "C++", image: `${DEVICON}/cplusplus/cplusplus-original.svg` },
      { name: "Python", image: `${DEVICON}/python/python-original.svg` },
      { name: "Go", image: `${DEVICON}/go/go-original-wordmark.svg` },
      { name: "Java", image: `${DEVICON}/java/java-original.svg` },
      { name: "JavaScript", image: `${DEVICON}/javascript/javascript-original.svg` },
      { name: "TypeScript", image: `${DEVICON}/typescript/typescript-original.svg` },
      { name: "React", image: `${DEVICON}/react/react-original.svg` },
      { name: "Vue.js", image: `${DEVICON}/vuejs/vuejs-original.svg` },
      { name: "Next.js", image: "https://cdn.simpleicons.org/nextdotjs/white" },
    ],
  },
  {
    label: "Backend, workflow & AI",
    logos: [
      { name: "Node.js", image: "/Node.svg" },
      { name: "Spring Boot", image: "/spring-boot.svg" },
      { name: "Flask", image: "https://cdn.simpleicons.org/flask/white" },
      { name: "FastAPI", image: `${DEVICON}/fastapi/fastapi-original.svg` },
      { name: "Pydantic", image: "https://cdn.simpleicons.org/pydantic" },
      { name: "Docling", image: "/Docling.svg" },
      { name: "Express", image: "https://cdn.simpleicons.org/express/white" },
      { name: "Git", image: `${DEVICON}/git/git-original.svg` },
      { name: "GitHub", image: "https://cdn.simpleicons.org/github/white" },
      { name: "Docker", image: `${DEVICON}/docker/docker-original.svg` },
      { name: "Nginx", image: "https://cdn.simpleicons.org/nginx" },
      { name: "Jenkins", image: `${DEVICON}/jenkins/jenkins-original.svg` },
      { name: "Postman", image: `${DEVICON}/postman/postman-original.svg` },
      { name: "Cursor", image: "https://cdn.simpleicons.org/cursor/white" },
      { name: "Gemini", image: "/Gemini Color Icon.svg" },
      { name: "Claude", image: "/Claudecode Color Icon.svg" },
      { name: "Codex", image: "/Codex Color Icon.svg" },
      { name: "Ollama", image: "https://cdn.simpleicons.org/ollama/white" },
      { name: "Hugging Face", image: "/Hugging Face Color Icon.svg" },
      { name: "Antigravity", image: "/Antigravity.svg" },
    ],
  },
];

/** Shown inside the Agentic Development Workflow card, not in the marquee. */
export const AGENTIC_TOOLS: StackLogo[] = [
  { name: "LangChain", image: "https://cdn.simpleicons.org/langchain/white" },
  { name: "LangGraph", image: "https://cdn.simpleicons.org/langgraph/white" },
  { name: "n8n", image: "https://cdn.simpleicons.org/n8n" },
  { name: "LlamaIndex", image: "/LlamaIndex Color Icon.svg" },
];
