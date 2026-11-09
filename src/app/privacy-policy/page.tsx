import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Cookie, 
  Database, 
  UserCheck, 
  FileText, 
  Mail, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Stackx - 100% Client-Side Privacy Guarantee',
  description: 'Stackx Privacy Policy: Learn how our browser-based tools protect your files with 100% client-side execution, zero server uploads, and compliant advertising disclosures.',
  openGraph: {
    title: 'Stackx Privacy Policy - Zero-Storage & Data Protection',
    description: 'All document editing, PDF operations, and image conversions execute locally in your browser memory.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'November 9, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300 font-medium">Privacy Policy</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-slate-800/80 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Privacy-First Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            At <strong className="text-white">Stackx</strong>, accessible from <Link href="/" className="text-red-400 underline underline-offset-4">stackx.si</Link>, your digital privacy is our core engineering foundation. This Privacy Policy documents how information is collected, how our 100% client-side zero-storage technology functions, and your rights as a user.
          </p>
          <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
            <span>Last Updated: <strong className="text-slate-300">{lastUpdated}</strong></span>
            <span>•</span>
            <span>Effective Date: November 9, 2026</span>
          </div>
        </div>

        {/* Highlight Callout: 100% Client-Side Privacy */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 mb-10 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-1.5 flex items-center gap-2">
                Core Guarantee: Zero File Uploads
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Unlike traditional online utility converters, <strong>Stackx executes all PDF merging, image editing, file conversions, and media calculations directly inside your browser memory</strong> using WebAssembly, HTML5 Canvas, and modern Web APIs. Your documents, photos, and files are <strong>NEVER</strong> transmitted to, stored on, or analyzed by our backend servers.
              </p>
            </div>
          </div>
        </div>

        {/* Structured Policy Sections */}
        <div className="space-y-10 text-sm text-slate-300 leading-relaxed">

          {/* Section 1 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Database className="w-5 h-5 text-red-500" />
              1. Information We Do NOT Collect
            </h2>
            <p>
              Because our digital utilities run entirely on the client side:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li>We do <strong>not</strong> collect, inspect, or retain your files, documents, images, or PDFs.</li>
              <li>We do <strong>not</strong> require user registration or account creation to use standard web utilities.</li>
              <li>We do <strong>not</strong> store personal identifiers such as phone numbers or physical addresses.</li>
              <li>When you close your browser tab or reload the page, all file data held in volatile browser RAM is completely wiped immediately.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-blue-400" />
              2. Log Files & Standard Web Diagnostics
            </h2>
            <p>
              Like almost all web platforms, Stackx follows standard internet logging procedures. When you visit our website, our servers automatically log standard, non-personally identifiable diagnostic information including:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li>Internet Protocol (IP) address</li>
              <li>Browser type and version (e.g. Chrome, Firefox, Safari, Edge)</li>
              <li>Operating system (e.g. Windows, macOS, Linux, Android, iOS)</li>
              <li>Internet Service Provider (ISP)</li>
              <li>Date and time stamp of requests</li>
              <li>Referring and exit pages</li>
              <li>Number of clicks and page response metrics</li>
            </ul>
            <p className="text-xs text-slate-400">
              This information is used strictly to analyze trends, prevent malicious DDoS attacks, maintain infrastructure stability, and optimize website performance. These logs are never linked to personally identifiable information.
            </p>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Cookie className="w-5 h-5 text-amber-400" />
              3. Cookies and Web Beacons
            </h2>
            <p>
              Stackx uses standard HTTP cookies to store user preferences, such as light/dark theme selection and recent tool usage shortcuts. These cookies do not contain sensitive personal information.
            </p>
            <p>
              You can choose to disable cookies through your individual browser options. Detailed information about cookie management with specific web browsers can be found at the browsers' respective official websites.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-purple-400" />
              4. Google AdSense & Third-Party Advertising
            </h2>
            <p>
              To maintain free access to our high-performance suite of productivity tools without charging subscription fees, Stackx displays advertisements served by <strong>Google AdSense</strong> and authorized third-party ad networks.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300">
              <p className="font-semibold text-white">Google AdSense Disclosures:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Google, as a third-party vendor, uses cookies to serve ads on Stackx.</li>
                <li>Google's use of advertising cookies (including the DoubleClick DART cookie) enables it and its partners to serve ads to users based on their visit to Stackx and/or other websites on the Internet.</li>
                <li>Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 underline inline-flex items-center gap-1">Google Ad Settings <ExternalLink className="w-3 h-3" /></a> or by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-red-400 underline inline-flex items-center gap-1">aboutads.info <ExternalLink className="w-3 h-3" /></a>.</li>
                <li>Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons in their respective advertisements and links that appear on Stackx. They automatically receive your IP address when this occurs.</li>
              </ul>
            </div>
            <p className="text-xs text-slate-400">
              Stackx has no access to or control over these cookies that are used by third-party advertisers. We encourage you to consult the respective Privacy Policies of these third-party ad servers for more detailed information.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              5. GDPR & CCPA Data Protection Rights
            </h2>
            <p>
              We want to ensure you are fully aware of all your data protection rights. Every user is entitled to the following:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li><strong>The right to access</strong> – You have the right to request copies of your personal data.</li>
              <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate.</li>
              <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data under certain conditions.</li>
              <li><strong>The right to restrict processing</strong> – You have the right to request that we restrict the processing of your personal data.</li>
              <li><strong>The right to data portability</strong> – You have the right to request that we transfer the data that we have collected to another organization, or directly to you.</li>
            </ul>
            <p className="text-xs text-slate-400">
              If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us at our designated privacy email.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Info className="w-5 h-5 text-sky-400" />
              6. Children's Information
            </h2>
            <p>
              Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
            </p>
            <p>
              Stackx does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
            </p>
          </section>

          {/* Section 7 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-red-500" />
              7. Contact Us
            </h2>
            <p>
              If you have additional questions, require more information about our Privacy Policy, or wish to exercise your data rights, do not hesitate to contact our administrative team:
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a 
                href="mailto:admin@stackx.si" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-slate-700"
              >
                <Mail className="w-4 h-4 text-red-400" /> admin@stackx.si
              </a>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                Return to Tools Hub
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

