# PMC Paper Scraper - Hierarchical Content Extraction

This script (`main2.py`) scrapes PMC (PubMed Central) papers and extracts their content in a hierarchical structure based on headings and sections.

## Features

- **Hierarchical Structure**: Organizes paper content by title, sections, and subsections
- **Multiple Output Formats**: JSON, CSV, and readable text files
- **Batch Processing**: Processes multiple papers from a CSV file
- **Content Extraction**: Extracts full text content, not just navigation
- **Error Handling**: Robust error handling for network and parsing issues

## Files

- `main2.py` - Main scraper script
- `SB_publication_PMC.csv` - Input file with paper titles and URLs
- `test_scraper.py` - Test script to demonstrate functionality

## Usage

### Basic Usage

```bash
python main2.py
```

This will:
1. Read URLs from `SB_publication_PMC.csv`
2. Process the first 1 paper (for demonstration)
3. Save results to multiple formats

### Processing All Papers

To process all papers, edit `main2.py` and comment out or remove this line:
```python
urls = urls[:1]  # Remove this line to process all papers
```

### Output Files

The script creates three output files:

1. **`scraped_papers.json`** - Complete hierarchical structure in JSON format
2. **`scraped_papers.csv`** - Flattened structure in CSV format
3. **`scraped_papers.txt`** - Human-readable text format with proper indentation

## Data Structure

### JSON Structure
```json
[
  {
    "title": "Paper Title",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC1234567",
    "sections": [
      {
        "level": 1,
        "title": "Abstract",
        "content": "Abstract content...",
        "subsections": []
      },
      {
        "level": 1,
        "title": "Introduction",
        "content": "Introduction content...",
        "subsections": [
          {
            "level": 2,
            "title": "Background",
            "content": "Background content...",
            "subsections": []
          }
        ]
      }
    ]
  }
]
```

### CSV Structure
- `paper_title` - Title of the paper
- `paper_url` - URL of the paper
- `section_level` - Hierarchical level (1, 2, 3, etc.)
- `section_title` - Title of the section
- `section_content` - Content of the section (truncated to 1000 chars)
- `parent_section` - Title of parent section

## Configuration

### Delay Between Requests
```python
all_papers = process_multiple_papers(urls, delay=2)  # 2 second delay
```

### Number of Papers to Process
```python
urls = urls[:5]  # Process first 5 papers
```

## Error Handling

The script includes comprehensive error handling:
- Network request failures
- HTML parsing errors
- Missing content sections
- File I/O errors

## Requirements

- Python 3.6+
- requests
- beautifulsoup4

Install requirements:
```bash
pip install requests beautifulsoup4
```

## Example Output

### Text Format
```
================================================================================
PAPER 1: Mice in Bion-M 1 Space Mission: Training and Selection
URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC4136787
================================================================================

Abstract
========
After a 16-year hiatus, Russia has resumed its program of biomedical research...

Introduction
============
The aim of mice experiments in the Bion-M 1 project was to elucidate cellular...

  Background
  ==========
  Previous studies have shown that...

  Objectives
  ==========
  The primary objectives of this study were to...
```

## Notes

- The script respects server resources with configurable delays
- Content is cleaned and formatted for readability
- Tables and figures are handled appropriately
- The hierarchical structure preserves the original document organization
- Large content sections are truncated in CSV output for readability

## Troubleshooting

1. **No content found**: Check if the URL is accessible and the page structure hasn't changed
2. **Network errors**: Increase the delay between requests
3. **Parsing errors**: The page structure might be different than expected
4. **Memory issues**: Process fewer papers at a time for large datasets
