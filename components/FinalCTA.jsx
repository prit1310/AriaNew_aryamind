export default function FinalCTA() {
    return (
      <section
        className="py-20 bg-gradient-to-br from-[hsl(220,87%,56%)] to-[hsl(264,89%,60%)] text-white"
        data-animate
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to build your AI workforce?
          </h3>
  
          <p className="text-xl mb-10 opacity-90">
            Join thousands of companies already transforming their operations with AI agents.
          </p>
  
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Start for Free */}
            <a
              href="https://app.relevanceai.com/auth"
              className="text-lg px-8 py-4 rounded-md font-medium bg-white text-[#2563EB] hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 text-center"
            >
              Start for Free
            </a>
  
            {/* Book a Demo */}
            <a
              href="https://relevanceai.com/book-a-demo"
              className="text-lg px-8 py-4 rounded-md font-medium bg-white text-[#2563EB] hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 text-center"
            >
              Book a Demo
            </a>
          </div>
        </div>
      </section>
    );
  }  