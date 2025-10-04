# Semantic Scholar Citation Scraper

This script processes the papers from `SB_publication_PMC.csv` and searches for their citation information on Semantic Scholar.

## Features

- Reads paper titles and URLs from the CSV file
- Searches each paper on Semantic Scholar using the title
- Extracts comprehensive citation information including:
  - Title, authors, year, venue
  - Citation count and influential citation count
  - Open access status and PDF links
  - Abstract and publication details
  - External IDs (DOI, PMID, PMCID)
- Saves results to both CSV and JSON formats
- Includes error handling and retry logic
- Respectful API usage with delays between requests

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Make sure the `SB_publication_PMC.csv` file is in the parent directory
2. Run the script:
```bash
python main.py
```

## Output Files

The script generates two output files:
- `semantic_scholar_citations.csv` - Structured data in CSV format
- `semantic_scholar_citations.json` - Complete data in JSON format

## CSV Output Columns

- `original_title` - Original title from the input CSV
- `original_url` - Original URL from the input CSV
- `semantic_title` - Title found on Semantic Scholar
- `authors` - Author names (formatted)
- `year` - Publication year
- `venue` - Journal or conference name
- `citation_count` - Number of citations
- `influential_citation_count` - Number of influential citations
- `is_open_access` - Whether the paper is open access
- `semantic_url` - URL to the paper on Semantic Scholar
- `abstract` - Paper abstract
- `publication_types` - Types of publication
- `publication_date` - Publication date
- `doi` - Digital Object Identifier
- `pmid` - PubMed ID
- `pmcid` - PubMed Central ID
- `open_access_pdf_url` - Direct link to open access PDF

## Notes

- The script uses a 2-second delay between requests to be respectful to the Semantic Scholar API
- It includes similarity matching to find the best matching paper when multiple results are returned
- Failed searches are logged and included in the final statistics
- The script handles various edge cases and provides detailed progress information
