# AI Research Paper Reviewer 🤖📚

## Project Overview

**AI Research Paper Reviewer** is an advanced, AI-powered web application designed to automatically evaluate and analyze academic research papers. Leveraging cutting-edge technologies like **RAG (Retrieval-Augmented Generation)**, **Large Language Models (LLMs)**, and **ChromaDB vector databases**, this platform provides comprehensive, objective assessments of research papers across four critical dimensions: Novelty, Methodology, Clarity, and Citation Quality.

API KEY --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

## 🎯 Purpose & Use Cases

### Why This Project is Useful

1. **Time-Saving for Researchers**: Instead of waiting weeks or months for peer review feedback, researchers get instant, detailed analysis of their work.

2. **Objective Evaluation**: The AI provides bias-free initial assessments, complementing human peer review.

3. **Educational Tool**: Helps students and early-career researchers understand what makes quality research.

4. **Pre-Submission Check**: Authors can identify weaknesses before submitting to journals or conferences.

5. **Research Integrity**: Detects potential biases in citations, methodology, and presentation.

### Target Users

- **Academic Researchers** - Get preliminary feedback on manuscripts
- **Graduate Students** - Learn research quality standards
- **Journal Editors** - Initial screening tool for submissions
- **Research Institutions** - Standardized quality assessment
- **Conference Organizers** - Quick evaluation of paper submissions

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  - Upload Interface  - Loading Animations  - Report Display │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PDF Parser   │  │ RAG Engine   │  │ LLM Evaluator│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Bias Detector │  │Report Gen.   │  │Vector Store  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ Vector Embeddings
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   ChromaDB (Vector Database)                 │
│      Stores research paper embeddings for RAG retrieval     │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ API Calls
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      Grok (xAI) - grok-beta                 │
│           Natural Language Understanding & Generation        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technologies Used

### Frontend Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React 18** | Core UI framework | 18.2.0 |
| **Vite** | Build tool & dev server | 5.1.0 |
| **React Router** | Client-side routing | 6.22.0 |
| **Framer Motion** | Animations & transitions | 11.0.5 |
| **Tailwind CSS** | Utility-first styling | 3.4.1 |
| **Axios** | HTTP client | 1.6.7 |
| **Lucide React** | Icon library | 0.323.0 |
| **React Dropzone** | File upload handling | 14.2.3 |

### Backend Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Python** | Core programming language | 3.8+ |
| **FastAPI** | Web framework | Latest |
| **Uvicorn** | ASGI server | Latest |
| **LangChain** | LLM orchestration framework | Latest |
| **ChromaDB** | Vector database | Latest |
| **Grok API (xAI)** | grok-beta model integration | Latest |
| **PyMuPDF (fitz)** | PDF parsing | Latest |
| **ReportLab** | PDF generation | Latest |
| **python-dotenv** | Environment management | Latest |

### Additional Libraries

- **Sentence Transformers** - Text embeddings
- **NLTK** - Natural language processing
- **NumPy** - Numerical computations
- **Pydantic** - Data validation

---

## 🔄 How It Works

### Complete Analysis Pipeline

```
1. UPLOAD PHASE
   User uploads PDF → FastAPI receives file → Saved to /uploads

2. PARSING PHASE
   PDF Parser extracts:
   ├── Full text content
   ├── Abstract
   ├── Introduction
   ├── Methodology
   ├── Results
   ├── Conclusion
   └── References

3. RAG PREPARATION
   ├── Text chunking (semantic splitting)
   ├── Generate embeddings (Sentence Transformers)
   ├── Store in ChromaDB vector database
   └── Query similar papers (cosine similarity)

4. LLM EVALUATION (Parallel Processing)
   ├── Novelty Analysis
   │   ├── Compare with retrieved papers (RAG)
   │   ├── Identify unique contributions
   │   └── Score: 0-100
   │
   ├── Methodology Assessment
   │   ├── Evaluate research design
   │   ├── Check statistical rigor
   │   └── Score: 0-100
   │
   ├── Clarity Evaluation
   │   ├── Assess writing quality
   │   ├── Check structure & flow
   │   └── Score: 0-100
   │
   └── Citation Analysis
       ├── Reference quality check
       ├── Citation appropriateness
       └── Score: 0-100

5. BIAS DETECTION
   ├── Geographic bias (citation distribution)
   ├── Gender bias (author representation)
   ├── Recency bias (publication dates)
   ├── Confirmation bias (supporting vs. contrary evidence)
   └── Language bias (non-English exclusion)

6. REPORT GENERATION
   ├── Aggregate all scores
   ├── Calculate overall verdict
   ├── Generate detailed explanations
   ├── Create downloadable PDF
   └── Store in /reports directory

7. DISPLAY RESULTS
   Frontend receives JSON → Renders interactive report
```

