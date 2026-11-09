import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Scale, 
  Cpu, 
  CheckCircle2, 
  Mail, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Stackx Productivity Suite',
  description: 'Stackx Terms and Conditions: Understand your rights, service usage terms, browser-side operation responsibilities, and intellectual property protections.',
  openGraph: {
    title: 'Stackx Terms and Conditions',
    description: 'Read the terms of service governing the use of Stackx web tools, PDF converters, and image editors.',
    type: 'website',
  },
};

export default function TermsAndConditionsPage() {
  const lastUpdated = 'November 9, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300 font-medium">Terms & Conditions</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-slate-800/80 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-semibold mb-4">
            <Scale className="w-4 h-4 text-blue-400" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Welcome to <strong className="text-white">Stackx</strong> (<Link href="/" className="text-red-400 underline underline-offset-4">stackx.si</Link>). By browsing our site or utilizing our client-side productivity utilities, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.
          </p>
          <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
            <span>Last Updated: <strong className="text-slate-300">{lastUpdated}</strong></span>
            <span>•</span>
            <span>Effective Immediately</span>
          </div>
        </div>

        {/* Structured Sections */}
        <div className="space-y-10 text-sm text-slate-300 leading-relaxed">

          {/* Section 1 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. In addition, when using specific Stackx services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
            <p>
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-red-500" />
              2. Description of Service & Local Execution
            </h2>
            <p>
              Stackx provides a comprehensive collection of web-based digital utilities, including PDF document organizers, file converters, image editing tools, network diagnostics, and SEO tools.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300">
              <p className="font-semibold text-white">Browser-Based Computation:</p>
              <p>
                Our services utilize modern client-side WebAssembly, HTML5, and JavaScript APIs. Processing occurs locally on your hardware. You acknowledge that tool performance, speed, and capability depend largely on your personal device's memory (RAM), processor capabilities, and browser version.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              3. User Content & Intellectual Property Ownership
            </h2>
            <p>
              <strong>You retain 100% ownership and copyright over all files, images, documents, and content processed through Stackx.</strong>
            </p>
            <p>
              Because your files never touch or reside on our servers, Stackx does not claim any intellectual property rights, licenses, or control over any data you manipulate using our web applications.
            </p>
            <p>
              All website source code, visual branding, logos, graphics, and interface designs are the intellectual property of Stackx and protected by applicable copyright and trademark laws.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              4. User Responsibility & File Backups
            </h2>
            <p>
              While our tools are designed with stability and fidelity in mind, you agree that you are solely responsible for:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li>Maintaining original backup copies of any files before performing PDF merges, splits, compressions, or image alterations.</li>
              <li>Verifying the output quality, content accuracy, and completeness of generated files before utilizing them in critical or legal workflows.</li>
              <li>Ensuring that you have lawful rights and permissions to modify, convert, or distribute any document you open in our tools.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-blue-400" />
              5. Acceptable Use Policy
            </h2>
            <p>
              You agree not to use Stackx to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li>Attempt to disrupt, reverse-engineer, exploit, or flood our web servers or network infrastructure with automated DDoS scripts.</li>
              <li>Bypass or attempt to circumvent security controls or API rate limits.</li>
              <li>Use the tools for any unlawful purpose or in violation of any local, state, national, or international regulations.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-rose-400" />
              6. Advertisements & Third-Party Integrations
            </h2>
            <p>
              Our website displays third-party advertisements via Google AdSense to support the ongoing development, bandwidth, and server infrastructure necessary to keep these tools free of charge.
            </p>
            <p>
              Stackx does not endorse, control, or assume responsibility for any products, services, or claims advertised in third-party ad units or linked external websites. Any interaction with advertisers is solely between you and the respective third party.
            </p>
          </section>

          {/* Section 7 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-slate-400" />
              7. Limitation of Liability & "As-Is" Warranty
            </h2>
            <p>
              Stackx and its digital utilities are provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, whether express or implied.
            </p>
            <p>
              In no event shall Stackx, its creators, or its affiliates be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from the loss of data, file corruption, browser crashes, business interruptions, or reliance on calculations provided on the platform.
            </p>
          </section>

          {/* Section 8 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-red-500" />
              8. Contact & Legal Inquiries
            </h2>
            <p>
              If you have any questions or require clarification regarding these Terms and Conditions, please contact us:
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a 
                href="mailto:admin@stackx.si" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-slate-700"
              >
                <Mail className="w-4 h-4 text-red-400" /> admin@stackx.si
              </a>
              <Link 
                href="/privacy-policy" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-slate-700"
              >
                View Privacy Policy
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

