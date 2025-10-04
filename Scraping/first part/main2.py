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

def scrape_pmc_paper_content(url, title=""):
    """
    Scrape a PMC paper and extract the full hierarchical content structure
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
        
        # Extract authors and editors
        authors, editors = extract_authors_and_editors(soup)
        
        # Initialize the hierarchical structure
        paper_structure = {
            'title': main_title,
            'url': url,
            'authors': authors,
            'editors': editors,
            'sections': []
        }
        
        # Find the main content area
        main_content = soup.find('div', class_='tsec') or soup.find('div', class_='article') or soup.find('main') or soup.find('article')
        
        if not main_content:
            # Fallback: look for content in the body
            main_content = soup.find('body')
        
        if not main_content:
            print(f"No main content found for {url}")
            return paper_structure
        
        # Extract hierarchical sections
        sections = extract_hierarchical_sections(main_content)
        paper_structure['sections'] = sections
        
        return paper_structure
        
    except requests.RequestException as e:
        print(f"Error fetching the page {url}: {e}")
        return None
    except Exception as e:
        print(f"Error parsing the page {url}: {e}")
        return None

def extract_hierarchical_sections(content_element):
    """
    Extract hierarchical sections from the content element
    """
    sections = []
    
    # Find all headings and their content
    headings = content_element.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
    
    for i, heading in enumerate(headings):
        section_data = {
            'level': int(heading.name[1]),  # h1=1, h2=2, etc.
            'title': heading.get_text().strip(),
            'content': '',
            'subsections': []
        }
        
        # Get content until the next heading of same or higher level
        content_parts = []
        current_element = heading.next_sibling
        
        while current_element:
            if current_element.name and current_element.name.startswith('h'):
                # Check if this is a heading of same or higher level
                if int(current_element.name[1]) <= section_data['level']:
                    break
            
            if current_element.name:
                # Extract text content from this element
                text_content = extract_text_from_element(current_element)
                if text_content.strip():
                    content_parts.append(text_content)
            
            current_element = current_element.next_sibling
        
        # Join all content parts
        section_data['content'] = '\n\n'.join(content_parts)
        
        # Clean up the content
        section_data['content'] = clean_text(section_data['content'])
        
        sections.append(section_data)
    
    # Organize sections hierarchically
    return organize_sections_hierarchically(sections)

def extract_text_from_element(element):
    """
    Extract text content from an element, preserving structure
    """
    if not element:
        return ""
    
    # Handle different types of elements
    if element.name in ['p', 'div', 'span']:
        return element.get_text(separator=' ', strip=True)
    elif element.name in ['ul', 'ol']:
        # Handle lists
        items = []
        for li in element.find_all('li'):
            items.append(f"• {li.get_text(strip=True)}")
        return '\n'.join(items)
    elif element.name in ['table']:
        # Handle tables
        return extract_table_content(element)
    elif element.name in ['figure', 'fig']:
        # Handle figures
        caption = element.find('figcaption') or element.find('caption')
        if caption:
            return f"[Figure: {caption.get_text(strip=True)}]"
        return "[Figure]"
    else:
        return element.get_text(separator=' ', strip=True)

def extract_table_content(table):
    """
    Extract content from a table
    """
    rows = []
    for tr in table.find_all('tr'):
        cells = []
        for td in tr.find_all(['td', 'th']):
            cells.append(td.get_text(strip=True))
        if cells:
            rows.append(' | '.join(cells))
    return '\n'.join(rows)

def clean_text(text):
    """
    Clean and format text content
    """
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters that might cause issues
    text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)\[\]\{\}\"\'\/\\]', '', text)
    
    # Clean up multiple newlines
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    
    return text.strip()

def organize_sections_hierarchically(sections):
    """
    Organize sections into a proper hierarchy
    """
    if not sections:
        return []
    
    # Sort sections by their position in the document
    organized = []
    stack = []  # Stack to track parent sections
    
    for section in sections:
        # Pop sections from stack that are at same or higher level
        while stack and stack[-1]['level'] >= section['level']:
            stack.pop()
        
        # Add to appropriate parent
        if stack:
            # Add as subsection to the top of stack
            stack[-1]['subsections'].append(section)
        else:
            # Top-level section
            organized.append(section)
        
        # Push current section to stack
        stack.append(section)
    
    return organized

def read_urls_from_csv(csv_file):
    """
    Read URLs from the SB_publication_PMC.csv file
    """
    urls = []
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if 'Link' in row and row['Link'].strip():
                    urls.append({
                        'title': row.get('Title', '').strip(),
                        'url': row['Link'].strip()
                    })
        print(f"Loaded {len(urls)} URLs from {csv_file}")
        return urls
    except Exception as e:
        print(f"Error reading CSV file: {e}")
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
            
            if paper_data and paper_data['sections']:
                all_papers.append(paper_data)
                successful_count += 1
                print(f"[OK] Found {len(paper_data['sections'])} main sections")
                
                # Show authors if found
                if paper_data.get('authors'):
                    authors_preview = ', '.join(paper_data['authors'][:2])
                    if len(paper_data['authors']) > 2:
                        authors_preview += f" and {len(paper_data['authors']) - 2} more"
                    print(f"  Authors: {authors_preview}")
                
                # Show editors if found
                if paper_data.get('editors'):
                    editors_preview = ', '.join(paper_data['editors'][:2])
                    if len(paper_data['editors']) > 2:
                        editors_preview += f" and {len(paper_data['editors']) - 2} more"
                    print(f"  Editors: {editors_preview}")
                
                # Display first few sections
                for j, section in enumerate(paper_data['sections'][:2], 1):
                    print(f"  {j}. {section['title']} (Level {section['level']})")
                if len(paper_data['sections']) > 2:
                    print(f"  ... and {len(paper_data['sections']) - 2} more")
            else:
                failed_count += 1
                failed_urls.append(url_data)
                print("[FAIL] No content sections found")
                
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

def save_papers_to_json(papers, filename="scraped_papers.json"):
    """
    Save all papers to a JSON file with hierarchical structure
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(papers, f, indent=2, ensure_ascii=False)
        print(f"All papers saved to {filename}")
    except Exception as e:
        print(f"Error saving papers to JSON: {e}")