### RAG (Retrieval-Augmented Generation) Implementation

```python
# Simplified workflow:

1. Indexing Phase (when papers are uploaded):
   - Split paper into chunks
   - Generate embeddings for each chunk
   - Store in ChromaDB with metadata

2. Retrieval Phase (during analysis):
   - Query: "Find similar papers to [abstract]"
   - ChromaDB performs similarity search
   - Returns top 5-10 most relevant papers

3. Augmentation Phase:
   - Combine retrieved papers with current paper
   - Send to GPT-4 with prompt:
     "Compare this paper with existing research.
      Identify novel contributions..."

4. Generation Phase:
   - GPT-4 generates detailed analysis
   - Includes specific comparisons
   - Provides novelty score with reasoning
```

---

## 📊 Evaluation Metrics

### 1. Novelty Score (0-100)
- **80-100**: Groundbreaking, highly original
- **60-79**: Significant new insights
- **40-59**: Moderate novelty with incremental improvements
- **0-39**: Limited originality

### 2. Methodology Score (0-100)
- **80-100**: Excellent research design, rigorous
- **60-79**: Sound methodology with minor gaps
- **40-59**: Acceptable but with notable limitations
- **0-39**: Significant methodological concerns

### 3. Clarity Score (0-100)
- **80-100**: Exceptionally clear and well-structured
- **60-79**: Good clarity with minor issues
- **40-59**: Readable but needs improvement
- **0-39**: Poor organization or writing

### 4. Citations Score (0-100)
- **80-100**: Excellent citation practice
- **60-79**: Good references with minor gaps
- **40-59**: Adequate but incomplete
- **0-39**: Poor citation quality or coverage

### Overall Verdict
- Average of four scores
- Categorized as: Outstanding, Strong, Acceptable, Needs Improvement

---

## 🗂️ Project Structure

```
research-reviewer/
│
├── frontend/                    # React frontend application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Hero.jsx
│   │   │   ├── LoadingAnalyzer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ReviewReport.jsx
│   │   │   ├── ScoreCard.jsx
│   │   │   └── UploadZone.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Analyze.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Report.jsx
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                     # FastAPI backend
│   ├── models/
│   │   └── schemas.py           # Pydantic data models
│   ├── routes/
│   │   ├── upload.py            # File upload endpoints
│   │   └── review.py            # Analysis endpoints
│   ├── services/
│   │   ├── pdf_parser.py        # PDF extraction logic
│   │   ├── rag_engine.py        # RAG implementation
│   │   ├── llm_evaluator.py     # LLM-based evaluation
│   │   ├── bias_detector.py     # Bias detection algorithms
│   │   └── report_generator.py  # PDF report creation
│   ├── vector_store/
│   │   ├── chroma_db.py         # ChromaDB interface
│   │   └── chroma_data/         # Vector storage
│   ├── uploads/                 # Uploaded PDFs
│   ├── reports/                 # Generated reports
│   ├── main.py                  # FastAPI application
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Environment variables
│
├── start.ps1                    # Windows startup script
├── QUICKSTART.md                # Quick setup guide
└── README.md                    # Project readme
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.8+
- **Grok API Key** (from https://x.ai/api)

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd research-reviewer
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Add your Grok API key:
OPENAI_API_KEY=gsk-your-grok-api-key-here
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install
```

#### 4. Run the Application

**Option 1: Automatic (Windows)**
```powershell
.\start.ps1
```

**Option 2: Manual**

Terminal 1 - Backend:
```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate on Mac/Linux
python main.py
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

#### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

---

## 🔑 Key Features

### 1. **Intelligent PDF Parsing**
- Extracts structured sections from research papers
- Handles various PDF formats and layouts
- Preserves formatting and references

### 2. **RAG-Powered Novelty Detection**
- Compares submitted paper against database of existing research
- Uses semantic similarity (not just keyword matching)
- Identifies unique contributions and overlaps

### 3. **Multi-Dimensional Analysis**
- Four independent evaluation criteria
- Each with detailed explanations and examples
- Actionable feedback for improvement

### 4. **Bias Detection System**
- Identifies 5 types of research bias
- Provides specific examples from the paper
- Suggests ways to address detected biases

### 5. **Beautiful, Intuitive UI**
- Clean, professional design
- Smooth animations and transitions
- Mobile-responsive layout
- Progress tracking during analysis

### 6. **Downloadable PDF Reports**
- Professional formatting
- Includes all scores and detailed feedback
- Ready to share with advisors or co-authors

---

## 🔬 Technical Deep Dive

### RAG Engine Implementation

```python
class RAGEngine:
    def __init__(self):
        self.db = Chroma(
            collection_name="research_papers",
            embedding_function=SentenceTransformerEmbeddings(
                model_name="all-MiniLM-L6-v2"
            )
        )
    
    def add_paper_to_store(self, paper_id, sections):
        """Add paper embeddings to vector store"""
        chunks = self._create_chunks(sections)
        self.db.add_texts(
            texts=chunks,
            metadatas=[{"paper_id": paper_id}] * len(chunks)
        )
    
    def compare_novelty(self, sections, current_paper_id):
        """Retrieve similar papers for comparison"""
        query = sections['abstract'] + sections['introduction']
        results = self.db.similarity_search(
            query,
            k=10,
            filter={"paper_id": {"$ne": current_paper_id}}
        )
        return results
