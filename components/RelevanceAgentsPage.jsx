import React from "react";
import { Bot, Wrench, Clock, MessageCircle } from "lucide-react";

const Section = ({ id, className = "", children }) => (
    <section id={id} className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
        {children}
    </section>
);

const Pill = ({ children }) => (
    <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1">
        {children}
    </span>
);

const CheckItem = ({ children }) => (
    <div className="flex items-start gap-3">
        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0L3.293 9.957a1 1 0 111.414-1.414l3.043 3.043 6.543-6.543a1 1 0 011.414 0z"
                    clipRule="evenodd"
                />
            </svg>
        </span>
        <p className="text-gray-800">{children}</p>
    </div>
);

const CtaButton = ({ variant = "primary", className = "", children, ...props }) => {
    const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition";
    const styles =
        variant === "primary"
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-white text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50";
    return (
        <button className={`${base} ${styles} ${className}`} {...props}>
            {children}
        </button>
    );
};

const FeatureCard = ({ title, desc }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
        {desc && <p className="mt-2 text-sm text-gray-600">{desc}</p>}
    </div>
);

const FeatureCard1 = ({ image, title, desc }) => (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col text-center">
        <div
            className="w-full h-48 bg-center bg-cover"
            style={{ backgroundImage: `url(${image})` }}
        ></div>
        <div className="p-6 flex flex-col items-center">
            <h4 className="text-base font-semibold text-gray-900 my-3">{title}</h4>
            {desc && <p className="text-sm text-gray-600">{desc}</p>}
        </div>
    </div>
);

const FeatureCard2 = ({ icon, title, desc }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col items-start">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4">
            {icon}
        </div>
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
        {desc && <p className="mt-2 text-sm text-gray-600">{desc}</p>}
    </div>
);

const IntegrationsGrid = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard title="Integrations" desc="Connect 1,000+ tools and databases with pre-built connectors." />
        <FeatureCard title="AI Workforce" desc="Build teams of specialized AI agents for business operations." />
        <FeatureCard title="AI Tools" desc="Give agents skills like APIs, data processing, and automation." />
    </div>
);

const Hero = () => (
    <Section className="pt-14 pb-10">
        <div className="text-center">
            <Pill>Create your own AI agent teammate</Pill>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Build, train, and onboard <br /> an AI agent to your team
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                No coding required. Easily teach, train, and customize AI agents for your business.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
                <CtaButton>Build your first agent</CtaButton>
                <CtaButton variant="secondary">Talk to a Rep</CtaButton>
            </div>
        </div>
    </Section>
);

const SellingPoints = () => (
    <Section className="py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard1 image="/images/point1.png" title="No coding required" desc="Easily build workflows without writing a single line of code." />
            <FeatureCard1 image="/images/point2.png" title="Integrate with your tech stack" desc="Seamlessly connect with the tools you already use." />
            <FeatureCard1 image="/images/point3.png" title="Teach your processes" desc="Train the AI to understand your unique workflows." />
            <FeatureCard1 image="/images/point4.png" title="Templates to get started" desc="Kickstart your setup with ready-made templates." />
            <FeatureCard1 image="/images/point5.png" title="Give your AI Agents skills" desc="Empower your agents with specialized capabilities." />
            <FeatureCard1 image="/images/point6.png" title="LLM agnostic" desc="Compatible with any large language model you choose." />
        </div>
    </Section>
);

const HowItWorks = () => (
    <Section className="py-12">
        <div className="rounded-2xl bg-gray-50 p-8 ring-1 ring-inset ring-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
            <p className="mt-2 text-gray-600">Relevance AI makes no-code AI agent development simple.</p>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <FeatureCard2 icon={<Bot className="w-5 h-5" />} title="Create an Agent" desc="Spin up a new agent using templates or from scratch." />
                <FeatureCard2 icon={<Wrench className="w-5 h-5" />} title="Add Skills / AI Tools" desc="Drag-and-drop prebuilt skills like API calls and data processing." />
                <FeatureCard2 icon={<Clock className="w-5 h-5" />} title="Set Triggers" desc="Define when skills should activate, e.g., on specific queries or events." />
                <FeatureCard2 icon={<MessageCircle className="w-5 h-5" />} title="Talk to Your Agent" desc="Start interacting in natural language; agents improve over time." />
            </div>
        </div>
    </Section>
);

