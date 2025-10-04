import requests
from bs4 import BeautifulSoup
import json
import csv
import re
import time
from urllib.parse import urljoin

def scrape_pmc_paper_on_this_page(url):
    """
    Scrape a PMC paper and extract the 'ON THIS PAGE' navigation section
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
        
        # Extract page title
        page_title = ""
        title_element = soup.find('h1') or soup.find('title')
        if title_element:
            page_title = title_element.get_text().strip()
        
        # Extract "ON THIS PAGE" items by finding actual section headings in the content
        on_this_page_items = []
        
        # Look for section headings in the main content
        # Common patterns for section headings in PMC articles
        section_patterns = [
            # Main sections
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            # Sections with specific classes
            'section[class*="abstract"]',
            'section[class*="introduction"]', 
            'section[class*="method"]',
            'section[class*="result"]',
            'section[class*="discussion"]',
            'section[class*="conclusion"]',
            'section[class*="reference"]',
            'section[class*="acknowledgment"]',
            # Divs with section classes
            'div[class*="abstract"]',
            'div[class*="introduction"]',
            'div[class*="method"]', 
            'div[class*="result"]',
            'div[class*="discussion"]',
            'div[class*="conclusion"]',
            'div[class*="reference"]',
            'div[class*="acknowledgment"]'`
        ]
        
        found_sections = set()
        
        for pattern in section_patterns:
            elements = soup.select(pattern)
            for element in elements:
                # Get the text content
                text = element.get_text().strip()
                
                # Look for section titles within the element
                # Check if this element has a heading child
                heading = element.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                if heading:
                    section_title = heading.get_text().strip()
                    if section_title and section_title not in found_sections:
                        found_sections.add(section_title)
                        # Try to find a link to this section
                        section_id = element.get('id', '')
                        link = f"#{section_id}" if section_id else ''
                        on_this_page_items.append({
                            'text': section_title,
                            'link': link
                        })
                else:
                    # If no heading child, check if the element text itself looks like a section title
                    if len(text) < 100 and any(keyword in text.lower() for keyword in ['abstract', 'introduction', 'method', 'result', 'discussion', 'conclusion', 'reference', 'acknowledgment', 'figure', 'table']):
                        if text not in found_sections:
                            found_sections.add(text)
                            section_id = element.get('id', '')
                            link = f"#{section_id}" if section_id else ''
                            on_this_page_items.append({
                                'text': text,
                                'link': link
                            })
        
        # Also look for any headings that might be section titles
        for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            text = heading.get_text().strip()
            if text and text not in found_sections:
                # Check if this looks like a section title
                if any(keyword in text.lower() for keyword in ['abstract', 'introduction', 'method', 'result', 'discussion', 'conclusion', 'reference', 'acknowledgment', 'figure', 'table', 'background', 'objective', 'data', 'analysis', 'findings', 'implications', 'limitations', 'future', 'summary']):
                    found_sections.add(text)
                    # Try to find the parent section's ID
                    parent_section = heading.find_parent(['section', 'div'])
                    section_id = parent_section.get('id', '') if parent_section else ''
                    link = f"#{section_id}" if section_id else ''
                    on_this_page_items.append({
                        'text': text,
                        'link': link
                    })
        
        # Remove duplicates while preserving order
        seen = set()
        unique_items = []
        for item in on_this_page_items:
            text_key = item['text'].lower().strip()
            if text_key not in seen and text_key:
                seen.add(text_key)
                unique_items.append(item)
        
        on_this_page_items = unique_items
        
        # If still no items found, try to find common section headings as fallback
        if not on_this_page_items:
            common_sections = ['Abstract', 'Introduction', 'Materials and Methods', 'Results', 'Discussion', 'Conclusions', 'Acknowledgments', 'References']
            for section in common_sections:
                # Look for these sections in the page
                section_element = soup.find(['h1', 'h2', 'h3'], string=re.compile(section, re.IGNORECASE))
                if section_element:
                    on_this_page_items.append({
                        'text': section,
                        'link': ''
                    })
        
        return {
            'page_title': page_title,
            'page_url': url,
            'on_this_page_items': on_this_page_items
        }
        
    except requests.RequestException as e:
        print(f"Error fetching the page: {e}")
        return None
    except Exception as e:
        print(f"Error parsing the page: {e}")
        return None

def save_to_csv(data, filename="pmc_on_this_page.csv"):
    """
    Save extracted 'ON THIS PAGE' data to a CSV file
    """
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['page_title', 'page_url', 'section_name', 'section_link']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for item in data['on_this_page_items']:
                writer.writerow({
                    'page_title': data['page_title'],
                    'page_url': data['page_url'],
                    'section_name': item['text'],
                    'section_link': item['link']
                })
        print(f"Data saved to {filename}")
    except Exception as e:
        print(f"Error saving to CSV: {e}")

def save_to_json(data, filename="pmc_on_this_page.json"):
    """
    Save extracted data to a JSON file
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Data saved to {filename}")
    except Exception as e:
        print(f"Error saving to JSON: {e}")

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

