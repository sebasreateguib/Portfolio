"use client";
import React, { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { THANKS_EN_LOGO, THANKS_ES_LOGO } from '../ui/ascii';
import { FrameButton } from './frame-button';

import { SectionDivider } from './section-divider';
import { SectionTitle } from './section-title';

const CONTACT_EMAIL = 'reateguisebastian1@gmail.com';

const GithubIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

const LinkedInIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

export default function ContactSection() {
    const { language } = useLanguage();
    const t = translations[language];

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [emailCopied, setEmailCopied] = useState(false);

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(CONTACT_EMAIL);
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 2000);
        } catch {
            // Clipboard blocked (insecure context, denied permission): fall back to the mail client.
            window.location.href = `mailto:${CONTACT_EMAIL}`;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });

            if (res.ok) {
                setStatus('success');
                setName('');
                setEmail('');
                setMessage('');
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 5000);
            }
        } catch (error) {
            console.error("Form error:", error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <section id="contact" className="relative w-full pt-16 pb-8 lg:pt-24 lg:pb-12 overflow-hidden border-t border-white/10 bg-black">
            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                <div className="mb-16">
                    <div className="mb-4">
                        <SectionTitle index="05">{t.contact.title}</SectionTitle>
                    </div>
                    <SectionDivider label={t.contact.getInTouch} index="05" />
                </div>

                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 items-start lg:items-stretch justify-between w-full">
                    {/* Left Column: Text */}
                    <div className="flex flex-col gap-10 w-full lg:w-1/2">
                        <div className="flex flex-col gap-4">
                            <div className="relative inline-block self-start">
                                <h3 className="text-2xl md:text-4xl font-section font-bold text-white mb-2 leading-tight">
                                    {t.contact.heading}
                                </h3>
                            </div>
                            <p className="text-white/60 font-mono text-sm md:text-base max-w-md leading-relaxed">
                                {t.contact.desc}
                            </p>

                        </div>

                        <div className="hidden lg:block mt-8 opacity-40 hover:opacity-100 transition-opacity duration-700 cursor-default">
                            <pre className="font-mono text-[5px] sm:text-[8px] md:text-[10px] text-blue-500 leading-tight">
                                {language === 'en' ? THANKS_EN_LOGO : THANKS_ES_LOGO}
                            </pre>
                        </div>

                        {/* Direct channels */}
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3 max-w-md">
                            <a href="https://www.linkedin.com/in/sebasreateguib" target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-2 px-4 py-2.5 bg-transparent border border-white text-white font-mono text-xs lg:text-sm hover:bg-white hover:text-black transition-all duration-200">
                                <LinkedInIcon size={16} />
                                {t.contact.linkedin}
                            </a>
                            <button
                                type="button"
                                onClick={handleCopyEmail}
                                aria-label={`${t.contact.email}: ${CONTACT_EMAIL}`}
                                className="flex min-h-11 items-center justify-center gap-2 px-4 py-2.5 bg-transparent border border-white text-white font-mono text-xs lg:text-sm hover:bg-white hover:text-black transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                {emailCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {emailCopied ? t.contact.emailCopied : t.contact.email}
                            </button>
                        </div>
                    </div>
                    {/* Right Column: Technical Contact Form */}
                    <div className="w-full lg:w-1/2 flex flex-col bg-black border border-blue-500/30 rounded-lg p-5 md:p-6 relative shadow-[0_0_30px_rgba(59,130,246,0.1)] font-mono">
                        {/* Terminal Header Decor */}
                        <div className="absolute top-0 left-0 right-0 bg-blue-500/10 border-b border-blue-500/30 p-2 flex items-center justify-between rounded-t-lg">
                            <div className="flex gap-2 pl-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                            </div>
                            <span className="text-[10px] text-blue-400 font-bold tracking-widest">SECURE_TRANSMISSION_PROTOCOL</span>
                            <div className="w-10"></div>
                        </div>

                        {status === 'success' && (
                            <div className="absolute inset-0 z-20 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300 rounded-lg border border-green-500/30">
                                <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
                                <h4 className="text-xl font-bold text-green-400 mb-2">{t.contact.formSuccess}</h4>
                                <p className="text-green-400/50 text-xs mt-2">TRANSMISSION_COMPLETE</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 w-full mt-6">
                            <div className="flex flex-col sm:flex-row gap-5 w-full">
                                <div className="flex flex-col gap-2 relative group flex-1">
                                    <label className="text-blue-400 text-xs tracking-widest uppercase flex gap-2 items-center">
                                        <span className="text-white/50">{">"}</span> {t.contact.formNamePlaceholder.includes('Nombre') ? 'ID_USUARIO' : 'USER_ID'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        disabled={status === 'loading'}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-transparent border-b border-white/20 focus:border-blue-400 rounded-none px-0 py-2 text-white text-sm outline-none transition-all duration-300 disabled:opacity-50 font-mono placeholder:text-white/20 focus:shadow-[0_1px_10px_rgba(59,130,246,0.2)]"
                                        placeholder="_"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 relative group flex-1">
                                    <label className="text-blue-400 text-xs tracking-widest uppercase flex gap-2 items-center">
                                        <span className="text-white/50">{">"}</span> {t.contact.formEmailPlaceholder.includes('correo') ? 'DIR_CORREO' : 'MAIL_DIR'}
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        disabled={status === 'loading'}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent border-b border-white/20 focus:border-blue-400 rounded-none px-0 py-2 text-white text-sm outline-none transition-all duration-300 disabled:opacity-50 font-mono placeholder:text-white/20 focus:shadow-[0_1px_10px_rgba(59,130,246,0.2)]"
                                        placeholder="_"
                                    />
                                </div>
                            </div>

                            {/* Grows to absorb whatever height the left column has left over */}
                            <div className="flex flex-1 flex-col gap-2 relative group">
                                <label className="text-blue-400 text-xs tracking-widest uppercase flex gap-2 items-center">
                                    <span className="text-white/50">{">"}</span> {t.contact.formMessagePlaceholder.includes('ayudar') ? 'PAYLOAD' : 'PAYLOAD'}
                                </label>
                                <textarea
                                    required
                                    disabled={status === 'loading'}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={3}
                                    className="w-full flex-1 min-h-[5.5rem] bg-[#050505] border border-white/20 focus:border-blue-400 rounded-md p-3 text-white text-sm outline-none transition-all duration-300 resize-none disabled:opacity-50 font-mono focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                    placeholder="..."
                                />
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-400 text-xs mt-1 bg-red-400/10 p-3 rounded border border-red-400/20 animate-in fade-in uppercase tracking-widest">
                                    <XCircle className="w-4 h-4 shrink-0" />
                                    <span>[ERR] {t.contact.formError}</span>
                                </div>
                            )}

                            <FrameButton
                                as="button"
                                type="submit"
                                variant="outline"
                                glow={true}
                                disabled={status === 'loading'}
                                className="mt-4 w-full text-blue-400 border-blue-500 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 font-bold tracking-widest text-xs sm:text-sm py-4 px-6 rounded-none transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-visible uppercase"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>ENCRYPTING...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>[ {t.contact.formSubmit.includes('Enviar') ? 'EJECUTAR_ENVÍO' : 'EXECUTE_TX'} ]</span>
                                    </>
                                )}
                            </FrameButton>
                        </form>
                    </div>
                </div>

                {/* Mobile ASCII (Below Form) */}
                <div className="lg:hidden w-full flex justify-center mt-16 opacity-40 hover:opacity-100 transition-opacity duration-700 cursor-default">
                    <pre className="font-mono text-[7px] sm:text-[10px] md:text-[12px] text-blue-500 leading-tight text-center overflow-hidden">
                        {language === 'en' ? THANKS_EN_LOGO : THANKS_ES_LOGO}
                    </pre>
                </div>
            </div>

            {/* Background glowing effects */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[200px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        </section>
    );
}
