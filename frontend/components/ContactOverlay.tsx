import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, CornerDownRight } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactOverlay({ isOpen, onClose }: Props) {
    const [formState, setFormState] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [subject, setSubject] = useState('Project Inquiry');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const subjects = ['Project Inquiry', 'Partnership', 'Careers', 'Other'];

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setFormState('IDLE');
                setDropdownOpen(false);
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Prevent page shift when overlay opens by compensating for scrollbar
    useEffect(() => {
        if (isOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormState('SENDING');

        const formData = new FormData(e.currentTarget);
        formData.append('access_key', 'bbb4bf84-7363-4a1d-8e23-28db67f710b1');
        formData.append('subject', subject);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                setFormState('SUCCESS');
            } else {
                setFormState('ERROR');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setFormState('ERROR');
        }
    };

    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
            <div
                className={`absolute right-0 top-0 h-full w-full md:w-[60vw] lg:w-[50vw] bg-[#050505] border-l border-white/10 shadow-2xl transform transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex justify-end border-b border-white/20 p-4 md:p-6">
                    <button onClick={onClose} className="group flex items-center gap-3 text-neutral-400 hover:text-white">
                        <span className="border border-white/20 p-2 group-hover:bg-white group-hover:text-black transition">
                            <X size={20} />
                        </span>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    <div className="flex-1 p-6 md:p-8 lg:p-12 pb-32 overflow-y-auto flex items-start justify-center">
                        {formState === 'SUCCESS' ? (
                            <div className="text-center space-y-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 border border-green-500/30 rounded-full text-green-500 bg-green-500/5">
                                    <CheckCircle2 size={40} />
                                </div>
                                <div>
                                    <h3 className="text-3xl">Transmission Complete</h3>
                                    <p className="font-mono text-sm text-neutral-500">We’ve received your message.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 border border-white/20 font-mono text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-black transition"
                                >
                                    Close Interface
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="w-full max-w-4xl space-y-4 md:space-y-6">
                                <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="block font-mono text-xs text-neutral-500 mb-1">
                                            [01] IDENTIFIER / NAME
                                        </label>
                                        <input name="name" className="w-full border-b border-white/20 bg-transparent pt-0 pb-1 md:pb-2 text-base md:text-lg placeholder-neutral-700 focus:border-white outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block font-mono text-xs text-neutral-500 mb-1">
                                            [02] FREQUENCY / EMAIL
                                        </label>
                                        <input name="email" type="email" className="w-full border-b border-white/20 bg-transparent pt-0 pb-1 md:pb-2 text-base md:text-lg placeholder-neutral-700 focus:border-white outline-none font-mono" required />
                                    </div>
                                </div>

                                <div className="relative z-10 full-width">
                                    <label className={`block font-mono text-xs mb-1 ${dropdownOpen ? 'text-white' : 'text-neutral-500'}`}>
                                        [03] SUBJECT
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className={`w-full flex justify-between items-center border-b pt-0 pb-1 md:pb-2 text-sm md:text-base ${dropdownOpen ? 'border-white' : 'border-white/20 hover:border-white/50'}`}
                                    >
                                        <span>{subject}</span>
                                        <CornerDownRight size={16} className={`transition ${dropdownOpen ? 'text-white' : 'text-neutral-600'}`} />
                                    </button>
                                    {dropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                            <div className="absolute left-0 right-0 top-full bg-[#0A0A0A] border-x border-b border-white/20 max-h-60 overflow-y-auto z-20">
                                                {subjects.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => {
                                                            setSubject(opt);
                                                            setDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 border-b border-white/10 text-sm ${subject === opt ? 'bg-white/5 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-mono text-xs text-neutral-500 mb-1">
                                        [04] MESSAGE
                                    </label>
                                    <textarea name="message" rows={3} className="w-full border-b border-white/20 bg-transparent pt-0 pb-1 md:pb-2 text-base md:text-lg placeholder-neutral-700 focus:border-white outline-none resize-none md:h-56" required />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={formState === 'SENDING'}
                                        className={`relative px-12 py-4 font-mono text-xs tracking-[0.3em] uppercase disabled:opacity-50 transition-all duration-300 group overflow-hidden ${formState === 'SENDING'
                                            ? 'bg-neutral-800 text-white'
                                            : 'bg-white text-black hover:bg-neutral-200'
                                            }`}
                                    >
                                        <span className="relative z-10">
                                            {formState === 'SENDING' ? 'SENDING...' : 'SEND'}
                                        </span>
                                        {/* Hover effect overlay */}
                                        <div className="absolute inset-0 bg-neutral-200 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0 -z-0" />

                                        {/* Border decoration */}
                                        <span className="absolute -right-2 -bottom-2 w-full h-full border border-white/30 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300" />
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
