-- ZORAKO MASTER ENTERPRISE CAD & MULTI-PHYSICS SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. UNIVERSAL COMPONENT & ASSEMBLY HIERARCHY GRAPH
CREATE TABLE IF NOT EXISTS components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES components(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    is_template BOOLEAN DEFAULT FALSE,
    sku_identifier VARCHAR(100),
    current_version INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. MATERIALS, CRYSTALLOGRAPHY, & CUSTOM MICRO-ALLOY LIBRARY
CREATE TABLE IF NOT EXISTS materials_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    stoichiometry JSONB NOT NULL DEFAULT '[]'::jsonb,
    lattice_constant_a_angstroms NUMERIC(10, 5),
    bandgap_ev NUMERIC(8, 4),
    electrical_resistivity_ohm_m NUMERIC(24, 16) NOT NULL,
    thermal_conductivity_w_mk NUMERIC(12, 4) NOT NULL,
    dielectric_breakdown_v_per_m NUMERIC(20, 2),
    density_g_per_cm3 NUMERIC(8, 4),
    melting_point_k NUMERIC(8, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ADVANCED VISUAL, PBR OPTICS, & COLOR RENDER SCHEMA
CREATE TABLE IF NOT EXISTS component_visuals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id UUID UNIQUE REFERENCES components(id) ON DELETE CASCADE,
    color_hex VARCHAR(9) DEFAULT '#1E293BFF',
    opacity NUMERIC(3, 2) DEFAULT 1.00 CHECK (opacity BETWEEN 0.0 AND 1.0),
    roughness NUMERIC(3, 2) DEFAULT 0.30 CHECK (roughness BETWEEN 0.0 AND 1.0),
    metalness NUMERIC(3, 2) DEFAULT 0.80 CHECK (metalness BETWEEN 0.0 AND 1.0),
    emissive_hex VARCHAR(9) DEFAULT '#00000000',
    material_texture VARCHAR(100) DEFAULT 'STANDARD_POLISHED',
    mesh_geometry JSONB NOT NULL DEFAULT '{}'::jsonb,
    viewport_transform JSONB NOT NULL DEFAULT '{"position": [0,0,0], "rotation": [0,0,0], "scale": [1,1,1]}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. MICRO-PHYSICS & PARAMETRIC DATA SCHEMA
CREATE TABLE IF NOT EXISTS component_physics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id UUID UNIQUE REFERENCES components(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials_library(id) ON DELETE SET NULL,
    governing_equations JSONB NOT NULL DEFAULT '[]'::jsonb,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    simulated_outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. WIRE, TRACE, & HIGH-VOLTAGE CONDUCTOR SIMULATION
CREATE TABLE IF NOT EXISTS wire_trace_physics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    wire_gauge_awg INT,
    cross_section_mm2 NUMERIC(12, 6) NOT NULL,
    conductor_material_id UUID REFERENCES materials_library(id),
    insulation_material_id UUID REFERENCES materials_library(id),
    operating_voltage_v NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    operating_current_a NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    max_ampacity_a NUMERIC(12, 2) NOT NULL,
    dielectric_voltage_limit_v NUMERIC(12, 2) NOT NULL,
    is_fused_or_melted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PROCEDURAL MATH-TO-VISUAL GENERATOR ENGINE
CREATE TABLE IF NOT EXISTS procedural_math_generators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    formula_name VARCHAR(150) NOT NULL,
    expression_math TEXT NOT NULL,
    target_channel VARCHAR(50) NOT NULL,
    variable_bounds JSONB NOT NULL DEFAULT '{"x": [-10, 10], "y": [-10, 10], "step": 0.1}'::jsonb,
    generated_mesh_cache JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. INTER-COMPONENT CIRCUIT & PHYSICAL TOPOLOGY
CREATE TABLE IF NOT EXISTS circuit_port_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    target_component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    source_port VARCHAR(100) NOT NULL,
    target_port VARCHAR(100) NOT NULL,
    connection_type VARCHAR(50) NOT NULL,
    parasitic_resistance_ohms NUMERIC(14, 8) DEFAULT 0.00000000,
    parasitic_inductance_henries NUMERIC(18, 12) DEFAULT 0.00000000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. REVISION HISTORY & SNAPSHOT DIFFS
CREATE TABLE IF NOT EXISTS component_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    snapshot_data JSONB NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_components_parent ON components(parent_id);
CREATE INDEX IF NOT EXISTS idx_components_domain ON components(domain);
CREATE INDEX IF NOT EXISTS idx_physics_parameters ON component_physics USING gin (parameters);
CREATE INDEX IF NOT EXISTS idx_materials_stoichiometry ON materials_library USING gin (stoichiometry);
CREATE INDEX IF NOT EXISTS idx_port_connections ON circuit_port_connections(source_component_id, target_component_id);
-- 1. Reset and Recreate Full Schema
DROP TABLE IF EXISTS experimental_simulations CASCADE;
DROP TABLE IF EXISTS architecture_layers CASCADE;
DROP TABLE IF EXISTS solar_architectures CASCADE;
DROP TABLE IF EXISTS materials_catalog CASCADE;
DROP TABLE IF EXISTS lab_profiles CASCADE;

CREATE TABLE lab_profiles (
    id SERIAL PRIMARY KEY,
    lab_name VARCHAR(255) NOT NULL,
    brand_tagline VARCHAR(255),
    logo_url TEXT,
    primary_color VARCHAR(10) DEFAULT '#00FFCC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materials_catalog (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    bandgap_ev NUMERIC(5, 3),
    refractive_index_n NUMERIC(6, 3),
    extinction_coeff_k NUMERIC(8, 5),
    thermal_conductivity_w_mk NUMERIC(8, 2),
    work_function_ev NUMERIC(5, 2),
    reduction_potential_v NUMERIC(5, 2),
    electrical_resistivity_ohm_m NUMERIC(15, 12),
    manufacturing_method TEXT,
    oxidation_states VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE solar_architectures (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    topology_type VARCHAR(100) DEFAULT 'Custom',
    total_area_cm2 NUMERIC(8, 2) DEFAULT 156.25,
    target_efficiency_pct NUMERIC(5, 2) DEFAULT 25.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE architecture_layers (
    id SERIAL PRIMARY KEY,
    architecture_id INT REFERENCES solar_architectures(id) ON DELETE CASCADE,
    material_id INT REFERENCES materials_catalog(id) ON DELETE CASCADE,
    layer_name VARCHAR(255) NOT NULL,
    thickness_nm NUMERIC(10, 2) NOT NULL,
    layer_position INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE experimental_simulations (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    lab_id INT REFERENCES lab_profiles(id) ON DELETE CASCADE,
    architecture_id INT REFERENCES solar_architectures(id) ON DELETE CASCADE,
    voc_volts NUMERIC(6, 4),
    jsc_ma_cm2 NUMERIC(6, 2),
    fill_factor_pct NUMERIC(5, 2),
    calculated_pce_pct NUMERIC(5, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed Default Lab Profile
INSERT INTO lab_profiles (id, lab_name, brand_tagline)
VALUES (1, 'Zorako Advanced Photovoltaics Lab', 'Next-Generation Solid-State & Optoelectronic Research');

-- 3. Seed Core Materials
INSERT INTO materials_catalog (id, name, category, bandgap_ev, refractive_index_n, work_function_ev, electrical_resistivity_ohm_m, manufacturing_method)
VALUES 
(1, 'Silver (Ag)', 'metal_contact', 0.000, 0.140, 4.26, 0.0000000159, 'Screen Printing'),
(2, 'Indium Tin Oxide (ITO)', 'tco', 3.750, 1.900, 4.80, 0.0000020000, 'DC Sputtering'),
(3, 'Perovskite (CsPbI3)', 'semiconductor', 1.730, 2.500, 3.90, 0.0500000000, 'Spin Coating'),
(4, 'Monocrystalline Silicon (c-Si)', 'semiconductor', 1.120, 3.850, 4.05, 0.0010000000, 'Czochralski Growth'),
(5, 'Aluminum (Al)', 'metal_contact', 0.000, 1.440, 4.06, 0.0000000265, 'Thermal Evaporation');

-- 4. Seed Architectures & Layers
INSERT INTO solar_architectures (id, project_name, topology_type)
VALUES (1, 'Zorako Perovskite-Si Tandem Pro', 'Perovskite/c-Si Multi-Junction');

INSERT INTO architecture_layers (architecture_id, material_id, layer_name, thickness_nm, layer_position)
VALUES 
(1, 1, 'Front Grid Electrode (Ag)', 150, 1),
(1, 2, 'Top TCO Contact (ITO)', 80, 2),
(1, 3, 'Wide-Bandgap Perovskite Absorber', 350, 3),
(1, 4, 'Silicon Bottom Absorber (c-Si)', 180000, 4),
(1, 5, 'Rear Metal Contact (Al)', 200, 5);

-- 5. Seed Initial Baseline Simulation Record (Guarantees ID 1 Exists Immediately)
INSERT INTO experimental_simulations (id, project_name, lab_id, architecture_id, voc_volts, jsc_ma_cm2, fill_factor_pct, calculated_pce_pct, notes)
VALUES (1, 'Baseline Test Run', 1, 1, 1.3705, 24.25, 81.20, 27.00, 'Pre-seeded baseline lab run.');

-- Adjust sequence counters so new dynamic inserts start after ID 1
SELECT setval('lab_profiles_id_seq', (SELECT MAX(id) FROM lab_profiles));
SELECT setval('materials_catalog_id_seq', (SELECT MAX(id) FROM materials_catalog));
SELECT setval('solar_architectures_id_seq', (SELECT MAX(id) FROM solar_architectures));
SELECT setval('architecture_layers_id_seq', (SELECT MAX(id) FROM architecture_layers));
SELECT setval('experimental_simulations_id_seq', (SELECT MAX(id) FROM experimental_simulations));
-- Add Thermal and Radiation Coefficients to Materials Catalog
ALTER TABLE materials_catalog 
ADD COLUMN IF NOT EXISTS temp_coeff_voc_pct_k NUMERIC(6, 4) DEFAULT -0.3500,
ADD COLUMN IF NOT EXISTS radiation_hardness_score NUMERIC(3, 2) DEFAULT 0.85;

-- Update Perovskite and Silicon Thermal Coefficients
UPDATE materials_catalog SET temp_coeff_voc_pct_k = -0.4100 WHERE name LIKE '%Perovskite%';
UPDATE materials_catalog SET temp_coeff_voc_pct_k = -0.3200 WHERE name LIKE '%Monocrystalline%';

-- Add Environmental Stress Parameters Table to Track Conditions
CREATE TABLE IF NOT EXISTS simulation_environmental_conditions (
    id SERIAL PRIMARY KEY,
    simulation_id INT REFERENCES experimental_simulations(id) ON DELETE CASCADE,
    operating_temp_c NUMERIC(5, 2) DEFAULT 25.0,
    radiation_flux_rads NUMERIC(10, 2) DEFAULT 0.0,
    relative_humidity_pct NUMERIC(5, 2) DEFAULT 45.0,
    uv_exposure_hours NUMERIC(8, 2) DEFAULT 0.0
);
-- Table for custom lab branding & user experiment profiles
CREATE TABLE IF NOT EXISTS lab_profiles (
    id SERIAL PRIMARY KEY,
    lab_name VARCHAR(255) NOT NULL,
    brand_tagline VARCHAR(255),
    logo_url TEXT,
    primary_color VARCHAR(10) DEFAULT '#00FFCC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for experimental simulation runs
CREATE TABLE IF NOT EXISTS experimental_simulations (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    lab_id INT REFERENCES lab_profiles(id) ON DELETE SET NULL,
    architecture_id INT REFERENCES solar_architectures(id) ON DELETE CASCADE,
    voc_volts NUMERIC(6, 4),
    jsc_ma_cm2 NUMERIC(6, 2),
    fill_factor_pct NUMERIC(5, 2),
    calculated_pce_pct NUMERIC(5, 2),
    quantum_efficiency_pct NUMERIC(5, 2),
    degradation_rate_per_yr NUMERIC(5, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default lab profile
INSERT INTO lab_profiles (lab_name, brand_tagline)
VALUES ('Zorako Advanced Photovoltaics Lab', 'Next-Generation Solid-State & Optoelectronic Research')
ON CONFLICT DO NOTHING;
ALTER TABLE materials_catalog 
ADD COLUMN IF NOT EXISTS perceived_hex_color VARCHAR(10) DEFAULT '#A0A0A0',
ADD COLUMN IF NOT EXISTS reactivity_index_water NUMERIC(3,2) DEFAULT 0.10, -- Scale 0.0 (Inert) to 1.0 (Violent/Unstable)
ADD COLUMN IF NOT EXISTS reactivity_index_oxygen NUMERIC(3,2) DEFAULT 0.15,
ADD COLUMN IF NOT EXISTS electron_affinity_ev NUMERIC(4,2) DEFAULT 3.90,
ADD COLUMN IF NOT EXISTS crystal_structure VARCHAR(50) DEFAULT 'Cubic / Amorphous';

-- Seed Known Material Colors and Chemical Reactivities
UPDATE materials_catalog SET perceived_hex_color = '#FFD700', reactivity_index_water = 0.01, reactivity_index_oxygen = 0.02 WHERE name LIKE '%Gold%';
UPDATE materials_catalog SET perceived_hex_color = '#B87333', reactivity_index_water = 0.05, reactivity_index_oxygen = 0.35 WHERE name LIKE '%Copper%';
UPDATE materials_catalog SET perceived_hex_color = '#0D0D0D', reactivity_index_water = 0.85, reactivity_index_oxygen = 0.90 WHERE name LIKE '%Perovskite%';
UPDATE materials_catalog SET perceived_hex_color = '#2F4F4F', reactivity_index_water = 0.02, reactivity_index_oxygen = 0.05 WHERE name LIKE '%Silicon%';
-- Drop and recreate materials_catalog with comprehensive physical properties
ALTER TABLE materials_catalog 
ADD COLUMN IF NOT EXISTS extinction_coeff_k NUMERIC(8, 5) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS electron_affinity_ev NUMERIC(4, 2) DEFAULT 4.0,
ADD COLUMN IF NOT EXISTS conduction_band_ev NUMERIC(4, 2) DEFAULT -4.0,
ADD COLUMN IF NOT EXISTS valence_band_ev NUMERIC(4, 2) DEFAULT -5.5,
ADD COLUMN IF NOT EXISTS electron_mobility_cm2_vs NUMERIC(8, 2) DEFAULT 100.0,
ADD COLUMN IF NOT EXISTS hole_mobility_cm2_vs NUMERIC(8, 2) DEFAULT 50.0,
ADD COLUMN IF NOT EXISTS dielectric_constant NUMERIC(5, 2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS density_g_cm3 NUMERIC(5, 2) DEFAULT 2.5;

-- Update existing materials with real physical constants
UPDATE materials_catalog 
SET 
    electron_affinity_ev = 3.90,
    conduction_band_ev = -3.90,
    valence_band_ev = -5.65,
    electron_mobility_cm2_vs = 2.00,
    hole_mobility_cm2_vs = 2.00,
    dielectric_constant = 25.70,
    density_g_cm3 = 4.10
WHERE name LIKE '%Perovskite%';

UPDATE materials_catalog 
SET 
    electron_affinity_ev = 4.05,
    conduction_band_ev = -4.05,
    valence_band_ev = -5.17,
    electron_mobility_cm2_vs = 1400.00,
    hole_mobility_cm2_vs = 450.00,
    dielectric_constant = 11.70,
    density_g_cm3 = 2.33
WHERE name LIKE '%Silicon%';
ALTER TABLE materials_catalog 
ADD COLUMN IF NOT EXISTS oxidation_states TEXT,
ADD COLUMN IF NOT EXISTS work_function_ev NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS reduction_potential_v NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS electrical_resistivity_ohm_m NUMERIC(12, 10);

-- Insert/Update Primary Solar Cell Metals & Contacts
INSERT INTO materials_catalog 
(name, category, bandgap_ev, refractive_index_n, extinction_coeff_k, density_g_cm3, oxidation_states, work_function_ev, reduction_potential_v, electrical_resistivity_ohm_m)
VALUES
('Silver (Ag)', 'metal_contact', 0.0, 0.14, 4.15, 10.49, '+1', 4.26, 0.80, 0.0000000159),
('Aluminum (Al)', 'metal_contact', 0.0, 1.44, 5.23, 2.70, '+3', 4.06, -1.66, 0.0000000265),
('Copper (Cu)', 'metal_contact', 0.0, 1.22, 2.60, 8.96, '+1, +2', 4.65, 0.34, 0.0000000168),
('Titanium (Ti)', 'metal_contact', 0.0, 2.15, 2.92, 4.50, '+2, +3, +4', 4.33, -1.63, 0.0000004200),
('Gold (Au)', 'metal_contact', 0.0, 0.27, 3.08, 19.30, '+1, +3', 5.10, 1.50, 0.0000000221),
('Nickel (Ni)', 'metal_contact', 0.0, 1.82, 3.32, 8.90, '+2, +3', 5.15, -0.26, 0.0000000693),
('Indium Tin Oxide (ITO)', 'tco', 3.75, 1.90, 0.01, 7.14, '+3 (In), +4 (Sn)', 4.80, 0.00, 0.0000020000)
ON CONFLICT DO NOTHING;
ALTER TABLE materials_catalog 
ADD COLUMN IF NOT EXISTS manufacturing_method TEXT,
ADD COLUMN IF NOT EXISTS oxidation_states TEXT,
ADD COLUMN IF NOT EXISTS work_function_ev NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS reduction_potential_v NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS electrical_resistivity_ohm_m NUMERIC(15, 12);

-- Populate manufacturing techniques & electrochemical constants
INSERT INTO materials_catalog 
(name, category, bandgap_ev, refractive_index_n, manufacturing_method, oxidation_states, work_function_ev, reduction_potential_v, electrical_resistivity_ohm_m)
VALUES
('Silver (Ag)', 'metal_contact', 0.0, 0.14, 'Screen Printing / Evaporation', '+1', 4.26, 0.80, 0.0000000159),
('Aluminum (Al)', 'metal_contact', 0.0, 1.44, 'Thermal Evaporation / Sputtering', '+3', 4.06, -1.66, 0.0000000265),
('Copper (Cu)', 'metal_contact', 0.0, 1.22, 'Electroplating', '+1, +2', 4.65, 0.34, 0.0000000168),
('Titanium (Ti)', 'metal_contact', 0.0, 2.15, 'Electron Beam Evaporation', '+2, +3, +4', 4.33, -1.63, 0.0000004200),
('Gold (Au)', 'metal_contact', 0.0, 0.27, 'Thermal Evaporation', '+1, +3', 5.10, 1.50, 0.0000000221),
('Nickel (Ni)', 'metal_contact', 0.0, 1.82, 'Electroless Plating', '+2, +3', 5.15, -0.26, 0.0000000693),
('Indium Tin Oxide (ITO)', 'tco', 3.75, 1.90, 'DC Magnetron Sputtering', '+3 (In), +4 (Sn)', 4.80, 0.00, 0.0000020000),
('Fluorine-doped Tin Oxide (FTO)', 'tco', 3.80, 2.00, 'Chemical Vapor Deposition (CVD)', '+4 (Sn)', 4.90, 0.00, 0.0000050000),
('Monocrystalline Silicon (c-Si)', 'semiconductor', 1.12, 3.50, 'Czochralski (CZ) Growth', '-4, +4', 4.05, -0.10, 0.0010000000),
('Perovskite (CsPbI3)', 'semiconductor', 1.73, 2.50, 'Spin Coating / Blade Coating', '+2 (Pb), +1 (Cs)', 3.90, 0.00, 0.0500000000)
ON CONFLICT DO NOTHING;
