# Product Requirements Document (PRD)

# Modular Generation Framework

**Version:** 2.1 — MVP**Status:** Draft**Last Updated:** 2026-05-2

* * *

## 1. Executive Summary

MGF is a web-based SaaS platform that solves a fundamental problem with AI-generated visual content: AI models hallucinate layouts, miss components, and produce outputs that are hard to edit or reuse. MGF introduces a **modular generation framework** where content, layouts with simple components , and theme are separated into distinct, independently callable files — making AI generation reliable, predictable, and composable.

Beyond generation, MGF is a **community-driven template ecosystem** where users share, fork aka clone, and remix templates as projects — just as developers fork repositories on GitHub. The result is a fusion of three paradigms:

> 🐙 **GitHub** — fork/version/share templates as projects🎨 **Canva** — in ohter way css attribute customization form side panel editing and beautiful visual exports🤖 **AI-native** — modular generation via any LLM (cloud or local)

In addition to the whole website, the website will aslo contain pormpt, skill, agnet, mcp, design md ... database for community shareing ...

* * *

## 2. Problem Statement

### Current Pain Points

| Pain Point | Description |
| --- | --- |
| **AI misses elements** | When prompting an AI to generate a full presentation or poster, it frequently skips components, ignores layout rules, or produces inconsistent style |
| **Outputs are monolithic** | Generated files (HTML, PPTX, PDF) are hard to partially edit — you must regenerate the whole thing or hack raw code |
| **No separation of concerns** | Content, layout, and component structure are tangled together — changing one breaks the others |
| **No reusability** | Every AI generation starts from scratch; there is no way to share, fork, or build on others' templates in a structured way |
| **Locked to one AI** | Most tools are tied to a single provider; switching models means losing your workflow |
| **Editing generated files is painful** | Editing raw HTML, PPTX, or PDF requires technical knowledge most users don't have |

### Root Cause

The core issue is that existing tools treat visual content generation as a **single-shot black box** — one prompt in, one monolithic file out. This model fails at scale and is resistant to iteration.

* * *

## 3. Vision & Goals

### Vision

Become the standard platform for structured, modular AI-generated visual content — where any user (student, teacher, creator, business) can produce professional outputs through a template-first, AI-assisted, community-powered workflow.

### MVP Goals

1. Establish the **modular file model** (content + layout + component separation + theme)
2. Enable **AI generation** via external APIs and local models (LM Studio etc.)
3. Build the **css attribute customization form side panel** for web-based editing of generated outputs
4. Launch the **template community** — share, fork aka clone, and remix templates
5. Support **multiple export formats** (HTML, PDF, PNG, etc.)

### Success Metrics (MVP)

* Users can generate a complete visual output in under 3 minutes
* Template fork-to-edit flow takes under 60 seconds
* support diefferent type of project such (website, carsouel, single post, presentation, inforgraphics)
* Platform works with at least 3 different LLM providers (OpenAI, Anthropic, local via LM Studio)
* Community has a starter library of 20+ templates at launch

* * *

## 4. Target Users & Personas

### Persona 1 — The Student

**Name:** Alex, 22, university student**Goal:** Create a professional presentation or poster for a project without design skills**Pain:** Canva takes too long; AI generates something ugly or incomplete**How MGF helps:** Fork a university-style template, fill in content via AI or manually, export PDF in minutes

### Persona 2 — The Educator

**Name:** Dr. Sarah, university lecturer**Goal:** Create structured lecture slides with consistent branding and reusable sections**Pain:** Building slides from scratch is time-consuming; AI outputs don't match her style**How MGF helps:** Build her own template once, reuse it every semester, allow students to fork it

### Persona 3 — The Content Creator

**Name:** Marcus, social media creator**Goal:** Produce carousels, infographics, and branded posts at scale**Pain:** Design tools are slow; AI tools produce inconsistent brand output**How MGF helps:** Build a brand template set, generate carousel content via AI, export to multiple formats per platform

### Persona 4 — The Business User

**Name:** Leila, startup founder**Goal:** Create pitch decks, one-pagers, and proposals without a designer**Pain:** Canva lacks AI depth; AI tools lack visual control**How MGF helps:** Fork a pitch deck template, generate content with company context, export polished PDF

