import { Hero } from './components/Hero';
import { ValueProps } from './components/ValueProps';
import { FeaturedTemplates } from './components/FeaturedTemplates';
import { FeaturedResources } from './components/FeaturedResources';
import { FinalCTA } from './components/FinalCTA';

/**
 * Public marketing landing page — rendered at `/` for everyone
 * (visitors AND authenticated users). The dashboard is reachable from
 * the account dropdown menu in the navbar (see `AuthControl`), so
 * removing the auth-redirect at `/` doesn't lose any functionality.
 *
 * Layout: hero → value props → featured templates → featured resources
 * → final CTA. Each section owns its own vertical rhythm so the page
 * reads as five distinct beats rather than one endless scroll.
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <ValueProps />
      <FeaturedTemplates />
      <FeaturedResources />
      <FinalCTA />
    </div>
  );
}