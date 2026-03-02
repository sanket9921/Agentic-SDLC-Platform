Agentic SDLC Platform (PoC)

An experimental local-first AI system that understands a software project, maintains long-term memory of its architecture, and assists developers with planning, impact analysis, and implementation guidance.

This project explores a simple idea:

Instead of asking an AI to write code, give the AI an understanding of the entire project.

Most AI coding tools generate code per prompt but forget earlier decisions.
This system continuously learns the repository and reasons about features using project context.

What This Project Does

The platform scans a repository and builds a persistent knowledge base about the project:

Understands responsibility of each file

Tracks dependencies between modules

Maintains architecture context

Answers engineering questions

Predicts impact of changes

Generates implementation guidance

The goal is continuity across the software development lifecycle, not just code generation.

Example Use Cases

You can ask questions like:

Where should authentication logic be implemented?

Which files will be affected if I modify the user model?

How should I implement email verification?

What database changes are required for a new feature?

The system analyzes the existing project instead of guessing.

Architecture (PoC)
Developer (VS Code)
        ↓
Local Agent Server (Node.js / TypeScript)
        ↓
Project Memory Database (PostgreSQL + pgvector)
        ↓
LLM Reasoning (feature planning, analysis, guidance)

The agent server continuously learns the repository and stores structured knowledge about it.

Core Capabilities
1. Repository Understanding

Scans all source files

Generates summaries of responsibilities

Detects dependencies

Stores project knowledge

2. Knowledge Query

Ask architecture-level questions about the project.

3. Change Impact Analysis

Predicts affected modules, database updates, and risks before implementation.

4. Feature Planning

Given a feature request, the system produces step-by-step implementation guidance.

5. Implementation Guidance

Generates structured prompts that can be used directly in coding tools (Cursor, Copilot, etc).

Tech Stack

Node.js

TypeScript

PostgreSQL

pgvector (semantic memory)

LLM APIs

How It Works

Repository is indexed

Each file is summarized

Embeddings are generated

Context is retrieved during queries

AI reasons using project memory

Unlike chat-based AI, this system reasons using stored project knowledge.

Setup
1. Clone
git clone <your-repo-url>
cd agentic-sdlc-platform
2. Install dependencies
npm install
3. Setup PostgreSQL

Install PostgreSQL and enable pgvector extension:

CREATE EXTENSION vector;

Configure .env:

OPENAI_API_KEY=your_key
DATABASE_URL=postgres://user:password@localhost:5432/agentic
4. Run database migrations
npm run migrate
5. Start server
npm run dev

Server runs on:

http://localhost:4000
API Examples
Initialize project
POST /api/project
Ask a project question
POST /api/analyze
Feature impact analysis
POST /api/impact
Generate implementation guidance
POST /api/prompt
Current Status

This repository is a proof of concept.

Implemented:

repository indexing

project memory

knowledge retrieval

impact analysis

feature planning

Planned:

architecture memory

decision tracking

automated documentation

VS Code extension

multi-agent SDLC workflow

Why This Project Exists

AI code generation works well for isolated tasks but struggles with long-term projects because it lacks memory.

This project experiments with giving AI a persistent understanding of a codebase so it can behave more like a software architect than a code generator.