```

### LLM Evaluation Prompts

Example prompt for novelty evaluation:
```python
prompt = f"""
You are an expert research paper reviewer. Analyze this paper's novelty.

CURRENT PAPER:
Abstract: {abstract}
Introduction: {introduction}

SIMILAR EXISTING PAPERS:
{retrieved_papers}

Evaluate:
1. What are the unique contributions?
2. How does it differ from existing work?
3. What is truly novel vs. incremental?

Provide:
- Score (0-100)
- Detailed explanation with specific examples
"""
```

### Bias Detection Algorithms

```python
def detect_geographic_bias(references):
    """Detect over-representation of specific regions"""
    regions = extract_author_affiliations(references)
    distribution = calculate_distribution(regions)
    
    if max(distribution.values()) > 0.6:  # 60% threshold
        return {
            "detected": True,
            "description": f"{max_region} represents {max_pct}% of citations"
        }
```

---

## 📈 Performance & Scalability

### Current Capabilities
- **Analysis Time**: 30-60 seconds per paper
- **Concurrent Uploads**: Up to 5 simultaneous
- **Database Size**: Scales to 100,000+ papers
- **API Rate Limits**: Depends on OpenAI tier

### Optimization Strategies
1. **Caching**: Store embeddings to avoid recomputation
2. **Batch Processing**: Queue multiple papers
3. **Lazy Loading**: Load services only when needed
4. **Compression**: Reduce vector storage size

---

## 🔐 Security & Privacy

### Data Handling
- **PDF Storage**: Temporary, deleted after analysis option
- **API Keys**: Stored in .env, never committed
- **User Data**: No personal information collected
- **HTTPS**: Recommended for production deployment

### Best Practices
- Use environment variables for sensitive data
- Implement rate limiting in production
- Regular security audits of dependencies
- Sanitize file uploads

---

## 🐛 Troubleshooting

### Common Issues

**1. "Grok API Key not configured"**
- Solution: Add Grok API key to `backend/.env` file (OPENAI_API_KEY=gsk-...)

**2. "Port already in use"**
- Solution: Change port in `vite.config.js` or `main.py`

**3. "ChromaDB initialization failed"**
- Solution: Delete `backend/vector_store/chroma_data` and restart

**4. "PDF parsing error"**
- Solution: Ensure PDF is not encrypted or corrupted

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Multiple LLM support (Claude, Gemini, Llama)
- [ ] Collaborative review with comments
- [ ] Historical tracking of paper revisions
- [ ] Integration with arXiv, PubMed APIs
- [ ] Custom evaluation criteria
- [ ] Multi-language support
- [ ] Plagiarism detection
- [ ] Citation graph visualization
- [ ] Browser extension for one-click analysis

---

## 📚 Learning Resources

### For Understanding the Technology

- **LangChain**: https://python.langchain.com/docs/introduction/
- **ChromaDB**: https://docs.trychroma.com/
- **FastAPI**: https://fastapi.tiangolo.com/
- **RAG Tutorial**: https://www.pinecone.io/learn/retrieval-augmented-generation/
- **React**: https://react.dev/learn

---

## 👥 Contributing

Contributions are welcome! Areas for improvement:
- Additional bias detection algorithms
- UI/UX enhancements
- Evaluation criteria refinement
- Documentation improvements

---

## 📄 License

This project is for educational and research purposes.

---

## 🙏 Acknowledgments

- xAI for Grok models
- LangChain community
- ChromaDB team
- React and Tailwind CSS communities

---

## 📞 Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Refer to QUICKSTART.md for setup help
- Check API documentation at `/docs` endpoint

---

**Built with ❤️ for the research community**

*Last Updated: February 25, 2026*
