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

    // 1. Element Combination & Chemical Safety Laws
    if (action === "MERGE_ELEMENTS") {
      const { elementA, elementB } = body;
      const mergeResult = mergeElements(elementA, elementB);
      return res.status(200).json({ success: true, mode: "ELEMENT_MERGER", result: mergeResult });
    }

    // 2. Component Extraction & Search Catalog
    if (action === "SEARCH_PARTS") {
      const searchTerm = body.query || "Solar";
      const partsResult = searchAndExtractPart(searchTerm);
      return res.status(200).json({ success: true, mode: "PART_EXTRACTION", result: partsResult });
    }

    // 3. Topology & Missing Component Validation
    if (action === "VALIDATE_ASSEMBLY") {
      const components = body.components || [];
      const validation = validateAssembly(components);
      return res.status(200).json({ success: true, mode: "ASSEMBLY_VALIDATION", result: validation });
    }

    // 4. Multi-Year Environmental Stress & Weathering Engine
    if (action === "RUN_AGING_TEST") {
      const {
        durationYears = 4,
        ambientTempC = 38,
        annualRainfallMm = 1500,
        sunlightIrradianceKw = 1.1,
        pressureBar = 1.05,
        encapsulationQuality = 0.85
      } = body;

      const agingReport = simulateMultiYearAging({
        durationYears,
        ambientTempC,
        annualRainfallMm,
        sunlightIrradianceKw,
        pressureBar,
        encapsulationQuality
      });

      return res.status(200).json({
        success: true,
        mode: "MULTI_YEAR_ENVIRONMENTAL_TEST",
        systemStatus: "Completed Weathering Simulation",
        report: agingReport
      });
    }

    return res.status(400).json({ success: false, error: "Invalid action specified." });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
