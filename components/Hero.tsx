import React from 'react';
import { HERO_BG_URL } from '../content/hero';

interface HeroProps {
  onStartListening: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartListening }) => {
  return (
    <div className="relative h-[450px] w-full overflow-hidden group">
      {/* Background Image with Tint and Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
        style={{ 
          backgroundImage: `url(${HERO_BG_URL})`,
        }}
      />
      
      {/* Dark Red Overlay to match the second image */}
      <div className="absolute inset-0 bg-[#3a0a0a]/60" />
      
      {/* Gradient Overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/20 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-12 max-w-6xl mx-auto w-full">
        <div className="animate-fade-in-up">
          <span className="text-fossils-red font-bold tracking-[0.3em] text-xs mb-4 block uppercase opacity-90">
            The Legend Returns
          </span>
          
          <h1 className="text-7xl md:text-9xl font-black text-white mb-6 tracking-tighter leading-none">
            FOSSILS
          </h1>
          
          <p className="text-zinc-200 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 font-medium">
            The raw energy of Bengali Rock. <span className="text-fossils-red font-bold">29+ Years</span> of revolutionizing the underground scene.
          </p>
          
          <button 
            onClick={onStartListening}
            className="group/btn flex items-center gap-4 bg-[#ba3232] hover:bg-[#d43d3d] text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 w-fit shadow-2xl"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transition-transform group-hover/btn:rotate-12">
              <i className="fa-solid fa-play text-[#ba3232] text-lg ml-1"></i>
            </div>
            <span className="tracking-widest text-sm uppercase">Start Listening</span>
          </button>
        </div>
      </div>
    </div>
  );
};
