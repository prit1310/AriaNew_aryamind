import { Bot, Search, Code, ArrowRight } from "lucide-react";

export default function EnterpriseAgents() {
  const agents = [
    {
      title: "AI BDR Agent",
      icon: Bot,
      features: [
        "Engages leads instantly. Drives pipeline 24/7",
        "Adapts to any sales motion. Fits any playbook",
        "Automates research, follow-ups, and CRM updates—effortlessly",
      ],
      benefits: [
        { label: "No cold leads", description: "Every follow-up handled" },
        { label: "Speed to lead", description: "Instant, every time" },
        { label: "Sell more, less admin", description: "AI takes care of the rest" },
        { label: "Custom workflows", description: "Built for complexity" },
        { label: "Seamless integration", description: "Works where you work" },
      ],
      ctaText: "Learn more",
      ctaLink: "/bosh-sales-agent",
      image:
        "https://cdn.prod.website-files.com/636cad09a1159553a45e8ba1/67a003fbafe375c88c0a9975_bosh-agent.jpg",
      bgColor: "bg-blue-50",
    },
    {
      title: "AI Research Agent",
      icon: Search,
      features: [
        "AI handles your research, so you don't have to",
        "Every call is fully prepped with the right insights",
        "Customize exactly how you need it",
        "Adapts to any sales motion. Fits any playbook",
      ],
      benefits: [
        { label: "Instant research", description: "Get insights in minutes" },
        { label: "Every call, fully prepped", description: "Increase in sales call effectiveness" },
      ],
      ctaText: "Learn more",
      ctaLink: "/apla-your-ai-account-research-agent",
      image:
        "https://cdn.prod.website-files.com/636cad09a1159553a45e8ba1/67a00408527ef28525f22f63_apla-agent.jpg",
      bgColor: "bg-green-50",
    },
    {
      title: "Build Your Own Custom Agent",
      icon: Code,
      features: [
        "No coding required",
        "Complete tasks on autopilot",
        "Integrate with your tech stack",
        "Learns your processes",
        "Equipped with AI Tools that give them abilities",
      ],
      llmProviders: [
        {
          name: "OpenAI",
          logo:
            "https://cdn.prod.website-files.com/636cad09a1159553a45e8ba1/679afa3cbc9735fa8598b67c_openai.svg",
        },
        {
          name: "Google AI",
          logo:
            "https://cdn.prod.website-files.com/636cad09a1159553a45e8ba1/679afa3cc91719e66b1696ad_google-ai.svg",
        },
        {
          name: "Meta AI",
          logo:
            "https://cdn.prod.website-files.com/636cad09a1159553a45e8ba1/679afa3c57871b61b3eb84c9_meta-ai.svg",
        },
        {
          name: "Anthropic",
          logo:
            "https://cdn.prod.website-files.com/636cad09a1159553a45e8ba1/679afa3c5f31cf9bb5e29057_anthropic.svg",
        },
      ],
      ctaText: "Learn more",
      ctaLink: "#custom-agent",
      image:
        "https://cdn.prod.website-files.com/636cad09a1159553a45e8ba1/67a00413abc45b4c90e5f8c0_byo-agent.jpg",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-sm font-semibold text-blue-600 mb-4">Building an AI workforce</h2>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Recruit enterprise-grade AI agents today—fully customizable
          </h1>
        </div>

        {/* Agent Cards */}
        <div className="space-y-16">
          {agents.map((agent, index) => (
            <div key={index} className={`${agent.bgColor} rounded-3xl p-8 md:p-12`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Content */}
                <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="flex items-center mb-6">
                    <agent.icon className="h-8 w-8 text-gray-700 mr-3" />
                    <h3 className="text-3xl font-bold">{agent.title}</h3>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {agent.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <span className="text-blue-600 mr-3 mt-1">•</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Benefits */}
                  {agent.benefits && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {agent.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="bg-white/50 rounded-lg p-4">
                          <div className="font-semibold text-gray-900 mb-1">{benefit.label}</div>
                          <div className="text-sm text-gray-600">{benefit.description}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* LLM Providers */}
                  {agent.llmProviders && (
                    <div className="mb-8">
                      <p className="font-semibold text-gray-900 mb-4">
                        Switch between top LLM providers:
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {agent.llmProviders.map((provider, providerIndex) => (
                          <img
                            key={providerIndex}
                            src={provider.logo}
                            alt={provider.name}
                            className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA Button (Tailwind-styled link) */}
                  <a
                    href={agent.ctaLink}
                    className="inline-flex items-center bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    {agent.ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>

                {/* Image */}
                <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="relative">
                    <img
                      src={agent.image}
                      alt={agent.title}
                      className="w-full h-auto rounded-2xl shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}