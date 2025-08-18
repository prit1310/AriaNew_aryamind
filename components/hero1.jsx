import { useState } from "react";
import { Star, CreditCard } from "lucide-react";

export default function Hero1() {
  const tabContent = [
    {
      id: "getting-started",
      label: "Getting started",
      content: (
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600"
          alt="AI workflow visualization showing connected nodes and automation"
          className="w-full h-80 object-cover rounded-xl shadow-lg"
        />
      ),
    },
    {
      id: "ai-agents",
      label: "AI Agents",
      content: (
        <img
          src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600"
          alt="AI agents management dashboard with multiple virtual assistants"
          className="w-full h-80 object-cover rounded-xl shadow-lg"
        />
      ),
    },
    {
      id: "ai-tools",
      label: "AI Tools",
      content: (
        <img
          src="https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600"
          alt="AI tools interface displaying automation and integration capabilities"
          className="w-full h-80 object-cover rounded-xl shadow-lg"
        />
      ),
    },
  ];

  const [activeTab, setActiveTab] = useState("getting-started");

  return (
    <section className="hero-gradient py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center" data-animate>

          {/* Inline Tabs */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl mx-auto">
            {/* Tab Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 border-b border-gray-200">
              {tabContent.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-semibold transition-colors relative ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="relative">
              {tabContent.map((tab) => (
                <div
                  key={tab.id}
                  className={`transition-opacity duration-300 ${
                    activeTab === tab.id
                      ? "opacity-100"
                      : "opacity-0 absolute inset-0 pointer-events-none"
                  }`}
                >
                  {tab.content}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>Free plan</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span>No card required</span>
            </div>  
          </div>
        </div>
      </div>
    </section>
  );
}