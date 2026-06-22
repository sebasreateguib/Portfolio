"use client";

import ReactMarkdown, { Components } from "react-markdown";

const markdownComponents: Components = {
    p: ({ children }) => (
        <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>
    ),
    strong: ({ children }) => (
        <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => (
        <em className="italic opacity-90">{children}</em>
    ),
    ul: ({ children }) => (
        <ul className="mt-1 mb-2 flex flex-col gap-1 pl-0 list-none">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="mt-1 mb-2 flex flex-col gap-1 pl-4 list-decimal">{children}</ol>
    ),
    li: ({ children }) => (
        <li className="flex items-start gap-2">
            <span
                className="mt-[0.42rem] h-[6px] w-[6px] min-w-[6px] rounded-full bg-blue-400 shrink-0"
            />
            <span>{children}</span>
        </li>
    ),
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline underline-offset-2 transition-opacity hover:opacity-75"
        >
            {children}
        </a>
    ),
    code: ({ children }) => (
        <code className="rounded px-1 py-0.5 font-mono text-xs bg-white/10 text-blue-200">
            {children}
        </code>
    ),
    h1: ({ children }) => <h1 className="text-base font-bold mb-1 mt-2 text-white">{children}</h1>,
    h2: ({ children }) => <h2 className="text-sm font-bold mb-1 mt-2 text-white">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1 text-white">{children}</h3>,
};

export function BotMarkdown({ text }: { text: string }) {
    return (
        <div className="text-[0.95rem] text-white/90">
            <ReactMarkdown components={markdownComponents}>
                {text}
            </ReactMarkdown>
        </div>
    );
}
