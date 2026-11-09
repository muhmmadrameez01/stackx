import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  AlertTriangle, 
  HelpCircle, 
  FileCode, 
  Cpu, 
  Scale, 
  ExternalLink, 
  Mail, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclaimer | Stackx - Browser Utilities & Information Notice',
  description: 'Stackx Disclaimer: Information regarding the accuracy of browser-side document conversions, network diagnostics, SEO utilities, and Google AdSense advertising.',
  openGraph: {
    title: 'Stackx Disclaimer',
    description: 'Read the official liability and utility operation disclaimer for Stackx online tools.',
    type: 'website',
  },
};

export default function DisclaimerPage() {
  const lastUpdated = 'November 9, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300 font-medium">Disclaimer</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-slate-800/80 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-400 text-xs font-semibold mb-4">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Important Information Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Disclaimer
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            The information, software tools, calculators, and content provided by <strong className="text-white">Stackx</strong> (<Link href="/" className="text-red-400 underline underline-offset-4">stackx.si</Link>) are published in good faith for general productivity, educational, and utility purposes only.
          </p>
          <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
            <span>Last Updated: <strong className="text-slate-300">{lastUpdated}</strong></span>
            <span>•</span>
            <span>Applies to all Stackx tools & services</span>
          </div>
        </div>

        {/* Structured Sections */}
        <div className="space-y-10 text-sm text-slate-300 leading-relaxed">

          {/* Section 1 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-red-500" />
              1. File Conversion & Utility Output Fidelity
            </h2>
            <p>
              Stackx provides client-side file conversion, PDF management (merging, splitting, compressing, OCR), image processing, and formatting utilities. While we use high-grade open-source and proprietary client-side libraries:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li>We do <strong>not</strong> guarantee 100% precision, typographical formatting preservation, or flawless layout reconstruction across different operating systems or complex document types.</li>
              <li>Users are strongly advised to inspect and verify all output documents, spreadsheets, and converted images prior to submitting them for legal, commercial, or critical purposes.</li>
              <li>You should always retain the original copy of any file before subjecting it to browser-side modification.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <FileCode className="w-5 h-5 text-blue-400" />
              2. Technical & Network Diagnostics Tools
            </h2>
            <p>
              Tools such as IP lookups, DNS inspectors, ping/latency estimators, subnet calculators, and speed metrics rely on browser environment parameters, WebRTC protocols, and public routing tables.
            </p>
            <p>
              These measurements represent estimates and diagnostic snapshots; they do not constitute certified network audits or cryptographic security verification. Stackx shall not be held liable for network configuration decisions based on these metrics.
            </p>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-purple-400" />
              3. No Professional Advice
            </h2>
            <p>
              The articles, blog tutorials, financial calculators, and guides published on Stackx are strictly for general informational purposes. They do not constitute formal legal, financial, accounting, or enterprise security advice.
            </p>
            <p>
              Before taking any action based upon such information, we encourage you to consult with the appropriate certified professionals.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <ExternalLink className="w-5 h-5 text-amber-400" />
              4. External Links and Advertisements (Google AdSense)
            </h2>
            <p>
              Stackx contains external links to other websites and displays dynamic third-party advertisements served by <strong>Google AdSense</strong>.
            </p>
            <p>
              While we strive to provide only quality links to ethical websites, we have no control over the content and nature of these external destinations or advertiser claims. The presence of any link or ad banner does not imply an endorsement or recommendation of all content found on external sites.
            </p>
            <p className="text-xs text-slate-400">
              Site owners and content may change without notice and may occur before we have the opportunity to remove a link which may have gone stale or inappropriate.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              5. Consent & Limitation of Liability
            </h2>
            <p>
              By using our website, you hereby consent to our disclaimer and agree to its terms. Stackx will not be liable for any losses and/or damages in connection with the use of our website.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-red-500" />
              6. Update & Inquiries
            </h2>
            <p>
              Should we update, amend or make any changes to this document, those changes will be prominently posted here. If you require any more information or have questions about our site's disclaimer, please feel free to reach out:
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a 
                href="mailto:admin@stackx.si" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-slate-700"
              >
                <Mail className="w-4 h-4 text-red-400" /> admin@stackx.si
              </a>
              <Link 
                href="/terms-and-conditions" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-slate-700"
              >
                View Terms & Conditions
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

