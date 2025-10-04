import openai
import json
from collections import defaultdict

# Set up OpenRouter (OpenAI-compatible)
client = openai.OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",  # Replace with your OpenRouter API key
)

def load_json_data(file_path):
    """Load data from JSON file with UTF-8 encoding."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except UnicodeDecodeError as e:
        print(f"Encoding error: {str(e)}. Trying 'latin1' encoding as fallback...")
        try:
            with open(file_path, 'r', encoding='latin1') as f:
                return json.load(f)
        except Exception as e2:
            print(f"Fallback failed: {str(e2)}")
            return []
    except Exception as e:
        print(f"Error loading JSON file: {str(e)}")
        return []

def summarize_text(client, text, paper_title, model="qwen/qwen3-coder"):
    """Summarize a paper's full text using OpenRouter API."""
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes scientific papers concisely while preserving key details."},
                {"role": "user", "content": f"Summarize the following scientific paper titled '{paper_title}' in 3-5 sentences:\n\n{text}"}
            ],
            max_tokens=200,  # Limit output length
            temperature=0.3,  # Low for factual summaries
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error summarizing '{paper_title}': {str(e)}"

def group_by_title(data):
    """Group sections by paper title."""
    papers = defaultdict(list)
    for item in data:
        if "paper_title" in item and "text" in item:
            papers[item["paper_title"]].append(item["text"])
    return papers

def summarize_and_print_papers_by_title(titles, json_file_path, client):
    """Summarize papers from JSON file for given titles and print them."""
    # Load JSON data
    data = load_json_data(json_file_path)
    if not data:
        print("No data loaded from JSON file. Please check the file encoding or content.")
        return

    # Group data by title
    papers = group_by_title(data)

    print("=== Paper Summaries ===\n")

    for title in titles:
        if title in papers:
            # Concatenate all sections for this paper
            full_text = "\n\n".join(papers[title])
            summary = summarize_text(client, full_text, title)
            print(f"**{title}**\n{summary}\n")
        else:
            print(f"**{title}**\nNo data found for '{title}' in the JSON file. Please verify the title or provide the text.\n")

# Configuration
json_file_path = "rag_chunks.json"  # Replace with your JSON file path
titles_to_summarize = [
    "Mice in Bion-M 1 Space Mission: Training and Selection",
    # Add more titles here, e.g., "Another Paper Title"
]

# Run summarization and print
summarize_and_print_papers_by_title(titles_to_summarize, json_file_path, client)