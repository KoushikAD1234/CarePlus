import { useRef } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Subscription from "../components/Subscription";
import QueryForm from "../components/QueryForm";
import Footer from "../components/Footer";
import TrustSection from "../components/TrustSection"

export default function LandingPage() {
  // 1. Create Refs for all target sections
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const contactRef = useRef(null);
  const trustRef = useRef(null);
  const heroRef = useRef(null);

  // 2. Generic Scroll Function
  const scrollToSection = (elementRef) => {
    elementRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen transition-colors duration-500">
      {/* Pass the scroll functions to the Navbar */}
      <Navbar
        onHeroClick={() => scrollToSection(heroRef)}
        onFeaturesClick={() => scrollToSection(featuresRef)}
        onPricingClick={() => scrollToSection(pricingRef)}
        onContactClick={() => scrollToSection(contactRef)}
        onTrustClick={() => scrollToSection(trustRef)}
      />

      <div ref={heroRef} className="scroll-mt-24">
        <Hero onExploreClick={() => scrollToSection(featuresRef)} />
      </div>

      {/* Attach Refs to the actual components */}
      <div ref={featuresRef} className="scroll-mt-24">
        <Features />
      </div>

      <div ref={pricingRef} className="scroll-mt-24">
        <Subscription />
      </div>

      <div ref={trustRef} className="scroll-mt-24">
        <TrustSection />
      </div>

      <div ref={contactRef} className="scroll-mt-24">
        <QueryForm />
      </div>

      <Footer />
    </div>
  );
}
