import React from 'react';
import Link from 'next/link';
import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center text-white">
                <Heart className="w-5 h-5 fill-white stroke-none" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                Wed<span className="text-rose-400 font-sans">Plan</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your comprehensive wedding planning destination. Connecting discerning couples with
              premier wedding venues, cinematographers, florists, and couture stylists worldwide.
            </p>
            {/* Social Media Links */}
            <div className="flex space-x-4 pt-2 text-slate-400">
              <a href="#" className="hover:text-rose-400 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-rose-400 transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-rose-400 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-rose-400 transition-colors" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services?category=Photography%20%26%20Videography" className="hover:text-rose-400 transition-colors">
                  Photography & Videography
                </Link>
              </li>
              <li>
                <Link href="/services?category=Wedding%20Venues" className="hover:text-rose-400 transition-colors">
                  Wedding Venues
                </Link>
              </li>
              <li>
                <Link href="/services?category=Decoration%20%26%20Florist" className="hover:text-rose-400 transition-colors">
                  Decoration & Florist
                </Link>
              </li>
              <li>
                <Link href="/services?category=Catering%20Services" className="hover:text-rose-400 transition-colors">
                  Catering Services
                </Link>
              </li>
              <li>
                <Link href="/services?category=Makeup%20%26%20Styling" className="hover:text-rose-400 transition-colors">
                  Makeup & Styling
                </Link>
              </li>
              <li>
                <Link href="/services?category=Wedding%20Fashion" className="hover:text-rose-400 transition-colors">
                  Wedding Fashion
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              WedPlan Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-rose-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-rose-400 transition-colors">
                  Browse All Services
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-rose-400 transition-colors">
                  Join as a Vendor
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-rose-400 transition-colors">
                  Sign In to Dashboard
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Security & Privacy Policy</span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Contact & Concierge
            </h4>
            <div className="flex items-start space-x-3 text-sm text-slate-400">
              <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span>575 Fifth Avenue, 18th Floor, New York, NY 10017</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-400">
              <Phone className="w-4 h-4 text-rose-500 shrink-0" />
              <span>+1 (800) 555-WEDPLAN</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-400">
              <Mail className="w-4 h-4 text-rose-500 shrink-0" />
              <span>concierge@wedplan.com</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar / Copyright */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} WedPlan Inc. All rights reserved.</p>
          <p className="mt-2 md:mt-0 flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-1 inline" />
            <span>for couples & artisans worldwide</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
