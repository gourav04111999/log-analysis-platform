import pdfplumber
import re
from datetime import datetime

LOG_PATTERN = re.compile(
    r"\[?(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2})\]?\s"
    r"(INFO|WARM|ERROR|DEBUG)\s+"
    r"([\w\-]+):\s+(.+)"
)
def parse_pdf_logs(filepath: str) -> list:
    """Extract structured log entries from a PDF file"""
    parsed_logs = []
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            for line in text.splitlines():
                match = LOG_PATTERN.search(line.strip())
                if match:
                    ts, level, service, message = match.groups()
                    parsed_logs.append({
                        "ts": ts,
                        "level": level,
                        "service": service,
                        "message": message.strip(),
                        "source": "pdf"
                    })
    return parsed_logs