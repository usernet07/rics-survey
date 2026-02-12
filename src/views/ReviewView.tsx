import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { getSurvey, getCaptures, getPhotos, getPdfUrl } from '../services/api';
import { ricsSections, sectionCategories } from '../data/rics-sections';
import type { Survey, SectionCapture, Photo, ConditionRating } from '../types/survey';

const ratingLabels: Record<string, { label: string; color: string; bg: string }> = {
  '1': { label: 'Rating 1 - No repair needed', color: 'text-green-700', bg: 'bg-green-100' },
  '2': { label: 'Rating 2 - Attention needed', color: 'text-amber-700', bg: 'bg-amber-100' },
  '3': { label: 'Rating 3 - Urgent repair', color: 'text-red-700', bg: 'bg-red-100' },
  'NI': { label: 'Not Inspected', color: 'text-gray-600', bg: 'bg-gray-100' },
};

export default function ReviewView() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [captures, setCaptures] = useState<Map<string, SectionCapture>>(new Map());
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const apiBase = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (!surveyId) return;
    Promise.all([
      getSurvey(surveyId),
      getCaptures(surveyId),
      getPhotos(surveyId),
    ]).then(([s, caps, photos]) => {
      setSurvey(s);
      const map = new Map<string, SectionCapture>();
      caps.forEach(c => map.set(c.sectionId, c));
      setCaptures(map);
      setAllPhotos(photos);
    }).catch(err => {
      console.error('Failed to load review data:', err);
    }).finally(() => setLoading(false));
  }, [surveyId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading review...</div>;
  if (!survey) return <div className="p-8 text-center text-red-500">Survey not found</div>;

  const ratedSections = ricsSections.filter(s => s.hasConditionRating);
  const rating3 = ratedSections.filter(s => captures.get(s.id)?.conditionRating === 3);
  const rating2 = ratedSections.filter(s => captures.get(s.id)?.conditionRating === 2);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="sticky top-[52px] bg-gray-50 z-40 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
        <button onClick={() => navigate(`/survey/${surveyId}/capture`)} className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-gray-200">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold flex-1">Review Report</h1>
        <a
          href={getPdfUrl(surveyId!)}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[48px] px-4 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-transform"
        >
          <Download size={16} />
          Export PDF
        </a>
      </div>

      <div className="p-4 space-y-6">
        {/* Survey Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-start gap-3 mb-4">
            <FileText size={24} className="text-slate-700 mt-1" />
            <div>
              <h2 className="font-bold text-lg">RICS Level 3 Building Survey</h2>
              <p className="text-sm text-gray-500">Report Ref: {survey.reference}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Client:</span>
              <p className="font-medium">{survey.clientName}</p>
            </div>
            <div>
              <span className="text-gray-500">Survey Date:</span>
              <p className="font-medium">{survey.surveyDate}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Property:</span>
              <p className="font-medium">{survey.propertyAddress}</p>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <p className="font-medium">{survey.propertyType || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">Construction:</span>
              <p className="font-medium">{survey.constructionType || '-'}</p>
            </div>
          </div>
        </div>

        {/* Summary Alerts */}
        {rating3.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="font-semibold text-red-800 mb-2">Urgent Items (Rating 3)</h3>
            <ul className="space-y-1">
              {rating3.map(s => (
                <li key={s.id} className="text-sm text-red-700">
                  {s.number} {s.title} - {captures.get(s.id)?.observations?.slice(0, 100) || 'See section details'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {rating2.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Attention Needed (Rating 2)</h3>
            <ul className="space-y-1">
              {rating2.map(s => (
                <li key={s.id} className="text-sm text-amber-700">
                  {s.number} {s.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Condition Rating Summary Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <h3 className="font-semibold text-gray-900 p-4 border-b border-gray-200">Condition Summary</h3>
          <div className="divide-y divide-gray-100">
            {ratedSections.map((section) => {
              const cap = captures.get(section.id);
              const rating = cap?.conditionRating;
              const rInfo = rating ? ratingLabels[String(rating)] : null;
              return (
                <div key={section.id} className="flex items-center px-4 py-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{section.number} {section.title}</p>
                  </div>
                  {rInfo ? (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${rInfo.bg} ${rInfo.color}`}>
                      {String(rating)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Details */}
        {sectionCategories.map((cat) => {
          const sections = ricsSections.filter(s => s.category === cat.id);
          const catCaptures = sections.filter(s => captures.has(s.id));
          if (catCaptures.length === 0) return null;

          return (
            <div key={cat.id}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                {cat.label}
              </h3>
              <div className="space-y-4">
                {catCaptures.map((section) => {
                  const cap = captures.get(section.id)!;
                  const sectionPhotos = allPhotos.filter(p => p.sectionId === section.id);
                  const rating = cap.conditionRating as ConditionRating;
                  const rInfo = rating ? ratingLabels[String(rating)] : null;

                  return (
                    <div key={section.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{section.number} {section.title}</h4>
                        </div>
                        {rInfo && (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${rInfo.bg} ${rInfo.color}`}>
                            {String(rating)}
                          </span>
                        )}
                      </div>

                      {cap.construction && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Construction:</span>
                          <p className="text-sm text-gray-700">{cap.construction}</p>
                        </div>
                      )}

                      {cap.observations && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Observations:</span>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{cap.observations}</p>
                        </div>
                      )}

                      {cap.meaning && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">What This Means:</span>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{cap.meaning}</p>
                        </div>
                      )}

                      {cap.recommendations && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Recommendations:</span>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{cap.recommendations}</p>
                        </div>
                      )}

                      {cap.audioNotes && (
                        <div className="bg-blue-50 rounded-lg p-2">
                          <span className="text-xs font-medium text-blue-600">Voice Note:</span>
                          <p className="text-sm text-blue-800">{cap.audioNotes}</p>
                        </div>
                      )}

                      {sectionPhotos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {sectionPhotos.map(photo => (
                            <div key={photo.id}>
                              <img
                                src={`${apiBase}/uploads/${photo.filename}`}
                                alt={photo.description}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              {photo.description && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{photo.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Photo Appendix */}
        {allPhotos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Appendix A: Photographs
            </h3>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="grid grid-cols-2 gap-3">
                {allPhotos.map((photo, index) => {
                  const section = ricsSections.find(s => s.id === photo.sectionId);
                  return (
                    <div key={photo.id}>
                      <img
                        src={`${apiBase}/uploads/${photo.filename}`}
                        alt={photo.description}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Photo {index + 1}: {photo.description || section?.title || 'Survey photo'}
                      </p>
                      {section && (
                        <p className="text-xs text-gray-400">Section {section.number}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
