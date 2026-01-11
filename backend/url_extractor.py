"""
URL Content Extractor
=====================
Extracts news article content from URLs using multiple methods.
"""

import httpx
import trafilatura
from urllib.parse import urlparse
from typing import Optional
import re


async def extract_article_from_url(url: str) -> dict:
    """
    Extract article content from a news URL.
    
    Args:
        url: The news article URL
    
    Returns:
        Dictionary with extracted content
    """
    # Validate URL
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        raise ValueError("Invalid URL format")
    
    if parsed.scheme not in ["http", "https"]:
        raise ValueError("URL must use HTTP or HTTPS")
    
    # Extract domain
    domain = parsed.netloc.lower().replace("www.", "")
    
    try:
        # Fetch the page
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        ) as client:
            response = await client.get(url)
            response.raise_for_status()
            html_content = response.text
        
        # Extract article using trafilatura (best for news articles)
        extracted = trafilatura.extract(
            html_content,
            include_comments=False,
            include_tables=False,
            no_fallback=False,
            favor_precision=True,
            output_format="txt"
        )
        
        # Extract metadata
        metadata = trafilatura.extract_metadata(html_content)
        
        if not extracted or len(extracted.strip()) < 50:
            # Fallback: try bare extraction
            extracted = trafilatura.extract(
                html_content,
                include_comments=False,
                no_fallback=False,
                favor_recall=True
            )
        
        if not extracted:
            raise ValueError("Could not extract article content from URL")
        
        # Get title
        title = None
        if metadata:
            title = metadata.title
        
        # If no title from metadata, try to extract from HTML
        if not title:
            title_match = re.search(r'<title[^>]*>([^<]+)</title>', html_content, re.IGNORECASE)
            if title_match:
                title = title_match.group(1).strip()
        
        # Get author
        author = None
        if metadata:
            author = metadata.author
        
        # Get publish date
        date = None
        if metadata:
            date = metadata.date
        
        return {
            "success": True,
            "url": url,
            "domain": domain,
            "title": title,
            "author": author,
            "date": date,
            "text": extracted.strip(),
            "text_length": len(extracted.strip()),
        }
        
    except httpx.TimeoutException:
        raise ValueError("Request timed out. The website may be slow or unavailable.")
    except httpx.HTTPStatusError as e:
        raise ValueError(f"HTTP error {e.response.status_code}: Could not access the URL")
    except Exception as e:
        raise ValueError(f"Failed to extract content: {str(e)}")


def extract_domain(url: str) -> str:
    """Extract domain from URL."""
    parsed = urlparse(url)
    return parsed.netloc.lower().replace("www.", "")


def is_valid_news_url(url: str) -> bool:
    """Check if URL appears to be a valid news article URL."""
    try:
        parsed = urlparse(url)
        
        # Must have scheme and domain
        if not parsed.scheme or not parsed.netloc:
            return False
        
        # Must be HTTP/HTTPS
        if parsed.scheme not in ["http", "https"]:
            return False
        
        # Should have a path (not just homepage)
        if not parsed.path or parsed.path == "/":
            return False
        
        # Common news URL patterns
        path_lower = parsed.path.lower()
        
        # Avoid non-article pages
        non_article_patterns = [
            "/tag/", "/category/", "/author/", "/page/",
            "/search", "/login", "/register", "/subscribe",
            "/about", "/contact", "/privacy", "/terms",
            ".jpg", ".png", ".gif", ".pdf", ".mp4"
        ]
        
        if any(pattern in path_lower for pattern in non_article_patterns):
            return False
        
        return True
        
    except Exception:
        return False