const UseCases = () => {
    const cases = [
        { image: "/images/point1.png", title: "Customer service", desc: "Automated support and inquiry routing." },
        { image: "/images/point2.png", title: "Personal productivity", desc: "Scheduling and email management." },
        { image: "/images/point3.png", title: "Sales assistance", desc: "Lead qualification and follow-up automation." },
        { image: "/images/point4.png", title: "Research & analysis", desc: "Information gathering and report generation." },
        { image: "/images/point5.png", title: "Content creation", desc: "Drafting articles and creative content." },
        { image: "/images/point6.png", title: "IT operations", desc: "System monitoring and issue detection." },
        { image: "/images/point1.png", title: "Healthcare", desc: "Patient screening and scheduling." },
        { image: "/images/point2.png", title: "E-commerce", desc: "Recommendations and inventory support." },
    ];

    return (
        <Section className="py-12">
            <h2 className="text-2xl font-bold text-gray-900">Where AI agents are used</h2>
            <p className="mt-2 text-gray-600">
                The most successful implementations focus on specific, well-defined tasks.
            </p>

            <div className="mt-6 overflow-hidden relative">
                {/* Left & Right gradients */}
                <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent z-10" />
                <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent z-10" />

                {/* Marquee track */}
                <div className="marquee-track">
                    <div className="marquee-inner">
                        {cases.map((item, index) => (
                            <div key={`first-${index}`} className="flex-none w-64">
                                <FeatureCard1 {...item} />
                            </div>
                        ))}
                    </div>
                    <div className="marquee-inner">
                        {cases.map((item, index) => (
                            <div key={`second-${index}`} className="flex-none w-64">
                                <FeatureCard1 {...item} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>
                {`
            .marquee-track {
              display: flex;
              width: max-content;
              animation: scroll 20s linear infinite;
            }
            .marquee-inner {
              display: flex;
              gap: 1rem;
            }
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}
            </style>
        </Section>
    );
};

const IntegrationSteps = () => (
    <Section className="py-12">
        <div className="rounded-2xl bg-white p-8 ring-1 ring-inset ring-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Integrate with existing systems</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CheckItem>Identify integration points and data exchange requirements</CheckItem>
                <CheckItem>Select appropriate methods: APIs, webhooks, DB connections</CheckItem>
                <CheckItem>Establish authentication and security protocols</CheckItem>
                <CheckItem>Create data transformation logic for compatibility</CheckItem>
                <CheckItem>Set up event triggers or scheduling</CheckItem>
                <CheckItem>Implement error handling and fallback mechanisms</CheckItem>
                <CheckItem>Thoroughly test before deployment</CheckItem>
                <CheckItem>Use pre-built connectors for 1,000+ tools to simplify</CheckItem>
            </div>
        </div>
    </Section>
);

const SkillsNeeded = () => (
    <Section className="py-12">
        <h2 className="text-2xl font-bold text-gray-900">What skills are needed?</h2>
        <p className="mt-2 text-gray-600">
            No-code platforms reduce technical requirements, but conceptual understanding remains key.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CheckItem>Understanding AI concepts and capabilities</CheckItem>
            <CheckItem>Prompt engineering for LLMs</CheckItem>
            <CheckItem>Basic programming knowledge (helpful)</CheckItem>
            <CheckItem>APIs and data integration concepts</CheckItem>
            <CheckItem>UX principles for agent interfaces</CheckItem>
            <CheckItem>Problem-solving and logical thinking</CheckItem>
            <CheckItem>Domain expertise for the use case</CheckItem>
        </div>
    </Section>
);

const Measurement = () => (
    <Section className="py-12">
        <div className="rounded-2xl bg-gray-50 p-8 ring-1 ring-inset ring-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Measure performance and ROI</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CheckItem>Task completion rate and accuracy</CheckItem>
                <CheckItem>User satisfaction metrics</CheckItem>
                <CheckItem>Time savings vs. manual processes</CheckItem>
                <CheckItem>Error reduction rates</CheckItem>
                <CheckItem>Cost savings</CheckItem>
                <CheckItem>User adoption and engagement</CheckItem>
                <CheckItem>Business impact metrics specific to purpose</CheckItem>
            </div>
            <p className="mt-4 text-sm text-gray-600">
                Establish baselines, then track improvements over time; use built-in analytics or custom tracking.
            </p>
        </div>
    </Section>
);

const PricingCta = () => (
    <Section className="py-12">
        <div className="rounded-2xl bg-indigo-50 p-8 ring-1 ring-inset ring-indigo-200">
            <h2 className="text-2xl font-bold text-gray-900">Get started free</h2>
            <p className="mt-2 text-gray-700">
                Free to sign up with limited credits and features. Check the pricing page for details.
            </p>
            <div className="mt-6 flex gap-3">
                <CtaButton>Build your first agent</CtaButton>
                <CtaButton variant="secondary">Learn new skills</CtaButton>
            </div>
        </div>
    </Section>
);

const Comparison = () => (
    <Section className="py-12">
        <h2 className="text-2xl font-bold text-gray-900">Custom vs. Pre-built AI agents</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900">Custom AI agents</h3>
                <p className="mt-2 text-gray-700">
                    Designed for unique use cases; complete control over functionality, behavior, and integrations.
                </p>
                <ul className="mt-4 space-y-2 text-gray-700">
                    <li>• Maximum flexibility and precision</li>
                    <li>• Higher development effort</li>
                    <li>• Best fit for complex or proprietary workflows</li>
                </ul>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900">Pre-built AI agents</h3>
                <p className="mt-2 text-gray-700">
                    Ready-made solutions for common use cases like support or analysis; fast and cost-effective.
                </p>
                <ul className="mt-4 space-y-2 text-gray-700">
                    <li>• Faster to deploy</li>
                    <li>• Lower cost</li>
                    <li>• Less customization and potential integration limits</li>
                </ul>
            </div>
        </div>
    </Section>
);

const FAQs = () => {
    const faqs = [
        {
            q: "What are AI agents?",
            a: (
                <>
                    AI agents are autonomous software programs that perform tasks, make decisions,
                    and interact with users or systems using AI capabilities like NLP, machine learning,
                    and decision-making, adapting and learning over time.
                </>
            )
        },
        {
            q: "How do I build an agent on Relevance AI?",
            a: (
                <>
                    Create an agent, add Skills/AI Tools, set Triggers, then talk to your agent;
                    it improves with more conversations.
                </>
            )
        },
        {
            q: "Who is Relevance AI for?",
            a: <>Teams that want no-code tools, templates, and pre-built components to create agents without developers.</>
        },
        {
            q: "What does it cost?",
            a: <>View pricing for details; free sign-up with limited credits and features.</>
        }
    ];

    return (
        <Section className="py-12">
            <div className="rounded-2xl bg-white p-8 ring-1 ring-inset ring-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">FAQs</h2>
                <p className="mt-2 text-gray-600">
                    Can’t find the answer here? Contact our support team.
                </p>
                <div className="mt-6 divide-y divide-gray-200">
                    {faqs.map((f, i) => (
                        <details key={i} className="group py-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between">
                                <span className="text-base font-medium text-gray-900">{f.q}</span>
                                <span className="ml-4 text-gray-500 transition group-open:rotate-180">
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </span>
                            </summary>
                            <div className="mt-2 text-gray-700">{f.a}</div>
                        </details>
                    ))}
                </div>
            </div>
        </Section>
    );
};

const DiscoverMore = () => (
    <Section className="py-12">
        <h2 className="text-2xl font-bold text-gray-900">Discover more features to unlock your AI workforce</h2>
        <p className="mt-2 text-gray-600">Find the right feature to build your AI workforce.</p>
        <div className="mt-6">
            <IntegrationsGrid />
        </div>
    </Section>
);

const FinalCTA = () => (
    <Section className="py-16">
        <div className="rounded-2xl bg-gray-900 p-10 text-center text-white">
            <h2 className="text-3xl font-bold">Ready to take the next step with Relevance?</h2>
            <p className="mt-2 text-gray-300">Everything needed to get started, free to try.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
                <CtaButton className="">Build your first agent</CtaButton>
                <CtaButton variant="secondary" className="">
                    Learn new skills
                </CtaButton>
                <CtaButton variant="secondary" className="">
                    Talk to a Rep
                </CtaButton>
            </div>
        </div>
    </Section>
);

const RelevanceAgentsPage = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            <main>
                <Hero />
                <SellingPoints />
                <div id="how">
                    <HowItWorks />
                </div>
                <div id="use-cases">
                    <UseCases />
                </div>
                <div id="integrations">
                    <IntegrationSteps />
                </div>
                <Comparison />
                <SkillsNeeded />
                <Measurement />
                <PricingCta />
                <DiscoverMore />
                <div id="faqs">
                    <FAQs />
                </div>
                <FinalCTA />
            </main>
        </div>
    );
};

export default RelevanceAgentsPage;