def process_multiple_urls(urls, delay=1):
    """
    Process multiple URLs and collect all results
    """
    all_results = []
    successful_count = 0
    failed_count = 0
    
    print(f"Processing {len(urls)} URLs...")
    print("=" * 80)
    
    for i, url_data in enumerate(urls, 1):
        print(f"\n[{i}/{len(urls)}] Processing: {url_data['title'][:60]}...")
        print(f"URL: {url_data['url']}")
        
        try:
            # Scrape the paper
            data = scrape_pmc_paper_on_this_page(url_data['url'])
            
            if data and data['on_this_page_items']:
                # Add the original title from CSV if available
                if url_data['title']:
                    data['original_title'] = url_data['title']
                
                all_results.append(data)
                successful_count += 1
                print(f"[OK] Found {len(data['on_this_page_items'])} 'ON THIS PAGE' items")
                
                # Display first few items
                for j, item in enumerate(data['on_this_page_items'][:3], 1):
                    print(f"  {j}. {item['text']}")
                if len(data['on_this_page_items']) > 3:
                    print(f"  ... and {len(data['on_this_page_items']) - 3} more")
            else:
                failed_count += 1
                print("[FAIL] No 'ON THIS PAGE' items found")
                
        except Exception as e:
            failed_count += 1
            print(f"[ERROR] {e}")
        
        # Add delay to be respectful to the server
        if i < len(urls):  # Don't delay after the last URL
            time.sleep(delay)
    
    print(f"\n" + "=" * 80)
    print(f"Processing complete!")
    print(f"Successful: {successful_count}")
    print(f"Failed: {failed_count}")
    print(f"Total processed: {len(urls)}")
    
    return all_results

def save_all_results_to_csv(all_results, filename="all_pmc_on_this_page.csv"):
    """
    Save all extracted data to a single CSV file
    """
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['page_title', 'original_title', 'page_url', 'section_name', 'section_link']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for data in all_results:
                for item in data['on_this_page_items']:
                    writer.writerow({
                        'page_title': data['page_title'],
                        'original_title': data.get('original_title', ''),
                        'page_url': data['page_url'],
                        'section_name': item['text'],
                        'section_link': item['link']
                    })
        print(f"All results saved to {filename}")
    except Exception as e:
        print(f"Error saving all results to CSV: {e}")

def save_all_results_to_json(all_results, filename="all_pmc_on_this_page.json"):
    """
    Save all extracted data to a single JSON file
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(all_results, f, indent=2, ensure_ascii=False)
        print(f"All results saved to {filename}")
    except Exception as e:
        print(f"Error saving all results to JSON: {e}")

def main():
    # Read URLs from CSV file
    csv_file = "SB_publication_PMC.csv"
    urls = read_urls_from_csv(csv_file)
    
    if not urls:
        print("No URLs found in the CSV file. Exiting.")
        return
    
    # Process all URLs with the improved scraper
    print(f"Processing all {len(urls)} URLs with improved section detection")
    
    # Process all URLs
    all_results = process_multiple_urls(urls, delay=1)  # 1 second delay between requests
    
    if all_results:
        # Save all results
        save_all_results_to_csv(all_results)
        save_all_results_to_json(all_results)
        
        # Print summary
        total_sections = sum(len(data['on_this_page_items']) for data in all_results)
        print(f"\n" + "=" * 80)
        print(f"SUMMARY:")
        print(f"Total papers processed successfully: {len(all_results)}")
        print(f"Total 'ON THIS PAGE' sections found: {total_sections}")
        print(f"Average sections per paper: {total_sections / len(all_results):.1f}")
        print(f"Results saved to: all_pmc_on_this_page.csv and all_pmc_on_this_page.json")
    else:
        print("No data was successfully scraped from any of the URLs.")

if __name__ == "__main__":
    main()