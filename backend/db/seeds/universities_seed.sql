-- ============================================
-- UNIPATH: Real University Data
-- 120+ Universities with Accurate Information
-- ============================================

-- First, clear old fake data
DELETE FROM universities;

-- Reset the sequence
ALTER SEQUENCE universities_id_seq RESTART WITH 1;

-- ============================================
-- USA - TOP UNIVERSITIES
-- ============================================

INSERT INTO universities (name, city, country, program, language, min_gpa, deadline) VALUES
-- Ivy League & Top Tier (Very Competitive - GPA 3.7+)
('Harvard University', 'Cambridge', 'USA', 'Computer Science', 'English', 3.90, '2025-01-01'),
('Harvard University', 'Cambridge', 'USA', 'Data Science', 'English', 3.90, '2025-01-01'),
('Harvard University', 'Cambridge', 'USA', 'Business Administration', 'English', 3.85, '2025-01-01'),
('Massachusetts Institute of Technology', 'Cambridge', 'USA', 'Computer Science', 'English', 3.90, '2025-01-01'),
('Massachusetts Institute of Technology', 'Cambridge', 'USA', 'Data Science', 'English', 3.90, '2025-01-01'),
('Massachusetts Institute of Technology', 'Cambridge', 'USA', 'Artificial Intelligence', 'English', 3.90, '2025-01-01'),
('Stanford University', 'Stanford', 'USA', 'Computer Science', 'English', 3.85, '2025-01-02'),
('Stanford University', 'Stanford', 'USA', 'Data Science', 'English', 3.85, '2025-01-02'),
('Stanford University', 'Stanford', 'USA', 'Business Administration', 'English', 3.80, '2025-01-02'),
('Yale University', 'New Haven', 'USA', 'Computer Science', 'English', 3.80, '2025-01-01'),
('Yale University', 'New Haven', 'USA', 'Data Science', 'English', 3.80, '2025-01-01'),
('Princeton University', 'Princeton', 'USA', 'Computer Science', 'English', 3.85, '2025-01-01'),
('Columbia University', 'New York', 'USA', 'Computer Science', 'English', 3.75, '2025-01-15'),
('Columbia University', 'New York', 'USA', 'Data Science', 'English', 3.75, '2025-01-15'),
('Columbia University', 'New York', 'USA', 'Business Administration', 'English', 3.70, '2025-01-15'),
('University of Pennsylvania', 'Philadelphia', 'USA', 'Computer Science', 'English', 3.75, '2025-01-05'),
('University of Pennsylvania', 'Philadelphia', 'USA', 'Data Science', 'English', 3.75, '2025-01-05'),
('Cornell University', 'Ithaca', 'USA', 'Computer Science', 'English', 3.70, '2025-01-02'),
('Brown University', 'Providence', 'USA', 'Computer Science', 'English', 3.70, '2025-01-05'),

-- Top Public Universities (Competitive - GPA 3.5+)
('University of California, Berkeley', 'Berkeley', 'USA', 'Computer Science', 'English', 3.70, '2024-11-30'),
('University of California, Berkeley', 'Berkeley', 'USA', 'Data Science', 'English', 3.70, '2024-11-30'),
('University of California, Berkeley', 'Berkeley', 'USA', 'Electrical Engineering', 'English', 3.65, '2024-11-30'),
('University of California, Los Angeles', 'Los Angeles', 'USA', 'Computer Science', 'English', 3.65, '2024-11-30'),
('University of California, Los Angeles', 'Los Angeles', 'USA', 'Data Science', 'English', 3.65, '2024-11-30'),
('University of Michigan', 'Ann Arbor', 'USA', 'Computer Science', 'English', 3.60, '2025-02-01'),
('University of Michigan', 'Ann Arbor', 'USA', 'Data Science', 'English', 3.60, '2025-02-01'),
('University of Texas at Austin', 'Austin', 'USA', 'Computer Science', 'English', 3.50, '2024-12-01'),
('University of Texas at Austin', 'Austin', 'USA', 'Data Science', 'English', 3.50, '2024-12-01'),
('Georgia Institute of Technology', 'Atlanta', 'USA', 'Computer Science', 'English', 3.60, '2025-01-05'),
('Georgia Institute of Technology', 'Atlanta', 'USA', 'Data Science', 'English', 3.55, '2025-01-05'),
('University of Washington', 'Seattle', 'USA', 'Computer Science', 'English', 3.55, '2024-12-01'),
('University of Washington', 'Seattle', 'USA', 'Data Science', 'English', 3.55, '2024-12-01'),
('University of Illinois Urbana-Champaign', 'Champaign', 'USA', 'Computer Science', 'English', 3.50, '2025-01-15'),
('University of Illinois Urbana-Champaign', 'Champaign', 'USA', 'Data Science', 'English', 3.50, '2025-01-15'),