### Persona 5 — The Developer / Power User

**Name:** Omar, developer**Goal:** Integrate MGF into local workflows, automate generation pipelines**Pain:** No API-first tools for visual generation**How MGF helps:** Trigger generation via local or external API, use custom models (LM Studio), automate batch output

* * *

## 5. Core Concepts

### 5.1 The Modular File Model (not finished coudl be modified and updated)

Every project/template in MGF is composed of distinct, independently-editable file layers:

    project/
    ├── content.json        # The actual text/data content (what to say)
    ├── sequance.json         # The structural layout rules (how to arrange) this si for per project and not for templates
    ├── slides(or) pages/         # Reusable UI building blocks (headers, cards, etc.)
    │   ├── hero.html
    │   ├── title1.html
    │   └── conclusion.html
    ├── style.css           # Visual styling (colors, fonts, spacing)
    ├── layout.css          # css realted to the layouting, padding, margningn, aligment
    ├── context.md          # AI generation instructions / prompt context
    ├── rules.md            # Generation constraints and rules
    └── meta.json           # Project metadata (name, tags, output type, etc.)

**Key principle:** AI can be called to regenerate **any single layer** without touching the others. Change the content without touching layout. Change the layout without touching components.

### 5.2 Output Types

MGF supports the following visual output types (MVP scope):

| Output Type | Description |
| --- | --- |
| Presentation | Multi-slide deck (like PowerPoint/Google Slides) |
| Social Carousel | Sequential swipeable cards (Instagram/LinkedIn format) |
| Poster | Single-page visual (A4, custom sizes) |
| Infographic | Data-driven visual storytelling |
| Document | Structured text-heavy document with visual polish |
| Website / Landing Page | Single-page web output (HTML+CSS) |

### 5.3 Template vs. Project

| Concept | Description |
| --- | --- |
| **Template** | A community-shared base that defines structure/style. Read-only by others. Can be forked. |
| **Project** | A user's personal fork of a template. Fully editable. Can be made public (maybe re-shared as template but within rules that we can define later). |

### 5.4 Generation Modes

| Mode | Description |
| --- | --- |
| **Full Generation** | AI generates all files from a prompt + context |
| **Partial Generation** | AI regenerates only one layer (e.g., re-generate content.md only) |
| **Manual Edit** | User edits any file manually via the css attribute customization form side panel editor or raw editor |
| **Upload & Inject** | User uploads existing content proejct matched the structre we have and AI adapts it to the template |

* * *

## 6. Feature Requirements

### 6.1 Authentication & User Management

| Feature | Priority | Description |
| --- | --- | --- |
| User registration & login | Must Have | Email/password + good to have ( to have  OAuth (Google) ) |
| User profile | Must Have | Display name, avatar, bio, public projects list |
| Role system | Must Have | User, Admin |
| Account settings | good to Have | Email, password |

### 6.2 Template & Project System

| Feature | Priority | Description |
| --- | --- | --- |
| Create project from scratch | Must Have | Start a new project with blank template |
| Fork aka clone a template | Must Have | One-click fork of any public template into user's workspace |
| Project settings | Must Have | Name, type, visibility (public/private), tags |
| Template publishing | Must Have | Make a project public as a sharable template |
| Template discovery | Must Have | Browse/search community templates by type, tags, popularity |
| Project versioning (basic) | Should Have | Track changes per save (not full Git, but snapshots) |
| Template starring/bookmarking | Should Have | Save favourite templates |
| Template forking counter | good to Have | Show how many times a template has been forked |

### 6.3 Modular File Editor

| Feature | Priority | Description |
| --- | --- | --- |
| css attribute customization form side panel live preview | Must Have | Real-time rendered preview of the output alongside file editor |
| Raw text/code editor | later to Have | Edit content.md, layout.json, style.css, context.md directly |
| slides library panel for the template just as powerpoint | Must Have | Visual panel of available slides akasections |
| AI generation button per layer | Must Have | "Regenerate this file with AI" per layer |
| Full project AI generation | Must Have | Generate all files at once from a top-level prompt |

