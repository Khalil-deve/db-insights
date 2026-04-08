<div align="center">
  <h1>DB Insights</h1>
  <p><strong>Transform plain English into actionable database queries instantly.</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#cli">CLI Options</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

## 📖 Overview

**DB Insights** bridges the gap between natural language and database execution. Powered by a local LLM runtime (e.g., Ollama, Qwen), it provides a robust, zero-telemetry infrastructure to query, visualize, and analyze your datasets via plain English prompts.

With 100% execution taking place on your infrastructure, it ensures airtight data privacy and zero vendor lock-in.

## ✨ Core Features

- 🧠 **AI-Native SQL Generation**: Employs context-aware prompt parsing to generate precise `SELECT` statements from natural language.
- 🗄️ **Multi-Engine Support**: Seamlessly connects to **MySQL**, **PostgreSQL**, and **MongoDB** (Coming soon).
- 🛡️ **Zero-Trust Execution Engine**: Strict pattern-matching blocks destructive operations (`DROP`, `DELETE`, `UPDATE`, `ALTER`). Enforces connection timeouts, max row limits, and payload validation.
- 📊 **Dynamic Data Visualization**: Render results on-the-fly using Tables, JSON data trees, or Recharts (Bar/Line/Pie).
- 🧩 **Local-First AI Integration**: Designed for [Ollama](https://ollama.com/), securing sensitive schemas entirely within your perimeter.
- ⌨️ **Dedicated CLI Client**: Ships with a fully-featured Node CLI module for terminal-native execution and automated pipeline scripting.

## 🏗️ Architecture Stack

DB Insights operates on a decoupled architecture, orchestrating AI generation and DB execution through Next.js server endpoints to ensure client isolation.

```text
                        ┌───────────────────────────────┐
                        │      DB Insights Client       │
                        │    (Web UI / CLI Module)      │
                        └───────┬─────────────▲─────────┘
                                │             │
 [Natural Language Query & DB Config]     [Structured Data & AI Synopsis]
                                │             │
                        ┌───────▼─────────────┴─────────┐
                        │       Next.js API Layer       │
                        │                               │
                        │  1. /api/schema (Fetch)       │
                        │  2. /api/generate (LLM)       │
                        │  3. /api/validate (AST/Regex) │
                        │  4. /api/execute (Driver)     │
                        │  5. /api/insights (Analysis)  │
                        └───────┬─────────────┬─────────┘
                                │             │
                       ┌────────▼────┐   ┌────▼────────┐
                       │ Local LLM   │   │  DB Engine  │
                       │ (Ollama)    │   │ (PG/MySQL/Mongo)│
                       └─────────────┘   └─────────────┘
```

## 🚀 Quick Start

### 1. Requirements

* Node.js 18.x or later
* pnpm, npm, or yarn
* [Ollama](https://ollama.ai/) running locally (Optional, falls back to manual query input)

### 2. Up & Running

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/db-insights.git
cd db-insights

# Install package dependencies
pnpm install

# Start the development server
pnpm run dev
```

Navigate to `http://localhost:3500` (or the port defined by `next dev`) to access the web client.

### 3. LLM Configuration (Ollama)

Ensure the local Ollama daemon is running and pull your preferred coding model. We recommend `qwen2.5-coder:7b` for optimal query synthesis.

```bash
ollama serve
ollama pull qwen2.5-coder:7b
```

## 💻 CLI Client

The repository includes a dedicated CLI application for terminal-based workflows.

**Installation:**

```bash
cd cli
npm install -g .
```

**Usage Examples:**

```bash
dbi connect                                     # Configure DB credentials interactively
dbi ask "Who are the top 5 customers?"          # Execute NLQ & print ASCII tables
dbi ask "Show revenue" --output report.csv      # Export results to CSV
```

For more detailed CLI mechanics, refer to the [CLI Documentation](./cli/README.md).

## 🔏 Security & Safety Model

Security is critical when granting AI systems database access. DB Insights implements defense-in-depth:

1. **Regex/Keyword Filters:** Rejects DDL and DML operations.
2. **Transaction Timeouts:** Prevents run-away queries via database-specific connection settings (e.g., `statement_timeout` for Postgres, `MAX_EXECUTION_TIME` for MySQL).
3. **Hard Caps:** `MAX_ROWS` limit enforced server-side.
4. **Local Data Plane:** The application state, schemas, and LLM inferences remain entirely local.

## 📄 License & Maintainers

Distributed under the MIT License. See `LICENSE` for more information.
