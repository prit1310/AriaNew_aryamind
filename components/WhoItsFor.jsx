import { Users, TrendingUp, Handshake, Headphones, Settings } from "lucide-react";

export default function WhoItsFor() {
  const teams = [
    { icon: TrendingUp, name: "Marketing", delay: "0s" },
    { icon: Handshake, name: "Sales", delay: "0.2s" },
    { icon: Headphones, name: "Support", delay: "0.4s" },
    { icon: Settings, name: "Operations", delay: "0.6s" },
  ];

  return (
    <section className="py-20 bg-gray-50" data-animate>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-4">
          <Users className="text-[#2563EB] h-8 w-8 mr-4" />
          <h2 className="text-sm font-semibold text-[#2563EB] uppercase tracking-wide">
            Who&apos;s it for
          </h2>
        </div>

        <div className="text-center max-w-5xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
            Built <span className="text-[#2563EB]">for ops teams.</span> No technical background required.
          </h3>

          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            Subject-matter experts can use Relevance to design powerful AI agents without relying on developer resources. 
            Scale excellence across every area or team. With your intelligent, purpose-built AI workforce.
          </p>

          {/* Visual representation of different teams */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {teams.map((team) => (
              <div 
                key={team.name}
                className="text-center animate-float"
                style={{ animationDelay: team.delay }}
              >
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <team.icon className="text-[#2563EB] h-8 w-8" />
                </div>
                <p className="font-semibold text-gray-800">{team.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
