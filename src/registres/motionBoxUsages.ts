import { ComponentStyle } from '../types/theme';
import { 
  MOTIONBOX_USAGES, 
  MotionBoxUsage, 
  getMotionBoxUsagesByPage as _getMotionBoxUsagesByPage,
  getAllPages as _getAllPages,
  getMotionBoxUsageById as _getMotionBoxUsageById,
  getMotionBoxUsagesByType as _getMotionBoxUsagesByType,
  searchMotionBoxUsages as _searchMotionBoxUsages
} from './motionBoxRegistry';

// ✅ Ré-export depuis le nouveau registre pour compatibilité
export { MOTIONBOX_USAGES };
export type { MotionBoxUsage };

// ✅ Ré-exporter les fonctions
export const getMotionBoxUsagesByPage = _getMotionBoxUsagesByPage;
export const getAllPages = _getAllPages;
export const getMotionBoxUsageById = _getMotionBoxUsageById;
export const getMotionBoxUsagesByType = _getMotionBoxUsagesByType;
export const searchMotionBoxUsages = _searchMotionBoxUsages;

// ============================================================
// FONCTION POUR SYNC LES STYLES PAR DÉFAUT EN BASE
// ============================================================
export function getDefaultComponentStyles(): ComponentStyle[] {
  return [
    { typeComponent: 'button:primary', style: { proprietes: { backgroundColor: '#1E3A5F', color: '#FFFFFF', borderRadius: 8, padding: '12px 20px', fontWeight: 600, border: 'none', cursor: 'pointer' } } },
    { typeComponent: 'button:secondary', style: { proprietes: { backgroundColor: 'transparent', color: '#1E3A5F', borderRadius: 8, padding: '12px 20px', fontWeight: 600, border: '1px solid #E2E6EA', cursor: 'pointer' } } },
    { typeComponent: 'card:small', style: { proprietes: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: '8px 12px', border: '1px solid #E2E6EA' } } },
    { typeComponent: 'card:medium', style: { proprietes: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: '16px 20px', border: '1px solid #E2E6EA', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } } },
    { typeComponent: 'card:large', style: { proprietes: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: '24px 28px', border: '1px solid #E2E6EA', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' } } },
    { typeComponent: 'text:title', style: { proprietes: { fontSize: 24, fontWeight: 700, color: '#1E3A5F', lineHeight: 1.2 } } },
    { typeComponent: 'text:body', style: { proprietes: { fontSize: 16, color: '#495057', lineHeight: 1.6 } } },
  ];
}

export function findMotionBoxUsage(id: string): MotionBoxUsage | undefined {
  return _getMotionBoxUsageById(id);
}
