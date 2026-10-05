import React from 'react';
import { generateQrSvgPath } from '../../utils/qrCodeGenerator';

interface QrCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  showLogo?: boolean;
}

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  value,
  size = 220,
  className = '',
  showLogo = true,
}) => {
  const { svgPath } = generateQrSvgPath(value, size);

  return (
    <div className={`relative inline-flex items-center justify-center bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-md ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={size} height={size} fill="#ffffff" rx="12" />
        <path d={svgPath} fill="#0f172a" />
      </svg>

      {showLogo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 bg-slate-900 rounded-xl border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs tracking-tighter">
            <span className="text-blue-400">S</span>FLY
          </div>
        </div>
      )}
    </div>
  );
};
