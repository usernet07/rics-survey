import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { createSurvey, getSurvey, updateSurvey, deleteSurvey } from '../services/api';
import type { Survey } from '../types/survey';

export default function SetupView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<Survey>>({
    reference: '',
    surveyDate: new Date().toISOString().split('T')[0],
    reportDate: new Date().toISOString().split('T')[0],
    clientName: '',
    propertyAddress: '',
    propertyType: '',
    constructionType: '',
    approximateAge: '',
    approximateArea: '',
    tenure: 'freehold',
    weather: '',
    orientation: '',
    accommodation: '',
    garageOutbuildings: '',
  });

  useEffect(() => {
    if (id) {
      getSurvey(id).then(setForm).catch(() => setError('Failed to load survey'));
    }
  }, [id]);

  const handleChange = (key: keyof Survey, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.clientName || !form.propertyAddress) {
      setError('Client name and property address are required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (id) {
        await updateSurvey(id, form);
        navigate(`/survey/${id}/capture`);
      } else {
        const survey = await createSurvey(form);
        navigate(`/survey/${survey.id}/capture`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this survey? This cannot be undone.')) return;
    try {
      await deleteSurvey(id);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const fields: { key: keyof Survey; label: string; type: string; placeholder: string; required?: boolean; options?: string[] }[] = [
    { key: 'reference', label: 'Report Reference', type: 'text', placeholder: 'e.g., Dbiss00123' },
    { key: 'clientName', label: 'Client Name', type: 'text', placeholder: 'Client full name', required: true },
    { key: 'propertyAddress', label: 'Property Address', type: 'textarea', placeholder: 'Full address including postcode', required: true },
    { key: 'surveyDate', label: 'Survey Date', type: 'date', placeholder: '' },
    { key: 'reportDate', label: 'Report Date', type: 'date', placeholder: '' },
    { key: 'propertyType', label: 'Property Type', type: 'text', placeholder: 'e.g., semi-detached house' },
    { key: 'constructionType', label: 'Construction Type', type: 'text', placeholder: 'e.g., traditional brick and block cavity walls' },
    { key: 'approximateAge', label: 'Approximate Age', type: 'text', placeholder: 'e.g., Victorian circa 1890' },
    { key: 'approximateArea', label: 'Approximate Floor Area', type: 'text', placeholder: 'e.g., 120 m²' },
    { key: 'tenure', label: 'Tenure', type: 'select', placeholder: '', options: ['freehold', 'leasehold', 'leasehold-share'] },
    { key: 'weather', label: 'Weather at Survey', type: 'text', placeholder: 'e.g., dry and overcast' },
    { key: 'orientation', label: 'Building Orientation', type: 'text', placeholder: 'e.g., front elevation faces North' },
    { key: 'accommodation', label: 'Accommodation Summary', type: 'textarea', placeholder: 'List rooms per floor...' },
    { key: 'garageOutbuildings', label: 'Garage / Outbuildings', type: 'textarea', placeholder: 'Description of garages/outbuildings...' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-[52px] bg-gray-50 z-40 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
        <button onClick={() => navigate('/')} className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-gray-200">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold flex-1">{id ? 'Edit Survey' : 'New Survey'}</h1>
        {id && (
          <button onClick={handleDelete} className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50">
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
        )}

        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={(form[field.key] as string) || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                style={{ fontSize: '16px' }}
              />
            ) : field.type === 'select' ? (
              <select
                value={(form[field.key] as string) || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full min-h-[48px] px-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                style={{ fontSize: '16px' }}
              >
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1).replace('-', ' ')}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={(form[field.key] as string) || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full min-h-[48px] px-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '16px' }}
              />
            )}
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full min-h-[48px] bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          <Save size={18} />
          {saving ? 'Saving...' : id ? 'Save & Continue' : 'Create Survey'}
        </button>
      </div>
    </div>
  );
}
