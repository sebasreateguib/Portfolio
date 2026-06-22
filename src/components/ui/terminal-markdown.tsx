"use client";

import ReactMarkdown, { Components } from "react-markdown";

const terminalComponents: Components = {
    p: ({ children }) => (
        <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
    ),
    strong: ({ children }) => (
        <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }) => (
        <em className="italic text-green-300">{children}</em>
    ),
    ul: ({ children }) => (
        <ul className="mt-1 mb-2 flex flex-col gap-1 pl-0 list-none">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="mt-1 mb-2 flex flex-col gap-1 pl-4 list-decimal marker:text-green-500">{children}</ol>
    ),
    li: ({ children }) => (
        <li className="flex items-start gap-2">
            <span className="mt-[0.45rem] text-green-500 shrink-0 text-xs leading-none">–</span>
            <span>{children}</span>
        </li>
    ),
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300 transition-colors"
        >
            {children}
        </a>
    ),
    code: ({ children }) => (
        <code className="rounded px-1 py-0.5 font-mono text-xs bg-white/10 text-green-300">
            {children}
        </code>
    ),
    h1: ({ children }) => <h1 className="text-base font-bold mb-1 mt-3 text-white">{children}</h1>,
    h2: ({ children }) => <h2 className="text-sm font-bold mb-1 mt-2 text-white">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1.5 text-green-300">{children}</h3>,
};

export function TerminalMarkdown({ text }: { text: string }) {
    return (
        <div className="text-sm text-gray-300 leading-relaxed">
            <ReactMarkdown components={terminalComponents}>
                {text}
            </ReactMarkdown>
        </div>
    );
}
