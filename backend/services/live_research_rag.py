"""
Live Research Knowledge RAG Service.

Upgrades retrieval pipeline with ArXiv API search, Semantic Scholar API,
and citation network retrieval. Fetches latest related papers and merges
with local vector DB results. Caches API responses.
"""
import os
import re
import json
import hashlib
import asyncio
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime, timedelta

try:
    import httpx
except ImportError:
    httpx = None

from models.advanced_schemas import ExternalPaper, LiveRAGResult


class LiveResearchRAG:
    """Fetch live research context from ArXiv and Semantic Scholar."""

    CACHE_DIR = Path("./cache/live_rag")
    CACHE_TTL = timedelta(hours=24)

    def __init__(self):
        self.CACHE_DIR.mkdir(parents=True, exist_ok=True)
        self.sem_scholar_base = os.getenv(
            "SEMANTIC_SCHOLAR_API",
            "https://api.semanticscholar.org/graph/v1",
        )
        self.arxiv_base = os.getenv(
            "ARXIV_API", "http://export.arxiv.org/api/query"
        )

    # ── topic extraction (lightweight, no LLM) ────────────────────
    def extract_topic(self, abstract: str, title: str = "") -> str:
        """Extract a concise search query from abstract / title."""
        text = f"{title} {abstract}".strip()
        # grab first two sentences as proxy topic
        sentences = re.split(r"(?<=[.!?])\s+", text)
        topic = " ".join(sentences[:2])[:300]
        return topic if topic else text[:300]

    # ── caching helpers ───────────────────────────────────────────
    def _cache_key(self, query: str, source: str) -> str:
        h = hashlib.md5(f"{source}:{query}".encode()).hexdigest()
        return str(self.CACHE_DIR / f"{h}.json")

    def _read_cache(self, key: str) -> Optional[list]:
        p = Path(key)
        if p.exists():
            data = json.loads(p.read_text(encoding="utf-8"))
            cached_at = datetime.fromisoformat(data.get("ts", "2000-01-01"))
            if datetime.now() - cached_at < self.CACHE_TTL:
                return data.get("papers", [])
        return None

    def _write_cache(self, key: str, papers: list):
        Path(key).write_text(
            json.dumps({"ts": datetime.now().isoformat(), "papers": papers},
                       ensure_ascii=False),
            encoding="utf-8",
        )

    # ── ArXiv search ──────────────────────────────────────────────
    async def search_arxiv(self, query: str, max_results: int = 5) -> List[ExternalPaper]:
        """Search ArXiv API for related papers."""
        cache_key = self._cache_key(query, "arxiv")
        cached = self._read_cache(cache_key)
        if cached is not None:
            return [ExternalPaper(**p) for p in cached]

        if httpx is None:
            return []

        papers: List[ExternalPaper] = []
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                params = {
                    "search_query": f"all:{query[:200]}",
                    "start": 0,
                    "max_results": max_results,
                    "sortBy": "relevance",
                }
                resp = await client.get(self.arxiv_base, params=params)
                if resp.status_code == 200:
                    papers = self._parse_arxiv_xml(resp.text)
        except Exception as e:
            print(f"[LiveRAG] ArXiv search failed: {e}")

        self._write_cache(cache_key, [p.dict() for p in papers])
        return papers

    def _parse_arxiv_xml(self, xml_text: str) -> List[ExternalPaper]:
        """Parse ArXiv Atom XML response."""
        papers = []
        # Simple regex parsing (avoids xml dep)
        entries = re.findall(r"<entry>(.*?)</entry>", xml_text, re.DOTALL)
        for entry in entries:
            title = re.search(r"<title>(.*?)</title>", entry, re.DOTALL)
            summary = re.search(r"<summary>(.*?)</summary>", entry, re.DOTALL)
            published = re.search(r"<published>(.*?)</published>", entry)
            link = re.search(r'<id>(.*?)</id>', entry)
            authors = re.findall(r"<name>(.*?)</name>", entry)

            if title:
                year = None
                if published:
                    try:
                        year = int(published.group(1)[:4])
                    except ValueError:
                        pass
                papers.append(ExternalPaper(
                    title=re.sub(r"\s+", " ", title.group(1)).strip(),
                    authors=authors[:5],
                    abstract=re.sub(r"\s+", " ", summary.group(1)).strip() if summary else "",
                    year=year,
                    source="arxiv",
                    url=link.group(1).strip() if link else "",
                    relevance_score=0.8,
                ))
        return papers

    # ── Semantic Scholar search ───────────────────────────────────
    async def search_semantic_scholar(self, query: str, max_results: int = 5) -> List[ExternalPaper]:
        """Search Semantic Scholar for related papers."""
        cache_key = self._cache_key(query, "s2")
        cached = self._read_cache(cache_key)
        if cached is not None:
            return [ExternalPaper(**p) for p in cached]

        if httpx is None:
            return []

        papers: List[ExternalPaper] = []
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                url = f"{self.sem_scholar_base}/paper/search"
                params = {
                    "query": query[:200],
                    "limit": max_results,
                    "fields": "title,authors,abstract,year,citationCount,url",
                }
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json().get("data", [])
                    for item in data:
                        papers.append(ExternalPaper(
                            title=item.get("title", ""),
                            authors=[a.get("name", "") for a in (item.get("authors") or [])[:5]],
                            abstract=item.get("abstract", "") or "",
                            year=item.get("year"),
                            source="semantic_scholar",
                            url=item.get("url", ""),
                            citation_count=item.get("citationCount"),
                            relevance_score=0.75,
                        ))
        except Exception as e:
            print(f"[LiveRAG] Semantic Scholar search failed: {e}")

        self._write_cache(cache_key, [p.dict() for p in papers])
        return papers

    # ── Unified search ────────────────────────────────────────────
    async def search(
        self,
        abstract: str,
        title: str = "",
        max_per_source: int = 5,
    ) -> LiveRAGResult:
        """Run parallel searches across all sources and merge results."""
        topic = self.extract_topic(abstract, title)

        arxiv_papers, s2_papers = await asyncio.gather(
            self.search_arxiv(topic, max_per_source),
            self.search_semantic_scholar(topic, max_per_source),
            return_exceptions=True,
        )

        # Handle exceptions gracefully
        if isinstance(arxiv_papers, Exception):
            print(f"[LiveRAG] ArXiv error: {arxiv_papers}")
            arxiv_papers = []
        if isinstance(s2_papers, Exception):
            print(f"[LiveRAG] S2 error: {s2_papers}")
            s2_papers = []

        all_papers = list(arxiv_papers) + list(s2_papers)
        # Deduplicate by title similarity
        seen = set()
        unique = []
        for p in all_papers:
            key = p.title.lower()[:60]
            if key not in seen:
                seen.add(key)
                unique.append(p)

        return LiveRAGResult(
            query_topic=topic,
            external_papers=unique,
            total_found=len(unique),
        )
