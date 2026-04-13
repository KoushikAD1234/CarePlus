import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-white/5 pt-16 pb-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-black text-blue-600 mb-4 tracking-tighter">
              CarePlus
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
              Empowering healthcare providers with smart, digital-first
              management tools. Built for reliability, designed for care.
            </p>
            <div className="flex gap-4">
              {/* Subtle Social Placeholders */}
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                𝕏
              </div>
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                in
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:ml-auto">
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-sm uppercase tracking-widest">
              Product
            </h4>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li className="hover:text-blue-600 cursor-pointer transition-colors">
                Features
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">
                Pricing
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">
                Documentation
              </li>
            </ul>
          </div>

          {/* Contact Column (The "Too Good" Part) */}
          <div className="col-span-1 md:col-span-2 md:ml-auto w-full max-w-sm">
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-sm uppercase tracking-widest">
              Get in Touch
            </h4>

            <div className="space-y-4">
              {/* Phone Card */}
              <a
                href="tel:+919101334649"
                className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 hover:border-blue-500/50 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  ☎️
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                    Support Line
                  </p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    9101334649
                  </p>
                </div>
              </a>

              {/* Email Card */}
              <a
                href="mailto:koushik28.official@gmail.com"
                className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 hover:border-blue-500/50 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  ✉️
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                    Official Email
                  </p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    koushik28.official@gmail.com
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-medium">
            © 2026 CarePlus. Built with precision for healthcare.
          </p>
          <div className="flex gap-8 text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">
              Terms of Service
            </span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">
              Cookies
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
