# 🧠 Agentic SDLC Platform (PoC)

A local-first AI system that understands a software project, maintains
long-term architectural memory, and assists developers with planning,
impact analysis, and implementation guidance.

> Instead of asking AI to write code, this project gives AI an
> understanding of the entire codebase.

Most AI coding tools generate code per prompt but forget earlier
decisions. This platform continuously learns the repository and reasons
about new features using real project context.

------------------------------------------------------------------------

## 🚩 Problem

Modern AI tools (ChatGPT, Copilot, Cursor) are powerful but stateless.

After a few features: - forget previous architecture decisions - suggest
changes in wrong modules - duplicate logic - slowly break structure

The real issue is **not code generation --- it's lack of memory**.

------------------------------------------------------------------------

## 💡 Solution

This system scans a repository and builds a persistent knowledge base
about the project:

-   Understands responsibility of each file
-   Tracks module dependencies
-   Maintains architecture context
-   Answers engineering questions
-   Predicts change impact
-   Generates structured implementation guidance

The goal is continuity across the software development lifecycle, not
just code generation.

------------------------------------------------------------------------

## 🔧 Example Questions It Can Answer

-   Where should authentication logic be implemented?
-   Which files will be affected if I modify the user model?
-   What database changes are required for a new feature?
-   How should I implement email verification?

The AI answers using project knowledge instead of guessing.

------------------------------------------------------------------------

## 🏗️ Architecture (PoC)

Developer (VS Code)\
↓\
Local Agent Server (Node.js / TypeScript)\
↓\
Project Memory Database (PostgreSQL + pgvector)\
↓\
LLM Reasoning (analysis, planning, guidance)

The server continuously learns the repository and stores structured
knowledge about it.

------------------------------------------------------------------------

## ✨ Core Capabilities

### 1. Repository Understanding

-   Scans source files
-   Generates summaries
-   Detects dependencies
-   Stores project knowledge

### 2. Knowledge Query

Ask architecture-level questions about the project.

### 3. Change Impact Analysis

Predict affected modules, database updates, and risks before
implementation.

### 4. Feature Planning

Generate step-by-step implementation plan for new features.

### 5. Implementation Guidance

Produces structured prompts usable in coding tools like Cursor or
Copilot.

------------------------------------------------------------------------

## 🧰 Tech Stack

-   Node.js
-   TypeScript
-   PostgreSQL
-   pgvector (vector memory)
-   LLM APIs

------------------------------------------------------------------------

## ⚙️ Setup

### 1. Clone repository

``` bash
git clone <your-repo-url>
cd agentic-sdlc-platform
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Setup PostgreSQL

Enable pgvector extension:

``` sql
CREATE EXTENSION vector;
```

Create `.env` file:

    OPENAI_API_KEY=your_api_key
    DATABASE_URL=postgres://user:password@localhost:5432/agentic

### 4. Run migrations

``` bash
npm run migrate
```

### 5. Start server

``` bash
npm run dev
```

Server runs at:

    http://localhost:4000

------------------------------------------------------------------------

## 📡 API Examples

### Analyze project question

`POST /api/analyze`

### Change impact

`POST /api/impact`

### Generate implementation guidance

`POST /api/prompt`

------------------------------------------------------------------------

## 📊 Current Status

**Implemented** - repository indexing - project memory - knowledge
retrieval - impact analysis - feature planning

**Planned** - architecture memory - decision tracking - automated
documentation - VS Code extension - multi-agent SDLC workflow

------------------------------------------------------------------------

## 🎯 Goal

AI code generation works well for isolated tasks but struggles with
long-term projects because it lacks continuity.

This project explores giving AI persistent understanding of a codebase
so it can behave more like a **software architect** rather than a code
generator.

------------------------------------------------------------------------

## 📄 License

MIT
