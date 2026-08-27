import { mergeElements } from '../../../lib/materialCombiner';
import { validateAssembly, searchAndExtractPart } from '../../../lib/assemblyAnalyzer';
import { simulateMultiYearAging } from '../../../lib/multiYearAgingEngine';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = req.body || {};
    const action = body.action || "RUN_AGING_TEST";

    if (action === "MERGE_ELEMENTS") {
      const { elementA, elementB } = body;
      return res.status(200).json({ success: true, mode: "ELEMENT_MERGER", result: mergeElements(elementA, elementB) });
    }

    if (action === "SEARCH_PARTS") {
      const searchTerm = body.query || "Solar";
      return res.status(200).json({ success: true, mode: "PART_EXTRACTION", result: searchAndExtractPart(searchTerm) });
    }

    if (action === "VALIDATE_ASSEMBLY") {
      const components = body.components || [];
      return res.status(200).json({ success: true, mode: "ASSEMBLY_VALIDATION", result: validateAssembly(components) });
    }

    if (action === "RUN_AGING_TEST") {
      const { durationYears = 4, ambientTempC = 38, annualRainfallMm = 1500, sunlightIrradianceKw = 1.1 } = body;
      const report = simulateMultiYearAging({ durationYears, ambientTempC, annualRainfallMm, sunlightIrradianceKw });
      return res.status(200).json({ success: true, mode: "MULTI_YEAR_ENVIRONMENTAL_TEST", report });
    }

    return res.status(400).json({ success: false, error: "Invalid action" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
