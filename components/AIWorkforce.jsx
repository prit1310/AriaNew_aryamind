import React from "react";
import { CheckCircle, Bot } from "lucide-react";

export default function AIWorkforce() {
  const agents = [
    {
      title: "AI BDR Agent",
      image:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      alt: "AI BDR agent interface showing sales automation and lead management",
      features: [
        "Engages leads instantly. Drives pipeline 24/7",
        "Adapts to any sales motion. Fits any playbook",
        "Automates research, follow-ups, and CRM updates—effortlessly",
      ],
      benefits: [
        { title: "No cold leads", subtitle: "Every follow-up handled" },
        { title: "Speed to lead", subtitle: "Instant, every time" },
      ],
      url: "#bosh-sales-agent",
      reverse: false,
    },
    {
      title: "AI Research Agent",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      alt: "AI research agent dashboard displaying data analysis and insights",
      features: [
        "AI handles your research, so you don't have to",
        "Every call is fully prepped with the right insights",
        "Customize exactly how you need it",
        "Adapts to any sales motion. Fits any playbook",
      ],
      benefits: [
        {
          title: "Instant research",
          subtitle:
            "Get insights in minutes. Every call, fully prepped. Increase in sales call effectiveness.",
        },
      ],
      url: "#apla-your-ai-account-research-agent",
      reverse: true,
    },
    {
      title: "Build Your Own Custom Agent",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      alt: "Custom AI agent builder interface with drag-and-drop functionality",
      features: [
        "No coding required",
        "Complete tasks on autopilot",
        "Integrate with your tech stack",
        "Learns your processes",
        "Equipped with AI Tools that give them abilities",
      ],
      providers: ["OpenAI", "Google AI", "Meta AI", "Anthropic"],
      url: "#custom-agent-builder",
      reverse: false,
    },
  ];

  return (
    <section className="py-20 bg-gray-50" data-animate>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-center mb-4">
          <Bot className="text-[#2563EB] h-8 w-8 mr-4" />
          <h2 className="text-sm font-semibold text-[#2563EB] uppercase tracking-wide">
            Building an AI workforce
          </h2>
        </div>

        <h3 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Recruit enterprise-grade AI agents today—fully customizable
        </h3>

        <div className="space-y-20">
          {agents.map((agent, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                agent.reverse ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image */}
              <div className={agent.reverse ? "order-2 lg:order-1" : ""}>
                <img
                  src={agent.image}
                  alt={agent.alt}
                  className="w-full rounded-2xl shadow-2xl"
                />
              </div>

              {/* Content */}
              <div className={agent.reverse ? "order-1 lg:order-2" : ""}>
                <h4 className="text-3xl font-bold mb-6">{agent.title}</h4>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {agent.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Benefits */}
                {agent.benefits && (
                  <div
                    className={`mb-8 ${
                      agent.benefits.length > 1
                        ? "grid grid-cols-2 gap-6"
                        : ""
                    }`}
                  >
                    {agent.benefits.map((benefit, benefitIndex) => (
                      <div
                        key={benefitIndex}
                        className="bg-white p-4 rounded-lg shadow"
                      >
                        <h5 className="font-semibold text-gray-800 mb-2">
                          {benefit.title}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {benefit.subtitle}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* LLM Providers */}
                {agent.providers && (
                  <div className="mb-8">
                    <h5 className="font-semibold text-gray-800 mb-4">
                      Switch between top LLM providers:
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      {agent.providers.map((provider, providerIndex) => (
                        <span
                          key={providerIndex}
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-white shadow"
                        >
                          {provider}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <a
                  href={agent.url}
                  className="text-[#2563EB] hover:text-brand-dark-blue font-semibold"
                >
                  Learn more →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}