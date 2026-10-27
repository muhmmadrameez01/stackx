import { useState, useEffect, useMemo } from 'react';
import type { ToolId } from '../types';
import { Copy, Check, RotateCcw, FileText, Binary, Radio, Quote, CaseUpper, Type, ScanFace } from 'lucide-react';

interface TextToolsWorkspaceProps {
  toolId: ToolId;
}

export function TextToolsWorkspace({ toolId }: TextToolsWorkspaceProps) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);

  // Citation states
  const [citationType, setCitationType] = useState<'website' | 'book'>('website');
  const [authorFirst, setAuthorFirst] = useState('');
  const [authorLast, setAuthorLast] = useState('');
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishYear, setPublishYear] = useState('');
  const [url, setUrl] = useState('');

  // Handle Copy
  const handleCopy = () => {
    const textToCopy = isGeneratorTool ? outputText : inputText;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine tool type
  const isGeneratorTool = [
    'case-converter',
    'small-text-generator',
    'invisible-character',
    'text-to-binary',
    'binary-to-text',
    'morse-code-translator',
    'citation-generator'
  ].includes(toolId);

  const isStatsTool = ['word-counter', 'character-counter'].includes(toolId);

  // Process logic
  useEffect(() => {
    if (!inputText && toolId !== 'invisible-character' && toolId !== 'citation-generator') {
      setOutputText('');
      return;
    }

    try {
      switch (toolId) {
        case 'case-converter':
          // We provide buttons for specific cases, default to UPPER
          setOutputText(inputText.toUpperCase());
          break;
        case 'small-text-generator':
          const smallMap: Record<string, string> = {
            'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ᶦ', 'j': 'ʲ',
            'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'q': 'ᑫ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ',
            'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ'
          };
          setOutputText(inputText.toLowerCase().split('').map(c => smallMap[c] || c).join(''));
          break;
        case 'invisible-character':
          setOutputText('‎'); // Zero width space
          break;
        case 'text-to-binary':
          setOutputText(
            inputText.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
          );
          break;
        case 'binary-to-text':
          const binaryArray = inputText.trim().split(/\s+/);
          const chars = binaryArray.map(b => String.fromCharCode(parseInt(b, 2))).join('');
          setOutputText(chars);
          break;
        case 'morse-code-translator':
          // Auto-detect if input is morse or text
          const isMorse = /^[.\- /]+$/.test(inputText);
          const morseMap: Record<string, string> = {
            'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....',
            'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.',
            'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
            'y': '-.--', 'z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
            '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/'
          };
          if (isMorse) {
            // Morse to text
            const reverseMap = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));
            setOutputText(inputText.split(' ').map(m => m === '/' ? ' ' : (reverseMap[m] || '')).join(''));
          } else {
            // Text to morse
            setOutputText(inputText.toLowerCase().split('').map(c => morseMap[c] || c).join(' '));
          }
          break;
        case 'citation-generator':
          if (citationType === 'website') {
            setOutputText(`${authorLast}, ${authorFirst ? authorFirst[0] + '.' : ''} (${publishYear || 'n.d.'}). ${title}. ${publisher}. ${url}`);
          } else {
            setOutputText(`${authorLast}, ${authorFirst ? authorFirst[0] + '.' : ''} (${publishYear || 'n.d.'}). ${title}. ${publisher}.`);
          }
          break;
      }
    } catch (e) {
      setOutputText('Invalid input format');
    }
  }, [inputText, toolId, citationType, authorFirst, authorLast, title, publisher, publishYear, url]);


  // Specific Handlers for Case Converter
  const applyCase = (type: 'upper' | 'lower' | 'title' | 'sentence' | 'camel') => {
    switch (type) {
      case 'upper': setOutputText(inputText.toUpperCase()); break;
      case 'lower': setOutputText(inputText.toLowerCase()); break;
      case 'title':
        setOutputText(inputText.replace(/\b\w/g, c => c.toUpperCase()));
        break;
      case 'sentence':
        setOutputText(inputText.toLowerCase().replace(/(^\s*\w|[.?!]\s*\w)/g, c => c.toUpperCase()));
        break;
      case 'camel':
        setOutputText(inputText.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()));
        break;
    }
  };

  // Stats Logic
  const stats = useMemo(() => {
    const chars = inputText.length;
    const charsNoSpaces = inputText.replace(/\s/g, '').length;
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const sentences = inputText.split(/[.?!]+/).filter(Boolean).length;
    const paragraphs = inputText.split(/\n\s*\n/).filter(Boolean).length;
    const readingTimeMins = Math.ceil(words / 200);

    return { chars, charsNoSpaces, words, sentences, paragraphs, readingTimeMins };
  }, [inputText]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-full min-h-[600px]">
      
      {toolId === 'invisible-character' ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <ScanFace className="w-16 h-16 text-indigo-500 mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Zero-Width Space Generator</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
            Click the button below to copy an invisible character to your clipboard. You can paste it into social media, games, or formatting fields where an empty space is required but regular spaces are blocked.
          </p>
          <button
            onClick={handleCopy}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-all flex items-center gap-3 text-lg"
          >
            {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Invisible Character'}
          </button>
        </div>
      ) : toolId === 'citation-generator' ? (
        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          {/* Input Form */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Source Details</h3>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer flex items-center gap-2 p-4 border rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <input type="radio" checked={citationType === 'website'} onChange={() => setCitationType('website')} className="accent-indigo-600" />
                <span className="text-sm font-semibold">Website</span>
              </label>
              <label className="flex-1 cursor-pointer flex items-center gap-2 p-4 border rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <input type="radio" checked={citationType === 'book'} onChange={() => setCitationType('book')} className="accent-indigo-600" />
                <span className="text-sm font-semibold">Book / Journal</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Author First Name</label>
                <input type="text" value={authorFirst} onChange={e => setAuthorFirst(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm" placeholder="John" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Author Last Name</label>
                <input type="text" value={authorLast} onChange={e => setAuthorLast(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm" placeholder="Doe" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm" placeholder="Article or Book Title" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Publisher / Website Name</label>
                <input type="text" value={publisher} onChange={e => setPublisher(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm" placeholder="e.g. New York Times" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Year Published</label>
                <input type="text" value={publishYear} onChange={e => setPublishYear(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm" placeholder="2024" />
              </div>
            </div>

            {citationType === 'website' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">URL</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm" placeholder="https://..." />
              </div>
            )}
          </div>

          {/* Output Format */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              Generated Citation (APA)
              <button onClick={handleCopy} className="text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-lg transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
            </h3>
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 font-serif text-lg text-slate-700 dark:text-slate-300 shadow-inner">
              {outputText}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Main Input Textarea */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {isGeneratorTool ? 'Input Text' : 'Type or Paste Text Here'}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setInputText('')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
                {!isGeneratorTool && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Text
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none min-h-[300px]"
              placeholder="Start typing..."
            />
          </div>

          {/* Right Panel (Output or Stats) */}
          <div className="w-full lg:w-96 flex flex-col shrink-0">
            {isGeneratorTool ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Output</label>
                  <button
                    onClick={handleCopy}
                    disabled={!outputText}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Result
                  </button>
                </div>
                
                {toolId === 'case-converter' && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button onClick={() => applyCase('upper')} className="py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 hover:text-indigo-600 uppercase">UPPERCASE</button>
                    <button onClick={() => applyCase('lower')} className="py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 hover:text-indigo-600 lowercase">lowercase</button>
                    <button onClick={() => applyCase('title')} className="py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 hover:text-indigo-600 capitalize">Title Case</button>
                    <button onClick={() => applyCase('sentence')} className="py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 hover:text-indigo-600">Sentence case</button>
                    <button onClick={() => applyCase('camel')} className="py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 hover:text-indigo-600 col-span-2">camelCase</button>
                  </div>
                )}

                <textarea
                  readOnly
                  value={outputText}
                  className="flex-1 w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-700 dark:text-slate-200 resize-none min-h-[300px] font-mono text-sm shadow-inner"
                  placeholder="Generated result will appear here..."
                />
              </div>
            ) : (
              // Stats Panel (Word Counter, etc)
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 h-full shadow-inner flex flex-col gap-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Text Statistics
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.words}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Words</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <span className="text-3xl font-black text-emerald-500 dark:text-emerald-400">{stats.chars}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Characters</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{stats.sentences}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Sentences</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{stats.paragraphs}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Paragraphs</span>
                  </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-800" />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500">Characters (no spaces)</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{stats.charsNoSpaces}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500">Reading Time</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">~{stats.readingTimeMins} min</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