### 6.4 AI Generation Engine

| Feature | Priority | Description |
| --- | --- | --- |
| External API integration | Must Have | Connect to OpenAI, Anthropic, Gemini via API key |
| Local model support | Must Have | Connect to LM Studio or any OpenAI-compatible local server |
| API key management | Must Have | User stores their own API keys securely |
| Generation history | Should Have | Log of AI generation calls per project |
| Custom context.md | Must Have | User-editable context/prompt file that guides AI generation |
| Model selector | Should Have | Choose which model to use per generation call |

### 6.5 Community & Social Features

| Feature | Priority | Description |
| --- | --- | --- |
| Public template gallery | Must Have | Browseable, searchable gallery of community templates |
| User profile pages | Must Have | Public page showing a user's published templates |
| Template tags & categories | Must Have | Categorise templates by type, domain, style |
| Fork & attribution | Must Have | Forked templates credit the original author |
| Template search | Must Have | Search by keyword, tag, output type |
| Template ratings | Could Have | Star/thumbs up on templates |
| Comments on templates | Could Have | Community feedback |
| Resources gallery | Should Have | Browseable, serachable, forkable resources for prompts, skills, agnets, skills ... |

### 6.6 Export System

| Feature | Priority | Description |
| --- | --- | --- |
| Export as HTML | Must Have | Standalone HTML+CSS file |
| Export as PDF | Must Have | Print-ready PDF |
| Export as PNG/JPG | Must Have | Image export per slide/page |
| Export as ZIP (full project) | Must Have | Download all project files |
| Export as Markdown | Must Have | Content-only markdown export |
| Export as PPTX | Should Have | Microsoft PowerPoint format |
| Custom export settings | Should Have | Resolution, page size, quality |

### 6.7 Community Database (Bracket Templates) - thisis a spserate Tab secondary supporter section not related to the proejct direclty, just a comunity for ai md file resoruces and customizable prompts

A structured community library of reusable, parameterized content blocks:

| Type | Description |
| --- | --- |
| Text blocks | Reusable text patterns with `{{variable}}` placeholders |
| Image prompts | Prompt templates for image generation |
| Agent files | AI agent definitions (.agent) |
| Skill files | Capability definitions for AI agents |
| Rules files | Generation constraint files |
| MCP configs | Model Context Protocol configurations |
| design md | detailed description for the design |

Users can browse, use, and contribute to this community database.

* * *

## 7. User Stories

### Core Flow

**As a content creator,**I want to browse community templates and fork a social media carousel templateSo that I can start with a proven structure and customise it to my brand.

**As a student,**I want to type my research topic and have AI generate a full presentation from a university templateSo that I have a professional starting point without spending hours on design.

**As a developer,**I want to call the MGF API from my local LM Studio instanceSo that I can automate content generation in my own pipeline.

**As a teacher,**I want to publish my lecture slide template to the communitySo that my students can fork it and use the same consistent format.

**As a business user,**I want to regenerate only the content layer of my pitch deck with updated financial dataSo that I don't have to redo the design.

**As any user,**I want to export my finished project as both PDF and HTMLSo that I can use it in multiple contexts (print + web).

* * *

## 8. Non-Functional Requirements

| Category | Requirement |
| --- | --- |
| **Performance** | Live preview renders in < 500ms on file save |
| **Scalability** | Architecture supports horizontal scaling; stateless API design |
| **AI Compatibility** | Any OpenAI-compatible API endpoint works (cloud or local) |
| **Security** | API keys encrypted at rest; never exposed in client-side code |
| **Accessibility** | WCAG 2.1 AA compliance for core UI |
| **Reliability** | 99.5% uptime SLA for MVP |
| **Portability** | Exported files are self-contained and work offline |
| **Extensibility** | Plugin/extension system for new output types and components |

* * *

