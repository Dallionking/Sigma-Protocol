import { HeroSection } from '@/components/HeroSection';
import { FeatureHighlights } from '@/components/FeatureHighlights';
import { WorkflowVisualization } from '@/components/WorkflowVisualization';
import { TrustSignals } from '@/components/TrustSignals';
import { QuickStart } from '@/components/QuickStart';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeatureHighlights />
      <WorkflowVisualization />
      <TrustSignals />
      <QuickStart />
      <Footer />
    </main>
  );
}
