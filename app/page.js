import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import SocialFeedPreview from '@/components/SocialFeedPreview';
import HowItWorks from '@/components/HowItWorks';
import Impact from '@/components/Impact';
import DownloadCTA from '@/components/DownloadCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SocialFeedPreview />
        <Features />
        <HowItWorks />
        <Impact />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}
