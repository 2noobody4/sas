import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Bug } from 'lucide-react';

export const DebugButton: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  // Ne pas afficher si on est déjà sur /debug
  if (location.pathname === '/debug') return null;

  return (
    <button
      onClick={() => history.push('/debug')}
      style={{
        position: 'fixed',
        bottom: '160px',
        right: '16px',
        zIndex: 2147483647,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#000',
        color: '#0f0',
        border: '2px solid #0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        fontSize: '20px',
      }}
      title="Ouvrir la page Debug"
    >
      🐛
    </button>
  );
};

export default DebugButton;
