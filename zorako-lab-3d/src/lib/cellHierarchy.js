/**
 * ZORAKO LAB: Sub-Component Tree & Material Spec Registry
 * Defines micro-geometries, material thermal boundaries, and initial conditions.
 */

export const CELL_SUBCOMPONENTS = {
  id: 'cell-18650-root',
  name: '18650 Lithium Cell Assembly',
  type: 'ASSEMBLY',
  children: [
    {
      id: 'outer-can',
      name: 'Nickel-Plated Steel Casing',
      type: 'PARTS',
      material: 'Steel_304',
      thicknessMm: 0.25,
      densityKgM3: 7900,
      thermalCondWMK: 16.2,
      meltingPointK: 1723.15,
      opacity: 1.0,
      visible: true,
    },
    {
      id: 'top-cap-assembly',
      name: 'Top Safety Cap & CID Assembly',
      type: 'ASSEMBLY',
      children: [
        {
          id: 'pos-terminal',
          name: 'Positive Button Terminal',
          type: 'PARTS',
          material: 'Nickel_Pure',
          thicknessMm: 0.4,
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'ptc-vent',
          name: 'Pressure Relief Vent (PTC Disc)',
          type: 'PARTS',
          material: 'Aluminium_1050',
          burstPressurePa: 1.2e6, // 1.2 MPa burst threshold
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'insulator-gasket',
          name: 'High-Temp Polymer Gasket',
          type: 'PARTS',
          material: 'Polypropylene',
          meltingPointK: 433.15, // 160°C breakdown
          opacity: 1.0,
          visible: true,
        }
      ]
    },
    {
      id: 'jelly-roll-core',
      name: 'Spiral Jelly-Roll Core',
      type: 'ASSEMBLY',
      children: [
        {
          id: 'cathode-foil',
          name: 'Cathode Current Collector (Aluminium)',
          type: 'PARTS',
          thicknessUm: 15, // 15 micrometers
          material: 'Aluminium_Foil',
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'cathode-coating',
          name: 'Active Cathode Material (NMC-811)',
          type: 'PARTS',
          thicknessUm: 70,
          material: 'LiNi0.8Mn0.1Co0.1O2',
          densityKgM3: 4700,
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'separator-membrane',
          name: 'Ceramic-Coated Separator Membrane',
          type: 'PARTS',
          thicknessUm: 12,
          material: 'PE_Ceramic_Coated',
          shrinkageTempK: 393.15, // 120°C structural contraction (causes short circuit)
          opacity: 0.8,
          visible: true,
        },
        {
          id: 'anode-coating',
          name: 'Active Anode Material (Graphite/Silicon)',
          type: 'PARTS',
          thicknessUm: 80,
          material: 'Graphite_SiOx',
          opacity: 1.0,
          visible: true,
        },
        {
          id: 'anode-foil',
          name: 'Anode Current Collector (Copper)',
          type: 'PARTS',
          thicknessUm: 10,
          material: 'Copper_Foil',
          opacity: 1.0,
          visible: true,
        }
      ]
    }
  ]
};