def save_authors_to_csv(papers, filename="authors_and_editors.csv"):
    """
    Save authors and editors information to a separate CSV file
    """
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['paper_title', 'paper_url', 'authors', 'author_count', 'editors', 'editor_count']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            
            for paper in papers:
                authors = paper.get('authors', [])
                editors = paper.get('editors', [])
                authors_str = ', '.join(authors) if authors else 'Not found'
                editors_str = ', '.join(editors) if editors else 'Not found'
                
                writer.writerow({
                    'paper_title': paper['title'],
                    'paper_url': paper['url'],
                    'authors': authors_str,
                    'author_count': len(authors),
                    'editors': editors_str,
                    'editor_count': len(editors)
                })
        
        print(f"Authors and editors data saved to {filename}")
    except Exception as e:
        print(f"Error saving authors and editors to CSV: {e}")

def save_papers_to_text(papers, filename="scraped_papers.txt"):
    """
    Save papers to a readable text file with hierarchical structure
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            for i, paper in enumerate(papers, 1):
                f.write(f"{'='*80}\n")
                f.write(f"PAPER {i}: {paper['title']}\n")
                f.write(f"URL: {paper['url']}\n")
                
                # Write authors separately
                if paper.get('authors'):
                    f.write(f"AUTHORS: {', '.join(paper['authors'])}\n")
                else:
                    f.write("AUTHORS: Not found\n")
                
                # Write editors separately
                if paper.get('editors'):
                    f.write(f"EDITORS: {', '.join(paper['editors'])}\n")
                else:
                    f.write("EDITORS: Not found\n")
                
                f.write(f"{'='*80}\n\n")
                
                # Write sections recursively
                write_sections_to_text(f, paper['sections'], 0)
                f.write("\n\n")
        
        print(f"Papers saved to {filename}")
    except Exception as e:
        print(f"Error saving papers to text: {e}")

def write_sections_to_text(file, sections, indent_level):
    """
    Recursively write sections to text file with proper indentation
    """
    for section in sections:
        indent = "  " * indent_level
        file.write(f"{indent}{section['title']}\n")
        file.write(f"{indent}{'='*len(section['title'])}\n")
        
        if section['content']:
            # Add content with proper indentation
            content_lines = section['content'].split('\n')
            for line in content_lines:
                if line.strip():
                    file.write(f"{indent}{line.strip()}\n")
            file.write("\n")
        
        # Write subsections
        if section['subsections']:
            write_sections_to_text(file, section['subsections'], indent_level + 1)

def save_papers_to_csv(papers, filename="scraped_papers.csv"):
    """
    Save papers to a CSV file (flattened structure)
    """
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['paper_title', 'paper_url', 'authors', 'editors', 'section_level', 'section_title', 'section_content', 'parent_section']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            
            for paper in papers:
                # Write paper info row (without section data)
                authors_str = ', '.join(paper.get('authors', [])) if paper.get('authors') else 'Not found'
                editors_str = ', '.join(paper.get('editors', [])) if paper.get('editors') else 'Not found'
                writer.writerow({
                    'paper_title': paper['title'],
                    'paper_url': paper['url'],
                    'authors': authors_str,
                    'editors': editors_str,
                    'section_level': '',
                    'section_title': '',
                    'section_content': '',
                    'parent_section': ''
                })
                
                # Write sections
                for section in paper['sections']:
                    # Write main section
                    writer.writerow({
                        'paper_title': paper['title'],
                        'paper_url': paper['url'],
                        'authors': authors_str,
                        'editors': editors_str,
                        'section_level': section['level'],
                        'section_title': section['title'],
                        'section_content': section['content'][:1000] + '...' if len(section['content']) > 1000 else section['content'],
                        'parent_section': ''
                    })
                    
                    # Write subsections recursively
                    write_subsections_to_csv(writer, paper, section, '', authors_str, editors_str)
        
        print(f"Papers saved to {filename}")
    except Exception as e:
        print(f"Error saving papers to CSV: {e}")

def write_subsections_to_csv(writer, paper, section, parent_title, authors_str, editors_str):
    """
    Recursively write subsections to CSV
    """
    for subsection in section['subsections']:
        writer.writerow({
            'paper_title': paper['title'],
            'paper_url': paper['url'],
            'authors': authors_str,
            'editors': editors_str,
            'section_level': subsection['level'],
            'section_title': subsection['title'],
            'section_content': subsection['content'][:1000] + '...' if len(subsection['content']) > 1000 else subsection['content'],
            'parent_section': parent_title
        })
        
        # Recursively write deeper subsections
        write_subsections_to_csv(writer, paper, subsection, subsection['title'], authors_str, editors_str)

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
        
        # Show authors
        if paper.get('authors'):
            authors_str = ', '.join(paper['authors'][:3])  # Show first 3 authors
            if len(paper['authors']) > 3:
                authors_str += f" and {len(paper['authors']) - 3} more"
            print(f"   Authors: {authors_str}")
        else:
            print(f"   Authors: Not found")
        
        # Show editors
        if paper.get('editors'):
            editors_str = ', '.join(paper['editors'][:2])  # Show first 2 editors
            if len(paper['editors']) > 2:
                editors_str += f" and {len(paper['editors']) - 2} more"
            print(f"   Editors: {editors_str}")
        else:
            print(f"   Editors: Not found")
        
        print(f"   Sections: {len(paper['sections'])}")
        
        # Count total subsections
        total_subsections = count_subsections(paper['sections'])
        print(f"   Total subsections: {total_subsections}")
        
        # Show first few sections
        for j, section in enumerate(paper['sections'][:3], 1):
            print(f"   {j}. {section['title']} (Level {section['level']})")
        if len(paper['sections']) > 3:
            print(f"   ... and {len(paper['sections']) - 3} more")

def count_subsections(sections):
    """
    Count total number of subsections recursively
    """
    count = 0
    for section in sections:
        count += 1
        count += count_subsections(section['subsections'])
    return count

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
    # Read URLs from CSV file
    csv_file = "SB_publication_PMC.csv"
    urls = read_urls_from_csv(csv_file)
    
    if not urls:
        print("No URLs found in the CSV file. Exiting.")
        return
    
    # Process all papers from the CSV file
    # To limit papers for testing, uncomment and modify the line below:
    urls = urls[:5]  # Process only first 5 papers
    
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
        save_authors_to_csv(all_papers)
        
        # Print summary
        print_paper_summary(all_papers)
        
        # Print final statistics
        total_sections = sum(len(paper['sections']) for paper in all_papers)
        total_subsections = sum(count_subsections(paper['sections']) for paper in all_papers)
        
        print(f"\n" + "=" * 80)
        print(f"FINAL STATISTICS:")
        print(f"Total papers processed: {len(all_papers)}")
        print(f"Total main sections: {total_sections}")
        print(f"Total subsections: {total_subsections}")
        print(f"Average sections per paper: {total_sections / len(all_papers):.1f}")
        print(f"Results saved to: scraped_papers.json, scraped_papers.csv, scraped_papers.txt, and authors_and_editors.csv")
        
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
            f.write("PMC Papers Processing Summary Report\n")
            f.write("=" * 50 + "\n\n")
            
            # Basic statistics
            f.write(f"Total papers processed: {len(papers)}\n")
            
            # Count sections and subsections
            total_sections = sum(len(paper['sections']) for paper in papers)
            total_subsections = sum(count_subsections(paper['sections']) for paper in papers)
            f.write(f"Total main sections: {total_sections}\n")
            f.write(f"Total subsections: {total_subsections}\n")
            f.write(f"Average sections per paper: {total_sections / len(papers):.1f}\n\n")
            
            # Author statistics
            papers_with_authors = sum(1 for paper in papers if paper.get('authors'))
            total_authors = sum(len(paper.get('authors', [])) for paper in papers)
            f.write(f"Papers with authors found: {papers_with_authors}/{len(papers)}\n")
            f.write(f"Total authors found: {total_authors}\n")
            f.write(f"Average authors per paper: {total_authors / len(papers):.1f}\n\n")
            
            # Editor statistics
            papers_with_editors = sum(1 for paper in papers if paper.get('editors'))
            total_editors = sum(len(paper.get('editors', [])) for paper in papers)
            f.write(f"Papers with editors found: {papers_with_editors}/{len(papers)}\n")
            f.write(f"Total editors found: {total_editors}\n")
            f.write(f"Average editors per paper: {total_editors / len(papers):.1f}\n\n")
            
            # Most common section types
            section_types = {}
            for paper in papers:
                for section in paper['sections']:
                    section_type = section['title'].lower()
                    section_types[section_type] = section_types.get(section_type, 0) + 1
            
            f.write("Most common section types:\n")
            f.write("-" * 30 + "\n")
            sorted_sections = sorted(section_types.items(), key=lambda x: x[1], reverse=True)
            for section_type, count in sorted_sections[:10]:
                f.write(f"{section_type}: {count} papers\n")
            
            f.write("\n" + "=" * 50 + "\n")
            f.write("Processing completed successfully!\n")
        
        print("Summary report saved to: processing_summary.txt")
    except Exception as e:
        print(f"Error creating summary report: {e}")

if __name__ == "__main__":
    main()
