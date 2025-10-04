import requests
import csv
import json
import time
import re
from urllib.parse import quote
from bs4 import BeautifulSoup

class SemanticScholarSearcher:
    def __init__(self):
        self.base_url = "https://www.semanticscholar.org/api/1/search"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.semanticscholar.org/'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def search_paper(self, title, max_retries=3):
        """
        Search for a paper on Semantic Scholar using its title
        """
        for attempt in range(max_retries):
            try:
                # Clean and prepare the title for search
                clean_title = self.clean_title(title)
                
                # Prepare search parameters
                params = {
                    'query': clean_title,
                    'offset': 0,
                    'limit': 10,
                    'sort': 'relevance',
                    'year': '',
                    'fields': 'title,authors,year,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,url,venue,abstract,publicationTypes,publicationDate,externalIds'
                }
                
                print(f"Searching for: {clean_title[:80]}...")
                
                # Make the API request
                response = self.session.get(self.base_url, params=params, timeout=30)
                response.raise_for_status()
                
                data = response.json()
                
                if 'data' in data and data['data']:
                    # Find the best match
                    best_match = self.find_best_match(data['data'], title)
                    if best_match:
                        return self.extract_citation_info(best_match)
                
                print(f"No results found for: {title[:60]}...")
                return None
                
            except requests.exceptions.RequestException as e:
                print(f"Request error (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    print(f"Failed to search for: {title[:60]}...")
                    return None
            except Exception as e:
                print(f"Unexpected error (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    return None
        
        return None
    
    def clean_title(self, title):
        """
        Clean the title for better search results
        """
        # Remove extra quotes and clean up
        clean_title = title.strip().strip('"').strip("'")
        
        # Remove common prefixes that might interfere with search
        prefixes_to_remove = [
            r'^Title:\s*',
            r'^Paper:\s*',
            r'^Article:\s*'
        ]
        
        for prefix in prefixes_to_remove:
            clean_title = re.sub(prefix, '', clean_title, flags=re.IGNORECASE)
        
        return clean_title
    
    def find_best_match(self, results, original_title):
        """
        Find the best matching paper from search results
        """
        if not results:
            return None
        
        original_clean = self.clean_title(original_title).lower()
        
        # Score each result based on title similarity
        best_score = 0
        best_match = None
        
        for result in results:
            if 'title' not in result:
                continue
                
            result_title = result['title'].lower()
            
            # Calculate similarity score
            score = self.calculate_similarity(original_clean, result_title)
            
            if score > best_score:
                best_score = score
                best_match = result
        
        # Only return if similarity is above threshold
        if best_score > 0.6:  # 60% similarity threshold
            return best_match
        
        return None
    
    def calculate_similarity(self, title1, title2):
        """
        Calculate similarity between two titles
        """
        # Simple word-based similarity
        words1 = set(title1.split())
        words2 = set(title2.split())
        
        if not words1 or not words2:
            return 0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0
    
    def extract_citation_info(self, paper_data):
        """
        Extract citation information from paper data
        """
        try:
            citation_info = {
                'title': paper_data.get('title', ''),
                'authors': self.format_authors(paper_data.get('authors', [])),
                'year': paper_data.get('year', ''),
                'venue': paper_data.get('venue', ''),
                'citation_count': paper_data.get('citationCount', 0),
                'influential_citation_count': paper_data.get('influentialCitationCount', 0),
                'is_open_access': paper_data.get('isOpenAccess', False),
                'url': paper_data.get('url', ''),
                'abstract': paper_data.get('abstract', ''),
                'publication_types': paper_data.get('publicationTypes', []),
                'publication_date': paper_data.get('publicationDate', ''),
                'external_ids': paper_data.get('externalIds', {}),
                'open_access_pdf': paper_data.get('openAccessPdf', {})
            }
            
            return citation_info
            
        except Exception as e:
            print(f"Error extracting citation info: {e}")
            return None
    
    def format_authors(self, authors_list):
        """
        Format authors list into a readable string
        """
        if not authors_list:
            return ""
        
        try:
            author_names = []
            for author in authors_list:
                if isinstance(author, dict):
                    name = author.get('name', '')
                    if name:
                        author_names.append(name)
                elif isinstance(author, str):
                    author_names.append(author)
            
            if len(author_names) <= 3:
                return ", ".join(author_names)
            else:
                return ", ".join(author_names[:3]) + f" et al. ({len(author_names)} authors)"
                
        except Exception as e:
            print(f"Error formatting authors: {e}")
            return str(authors_list) if authors_list else ""

def read_csv_file(csv_file_path):
    """
    Read the CSV file and extract titles and URLs
    """
    papers = []
    try:
        with open(csv_file_path, 'r', encoding='utf-8-sig') as file:  # Use utf-8-sig to handle BOM
            reader = csv.DictReader(file)
            for row in reader:
                # Handle both 'Title' and '\ufeffTitle' (BOM issue)
                title_key = 'Title' if 'Title' in row else '\ufeffTitle'
                if title_key in row and 'Link' in row:
                    papers.append({
                        'title': row[title_key].strip(),
                        'url': row['Link'].strip()
                    })
        print(f"Loaded {len(papers)} papers from {csv_file_path}")
        return papers
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return []

def save_results_to_csv(results, filename="semantic_scholar_citations.csv"):
    """
    Save citation results to CSV file
    """
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = [
                'original_title', 'original_url', 'semantic_title', 'authors', 'year', 
                'venue', 'citation_count', 'influential_citation_count', 'is_open_access',
                'semantic_url', 'abstract', 'publication_types', 'publication_date',
                'doi', 'pmid', 'pmcid', 'open_access_pdf_url'
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for result in results:
                writer.writerow({
                    'original_title': result.get('original_title', ''),
                    'original_url': result.get('original_url', ''),
                    'semantic_title': result.get('semantic_title', ''),
                    'authors': result.get('authors', ''),
                    'year': result.get('year', ''),
                    'venue': result.get('venue', ''),
                    'citation_count': result.get('citation_count', 0),
                    'influential_citation_count': result.get('influential_citation_count', 0),
                    'is_open_access': result.get('is_open_access', False),
                    'semantic_url': result.get('semantic_url', ''),
                    'abstract': result.get('abstract', ''),
                    'publication_types': ', '.join(result.get('publication_types', [])),
                    'publication_date': result.get('publication_date', ''),
                    'doi': result.get('doi', ''),
                    'pmid': result.get('pmid', ''),
                    'pmcid': result.get('pmcid', ''),
                    'open_access_pdf_url': result.get('open_access_pdf_url', '')
                })
        print(f"Results saved to {filename}")
    except Exception as e:
        print(f"Error saving to CSV: {e}")

def save_results_to_json(results, filename="semantic_scholar_citations.json"):
    """
    Save citation results to JSON file
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"Results saved to {filename}")
    except Exception as e:
        print(f"Error saving to JSON: {e}")

def process_papers(papers, delay=2):
    """
    Process all papers and search for citations
    """
    searcher = SemanticScholarSearcher()
    results = []
    successful_searches = 0
    failed_searches = 0
    
    print(f"Processing {len(papers)} papers...")
    print("=" * 80)
    
    for i, paper in enumerate(papers, 1):
        print(f"\n[{i}/{len(papers)}] Processing: {paper['title'][:60]}...")
        
        try:
            # Search for the paper on Semantic Scholar
            citation_info = searcher.search_paper(paper['title'])
            
            if citation_info:
                # Combine original paper info with citation info
                result = {
                    'original_title': paper['title'],
                    'original_url': paper['url'],
                    'semantic_title': citation_info.get('title', ''),
                    'authors': citation_info.get('authors', ''),
                    'year': citation_info.get('year', ''),
                    'venue': citation_info.get('venue', ''),
                    'citation_count': citation_info.get('citation_count', 0),
                    'influential_citation_count': citation_info.get('influential_citation_count', 0),
                    'is_open_access': citation_info.get('is_open_access', False),
                    'semantic_url': citation_info.get('url', ''),
                    'abstract': citation_info.get('abstract', ''),
                    'publication_types': citation_info.get('publication_types', []),
                    'publication_date': citation_info.get('publication_date', ''),
                    'doi': citation_info.get('external_ids', {}).get('DOI', ''),
                    'pmid': citation_info.get('external_ids', {}).get('PubMed', ''),
                    'pmcid': citation_info.get('external_ids', {}).get('PubMedCentral', ''),
                    'open_access_pdf_url': citation_info.get('open_access_pdf', {}).get('url', '')
                }
                
                results.append(result)
                successful_searches += 1
                
                print(f"[SUCCESS] Found citation data:")
                print(f"  Title: {citation_info.get('title', 'N/A')[:60]}...")
                print(f"  Authors: {citation_info.get('authors', 'N/A')[:60]}...")
                print(f"  Year: {citation_info.get('year', 'N/A')}")
                print(f"  Citations: {citation_info.get('citation_count', 0)}")
                print(f"  Venue: {citation_info.get('venue', 'N/A')[:40]}...")
            else:
                failed_searches += 1
                print(f"[FAILED] No citation data found")
                
        except Exception as e:
            failed_searches += 1
            print(f"[ERROR] {e}")
        
        # Add delay to be respectful to the API
        if i < len(papers):
            time.sleep(delay)
    
    print(f"\n" + "=" * 80)
    print(f"Processing complete!")
    print(f"Successful searches: {successful_searches}")
    print(f"Failed searches: {failed_searches}")
    print(f"Total papers: {len(papers)}")
    
    return results

def main():
    # Path to the CSV file
    csv_file_path = "../SB_publication_PMC.csv"
    
    # Read papers from CSV
    papers = read_csv_file(csv_file_path)
    
    if not papers:
        print("No papers found in the CSV file. Exiting.")
        return
    
    # Process all papers
    results = process_papers(papers, delay=2)  # 2 second delay between requests
    
    if results:
        # Save results
        save_results_to_csv(results)
        save_results_to_json(results)
        
        # Print summary
        total_citations = sum(result.get('citation_count', 0) for result in results)
        avg_citations = total_citations / len(results) if results else 0
        
        print(f"\n" + "=" * 80)
        print(f"SUMMARY:")
        print(f"Total papers processed: {len(papers)}")
        print(f"Papers with citation data: {len(results)}")
        print(f"Success rate: {len(results)/len(papers)*100:.1f}%")
        print(f"Total citations found: {total_citations}")
        print(f"Average citations per paper: {avg_citations:.1f}")
        print(f"Results saved to: semantic_scholar_citations.csv and semantic_scholar_citations.json")
    else:
        print("No citation data was found for any of the papers.")

if __name__ == "__main__":
    main()
