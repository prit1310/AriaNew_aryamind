export default function Footer() {
    const functionLinks = [
      { label: "AI BDR Agent", href: "/bosh-sales-agent" },
      { label: "AI Research Agent", href: "/apla-your-ai-account-research-agent" },
      { label: "Custom Agent Builder", href: "/agents" },
      { label: "AI Tools", href: "/tools" },
      { label: "Templates", href: "/templates" },
      { label: "Integrations", href: "/integrations" },
    ];
    const productLinks = [
      { label: "Platform", href: "/platform" },
      { label: "AI Agents", href: "/agents" },
      { label: "Workflows", href: "/workflows" },
      { label: "Enterprise", href: "/enterprise" },
      { label: "Pricing", href: "/pricing" },
      { label: "What's New", href: "/updates" },
    ];
    const supportLinks = [
      { label: "Help Center", href: "/help" },
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
      { label: "Community", href: "/community" },
      { label: "Status", href: "/status" },
      { label: "Contact Support", href: "/support" },
    ];
    const legalLinks = [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "GDPR", href: "/gdpr" },
      { label: "Security", href: "/security" },
      { label: "Compliance", href: "/compliance" },
    ];
    const companyLinks = [
      { label: "About Us", href: "/about" },
      { label: "Customers", href: "/customers" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Partners", href: "/partners" },
      { label: "Contact", href: "/contact" },
    ];
    const learnLinks = [
      { label: "Blog", href: "/blog" },
      { label: "AI Ops Bootcamp", href: "/ai-ops-bootcamp" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Webinars", href: "/webinars" },
      { label: "Guides", href: "/guides" },
      { label: "Resources", href: "/resources" },
    ];
  
    return (
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  
          {/* Top Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-8 mb-12">
            {/* Company Info */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2">
              <div className="text-2xl font-bold text-white mb-6">Arya AI</div>
              <p className="text-gray-400 mb-6 max-w-md">
                Build teams of AI agents that deliver human-quality work. Transform your operations with intelligent automation.
              </p>
              <div className="flex space-x-4">
                {/* Twitter */}
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775..."/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328..."/>
                  </svg>
                </a>
                {/* GitHub */}
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12..."/>
                  </svg>
                </a>
              </div>
            </div>
  
            {/* Function */}
            <FooterLinks title="Function" links={functionLinks} />
            {/* Product */}
            <FooterLinks title="Product" links={productLinks} />
            {/* Support */}
            <FooterLinks title="Support" links={supportLinks} />
            {/* Legal */}
            <FooterLinks title="Legal" links={legalLinks} />
            {/* Company */}
            <FooterLinks title="Company" links={companyLinks} />
            {/* Learn */}
            <FooterLinks title="Learn" links={learnLinks} />
          </div>
  
          {/* Newsletter Signup */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <div className="max-w-md">
              <h4 className="font-semibold text-white mb-4">Stay updated</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-10 px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-l-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <button
                  className="px-4 py-2 bg-brand-blue text-white rounded-r-md hover:bg-brand-dark-blue transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
  
          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2024 Relevance AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  
  // Small helper for link sections
  function FooterLinks({ title, links }) {
    return (
      <div>
        <h4 className="font-semibold text-white mb-4">{title}</h4>
        <ul className="space-y-3">
          {links.map((link, i) => (
            <li key={i}>
              <a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }  