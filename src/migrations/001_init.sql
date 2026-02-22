-- enable uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- vector already enabled earlier
CREATE EXTENSION IF NOT EXISTS vector;

-- =========================
-- PROJECTS
-- =========================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    repo_url TEXT,
    main_branch TEXT DEFAULT 'main',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- =========================
-- DOCUMENTS
-- =========================
CREATE TYPE document_type AS ENUM (
    'PRD',
    'ARCHITECTURE',
    'API_SPEC',
    'CODING_STANDARD',
    'DECISION',
    'FEATURE_SPEC'
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type document_type,
    content TEXT NOT NULL,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- =========================
-- FEATURES
-- =========================
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planned',
    priority INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- =========================
-- CODE FILES (AI UNDERSTANDING)
-- =========================
CREATE TABLE IF NOT EXISTS code_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    language TEXT,
    summary TEXT,
    responsibilities TEXT,
    exports TEXT,
    dependencies TEXT,
    last_scanned TIMESTAMP DEFAULT now()
);

-- =========================
-- DATABASE STRUCTURE KNOWLEDGE
-- =========================
CREATE TABLE IF NOT EXISTS db_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS db_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES db_tables(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    data_type TEXT,
    is_nullable BOOLEAN,
    description TEXT
);

-- =========================
-- ARCHITECTURE DECISIONS
-- =========================
CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT,
    rationale TEXT,
    consequences TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- =========================
-- EMBEDDINGS MEMORY
-- =========================
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    source_type TEXT,
    source_id UUID,
    content TEXT,
    embedding vector(1536),
    created_at TIMESTAMP DEFAULT now()
);

-- vector similarity index
CREATE INDEX IF NOT EXISTS embeddings_vector_idx
ON embeddings
USING ivfflat (embedding vector_cosine_ops);    