/**
 * ClientSearchSelect – Composant de recherche et sélection de client
 * Compatible React 16.14
 */

import React, { useState, useEffect, useRef } from 'react';
import { MotionBox } from '../ui/MotionBox';
import { Search, User, X, Check, Loader } from 'lucide-react';
import { useClients } from '../../hooks/useClients';
import { Client } from '../../types/clients';

interface ClientSearchSelectProps {
  value: string;
  onChange: (clientId: string, client?: Client) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
}

export const ClientSearchSelect: React.FC<ClientSearchSelectProps> = ({
  value,
  onChange,
  placeholder = 'Rechercher un client...',
  className = '',
  disabled = false,
  required = false,
  autoFocus = false,
}) => {
  const { data: clients = [], isLoading } = useClients();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mettre à jour le client sélectionné quand la valeur change
  useEffect(() => {
    if (value) {
      const client = clients.find((c: Client) => c.id === value);
      if (client) {
        setSelectedClient(client);
        setSearchTerm(`${client.nom} ${client.prenom || ''}`.trim());
      }
    } else {
      setSelectedClient(null);
      setSearchTerm('');
    }
  }, [value, clients]);

  // Filtrer les clients
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients.slice(0, 10));
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = clients.filter((c: Client) => {
      const fullName = `${c.nom} ${c.prenom || ''}`.toLowerCase();
      return fullName.includes(term) || c.email?.toLowerCase().includes(term) || c.telephone?.includes(term);
    });
    setFilteredClients(filtered.slice(0, 15));
  }, [searchTerm, clients]);

  // Fermer le dropdown au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (client: Client) => {
    setSelectedClient(client);
    setSearchTerm(`${client.nom} ${client.prenom || ''}`.trim());
    onChange(client.id, client);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClient(null);
    setSearchTerm('');
    onChange('', undefined);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (selectedClient) {
      setSelectedClient(null);
      onChange('', undefined);
    }
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const getClientDisplay = (client: Client) => {
    const name = `${client.nom} ${client.prenom || ''}`.trim();
    const details = [client.email, client.telephone].filter(Boolean).join(' · ');
    return { name, details };
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="flex items-center border rounded-xl border-[var(--color-borderColor)] bg-[var(--color-cardBg)] focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:border-transparent transition">
          <div className="pl-3 text-[var(--color-textSecondary)]">
            <User size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            className="flex-1 px-2 py-2 bg-transparent text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] outline-none"
          />
          {isLoading && (
            <div className="pr-3 text-[var(--color-textSecondary)] animate-spin">
              <Loader size={18} />
            </div>
          )}
          {searchTerm && !disabled && (
            <button
              onClick={handleClear}
              className="pr-3 text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]"
            >
              <X size={16} />
            </button>
          )}
          {selectedClient && (
            <div className="pr-3 text-[var(--color-success)]">
              <Check size={16} />
            </div>
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        <MotionBox
          as="div"
          className="absolute z-50 w-full mt-1 overflow-hidden rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] shadow-lg max-h-60 overflow-y-auto"
          animation={{ animationInitiale: 'fadeIn' }}
        >
          {filteredClients.length === 0 ? (
            <div className="p-4 text-center text-[var(--color-textSecondary)]">
              {searchTerm.trim() ? 'Aucun client trouvé' : 'Commencez à taper pour rechercher'}
            </div>
          ) : (
            filteredClients.map((client: Client) => {
              const { name, details } = getClientDisplay(client);
              const isSelected = selectedClient?.id === client.id;
              return (
                <button
                  key={client.id}
                  onClick={() => handleSelect(client)}
                  className={`w-full px-4 py-2 text-left hover:bg-[var(--color-secondary)] transition flex items-center justify-between ${
                    isSelected ? 'bg-[var(--color-primary-light)]' : ''
                  }`}
                >
                  <div>
                    <span className="font-medium text-[var(--color-textPrimary)]">{name}</span>
                    {details && (
                      <span className="ml-2 text-sm text-[var(--color-textSecondary)]">{details}</span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="text-[var(--color-success)]">
                      <Check size={16} />
                    </span>
                  )}
                </button>
              );
            })
          )}
          {!isLoading && filteredClients.length > 0 && filteredClients.length >= 15 && (
            <div className="p-2 text-center text-xs text-[var(--color-textSecondary)] border-t border-[var(--color-borderColor)]">
              {`${filteredClients.length}+ clients — Affinez votre recherche`}
            </div>
          )}
        </MotionBox>
      )}
    </div>
  );
};

export default ClientSearchSelect;
