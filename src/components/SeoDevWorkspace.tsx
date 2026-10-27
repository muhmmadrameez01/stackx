import { useState, useMemo } from 'react';
import type { ToolId } from '../types';
import { Code, Share2, Bot, Map, BarChart2, Search, Copy, Check, Braces, FileCode2, RotateCcw } from 'lucide-react';

interface SeoDevWorkspaceProps {
  toolId: ToolId;
}

export function SeoDevWorkspace({ toolId }: SeoDevWorkspaceProps) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);

  // Forms State
  const [form, setForm] = useState<Record<string, string>>({});

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(inputText);
      setOutputText(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setOutputText('Error: Invalid JSON\n\n' + (e as Error).message);
    }
  };

  const handleFormatHtml = () => {
    // Very basic regex-based HTML formatter (client-side simple)
    let formatted = '';
    let pad = 0;
    const lines = inputText.replace(/>\s*</g, '>\n<').split('\n');
    lines.forEach(line => {
      let indent = 0;
      if (line.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (line.match(/^<\/\w/)) {
        if (pad !== 0) pad -= 1;
      } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      formatted += '  '.repeat(pad) + line + '\n';
      pad += indent;
    });
    setOutputText(formatted.trim());
  };

  const handleGenerateSitemap = () => {
    const urls = inputText.split('\n').map(u => u.trim()).filter(Boolean);
    if (urls.length === 0) return setOutputText('');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    urls.forEach(url => {
      xml += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>0.80</priority>\n  </url>\n`;
    });
    xml += `</urlset>`;
    setOutputText(xml);
  };

  const handleGenerateRobots = () => {
    const userAgent = form.userAgent || '*';
    const disallow = (form.disallow || '').split('\n').filter(Boolean).map(d => `Disallow: ${d}`).join('\n');
    const allow = (form.allow || '').split('\n').filter(Boolean).map(a => `Allow: ${a}`).join('\n');
    const sitemap = form.sitemap ? `\nSitemap: ${form.sitemap}` : '';
    
    setOutputText(`User-agent: ${userAgent}\n${disallow}\n${allow}${sitemap}`.trim());
  };

  const handleGenerateOG = () => {
    const tags = [
      form.title && `<meta property="og:title" content="${form.title}" />`,
      form.description && `<meta property="og:description" content="${form.description}" />`,
      form.type && `<meta property="og:type" content="${form.type}" />`,
      form.url && `<meta property="og:url" content="${form.url}" />`,
      form.image && `<meta property="og:image" content="${form.image}" />`,
      form.siteName && `<meta property="og:site_name" content="${form.siteName}" />`,
    ].filter(Boolean).join('\n');
    setOutputText(tags);
  };

  const handleGenerateMeta = () => {
    const tags = [
      form.title && `<title>${form.title}</title>`,
      form.description && `<meta name="description" content="${form.description}" />`,
      form.keywords && `<meta name="keywords" content="${form.keywords}" />`,
      form.author && `<meta name="author" content="${form.author}" />`,
      form.viewport !== 'false' && `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
      form.robots && `<meta name="robots" content="${form.robots}" />`
    ].filter(Boolean).join('\n');
    setOutputText(tags);
  };

  const analyzeSeoScore = () => {
    if (!inputText) return;
    const html = inputText.toLowerCase();
    const checks = [
      { name: 'Has <title> tag', pass: html.includes('<title>') && html.includes('</title>') },
      { name: 'Has meta description', pass: html.includes('name="description"') },
      { name: 'Has <h1> tag', pass: html.includes('<h1>') && html.includes('</h1>') },
      { name: 'Has canonical tag', pass: html.includes('rel="canonical"') },
      { name: 'Has viewport meta', pass: html.includes('name="viewport"') },
      { name: 'Images have alt attributes', pass: !html.includes('<img') || (html.includes('<img') && html.includes('alt="')) }
    ];
    
    const score = Math.round((checks.filter(c => c.pass).length / checks.length) * 100);
    
    let result = `SEO Score: ${score}/100\n\n`;
    checks.forEach(c => {
      result += `${c.pass ? '✅ PASS' : '❌ FAIL'} - ${c.name}\n`;
    });
    
    setOutputText(result);
  };

  const keywordDensity = useMemo(() => {
    if (toolId !== 'keyword-density-checker' || !inputText) return null;
    
    const words = inputText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    const total = words.length;
    if (total === 0) return null;

    const counts: Record<string, number> = {};
    words.forEach(w => counts[w] = (counts[w] || 0) + 1);
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 15);
    
    return { sorted, total };
  }, [inputText, toolId]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
      
      {/* Left Input Area */}
      <div className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
        
        {toolId === 'robots-txt-generator' ? (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Bot className="w-5 h-5 text-indigo-500" /> Robots.txt Generator</h3>
            <input placeholder="User-agent (e.g. * or Googlebot)" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, userAgent: e.target.value})} />
            <textarea placeholder="Disallow paths (one per line, e.g. /admin/)" rows={3} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, disallow: e.target.value})} />
            <textarea placeholder="Allow paths (one per line)" rows={2} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, allow: e.target.value})} />
            <input placeholder="Sitemap URL (optional)" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, sitemap: e.target.value})} />
            <button onClick={handleGenerateRobots} className="bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700">Generate Robots.txt</button>
          </div>
        ) : toolId === 'open-graph-generator' ? (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Share2 className="w-5 h-5 text-indigo-500" /> Open Graph Tags</h3>
            <input placeholder="Title" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, title: e.target.value})} />
            <textarea placeholder="Description" rows={3} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, description: e.target.value})} />
            <input placeholder="Image URL" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, image: e.target.value})} />
            <input placeholder="Page URL" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, url: e.target.value})} />
            <div className="flex gap-4">
              <input placeholder="Site Name" className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, siteName: e.target.value})} />
              <input placeholder="Type (e.g. website, article)" className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, type: e.target.value})} />
            </div>
            <button onClick={handleGenerateOG} className="bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700">Generate OG Tags</button>
          </div>
        ) : toolId === 'meta-tag-generator' ? (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Code className="w-5 h-5 text-indigo-500" /> HTML Meta Tags</h3>
            <input placeholder="Page Title" maxLength={60} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, title: e.target.value})} />
            <textarea placeholder="Meta Description" maxLength={160} rows={3} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, description: e.target.value})} />
            <input placeholder="Keywords (comma separated)" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, keywords: e.target.value})} />
            <input placeholder="Author" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, author: e.target.value})} />
            <select className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" onChange={e => setForm({...form, robots: e.target.value})}>
              <option value="index, follow">Index, Follow</option>
              <option value="noindex, nofollow">No Index, No Follow</option>
              <option value="index, nofollow">Index, No Follow</option>
              <option value="noindex, follow">No Index, Follow</option>
            </select>
            <button onClick={handleGenerateMeta} className="bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700">Generate Meta Tags</button>
          </div>
        ) : (
          // Textarea based tools (JSON, HTML, Sitemap, Keyword Density, SEO Score)
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {toolId === 'json-formatter' ? 'Paste JSON Code' :
                 toolId === 'html-formatter' ? 'Paste HTML Code' :
                 toolId === 'xml-sitemap-generator' ? 'Enter URLs (One per line)' :
                 toolId === 'keyword-density-checker' ? 'Paste Text to Analyze' :
                 'Paste HTML Source Code'}
              </h3>
              <button
                onClick={() => { setInputText(''); setOutputText(''); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-500 px-3 py-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-700 dark:text-slate-200 font-mono text-sm focus:outline-none resize-none"
            />
            <div className="mt-4">
              {toolId === 'json-formatter' && <button onClick={handleFormatJson} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Braces className="w-4 h-4"/> Format JSON</button>}
              {toolId === 'html-formatter' && <button onClick={handleFormatHtml} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><FileCode2 className="w-4 h-4"/> Beautify HTML</button>}
              {toolId === 'xml-sitemap-generator' && <button onClick={handleGenerateSitemap} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Map className="w-4 h-4"/> Build Sitemap</button>}
              {toolId === 'seo-score-checker' && <button onClick={analyzeSeoScore} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Search className="w-4 h-4"/> Check SEO Score</button>}
            </div>
          </div>
        )}
      </div>

      {/* Right Output Area */}
      {toolId === 'keyword-density-checker' ? (
        <div className="w-full lg:w-96 shrink-0 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-inner flex flex-col">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            Keyword Density
          </h3>
          {keywordDensity ? (
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <p className="text-sm font-semibold text-slate-500 mb-4">Total Words: {keywordDensity.total}</p>
              {keywordDensity.sorted.map(([word, count]) => (
                <div key={word} className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{word}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{count}x</span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                      {((count / keywordDensity.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center mt-10">Paste text to see analysis.</p>
          )}
        </div>
      ) : (
        <div className="w-full lg:w-[45%] shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Generated Code</label>
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Code
            </button>
          </div>
          <textarea
            readOnly
            value={outputText}
            className="flex-1 w-full bg-slate-900 border-none rounded-2xl p-4 text-emerald-400 font-mono text-sm resize-none shadow-xl custom-scrollbar"
            placeholder="Result will appear here..."
          />
        </div>
      )}
    </div>
  );
}
