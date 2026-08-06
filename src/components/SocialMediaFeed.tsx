import React from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import { Share2 } from 'lucide-react';

export default function SocialMediaFeed() {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm h-full flex flex-col w-full">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <Share2 className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-black text-slate-900">
          Live Updates
        </h3>
      </div>
      
      <div className="flex-1 min-h-[400px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
        <TwitterTimelineEmbed
          sourceType="profile"
          screenName="MIT"
          options={{ height: 400 }}
          noHeader
          noFooter
          noBorders
          transparent
        />
      </div>
    </div>
  );
}
