import React from 'react';
import { Link } from 'react-router-dom';
import { HomeBlock } from '../../../types/homeConfig';

const WidgetBanner: React.FC<{ block: HomeBlock }> = ({ block }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[300px]">
      {block.image_url ? (
        <img 
          src={block.image_url} 
          alt={block.title || 'Bannière'} 
          className="w-full h-[300px] object-cover"
        />
      ) : (
        <div className="w-full h-[300px] bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white">
          <span className="text-6xl opacity-20">📢</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center p-8">
        <div className="text-center text-white max-w-2xl">
          {block.title && (
            <h3 className="text-2xl md:text-3xl font-bold mb-3 drop-shadow-lg">
              {block.title}
            </h3>
          )}
          {block.subtitle && (
            <p className="text-lg md:text-xl opacity-95 mb-4 drop-shadow-md">
              {block.subtitle}
            </p>
          )}
          {block.link_url && block.link_label && (
            <Link 
              to={block.link_url} 
              className="inline-block mt-2 px-8 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              {block.link_label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetBanner;
