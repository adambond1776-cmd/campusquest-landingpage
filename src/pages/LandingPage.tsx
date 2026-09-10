import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import InterestMatcher from '@/components/interest/InterestMatcher';
import Problem from '@/components/Problem';
import ForStudents from '@/components/ForStudents';
import ForOrganizations from '@/components/ForOrganizations';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <InterestMatcher />
        <Problem />
        <ForStudents />
        <ForOrganizations />
        <HowItWorks />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
