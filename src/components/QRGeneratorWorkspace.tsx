import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Link as LinkIcon, Download, Image as ImageIcon, Palette, Type } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';

export const QRGeneratorWorkspace: React.FC = () => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);

  const [activeTab, setActiveTab] = useState<'link' | 'wifi'>('link');
  
  // Data State
  const [linkData, setLinkData] = useState('https://stackx.com');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  
  // Style State
  const [dotsType, setDotsType] = useState<'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded'>('rounded');
  const [cornersSquareType, setCornersSquareType] = useState<'dot' | 'square' | 'extra-rounded'>('extra-rounded');
  const [colorStart, setColorStart] = useState('#EF4444');
  const [colorEnd, setColorEnd] = useState('#3B82F6');
  const [useGradient, setUseGradient] = useState(true);
  const [logoImage, setLogoImage] = useState<string | null>(null);

  // Generate QR Data String based on active tab
  const getQrData = () => {
    if (activeTab === 'wifi') {
      return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
    }
    return linkData;
  };

  // Initialize QR Code Styling instance
  useEffect(() => {
    const qr = new QRCodeStyling({
      width: 300,
      height: 300,
      data: getQrData(),
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H'
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 5,
        crossOrigin: 'anonymous',
      },
      dotsOptions: {
        color: '#000000',
        type: 'rounded'
      },
      backgroundOptions: {
        color: 'transparent',
      },
      cornersSquareOptions: {
        color: '#000000',
        type: 'extra-rounded'
      },
      cornersDotOptions: {
        color: '#000000',
        type: 'dot'
      }
    });
    setQrCode(qr);
  }, []); // Run once on mount

  // Update QR Code when options change
  useEffect(() => {
    if (!qrCode) return;

    qrCode.update({
      data: getQrData() || ' ',
      image: logoImage || undefined,
      dotsOptions: {
        type: dotsType,
        ...(useGradient
          ? {
              gradient: {
                type: 'linear',
                rotation: Math.PI / 4,
                colorStops: [
                  { offset: 0, color: colorStart },
                  { offset: 1, color: colorEnd }
                ]
              }
            }
          : { color: colorStart })
      },
      cornersSquareOptions: {
        type: cornersSquareType,
        color: colorStart
      },
      cornersDotOptions: {
        type: 'dot',
        color: colorEnd
      }
    });
  }, [
    qrCode,
    activeTab,
    linkData,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    dotsType,
    cornersSquareType,
    colorStart,
    colorEnd,
    useGradient,
    logoImage
  ]);

  // Mount/Unmount QR code DOM element
  useEffect(() => {
    if (qrCode && qrRef.current) {
      qrRef.current.innerHTML = ''; // Clear previous
      qrCode.append(qrRef.current);
    }
  }, [qrCode, qrRef]);

  const handleDownload = (ext: 'png' | 'svg') => {
    if (qrCode) {
      qrCode.download({ name: `stackx-qr-${Date.now()}`, extension: ext });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Panel - Settings */}
      <div className="flex-1 space-y-6">
        
        {/* Type Selection Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-indigo-500" /> Content Type
          </h3>
          
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'link' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-4 h-4" /> Link / Text
            </button>
            <button
              onClick={() => setActiveTab('wifi')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'wifi' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Wifi className="w-4 h-4" /> WiFi
            </button>
          </div>

          {/* Content Inputs */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Enter URL or Text</label>
                <textarea
                  value={linkData}
                  onChange={(e) => setLinkData(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-28 resize-none"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          )}

          {activeTab === 'wifi' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Network Name (SSID)</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="My WiFi Network"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Leave empty if open"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Encryption</label>
                  <select
                    value={wifiEncryption}
                    onChange={(e) => setWifiEncryption(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="WPA">WPA/WPA2/WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                    />
                    Hidden Network
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Styling Options */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-fuchsia-500" /> Premium Styling
          </h3>

          <div className="space-y-6">
            
            {/* Pattern Settings */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">QR Pattern Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'].map(type => (
                  <button
                    key={type}
                    onClick={() => setDotsType(type as any)}
                    className={`px-3 py-2 text-xs font-semibold capitalize rounded-lg transition-all ${
                      dotsType === type
                        ? 'bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800/50'
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                    } border`}
                  >
                    {type.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Squares */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Corner Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['dot', 'square', 'extra-rounded'].map(type => (
                  <button
                    key={type}
                    onClick={() => setCornersSquareType(type as any)}
                    className={`px-3 py-2 text-xs font-semibold capitalize rounded-lg transition-all ${
                      cornersSquareType === type
                        ? 'bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800/50'
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                    } border`}
                  >
                    {type.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Color & Gradient</label>
              <div className="flex gap-4 items-center mb-3">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useGradient}
                    onChange={(e) => setUseGradient(e.target.checked)}
                    className="w-4 h-4 rounded text-fuchsia-500 focus:ring-fuchsia-500"
                  />
                  Use Gradient
                </label>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-xs text-slate-500">Color 1 (Dots & Squares)</span>
                  <input
                    type="color"
                    value={colorStart}
                    onChange={(e) => setColorStart(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-none p-1"
                  />
                </div>
                {useGradient && (
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Color 2 (End Gradient)</span>
                    <input
                      type="color"
                      value={colorEnd}
                      onChange={(e) => setColorEnd(e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-none p-1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Center Logo / Image</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {logoImage && (
                  <button
                    onClick={() => setLogoImage(null)}
                    className="px-4 py-3 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    Clear Logo
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right Panel - Preview & Download */}
      <div className="w-full lg:w-[450px]">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-fuchsia-500/5 border border-slate-200 dark:border-slate-800 lg:sticky lg:top-24 flex flex-col items-center">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-8 w-full text-center">
            Live Preview
          </h3>
          
          {/* QR Container */}
          <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100">
            <div ref={qrRef} className="flex items-center justify-center" />
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-6 mb-8 max-w-[280px]">
            Scan this code with your phone's camera to verify it works correctly.
          </p>

          <div className="w-full grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDownload('png')}
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-fuchsia-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" /> Download PNG
            </button>
            <button
              onClick={() => handleDownload('svg')}
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" /> Export Vector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
