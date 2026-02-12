export type ConditionRating = 1 | 2 | 3 | 'NI' | null;

export interface Survey {
  id: string;
  reference: string;
  surveyDate: string;
  reportDate: string;
  clientName: string;
  propertyAddress: string;
  propertyType: string;
  constructionType: string;
  approximateAge: string;
  approximateArea: string;
  tenure: 'freehold' | 'leasehold' | 'leasehold-share';
  weather: string;
  orientation: string;
  accommodation: string;
  garageOutbuildings: string;
  status: 'draft' | 'in-progress' | 'complete';
  createdAt: string;
  updatedAt: string;
}

export interface SectionCapture {
  id: string;
  surveyId: string;
  sectionId: string;
  conditionRating: ConditionRating;
  construction: string;
  observations: string;
  meaning: string;
  recommendations: string;
  standardText: string;
  photos: Photo[];
  audioNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  captureId: string;
  surveyId: string;
  sectionId: string;
  filename: string;
  originalName: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  createdAt: string;
}

export interface RICSSection {
  id: string;
  number: string;
  title: string;
  category: 'external' | 'internal' | 'services' | 'general' | 'additional';
  hasConditionRating: boolean;
  standardTexts: string[];
  fields: SectionField[];
}

export interface SectionField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'table';
  options?: string[];
  placeholder?: string;
}

export interface RepairCost {
  id: string;
  surveyId: string;
  item: string;
  sectionRef: string;
  description: string;
  professional: string;
  priority: 'urgent' | 'short-term' | 'medium-term' | 'advisory';
  estimatedCost: number;
}

export interface SurveyExport {
  survey: Survey;
  captures: SectionCapture[];
  photos: Photo[];
  repairCosts: RepairCost[];
}
