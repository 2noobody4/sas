import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload } from 'lucide-react';
import { MotionBox } from './MotionBox';
import { useToast } from '../../hooks/useToast';

interface AudioRecorderProps {
  onUpload: (url: string) => void;
  onCancel: () => void;
  className?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onUpload,
  onCancel,
  className = '',
}) => {
  const { error: toastError } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (audioRef.current) audioRef.current.src = url;
        stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setDuration(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(prev => prev + 1), 1000);
    } catch (err: any) {
      toastError('Impossible d\'accéder au microphone.');
      console.error('[AudioRecorder]', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!audioUrl) return;
    setUploading(true);
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const fileName = `audio_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.webm`;
      const file = new File([blob], fileName, { type: 'audio/webm' });
      const { supabase } = await import('../../lib/supabaseClient');
      const { error } = await supabase.storage.from('message_audios').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('message_audios').getPublicUrl(fileName);
      onUpload(urlData.publicUrl);
    } catch (err: any) {
      toastError(err.message || 'Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setDuration(0);
    onCancel();
  };
  return (
    <MotionBox type="card" variant="default" className={`p-4 bg-[var(--color-secondary)] rounded-xl ${className}`}>
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />

      {!audioUrl ? (
        <div className="flex items-center gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full ${isRecording ? 'bg-[var(--color-danger)] text-white animate-pulse' : 'bg-[var(--color-primary)] text-white'} hover:opacity-80 transition`}
          >
            {isRecording ? <Square size={20} /> : <Mic size={20} />}
          </button>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-textPrimary)]">
              {isRecording ? '🎙️ Enregistrement...' : 'Appuyez pour enregistrer'}
            </p>
            {isRecording && <p className="text-xs text-[var(--color-textSecondary)]">{formatTime(duration)}</p>}
          </div>
          {isRecording && (
            <button onClick={stopRecording} className="px-3 py-1 rounded-lg bg-[var(--color-danger)] text-white text-sm hover:bg-[var(--color-danger-dark)] transition">
              Arrêter
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button onClick={togglePlay} className="p-3 rounded-full bg-[var(--color-primary)] text-white hover:opacity-80 transition">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <div className="flex-1">
            <div className="h-2 bg-[var(--color-borderColor)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-primary)] transition-all duration-300" style={{ width: audioRef.current ? `${(audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100}%` : '0%' }} />
            </div>
            <p className="text-xs text-[var(--color-textSecondary)] mt-1">
              {formatTime(duration)} / {audioRef.current ? formatTime(audioRef.current.duration || 0) : '0:00'}
            </p>
          </div>
          <button onClick={handleUpload} disabled={uploading} className="px-3 py-1.5 rounded-lg bg-[var(--color-success)] text-white text-sm hover:bg-[var(--color-success-dark)] transition flex items-center gap-1">
            <Upload size={16} /> {uploading ? 'Upload...' : 'Envoyer'}
          </button>
          <button onClick={handleCancel} className="p-2 rounded-lg hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)] transition">
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </MotionBox>
  );
};

export default AudioRecorder;
