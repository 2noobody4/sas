import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { MotionBox } from './MotionBox';
import { X, Camera, RefreshCw } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);
  const containerId = 'scanner-container';

  const startScanner = async () => {
    try {
      // Nettoyer l'ancien scanner s'il existe
      if (scannerRef.current) {
        try {
          if (isRunningRef.current) {
            await scannerRef.current.stop();
            isRunningRef.current = false;
          }
        } catch (e) { /* ignore */ }
        scannerRef.current.clear();
        scannerRef.current = null;
      }

      scannerRef.current = new Html5Qrcode(containerId);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText: string) => {
          onScan(decodedText);
          onClose();
        },
        (errorMessage: string) => {
          // Ignorer les erreurs de décodage
        }
      );

      isRunningRef.current = true;
      setIsScanning(true);
      setError(null);
    } catch (err: any) {
      console.error('[BarcodeScanner] Erreur:', err);
      let msg = err.message || 'Erreur inconnue';
      
      if (msg.includes('Permission') || msg.includes('permission') || msg.includes('NotAllowedError')) {
        msg = '⚠️ Autorisation caméra refusée. Vérifiez les permissions de votre navigateur.';
      } else if (msg.includes('NotFoundError') || msg.includes('not found')) {
        msg = '📷 Aucune caméra détectée. Vérifiez votre appareil.';
      } else if (msg.includes('NotReadableError')) {
        msg = '🔒 Caméra déjà utilisée par une autre application. Fermez les autres apps.';
      } else if (msg.includes('OverconstrainedError')) {
        msg = '🔄 Caméra non disponible. Essayez avec une autre caméra.';
      }
      
      setError(msg);
      setIsScanning(false);
      isRunningRef.current = false;
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      // Nettoyage robuste
      const cleanup = async () => {
        if (scannerRef.current) {
          try {
            if (isRunningRef.current) {
              await scannerRef.current.stop();
              isRunningRef.current = false;
            }
          } catch (e) {
            // Ignorer les erreurs lors du stop
          }
          try {
            scannerRef.current.clear();
          } catch (e) { /* ignore */ }
          scannerRef.current = null;
        }
      };
      cleanup();
    };
  }, [retryKey]);

  const handleRetry = () => {
    setError(null);
    setIsScanning(false);
    setRetryKey(prev => prev + 1);
  };

  return (
    <MotionBox
      as="div"
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 modal-overlay-safe"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      animation={{ animationInitiale: 'fadeIn' }}
    >
      <MotionBox
        as="div"
        className="bg-[var(--color-cardBg)] rounded-xl w-full max-w-md p-4 relative"
        animation={{ animationInitiale: 'slideUp' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] flex items-center gap-2">
            <Camera size={20} /> Scanner
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
          >
            <X size={20} />
          </button>
        </div>

        <div
          id={containerId}
          className="w-full aspect-square bg-black rounded-lg overflow-hidden"
        />

        {error && (
          <div className="mt-3 text-center">
            <p className="text-sm text-[var(--color-danger)] mb-2">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} /> Réessayer
            </button>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-1 text-sm text-[var(--color-textSecondary)] hover:underline"
            >
              Annuler
            </button>
          </div>
        )}

        {!error && !isScanning && (
          <p className="text-sm text-[var(--color-textSecondary)] mt-3 text-center">
            Initialisation de la caméra...
          </p>
        )}

        {isScanning && !error && (
          <p className="text-sm text-[var(--color-textSecondary)] mt-3 text-center">
            Placez un code-barres ou QR code dans le cadre
          </p>
        )}
      </MotionBox>
    </MotionBox>
  );
};

export default BarcodeScanner;
