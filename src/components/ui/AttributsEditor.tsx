import React, { useState } from 'react';
import { MotionBox } from './MotionBox';
import { Plus, X } from 'lucide-react';

interface AttributsEditorProps {
  value: Record<string, string | number>;
  onChange: (value: Record<string, string | number>) => void;
  className?: string;
}

export const AttributsEditor: React.FC<AttributsEditorProps> = ({
  value = {},
  onChange,
  className = '',
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addAttribut = () => {
    if (!newKey.trim()) return;
    onChange({ ...value, [newKey.trim()]: newValue || '' });
    setNewKey('');
    setNewValue('');
  };

  const removeAttribut = (key: string) => {
    const { [key]: _, ...rest } = value;
    onChange(rest);
  };

  const updateValue = (key: string, val: string) => {
    onChange({ ...value, [key]: val });
  };

  const entries = Object.entries(value);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Clé (ex: couleur)"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="flex-1 min-w-[80px] px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] text-sm"
        />
        <input
          type="text"
          placeholder="Valeur (ex: rouge)"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1 min-w-[80px] px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] text-sm"
        />
        <button
          type="button"
          onClick={addAttribut}
          className="px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition flex items-center gap-1"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {entries.length > 0 && (
        <div className="space-y-1">
          {entries.map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-textPrimary)] min-w-[80px]">{key}:</span>
              <input
                type="text"
                value={val}
                onChange={(e) => updateValue(key, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-sm"
              />
              <button
                type="button"
                onClick={() => removeAttribut(key)}
                className="p-1 rounded hover:bg-red-50 text-[var(--color-danger)] transition"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttributsEditor;
