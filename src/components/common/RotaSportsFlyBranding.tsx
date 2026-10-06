import React from 'react';
import { SportsFlyVectorMark } from '../SportsFlyLogo';
import { ROTA_PERFORMANS_LOGO_DATA_URL } from '../../assets/rotaPerformansLogoDataUrl';

export interface RotaSportsFlyHeaderBadgeProps {
  isDark?: boolean;
  pageNo?: number;
  totalReportPages?: number;
  effectiveSecondaryHex?: string;
  hideRota?: boolean;
  hideSportsFly?: boolean;
}

/**
 * Co-branding header badge:
 * - Analysis Firm: Rota Performans (with official circular logo)
 * - Infrastructure Provider: Powered by SportsFly LAB (links to https://sportsfly.com.tr)
 */
export const RotaSportsFlyHeaderBadge: React.FC<RotaSportsFlyHeaderBadgeProps> = ({
  isDark = false,
  pageNo,
  totalReportPages,
  effectiveSecondaryHex,
  hideRota = false,
  hideSportsFly = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between sm:justify-end print:justify-end gap-2.5 px-3 py-1.5 rounded-xl border shrink-0 transition-colors ${
        isDark
          ? 'bg-white/10 border-white/20 text-white'
          : 'bg-white border-slate-200/90 text-slate-900 shadow-2xs'
      }`}
    >
      {!hideRota && (
        <>
          {/* 1. Rota Performans */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 border border-cyan-400/60 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/rota-performans-logo.png"
                alt="Rota Performans Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <div
                className={`text-[11px] font-black tracking-tight leading-tight uppercase ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                ROTA <span className="text-cyan-500">PERFORMANS</span>
              </div>
            </div>
          </div>
          {!hideSportsFly && <div className={`h-6 w-px ${isDark ? 'bg-white/20' : 'bg-slate-200'}`} />}
        </>
      )}

      {!hideSportsFly && (
        /* 2. Powered by SportsFly LAB (Directs to https://sportsfly.com.tr) */
        <a
          href="https://sportsfly.com.tr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
          title="SportsFly LAB"
        >
          <SportsFlyVectorMark className="w-5 h-5 shrink-0" />
          <div className="text-left">
            <div
              className={`text-[7.5px] font-sans font-extrabold uppercase tracking-wider leading-none ${
                isDark ? 'text-white/60' : 'text-slate-400'
              }`}
            >
              Powered by
            </div>
            <div className="flex items-center gap-0.5 leading-tight mt-0.5">
              <span
                className={`text-[10px] font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                SportsFly
              </span>
              <span
                className="text-[9px] font-black tracking-wider uppercase"
                style={{ color: isDark ? (effectiveSecondaryHex || '#38bdf8') : '#0284c7' }}
              >
                LAB
              </span>
            </div>
          </div>
        </a>
      )}

      {/* Note: Page numbers removed per user request */}
    </div>
  );
};

export interface RotaSportsFlyFooterBadgeProps {
  primaryHex?: string;
  clubName?: string;
  athleteCode?: string;
  pageText?: string;
  hideRota?: boolean;
  hideSportsFly?: boolean;
}

/**
 * Co-branding footer badge for bottom of A4 reports
 * Links SportsFly to https://sportsfly.com.tr
 */
export const RotaSportsFlyFooterBadge: React.FC<RotaSportsFlyFooterBadgeProps> = ({
  primaryHex = '#0284c7',
  clubName,
  athleteCode,
  pageText,
  hideRota = false,
  hideSportsFly = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between gap-2.5 bg-slate-50/95 px-3.5 py-2 rounded-xl border border-slate-200 text-left">
      {/* Left: Dual Brand Attribution */}
      <div className="flex flex-wrap items-center gap-3">
        {!hideRota && (
          /* Rota Performans */
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-white p-0.5 border border-cyan-400 shadow-2xs shrink-0 flex items-center justify-center">
              <img
                src="/rota-performans-logo.png"
                alt="Rota Performans"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-[10.5px] font-black tracking-tight text-slate-900 leading-tight">
                ROTA <span className="text-cyan-600">PERFORMANS</span>
              </div>
            </div>
          </div>
        )}

        {!hideRota && !hideSportsFly && <span className="text-slate-300 hidden sm:inline print:inline">|</span>}

        {!hideSportsFly && (
          /* Powered by SportsFly LAB -> Redirects to sportsfly.com.tr */
          <a
            href="https://sportsfly.com.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
            title="SportsFly LAB"
          >
            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
              <SportsFlyVectorMark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1 leading-tight">
                <span className="text-[8px] font-sans font-bold text-slate-400 uppercase">
                  Powered by
                </span>
                <span className="text-[10px] font-black tracking-tight text-slate-900">
                  SportsFly <span style={{ color: primaryHex }}>LAB</span>
                </span>
              </div>
            </div>
          </a>
        )}
      </div>

      {/* Right: Verification & Page Index */}
      {(clubName || athleteCode || pageText) && (
        <div className="flex items-center justify-between sm:justify-end print:justify-end gap-2.5 text-[10px] shrink-0 font-sans">
          {clubName && (
            <div className="text-right hidden sm:block print:block font-bold text-slate-700 uppercase tracking-tight">
              {clubName}
            </div>
          )}
          {athleteCode && pageText && (
            <div
              className="font-bold px-2 py-0.5 rounded-lg text-white text-[10px]"
              style={{ backgroundColor: primaryHex }}
            >
              {athleteCode} · {pageText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
