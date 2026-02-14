import { Mic, MicOff, Trash2 } from 'lucide-react';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function AudioRecorder({ value, onChange, disabled }: Props) {
  const {
    isRecording,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
    setTranscriptValue,
  } = useAudioRecording();

  const initialized = useRef(false);

  // Initialize transcript from saved value on mount (fresh instance per section via key prop)
  useEffect(() => {
    if (value) {
      setTranscriptValue(value);
    }
    initialized.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Push transcript changes up (skip during initialization)
  useEffect(() => {
    if (initialized.current && transcript !== value) {
      onChange(transcript);
    }
  }, [transcript]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-400 py-2">
        Voice recording not supported in this browser
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Voice Notes</label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`min-h-[48px] min-w-[48px] px-4 rounded-lg flex items-center gap-2 font-medium transition-all active:scale-95 ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          <span>{isRecording ? 'Stop' : 'Record'}</span>
        </button>

        {transcript && (
          <button
            type="button"
            onClick={() => {
              clearTranscript();
              onChange('');
            }}
            className="min-h-[48px] min-w-[48px] px-3 text-red-500 hover:bg-red-50 rounded-lg flex items-center"
            disabled={disabled}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {(transcript || interimTranscript) && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <span>{transcript}</span>
          {interimTranscript && (
            <span className="text-gray-400 italic">{interimTranscript}</span>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
