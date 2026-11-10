"use client";

import React, { useEffect, useState, useRef } from 'react';
import { DollarSign, ShieldAlert } from 'lucide-react';
import type { AdSenseConfig } from '@/types';

interface AdBannerProps {
  placement: 'headerBanner' | 'toolResultBanner' | 'toolBottomBanner' | 'blogSidebarBanner';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement, className = '' }) => {
  const [config, setConfig] = useState<AdSenseConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/adsense')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setConfig(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Could not load AdSense config:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const trackedImpressionRef = useRef(false);

  useEffect(() => {
    if (!config?.enabled || !config?.publisherId) return;

    // Track real visitor impression once per mount
    if (!trackedImpressionRef.current) {
      trackedImpressionRef.current = true;
      try {
        fetch('/api/adsense/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ placement, type: 'impression' }),
        }).catch(() => {});
      } catch {}
    }

    if (config.testMode) return; // Do not call push in test mode placeholder

    // Initialize adsbygoogle
    if (!pushedRef.current && adRef.current) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (e) {
        console.warn('AdSense push error:', e);
      }
    }
  }, [config, placement]);

  const handleAdClick = () => {
    try {
      fetch('/api/adsense/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placement, type: 'click' }),
      }).catch(() => {});
    } catch {}
  };

  if (loading) {
    return null;
  }

  // If disabled and not in test mode, render nothing
  if (!config?.enabled && !config?.testMode) {
    return null;
  }

  const slotId = config?.slots?.[placement] || '';
  const rawPublisherId = config?.publisherId || 'ca-pub-2275978117553909';
  const publisherId = rawPublisherId.startsWith('ca-') ? rawPublisherId : `ca-${rawPublisherId}`;

  // Placement Labels and Dimensions
  const placementMeta = {
    headerBanner: {
      title: 'Top Header Leaderboard Ad',
      size: '728 × 90 Responsive',
      minHeight: 'min-h-[90px]',
    },
    toolResultBanner: {
      title: 'Tool Conversion Result Banner (High CTR)',
      size: 'Responsive / High Impact',
      minHeight: 'min-h-[140px]',
    },
    toolBottomBanner: {
      title: 'Tool Workspace Footer Banner',
      size: '728 × 90 / Responsive',
      minHeight: 'min-h-[90px]',
    },
    blogSidebarBanner: {
      title: 'Blog Article Sidebar Ad',
      size: '300 × 250 / Responsive',
      minHeight: 'min-h-[250px]',
    },
  }[placement];

  // Test / Preview Mode Box
  if (config?.testMode || !config?.enabled || !config?.publisherId) {
    return (
      <div
        onClick={handleAdClick}
        className={`w-full my-4 p-4 rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${placementMeta.minHeight} ${className}`}
      >
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-1">
          <DollarSign className="w-4 h-4" />
          Google AdSense Placement: {placementMeta.title}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Format: {placementMeta.size} • {slotId ? `Slot ID: ${slotId}` : 'Slot ID: (Auto / Not set)'} • {config?.publisherId ? config.publisherId : 'Publisher ID Pending in Admin'}
        </div>
        <div className="mt-2 text-[10px] text-amber-700/80 dark:text-amber-400/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          Preview / Test Mode Active (Configure or toggle in Admin Panel &gt; Monetization)
        </div>
      </div>
    );
  }

  // Real AdSense Unit
  return (
    <div 
      onClick={handleAdClick}
      className={`w-full my-4 overflow-hidden text-center flex justify-center items-center ${placementMeta.minHeight} ${className}`}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={publisherId}
        data-ad-slot={slotId || undefined}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

