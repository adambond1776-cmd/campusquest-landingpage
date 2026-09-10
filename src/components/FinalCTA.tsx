import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';

export default function FinalCTA() {
  return (
    <section className="py-20 lg:py-28 bg-cream-50">
      <div className="max-w-content mx-auto px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-8 py-16 lg:px-16 lg:py-20 text-center">
          {/* Background accents */}
          <div className="absolute inset-0">
            <div className="absolute -top-20 -left-10 w-[300px] h-[300px] rounded-full bg-white/10 blur-[80px]" />
            <div className="absolute -bottom-20 -right-10 w-[400px] h-[400px] rounded-full bg-brand-800/30 blur-[100px]" />
          </div>

          <div className="relative">
            <div className="mb-6">
              <Logo size={64} className="mx-auto ring-2 ring-white/20" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white text-balance max-w-2xl mx-auto">
              Your next favorite thing on campus is one tap away
            </h2>

            <p className="mt-5 text-lg text-white/70 max-w-xl mx-auto">
              Join the pilot at URI. Browse free, upgrade from $3/month, and
              change how you experience college.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white text-brand-700 font-bold text-sm transition-all duration-200 hover:bg-cream-100 hover:-translate-y-0.5 shadow-lift"
              >
                Start browsing free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#students"
                className="btn-ghost-light"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
