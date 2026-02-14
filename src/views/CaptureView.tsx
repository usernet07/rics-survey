import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Save, Eye, Settings } from 'lucide-react';
import { getSurvey, getCaptures, saveCapture, uploadPhoto, deletePhoto } from '../services/api';
import { ricsSections } from '../data/rics-sections';
import type { Survey, SectionCapture, ConditionRating as CRType, Photo } from '../types/survey';
import ConditionRating from '../components/ConditionRating';
import PhotoCapture from '../components/PhotoCapture';
import AudioRecorder from '../components/AudioRecorder';
import SectionCard from '../components/SectionCard';

type ViewMode = 'list' | 'detail';

// Keys that map directly to database columns (not custom field data)
const DB_COLUMN_KEYS = new Set([
  'id', 'surveyId', 'sectionId', 'conditionRating', 'construction',
  'observations', 'meaning', 'recommendations', 'standardText',
  'audioNotes', 'fieldData', 'photos', 'createdAt', 'updatedAt',
]);

/** Hydrate a capture from the API: spread fieldData JSON into top-level keys */
function hydrateCapture(capture: SectionCapture): SectionCapture & Record<string, unknown> {
  const hydrated = { ...capture } as SectionCapture & Record<string, unknown>;
  if (capture.fieldData && typeof capture.fieldData === 'string') {
    try {
      const parsed = JSON.parse(capture.fieldData) as Record<string, string>;
      Object.assign(hydrated, parsed);
    } catch { /* ignore invalid JSON */ }
  }
  return hydrated;
}

/** Before saving, separate DB columns from custom fields and pack custom fields into fieldData */
function packCaptureForSave(data: Record<string, unknown>): Partial<SectionCapture> {
  const dbFields: Record<string, unknown> = {};
  const customFields: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (DB_COLUMN_KEYS.has(key)) {
      dbFields[key] = value;
    } else if (value && typeof value === 'string' && value.trim()) {
      customFields[key] = value;
    }
  }

  if (Object.keys(customFields).length > 0) {
    dbFields.fieldData = JSON.stringify(customFields);
  }

  return dbFields as Partial<SectionCapture>;
}

