import requests
from bs4 import BeautifulSoup
import json
import csv
import re
import time
from urllib.parse import urljoin
import os

def extract_authors_and_editors(soup):
    """
    Extract authors and editors from the PMC paper
    """
    authors = []
    editors = []
    
    try:
        # Look for author information in the main content area
        # Authors are typically in the main article content, not in navigation
        main_content = soup.find('div', class_='tsec') or soup.find('div', class_='article') or soup.find('main') or soup.find('article')
        
        if main_content:
            # Look for author names in the content - they appear as headings or in specific sections
            # Authors are usually listed after the title and before abstract
            author_elements = main_content.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            
            for element in author_elements:
                text = element.get_text().strip()
                
                # Check if this looks like an author name (not a section title)
                if (len(text) > 5 and len(text) < 100 and 
                    re.match(r'^[A-Za-z\s\.]+$', text) and 
                    ' ' in text and
                    not any(keyword in text.lower() for keyword in 
                           ['abstract', 'introduction', 'method', 'result', 'discussion', 
                            'conclusion', 'reference', 'figure', 'table', 'doi', 'pmc', 
                            'pubmed', 'editor', 'editorial', 'review', 'background', 
                            'objective', 'data', 'analysis', 'findings', 'implications', 
                            'limitations', 'future', 'summary', 'acknowledgment', 'funding'])):
                    
                    # Check if this element has author-like content in siblings
                    next_sibling = element.next_sibling
                    if next_sibling and next_sibling.name:
                        sibling_text = next_sibling.get_text().strip()
                        # If next sibling contains affiliation info, it's likely an author
                        if any(affil in sibling_text.lower() for affil in 
                              ['institute', 'university', 'college', 'center', 'department', 
                               'laboratory', 'hospital', 'school', 'academy', 'research']):
                            if text not in authors:
                                authors.append(text)
        
        # Also look for editors specifically
        # Editors are usually mentioned with "Editor:" or similar
        editor_patterns = [
            r'Editor[^:]*:\s*([^\.]+)',
            r'Edited by[^:]*:\s*([^\.]+)',
            r'Editorial[^:]*:\s*([^\.]+)',
        ]
        
        page_text = soup.get_text()
        for pattern in editor_patterns:
            matches = re.findall(pattern, page_text, re.IGNORECASE)
            for match in matches:
                editor_names = re.split(r'[,;]|\sand\s', match)
                for name in editor_names:
                    name = name.strip()
                    if name and len(name) > 2 and name not in editors:
                        editors.append(name)
        
        # If we still don't have authors, try a different approach
        # Look for text that appears right after the title
        if not authors:
            title_element = soup.find('h1') or soup.find('title')
            if title_element:
                # Look for the next few elements after the title
                current = title_element.next_sibling
                count = 0
                while current and count < 20:  # Look at next 20 elements
                    if current.name and current.name.startswith('h'):
                        text = current.get_text().strip()
                        if (len(text) > 5 and len(text) < 100 and 
                            re.match(r'^[A-Za-z\s\.]+$', text) and 
                            ' ' in text and
                            not any(keyword in text.lower() for keyword in 
                                   ['abstract', 'introduction', 'method', 'result', 'discussion', 
                                    'conclusion', 'reference', 'figure', 'table', 'doi', 'pmc', 
                                    'pubmed', 'editor', 'editorial', 'review', 'background', 
                                    'objective', 'data', 'analysis', 'findings', 'implications', 
                                    'limitations', 'future', 'summary', 'acknowledgment', 'funding'])):
                            
                            # Check if this has affiliation info nearby
                            next_elem = current.next_sibling
                            if next_elem and next_elem.name:
                                next_text = next_elem.get_text().strip()
                                if any(affil in next_text.lower() for affil in 
                                      ['institute', 'university', 'college', 'center', 'department', 
                                       'laboratory', 'hospital', 'school', 'academy', 'research']):
                                    if text not in authors:
                                        authors.append(text)
                    current = current.next_sibling
                    count += 1
        
        # Clean up and limit
        authors = authors[:20]  # Limit to first 20 authors
        editors = editors[:5]   # Limit to first 5 editors
        
    except Exception as e:
        print(f"Error extracting authors and editors: {e}")
    
    return authors, editors

