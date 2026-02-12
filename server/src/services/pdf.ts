import PDFDocument from 'pdfkit';
import type Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// RICS section ordering and metadata
const sectionCategories = [
  { id: 'general', label: 'Part 1: General Information' },
  { id: 'external', label: 'Part 2: External Construction and Condition' },
  { id: 'internal', label: 'Part 3: Internal Construction and Condition' },
  { id: 'services', label: 'Part 4: Services' },
  { id: 'additional', label: 'Part 5: Additional Information' },
];

const sectionMeta: Record<string, { number: string; title: string; category: string; hasConditionRating: boolean }> = {
  'instructions':          { number: '1.01', title: 'Instructions', category: 'general', hasConditionRating: false },
  'overview':              { number: '1.02', title: 'Overview - Summary, Budget Costs and Recommendations', category: 'general', hasConditionRating: false },
  'legal-summary':         { number: '1.03', title: 'Legal Summary', category: 'general', hasConditionRating: false },
  'weather':               { number: '1.04', title: 'Weather', category: 'general', hasConditionRating: false },
  'tenure':                { number: '1.05', title: 'Tenure and Occupation', category: 'general', hasConditionRating: false },
  'orientation':           { number: '1.06', title: 'Orientation of Building and Location', category: 'general', hasConditionRating: false },
  'roads':                 { number: '1.07', title: 'Roads, Footpaths and Parking', category: 'general', hasConditionRating: false },
  'accommodation':         { number: '1.08', title: 'Accommodation', category: 'general', hasConditionRating: false },
  'garage':                { number: '1.09', title: 'Garage / Outbuildings', category: 'general', hasConditionRating: true },
  'roof':                  { number: '2.01', title: 'Roof Coverings', category: 'external', hasConditionRating: true },
  'chimneys':              { number: '2.02', title: 'Chimneys', category: 'external', hasConditionRating: true },
  'flashings':             { number: '2.03', title: 'Flashings & Soakers', category: 'external', hasConditionRating: true },
  'parapets':              { number: '2.04', title: 'Parapets', category: 'external', hasConditionRating: true },
  'rainwater':             { number: '2.05', title: 'Rainwater Goods, Fascia & Soffits', category: 'external', hasConditionRating: true },
  'external-walls':        { number: '2.06', title: 'External Walls & Elevations', category: 'external', hasConditionRating: true },
  'external-joinery':      { number: '2.07', title: 'External Joinery', category: 'external', hasConditionRating: true },
  'external-decorations':  { number: '2.08', title: 'External Decorations', category: 'external', hasConditionRating: true },
  'drainage':              { number: '2.09', title: 'Drainage', category: 'external', hasConditionRating: true },
  'foundations':           { number: '2.10', title: 'Foundations', category: 'external', hasConditionRating: true },
  'grounds':               { number: '2.11', title: 'Grounds & Boundaries', category: 'external', hasConditionRating: true },
  'roof-void':             { number: '3.01', title: 'Roof Void', category: 'internal', hasConditionRating: true },
  'ceilings':              { number: '3.02', title: 'Ceilings', category: 'internal', hasConditionRating: true },
  'internal-walls':        { number: '3.03', title: 'Internal Walls & Partitions', category: 'internal', hasConditionRating: true },
  'fireplaces':            { number: '3.04', title: 'Fireplaces, Flues & Chimney Breasts', category: 'internal', hasConditionRating: true },
  'floors':                { number: '3.05', title: 'Floors', category: 'internal', hasConditionRating: true },
  'internal-joinery':      { number: '3.06', title: 'Internal Joinery', category: 'internal', hasConditionRating: true },
  'cellar':                { number: '3.07', title: 'Cellar / Basement', category: 'internal', hasConditionRating: true },
  'dampness':              { number: '3.08', title: 'Dampness & DPC', category: 'internal', hasConditionRating: true },
  'timber-decay':          { number: '3.09', title: 'Timber Decay & Infestation', category: 'internal', hasConditionRating: true },
  'thermal-insulation':    { number: '3.10', title: 'Thermal Insulation', category: 'internal', hasConditionRating: true },
  'internal-decorations':  { number: '3.11', title: 'Internal Decorations', category: 'internal', hasConditionRating: true },
  'fire-protection':       { number: '3.12', title: 'Fire Protection & Means of Escape', category: 'internal', hasConditionRating: true },
  'water-supply':          { number: '4.01', title: 'Water Supply / Pressure', category: 'services', hasConditionRating: true },
  'plumbing-heating':      { number: '4.02', title: 'Plumbing & Heating', category: 'services', hasConditionRating: true },
  'gas-installation':      { number: '4.03', title: 'Gas Installation', category: 'services', hasConditionRating: true },
  'electrical':            { number: '4.04', title: 'Electrical Services', category: 'services', hasConditionRating: true },
  'sanitary-ware':         { number: '4.05', title: 'Sanitary Ware', category: 'services', hasConditionRating: true },
  'deleterious-materials': { number: '5.01', title: 'Deleterious Materials & Health Issues', category: 'additional', hasConditionRating: false },
  'environmental':         { number: '5.02', title: 'Environmental Hazards, Radon, Flooding & Trees', category: 'additional', hasConditionRating: false },
};

