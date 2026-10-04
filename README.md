
# AI Automation Platform

A local-first AI automation platform built with Node.js and TypeScript.

The initial goal is to extract structured information from job descriptions using local LLMs, while keeping the application independent from any specific model or provider.

## Current Scope

The first use case is:

```text
Job Description
      ↓
LLM
      ↓
Validated Structured JSON
```

The platform should only extract information explicitly present in the input.

**Rule:** Extract, don't infer.

If a value is missing, the model should return `null` or an empty array instead of guessing.

## Tech Stack

- Node.js
- TypeScript
- Zod
- Ollama
- Local LLMs

## Architecture

```text
Job Description
      ↓
JobDescriptionExtractor
      ↓
LLMProvider
      ↓
Ollama
      ↓
Local Model
      ↓
Zod Validation
      ↓
Structured Output
```

The application is designed to stay independent from the underlying LLM provider.

In the future, other providers can be added without changing the business logic:

```text
LLMProvider
├── OllamaProvider
├── AnthropicProvider
├── OpenAIProvider
├── VllmProvider
└── LlamaCppProvider
```

## Project Structure

```text
src/
├── domain/
│   └── job/
│       ├── job-description.schema.ts
│       └── job-description-extractor.ts
│
├── application/
│   └── extract-job-description.ts
│
├── infrastructure/
│   └── llm/
│       ├── llm-provider.ts
│       └── ollama.provider.ts
│
└── index.ts
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Goals

- Run LLMs locally
- Support Persian and English job descriptions
- Generate structured JSON output
- Prevent hallucination and inferred values
- Validate model output using schemas
- Keep business logic independent from LLM providers
- Benchmark different models
- Support cloud models in the future

## Future Plans

- Job description extraction
- Resume/CV extraction
- Job matching
- Recruiter information extraction
- Multiple LLM providers
- Model routing
- REST API
- Authentication
- Rate limiting
- Usage tracking
- Batch processing
- Webhooks
- SDKs

## Status

Early prototype / local development.