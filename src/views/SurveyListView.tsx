import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, ChevronRight } from 'lucide-react';
import { getSurveys } from '../services/api';
import type { Survey } from '../types/survey';

const statusColors: Record<string, string> = {
  'draft': 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  'complete': 'bg-green-100 text-green-700',
};

export default function SurveyListView() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getSurveys()
      .then(setSurveys)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load surveys'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-[52px] bg-gray-50 z-40 px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <h1 className="text-lg font-semibold">My Surveys</h1>
        <button
          onClick={() => navigate('/survey/new')}
          className="min-h-[48px] px-4 bg-blue-600 text-white rounded-lg flex items-center gap-2 font-medium hover:bg-blue-700 active:scale-[0.98] transition-transform"
        >
          <Plus size={18} />
          New Survey
        </button>
      </div>

      <div className="p-4">
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="text-blue-600 hover:underline">Retry</button>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-500 py-12">Loading surveys...</div>
        ) : surveys.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-medium text-gray-600 mb-2">No surveys yet</h2>
            <p className="text-sm text-gray-400 mb-6">Create your first RICS Level 3 Building Survey</p>
            <button
              onClick={() => navigate('/survey/new')}
              className="min-h-[48px] px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Create Survey
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {surveys.map((survey) => (
              <button
                key={survey.id}
                onClick={() => navigate(`/survey/${survey.id}/capture`)}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all active:scale-[0.98] text-left"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {survey.propertyAddress || 'Untitled Survey'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {survey.clientName || 'No client'} - {survey.reference || 'No ref'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[survey.status] || statusColors['draft']}`}>
                      {survey.status?.replace('-', ' ') || 'draft'}
                    </span>
                    <span className="text-xs text-gray-400">{survey.surveyDate}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