export default function CaptureView() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [captures, setCaptures] = useState<Map<string, SectionCapture>>(new Map());
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Local form state for current section
  const [localCapture, setLocalCapture] = useState<Partial<SectionCapture>>({});

  const currentSection = ricsSections[currentSectionIndex];

  useEffect(() => {
    if (!surveyId) return;
    setError('');
    Promise.all([
      getSurvey(surveyId),
      getCaptures(surveyId),
    ]).then(([s, caps]) => {
      setSurvey(s);
      const map = new Map<string, SectionCapture>();
      caps.forEach(c => map.set(c.sectionId, hydrateCapture(c)));
      setCaptures(map);
    }).catch(err => {
      setError(err instanceof Error ? err.message : 'Failed to load survey');
    });
  }, [surveyId]);

  // Load local capture when section changes
  useEffect(() => {
    const existing = captures.get(currentSection?.id);
    setLocalCapture(existing || {});
  }, [currentSectionIndex, captures, currentSection?.id]);

  const handleFieldChange = useCallback((key: string, value: string | CRType) => {
    setLocalCapture(prev => ({ ...prev, [key]: value }));

    // Auto-save after 2 seconds of inactivity
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(() => {
      handleSave({ ...localCapture, [key]: value });
    }, 2000);
    setAutoSaveTimer(timer);
  }, [autoSaveTimer, localCapture]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (data?: Partial<SectionCapture>) => {
    if (!surveyId || !currentSection) return;
    setSaving(true);
    try {
      const raw = data || localCapture;
      const captureData = packCaptureForSave(raw as Record<string, unknown>);
      const saved = await saveCapture(surveyId, currentSection.id, captureData);
      setCaptures(prev => new Map(prev).set(currentSection.id, hydrateCapture(saved)));
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoCapture = async (file: File, description: string) => {
    if (!surveyId || !currentSection) return;
    const sectionId = currentSection.id; // Capture at call time to prevent race condition
    // Ensure capture exists first
    await handleSave();
    const photo = await uploadPhoto(surveyId, sectionId, file, description);
    setCaptures(prev => {
      const map = new Map(prev);
      const existing = map.get(sectionId);
      if (existing) {
        map.set(sectionId, {
          ...existing,
          photos: [...(existing.photos || []), photo],
        });
      }
      return map;
    });
  };

  const handlePhotoDelete = async (photoId: string) => {
    if (!currentSection) return;
    const sectionId = currentSection.id; // Capture at call time
    await deletePhoto(photoId);
    setCaptures(prev => {
      const map = new Map(prev);
      const existing = map.get(sectionId);
      if (existing) {
        map.set(sectionId, {
          ...existing,
          photos: (existing.photos || []).filter(p => p.id !== photoId),
        });
      }
      return map;
    });
  };

  const goToSection = (index: number) => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      handleSave();
    }
    setCurrentSectionIndex(index);
    setViewMode('detail');
    window.scrollTo(0, 0);
  };

  const goNext = () => {
    if (currentSectionIndex < ricsSections.length - 1) {
      goToSection(currentSectionIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentSectionIndex > 0) {
      goToSection(currentSectionIndex - 1);
    }
  };

  const completedCount = captures.size;
  const totalCount = ricsSections.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Back to surveys</button>
      </div>
    );
  }

  if (!survey) {
    return <div className="p-8 text-center text-gray-500">Loading survey...</div>;
  }

  // LIST VIEW
  if (viewMode === 'list') {
    const categories = [
      { id: 'general', label: 'Part 1: General Information', color: 'border-l-blue-500' },
      { id: 'external', label: 'Part 2: External', color: 'border-l-green-500' },
      { id: 'internal', label: 'Part 3: Internal', color: 'border-l-orange-500' },
      { id: 'services', label: 'Part 4: Services', color: 'border-l-purple-500' },
      { id: 'additional', label: 'Part 5: Additional', color: 'border-l-red-500' },
    ];

    return (
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-[52px] bg-gray-50 z-40 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate('/')} className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-gray-200">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">{survey.propertyAddress?.split(',')[0] || 'Survey'}</h1>
              <p className="text-xs text-gray-500">{survey.clientName} - {survey.reference}</p>
            </div>
            <button
              onClick={() => navigate(`/survey/${surveyId}/setup`)}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-gray-200"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={() => navigate(`/survey/${surveyId}/review`)}
              className="min-h-[48px] px-3 bg-blue-600 text-white rounded-lg flex items-center gap-1 text-sm font-medium"
            >
              <Eye size={16} />
              Review
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">{completedCount}/{totalCount}</span>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {categories.map((cat) => {
            const sections = ricsSections.filter(s => s.category === cat.id);
            return (
              <div key={cat.id}>
                <h2 className={`text-sm font-semibold text-gray-700 mb-2 pl-2 border-l-4 ${cat.color}`}>
                  {cat.label}
                </h2>
                <div className="space-y-2">
                  {sections.map((section) => {
                    const capture = captures.get(section.id);
                    const globalIndex = ricsSections.findIndex(s => s.id === section.id);
                    return (
                      <SectionCard
                        key={section.id}
                        section={section}
                        rating={capture?.conditionRating ?? null}
                        isComplete={!!capture}
                        onClick={() => goToSection(globalIndex)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // DETAIL VIEW
  const capture = captures.get(currentSection.id);
  const photos: Photo[] = capture?.photos || [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-[52px] bg-gray-50 z-40 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode('list')} className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-gray-200">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold truncate">{currentSection.number} {currentSection.title}</h1>
            <p className="text-xs text-gray-500">
              Section {currentSectionIndex + 1} of {ricsSections.length}
              {saving && ' • Saving...'}
            </p>
          </div>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="min-h-[48px] px-3 bg-blue-600 text-white rounded-lg flex items-center gap-1 text-sm font-medium disabled:opacity-50"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Condition Rating */}
        {currentSection.hasConditionRating && (
          <ConditionRating
            value={(localCapture.conditionRating ?? null) as CRType}
            onChange={(val) => handleFieldChange('conditionRating', val as CRType)}
          />
        )}

        {/* Standard Texts */}
        {currentSection.standardTexts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-amber-700 mb-1">Standard Text (auto-included)</p>
            {currentSection.standardTexts.map((text, i) => (
              <p key={i} className="text-xs text-amber-800 mb-1 last:mb-0">{text}</p>
            ))}
          </div>
        )}

        {/* Section Fields */}
        {currentSection.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={(localCapture as Record<string, string>)[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                style={{ fontSize: '16px' }}
              />
            ) : field.type === 'select' ? (
              <select
                value={(localCapture as Record<string, string>)[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full min-h-[48px] px-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                style={{ fontSize: '16px' }}
              >
                <option value="">Select...</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={(localCapture as Record<string, string>)[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full min-h-[48px] px-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '16px' }}
              />
            )}
          </div>
        ))}

        {/* Photo Capture */}
        <PhotoCapture
          photos={photos}
          onCapture={handlePhotoCapture}
          onDelete={handlePhotoDelete}
        />

        {/* Audio Recording - key forces fresh instance per section */}
        <AudioRecorder
          key={`audio-${currentSection.id}`}
          value={localCapture.audioNotes || ''}
          onChange={(val) => handleFieldChange('audioNotes', val)}
        />

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={goPrev}
            disabled={currentSectionIndex === 0}
            className="flex-1 min-h-[48px] bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center gap-1 font-medium disabled:opacity-30 active:scale-[0.98] transition-transform"
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <button
            onClick={goNext}
            disabled={currentSectionIndex === ricsSections.length - 1}
            className="flex-1 min-h-[48px] bg-blue-600 text-white rounded-lg flex items-center justify-center gap-1 font-medium disabled:opacity-30 active:scale-[0.98] transition-transform"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
