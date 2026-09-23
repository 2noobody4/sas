import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { HomeBlock } from '../types/homeConfig';

const WidgetHero: React.FC<{ block: HomeBlock }> = ({ block }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 md:p-12">
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{block.title || 'Bienvenue sur App PME'}</h1>
        {block.subtitle && <p className="text-lg md:text-xl opacity-90 mb-6">{block.subtitle}</p>}
        {block.content && <p className="text-base opacity-80 mb-6">{block.content}</p>}
        {block.link_url && block.link_label && (
          <Link to={block.link_url} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition">
            {block.link_label} <ChevronRight size={18} />
          </Link>
        )}
      </div>
      {block.image_url && (
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block">
          <img src={block.image_url} alt={block.title || 'Hero'} className="w-full h-full object-cover opacity-40" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
};

export default WidgetHero;
