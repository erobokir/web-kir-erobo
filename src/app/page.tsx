import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import JourneyTimeline from "@/components/JourneyTimeline";
import Divisions from "@/components/Divisions";
import Achievements from "@/components/Achievements";
import Gallery from "@/components/Gallery";
import Structure from "@/components/Structure";
import Faq from "@/components/Faq";
import JoinCta from "@/components/JoinCta";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <JourneyTimeline />
        <Divisions />
        <Achievements />
        <Gallery />
        <Structure />
        <Faq />
        <JoinCta />
      </main>
      <Footer />
    </>
  );
}
