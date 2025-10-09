import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhyMXRP from "@/components/WhyMXRP";
import ServersSection from "@/components/ServersSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/Banner.webp')",
        }}
      />

      {/* Dark overlay for better text readability */}
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50" />

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <WhyMXRP />
          <ServersSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
