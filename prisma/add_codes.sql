-- Add program_code column to programs table
ALTER TABLE programs ADD COLUMN IF NOT EXISTS program_code VARCHAR(255);

-- Generate unique codes for existing programs
UPDATE programs SET program_code = CONCAT('PRG-', LPAD(CAST(FLOOR(RANDOM() * 100000000) AS TEXT), 8, '0')) WHERE program_code IS NULL;

-- Make it NOT NULL and add unique index
ALTER TABLE programs ALTER COLUMN program_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS programs_program_code_key ON programs(program_code);

-- Add application_code column to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS application_code VARCHAR(255);

-- Generate unique codes for existing applications
UPDATE applications SET application_code = CONCAT('APP-', LPAD(CAST(FLOOR(RANDOM() * 100000000) AS TEXT), 8, '0')) WHERE application_code IS NULL;

-- Make it NOT NULL and add unique index
ALTER TABLE applications ALTER COLUMN application_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS applications_application_code_key ON applications(application_code);