// Ordered list of section IDs matching the RICS structure
const sectionOrder = [
  'instructions', 'overview', 'legal-summary', 'weather', 'tenure', 'orientation', 'roads', 'accommodation', 'garage',
  'roof', 'chimneys', 'flashings', 'parapets', 'rainwater', 'external-walls', 'external-joinery', 'external-decorations', 'drainage', 'foundations', 'grounds',
  'roof-void', 'ceilings', 'internal-walls', 'fireplaces', 'floors', 'internal-joinery', 'cellar', 'dampness', 'timber-decay', 'thermal-insulation', 'internal-decorations', 'fire-protection',
  'water-supply', 'plumbing-heating', 'gas-installation', 'electrical', 'sanitary-ware',
  'deleterious-materials', 'environmental',
];

interface SurveyRow {
  id: string;
  reference: string | null;
  surveyDate: string | null;
  reportDate: string | null;
  clientName: string | null;
  propertyAddress: string | null;
  propertyType: string | null;
  constructionType: string | null;
  approximateAge: string | null;
  approximateArea: string | null;
  tenure: string | null;
  weather: string | null;
  orientation: string | null;
  accommodation: string | null;
  garageOutbuildings: string | null;
  status: string;
}

interface CaptureRow {
  id: string;
  surveyId: string;
  sectionId: string;
  conditionRating: string | null;
  construction: string | null;
  observations: string | null;
  meaning: string | null;
  recommendations: string | null;
  standardText: string | null;
  fieldData: string | null;
}

interface PhotoRow {
  id: string;
  surveyId: string;
  sectionId: string;
  filename: string;
  originalName: string | null;
  description: string | null;
}

interface RepairCostRow {
  id: string;
  item: string | null;
  sectionRef: string | null;
  description: string | null;
  professional: string | null;
  priority: string | null;
  estimatedCost: number | null;
}

// Color constants
const BRAND_BLUE = '#1a3a5c';
const BRAND_LIGHT_BLUE = '#e8f0fe';
const HEADER_GRAY = '#f5f5f5';
const TEXT_COLOR = '#333333';
const RATING_COLORS: Record<string, string> = {
  '1': '#27ae60',
  '2': '#f39c12',
  '3': '#e74c3c',
  'NI': '#95a5a6',
};

function conditionLabel(rating: string | null): string {
  switch (rating) {
    case '1': return '1 - No repair is currently needed';
    case '2': return '2 - Defects that need repairing or replacing';
    case '3': return '3 - Serious defects / urgent repairs needed';
    case 'NI': return 'NI - Not inspected';
    default: return 'Not assessed';
  }
}

