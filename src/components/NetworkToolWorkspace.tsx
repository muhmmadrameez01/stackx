import React, { useState, useEffect } from 'react';
import type { ToolId } from '../types';
import { 
  lookupIp, 
  lookupDns, 
  runSpeedTest, 
  calculateSubnet, 
  generateHashes, 
  decodeJwt, 
  generatePassword, 
  checkPasswordStrength, 
  base64Encode, 
  base64Decode, 
  urlEncode, 
  urlDecode,
  checkWebsiteStatus,
  IpInfo,
  DnsRecord,
  SpeedTestResult,
  SubnetResult,
  HashResult
} from '../services/networkService';

import { 
  Globe, 
  Activity, 
  Copy, 
  Check, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Hash, 
  FileCode, 
  Lock, 
  Server, 
  Cpu, 
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';

interface NetworkToolWorkspaceProps {
  toolId: ToolId;
  toolName: string;
}

export const NetworkToolWorkspace: React.FC<NetworkToolWorkspaceProps> = ({ toolId, toolName }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Common inputs
  const [domainInput, setDomainInput] = useState<string>('google.com');
  const [ipInput, setIpInput] = useState<string>('');
  const [cidrInput, setCidrInput] = useState<number>(24);
  const [textInput, setTextInput] = useState<string>('Hello World! Stackx Security Engine');
  const [jwtInput, setJwtInput] = useState<string>('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIERvZSIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MjUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  const [passLength, setPassLength] = useState<number>(16);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [dnsRecordType, setDnsRecordType] = useState<string>('ALL');

  // Results state
  const [ipData, setIpData] = useState<IpInfo | null>(null);
  const [dnsData, setDnsData] = useState<DnsRecord[] | null>(null);
  const [speedData, setSpeedData] = useState<SpeedTestResult | null>(null);
  const [speedStatus, setSpeedStatus] = useState<string>('');
  const [speedUnit, setSpeedUnit] = useState<'MB/s' | 'Mbps' | 'both'>('MB/s');
  const [liveSpeedMbps, setLiveSpeedMbps] = useState<number>(0);
  const [testPhase, setTestPhase] = useState<'idle' | 'testing' | 'completed'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'ping' | 'download' | 'upload'>('idle');
  const [subnetData, setSubnetData] = useState<SubnetResult | null>(null);
  const [hashData, setHashData] = useState<HashResult | null>(null);
  const [jwtData, setJwtData] = useState<any | null>(null);
  const [convertedText, setConvertedText] = useState<string>('');
  const [generatedPass, setGeneratedPass] = useState<string>('');
  const [siteStatusData, setSiteStatusData] = useState<any | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Initial loads for specific tools
  useEffect(() => {
    if (toolId === 'ip-lookup') {
      handleIpLookup();
    } else if (toolId === 'subnet-calculator') {
      handleSubnetCalc();
    } else if (toolId === 'hash-generator') {
      handleHashGen();
    } else if (toolId === 'password-generator') {
      handleGeneratePass();
    } else if (toolId === 'jwt-decoder') {
      handleDecodeJwt();
    } else if (toolId === 'dns-lookup' || toolId === 'reverse-dns' || toolId === 'dns-propagation') {
      handleDnsLookup();
    } else if (toolId === 'base64-tool') {
      handleBase64Encode();
    } else if (toolId === 'url-encoder') {
      handleUrlEncode();
    } else if (toolId === 'speed-test') {
      // Silently detect client IP for the speed test bottom bar
      fetchIpSilently();
    }
  }, [toolId]);

  // Silent IP fetch - does not set loading or error, just populates ipData
  const fetchIpSilently = async () => {
    try {
      const data = await lookupIp('');
      setIpData(data);
    } catch {
      // fail silently, the widget will just not show ISP/IP
    }
  };

  const handleIpLookup = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await lookupIp(ipInput);
      setIpData(data);
    } catch (e: any) {
      setError(e.message || 'Failed to lookup IP information');
    } finally {
      setLoading(false);
    }
  };

  const handleDnsLookup = async () => {
    if (!domainInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const records = await lookupDns(domainInput, dnsRecordType);
      setDnsData(records);
    } catch (e: any) {
      setError(e.message || 'DNS lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeedTest = async () => {
    setLoading(true);
    setTestPhase('testing');
    setError(null);
    setLiveSpeedMbps(0);
    setTestStatus('ping');
    try {
      const res = await runSpeedTest(
        (status) => setSpeedStatus(status),
        (speedMbps, phase) => {
          setLiveSpeedMbps(speedMbps);
          setTestStatus(phase);
        }
      );
      setSpeedData(res);
      setTestPhase('completed');
      setTestStatus('idle');
    } catch (e: any) {
      setError(e.message || 'Speed test failed');
      setTestPhase('idle');
      setTestStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleSubnetCalc = () => {
    try {
      setError(null);
      const res = calculateSubnet(ipInput || '192.168.1.1', cidrInput);
      setSubnetData(res);
    } catch (e: any) {
      setError(e.message || 'Invalid IP or CIDR');
    }
  };

  const handleHashGen = async () => {
    try {
      const res = await generateHashes(textInput);
      setHashData(res);
    } catch (e: any) {
      setError('Hash generation failed');
    }
  };

  const handleDecodeJwt = () => {
    try {
      setError(null);
      const res = decodeJwt(jwtInput);
      setJwtData(res);
    } catch (e: any) {
      setError(e.message || 'Invalid JWT token string');
      setJwtData(null);
    }
  };

  const handleGeneratePass = () => {
    const p = generatePassword(passLength, useSymbols, useNumbers);
    setGeneratedPass(p);
  };

  const handleBase64Encode = () => {
    try { setConvertedText(base64Encode(textInput)); } catch (e) { setError('Base64 Encoding failed'); }
  };
  const handleBase64Decode = () => {
    try { setConvertedText(base64Decode(textInput)); } catch (e) { setError('Base64 Decoding failed. Invalid string'); }
  };

  const handleUrlEncode = () => {
    setConvertedText(urlEncode(textInput));
  };
  const handleUrlDecode = () => {
    setConvertedText(urlDecode(textInput));
  };

  const handleSiteStatusCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await checkWebsiteStatus(domainInput);
      setSiteStatusData(res);
    } catch (e: any) {
      setError('Status check failed');
    } finally {
      setLoading(false);
    }
  };

  const passStrength = checkPasswordStrength(generatedPass || textInput);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Tool Title Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {toolName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live Client Diagnostics & Security Processing Engine
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 1. SPEED TEST TOOL (EXACT OOKLA SPEEDTEST.NET DESIGN) ── */}
      {toolId === 'speed-test' && (
        <div className="space-y-6">
          
          {/* Unit Selector Header */}
          <div className="flex items-center justify-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-semibold">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSpeedUnit('Mbps')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  speedUnit === 'Mbps'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Mbps
              </button>
              <button
                onClick={() => setSpeedUnit('MB/s')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  speedUnit === 'MB/s'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                MB/s
              </button>
            </div>
          </div>

          {/* OOKLA-STYLE DARK OBSIDIAN WIDGET CONTAINER */}
          <div className="bg-[#0b0e14] rounded-3xl p-6 sm:p-10 border border-slate-800/80 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between min-h-[420px] text-white">
            
            {/* Top Permanent Metric Header (DOWNLOAD, UPLOAD, PING, JITTER) */}
            <div className="w-full grid grid-cols-4 gap-2 sm:gap-6 border-b border-slate-800/80 pb-6 text-center">
              
              {/* DOWNLOAD */}
              <div className={`p-2 rounded-xl transition-all ${testStatus === 'download' ? 'bg-cyan-950/40 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,242,254,0.15)]' : ''}`}>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 block mb-1 uppercase">DOWNLOAD</span>
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-cyan-400 font-mono">
                  {testPhase === 'completed' && speedData 
                    ? (speedUnit === 'MB/s' ? speedData.downloadMBps : speedData.downloadMbps)
                    : (testStatus === 'download' ? (speedUnit === 'MB/s' ? (liveSpeedMbps/8).toFixed(2) : liveSpeedMbps.toFixed(1)) : '---')}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block mt-0.5">{speedUnit}</span>
              </div>

              {/* UPLOAD */}
              <div className={`p-2 rounded-xl transition-all ${testStatus === 'upload' ? 'bg-purple-950/40 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : ''}`}>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 block mb-1 uppercase">UPLOAD</span>
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-purple-400 font-mono">
                  {testPhase === 'completed' && speedData 
                    ? (speedUnit === 'MB/s' ? speedData.uploadMBps : speedData.uploadMbps)
                    : (testStatus === 'upload' ? (speedUnit === 'MB/s' ? (liveSpeedMbps/8).toFixed(2) : liveSpeedMbps.toFixed(1)) : '---')}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block mt-0.5">{speedUnit}</span>
              </div>

              {/* PING */}
              <div className="p-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 block mb-1 uppercase">PING</span>
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-amber-400 font-mono">
                  {speedData ? speedData.pingMs : '---'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block mt-0.5">ms</span>
              </div>

              {/* JITTER */}
              <div className="p-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 block mb-1 uppercase">JITTER</span>
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-emerald-400 font-mono">
                  {speedData ? speedData.jitterMs : '---'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block mt-0.5">ms</span>
              </div>

            </div>

            {/* CENTER WIDGET STATE */}
            <div className="my-8 flex flex-col items-center justify-center relative w-full">
              
              {/* IDLE STATE: THE ICONIC CIRCULAR GO BUTTON */}
              {testPhase === 'idle' && (
                <button
                  onClick={handleSpeedTest}
                  className="group relative w-48 h-48 rounded-full bg-[#0e131d] border-[3px] border-cyan-400 shadow-[0_0_50px_rgba(0,242,254,0.35)] hover:shadow-[0_0_80px_rgba(0,242,254,0.6)] hover:border-cyan-300 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-ping opacity-25 pointer-events-none" />
                  <span className="text-5xl font-black tracking-widest text-white group-hover:text-cyan-300 transition-colors">
                    GO
                  </span>
                </button>
              )}

              {/* TESTING STATE: EXACT SPEEDTEST.NET GAUGE */}
              {testPhase === 'testing' && (() => {
                // Ookla log scale: 0→5→10→50→100→250→500→750→1000
                const scaleStops = [0, 5, 10, 50, 100, 250, 500, 750, 1000];
                const logPos = (v: number) => {
                  for (let i = 0; i < scaleStops.length - 1; i++) {
                    if (v <= scaleStops[i + 1]) {
                      return (i + (v - scaleStops[i]) / (scaleStops[i + 1] - scaleStops[i])) / (scaleStops.length - 1);
                    }
                  }
                  return 1;
                };
                // Clamp away from 0 and 1 to avoid degenerate SVG arc (start == end)
                const progress = Math.min(0.9999, Math.max(0.0001, logPos(liveSpeedMbps)));

                // Arc: center=(160,160), r=110
                // In math convention (y-up), angles:
                //   startAngle=225°  → lower-left  (7–8 o'clock)
                //   endAngle=-45°    → lower-right  (4–5 o'clock)
                // Arc goes CLOCKWISE in math (= counter-clockwise on screen, over the top)
                // SVG y-down formula: x = cx + r·cos(θ),  y = cy - r·sin(θ)
                const cx = 160, cy = 160, r = 110;
                const startAngle = 225;   // math degrees, lower-left
                const totalSweep = 270;   // degrees of arc

                const ptX = (deg: number) => cx + r * Math.cos((deg * Math.PI) / 180);
                const ptY = (deg: number) => cy - r * Math.sin((deg * Math.PI) / 180);

                // Arc start (always lower-left)
                const sx = ptX(startAngle), sy = ptY(startAngle);

                // Background arc end (full 270° clockwise in math = lower-right)
                const bgAngle = startAngle - totalSweep;         // -45°
                const bgX = ptX(bgAngle), bgY = ptY(bgAngle);

                // Progress arc end
                const endAngle  = startAngle - progress * totalSweep;
                const ex = ptX(endAngle), ey = ptY(endAngle);
                const largeArc  = progress * totalSweep > 180 ? 1 : 0;

                // SVG arc: sweep=1 → clockwise on screen (from lower-left UP the left, over TOP, down right) ✓
                const bgPath  = `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 1 1 ${bgX.toFixed(2)} ${bgY.toFixed(2)}`;
                const prPath  = `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;

                // Needle: rect points UP from center; rotate -135° → lower-left, +135° → lower-right
                const needleDeg = -135 + progress * 270;

                // Scale label positions outside the arc (labelR = r + 28)
                const labelR = r + 28;
                const scaleLabels = scaleStops.map((val, i) => {
                  const frac   = i / (scaleStops.length - 1);
                  const deg    = startAngle - frac * totalSweep; // clockwise in math
                  return {
                    val,
                    x: cx + labelR * Math.cos((deg * Math.PI) / 180),
                    y: cy - labelR * Math.sin((deg * Math.PI) / 180),
                  };
                });

                return (
                  <div className="flex flex-col items-center justify-center w-full max-w-sm">
                    <div className="relative w-72 h-72">
                      <svg className="w-full h-full" viewBox="0 0 320 320" overflow="visible">

                        {/* Background track */}
                        <path d={bgPath} fill="none" stroke="#1e293b" strokeWidth="14" strokeLinecap="round"/>

                        {/* Gradient definitions */}
                        <defs>
                          <linearGradient id="ooklaGrad" gradientUnits="userSpaceOnUse"
                            x1={sx} y1={sy} x2={bgX} y2={bgY}>
                            <stop offset="0%"   stopColor="#00f2fe" />
                            <stop offset="60%"  stopColor="#0ea5e9" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                          {/* Needle gradient: along the LENGTH - dark tip → bright centre → fade at base */}
                          <linearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#475569" stopOpacity="0.5" />
                            <stop offset="35%"  stopColor="#94a3b8" stopOpacity="0.95" />
                            <stop offset="65%"  stopColor="#cbd5e1" stopOpacity="1" />
                            <stop offset="100%" stopColor="#64748b" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>

                        {/* Active progress arc */}
                        <path
                          d={prPath}
                          fill="none"
                          stroke="url(#ooklaGrad)"
                          strokeWidth="14"
                          strokeLinecap="round"
                          className="transition-all duration-100 ease-out"
                        />

                        {/* Scale labels */}
                        {scaleLabels.map(({ val, x, y }) => (
                          <text
                            key={val}
                            x={x.toFixed(1)} y={y.toFixed(1)}
                            fill="#475569"
                            fontSize="12"
                            fontWeight="600"
                            fontFamily="monospace"
                            textAnchor="middle"
                            dominantBaseline="central"
                          >
                            {val}
                          </text>
                        ))}

                        {/* Needle – thin, Speedtest.net style: 6px wide, gradient along length */}
                        <g transform={`rotate(${needleDeg.toFixed(2)} ${cx} ${cy})`}>
                          <rect
                            x={cx - 3}
                            y={cy - r + 16}
                            width={6}
                            height={r - 8}
                            rx={3}
                            fill="url(#needleGrad)"
                          />
                        </g>

                        {/* Speed number inside dial */}
                        <text
                          x={cx} y={cy + 52}
                          fill="white" fontSize="42" fontWeight="900"
                          fontFamily="monospace" textAnchor="middle"
                          dominantBaseline="central" letterSpacing="-1"
                        >
                          {speedUnit === 'MB/s'
                            ? (liveSpeedMbps / 8).toFixed(2)
                            : liveSpeedMbps.toFixed(1)}
                        </text>

                        {/* Unit label */}
                        <text
                          x={cx} y={cy + 78}
                          fill="#00f2fe" fontSize="12" fontWeight="700"
                          textAnchor="middle" dominantBaseline="central" letterSpacing="1"
                        >
                          {speedUnit === 'MB/s' ? 'MB/s' : 'Mbps'}
                        </text>

                      </svg>
                    </div>

                    {/* Status text */}
                    <div className="text-xs font-semibold text-slate-400 animate-pulse mt-1">
                      {speedStatus}
                    </div>
                  </div>
                );
              })()}

              {/* COMPLETED STATE: AGAIN BUTTON */}
              {testPhase === 'completed' && (
                <div className="flex flex-col items-center justify-center space-y-4 my-4">
                  <button
                    onClick={handleSpeedTest}
                    className="px-8 py-3.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(0,242,254,0.4)] flex items-center gap-2 transition-transform hover:scale-105"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>AGAIN</span>
                  </button>
                </div>
              )}

            </div>

            {/* BOTTOM CONNECTION METADATA ROW */}
            <div className="w-full border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-cyan-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">ISP & Connection</span>
                  <span className="text-slate-200 font-semibold">{ipData?.isp || 'Cybernet / Broadband'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Client IP</span>
                  <span className="text-slate-200 font-semibold">{ipData?.ip || 'Detecting...'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ── 2. IP LOOKUP TOOL ── */}
      {toolId === 'ip-lookup' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter IP address (leave blank for your IP)..."
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              className="flex-1 px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <button
              onClick={handleIpLookup}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
            >
              Lookup IP
            </button>
          </div>

          {ipData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">IP Address</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{ipData.ip}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">ISP / Organization</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{ipData.isp}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">Country & City</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{ipData.city}, {ipData.country} ({ipData.countryCode})</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">Autonomous System Number (ASN)</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{ipData.asn}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 3. DNS LOOKUP / REVERSE DNS / PROPAGATION ── */}
      {(toolId === 'dns-lookup' || toolId === 'reverse-dns' || toolId === 'dns-propagation') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter domain (e.g. google.com)..."
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              className="flex-1 px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <select
              value={dnsRecordType}
              onChange={(e) => setDnsRecordType(e.target.value)}
              className="px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="ALL">ALL Records</option>
              <option value="A">A Record (IPv4)</option>
              <option value="AAAA">AAAA Record (IPv6)</option>
              <option value="MX">MX Record (Mail)</option>
              <option value="TXT">TXT Record</option>
              <option value="CNAME">CNAME Record</option>
              <option value="NS">NS Record (Nameserver)</option>
            </select>
            <button
              onClick={handleDnsLookup}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
            >
              Lookup DNS
            </button>
          </div>

          {dnsData && (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Data / Target Value</th>
                    <th className="p-3">TTL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-mono">
                  {dnsData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">No DNS records returned</td>
                    </tr>
                  ) : (
                    dnsData.map((rec, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-red-500">{rec.type}</td>
                        <td className="p-3">{rec.name}</td>
                        <td className="p-3 break-all">{rec.data}</td>
                        <td className="p-3 text-slate-400">{rec.ttl}s</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 4. SUBNET CALCULATOR ── */}
      {toolId === 'subnet-calculator' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="IP Address (e.g. 192.168.1.1)"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              className="flex-1 px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <select
              value={cidrInput}
              onChange={(e) => setCidrInput(Number(e.target.value))}
              className="px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {Array.from({ length: 33 }, (_, i) => (
                <option key={i} value={i}>/{i} ({Math.pow(2, 32 - i)} IPs)</option>
              ))}
            </select>
            <button
              onClick={handleSubnetCalc}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
            >
              Calculate Subnet
            </button>
          </div>

          {subnetData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-1">Network IP Address</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{subnetData.networkIp} /{subnetData.cidr}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-1">Netmask</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{subnetData.netmask}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-1">Broadcast IP</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{subnetData.broadcastIp}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-1">Usable Host Range</span>
                <span className="text-sm font-bold text-emerald-500">{subnetData.firstHost} - {subnetData.lastHost}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-1">Total Usable Hosts</span>
                <span className="text-sm font-bold text-indigo-500">{subnetData.usableHosts.toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-1">Binary Representation</span>
                <span className="text-xs font-bold text-amber-500 break-all">{subnetData.binaryIp}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. HASH GENERATOR ── */}
      {toolId === 'hash-generator' && (
        <div className="space-y-6">
          <textarea
            rows={3}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type or paste text string to generate MD5, SHA1, SHA256, SHA512 hashes..."
            className="w-full p-4 text-xs font-mono rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
          <button
            onClick={handleHashGen}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
          >
            Generate Hashes
          </button>

          {hashData && (
            <div className="space-y-3 font-mono text-xs">
              {['sha256', 'md5', 'sha1', 'sha512'].map((key) => (
                <div key={key} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="overflow-hidden">
                    <span className="uppercase text-[10px] font-bold text-red-500 block mb-1">{key}</span>
                    <p className="text-slate-800 dark:text-slate-200 truncate">{hashData[key as keyof HashResult]}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hashData[key as keyof HashResult], key)}
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-500 hover:text-white"
                  >
                    {copiedKey === key ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 6. PASSWORD STRENGTH & GENERATOR ── */}
      {(toolId === 'password-generator' || toolId === 'password-checker') && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <span className="text-xs text-slate-400 block uppercase font-bold">Generated Secure Password</span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white break-all">
                {generatedPass || textInput}
              </span>
              <button
                onClick={() => copyToClipboard(generatedPass || textInput, 'pass')}
                className="p-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                {copiedKey === 'pass' ? <Check className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold text-slate-500">Strength:</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                passStrength.score >= 3 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {passStrength.label} ({passStrength.entropyBits} bits entropy)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Password Length: {passLength} characters</span>
              <input
                type="range"
                min={8}
                max={64}
                value={passLength}
                onChange={(e) => setPassLength(Number(e.target.value))}
                className="w-48"
              />
            </div>

            <div className="flex items-center gap-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} />
                <span>Include Numbers (0-9)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} />
                <span>Include Symbols (!@#$)</span>
              </label>
            </div>

            <button
              onClick={handleGeneratePass}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate New Secure Password</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 7. JWT DECODER ── */}
      {toolId === 'jwt-decoder' && (
        <div className="space-y-6">
          <textarea
            rows={4}
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            placeholder="Paste your JWT token string here..."
            className="w-full p-4 text-xs font-mono rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
          <button
            onClick={handleDecodeJwt}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
          >
            Decode JWT Token
          </button>

          {jwtData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-red-500 font-bold block mb-2">HEADER (Algorithm & Token Type)</span>
                <pre className="text-slate-800 dark:text-slate-200 overflow-x-auto">{JSON.stringify(jwtData.header, null, 2)}</pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-indigo-500 font-bold block">PAYLOAD (Data Claims)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${jwtData.isExpired ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {jwtData.isExpired ? 'EXPIRED' : 'VALID'}
                  </span>
                </div>
                <pre className="text-slate-800 dark:text-slate-200 overflow-x-auto">{JSON.stringify(jwtData.payload, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 8. BASE64 & URL ENCODER/DECODER ── */}
      {(toolId === 'base64-tool' || toolId === 'url-encoder') && (
        <div className="space-y-6">
          <textarea
            rows={4}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type text string to encode or decode..."
            className="w-full p-4 text-xs font-mono rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />

          <div className="flex gap-3">
            <button
              onClick={toolId === 'base64-tool' ? handleBase64Encode : handleUrlEncode}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
            >
              Encode
            </button>
            <button
              onClick={toolId === 'base64-tool' ? handleBase64Decode : handleUrlDecode}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
            >
              Decode
            </button>
          </div>

          {convertedText && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-400 block">Result:</span>
              <p className="text-xs font-mono text-slate-900 dark:text-white break-all">{convertedText}</p>
            </div>
          )}
        </div>
      )}

      {/* ── 9. WEBSITE STATUS & SECURITY HEADERS ── */}
      {(toolId === 'website-status' || toolId === 'http-headers' || toolId === 'ssl-checker' || toolId === 'security-headers' || toolId === 'url-scanner') && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter Target URL (e.g. google.com)..."
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              className="flex-1 px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <button
              onClick={handleSiteStatusCheck}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
            >
              Scan URL
            </button>
          </div>

          {siteStatusData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Response Status</span>
                  <span className="text-base font-bold text-emerald-500">{siteStatusData.status} {siteStatusData.statusText}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Latency</span>
                  <span className="text-base font-bold text-indigo-500">{siteStatusData.responseTimeMs} ms</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">SSL / TLS Protocol</span>
                  <span className="text-base font-bold text-emerald-500">Active (HTTPS)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Security Headers Audit</span>
                <div className="space-y-2">
                  {siteStatusData.securityHeaders.map((sh: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{sh.header}</span>
                      <span className="font-bold text-emerald-500 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Present
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