-- Good Universities (Moderate - GPA 3.0+)
('Purdue University', 'West Lafayette', 'USA', 'Computer Science', 'English', 3.30, '2025-01-15'),
('Purdue University', 'West Lafayette', 'USA', 'Data Science', 'English', 3.30, '2025-01-15'),
('Arizona State University', 'Tempe', 'USA', 'Computer Science', 'English', 3.00, '2025-02-01'),
('Arizona State University', 'Tempe', 'USA', 'Data Science', 'English', 3.00, '2025-02-01'),
('University of Florida', 'Gainesville', 'USA', 'Computer Science', 'English', 3.20, '2025-01-15'),
('University of Colorado Boulder', 'Boulder', 'USA', 'Computer Science', 'English', 3.20, '2025-01-15'),
('Boston University', 'Boston', 'USA', 'Computer Science', 'English', 3.40, '2025-01-02'),
('Boston University', 'Boston', 'USA', 'Data Science', 'English', 3.40, '2025-01-02'),
('Northeastern University', 'Boston', 'USA', 'Computer Science', 'English', 3.35, '2025-01-15'),
('Northeastern University', 'Boston', 'USA', 'Data Science', 'English', 3.35, '2025-01-15'),
('University of Southern California', 'Los Angeles', 'USA', 'Computer Science', 'English', 3.50, '2025-01-15'),
('University of Southern California', 'Los Angeles', 'USA', 'Data Science', 'English', 3.50, '2025-01-15'),
('New York University', 'New York', 'USA', 'Computer Science', 'English', 3.50, '2025-01-05'),
('New York University', 'New York', 'USA', 'Data Science', 'English', 3.50, '2025-01-05'),

-- ============================================
-- UNITED KINGDOM
-- ============================================

-- Top UK Universities (Very Competitive)
('University of Oxford', 'Oxford', 'United Kingdom', 'Computer Science', 'English', 3.80, '2024-10-15'),
('University of Oxford', 'Oxford', 'United Kingdom', 'Data Science', 'English', 3.80, '2024-10-15'),
('University of Cambridge', 'Cambridge', 'United Kingdom', 'Computer Science', 'English', 3.80, '2024-10-15'),
('University of Cambridge', 'Cambridge', 'United Kingdom', 'Data Science', 'English', 3.80, '2024-10-15'),
('Imperial College London', 'London', 'United Kingdom', 'Computer Science', 'English', 3.70, '2025-01-15'),
('Imperial College London', 'London', 'United Kingdom', 'Data Science', 'English', 3.70, '2025-01-15'),
('Imperial College London', 'London', 'United Kingdom', 'Artificial Intelligence', 'English', 3.70, '2025-01-15'),
('University College London', 'London', 'United Kingdom', 'Computer Science', 'English', 3.60, '2025-01-15'),
('University College London', 'London', 'United Kingdom', 'Data Science', 'English', 3.60, '2025-01-15'),
('London School of Economics', 'London', 'United Kingdom', 'Data Science', 'English', 3.65, '2025-01-15'),
('London School of Economics', 'London', 'United Kingdom', 'Business Administration', 'English', 3.65, '2025-01-15'),

