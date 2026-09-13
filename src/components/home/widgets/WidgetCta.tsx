import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { HomeBlock } from '../../../types/homeConfig';

const WidgetCta: React.FC<{ block: HomeBlock }> = ({ block }) => {
  return (
    <div className="py-4">
      <div className="rounded-2xl bg-gray-900 p-10 md:p-14 text-center text-white shadow-xl border border-gray-700">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            {block.title || 'Prêt à démarrer ?'}
          </h2>
          {block.subtitle && (
            <p className="text-lg md:text-xl text-gray-300 mb-6">
              {block.subtitle}
            </p>
          )}
          {block.link_url && block.link_label && (
            <Link 
              to={block.link_url} 
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {block.link_label} <ChevronRight size={20} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetCta;