def extract_references(soup):
    """
    Extract reference titles from the PMC paper
    """
    reference_titles = []
    
    try:
        # Look for references section
        # Common patterns for references section
        ref_patterns = [
            r'references?',
            r'literature\s+cited',
            r'bibliography',
            r'works\s+cited',
            r'cited\s+references?'
        ]
        
        # Find references section
        ref_section = None
        for pattern in ref_patterns:
            # Look for headings containing reference keywords
            headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            for heading in headings:
                if re.search(pattern, heading.get_text(), re.IGNORECASE):
                    # Found references heading, get the content
                    ref_section = heading
                    break
            if ref_section:
                break
        
        if ref_section:
            # Extract references from the section
            ref_content = ref_section.find_next(['div', 'section', 'ol', 'ul'])
            if ref_content:
                # Look for individual reference items
                ref_items = ref_content.find_all(['li', 'p', 'div'])
                
                for item in ref_items:
                    ref_text = item.get_text().strip()
                    if ref_text and len(ref_text) > 20:  # Filter out short/empty items
                        # Clean up the reference text
                        ref_text = re.sub(r'\s+', ' ', ref_text)  # Normalize whitespace
                        ref_text = ref_text.replace('\n', ' ').replace('\r', ' ')
                        
                        # Extract title from reference text
                        title = extract_reference_title(ref_text)
                        if title and title not in reference_titles:
                            reference_titles.append(title)
        
        # If no structured references found, look for any citation patterns in the text
        if not reference_titles:
            # Look for DOI patterns throughout the document
            doi_pattern = r'doi[:\s]*([^\s,]+)'
            doi_matches = re.findall(doi_pattern, soup.get_text(), re.IGNORECASE)
            
            for doi in doi_matches[:20]:  # Limit to first 20 DOIs
                reference_titles.append(f"DOI: {doi}")
        
        # Limit references to prevent excessive data
        reference_titles = reference_titles[:100]
        
    except Exception as e:
        print(f"Error extracting references: {e}")
    
    return reference_titles

def extract_reference_title(ref_text):
    """
    Extract the title from a reference text
    """
    try:
        # Look for text in quotes first
        title_match = re.search(r'[""]([^""]+)[""]', ref_text)
        if title_match:
            return title_match.group(1).strip()
        
        # Look for text after authors and before year
        # Pattern: Authors. Title. Year
        title_pattern = r'[A-Z][^\.]*\.\s*([^\.]+\.)\s*\d{4}'
        title_match = re.search(title_pattern, ref_text)
        if title_match:
            return title_match.group(1).strip()
        
        # Look for capitalized text that looks like a title
        # Pattern: sequence of capitalized words
        title_pattern = r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,})'
        title_match = re.search(title_pattern, ref_text)
        if title_match:
            return title_match.group(1).strip()
        
        # If no clear title found, return first 100 characters
        return ref_text[:100].strip()
        
    except Exception as e:
        return ref_text[:100].strip()

def scrape_pmc_paper_content(url, title=""):
    """
    Scrape a PMC paper and extract only title, URL, and references
    """
    try:
        # Set headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Make request to the PMC paper
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Parse HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract main title
        main_title = ""
        title_element = soup.find('h1') or soup.find('title')
        if title_element:
            main_title = title_element.get_text().strip()
        
        # If no title found, use the provided title
        if not main_title and title:
            main_title = title
        
        # Extract references
        references = extract_references(soup)
        
        # Simple structure with only required data
        paper_data = {
            'title': main_title,
            'url': url,
            'references': references  # Now just an array of reference titles
        }
        
        return paper_data
        
    except requests.RequestException as e:
        print(f"Error fetching the page {url}: {e}")
        return None
    except Exception as e:
        print(f"Error parsing the page {url}: {e}")
        return None


