import React from 'react';

const items = [
  '🏠 House Construction', '🛋️ Interior Design', '💧 Waterproofing', '🔌 Electrical Works',
  '🎨 Painting', '🪵 Flooring', '🔧 Plumbing', '🏗️ Villa Construction', '🚪 Smart Locks',
  '☀️ Solar Installation', '📹 CCTV', '🍳 Modular Kitchen', '🏢 Commercial Buildings',
  '🛁 Bathroom Plumbing', '💡 False Ceiling', '🎬 Home Theatre',
];

export default function MarqueeBanner() {
  return (
    <div className="py-5 overflow-hidden border-y border-white/5 bg-white/[0.02]">
      <div className="flex animate-marquee whitespace-nowrap gap-0">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center mx-6 text-sm text-white/30 font-medium shrink-0">
            {item}
            <span className="mx-6 text-blue-500/30">·</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </div>
  );
}