## 9. Technical Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React + TypeScript + Tailwind CSS |
| **Backend** | Laravel (PHP) |
| **Database** | MySQL (primary) |
| **File Storage** | S3-compatible object storage (project files, assets) or maybe storing files as as row data string type since the files of each slide, theme context are less than 100KB |
| **AI Integration** | OpenAI-compatible REST API (works with OpenAI, Anthropic, Gemini, LM Studio) |
| **Export Engine** | Headless browser (Puppeteer/Playwright) for PDF/PNG; custom renderer for PPTX |
| **Auth** | Laravel Sanctum + later to have  ( OAuth2 (Google) ) |
| **Generation** | from the frontend aka client side as draft, after approving we append to database |

* * *

## 10. MVP Scope Definition

### In Scope (MVP)

* User auth (email + Google OAuth)
* Project/template CRUD
* Modular file editor (css attribute customization form side panel + raw)
* AI generation engine (external APIs + local)
* Community template gallery (browse, fork, search)
* Export: HTML, PDF, PNG, ZIP, Markdown
* Output types: Presentation, Poster, Social Carousel, Document
* Community bracket template library (basic)
* User profiles & template attribution
* resources CRUD (prompts, skills, mcps, agents ... )

* PPTX export (planned for v1.1)
* Website/Landing Page output type (planned for v1.1)

### Out of Scope (Post-MVP)

* Real-time collaboration (multi-user editing)
* Payment / subscription tiers
* Real-time notifications
* Native mobile app
* Advanced versioning / Git-like diff
* Template marketplace with monetisation
* Video/animation output types
* Fine-tuned model integration

* * *

## 11. Open Questions

| #   | Question |
| --- | --- |
| 1   | what is the final template - project structure |
| 2   | html vs markdown |
| 3   | storing files  in s3 or as row since each file is less than 100KB probably |
| 4   | the exact level ai generation |
| 5   | specified ai repone tags to filter or post generation parsing |
| 6   | can and how a project turn into template |

* * *

## 12. Assumptions & Constraints

* No payment or billing system in MVP
* No real-time features (WebSockets) in MVP
* Users bring their own API keys for AI generation (no shared API budget in MVP)
* The platform must work with both cloud AI APIs AND local models via OpenAI-compatible endpoints
* The team consists of Laravel backend developers and React/TypeScript frontend developers

* * *

Here’s a ready‑to‑use **“Risks & Mitigation” section in English** that you can paste directly into your PRD:

* * *

## 13. Risks & Mitigation

* * *

### 13.1 Technical Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| **Complexity of the modular file model (`content.json`, `sequance.json`, `style.css`, `layout.css`, `context.md`, `rules.md`)** | Increased development and maintenance effort, and higher chance of logic errors between layers. | - Simplify `sequance.json` to a flat array (e.g., `[{slideId, componentId, order}]`).<br> - Write clear **technical docs** for each file’s role.<br> - Hide complexity behind a **high‑level UI** so most users don’t need to understand the file structure. |
| **Unclear choice between Markdown → HTML vs direct HTML rendering** | Lock‑in to a specific format or need to build and maintain a custom Markdown parser. | - Decide upfront: **use direct HTML** in MVP, and only experiment with Markdown → HTML later.<br> - If using Markdown, keep the parser simple and stable initially. |
| **Difficulty designing and versioning `layout.json` / `sequance.json` schema** | Future schema changes break existing projects/templates. | - Adopt **schema versioning** from the start (e.g., `schemaVersion` in `meta.json`).<br> - Avoid breaking changes in v1.1; use adapter layers if needed. |
| **Heavy reliance on any OpenAI‑compatible LLM (cloud/local)** | Some endpoints behave differently despite API‑compatibility (rate limits, tokens, JSON format). | - Build an **adapter layer** that normalizes messages, responses, and retry logic.<br> - Define a **test matrix** for each model before enabling it in the UI. |
| **Difficulty building a full‑featured PPTX exporter** | Delays MVP, or forces a cut‑down PPTX that doesn’t match expectations. | - **Move PPTX outside MVP** and target it for v1.1.<br> - Start MVP with **HTML + PDF** and add PPTX once core flows are stable. |
| **Overly technical file structure imposed on users** | Non‑technical users get confused by `layout.css` vs `style.css` and file roles. | - Keep the complex structure in the backend.<br> - In the UI, expose **user‑friendly concepts** (e.g., “Colors & Fonts”, “Layout & Spacing”) instead of raw file names. |