def read_urls_from_csv(csv_file):
    """
    Read URLs from the SB_publication_PMC.csv file
    """
    urls = []
    try:
        # Check if file exists
        if not os.path.exists(csv_file):
            print(f"Error: CSV file not found at {csv_file}")
            print(f"Current working directory: {os.getcwd()}")
            print(f"Looking for file: {os.path.abspath(csv_file)}")
            return []
        
        print(f"Reading CSV file: {os.path.abspath(csv_file)}")
        
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            print(f"CSV headers found: {reader.fieldnames}")
            
            for i, row in enumerate(reader, 1):
                if 'Link' in row and row['Link'].strip():
                    urls.append({
                        'title': row.get('Title', '').strip(),
                        'url': row['Link'].strip()
                    })
                elif i <= 5:  # Show first 5 rows for debugging
                    print(f"Row {i}: {row}")
        
        print(f"Loaded {len(urls)} URLs from {csv_file}")
        if len(urls) > 0:
            print(f"First URL example: {urls[0]['url']}")
        return urls
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        print(f"File path attempted: {os.path.abspath(csv_file)}")
        return []

def process_multiple_papers(urls, delay=2, save_interval=10):
    """
    Process multiple papers and collect all results with periodic saving
    """
    all_papers = []
    successful_count = 0
    failed_count = 0
    failed_urls = []
    
    print(f"Processing {len(urls)} papers...")
    print("=" * 80)
    print(f"Progress will be saved every {save_interval} papers")
    print("=" * 80)
    
    for i, url_data in enumerate(urls, 1):
        print(f"\n[{i}/{len(urls)}] Processing: {url_data['title'][:60]}...")
        print(f"URL: {url_data['url']}")
        
        try:
            # Scrape the paper
            paper_data = scrape_pmc_paper_content(url_data['url'], url_data['title'])
            
            if paper_data and paper_data.get('title'):
                all_papers.append(paper_data)
                successful_count += 1
                print(f"[OK] Title: {paper_data['title'][:60]}...")
                
                # Show references if found
                if paper_data.get('references'):
                    ref_count = len(paper_data['references'])
                    print(f"  References: {ref_count} found")
                    
                    # Show first few references
                    for j, ref_title in enumerate(paper_data['references'][:2], 1):
                        print(f"    {j}. {ref_title[:60]}...")
                    
                    if ref_count > 2:
                        print(f"    ... and {ref_count - 2} more references")
                else:
                    print("  References: None found")
            else:
                failed_count += 1
                failed_urls.append(url_data)
                print("[FAIL] No paper data found")
                
        except Exception as e:
            failed_count += 1
            failed_urls.append(url_data)
            print(f"[ERROR] {e}")
        
        # Save progress periodically
        if i % save_interval == 0 and all_papers:
            print(f"\n[SAVE] Saving progress... ({len(all_papers)} papers processed so far)")
            save_papers_to_json(all_papers, f"scraped_papers_progress_{i}.json")
            save_authors_to_csv(all_papers, f"authors_progress_{i}.csv")
        
        # Add delay to be respectful to the server
        if i < len(urls):  # Don't delay after the last URL
            time.sleep(delay)
    
    # Save failed URLs for retry
    if failed_urls:
        save_failed_urls(failed_urls)
    
    print(f"\n" + "=" * 80)
    print(f"Processing complete!")
    print(f"Successful: {successful_count}")
    print(f"Failed: {failed_count}")
    print(f"Total processed: {len(urls)}")
    
    if failed_urls:
        print(f"Failed URLs saved to: failed_urls.json")
    
    return all_papers

