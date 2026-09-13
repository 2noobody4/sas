import React from 'react';
import { MotionBox } from '../../components/ui/MotionBox';

export const DemandesPage: React.FC = () => {
  return (
    <MotionBox as="div" type="page" variant="default" className="p-6">
      <MotionBox as="h1" type="text" variant="title" className="text-2xl font-bold">
        📋 Demandes en attente
      </MotionBox>
      <MotionBox as="p" type="text" variant="body" className="text-gray-500 mt-2">
        Consultez et gérez les demandes en attente d'approbation.
      </MotionBox>
      <MotionBox as="div" type="card" variant="default" className="p-4">
        <MotionBox as="p" type="text" variant="body" className="text-gray-400">
          Aucune demande en attente.
        </MotionBox>
      </MotionBox>
    </MotionBox>
  );
};

export default DemandesPage;
