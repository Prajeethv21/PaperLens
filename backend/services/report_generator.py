from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.colors import HexColor
from models.schemas import ReviewReport
from io import BytesIO

class ReportGenerator:
    """Generate PDF reports from review data"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=HexColor('#00f0ff'),
            spaceAfter=30,
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionTitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=HexColor('#a855f7'),
            spaceAfter=12,
        ))
        
        self.styles.add(ParagraphStyle(
            name='Score',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=HexColor('#00f0ff'),
            spaceAfter=10,
        ))
    
    def generate_pdf_report(self, report: ReviewReport, paper_name: str) -> BytesIO:
        """Generate PDF report and return as BytesIO"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        story = []
        
        # Title
        title = Paragraph(
            f"AI Research Review Report<br/>{paper_name}",
            self.styles['CustomTitle']
        )
        story.append(title)
        story.append(Spacer(1, 0.3*inch))
        
        # Overall Score
        overall_score = round(
            (report.novelty.score + report.methodology.score + 
             report.clarity.score + report.citations.score) / 4
        )
        
        overall = Paragraph(
            f"<b>Overall Score: {overall_score}/100</b>",
            self.styles['Score']
        )
        story.append(overall)
        story.append(Spacer(1, 0.5*inch))
        
        # Novelty Section
        story.append(Paragraph("1. Novelty & Originality", self.styles['SectionTitle']))
        story.append(Paragraph(f"<b>Score: {report.novelty.score}/100</b>", self.styles['Score']))
        story.append(Paragraph(report.novelty.explanation, self.styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Methodology Section
        story.append(Paragraph("2. Methodology Soundness", self.styles['SectionTitle']))
        story.append(Paragraph(f"<b>Score: {report.methodology.score}/100</b>", self.styles['Score']))
        story.append(Paragraph(report.methodology.explanation, self.styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Clarity Section
        story.append(Paragraph("3. Clarity & Structure", self.styles['SectionTitle']))
        story.append(Paragraph(f"<b>Score: {report.clarity.score}/100</b>", self.styles['Score']))
        story.append(Paragraph(report.clarity.explanation, self.styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Citations Section
        story.append(Paragraph("4. Citation Quality", self.styles['SectionTitle']))
        story.append(Paragraph(f"<b>Score: {report.citations.score}/100</b>", self.styles['Score']))
        story.append(Paragraph(report.citations.explanation, self.styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Bias Section
        if report.bias.flags:
            story.append(PageBreak())
            story.append(Paragraph("5. Bias Detection", self.styles['SectionTitle']))
            story.append(Paragraph(f"<b>Bias Score: {report.bias.score}/100</b>", self.styles['Score']))
            
            for flag in report.bias.flags:
                story.append(Paragraph(f"• {flag}", self.styles['Normal']))
                story.append(Spacer(1, 0.1*inch))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def generate_json_report(self, report: ReviewReport) -> dict:
        """Generate JSON report"""
        return report.dict()
