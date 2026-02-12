import { useState } from 'react';
import { ricsSections, sectionCategories } from '../data/rics-sections';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function TemplateView() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(sectionCategories.map(c => c.id))
  );

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const catColors: Record<string, string> = {
    general: 'border-blue-500 bg-blue-50',
    external: 'border-green-500 bg-green-50',
    internal: 'border-orange-500 bg-orange-50',
    services: 'border-purple-500 bg-purple-50',
    additional: 'border-red-500 bg-red-50',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="sticky top-[52px] bg-gray-50 z-40 px-4 py-3 border-b border-gray-200">
        <h1 className="text-lg font-semibold">RICS Level 3 Template</h1>
        <p className="text-xs text-gray-500">{ricsSections.length} sections - RICS Home Survey Standard 2021</p>
      </div>

      <div className="p-4">
        {/* Condition Rating Key */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h2 className="font-semibold text-sm mb-3">Condition Rating Key</h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-green-500 text-white rounded flex items-center justify-center font-bold">1</span>
              <span className="text-gray-700">No repair or replacement required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-amber-500 text-white rounded flex items-center justify-center font-bold">2</span>
              <span className="text-gray-700">Repair or replacement requiring attention</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-red-500 text-white rounded flex items-center justify-center font-bold">3</span>
              <span className="text-gray-700">Urgent repair or replacement needed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-gray-400 text-white rounded flex items-center justify-center font-bold text-[10px]">NI</span>
              <span className="text-gray-700">Not Inspected</span>
            </div>
          </div>
        </div>

        {/* Template Sections */}
        <div className="space-y-4">
          {sectionCategories.map((cat) => {
            const sections = ricsSections.filter(s => s.category === cat.id);
            const isExpanded = expandedCategories.has(cat.id);

            return (
              <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left min-h-[48px] border-l-4 ${catColors[cat.id] || 'border-gray-500 bg-gray-50'}`}
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span className="font-semibold text-sm flex-1">{cat.label}</span>
                  <span className="text-xs text-gray-500">{sections.length} sections</span>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {sections.map((section) => {
                      const isSectionExpanded = expandedSections.has(section.id);
                      return (
                        <div key={section.id}>
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left min-h-[48px] hover:bg-gray-50"
                          >
                            {isSectionExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                            <span className="text-sm font-mono text-gray-500 w-10">{section.number}</span>
                            <span className="text-sm font-medium text-gray-900 flex-1">{section.title}</span>
                            {section.hasConditionRating && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Rated</span>
                            )}
                          </button>

                          {isSectionExpanded && (
                            <div className="px-4 pb-4 ml-10 space-y-3">
                              {section.fields.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 mb-1">Fields:</p>
                                  <ul className="space-y-1">
                                    {section.fields.map(f => (
                                      <li key={f.key} className="text-xs text-gray-600 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                                        {f.label}
                                        {f.type === 'select' && ` (${f.options?.join(', ')})`}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {section.standardTexts.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-amber-600 mb-1">Standard Texts ({section.standardTexts.length}):</p>
                                  {section.standardTexts.map((text, i) => (
                                    <p key={i} className="text-xs text-gray-500 italic mb-1">{text.slice(0, 150)}...</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
