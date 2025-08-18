import React, { useState } from "react";
import { Search, TrendingUp, Headphones } from "lucide-react";

export default function Templates() {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "View all" },
    { id: "research", label: "Research" },
    { id: "marketing", label: "Marketing" },
    { id: "support", label: "Support" },
    { id: "sales", label: "Sales" },
    { id: "operations", label: "Operations" },
  ];

  const templates = [
    {
      icon: Search,
      iconColor: "blue",
      author: "Bedi, RevOps",
      title: "Apla, the Prospect Researcher",
      tools: 5,
      category: "research",
      url: "#",
    },
    {
      icon: TrendingUp,
      iconColor: "green",
      author: "Scott, Head of Growth",
      title: "Lima, the Lifecycle Marketer",
      tools: 5,
      category: "marketing",
      url: "#",
    },
    {
      icon: Search,
      iconColor: "purple",
      author: "AI Jason, Youtuber",
      title: "Elli, the Enrichment Agent",
      tools: 5,
      category: "research",
      url: "#",
    },
    {
      icon: Headphones,
      iconColor: "yellow",
      author: "Dan (Palmer), Founder",
      title: "Suni, the Intercom Support Agent",
      tools: 5,
      category: "support",
      url: "#",
    },
  ];

  const getIconColorClass = (color) => {
    const colorMap = {
      blue: "text-blue-600 bg-blue-100",
      green: "text-green-600 bg-green-100",
      purple: "text-purple-600 bg-purple-100",
      yellow: "text-yellow-600 bg-yellow-100",
    };
    return colorMap[color] || "text-blue-600 bg-blue-100";
  };

  const filteredTemplates =
    activeCategory === "all"
      ? templates
      : templates.filter((template) => template.category === activeCategory);

  return (
    <section className="py-20 bg-white" data-animate>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Get started right now with our expert-designed templates
          </h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            No need to start from scratch. Get inspired by 100+ templates and customize them to match the way you work.
          </p>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`font-medium px-4 py-2 rounded-md border transition-colors ${
                activeCategory === category.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Template Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((template, index) => (
            <div
              key={index}
              className="rounded-lg border bg-white hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              <div className="p-6 flex flex-col h-full">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${getIconColorClass(
                    template.iconColor
                  )}`}
                >
                  <template.icon className="h-5 w-5" />
                </div>

                {/* Author */}
                <p className="text-sm text-gray-600 mb-1">{template.author}</p>

                {/* Title */}
                <h4 className="font-semibold text-base mb-1 line-clamp-2 min-h-[3rem]">
                  {template.title}
                </h4>

                {/* Tools */}
                <p className="text-sm text-gray-500 mb-4">+ {template.tools} tools</p>

                {/* CTA */}
                <div className="mt-auto">
                  <a
                    href={template.url}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md font-medium bg-gray-300 text-black hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Clone
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}