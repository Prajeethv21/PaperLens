# PaperLens AI - System Architecture & Technical Documentation

## Table of Contents
1. [Abstract](#abstract)
2. [Problem Statement](#problem-statement)
3. [Solution](#solution)
4. [System Architecture](#system-architecture)
5. [Methodologies](#methodologies)
6. [Technologies & Tools](#technologies--tools)
7. [Data Flow](#data-flow)
8. [AI/ML Components](#aiml-components)
9. [Security Architecture](#security-architecture)
10. [Performance Considerations](#performance-considerations)

---

## Abstract

PaperLens AI is an intelligent research paper analysis platform that addresses the critical challenges in academic peer review through artificial intelligence and advanced natural language processing. The system combines Retrieval-Augmented Generation (RAG), Large Language Models (LLMs), and vector databases to provide comprehensive, unbiased, and rapid analysis of academic papers.

**Core Innovation:** The platform employs a multi-layered AI architecture that simulates multiple expert reviewers, detects various forms of bias, identifies research gaps, and predicts publication acceptance probability - all within minutes rather than weeks.

---

## Problem Statement

### Challenges in Traditional Academic Peer Review

#### 1. **Time Inefficiency**
- Traditional peer review takes 3-6 months on average
- Reviewers are unpaid, leading to delays
- Multiple rounds of review extend timelines further
- Authors face long waits for feedback

#### 2. **Bias and Subjectivity**
- **Confirmation bias:** Reviewers favor papers confirming their beliefs
- **Prestige bias:** Papers from renowned institutions receive preferential treatment
- **Geographic bias:** English-language bias, Western-centric perspectives
- **Gender bias:** Studies show systemic gender disparities in reviews
- **Citation bias:** Over-reliance on certain research groups
- **Methodology bias:** Preference for specific research methods

#### 3. **Inconsistency**
- Different reviewers provide contradictory feedback
- Lack of standardized evaluation criteria
- Subjective interpretation of "novelty" and "impact"
- Arbitrary scoring without clear justification

#### 4. **Limited Scope**
- Reviewers may not catch all methodological flaws
- Statistical errors often go unnoticed
- Reproducibility issues unclear until replication attempts
- Ethical concerns may be overlooked

#### 5. **Scalability Issues**
- Exponential growth in paper submissions (5-7% annually)
- Shortage of qualified reviewers
- Reviewer burnout and declining quality
- Bottleneck in scientific communication

### Business Problem
Researchers, journal editors, and academic institutions need:
- **Fast** preliminary feedback on paper quality
- **Unbiased** evaluation of research contributions
- **Comprehensive** analysis across multiple dimensions
- **Standardized** scoring and recommendations
- **Actionable** insights for improvement

---

## Solution

### PaperLens AI Approach

#### 1. **Automated Multi-Dimensional Analysis**
Instead of waiting weeks for human reviewers, the system provides:
- **Quick Review:** 30-second preliminary assessment
- **Detailed Review:** 2-3 minute comprehensive evaluation
- **Multi-Reviewer Simulation:** 3 AI reviewers with different perspectives
- **Acceptance Prediction:** Data-driven publication probability

#### 2. **RAG-Powered Intelligence**
The system doesn't just rely on pre-trained knowledge:
- Extracts and indexes paper content in vector database
- Retrieves relevant context for each query
- Generates answers grounded in the actual paper text
- Reduces hal lucinations through source verification

#### 3. **Bias Detection & Mitigation**
Automated scanning for 7 types of bias:
- Gender bias (pronoun analysis, author representation)
- Geographic bias (citation distribution, dataset origins)
- Citation bias (concentration metrics, self-citation patterns)
- Confirmation bias (alternative perspectives analysis)
- Methodology bias (approach diversity assessment)
- Language bias (accessibility, terminology analysis)
- Funding bias (conflict of interest detection)

#### 4. **Research Gap Identification**
Systematic analysis of:
- Unexplored questions in the field
- Methodological gaps
- Dataset limitations
- Theoretical unexplored areas
- Cross-disciplinary opportunities

#### 5. **Statistical & Methodological Validation**
- Sample size adequacy checks
- Statistical test appropriateness
- P-value interpretation
- Effect size reporting
- Reproducibility requirements verification

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│                     (React + Vite + Router)                     │
├─────────────────────────────────────────────────────────────────┤
│  - Landing Page           - Authentication (JWT)                │
│  - Upload Interface       - Analysis Dashboard                  │
│  - Review Display         - Report Export                       │
│  - Multi-Review UI        - Gap Visualization                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS / REST API
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MIDDLEWARE LAYER                          │
│                  (Security & Validation)                        │
├─────────────────────────────────────────────────────────────────┤
│  - Rate Limiting          - Input Validation                    │
│  - Security Headers       - CSRF Protection                     │
│  - Request Logging        - Authentication                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                │
│                    (FastAPI Routers)                            │
├─────────────────────────────────────────────────────────────────┤
│  /auth     → Authentication & User Management                   │
│  /upload   → PDF Upload & Validation                            │
│  /review   → Quick & Comprehensive Reviews                      │
│  /advanced → Multi-Review, Gaps, Acceptance Prediction          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
│              (Core Business Logic)                              │
├─────────────────────────────────────────────────────────────────┤
│  PDF Parser    → PyMuPDF text extraction                        │
│  RAG Engine    → ChromaDB + Sentence Transformers               │
│  LLM Evaluator → OpenAI GPT-4 evaluation                        │
│  Bias Detector → Pattern matching + NLP analysis                │
│  Gap Detector  → Contextual analysis                            │
│  MultiReviewer → 3-perspective simulation                       │
│  Acceptance    → Probabilistic prediction                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  ChromaDB          → Vector storage (embeddings)                │
│  File System       → PDF storage (uploads/)                     │
│  JSON Files        → User database (users.json)                 │
│  Reports           → Generated PDF reports (reports/)           │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  OpenAI API        → GPT-4, GPT-3.5-Turbo                       │
│  Hugging Face      → Sentence Transformers                      │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Frontend Architecture
```
App (Root)
├── Router Configuration
│   ├── / (Landing Page)
│   ├── /login (Authentication)
│   ├── /analyze (Protected - Main Dashboard)
│   └── /dashboard (Protected - Review Display)
│
├── Global State
│   ├── Authentication (localStorage)
│   └── User Context (React Context)
│
└── Components
    ├── Navbar (Transparent)
    ├── CustomButton
    ├── LoadingScreen (3D Cube)
    ├── UploadZone (Dropzone)
    └── DashboardSections
```

#### Backend Architecture
```
FastAPI Application
├── main.py (Entry Point)
│   ├── Middleware Registration
│   ├── Router Registration
│   └── CORS Configuration
│
├── Routes (API Endpoints)
│   ├── auth.py       → /api/auth/*
│   ├── upload.py     → /api/upload
│   ├── review.py     → /api/review/*
│   └── advanced.py   → /api/advanced/*
│
├── Middleware (Security & Validation)
│   ├── rate_limiter.py    → Rate limiting logic
│   ├── security.py        → Headers, CSRF, logging
│   └── validator.py       → Input sanitization
│
├── Models (Pydantic Schemas)
│   ├── schemas.py         → Upload, Review models
│   ├── auth_schemas.py    → User, Token models
│   └── advanced_schemas.py → Advanced feature models
│
└── Services (Business Logic)
    ├── pdf_parser.py           → PDF extraction
    ├── rag_engine.py           → ChromaDB + retrieval
    ├── llm_evaluator.py        → LLM scoring
    ├── bias_detector.py        → Bias analysis
    ├── gap_detector.py         → Gap identification
    ├── multi_reviewer.py       → Multi-perspective review
    ├── acceptance_predictor.py → Acceptance prediction
    ├── advanced_analyzers.py   → Statistical, ethical, reproducibility
    └── report_generator.py     → PDF report generation
```

---

## Methodologies

### 1. **Retrieval-Augmented Generation (RAG)**

**Concept:**
RAG combines retrieval-based and generation-based approaches to create more accurate, grounded AI responses.

**Implementation:**
```
1. Document Ingestion
   └── PDF parsed into chunks (500-1000 words)
   
2. Embedding Generation
   └── Sentence Transformers encode chunks into 384-dim vectors
   
3. Vector Storage
   └── ChromaDB stores embeddings with metadata
   
4. Query Processing
   └── User query embedded using same model
   
5. Similarity Search
   └── Cosine similarity finds top-k relevant chunks
   
6. Context Assembly
   └── Retrieved chunks assembled into context
   
7. LLM Generation
   └── GPT-4 generates answer using context + query
   
8. Source Attribution
   └── Response includes source chunks for verification
```

**Benefits:**
- Reduces hallucinations
- Provides verifiable citations
- Enables paper-specific Q&A
- Improves answer accuracy

### 2. **Multi-Criteria LLM Evaluation**

**Evaluation Framework:**
```python
Criteria = {
    "Methodology": {
        "weight": 0.25,
        "aspects": ["rigor", "appropriateness", "reproducibility"],
        "score_range": (1, 10)
    },
    "Novelty": {
        "weight": 0.25,
        "aspects": ["originality", "contribution", "innovation"],
        "score_range": (1, 10)
    },
    "Clarity": {
        "weight": 0.20,
        "aspects": ["writing", "structure", "presentation"],
        "score_range": (1, 10)
    },
    "Impact": {
        "weight": 0.30,
        "aspects": ["significance", "applicability", "potential"],
        "score_range": (1, 10)
    }
}

Final_Score = Σ (Criterion_Score × Weight)
```

**Process:**
1. Extract relevant sections for each criterion
2. Provide criterion-specific prompt to GPT-4
3. Receive structured JSON response with scores
4. Aggregate scores using weighted average
5. Generate justifications for each score

### 3. **Bias Detection Algorithm**

**Multi-Layered Approach:**

#### Gender Bias Detection
```python
def detect_gender_bias(text, citations):
    # Pronoun analysis
    male_pronouns = count(["he", "his", "him", "himself"])
    female_pronouns = count(["she", "her", "hers", "herself"])
    ratio = male_pronouns / female_pronouns
    
    # Author gender distribution
    author_genders = infer_gender_from_names(citations)
    gender_balance = calculate_diversity_score(author_genders)
    
    # Gendered language
    gendered_terms = detect_stereotypical_language(text)
    
    return {
        "pronoun_bias": ratio,
        "author_diversity": gender_balance,
        "stereotypical_language": gendered_terms
    }
```

#### Geographic Bias Detection
```python
def detect_geographic_bias(citations, datasets):
    # Citation country distribution
    countries = extract_countries_from_citations(citations)
    diversity_score = calculate_entropy(countries)
    
    # Dataset origins
    dataset_countries = extract_dataset_origins(datasets)
    
    # Western-centric check
    western_ratio = count_western_sources(citations) / total_citations
    
    return {
        "geographic_diversity": diversity_score,
        "western_concentration": western_ratio,
        "dataset_origins": dataset_countries
    }
```

### 4. ** Research Gap Identification**

**Methodology:**
```
1. Extract key concepts
   └── Named Entity Recognition (NER)
   └── Keyword extraction (TF-IDF, RAKE)
   
2. Identify methodology
   └── Method mention detection
   └── Dataset identification
   
3. Analyze future work section
   └── Explicit gap statements
   └── Limitation acknowledgments
   
4. Cross-reference with literature
   └── Identify unexplored combinations
   └── Find methodology not applied to this domain
   
5. Generate gap recommendations
   └── Prioritize by feasibility and impact
```

### 5. **Acceptance Prediction Model**

**Feature Engineering:**
```python
features = {
    # Content Quality
    "methodology_score": float,
    "novelty_score": float,
    "clarity_score": float,
    "impact_score": float,
    
    # Structure Quality
    "abstract_clarity": float,
    "citation_count": int,
    "reference_quality": float,
    "figure_count": int,
    
    # Bias Indicators
    "bias_score": float,
    "methodology_diversity": float,
    
    # Statistical Rigor
    "statistical_validity": float,
    "reproducibility_score": float
}

# Logistic Regression
acceptance_probability = sigmoid(Σ (feature_i × weight_i))
```

**Calibration:**
- Trained on historical acceptance/rejection patterns
- Incorporates venue-specific factors
- Accounts for field-specific standards

---

## Technologies & Tools

### Frontend Stack

#### 1. **React 18.2.0**
- **Purpose:** UI component library
- **Why:** Virtual DOM efficiency, component reusability, large ecosystem
- **Usage:** All UI components, state management

#### 2. **Vite 5.4.21**
- **Purpose:** Build tool and dev server
- **Why:** 10-100x faster than Webpack, HMR, optimized builds
- **Usage:** Development server, production builds

#### 3. **React Router DOM 6.22.0**
- **Purpose:** Client-side routing
- **Why:** Declarative routing, protected routes, navigation state
- **Usage:** Page navigation, authentication guards

#### 4. **Framer Motion 11.0.5**
- **Purpose:** Animation library
- **Why:** Physics-based animations, gesture support, declarative API
- **Usage:** Page transitions, button interactions, loading animations

#### 5. **Styled Components 6.3.11**
- **Purpose:** CSS-in-JS
- **Why:** Component-scoped styles, dynamic styling, theming
- **Usage:** Component styling, responsive design

#### 6. **Axios 1.6.7**
- **Purpose:** HTTP client
- **Why:** Promise-based, interceptors, automatic JSON handling
- **Usage:** API requests, authentication headers, error handling

### Backend Stack

#### 1. **FastAPI 0.109.2**
- **Purpose:** Web framework
- **Why:** Async support, automatic OpenAPI docs, Pydantic integration, fast
- **Usage:** API endpoints, request validation, documentation

#### 2. **Uvicorn 0.27.1**
- **Purpose:** ASGI server
- **Why:** Lightning-fast, async I/O, WebSocket support
- **Usage:** Running FastAPI application

#### 3. **OpenAI API (GPT-4)**
- **Purpose:** Large Language Model
- **Why:** State-of-the-art reasoning, instruction following, context handling
- **Usage:** Paper evaluation, bias detection, gap analysis

#### 4. **ChromaDB 0.5.23**
- **Purpose:** Vector database
- **Why:** Easy embedding storage, cosine similarity, persistence, filters
- **Usage:** Storing paper embeddings, semantic search

#### 5. **Sentence Transformers 2.3.1**
- **Purpose:** Text embeddings
- **Why:** Semantic similarity, pre-trained models, multi-lingual support
- **Usage:** Converting text to vector embeddings

#### 6. **LangChain 0.1.6**
- **Purpose:** LLM orchestration
- **Why:** Chain composition, memory management, prompt templates
- **Usage:** RAG pipelines, conversation management

#### 7. **PyMuPDF (fitz) 1.23.26**
- **Purpose:** PDF processing
- **Why:** Fast text extraction, layout preservation, metadata access
- **Usage:** Extracting text from uploaded PDFs

#### 8. **ReportLab 4.0.9**
- **Purpose:** PDF generation
- **Why:** Programmatic PDF creation, styling support
- **Usage:** Generating review reports

#### 9. **python-jose 3.3.0**
- **Purpose:** JWT handling
- **Why:** Secure token generation, validation, encryption
- **Usage:** Authentication tokens

#### 10. **bcrypt**
- **Purpose:** Password hashing
- **Why:** Slow hashing (brute-force resistant), salting
- **Usage:** Password storage

### Development Tools

#### 1. **Git**
- Version control, collaboration

#### 2. **VS Code / PyCharm**
- Code editing, debugging

#### 3. **Postman**
- API testing, documentation

#### 4. **Chrome DevTools**
- Frontend debugging, performance profiling

---

## Data Flow

### Upload & Analysis Flow

```
User Action: Upload PDF
    ↓
Frontend: File Validation (client-side)
    ├── File type check (.pdf)
    ├── Size check (< 10MB)
    └── FormData construction
    ↓
API Request: POST /api/upload
    ↓
Middleware: Rate Limiting
    ├── Check IP-based limit
    ├── Check user-based limit (if authenticated)
    └── Allow/Reject (429)
    ↓
Middleware: Input Validation
    ├── Filename sanitization
    ├── File extension validation
    └── Magic byte verification (PDF signature)
    ↓
Route Handler: upload.py
    ├── Generate UUID for paper
    ├── Save file to uploads/
    └── Validate research paper content
    ↓
Service: PDFParser
    ├── Extract text (PyMuPDF)
    ├── Parse sections (abstract, intro, methods, etc.)
    └── Extract metadata (authors, title, citations)
    ↓
Service: RAGEngine
    ├── Chunk text (500-1000 words)
    ├── Generate embeddings (SentenceTransformers)
    ├── Store in ChromaDB
    └── Create index
    ↓
Response: {paper_id, filename, message}
    ↓
Frontend: Navigate to dashboard with paper_id
    ↓
User Action: Request Review
    ↓
API Request: POST /api/review/comprehensive
    ↓
Service: RAGEngine
    ├── Retrieve relevant chunks for each criterion
    └── Assemble context
    ↓
Service: LLMEvaluator
    ├── Construct prompts with context
    ├── Call OpenAI API (GPT-4)
    ├── Parse structured responses
    └── Calculate weighted scores
    ↓
Service: BiasDetector
    ├── Analyze text for bias patterns
    ├── Calculate bias scores
    └── Generate bias report
    ↓
Service: GapDetector
    ├── Extract key concepts
    ├── Identify methodology
    └── Generate gap recommendations
    ↓
Service: ReportGenerator
    ├── Compile all analyses
    ├── Generate PDF report
    └── Save to reports/
    ↓
Response: Comprehensive review JSON
    ↓
Frontend: Display dashboard with results
```

---

## AI/ML Components

### 1. **Text Embedding Pipeline**
```python
# Model: all-Mini LM-L6-v2 (384 dimensions)
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

# Text chunking
chunks = split_text(paper_text, chunk_size=1000, overlap=200)

# Generate embeddings
embeddings = model.encode(chunks, batch_size=32)

# Store in ChromaDB
collection.add(
    embeddings=embeddings,
    documents=chunks,
    metadatas=[{"chunk_id": i, "paper_id": id} for i in range(len(chunks))]
)
```

### 2. **Semantic Search**
```python
def query_paper(query: str, top_k: int = 5):
    # Embed query
    query_embedding = model.encode(query)
    
    # Search similar chunks
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    
    # Return ranked chunks
    return results['documents'][0]
```

### 3. **LLM Prompting Strategy**
```python
EVALUATION_PROMPT = """
You are an expert academic reviewer evaluating a research paper.

Paper Context:
{context}

Evaluation Criterion: {criterion}

Provide a score (1-10) and detailed justification.

Output JSON:
{
  "score": <1-10>,
  "justification": "<2-3 sentences>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"]
}
"""

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a research paper reviewer."},
        {"role": "user", "content": EVALUATION_PROMPT.format(context=context, criterion="Methodology")}
    ],
    temperature=0.3,  # Low for consistency
    max_tokens=500
)
```

### 4. **Bias Detection NLP**
```python
# Gender bias - pronoun analysis
pronouns = {
    "male": ["he", "him", "his", "himself"],
    "female": ["she", "her", "hers", "herself"],
    "neutral": ["they", "them", "their", "themselves"]
}

def calculate_pronoun_bias(text):
    male_count = count_occurrences(text, pronouns["male"])
    female_count = count_occurrences(text, pronouns["female"])
    
    if female_count == 0:
        return "high_male_bias"
    
    ratio = male_count / female_count
    
    if ratio > 2.0:
        return "male_biased"
    elif ratio < 0.5:
        return "female_biased"
    else:
        return "balanced"
```

---

## Security Architecture

### Defense in Depth Strategy

```
Layer 1: Network Security
   └── HTTPS/TLS encryption
   └── CORS policy enforcement
   
Layer 2: Application Security
   └── Rate limiting (sliding window)
   └── Input validation (schema-based)
   └── Security headers (CSP, HSTS, etc.)
   
Layer 3: Authentication & Authorization
   └── JWT tokens with expiration
   └── Bcrypt password hashing (cost 12)
   └── Timing-attack resistant comparison
   
Layer 4: Data Security
   └── File type validation (magic bytes)
   └── UUID-based file naming
   └── Environment variable validation
   
Layer 5: Monitoring & Logging
   └── Request logging
   └── Failed login tracking
   └── Suspicious pattern detection
```

See [SECURITY.md](SECURITY.md) for detailed security documentation.

---

## Performance Considerations

### Frontend Optimizations
- Code splitting (React.lazy)
- Image lazy loading
- Memoization (React.memo, useMemo)
- Virtual scrolling for large lists
- Debouncing user inputs
- Service worker caching

### Backend Optimizations
- Lazy service initialization
- Connection pooling (DB connections)
- Async I/O (FastAPI + Uvicorn)
- Caching (embedding cache, response cache)
- Batch processing (embeddings)
- Stream responses (large reviews)

### Database Optimizations
- Vector index (HNSW algorithm in ChromaDB)
- Metadata filtering
- Persistent storage optimization

### Scalability Path
- Horizontal scaling (load balancer + multiple API servers)
- Database separation (users, papers, vectors)
- CDN for frontend assets
- Redis for caching
- Queue system for long-running tasks (Celery + RabbitMQ)

---

## Future Enhancements

1. **Real-time Collaboration**
   - Multiple reviewers on same paper
   - Comment threads
   - Live editing feedback

2. **Advanced ML Models**
   - Fine-tuned domain-specific models
   - Citation graph neural networks
   - Plagiarism detection

3. **Integration Ecosystem**
   - LaTeX editor integration
   - Reference manager plugins (Zotero, Mendeley)
   - Journal submission systems

4. **Analytics Dashboard**
   - Research trends visualization
   - Acceptance rate predictions
   - Field-specific benchmarks

5. **Mobile Application**
   - iOS and Android apps
   - Offline PDF viewing
   - Push notifications for review completion

---

**Document Version:** 1.0  
**Last Updated:** March 3, 2026  
**Author:** PaperLens AI Team
