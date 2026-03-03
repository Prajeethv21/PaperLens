import re
from typing import List, Dict
from models.schemas import BiasReport

class BiasDetector:
    """Detect various types of bias in research papers"""
    
    def __init__(self):
        self.male_indicators = ['he', 'him', 'his', 'mr', 'man', 'men', 'male']
        self.female_indicators = ['she', 'her', 'hers', 'ms', 'mrs', 'woman', 'women', 'female']
        
        self.western_countries = [
            'united states', 'usa', 'uk', 'united kingdom', 'canada', 
            'australia', 'germany', 'france', 'netherlands', 'switzerland'
        ]
    
    def detect_all_biases(
        self, 
        paper_sections: Dict,
        references: List[str]
    ) -> BiasReport:
        """Detect multiple types of bias"""
        flags = []
        
        # Gender bias in citations
        gender_bias = self._detect_gender_bias(references)
        if gender_bias:
            flags.append(gender_bias)
        
        # Geographic bias
        geo_bias = self._detect_geographic_bias(references)
        if geo_bias:
            flags.append(geo_bias)
        
        # Recency bias
        recency_bias = self._detect_recency_bias(references)
        if recency_bias:
            flags.append(recency_bias)
        
        # Confirmation bias indicators
        confirmation_bias = self._detect_confirmation_bias(paper_sections)
        if confirmation_bias:
            flags.append(confirmation_bias)
        
        # Language bias
        language_bias = self._detect_language_bias(paper_sections)
        if language_bias:
            flags.append(language_bias)
        
        bias_score = len(flags) * 20  # Each flag adds to bias score
        
        return BiasReport(
            score=min(bias_score, 100),
            flags=flags if flags else ['No significant biases detected']
        )
    
    def _detect_gender_bias(self, references: List[str]) -> str:
        """Detect gender bias in author citations"""
        male_count = 0
        female_count = 0
        
        # This is a simplified heuristic - in production, use a name gender database
        for ref in references[:30]:  # Sample
            ref_lower = ref.lower()
            
            # Count gender indicators in names/text
            if any(indicator in ref_lower for indicator in self.male_indicators):
                male_count += 1
            if any(indicator in ref_lower for indicator in self.female_indicators):
                female_count += 1
        
        total = male_count + female_count
        if total > 10:
            male_percentage = (male_count / total) * 100
            if male_percentage > 75:
                return f'Potential gender bias: Male first authors represent {male_percentage:.0f}% of cited works'
            elif male_percentage < 25:
                return f'Potential gender bias: Female first authors represent {(100-male_percentage):.0f}% of cited works'
        
        return None
    
    def _detect_geographic_bias(self, references: List[str]) -> str:
        """Detect geographic concentration in citations"""
        western_count = 0
        
        for ref in references:
            ref_lower = ref.lower()
            if any(country in ref_lower for country in self.western_countries):
                western_count += 1
        
        if len(references) > 10:
            western_percentage = (western_count / len(references)) * 100
            if western_percentage > 70:
                return f'Geographic bias detected: {western_percentage:.0f}% of citations are from Western institutions'
        
        return None
    
    def _detect_recency_bias(self, references: List[str]) -> str:
        """Detect over-reliance on recent or old papers"""
        years = []
        
        # Extract years from references using regex
        for ref in references:
            year_matches = re.findall(r'\b(19|20)\d{2}\b', ref)
            if year_matches:
                years.extend([int(y) for y in year_matches])
        
        if len(years) > 10:
            recent_years = [y for y in years if y >= 2018]
            old_years = [y for y in years if y < 2010]
            
            recent_percentage = (len(recent_years) / len(years)) * 100
            old_percentage = (len(old_years) / len(years)) * 100
            
            if recent_percentage > 80:
                return f'Recency bias: {recent_percentage:.0f}% of citations are from 2018 or later'
            elif old_percentage > 60:
                return 'Limited citations of foundational works from before 2010'
        
        return None
    
    def _detect_confirmation_bias(self, paper_sections: Dict) -> str:
        """Detect potential confirmation bias indicators"""
        discussion = paper_sections.get('conclusion', '') + paper_sections.get('results', '')
        discussion_lower = discussion.lower()
        
        # Look for one-sided language
        positive_phrases = [
            'supports our hypothesis', 'confirms our', 'as expected',
            'validates our', 'proves that', 'demonstrates that'
        ]
        
        negative_phrases = [
            'contrary to', 'unexpected', 'challenges our',
            'does not support', 'limitations', 'contradicts'
        ]
        
        positive_count = sum(discussion_lower.count(phrase) for phrase in positive_phrases)
        negative_count = sum(discussion_lower.count(phrase) for phrase in negative_phrases)
        
        if positive_count > 5 and negative_count < 2:
            return 'Confirmation bias risk: Results presentation heavily favors supporting evidence'
        
        return None
    
    def _detect_language_bias(self, paper_sections: Dict) -> str:
        """Detect biased or non-inclusive language"""
        full_text = ' '.join([
            paper_sections.get('abstract', ''),
            paper_sections.get('introduction', ''),
            paper_sections.get('methodology', '')
        ]).lower()
        
        # Check for gendered language in neutral contexts
        problematic_phrases = [
            'manpower', 'mankind', 'man-made', 'chairman',
            'he/she', 'his/her'
        ]
        
        found_issues = [phrase for phrase in problematic_phrases if phrase in full_text]
        
        if found_issues:
            return f'Language bias: Non-inclusive terms found: {", ".join(found_issues)}'
        
        return None
