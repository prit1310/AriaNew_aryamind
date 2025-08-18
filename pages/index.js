import { useEffect } from "react";
import AIWorkforce from "@/components/AIWorkforce";
import CustomerStories from "@/components/CustomerStories";
import EnterpriseAgents from "@/components/EnterpriseAgents";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import Header from "@/components/header";
import Hero from "@/components/hero";
import Templates from "@/components/Templates";
import WhoItsFor from "@/components/WhoItsFor";
import Hero1 from "@/components/hero1";

export default function Home() {
  useEffect(() => {
    // Setup intersection observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);

    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="scroll-smooth">
        <Header />
        <main>
          <Hero />
          <Hero1 />
          <WhoItsFor />
          <CustomerStories />
          <EnterpriseAgents />
          <AIWorkforce />
          <Templates />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  );
}