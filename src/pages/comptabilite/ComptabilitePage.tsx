import React from 'react';
import { MotionBox } from '../../components/ui/MotionBox';

export const ComptabilitePage: React.FC = () => {
  return (
    <MotionBox as="div" type="page" variant="default" className="p-6">
      <MotionBox as="h1" type="text" variant="title" className="text-2xl font-bold">
        📊 Comptabilité
      </MotionBox>
      <MotionBox as="p" type="text" variant="body" className="text-gray-500 mt-2">
        Gérez les factures, les dépenses et les rapports financiers.
      </MotionBox>
      <MotionBox as="div" type="grid" variant="cards" className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <MotionBox as="div" type="card" variant="default" className="p-4">
          <MotionBox as="div" type="icon" variant="large" className="text-2xl">🧾</MotionBox>
          <MotionBox as="h3" type="text" variant="subtitle" className="font-semibold mt-2">Factures</MotionBox>
          <MotionBox as="p" type="text" variant="caption" className="text-sm text-gray-500">Créer et gérer les factures</MotionBox>
        </MotionBox>
        <MotionBox as="div" type="card" variant="default" className="p-4">
          <MotionBox as="div" type="icon" variant="large" className="text-2xl">💸</MotionBox>
          <MotionBox as="h3" type="text" variant="subtitle" className="font-semibold mt-2">Dépenses</MotionBox>
          <MotionBox as="p" type="text" variant="caption" className="text-sm text-gray-500">Enregistrer les dépenses</MotionBox>
        </MotionBox>
        <MotionBox as="div" type="card" variant="default" className="p-4">
          <MotionBox as="div" type="icon" variant="large" className="text-2xl">📈</MotionBox>
          <MotionBox as="h3" type="text" variant="subtitle" className="font-semibold mt-2">Rapports</MotionBox>
          <MotionBox as="p" type="text" variant="caption" className="text-sm text-gray-500">Bilan et compte de résultat</MotionBox>
        </MotionBox>
      </MotionBox>
    </MotionBox>
  );
};

export default ComptabilitePage;