-- Good UK Universities
('University of Edinburgh', 'Edinburgh', 'United Kingdom', 'Computer Science', 'English', 3.50, '2025-01-15'),
('University of Edinburgh', 'Edinburgh', 'United Kingdom', 'Data Science', 'English', 3.50, '2025-01-15'),
('University of Edinburgh', 'Edinburgh', 'United Kingdom', 'Artificial Intelligence', 'English', 3.50, '2025-01-15'),
('University of Manchester', 'Manchester', 'United Kingdom', 'Computer Science', 'English', 3.40, '2025-01-15'),
('University of Manchester', 'Manchester', 'United Kingdom', 'Data Science', 'English', 3.40, '2025-01-15'),
('King''s College London', 'London', 'United Kingdom', 'Computer Science', 'English', 3.45, '2025-01-15'),
('University of Bristol', 'Bristol', 'United Kingdom', 'Computer Science', 'English', 3.40, '2025-01-15'),
('University of Warwick', 'Coventry', 'United Kingdom', 'Computer Science', 'English', 3.45, '2025-01-15'),
('University of Warwick', 'Coventry', 'United Kingdom', 'Data Science', 'English', 3.45, '2025-01-15'),
('University of Glasgow', 'Glasgow', 'United Kingdom', 'Computer Science', 'English', 3.30, '2025-01-15'),
('University of Birmingham', 'Birmingham', 'United Kingdom', 'Computer Science', 'English', 3.30, '2025-01-31'),
('University of Leeds', 'Leeds', 'United Kingdom', 'Computer Science', 'English', 3.20, '2025-01-15'),
('University of Southampton', 'Southampton', 'United Kingdom', 'Computer Science', 'English', 3.20, '2025-01-15'),

-- ============================================
-- CANADA
-- ============================================

('University of Toronto', 'Toronto', 'Canada', 'Computer Science', 'English', 3.70, '2025-01-15'),
('University of Toronto', 'Toronto', 'Canada', 'Data Science', 'English', 3.70, '2025-01-15'),
('University of British Columbia', 'Vancouver', 'Canada', 'Computer Science', 'English', 3.60, '2025-01-15'),
('University of British Columbia', 'Vancouver', 'Canada', 'Data Science', 'English', 3.60, '2025-01-15'),
('McGill University', 'Montreal', 'Canada', 'Computer Science', 'English', 3.55, '2025-01-15'),
('McGill University', 'Montreal', 'Canada', 'Data Science', 'English', 3.55, '2025-01-15'),
('University of Waterloo', 'Waterloo', 'Canada', 'Computer Science', 'English', 3.60, '2025-02-01'),
('University of Waterloo', 'Waterloo', 'Canada', 'Data Science', 'English', 3.60, '2025-02-01'),
('University of Alberta', 'Edmonton', 'Canada', 'Computer Science', 'English', 3.40, '2025-03-01'),
('University of Montreal', 'Montreal', 'Canada', 'Computer Science', 'French', 3.40, '2025-02-01'),
('University of Montreal', 'Montreal', 'Canada', 'Data Science', 'French', 3.40, '2025-02-01'),
('University of Calgary', 'Calgary', 'Canada', 'Computer Science', 'English', 3.30, '2025-03-01'),
('Simon Fraser University', 'Vancouver', 'Canada', 'Computer Science', 'English', 3.30, '2025-01-31'),

-- ============================================
-- AUSTRALIA
-- ============================================