* * *

### 13.2 User Experience & Adoption Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| **CSS attribute panel and modular UI too complex for non‑technical users** | Low adoption from students and casual creators. | - Add a **“Simple Mode”** that hides CSS panels and offers only presets, colors, fonts, and drag‑and‑drop.<br> - Provide **predefined themes** that users can tweak with minimal effort. |
| **Users expect “GitHub + Canva + AI” all in one, instantly** | Disappointment when some features are missing or feel incomplete. | - Clarify onboarding: |

* “MGF is more about **structured, template‑first workflows** than full‑featured visual design.”
* Explicitly show a **roadmap** (v1.1 features like PPTX, real‑time, etc.). |

| **Many files and concepts to learn** | Steep learning curve lowers adoption rate. | - Add a **guided onboarding wizard** that walks through one example per file (`content.json`, `style.css`, `context.md`, etc.).

* Use **consistent, plain‑language labels** in UI (e.g., “Content”, “Design”, “Layout”, “Settings”). |

* * *

### 13.3 Community & Safety Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| **Low‑quality or broken templates in the community** | Users lose trust in the gallery and templates. | - Add **basic moderation** for templates (admins or curators).<br> - Introduce labels like “Verified” or “Community‑approved”.<br> - Allow users to **report** templates. |
| **Abuse or harmful content in templates** | Reputational damage and potential misuse of the platform. | - Define a clear **Content Policy**.<br> - Implement **rate limits** per user.<br> - Add an **AI‑based safety filter** (if available) on generated content before publishing. |
| **No quality bar or template guidelines** | Templates vary wildly in quality, making MGF feel “developer‑only”. | - Create a **Template Authoring Guide** (best practices).<br> - Appoint **template curators** (internal or volunteer) to hand‑pick high‑quality templates. |

* * *

### 13.4 Scope & Planning Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| **MVP scope is too broad** (auth, templates, editor, AI, exports, community DB) | Risk of delays, feature‑cutting, or poor quality. | - Trim MVP scope: |

* Move **PPTX** and advanced features to v1.1.
  
* Focus MVP on:
  
* Auth + Projects/Templates (basic).
  
* Modular editor + CSS panel.
  
* AI generation (OpenAI + one local model).
  
* Export: **HTML + PDF + PNG**. |
  

| **Open Questions remain unresolved for too long** | Architecture decisions are delayed, leading to re‑work. | - Assign **clear owners** for each question (Backend, Frontend, Architecture, Product).

* Set **short deadlines** for small POCs, then decide and document the chosen path. || **Team is limited to Laravel + React/TS** | Harder to adopt new patterns or scale horizontally later. | - Stick to the current stack for MVP.
* Design API layer and jobs to be **service‑oriented**, so you can add microservices or workers later without breaking the core. |

* * *

### 13.5 Security & Compliance Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| **Misuse or leakage of user API keys** | Tokens can be stolen or abused for external API calls. | - Store keys **encrypted at rest**.<br> - **Never expose keys in client‑side code**.<br> - Always route AI calls through a **backend proxy**. |
| **Failure to meet WCAG 2.1 AA** | Poor accessibility for users with disabilities. | - Add an **accessibility checklist** in PRs (contrast, keyboard nav, ARIA labels).<br> - Make accessibility a **non‑negotiable requirement** in UI releases. |
| **AI generating harmful or unethical content** | Legal and reputational risk for the platform. | - Add **content safety rules** in `context.md` / `rules.md`.<br> - Use model‑level safety filters where available, and log suspicious prompts for review. |

* * *

### 13.6 Performance & Reliability Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |

| Risk | Impact | Mitigation |
| --- | --- | --- |
| **Slow preview or re‑render** | Poor UX during editing and AI generation. | - Use **debounced saving** and **cached previews** where possible.<br> - Enforce the **<500ms preview SLA** as a measurable target. |
| **High load from AI generation requests** | Platform slowdowns or outages during peak usage. | - Design backend as **stateless** and horizontally scalable.<br> - Use **queues/jobs** for AI generation, exposing only partial synchronous previews in the UI. |