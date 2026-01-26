import React from "react";

export const FooterLinks: React.FC = () => {
  return (
    <div className="border-t border-white/10 px-8 py-6 text-sm text-zinc-400 flex flex-wrap gap-x-8 gap-y-3">
      <button className="hover:text-white transition">Legal</button>
      <button className="hover:text-white transition">Safety & Privacy Center</button>
      <button className="hover:text-white transition">Privacy Policy</button>
      <button className="hover:text-white transition">Cookies</button>
      <button className="hover:text-white transition">About Ads</button>
      <button className="hover:text-white transition">Accessibility</button>
    </div>
  );
};