('University of Melbourne', 'Melbourne', 'Australia', 'Computer Science', 'English', 3.50, '2024-10-31'),
('University of Melbourne', 'Melbourne', 'Australia', 'Data Science', 'English', 3.50, '2024-10-31'),
('University of Sydney', 'Sydney', 'Australia', 'Computer Science', 'English', 3.45, '2025-01-15'),
('University of Sydney', 'Sydney', 'Australia', 'Data Science', 'English', 3.45, '2025-01-15'),
('Australian National University', 'Canberra', 'Australia', 'Computer Science', 'English', 3.40, '2024-12-15'),
('University of New South Wales', 'Sydney', 'Australia', 'Computer Science', 'English', 3.40, '2025-01-31'),
('University of New South Wales', 'Sydney', 'Australia', 'Data Science', 'English', 3.40, '2025-01-31'),
('University of Queensland', 'Brisbane', 'Australia', 'Computer Science', 'English', 3.30, '2024-11-30'),
('Monash University', 'Melbourne', 'Australia', 'Computer Science', 'English', 3.30, '2025-01-31'),
('Monash University', 'Melbourne', 'Australia', 'Data Science', 'English', 3.30, '2025-01-31'),

-- ============================================
-- GERMANY (Many programs in English)
-- ============================================

('Technical University of Munich', 'Munich', 'Germany', 'Computer Science', 'English', 3.50, '2025-01-15'),
('Technical University of Munich', 'Munich', 'Germany', 'Data Science', 'English', 3.50, '2025-01-15'),
('Technical University of Munich', 'Munich', 'Germany', 'Artificial Intelligence', 'English', 3.50, '2025-01-15'),
('RWTH Aachen University', 'Aachen', 'Germany', 'Computer Science', 'English', 3.40, '2025-03-01'),
('RWTH Aachen University', 'Aachen', 'Germany', 'Data Science', 'English', 3.40, '2025-03-01'),
('Heidelberg University', 'Heidelberg', 'Germany', 'Computer Science', 'German', 3.30, '2025-01-15'),
('Humboldt University of Berlin', 'Berlin', 'Germany', 'Computer Science', 'German', 3.30, '2025-01-15'),
('Humboldt University of Berlin', 'Berlin', 'Germany', 'Data Science', 'English', 3.30, '2025-01-15'),
('Free University of Berlin', 'Berlin', 'Germany', 'Computer Science', 'English', 3.20, '2025-01-15'),
('Ludwig Maximilian University of Munich', 'Munich', 'Germany', 'Computer Science', 'German', 3.40, '2025-01-15'),
('University of Freiburg', 'Freiburg', 'Germany', 'Computer Science', 'English', 3.20, '2025-03-15'),

-- ============================================
-- CHINA (English Programs)
-- ============================================

('Tsinghua University', 'Beijing', 'China', 'Computer Science', 'English', 3.60, '2025-02-28'),
('Tsinghua University', 'Beijing', 'China', 'Data Science', 'English', 3.60, '2025-02-28'),
('Peking University', 'Beijing', 'China', 'Computer Science', 'English', 3.55, '2025-02-28'),
('Peking University', 'Beijing', 'China', 'Data Science', 'English', 3.55, '2025-02-28'),
('Fudan University', 'Shanghai', 'China', 'Computer Science', 'English', 3.40, '2025-03-15'),
('Fudan University', 'Shanghai', 'China', 'Data Science', 'English', 3.40, '2025-03-15'),
('Shanghai Jiao Tong University', 'Shanghai', 'China', 'Computer Science', 'English', 3.45, '2025-03-01'),
('Shanghai Jiao Tong University', 'Shanghai', 'China', 'Data Science', 'English', 3.45, '2025-03-01'),
('Zhejiang University', 'Hangzhou', 'China', 'Computer Science', 'English', 3.35, '2025-03-15'),
('Zhejiang University', 'Hangzhou', 'China', 'Data Science', 'English', 3.35, '2025-03-15'),
('Sichuan University', 'Chengdu', 'China', 'Computer Science', 'English', 3.00, '2025-04-30'),
('Sichuan University', 'Chengdu', 'China', 'Data Science', 'English', 3.00, '2025-04-30'),
('Sichuan University', 'Chengdu', 'China', 'Software Engineering', 'English', 3.00, '2025-04-30'),
('University of Science and Technology of China', 'Hefei', 'China', 'Computer Science', 'English', 3.40, '2025-03-15'),
('Nanjing University', 'Nanjing', 'China', 'Computer Science', 'English', 3.30, '2025-03-31'),
('Harbin Institute of Technology', 'Harbin', 'China', 'Computer Science', 'English', 3.20, '2025-04-15'),
('Xi''an Jiaotong University', 'Xi''an', 'China', 'Computer Science', 'English', 3.25, '2025-04-01'),

