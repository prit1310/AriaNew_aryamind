import { Star, ArrowRight } from "lucide-react";

export default function CustomerStories() {
  const stories = [
    {
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      alt: "Business professional reviewing AI analytics dashboard",
      company: "Send Payments",
      title: "Inside Send Payments' AI-First Strategy",
      url: "#customers/send-payments"
    },
    {
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      alt: "Business team collaborating using AI-powered workspace",
      company: "Qualified",
      title: "How Qualified Scaled with an AI Workforce of 35+ Agents",
      url: "#customers/qualified"
    },
    {
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      alt: "Modern office environment showcasing AI integration",
      company: "SafetyCulture",
      title: "SafetyCulture recruited an AI Agent and 3x'd meetings",
      url: "#customers/safetyculture"
    },
  ];

  return (
    <section className="py-20 bg-white" data-animate>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section header */}
        <div className="flex items-center justify-center mb-4">
          <Star className="text-[#2563EB] h-8 w-8 mr-4" />
          <h2 className="text-sm font-semibold text-[#2563EB] uppercase tracking-wide">
            Customers
          </h2>
        </div>

        <h3 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Building their AI Workforce
        </h3>

        <div className="text-center mb-16">
          <a 
            href="#customers" 
            className="text-[#2563EB] hover:text-brand-dark-blue font-semibold inline-flex items-center"
          >
            Customer Stories
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </div>

        {/* Stories grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div 
              key={index}
              className="group hover:shadow-xl transition-shadow duration-300 overflow-hidden rounded-lg border bg-white text-gray-900 shadow-sm"
            >
              {/* Image */}
              <div className="overflow-hidden">
                <img
                  src={story.image}
                  alt={story.alt}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Card Content */}
              <div className="p-8">
                <div className="mb-4">
                  <div className="w-32 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">{story.company}</span>
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-4">{story.title}</h4>
                <a 
                  href={story.url} 
                  className="text-[#2563EB] hover:text-brand-dark-blue font-semibold inline-flex items-center"
                >
                  Read story
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}