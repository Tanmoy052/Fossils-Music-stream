import React from "react";

export const FooterLinks = () => {
  return (
    <div className="flex flex-wrap gap-8 p-8 mt-8 border-t border-white/10 text-sm text-zinc-400">
      <div className="w-full pt-8 flex justify-between text-xs">
        <div className="flex gap-4">
          <a href="#" className="hover:text-white">
            Legal
          </a>
          <a href="#" className="hover:text-white">
            Privacy Center
          </a>
          <a href="#" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white">
            Cookies
          </a>
          <a href="#" className="hover:text-white">
            About Ads
          </a>
          <a href="#" className="hover:text-white">
            Accessibility
          </a>
        </div>
        <div>&copy; 2024 Fossils Music Stream</div>
      </div>
    </div>
  );
};
