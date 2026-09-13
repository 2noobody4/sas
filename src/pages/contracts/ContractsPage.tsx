// ============================================================
// CONTRACTS PAGE — Affichage des contrats avec MotionBox
// ============================================================

import React, { useState } from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { UploadDocument } from '../../components/ui/UploadDocument';
import { UploadVideo } from '../../components/ui/UploadVideo';
import { UploadAudio } from '../../components/ui/UploadAudio';
import { FileText, Video, Music, Plus, Trash2, Eye, Download } from 'lucide-react';

const demoContracts = [
  { id: 1, nom: 'Contrat de vente #001', type: 'document', date: '2025-01-15' },
  { id: 2, nom: 'Contrat de prestation #002', type: 'document', date: '2025-02-20' },
  { id: 3, nom: 'Vidéo de présentation', type: 'video', date: '2025-03-05' },
];

export const ContractsPage: React.FC = () => {
  const [documents, setDocuments] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [audios, setAudios] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'documents' | 'videos' | 'audios'>('documents');

  return (
    <div className="flex h-screen w-screen bg-[var(--color-background)]">
      {/* Container gauche — 90% */}
      <MotionBox
        as="div"
        type="page"
        variant="default"
        className="w-[90%] h-full overflow-y-auto p-6 bg-[var(--color-background)]"
      >
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] mb-6">📄 Contrats</h1>

        {/* Sélecteur d'onglets */}
        <div className="flex gap-2 mb-6 border-b border-[var(--color-borderColor)] pb-2">
          {[
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'videos', label: 'Vidéos', icon: Video },
            { id: 'audios', label: 'Audios', icon: Music },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)]'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenu selon l'onglet */}
        {selectedTab === 'documents' && (
          <>
            <UploadDocument
              files={documents}
              onChange={setDocuments}
              max={5}
              bucket="contrats"
              label="Ajouter des documents"
            />
            <div className="mt-4 grid grid-cols-1 gap-3">
              {demoContracts.filter(c => c.type === 'document').map((c) => (
                <MotionBox
                  key={c.id}
                  type="card"
                  variant="default"
                  className="flex items-center justify-between p-3"
                >
                  <div>
                    <p className="font-medium text-[var(--color-textPrimary)]">{c.nom}</p>
                    <p className="text-xs text-[var(--color-textSecondary)]">{c.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
                      <Eye size={16} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
                      <Download size={16} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </MotionBox>
              ))}
            </div>
          </>
        )}

        {selectedTab === 'videos' && (
          <>
            <UploadVideo
              videos={videos}
              onChange={setVideos}
              max={3}
              bucket="contrats_videos"
              label="Ajouter des vidéos"
            />
            <p className="mt-4 text-sm text-[var(--color-textSecondary)]">Les vidéos uploadées apparaîtront ici.</p>
          </>
        )}

        {selectedTab === 'audios' && (
          <>
            <UploadAudio
              audios={audios}
              onChange={setAudios}
              max={5}
              bucket="contrats_audios"
              label="Ajouter des audios"
            />
            <p className="mt-4 text-sm text-[var(--color-textSecondary)]">Les fichiers audio uploadés apparaîtront ici.</p>
          </>
        )}
      </MotionBox>

      {/* Container droit — 10% (sidebar) */}
      <MotionBox
        as="div"
        type="sidebar"
        variant="default"
        className="w-[10%] h-full bg-[var(--color-secondary)] border-l border-[var(--color-borderColor)] p-4 flex flex-col items-center space-y-4"
      >
        <div className="text-center">
          <p className="text-xs font-bold text-[var(--color-textSecondary)] uppercase tracking-wider">Actions</p>
        </div>
        <MotionBox
          as="button"
          type="button"
          variant="primary"
          className="w-full aspect-square rounded-xl flex flex-col items-center justify-center"
        >
          <Plus size={24} />
          <span className="text-[10px] mt-1">Nouveau</span>
        </MotionBox>
        <MotionBox
          as="button"
          type="button"
          variant="secondary"
          className="w-full aspect-square rounded-xl flex flex-col items-center justify-center border border-[var(--color-borderColor)]"
        >
          <FileText size={24} />
          <span className="text-[10px] mt-1">Documents</span>
        </MotionBox>
        <MotionBox
          as="button"
          type="button"
          variant="secondary"
          className="w-full aspect-square rounded-xl flex flex-col items-center justify-center border border-[var(--color-borderColor)]"
        >
          <Video size={24} />
          <span className="text-[10px] mt-1">Vidéos</span>
        </MotionBox>
        <MotionBox
          as="button"
          type="button"
          variant="secondary"
          className="w-full aspect-square rounded-xl flex flex-col items-center justify-center border border-[var(--color-borderColor)]"
        >
          <Music size={24} />
          <span className="text-[10px] mt-1">Audios</span>
        </MotionBox>
      </MotionBox>
    </div>
  );
};

export default ContractsPage;
