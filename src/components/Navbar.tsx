'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BrandLockup } from '@/components/Logo';
import LogoutButton from '@/components/LogoutButton';
import { getCurrentUser, type CurrentUser } from '@/lib/auth';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    getCurrentUser().then((resolved) => {
      if (active) setUser(resolved);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Absolute hrefs on the section anchors so the nav still works from a route
  // that is not the landing page.
  const links = [
    { label: 'Find Activities', href: '/activities' },
    { label: 'For Students', href: '/#students' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'For Schools', href: '/institutions' },
  ];

  return (
    <header
      className={`sticky top-0 inset-x-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? 'border-white/10 bg-brand-950/92 backdrop-blur-md'
          : 'border-white/10 bg-brand-950/80 backdrop-blur-md'
      }`}
    >
      <nav className="max-w-content mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
          <Link href="/" className="group min-w-0" onClick={() => setOpen(false)}>
            <BrandLockup size={44} />
          </Link>

          <div className="hidden xl:flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="whitespace-nowrap text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/settings"
                  className="text-sm font-semibold text-white/85 hover:text-white transition-colors px-3 py-2"
                >
                  Account
                </Link>
                <LogoutButton className="text-sm font-semibold text-white/85 hover:text-white transition-colors px-3 py-2" />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-white/90 hover:text-white transition-colors px-4 py-2"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(42,95,191,0.35)] transition-all duration-200 hover:bg-brand-400 hover:-translate-y-0.5"
                >
                  Get the app
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="xl:hidden p-2 -mr-2 text-white"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="xl:hidden pb-5 animate-fade-in">
            <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-lg text-base font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4 px-2">
                {user ? (
                  <>
                    <Link
                      href="/settings"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      Account
                    </Link>
                    <LogoutButton className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white" />
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white"
                    >
                      Get the app
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
