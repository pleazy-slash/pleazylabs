-- Seed Standard Physics Materials
INSERT INTO materials_catalog (name, category, bandgap_ev, refractive_index_n, water_vapor_transmission_rate, thermal_conductivity_w_mk)
VALUES 
    ('Perovskite MAPbI3', 'semiconductor', 1.750, 2.500, 0.0000, 0.50),
    ('Monocrystalline Silicon (c-Si)', 'semiconductor', 1.120, 3.850, 0.0000, 148.00),
    ('Polyolefin Elastomer (POE)', 'encapsulant', NULL, 1.480, 1.5000, 0.22),
    ('Ethylene-Vinyl Acetate (EVA)', 'encapsulant', NULL, 1.490, 35.0000, 0.31),
    ('Silicon Nitride (SiNx)', 'anti_reflective', NULL, 2.050, 0.0000, 20.00),
    ('Silver Metallization (Ag)', 'grid_contact', NULL, 0.140, 0.0000, 429.00)
ON CONFLICT (name) DO NOTHING;

-- Seed Sample Solar Spectrum AM1.5G Points (Wavelength nm -> W/m²/nm)
INSERT INTO solar_spectra (spectrum_name, wavelength_nm, spectral_irradiance_w_m2_nm)
VALUES 
    ('AM1.5G', 350, 0.22000),
    ('AM1.5G', 500, 1.54000),
    ('AM1.5G', 650, 1.42000),
    ('AM1.5G', 800, 1.11000),
    ('AM1.5G', 950, 0.78000),
    ('AM1.5G', 1100, 0.52000)
ON CONFLICT (spectrum_name, wavelength_nm) DO NOTHING;
-- Clear old test records
TRUNCATE TABLE architecture_layers CASCADE;

-- Ensure Base Solar Architecture Entries Exist
INSERT INTO solar_architectures (id, project_name, topology_type, total_area_cm2, target_efficiency_pct)
VALUES 
(1, 'Zorako Perovskite-Si Tandem Pro', 'Perovskite/c-Si Multi-Junction', 156.25, 29.5),
(2, 'Zorako TOPCon Ultra Cell', 'Tunnel Oxide Passivated Contact', 156.25, 25.8)
ON CONFLICT (id) DO UPDATE SET project_name = EXCLUDED.project_name;

-- Seed Layer Stack for Architecture #1 (Perovskite / Silicon Tandem)
INSERT INTO architecture_layers (architecture_id, material_id, layer_name, thickness_nm, layer_position)
VALUES 
(1, (SELECT id FROM materials_catalog WHERE name LIKE '%Silver%' LIMIT 1), 'Front Grid Electrode (Ag)', 150, 1),
(1, (SELECT id FROM materials_catalog WHERE name LIKE '%Indium Tin Oxide%' LIMIT 1), 'Top TCO Contact (ITO)', 80, 2),
(1, (SELECT id FROM materials_catalog WHERE name LIKE '%Perovskite%' LIMIT 1), 'Wide-Bandgap Perovskite Absorber', 350, 3),
(1, (SELECT id FROM materials_catalog WHERE name LIKE '%Monocrystalline Silicon%' LIMIT 1), 'Silicon Bottom Absorber (c-Si)', 180000, 4),
(1, (SELECT id FROM materials_catalog WHERE name LIKE '%Aluminum%' LIMIT 1), 'Rear Metal Contact (Al)', 200, 5);

-- Seed Layer Stack for Architecture #2 (TOPCon)
INSERT INTO architecture_layers (architecture_id, material_id, layer_name, thickness_nm, layer_position)
VALUES 
(2, (SELECT id FROM materials_catalog WHERE name LIKE '%Silver%' LIMIT 1), 'Front Metallization (Ag)', 120, 1),
(2, (SELECT id FROM materials_catalog WHERE name LIKE '%Silicon Nitride%' LIMIT 1), 'Anti-Reflective Coating (SiNx)', 75, 2),
(2, (SELECT id FROM materials_catalog WHERE name LIKE '%Monocrystalline Silicon%' LIMIT 1), 'n-Type Silicon Absorber', 150000, 3),
(2, (SELECT id FROM materials_catalog WHERE name LIKE '%Aluminum%' LIMIT 1), 'Rear Aluminum Electrode (Al)', 250, 4);
