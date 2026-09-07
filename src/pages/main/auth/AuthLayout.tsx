import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
    return (
        <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white font-sans overflow-hidden">
            
            {/* UPANDE WA KUSHOTO: Minimalist Visual / Brand Showcase */}
            <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-zinc-900 text-zinc-100 flex-col justify-between p-12 relative overflow-hidden">
                
                {/* Subtle abstract background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                
                {/* Brand Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white text-zinc-900 flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
                        E
                    </div>
                    <span className="font-semibold text-sm tracking-wide text-zinc-200">EduAsas</span>
                </div>

                {/* Central minimalist value proposition with AI Badge */}
                <div className="relative z-10 max-w-lg my-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/90 border border-zinc-700/60 text-zinc-200 text-xs font-medium tracking-wide shadow-sm">
                        {/* Shimmering AI Icon */}
                        <svg className="w-3.5 h-3.5 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span>AI-Powered Academic Intelligence</span>
                    </div>
                    <h1 className="text-3xl xl:text-4xl font-semibold tracking-tight text-white leading-snug">
                        Orchestrate your institution with absolute precision.
                    </h1>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                        A high-performance workspace driven by intelligent automation to streamline school operations, student tracking, and administrative workflows seamlessly.
                    </p>
                </div>

                {/* Footer metadata updated */}
                <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500 font-medium">
                    <span>&copy; {new Date().getFullYear()} EduAsas. All rights reserved.</span>
                    <span className="text-zinc-400 font-semibold tracking-wide">Powered by Rollboy Services</span>
                </div>
            </div>

            {/* UPANDE WA KULIA: Form Area with Top Navbar */}
            <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-between min-h-screen lg:h-screen bg-white">
                
                {/* Navbar ya Juu kwenye upande wa fomu (Visible kwenye mobile na desktop) */}
                <div className="flex items-center justify-between px-6 lg:px-12 h-16 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                            E
                        </div>
                        <span className="font-semibold text-sm text-zinc-900 tracking-tight">EduAsas Portal</span>
                    </div>
                    <div className="text-xs text-zinc-500 font-medium hidden sm:block">
                        Secure Authentication
                    </div>
                </div>

                {/* Form Container */}
                <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-10 overflow-y-auto">
                    <div className="w-full max-w-sm">
                        <Outlet />
                    </div>
                </div>

                {/* Minimalist Footer */}
                <div className="py-4 px-6 text-center text-xs text-zinc-400 border-t border-zinc-50 flex items-center justify-center gap-4">
                    <span className="hover:text-zinc-600 transition-colors cursor-pointer">Privacy</span>
                    <span>&bull;</span>
                    <span className="hover:text-zinc-600 transition-colors cursor-pointer">Terms</span>
                    <span>&bull;</span>
                    <span className="hover:text-zinc-600 transition-colors cursor-pointer">Help Center</span>
                </div>
            </div>

        </div>
    );
};

export default AuthLayout;