export async function generatePdf(
  surveyId: string,
  db: Database.Database,
  uploadsDir: string
): Promise<Buffer> {
  const survey = db.prepare('SELECT * FROM surveys WHERE id = ?').get(surveyId) as SurveyRow | undefined;
  if (!survey) {
    throw new Error('Survey not found');
  }

  const captures = db.prepare('SELECT * FROM captures WHERE surveyId = ?').all(surveyId) as CaptureRow[];
  const photos = db.prepare('SELECT * FROM photos WHERE surveyId = ? ORDER BY createdAt').all(surveyId) as PhotoRow[];
  const repairCosts = db.prepare('SELECT * FROM repair_costs WHERE surveyId = ?').all(surveyId) as RepairCostRow[];

  // Build lookup maps
  const captureMap = new Map<string, CaptureRow>();
  for (const c of captures) {
    captureMap.set(c.sectionId, c);
  }

  const photosBySectionMap = new Map<string, PhotoRow[]>();
  for (const p of photos) {
    if (!photosBySectionMap.has(p.sectionId)) {
      photosBySectionMap.set(p.sectionId, []);
    }
    photosBySectionMap.get(p.sectionId)!.push(p);
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
      bufferPages: true,
      info: {
        Title: `RICS Level 3 Survey - ${survey.propertyAddress || survey.reference || surveyId}`,
        Author: 'Drone Building Inspection & Surveying Services Ltd',
        Subject: 'RICS Home Survey Level 3',
        Creator: 'RICS Survey Application',
      },
    });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================

    function drawHorizontalLine(y?: number) {
      const lineY = y ?? doc.y;
      doc.moveTo(doc.page.margins.left, lineY)
        .lineTo(doc.page.width - doc.page.margins.right, lineY)
        .strokeColor('#cccccc')
        .lineWidth(0.5)
        .stroke();
      doc.y = lineY + 5;
    }

    function checkPageBreak(requiredSpace: number) {
      const bottomMargin = doc.page.height - doc.page.margins.bottom;
      if (doc.y + requiredSpace > bottomMargin) {
        doc.addPage();
      }
    }

    function writeLabel(label: string, value: string | null | undefined) {
      if (!value) return;
      checkPageBreak(30);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT_COLOR).text(`${label}: `, {
        continued: true,
      });
      doc.font('Helvetica').fontSize(9).text(value);
      doc.moveDown(0.3);
    }

    function writeParagraph(label: string, content: string | null | undefined) {
      if (!content) return;
      checkPageBreak(40);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_BLUE).text(label);
      doc.font('Helvetica').fontSize(9).fillColor(TEXT_COLOR).text(content, {
        lineGap: 2,
      });
      doc.moveDown(0.5);
    }

    // =========================================================================
    // COVER PAGE
    // =========================================================================

    doc.rect(0, 0, doc.page.width, 200).fill(BRAND_BLUE);
    doc.fontSize(28).fillColor('#ffffff').font('Helvetica-Bold');
    doc.text('RICS Home Survey', doc.page.margins.left, 60, { align: 'center', width: pageWidth });
    doc.fontSize(18).text('Level 3', { align: 'center', width: pageWidth });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#d0d8e8');
    doc.text('Building Survey', { align: 'center', width: pageWidth });

    doc.fillColor(TEXT_COLOR);
    doc.y = 240;

    // Company info
    doc.font('Helvetica-Bold').fontSize(14).fillColor(BRAND_BLUE);
    doc.text('Drone Building Inspection & Surveying Services Ltd', { align: 'center', width: pageWidth });
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10).fillColor(TEXT_COLOR);
    doc.text('Professional Building Surveyors', { align: 'center', width: pageWidth });
    doc.moveDown(2);

    // Property info box
    const boxX = doc.page.margins.left + 40;
    const boxWidth = pageWidth - 80;

    doc.rect(boxX, doc.y, boxWidth, 200).fill(BRAND_LIGHT_BLUE).stroke(BRAND_BLUE);
    const innerY = doc.y + 15;
    doc.y = innerY;

    doc.font('Helvetica-Bold').fontSize(12).fillColor(BRAND_BLUE);
    doc.text('Property Details', boxX + 20, doc.y, { width: boxWidth - 40 });
    doc.moveDown(0.8);

    const infoItems = [
      ['Property:', survey.propertyAddress || 'Not specified'],
      ['Client:', survey.clientName || 'Not specified'],
      ['Survey Date:', survey.surveyDate || 'Not specified'],
      ['Report Date:', survey.reportDate || new Date().toLocaleDateString('en-GB')],
      ['Reference:', survey.reference || surveyId.substring(0, 8).toUpperCase()],
    ];

    for (const [label, value] of infoItems) {
      doc.font('Helvetica-Bold').fontSize(10).fillColor(TEXT_COLOR);
      doc.text(label, boxX + 20, doc.y, { continued: true, width: boxWidth - 40 });
      doc.font('Helvetica').text(`  ${value}`);
      doc.moveDown(0.3);
    }

    doc.y = innerY + 210;
    doc.moveDown(2);

    // Condition rating key
    doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_BLUE);
    doc.text('Condition Rating Key', { align: 'center', width: pageWidth });
    doc.moveDown(0.5);

    const ratingDescriptions = [
      { rating: '1', color: '#27ae60', label: 'Condition Rating 1', desc: 'No repair is currently needed. Normal maintenance must be carried out.' },
      { rating: '2', color: '#f39c12', label: 'Condition Rating 2', desc: 'Defects that need repairing or replacing but are not considered to be either serious or urgent. The property must be maintained in the normal way.' },
      { rating: '3', color: '#e74c3c', label: 'Condition Rating 3', desc: 'Defects that are serious and/or need to be repaired, replaced or investigated urgently.' },
      { rating: 'NI', color: '#95a5a6', label: 'Not Inspected', desc: 'The element was not inspected during the survey.' },
    ];

    for (const rd of ratingDescriptions) {
      checkPageBreak(40);
      doc.rect(doc.page.margins.left, doc.y, 15, 15).fill(rd.color);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT_COLOR);
      doc.text(rd.label, doc.page.margins.left + 22, doc.y, { continued: true });
      doc.font('Helvetica').text(` - ${rd.desc}`, { width: pageWidth - 25 });
      doc.moveDown(0.5);
    }

    // =========================================================================
    // DOCUMENT INFORMATION TABLE
    // =========================================================================

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(16).fillColor(BRAND_BLUE);
    doc.text('Document Information');
    doc.moveDown(0.5);
    drawHorizontalLine();
    doc.moveDown(0.5);

    const docInfoRows = [
      ['Report Reference', survey.reference || surveyId.substring(0, 8).toUpperCase()],
      ['Client Name', survey.clientName || 'Not specified'],
      ['Property Address', survey.propertyAddress || 'Not specified'],
      ['Property Type', survey.propertyType || 'Not specified'],
      ['Construction Type', survey.constructionType || 'Not specified'],
      ['Approximate Age', survey.approximateAge || 'Not specified'],
      ['Approximate Floor Area', survey.approximateArea || 'Not specified'],
      ['Tenure', survey.tenure || 'Not specified'],
      ['Weather at Survey', survey.weather || 'Not specified'],
      ['Orientation', survey.orientation || 'Not specified'],
      ['Accommodation', survey.accommodation || 'Not specified'],
      ['Garage/Outbuildings', survey.garageOutbuildings || 'None noted'],
      ['Survey Date', survey.surveyDate || 'Not specified'],
      ['Report Date', survey.reportDate || new Date().toLocaleDateString('en-GB')],
    ];

    const labelColWidth = 180;
    const valueColWidth = pageWidth - labelColWidth;
    let alternate = false;

    for (const [label, value] of docInfoRows) {
      checkPageBreak(25);
      const rowY = doc.y;
      doc.fontSize(9);
      const textHeight = doc.heightOfString(value, { width: valueColWidth - 15 });
      const rowHeight = Math.max(20, textHeight + 8);

      if (alternate) {
        doc.rect(doc.page.margins.left, rowY, pageWidth, rowHeight).fill(HEADER_GRAY);
      }

      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_BLUE);
      doc.text(label, doc.page.margins.left + 5, rowY + 4, { width: labelColWidth - 10 });

      doc.font('Helvetica').fontSize(9).fillColor(TEXT_COLOR);
      doc.text(value, doc.page.margins.left + labelColWidth + 5, rowY + 4, { width: valueColWidth - 15 });

      doc.y = rowY + rowHeight;
      alternate = !alternate;
    }

    // =========================================================================
    // CONDITION RATING SUMMARY TABLE
    // =========================================================================

    doc.moveDown(1);
    checkPageBreak(80);

    doc.font('Helvetica-Bold').fontSize(16).fillColor(BRAND_BLUE);
    doc.text('Condition Rating Summary');
    doc.moveDown(0.5);
    drawHorizontalLine();
    doc.moveDown(0.5);

    // Table header
    const colWidths = [50, pageWidth - 130, 80];
    const headerY = doc.y;

    doc.rect(doc.page.margins.left, headerY, pageWidth, 22).fill(BRAND_BLUE);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
    doc.text('Ref', doc.page.margins.left + 5, headerY + 5, { width: colWidths[0] });
    doc.text('Section', doc.page.margins.left + colWidths[0] + 5, headerY + 5, { width: colWidths[1] });
    doc.text('Rating', doc.page.margins.left + colWidths[0] + colWidths[1] + 5, headerY + 5, { width: colWidths[2] });
    doc.y = headerY + 22;

    alternate = false;
    for (const sectionId of sectionOrder) {
      const meta = sectionMeta[sectionId];
      if (!meta || !meta.hasConditionRating) continue;

      checkPageBreak(22);
      const rowY = doc.y;
      const capture = captureMap.get(sectionId);
      const rating = capture?.conditionRating || '-';

      if (alternate) {
        doc.rect(doc.page.margins.left, rowY, pageWidth, 18).fill(HEADER_GRAY);
      }

      doc.font('Helvetica').fontSize(8).fillColor(TEXT_COLOR);
      doc.text(meta.number, doc.page.margins.left + 5, rowY + 4, { width: colWidths[0] });
      doc.text(meta.title, doc.page.margins.left + colWidths[0] + 5, rowY + 4, { width: colWidths[1] });

      // Color-coded rating
      const ratingColor = RATING_COLORS[rating] || '#999999';
      doc.font('Helvetica-Bold').fontSize(8).fillColor(ratingColor);
      doc.text(rating, doc.page.margins.left + colWidths[0] + colWidths[1] + 5, rowY + 4, { width: colWidths[2] });

      doc.y = rowY + 18;
      alternate = !alternate;
    }

    // =========================================================================
    // SECTION CONTENT - Iterate by category, then by section
    // =========================================================================

    for (const category of sectionCategories) {
      doc.addPage();
      doc.rect(0, 0, doc.page.width, 50).fill(BRAND_BLUE);
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#ffffff');
      doc.text(category.label, doc.page.margins.left, 15, { width: pageWidth });
      doc.y = 70;

      const categorySections = sectionOrder.filter((sid) => sectionMeta[sid]?.category === category.id);

      for (const sectionId of categorySections) {
        const meta = sectionMeta[sectionId];
        if (!meta) continue;

        const capture = captureMap.get(sectionId);
        const sectionPhotos = photosBySectionMap.get(sectionId) || [];

        checkPageBreak(80);

        // Section header
        doc.rect(doc.page.margins.left, doc.y, pageWidth, 24).fill(BRAND_LIGHT_BLUE);
        doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_BLUE);
        doc.text(`${meta.number}  ${meta.title}`, doc.page.margins.left + 8, doc.y + 6, { width: pageWidth - 16 });
        doc.y += 28;

        // Condition rating badge
        if (meta.hasConditionRating) {
          const rating = capture?.conditionRating || null;
          const ratingText = conditionLabel(rating);
          const badgeColor = RATING_COLORS[rating || ''] || '#999999';

          checkPageBreak(25);
          doc.rect(doc.page.margins.left, doc.y, 8, 16).fill(badgeColor);
          doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT_COLOR);
          doc.text(`Condition Rating: ${ratingText}`, doc.page.margins.left + 14, doc.y + 2, { width: pageWidth - 20 });
          doc.y += 22;
        }

        if (capture) {
          writeParagraph('Construction', capture.construction);
          writeParagraph('Observations', capture.observations);
          writeParagraph('What This Means For You', capture.meaning);
          writeParagraph('Recommendations', capture.recommendations);

          if (capture.standardText) {
            writeParagraph('Standard Information', capture.standardText);
          }

          // Render additional field data if present
          if (capture.fieldData) {
            try {
              const fields = JSON.parse(capture.fieldData) as Record<string, string>;
              for (const [key, value] of Object.entries(fields)) {
                if (value && typeof value === 'string' && value.trim()) {
                  // Format key as a readable label
                  const label = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (s) => s.toUpperCase())
                    .trim();
                  writeParagraph(label, value);
                }
              }
            } catch {
              // Ignore invalid JSON
            }
          }
        } else {
          doc.font('Helvetica').fontSize(9).fillColor('#888888');
          doc.text('No data captured for this section.', { width: pageWidth });
          doc.moveDown(0.3);
        }

        // Inline section photos (small thumbnails)
        if (sectionPhotos.length > 0) {
          checkPageBreak(120);
          doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_BLUE).text('Photographs:');
          doc.moveDown(0.3);

          let photoX = doc.page.margins.left;
          const photoMaxWidth = 150;
          const photoMaxHeight = 100;

          for (const photo of sectionPhotos) {
            const filePath = path.join(uploadsDir, photo.filename);
            if (!fs.existsSync(filePath)) continue;

            if (photoX + photoMaxWidth > doc.page.width - doc.page.margins.right) {
              photoX = doc.page.margins.left;
              doc.y += photoMaxHeight + 20;
            }

            checkPageBreak(photoMaxHeight + 30);

            try {
              doc.image(filePath, photoX, doc.y, {
                fit: [photoMaxWidth, photoMaxHeight],
                align: 'center',
                valign: 'center',
              });

              if (photo.description) {
                doc.font('Helvetica').fontSize(7).fillColor('#666666');
                doc.text(photo.description, photoX, doc.y + photoMaxHeight + 2, {
                  width: photoMaxWidth,
                  align: 'center',
                });
              }

              photoX += photoMaxWidth + 15;
            } catch {
              // Skip image if it cannot be loaded
            }
          }

          // Reset position after photos
          if (photoX > doc.page.margins.left) {
            doc.y += photoMaxHeight + 20;
          }
        }

        doc.moveDown(0.5);
        drawHorizontalLine();
        doc.moveDown(0.5);
      }
    }

    // =========================================================================
    // REPAIR COSTS TABLE (if any)
    // =========================================================================

    if (repairCosts.length > 0) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(16).fillColor(BRAND_BLUE);
      doc.text('Budget Costs for Identified Repairs');
      doc.moveDown(0.5);
      drawHorizontalLine();
      doc.moveDown(0.5);

      // Table header
      const costColWidths = [30, 60, pageWidth - 260, 80, 50, 60];
      const costHeaderY = doc.y;

      doc.rect(doc.page.margins.left, costHeaderY, pageWidth, 22).fill(BRAND_BLUE);
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');

      let costX = doc.page.margins.left + 3;
      const costHeaders = ['No.', 'Section', 'Description', 'Professional', 'Priority', 'Est. Cost'];
      for (let i = 0; i < costHeaders.length; i++) {
        doc.text(costHeaders[i], costX, costHeaderY + 5, { width: costColWidths[i] });
        costX += costColWidths[i];
      }
      doc.y = costHeaderY + 22;

      let totalCost = 0;
      alternate = false;

      for (let idx = 0; idx < repairCosts.length; idx++) {
        const rc = repairCosts[idx];
        checkPageBreak(25);

        const rowY = doc.y;
        if (alternate) {
          doc.rect(doc.page.margins.left, rowY, pageWidth, 18).fill(HEADER_GRAY);
        }

        doc.font('Helvetica').fontSize(7).fillColor(TEXT_COLOR);
        costX = doc.page.margins.left + 3;
        const costValues = [
          String(idx + 1),
          rc.sectionRef || '-',
          rc.description || '-',
          rc.professional || '-',
          rc.priority || '-',
          rc.estimatedCost != null ? `\u00A3${rc.estimatedCost.toLocaleString()}` : '-',
        ];

        for (let i = 0; i < costValues.length; i++) {
          doc.text(costValues[i], costX, rowY + 4, { width: costColWidths[i] });
          costX += costColWidths[i];
        }

        if (rc.estimatedCost) totalCost += rc.estimatedCost;

        doc.y = rowY + 18;
        alternate = !alternate;
      }

      // Total row
      checkPageBreak(25);
      const totalY = doc.y;
      doc.rect(doc.page.margins.left, totalY, pageWidth, 22).fill(BRAND_BLUE);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
      doc.text('Total Estimated Budget Cost', doc.page.margins.left + 5, totalY + 5, {
        width: pageWidth - costColWidths[costColWidths.length - 1] - 10,
      });
      doc.text(`\u00A3${totalCost.toLocaleString()}`, doc.page.margins.left + pageWidth - costColWidths[costColWidths.length - 1] - 3, totalY + 5, {
        width: costColWidths[costColWidths.length - 1] + 3,
        align: 'right',
      });
      doc.y = totalY + 25;
    }

    // =========================================================================
    // PHOTO APPENDIX
    // =========================================================================

    if (photos.length > 0) {
      doc.addPage();
      doc.rect(0, 0, doc.page.width, 50).fill(BRAND_BLUE);
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#ffffff');
      doc.text('Photographic Appendix', doc.page.margins.left, 15, { width: pageWidth });
      doc.y = 70;

      let photoIndex = 1;

      for (const sectionId of sectionOrder) {
        const sectionPhotos = photosBySectionMap.get(sectionId);
        if (!sectionPhotos || sectionPhotos.length === 0) continue;

        const meta = sectionMeta[sectionId];
        if (!meta) continue;

        checkPageBreak(50);
        doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_BLUE);
        doc.text(`${meta.number} - ${meta.title}`);
        doc.moveDown(0.3);

        for (const photo of sectionPhotos) {
          const filePath = path.join(uploadsDir, photo.filename);
          if (!fs.existsSync(filePath)) continue;

          checkPageBreak(320);

          try {
            doc.image(filePath, doc.page.margins.left, doc.y, {
              fit: [pageWidth, 280],
              align: 'center',
            });
            doc.y += 285;

            doc.font('Helvetica-Bold').fontSize(8).fillColor(TEXT_COLOR);
            doc.text(`Photo ${photoIndex}`, { continued: true, width: pageWidth });
            if (photo.description) {
              doc.font('Helvetica').text(` - ${photo.description}`);
            } else {
              doc.text('');
            }

            doc.moveDown(1);
            photoIndex++;
          } catch {
            // Skip unreadable images
          }
        }
      }
    }

    // =========================================================================
    // FOOTER - Terms and Conditions / Disclaimer
    // =========================================================================

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).fillColor(BRAND_BLUE);
    doc.text('Terms and Conditions');
    doc.moveDown(0.5);
    drawHorizontalLine();
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(8).fillColor(TEXT_COLOR);
    const terms = [
      'This report has been prepared by Drone Building Inspection & Surveying Services Ltd in accordance with the RICS Home Survey Standard (effective 1 March 2021).',
      'The report is for the use only of the named client. No liability to any third party is accepted or implied.',
      'The survey has been carried out without moving heavy furniture, floor coverings, stored items, or personal effects. Areas that were not accessible at the time of the survey have been noted.',
      'No opening up of the fabric of the building has been undertaken. Concealed defects may exist that could not be identified during a non-invasive inspection.',
      'Services have been visually inspected only and have not been tested. Specialist testing of all services is recommended before purchase.',
      'Where further investigation or specialist reports are recommended, these should be obtained before exchange of contracts.',
      'The surveyor has used reasonable skill and care in carrying out this inspection and producing this report.',
      'The condition ratings used in this report are defined in accordance with the RICS Home Survey Standard and are explained in the Condition Rating Key at the beginning of this report.',
    ];

    for (const term of terms) {
      checkPageBreak(30);
      doc.text(`\u2022  ${term}`, { lineGap: 2 });
      doc.moveDown(0.3);
    }

    doc.moveDown(1);
    doc.font('Helvetica').fontSize(8).fillColor('#888888');
    doc.text(`Report generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, { align: 'center', width: pageWidth });

    // Finalize the document
    doc.end();
  });
}
