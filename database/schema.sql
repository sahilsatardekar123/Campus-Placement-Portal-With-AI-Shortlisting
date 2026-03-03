-- Database schema for Campus Placement Portal

-- Enable UUID extension if preferred, but using SERIAL for simplicity and broad compatibility.

-- 1. Users Table (Shared for authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'recruiter')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 2. Students Table
CREATE TABLE students (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    graduation_year INTEGER NOT NULL,
    cgpa NUMERIC(4,2) NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
    skills TEXT NOT NULL, -- Stored as comma-separated string for simplicity
    experience INTEGER DEFAULT 0, -- Experience in months
    projects TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Recruiters Table
CREATE TABLE recruiters (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Jobs Table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    recruiter_id INTEGER NOT NULL REFERENCES recruiters(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    skills_required TEXT NOT NULL,
    min_cgpa NUMERIC(4,2) DEFAULT 0 CHECK (min_cgpa >= 0 AND min_cgpa <= 10),
    exp_required INTEGER DEFAULT 0, -- Min experience in months
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_recruiter_id ON jobs(recruiter_id);

-- 5. Applications Table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, job_id) -- Prevent duplicate applications
);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);

-- 6. Rankings Table (Stores precomputed AI matching scores)
CREATE TABLE rankings (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    match_score NUMERIC(5,4) NOT NULL, -- Range 0.0000 to 1.0000
    matched_skills TEXT, -- Comma-separated or JSON
    missing_skills TEXT, -- Comma-separated or JSON
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, job_id) -- One ranking per application
);

CREATE INDEX idx_rankings_job_id_score ON rankings(job_id, match_score DESC);
