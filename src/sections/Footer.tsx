import { motion } from 'framer-motion';
import { Heart, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="footer-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-pattern)" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-slate-800/90" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-xl font-bold text-white">BBC</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Boroko Baptist Church</h3>
                <p className="text-sm text-slate-400">2026 Calendar</p>
              </div>
            </div>
            <p className="text-slate-400 scripture italic mb-6">
              &ldquo;To Present Everyone Mature In Christ&rdquo;
              <span className="block mt-1 text-sm not-italic">— Colossians 1:28-29</span>
            </p>
            <div className="flex gap-4">
              {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                'Dashboard',
                'Year Overview',
                'Monthly View',
                'Weekly View',
                'List View',
                'Event Management',
              ].map((link) => (
                <li key={link}>
                  <motion.a
                    href="#"
                    whileHover={{ x: 4 }}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {link}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                <span className="text-slate-400">
                  Boroko, Port Moresby<br />
                  Papua New Guinea
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500" />
                <span className="text-slate-400">+675 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span className="text-slate-400">info@borokobaptist.org.pg</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="py-6 border-t border-slate-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm text-center md:text-left">
              © 2026 Boroko Baptist Church. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> for the glory of God
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