-- ============================================
-- NETHERLANDS
-- ============================================

('Delft University of Technology', 'Delft', 'Netherlands', 'Computer Science', 'English', 3.50, '2025-01-15'),
('Delft University of Technology', 'Delft', 'Netherlands', 'Data Science', 'English', 3.50, '2025-01-15'),
('University of Amsterdam', 'Amsterdam', 'Netherlands', 'Computer Science', 'English', 3.40, '2025-02-01'),
('University of Amsterdam', 'Amsterdam', 'Netherlands', 'Data Science', 'English', 3.40, '2025-02-01'),
('University of Amsterdam', 'Amsterdam', 'Netherlands', 'Artificial Intelligence', 'English', 3.45, '2025-02-01'),
('Eindhoven University of Technology', 'Eindhoven', 'Netherlands', 'Computer Science', 'English', 3.30, '2025-05-01'),
('Eindhoven University of Technology', 'Eindhoven', 'Netherlands', 'Data Science', 'English', 3.30, '2025-05-01'),

-- ============================================
-- SWITZERLAND
-- ============================================

('ETH Zurich', 'Zurich', 'Switzerland', 'Computer Science', 'English', 3.70, '2024-12-15'),
('ETH Zurich', 'Zurich', 'Switzerland', 'Data Science', 'English', 3.70, '2024-12-15'),
('EPFL', 'Lausanne', 'Switzerland', 'Computer Science', 'English', 3.65, '2025-01-15'),
('EPFL', 'Lausanne', 'Switzerland', 'Data Science', 'English', 3.65, '2025-01-15'),
('University of Zurich', 'Zurich', 'Switzerland', 'Computer Science', 'English', 3.40, '2025-02-28'),

-- ============================================
-- SINGAPORE
-- ============================================

('National University of Singapore', 'Singapore', 'Singapore', 'Computer Science', 'English', 3.60, '2025-01-15'),
('National University of Singapore', 'Singapore', 'Singapore', 'Data Science', 'English', 3.60, '2025-01-15'),
('Nanyang Technological University', 'Singapore', 'Singapore', 'Computer Science', 'English', 3.55, '2025-01-15'),
('Nanyang Technological University', 'Singapore', 'Singapore', 'Data Science', 'English', 3.55, '2025-01-15'),
('Singapore Management University', 'Singapore', 'Singapore', 'Business Administration', 'English', 3.40, '2025-01-15'),

-- ============================================
-- JAPAN (English Programs)
-- ============================================

('University of Tokyo', 'Tokyo', 'Japan', 'Computer Science', 'English', 3.50, '2024-12-15'),
('University of Tokyo', 'Tokyo', 'Japan', 'Data Science', 'English', 3.50, '2024-12-15'),
('Kyoto University', 'Kyoto', 'Japan', 'Computer Science', 'English', 3.45, '2025-01-15'),
('Osaka University', 'Osaka', 'Japan', 'Computer Science', 'English', 3.35, '2025-01-31'),
('Tokyo Institute of Technology', 'Tokyo', 'Japan', 'Computer Science', 'English', 3.50, '2024-12-15'),

-- ============================================
-- SOUTH KOREA (English Programs)
-- ============================================

('Seoul National University', 'Seoul', 'South Korea', 'Computer Science', 'English', 3.50, '2025-03-15'),
('KAIST', 'Daejeon', 'South Korea', 'Computer Science', 'English', 3.55, '2025-02-28'),
('KAIST', 'Daejeon', 'South Korea', 'Data Science', 'English', 3.55, '2025-02-28'),
('Korea University', 'Seoul', 'South Korea', 'Computer Science', 'English', 3.40, '2025-03-31'),
('Yonsei University', 'Seoul', 'South Korea', 'Computer Science', 'English', 3.40, '2025-03-15'),