def save_failed_urls(failed_urls, filename="failed_urls.json"):
    """
    Save failed URLs for potential retry
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(failed_urls, f, indent=2, ensure_ascii=False)
        print(f"Failed URLs saved to {filename}")
    except Exception as e:
        print(f"Error saving failed URLs: {e}")

def save_papers_to_json(papers, filename="papers_with_references.json"):
    """
    Save all papers to a JSON file with title, URL, and references
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(papers, f, indent=2, ensure_ascii=False)
        print(f"All papers saved to {filename}")
    except Exception as e:
        print(f"Error saving papers to JSON: {e}")

def save_papers_to_csv(papers, filename="papers_with_references.csv"):
    """
    Save papers with references to a CSV file
    """
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['paper_title', 'paper_url', 'reference_count', 'references']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            
            for paper in papers:
                references = paper.get('references', [])
                ref_count = len(references)
                
                # Format references as a readable string
                references_text = ' | '.join(references) if references else 'No references found'
                
                writer.writerow({
                    'paper_title': paper['title'],
                    'paper_url': paper['url'],
                    'reference_count': ref_count,
                    'references': references_text
                })
        
        print(f"Papers with references saved to {filename}")
    except Exception as e:
        print(f"Error saving papers to CSV: {e}")

def save_papers_to_text(papers, filename="papers_with_references.txt"):
    """
    Save papers to a readable text file with title, URL, and references
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            for i, paper in enumerate(papers, 1):
                f.write(f"{'='*80}\n")
                f.write(f"PAPER {i}: {paper['title']}\n")
                f.write(f"URL: {paper['url']}\n")
                
                # Write references
                references = paper.get('references', [])
                f.write(f"REFERENCES ({len(references)} found):\n")
                f.write(f"{'='*80}\n")
                
                if references:
                    for j, ref_title in enumerate(references, 1):
                        f.write(f"\n{j}. {ref_title}\n")
                else:
                    f.write("No references found\n")
                
                f.write(f"\n{'='*80}\n\n")
        
        print(f"Papers saved to {filename}")
    except Exception as e:
        print(f"Error saving papers to text: {e}")


def print_paper_summary(papers):
    """
    Print a summary of all papers
    """
    print(f"\n" + "=" * 80)
    print(f"PAPER SUMMARY:")
    print(f"=" * 80)
    
    for i, paper in enumerate(papers, 1):
        print(f"\n{i}. {paper['title']}")
        print(f"   URL: {paper['url']}")
        
        # Show references
        references = paper.get('references', [])
        print(f"   References: {len(references)} found")
        
        # Show first few references
        for j, ref_title in enumerate(references[:3], 1):
            print(f"     {j}. {ref_title[:60]}...")
        
        if len(references) > 3:
            print(f"     ... and {len(references) - 3} more references")


def estimate_processing_time(num_papers, delay=2):
    """
    Estimate processing time for the given number of papers
    """
    # Rough estimate: 3-5 seconds per paper (including delay + processing)
    time_per_paper = delay + 2  # delay + processing time
    total_seconds = num_papers * time_per_paper
    
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    
    if hours > 0:
        return f"{hours}h {minutes}m {seconds}s"
    elif minutes > 0:
        return f"{minutes}m {seconds}s"
    else:
        return f"{seconds}s"

def main():
    """
    Main function to process all papers
    """
    # Ensure we're in the right directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Script directory: {script_dir}")
    
    # Try different possible locations for the CSV file
    possible_csv_paths = [
        "../SB_publication_PMC.csv",  # One level up from second part
        "../../SB_publication_PMC.csv",  # Two levels up (from Scraping/second part to root)
        "SB_publication_PMC.csv",  # In current directory
        os.path.join(script_dir, "..", "SB_publication_PMC.csv"),  # Relative to script
        os.path.join(script_dir, "..", "..", "SB_publication_PMC.csv")  # From root
    ]
    
    csv_file = None
    for path in possible_csv_paths:
        if os.path.exists(path):
            csv_file = path
            print(f"Found CSV file at: {os.path.abspath(path)}")
            break
    
    if not csv_file:
        print("Error: Could not find SB_publication_PMC.csv file")
        print("Tried the following paths:")
        for path in possible_csv_paths:
            print(f"  - {os.path.abspath(path)}")
        return
    
    urls = read_urls_from_csv(csv_file)
    
    if not urls:
        print("No URLs found in the CSV file. Exiting.")
        return
    
    # Process all papers from the CSV file
    # For testing, limit to first 5 papers
    urls = urls[:5]
    print(f"Processing first {len(urls)} papers for testing...")
    
    # Estimate processing time
    estimated_time = estimate_processing_time(len(urls), delay=2)
    print(f"Estimated processing time for {len(urls)} papers: {estimated_time}")
    print("This is a rough estimate and actual time may vary.")
    
    # Ask for confirmation if processing many papers
    if len(urls) > 10:
        print(f"\nYou are about to process {len(urls)} papers.")
        print("This will take a significant amount of time and make many web requests.")
        print("Progress will be saved every 10 papers.")
        print("Press Ctrl+C to cancel if needed.")
        print("\nStarting in 5 seconds...")
        time.sleep(5)
    
    # Process all papers
    print(f"Processing all {len(urls)} papers...")
    all_papers = process_multiple_papers(urls, delay=2)  # 2 second delay between requests
    
    if all_papers:
        # Save results
        save_papers_to_json(all_papers)
        save_papers_to_csv(all_papers)
        save_papers_to_text(all_papers)
        
        # Print summary
        print_paper_summary(all_papers)
        
        # Print final statistics
        total_references = sum(len(paper.get('references', [])) for paper in all_papers)
        
        print(f"\n" + "=" * 80)
        print(f"FINAL STATISTICS:")
        print(f"Total papers processed: {len(all_papers)}")
        print(f"Total references found: {total_references}")
        print(f"Average references per paper: {total_references / len(all_papers):.1f}")
        print(f"Results saved to: papers_with_references.json, papers_with_references.csv, papers_with_references.txt")
        
        # Create summary report
        create_summary_report(all_papers)
    else:
        print("No papers were successfully scraped.")

def create_summary_report(papers):
    """
    Create a comprehensive summary report
    """
    try:
        with open("processing_summary.txt", 'w', encoding='utf-8') as f:
            f.write("PMC Papers with References Processing Summary Report\n")
            f.write("=" * 60 + "\n\n")
            
            # Basic statistics
            f.write(f"Total papers processed: {len(papers)}\n")
            
            # Reference statistics
            total_references = sum(len(paper.get('references', [])) for paper in papers)
            papers_with_references = sum(1 for paper in papers if paper.get('references'))
            f.write(f"Total references found: {total_references}\n")
            f.write(f"Papers with references: {papers_with_references}/{len(papers)}\n")
            f.write(f"Average references per paper: {total_references / len(papers):.1f}\n\n")
            
            # Reference length statistics
            ref_lengths = []
            for paper in papers:
                for ref_title in paper.get('references', []):
                    ref_lengths.append(len(ref_title))
            
            if ref_lengths:
                avg_length = sum(ref_lengths) / len(ref_lengths)
                min_length = min(ref_lengths)
                max_length = max(ref_lengths)
                
                f.write("Reference title statistics:\n")
                f.write("-" * 30 + "\n")
                f.write(f"Average title length: {avg_length:.1f} characters\n")
                f.write(f"Shortest title: {min_length} characters\n")
                f.write(f"Longest title: {max_length} characters\n\n")
            
            f.write("=" * 60 + "\n")
            f.write("Processing completed successfully!\n")
        
        print("Summary report saved to: processing_summary.txt")
    except Exception as e:
        print(f"Error creating summary report: {e}")

if __name__ == "__main__":
    main()
