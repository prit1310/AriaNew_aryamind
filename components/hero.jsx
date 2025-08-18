import { ChevronRight} from "lucide-react";

export default function Hero() {

  return (
    <section className="hero-gradient py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center" data-animate>
          {/* AI Ops Bootcamp Notification */}
          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full mb-8 border border-blue-200">
            <span className="text-sm font-medium">AI Ops Bootcamp</span>
            <a
              href="#bootcamp"
              className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center"
            >
              Apply Now
              <ChevronRight className="ml-1 h-3 w-3" />
            </a>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
            Build teams of AI agents that deliver human-quality work
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            Ops teams can build and manage an entire AI workforce in one powerful visual platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              href="#signup"
              className="text-lg px-8 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Try for free
            </button>
            <button
              href="#demo"
              className="text-lg px-8 py-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 font-medium transition-colors"
            >
              Request a demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}