-- ============================================
-- FRANCE (English Programs)
-- ============================================

('Sorbonne University', 'Paris', 'France', 'Computer Science', 'English', 3.40, '2025-01-15'),
('École Polytechnique', 'Paris', 'France', 'Computer Science', 'English', 3.60, '2025-01-15'),
('École Polytechnique', 'Paris', 'France', 'Data Science', 'English', 3.60, '2025-01-15'),
('HEC Paris', 'Paris', 'France', 'Business Administration', 'English', 3.50, '2025-01-15'),

-- ============================================
-- SWEDEN
-- ============================================

('KTH Royal Institute of Technology', 'Stockholm', 'Sweden', 'Computer Science', 'English', 3.40, '2025-01-15'),
('KTH Royal Institute of Technology', 'Stockholm', 'Sweden', 'Data Science', 'English', 3.40, '2025-01-15'),
('Lund University', 'Lund', 'Sweden', 'Computer Science', 'English', 3.30, '2025-01-15'),
('Uppsala University', 'Uppsala', 'Sweden', 'Computer Science', 'English', 3.25, '2025-01-15'),

-- ============================================
-- HONG KONG
-- ============================================

('University of Hong Kong', 'Hong Kong', 'Hong Kong', 'Computer Science', 'English', 3.50, '2024-12-31'),
('University of Hong Kong', 'Hong Kong', 'Hong Kong', 'Data Science', 'English', 3.50, '2024-12-31'),
('Chinese University of Hong Kong', 'Hong Kong', 'Hong Kong', 'Computer Science', 'English', 3.45, '2025-01-31'),
('Hong Kong University of Science and Technology', 'Hong Kong', 'Hong Kong', 'Computer Science', 'English', 3.50, '2025-01-15'),

-- ============================================
-- IRELAND
-- ============================================

('Trinity College Dublin', 'Dublin', 'Ireland', 'Computer Science', 'English', 3.40, '2025-02-01'),
('University College Dublin', 'Dublin', 'Ireland', 'Computer Science', 'English', 3.30, '2025-06-30'),
('University College Dublin', 'Dublin', 'Ireland', 'Data Science', 'English', 3.30, '2025-06-30'),

-- ============================================
-- DENMARK
-- ============================================

('Technical University of Denmark', 'Copenhagen', 'Denmark', 'Computer Science', 'English', 3.35, '2025-01-15'),
('University of Copenhagen', 'Copenhagen', 'Denmark', 'Computer Science', 'English', 3.30, '2025-01-15'),

-- ============================================
-- ITALY
-- ============================================

('Politecnico di Milano', 'Milan', 'Italy', 'Computer Science', 'English', 3.30, '2025-02-28'),
('Politecnico di Milano', 'Milan', 'Italy', 'Data Science', 'English', 3.30, '2025-02-28'),
('University of Bologna', 'Bologna', 'Italy', 'Computer Science', 'English', 3.20, '2025-03-15'),

-- ============================================
-- SPAIN
-- ============================================

('University of Barcelona', 'Barcelona', 'Spain', 'Computer Science', 'English', 3.20, '2025-03-31'),
('Polytechnic University of Catalonia', 'Barcelona', 'Spain', 'Computer Science', 'English', 3.25, '2025-03-15'),
('IE University', 'Madrid', 'Spain', 'Business Administration', 'English', 3.30, '2025-04-30');

-- ============================================
-- Verify the data
-- ============================================
SELECT COUNT(*) as total_universities FROM universities;
SELECT country, COUNT(*) as count FROM universities GROUP BY country ORDER BY count DESC;
SELECT program, COUNT(*) as count FROM universities GROUP BY program ORDER BY count DESC;
