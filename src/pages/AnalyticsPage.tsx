import React from 'react';
import { MotionBox } from '../components/MotionBox';

export const AnalyticsPage: React.FC = () => {
  return (
    <MotionBox as="div" type="page" variant="default" className="p-6">
      <MotionBox as="h1" type="text" variant="title" className="text-2xl font-bold">
        📊 Analytics
      </MotionBox>
      <MotionBox as="p" type="text" variant="body" className="text-gray-500 mt-2">
        Statistiques et indicateurs de performance.
      </MotionBox>
      <MotionBox as="div" type="grid" variant="stats" className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <MotionBox as="div" type="stat" variant="default" className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <MotionBox as="p" type="text" variant="caption" className="text-sm text-gray-500">Visites</MotionBox>
          <MotionBox as="p" type="text" variant="stat" className="text-2xl font-bold">1,234</MotionBox>
        </MotionBox>
        <MotionBox as="div" type="stat" variant="default" className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <MotionBox as="p" type="text" variant="caption" className="text-sm text-gray-500">Utilisateurs</MotionBox>
          <MotionBox as="p" type="text" variant="stat" className="text-2xl font-bold">567</MotionBox>
        </MotionBox>
        <MotionBox as="div" type="stat" variant="default" className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <MotionBox as="p" type="text" variant="caption" className="text-sm text-gray-500">Ventes</MotionBox>
          <MotionBox as="p" type="text" variant="stat" className="text-2xl font-bold">89</MotionBox>
        </MotionBox>
        <MotionBox as="div" type="stat" variant="default" className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <MotionBox as="p" type="text" variant="caption" className="text-sm text-gray-500">CA</MotionBox>
          <MotionBox as="p" type="text" variant="stat" className="text-2xl font-bold">12 450 €</MotionBox>
        </MotionBox>
      </MotionBox>
    </MotionBox>
  );
};

export default AnalyticsPage;
