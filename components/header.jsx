"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, Bot, Zap, Code, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [authOverride, setAuthOverride] = useState(null); // overrides useSession status instantly
  const agentsRef = useRef(null);
  const dropdownRef = useRef(null);
  const { status, update } = useSession();
  const router = useRouter();

  const isAuthenticated = authOverride ?? (status === "authenticated");

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        agentsRef.current &&
        !agentsRef.current.contains(e.target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for cross-tab auth events
  useEffect(() => {
    const onAuthEvent = (e) => {
      if (e.data === "auth:logout") {
        setAuthOverride(false);
        update?.();
      } else if (e.data === "auth:login") {
        setAuthOverride(true);
        update?.();
      }
    };
    window.addEventListener("message", onAuthEvent);
    return () => window.removeEventListener("message", onAuthEvent);
  }, [update]);

  const revalidateSession = async () => {
    try {
      await fetch("/api/auth/session", { method: "GET", cache: "no-store" });
      await update?.();
    } catch (_) { }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setIsMenuOpen(false);
        // Instant UI change
        setAuthOverride(false);
        // Broadcast to other tabs
        window.postMessage("auth:logout", window.origin);
        // Refresh session from server
        await revalidateSession();
        // Navigate to auth page
        router.replace("/auth");
      }
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const navItemBase =
    "flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors";

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        {/* Pill container */}
        <div className="flex items-center justify-between rounded-3xl border border-gray-200 bg-white/90 backdrop-blur px-4 h-20 shadow-sm">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500" />
            <span className="text-gray-900 font-semibold">ARIA</span>
          </a>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-6 relative"
            ref={dropdownRef}
          >
            <a href="/dashboard" className={navItemBase}>
              Dashboard
            </a>
            {/* Agents dropdown */}
            <div className="relative" ref={agentsRef}>
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "agents" ? null : "agents")
                }
                className={navItemBase}
              >
                <span>Agents</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {openDropdown === "agents" && (
                <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                  <div className="space-y-2">
                    <a
                      href="/agents"
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium">AI BDR Agent</div>
                        <div className="text-sm text-gray-500">
                          Automate sales outreach and lead generation
                        </div>
                      </div>
                    </a>

                    <a
                      href="#ai-research-agent"
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">AI Research Agent</div>
                        <div className="text-sm text-gray-500">
                          Intelligent research and data analysis
                        </div>
                      </div>
                    </a>

                    <a
                      href="#custom-agent"
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Code className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Custom Agent Builder</div>
                        <div className="text-sm text-gray-500">
                          Build your own AI workforce
                        </div>
                      </div>
                    </a>

                    <div className="border-t border-gray-200 my-2" />

                    <a
                      href="#agent-templates"
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Users className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Agent Templates</div>
                        <div className="text-sm text-gray-500">
                          100+ pre-built agent templates
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Other nav items */}
            <a href="#solutions" className={navItemBase}>
              Solutions
            </a>
            <a href="/pricing" className={navItemBase}>
              Pricing
            </a>
            <a href="#resources" className={navItemBase}>
              Resources
            </a>

            {!isAuthenticated ? (
              <a
                href="/auth"
                className="rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-colors"
              >
                Login
              </a>
            ) : (
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 hover:text-gray-900"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="flex flex-col gap-3">
              <a href="/dashboard" className={navItemBase}>
                Dashboard
              </a>
              {/* Agents */}
              <div>
                <div className="text-gray-800 font-medium">Agents</div>
                <div className="pl-4 space-y-2 mt-2">
                  <a
                    href="#ai-bdr-agent"
                    className="text-gray-600 hover:text-gray-900 text-sm block"
                  >
                    AI BDR Agent
                  </a>
                  <a
                    href="#ai-research-agent"
                    className="text-gray-600 hover:text-gray-900 text-sm block"
                  >
                    AI Research Agent
                  </a>
                  <a
                    href="#custom-agent"
                    className="text-gray-600 hover:text-gray-900 text-sm block"
                  >
                    Custom Agent Builder
                  </a>
                  <a
                    href="#agent-templates"
                    className="text-gray-600 hover:text-gray-900 text-sm block"
                  >
                    Agent Templates
                  </a>
                </div>
              </div>

              <a href="#solutions" className="text-gray-600 hover:text-gray-900">
                Solutions
              </a>
              <a href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#resources" className="text-gray-600 hover:text-gray-900">
                Resources
              </a>

              {!isAuthenticated ? (
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="/auth"
                    className="ml-auto rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-white font-medium"
                  >
                    Login
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-red-600 px-4 py-2 text-white font-medium"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}