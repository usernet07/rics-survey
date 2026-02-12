import type { RICSSection } from '../types/survey';

export const ricsSections: RICSSection[] = [
  // PART 1: GENERAL INFORMATION
  {
    id: 'instructions',
    number: '1.01',
    title: 'Instructions',
    category: 'general',
    hasConditionRating: false,
    standardTexts: [
      'You are reminded of our limitations of the survey, scope of work and terms and conditions, which are set out at the back of this report. We have not at this stage arranged or undertaken any specialist tests or reports on the services.',
    ],
    fields: [
      { key: 'clientConcerns', label: 'Client Instructions & Specific Concerns', type: 'textarea', placeholder: 'Enter specific client concerns...' },
      { key: 'restrictions', label: 'Restrictions and Limitations', type: 'textarea', placeholder: 'Areas not accessible or restricted...' },
      { key: 'weatherConditions', label: 'Weather Conditions at Time of Survey', type: 'text', placeholder: 'e.g., dry and overcast' },
    ],
  },
  {
    id: 'overview',
    number: '1.02',
    title: 'Overview - Summary, Budget Costs and Recommendations',
    category: 'general',
    hasConditionRating: false,
    standardTexts: [
      'This report should only be construed as a comment on the overall condition of the property at the time of inspection and not an inventory of every single defect.',
      'It is emphasised that all testing, further investigation, and analysis recommended or advised within the report should be carried out before commitment to purchase.',
      'Points with a Condition Rating 2 may not be considered urgent; however, if they are not addressed, they may lead to defects needing more serious repairs.',
    ],
    fields: [
      { key: 'movementOption', label: 'Movement in Building', type: 'select', options: ['No significant movement', 'Some movement noted', 'Historic movement'] },
      { key: 'movementDetails', label: 'Movement Details', type: 'textarea', placeholder: 'Describe any movement observed...' },
      { key: 'crackingCategory', label: 'Cracking Classification', type: 'select', options: ['None', 'Category 0 - Hairline (up to 0.1mm)', 'Category 1 - Fine (0.2-2mm)', 'Category 2 - Moderate (2-5mm)', 'Category 3 - Serious (5-15mm)'] },
    ],
  },
  {
    id: 'legal-summary',
    number: '1.03',
    title: 'Legal Summary',
    category: 'general',
    hasConditionRating: false,
    standardTexts: [
      'In addition to the standard enquiries, we recommend your legal advisers consider the following matters before entering a binding commitment to purchase.',
    ],
    fields: [
      { key: 'legalIssues', label: 'Legal Issues & Recommendations', type: 'textarea', placeholder: 'Planning, building regs, boundary disputes, etc.' },
    ],
  },
  {
    id: 'weather',
    number: '1.04',
    title: 'Weather',
    category: 'general',
    hasConditionRating: false,
    standardTexts: [],
    fields: [
      { key: 'weather', label: 'Weather at Time of Inspection', type: 'text', placeholder: 'e.g., dry and overcast' },
    ],
  },
  {
    id: 'tenure',
    number: '1.05',
    title: 'Tenure and Occupation',
    category: 'general',
    hasConditionRating: false,
    standardTexts: [],
    fields: [
      { key: 'tenure', label: 'Tenure', type: 'select', options: ['Freehold', 'Leasehold', 'Leasehold with Share of Freehold'] },
      { key: 'tenureDetails', label: 'Tenure Details', type: 'textarea', placeholder: 'Additional tenure information...' },
    ],
  },
  {
    id: 'orientation',
    number: '1.06',
    title: 'Orientation of Building and Location',
    category: 'general',
    hasConditionRating: false,
    standardTexts: [
      'All directions are given as if facing the building looking towards the rear of the site.',
    ],
    fields: [
      { key: 'orientation', label: 'Orientation', type: 'text', placeholder: 'e.g., The front elevation faces North' },
      { key: 'neighbourhood', label: 'Neighbourhood Character', type: 'textarea', placeholder: 'Description of local area...' },
      { key: 'floodRisk', label: 'Flood Risk', type: 'select', options: ['Low', 'Medium', 'High'] },
      { key: 'radonRisk', label: 'Radon Risk', type: 'select', options: ['Low', 'Medium', 'High'] },
    ],
  },
  {
    id: 'roads',
    number: '1.07',
    title: 'Roads, Footpaths and Parking',
    category: 'general',
    hasConditionRating: false,
    standardTexts: [],
    fields: [
      { key: 'roadType', label: 'Road Type', type: 'select', options: ['Public Road', 'Private Road'] },
      { key: 'roadDetails', label: 'Road & Parking Details', type: 'textarea', placeholder: 'Description of access, parking...' },
    ],
  },
  {
    id: 'accommodation',
    number: '1.08',
    title: 'Accommodation',
    category: 'general',
    hasConditionRating: false,
    standardTexts: [],
    fields: [
      { key: 'groundFloor', label: 'Ground Floor', type: 'textarea', placeholder: 'List rooms...' },
      { key: 'firstFloor', label: 'First Floor', type: 'textarea', placeholder: 'List rooms...' },
      { key: 'secondFloor', label: 'Second Floor / Loft', type: 'textarea', placeholder: 'List rooms if applicable...' },
      { key: 'basement', label: 'Basement / Cellar', type: 'textarea', placeholder: 'List rooms if applicable...' },
    ],
  },
  {
    id: 'garage',
    number: '1.09',
    title: 'Garage / Outbuildings',
    category: 'general',
    hasConditionRating: true,
    standardTexts: [],
    fields: [
      { key: 'hasOutbuildings', label: 'Outbuildings Present', type: 'select', options: ['No outbuildings', 'Outbuildings present'] },
      { key: 'outbuildingDetails', label: 'Description', type: 'textarea', placeholder: 'Construction and condition details...' },
    ],
  },

  // PART 2: EXTERNAL CONSTRUCTION AND CONDITION
  {
    id: 'roof',
    number: '2.01',
    title: 'Roof Coverings',
    category: 'external',
    hasConditionRating: true,
    standardTexts: [
      'The outer surface of the roof was inspected where it was possible to do so safely using a 3-metre-long ladder.',
      'Our comments are based on the conditions at the time of the survey. Roofs can be prone to leak, especially with high winds.',
      'Flat roofs can deteriorate, and the coverings will have a limited life.',
    ],
    fields: [
      { key: 'construction', label: 'Construction', type: 'text', placeholder: 'e.g., Pitched roof with clay tiles' },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Condition, defects, missing tiles, moss growth...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Repair/maintenance recommendations...' },
    ],
  },
  {
    id: 'chimneys',
    number: '2.02',
    title: 'Chimneys',
    category: 'external',
    hasConditionRating: true,
    standardTexts: [
      'The chimneys have been inspected where it was possible to do so safely using a 3-metre-long ladder.',
      'The chimney stacks are particularly exposed to the weather and will require regular maintenance.',
      'Closer inspection of the flashings and the detail around the stacks is recommended.',
    ],
    fields: [
      { key: 'construction', label: 'Construction', type: 'text', placeholder: 'Description of chimney construction...' },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Condition, pots, flashings, pointing...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Repair recommendations...' },
    ],
  },
  {
    id: 'flashings',
    number: '2.03',
    title: 'Flashings & Soakers',
    category: 'external',
    hasConditionRating: true,
    standardTexts: [
      'Flashings are particularly exposed to the weather and may require regular maintenance to ensure they are weathertight.',
      'Lead flashings can split and come loose. Cement flashings will be prone to leak and cracking.',
    ],
    fields: [
      { key: 'type', label: 'Type', type: 'text', placeholder: 'e.g., Lead / Cement mortar / Code 4 lead' },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Observations...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'parapets',
    number: '2.04',
    title: 'Parapets',
    category: 'external',
    hasConditionRating: true,
    standardTexts: [
      'Parapets are the walls which extend above the line of the roof. They are particularly exposed to the weather.',
    ],
    fields: [
      { key: 'hasParapets', label: 'Parapets Present', type: 'select', options: ['No parapets', 'Parapets present'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Observations...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'rainwater',
    number: '2.05',
    title: 'Rainwater Goods, Fascia & Soffits',
    category: 'external',
    hasConditionRating: true,
    standardTexts: [
      'Gutters discharge rainwater away from the building. It is difficult to know if they work as intended unless checked in heavy rain.',
      'Guttering typically expands and contracts throughout the seasons, and this can lead to splits at the joints.',
    ],
    fields: [
      { key: 'gutterMaterial', label: 'Gutter Material', type: 'text', placeholder: 'e.g., uPVC / Cast iron / Aluminium' },
      { key: 'fasciaMaterial', label: 'Fascia & Soffit Material', type: 'text', placeholder: 'e.g., uPVC / Timber painted' },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Condition, blockages, leaks, damage...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'external-walls',
    number: '2.06',
    title: 'External Walls & Elevations',
    category: 'external',
    hasConditionRating: true,
    standardTexts: [
      'Lintels in buildings are often concealed behind finishes, and any inspection of the walls is limited without undertaking opening-up works.',
      'Air bricks should be kept clear of debris and obstructions so that the sub-floors are adequately ventilated.',
    ],
    fields: [
      { key: 'construction', label: 'Construction', type: 'text', placeholder: 'e.g., Cavity brick and block / Solid brick 225mm' },
      { key: 'wallType', label: 'Wall Type', type: 'select', options: ['Cavity masonry walls', 'Solid masonry walls', 'Timber frame', 'Other'] },
      { key: 'dpcType', label: 'DPC Type', type: 'text', placeholder: 'e.g., Physical DPC / Injected / Slate / Not visible' },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Brickwork condition, pointing, cracking, damp...' },
      { key: 'crackingAnalysis', label: 'Cracking Analysis', type: 'textarea', placeholder: 'Location, type, width, likely cause...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'external-joinery',
    number: '2.07',
    title: 'External Joinery',
    category: 'external',
    hasConditionRating: true,
    standardTexts: [
      'Windows and doors often require maintenance and repairs. The seals between the windows/doors and the surrounding walls can have a limited life.',
    ],
    fields: [
      { key: 'windowType', label: 'Window Type', type: 'text', placeholder: 'e.g., uPVC double glazed / Timber single glazed' },
      { key: 'doorType', label: 'External Door Type', type: 'text', placeholder: 'Description...' },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Frames, glazing, seals, operation, rot...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'external-decorations',
    number: '2.08',
    title: 'External Decorations',
    category: 'external',
    hasConditionRating: true,
    standardTexts: [],
    fields: [
      { key: 'decorationState', label: 'Overall State', type: 'select', options: ['Redecoration needed', 'Generally reasonable', 'Minimal decoration required'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Paintwork, render, cladding condition...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'drainage',
    number: '2.09',
    title: 'Drainage',
    category: 'external',
    hasConditionRating: true,
    standardTexts: [
      'Much of the underground drainage system is not visible, and only a limited inspection could be undertaken.',
      'Your legal adviser should establish that the main drainage is connected to the property.',
      'The toilets were flushed, and the main drains appeared to be running freely during the survey.',
    ],
    fields: [
      { key: 'drainageType', label: 'Drainage Type', type: 'select', options: ['Mains', 'Private - septic tank', 'Private - cesspool', 'Private - treatment plant'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Manholes, blockages, surface water...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'foundations',
    number: '2.10',
    title: 'Foundations',
    category: 'external',
    hasConditionRating: true,
    standardTexts: [
      'We cannot advise you on the depth and size of foundations provided to this property.',
    ],
    fields: [
      { key: 'movementEvidence', label: 'Movement Evidence', type: 'select', options: ['No evidence of movement', 'Ongoing subsidence suspected'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Observations...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'grounds',
    number: '2.11',
    title: 'Grounds & Boundaries',
    category: 'external',
    hasConditionRating: true,
    standardTexts: [
      'Japanese Knotweed is becoming increasingly common. This can be damaging to structures and expensive to eradicate.',
    ],
    fields: [
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Fences, walls, hedges, gardens, paths...' },
      { key: 'boundaries', label: 'Boundary Details', type: 'textarea', placeholder: 'Front, left, right, rear boundaries...' },
      { key: 'significantTrees', label: 'Significant Trees', type: 'textarea', placeholder: 'Species, height, distance from building...' },
      { key: 'knotweed', label: 'Japanese Knotweed', type: 'select', options: ['Not observed', 'Present', 'Suspected'] },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },

  // PART 3: INTERNAL CONSTRUCTION AND CONDITION
  {
    id: 'roof-void',
    number: '3.01',
    title: 'Roof Void',
    category: 'internal',
    hasConditionRating: true,
    standardTexts: [],
    fields: [
      { key: 'access', label: 'Access', type: 'text', placeholder: 'e.g., Via hatch in landing' },
      { key: 'construction', label: 'Construction', type: 'text', placeholder: 'e.g., Traditional cut timber / Trussed rafters' },
      { key: 'insulation', label: 'Insulation', type: 'text', placeholder: 'Type and approximate depth...' },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Timbers, woodworm, rot, ventilation...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'ceilings',
    number: '3.02',
    title: 'Ceilings',
    category: 'internal',
    hasConditionRating: true,
    standardTexts: [
      'The undersides of ceilings have been tested by applying light pressure to see if there is any loss of key in the construction.',
      'The hairline cracking to the ceilings throughout the property is considered to be related to natural settlement/age-related expansion.',
    ],
    fields: [
      { key: 'construction', label: 'Construction', type: 'text', placeholder: 'e.g., Plasterboard / Lath and plaster' },
      { key: 'hasArtex', label: 'Textured Coatings Present', type: 'select', options: ['No', 'Yes - testing recommended'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Cracking, staining, sagging, previous leaks...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'internal-walls',
    number: '3.03',
    title: 'Internal Walls & Partitions',
    category: 'internal',
    hasConditionRating: true,
    standardTexts: [
      'Most internal partition walls are rendered and decorated on both sides and without the removal of plaster, their construction cannot be determined.',
    ],
    fields: [
      { key: 'construction', label: 'Construction', type: 'text', placeholder: 'e.g., Solid masonry / Stud partitions' },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Plasterwork, cracking, structural movement...' },
      { key: 'dampReadings', label: 'Damp Readings', type: 'textarea', placeholder: 'Location, reading %, assessment...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'fireplaces',
    number: '3.04',
    title: 'Fireplaces, Flues & Chimney Breasts',
    category: 'internal',
    hasConditionRating: true,
    standardTexts: [
      'The flues have not been inspected, and we cannot comment on the adequacy of any flue linings.',
    ],
    fields: [
      { key: 'hasFireplaces', label: 'Fireplaces Present', type: 'select', options: ['No chimneys', 'Fireplaces present', 'Removed fireplaces', 'Gas fires', 'Solid fuel burners'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Working fireplaces, blocked flues, support...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'floors',
    number: '3.05',
    title: 'Floors',
    category: 'internal',
    hasConditionRating: true,
    standardTexts: [
      'We have inspected the surfaces of floors where possible. We did not lift any floorboards.',
      'Any solid floors in older buildings can have a shallow base and be prone to move.',
    ],
    fields: [
      { key: 'groundFloorConstruction', label: 'Ground Floor Construction', type: 'text', placeholder: 'e.g., Solid concrete / Suspended timber' },
      { key: 'upperFloorConstruction', label: 'Upper Floor Construction', type: 'text', placeholder: 'e.g., Suspended timber / Concrete' },
      { key: 'airbricks', label: 'Airbrick Provision', type: 'select', options: ['Adequate', 'Inadequate', 'Not applicable'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Level, slope, bounce, floor coverings...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'internal-joinery',
    number: '3.06',
    title: 'Internal Joinery',
    category: 'internal',
    hasConditionRating: true,
    standardTexts: [],
    fields: [
      { key: 'staircase', label: 'Staircase', type: 'textarea', placeholder: 'Type, construction, handrails...' },
      { key: 'internalDoors', label: 'Internal Doors', type: 'textarea', placeholder: 'Description...' },
      { key: 'kitchenFittings', label: 'Kitchen Fittings', type: 'textarea', placeholder: 'Description...' },
      { key: 'observations', label: 'Additional Observations', type: 'textarea', placeholder: 'Other joinery observations...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'cellar',
    number: '3.07',
    title: 'Cellar / Basement',
    category: 'internal',
    hasConditionRating: true,
    standardTexts: [],
    fields: [
      { key: 'hasCellar', label: 'Cellar Present', type: 'select', options: ['No cellar/basement', 'Cellar/basement present'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Description and condition...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'dampness',
    number: '3.08',
    title: 'Dampness & DPC',
    category: 'internal',
    hasConditionRating: true,
    standardTexts: [
      'Damp is sometimes difficult to identify during the summer and dry months.',
      'The property was tested with a Protimeter electrical resistance damp testing meter.',
      'Some dampness should be expected in older buildings, particularly buildings with solid masonry walls.',
      'Condensation will inevitably be encountered during the normal usage of the building.',
    ],
    fields: [
      { key: 'dampnessFound', label: 'Dampness Status', type: 'select', options: ['No dampness found', 'Dampness found'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Location and extent of dampness...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'timber-decay',
    number: '3.09',
    title: 'Timber Decay & Infestation',
    category: 'internal',
    hasConditionRating: true,
    standardTexts: [
      'Many of the structural components of the property are timber, including the floor joists and roof structure.',
      'Any timbers in contact with dampness will be at risk from insect attack and decay.',
      'Defects being present in inaccessible areas cannot be entirely ruled out.',
    ],
    fields: [
      { key: 'timberDecayStatus', label: 'Timber Decay Status', type: 'select', options: ['No decay found', 'Decay found', 'Previous treatment suspected'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Condition, woodworm, rot evidence...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'thermal-insulation',
    number: '3.10',
    title: 'Thermal Insulation',
    category: 'internal',
    hasConditionRating: true,
    standardTexts: [
      'Referral to the Energy Performance Certificate for the property should give further guidance.',
    ],
    fields: [
      { key: 'wallInsulation', label: 'Wall Insulation', type: 'select', options: ['Solid walls - limited insulation', 'Cavity walls with insulation', 'Unknown'] },
      { key: 'loftInsulation', label: 'Loft Insulation', type: 'text', placeholder: 'Type and depth...' },
      { key: 'epcRating', label: 'Current EPC Rating', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Unknown'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Observations...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'internal-decorations',
    number: '3.11',
    title: 'Internal Decorations',
    category: 'internal',
    hasConditionRating: true,
    standardTexts: [],
    fields: [
      { key: 'decorationState', label: 'Overall State', type: 'select', options: ['Reasonable with allowance needed', 'Refurbishment needed', 'Generally reasonable'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Observations...' },
    ],
  },
  {
    id: 'fire-protection',
    number: '3.12',
    title: 'Fire Protection & Means of Escape',
    category: 'internal',
    hasConditionRating: true,
    standardTexts: [
      'Fire protection in this building is considered average for a building of this age and style.',
      'It would be prudent to install a hard-wired and interlinked smoke alarm, heat detector and carbon monoxide detectors throughout.',
    ],
    fields: [
      { key: 'smokeAlarms', label: 'Smoke Alarms', type: 'select', options: ['Present', 'Not present'] },
      { key: 'propertyType', label: 'Property Fire Consideration', type: 'select', options: ['Standard two-storey', 'Three-storey property', 'Open plan kitchen', 'Flat', 'Loft conversion'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Observations...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },

  // SERVICES (Part 4)
  {
    id: 'water-supply',
    number: '4.01',
    title: 'Water Supply / Pressure',
    category: 'services',
    hasConditionRating: true,
    standardTexts: [
      'The water pressure seems to be adequate for standard domestic use.',
      'Properties built before 1980 may have lead or cast-iron pipework.',
    ],
    fields: [
      { key: 'stopcockLocation', label: 'Mains Stopcock Location', type: 'text', placeholder: 'Location...' },
      { key: 'supplyType', label: 'Supply Type', type: 'select', options: ['Mains', 'Private'] },
      { key: 'pipeworkMaterial', label: 'Pipework Material', type: 'text', placeholder: 'e.g., Copper / Plastic / Lead noted' },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Visible condition, lead pipes, pressure...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'plumbing-heating',
    number: '4.02',
    title: 'Plumbing & Heating',
    category: 'services',
    hasConditionRating: true,
    standardTexts: [
      'The plumbing consists of copper pipework and PVC wastes. We recommend a plumber check the system.',
    ],
    fields: [
      { key: 'heatingType', label: 'Primary Heating Type', type: 'select', options: ['Gas central heating', 'Oil', 'Electric', 'Heat pump', 'Solid fuel'] },
      { key: 'heatDistribution', label: 'Heat Distribution', type: 'select', options: ['Radiators', 'Underfloor', 'Mixed'] },
      { key: 'boilerType', label: 'Boiler Type', type: 'text', placeholder: 'Make, model, approximate age...' },
      { key: 'hotWaterSystem', label: 'Hot Water System', type: 'select', options: ['Combi', 'Cylinder - vented', 'Cylinder - unvented'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Age, condition, radiators...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'gas-installation',
    number: '4.03',
    title: 'Gas Installation',
    category: 'services',
    hasConditionRating: true,
    standardTexts: [
      'All gas appliances, pipework and flues should be the subject of an annual service by a qualified gas engineer.',
    ],
    fields: [
      { key: 'meterLocation', label: 'Meter Location', type: 'text', placeholder: 'Location...' },
      { key: 'boilerType', label: 'Boiler Type', type: 'select', options: ['Combi', 'System', 'Regular', 'No gas'] },
      { key: 'boilerMakeModel', label: 'Make / Model', type: 'text', placeholder: 'If visible...' },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Location, condition, CO detector...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'electrical',
    number: '4.04',
    title: 'Electrical Services',
    category: 'services',
    hasConditionRating: true,
    standardTexts: [
      'The 18th Edition of the IEE Regulations recommends an electrical test to be carried out every five years.',
      'We recommend that you have an electrical test carried out by a qualified electrician.',
    ],
    fields: [
      { key: 'meterLocation', label: 'Meter Location', type: 'text', placeholder: 'Location...' },
      { key: 'consumerUnitLocation', label: 'Consumer Unit Location', type: 'text', placeholder: 'Location...' },
      { key: 'consumerUnitType', label: 'Consumer Unit Type', type: 'select', options: ['Modern with RCDs', 'Older rewireable fuses', 'Mixed'] },
      { key: 'hasSolarPanels', label: 'Solar Panels', type: 'select', options: ['No', 'Yes'] },
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Age, visible condition, deficiencies...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'sanitary-ware',
    number: '4.05',
    title: 'Sanitary Ware',
    category: 'services',
    hasConditionRating: true,
    standardTexts: [
      'The mastic sealant around baths and shower enclosures should be maintained along with the tiles and grouting.',
    ],
    fields: [
      { key: 'observations', label: 'Property-Specific Observations', type: 'textarea', placeholder: 'Condition, leaks, ventilation, sealant...' },
      { key: 'meaning', label: 'What This Means For You', type: 'textarea', placeholder: 'Plain English explanation...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },

  // ADDITIONAL
  {
    id: 'deleterious-materials',
    number: '5.01',
    title: 'Deleterious Materials & Health Issues',
    category: 'additional',
    hasConditionRating: false,
    standardTexts: [
      'Asbestos was commonly used in building materials until 1999.',
      'Asbestos is not dangerous if left undisturbed. However, if materials are damaged, drilled, cut, or sanded, fibres can be released.',
    ],
    fields: [
      { key: 'asbestosRisk', label: 'Asbestos Risk Areas', type: 'textarea', placeholder: 'Textured coatings, floor tiles, locations...' },
      { key: 'otherMaterials', label: 'Other Deleterious Materials', type: 'textarea', placeholder: 'Lead paint, HAC, etc...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
  {
    id: 'environmental',
    number: '5.02',
    title: 'Environmental Hazards, Radon, Flooding & Trees',
    category: 'additional',
    hasConditionRating: false,
    standardTexts: [
      'Radon is a naturally occurring radioactive gas that can accumulate in buildings.',
      'Trees close to buildings can cause structural damage.',
    ],
    fields: [
      { key: 'radonRisk', label: 'Radon Risk', type: 'select', options: ['Low', 'Medium', 'High'] },
      { key: 'floodRisk', label: 'Flood Risk', type: 'select', options: ['Low', 'Medium', 'High'] },
      { key: 'treeObservations', label: 'Tree Observations', type: 'textarea', placeholder: 'Trees and proximity to building...' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommendations...' },
    ],
  },
];

export const sectionCategories = [
  { id: 'general', label: 'Part 1: General Information', color: 'blue' },
  { id: 'external', label: 'Part 2: External', color: 'green' },
  { id: 'internal', label: 'Part 3: Internal', color: 'orange' },
  { id: 'services', label: 'Part 4: Services', color: 'purple' },
  { id: 'additional', label: 'Part 5: Additional', color: 'red' },
] as const;

export function getSectionsByCategory(category: string): RICSSection[] {
  return ricsSections.filter(s => s.category === category);
}

export function getSectionById(id: string): RICSSection | undefined {
  return ricsSections.find(s => s.id === id);
}
