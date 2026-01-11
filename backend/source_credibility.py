"""
News Source Credibility Database
================================
Contains known credible and unreliable news sources,
with focus on Nepali and international outlets.
"""

# Credibility scores: 1.0 = Very Reliable, 0.0 = Known Fake
# Sources are categorized by their domain

NEPAL_CREDIBLE_SOURCES = {
    # Major Nepali News Outlets (Generally Reliable)
    "kathmandupost.com": {"score": 0.85, "name": "The Kathmandu Post", "type": "mainstream"},
    "ekantipur.com": {"score": 0.85, "name": "Kantipur", "type": "mainstream"},
    "onlinekhabar.com": {"score": 0.80, "name": "Online Khabar", "type": "online"},
    "setopati.com": {"score": 0.80, "name": "Setopati", "type": "online"},
    "ratopati.com": {"score": 0.75, "name": "Ratopati", "type": "online"},
    "nepalnews.com": {"score": 0.75, "name": "Nepal News", "type": "online"},
    "thehimalayantimes.com": {"score": 0.85, "name": "The Himalayan Times", "type": "mainstream"},
    "myrepublica.nagariknetwork.com": {"score": 0.85, "name": "Republica", "type": "mainstream"},
    "risingnepaldaily.com": {"score": 0.80, "name": "The Rising Nepal", "type": "state"},
    "gabornepal.gov.np": {"score": 0.75, "name": "Nepal Government", "type": "government"},
    "nepalitimes.com": {"score": 0.85, "name": "Nepali Times", "type": "mainstream"},
    "techlekh.com": {"score": 0.70, "name": "TechLekh", "type": "tech"},
    "nagariknews.nagariknetwork.com": {"score": 0.80, "name": "Nagarik News", "type": "mainstream"},
    "annapurnapost.com": {"score": 0.80, "name": "Annapurna Post", "type": "mainstream"},
    "nayapatrikadaily.com": {"score": 0.80, "name": "Naya Patrika", "type": "mainstream"},
    "himalpress.com": {"score": 0.75, "name": "Himal Press", "type": "online"},
    "nepalsamaya.com": {"score": 0.75, "name": "Nepal Samaya", "type": "online"},
    "dainiknepal.com": {"score": 0.70, "name": "Dainik Nepal", "type": "online"},
    "bbc.com/nepali": {"score": 0.90, "name": "BBC Nepali", "type": "international"},
}

INTERNATIONAL_CREDIBLE_SOURCES = {
    # International Wire Services
    "reuters.com": {"score": 0.95, "name": "Reuters", "type": "wire"},
    "apnews.com": {"score": 0.95, "name": "Associated Press", "type": "wire"},
    "afp.com": {"score": 0.90, "name": "AFP", "type": "wire"},
    
    # Major International News
    "bbc.com": {"score": 0.90, "name": "BBC", "type": "mainstream"},
    "theguardian.com": {"score": 0.85, "name": "The Guardian", "type": "mainstream"},
    "nytimes.com": {"score": 0.85, "name": "New York Times", "type": "mainstream"},
    "washingtonpost.com": {"score": 0.85, "name": "Washington Post", "type": "mainstream"},
    "aljazeera.com": {"score": 0.80, "name": "Al Jazeera", "type": "mainstream"},
    "cnn.com": {"score": 0.75, "name": "CNN", "type": "mainstream"},
    "ndtv.com": {"score": 0.75, "name": "NDTV", "type": "mainstream"},
    "hindustantimes.com": {"score": 0.75, "name": "Hindustan Times", "type": "mainstream"},
    "timesofindia.indiatimes.com": {"score": 0.70, "name": "Times of India", "type": "mainstream"},
    
    # Fact-Checking Organizations
    "snopes.com": {"score": 0.95, "name": "Snopes", "type": "factcheck"},
    "factcheck.org": {"score": 0.95, "name": "FactCheck.org", "type": "factcheck"},
    "politifact.com": {"score": 0.90, "name": "PolitiFact", "type": "factcheck"},
    "boomlive.in": {"score": 0.90, "name": "BOOM", "type": "factcheck"},
    "altnews.in": {"score": 0.90, "name": "Alt News", "type": "factcheck"},
    "vishvasnews.com": {"score": 0.85, "name": "Vishvas News", "type": "factcheck"},
    "southasiacheck.org": {"score": 0.90, "name": "South Asia Check", "type": "factcheck"},
}

KNOWN_UNRELIABLE_SOURCES = {
    # Known fake/satire/unreliable sites
    "infowars.com": {"score": 0.10, "name": "InfoWars", "type": "fake"},
    "naturalnews.com": {"score": 0.15, "name": "Natural News", "type": "fake"},
    "beforeitsnews.com": {"score": 0.10, "name": "Before It's News", "type": "fake"},
    "worldnewsdailyreport.com": {"score": 0.05, "name": "World News Daily Report", "type": "satire"},
    "theonion.com": {"score": 0.05, "name": "The Onion", "type": "satire"},
    "babylonbee.com": {"score": 0.05, "name": "Babylon Bee", "type": "satire"},
    "dailybuzzlive.com": {"score": 0.15, "name": "Daily Buzz Live", "type": "fake"},
    "yournewswire.com": {"score": 0.10, "name": "Your News Wire", "type": "fake"},
    "newspunch.com": {"score": 0.10, "name": "News Punch", "type": "fake"},
}

# Combine all sources
ALL_SOURCES = {
    **NEPAL_CREDIBLE_SOURCES,
    **INTERNATIONAL_CREDIBLE_SOURCES,
    **KNOWN_UNRELIABLE_SOURCES,
}

# Fake news indicators in URLs/domains
SUSPICIOUS_DOMAIN_PATTERNS = [
    "breaking-news",
    "viral-news",
    "truth-revealed",
    "exposed-news",
    "real-truth",
    "insider-info",
    ".blogspot.",
    ".wordpress.com",
    "-news24",
    "-times24",
    "-today24",
]

# Clickbait/sensationalist words commonly found in fake news
FAKE_NEWS_INDICATORS = [
    "shocking", "you won't believe", "exposed", "secret revealed",
    "government hiding", "doctors hate", "one weird trick",
    "breaking:", "urgent:", "share before deleted",
    "mainstream media won't tell you", "what they don't want you to know",
    "miracle cure", "exposed truth", "shocking revelation",
]

# Nepal-specific fake news patterns
NEPAL_FAKE_INDICATORS = [
    "सनसनी", "खुलासा", "गोप्य", "चौंकाउने",
    "शेयर गर्नुहोस्", "भाइरल", "सत्य यस्तो",
]


def get_source_info(domain: str) -> dict:
    """
    Get credibility information for a news source.
    
    Args:
        domain: The domain name (e.g., 'kathmandupost.com')
    
    Returns:
        Dictionary with credibility info
    """
    # Clean domain
    domain = domain.lower().replace("www.", "")
    
    # Check exact match
    if domain in ALL_SOURCES:
        return {
            "known": True,
            **ALL_SOURCES[domain]
        }
    
    # Check partial matches (subdomains)
    for known_domain, info in ALL_SOURCES.items():
        if known_domain in domain or domain in known_domain:
            return {
                "known": True,
                **info
            }
    
    # Check suspicious patterns
    is_suspicious = any(pattern in domain for pattern in SUSPICIOUS_DOMAIN_PATTERNS)
    
    return {
        "known": False,
        "score": 0.4 if is_suspicious else 0.5,
        "name": domain,
        "type": "unknown",
        "suspicious_patterns": is_suspicious
    }


def analyze_content_credibility(text: str) -> dict:
    """
    Analyze text content for fake news indicators.
    
    Args:
        text: The news article text
    
    Returns:
        Dictionary with content analysis
    """
    text_lower = text.lower()
    
    # Check for fake news indicators
    found_indicators = [
        indicator for indicator in FAKE_NEWS_INDICATORS
        if indicator.lower() in text_lower
    ]
    
    # Check Nepal-specific indicators
    nepal_indicators = [
        indicator for indicator in NEPAL_FAKE_INDICATORS
        if indicator in text
    ]
    
    # Calculate caps ratio
    if len(text) > 0:
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text)
    else:
        caps_ratio = 0
    
    # Count excessive punctuation
    exclamation_count = text.count("!")
    question_marks = text.count("?")
    
    # Content flags
    flags = []
    
    if found_indicators:
        flags.append(f"Contains {len(found_indicators)} clickbait/sensational phrase(s)")
    
    if nepal_indicators:
        flags.append(f"Contains {len(nepal_indicators)} Nepali sensational phrase(s)")
    
    if caps_ratio > 0.2:
        flags.append("Excessive use of capital letters")
    
    if exclamation_count > 3:
        flags.append("Excessive exclamation marks")
    
    # Calculate content credibility modifier
    credibility_penalty = 0
    credibility_penalty += len(found_indicators) * 0.05
    credibility_penalty += len(nepal_indicators) * 0.05
    credibility_penalty += 0.1 if caps_ratio > 0.2 else 0
    credibility_penalty += 0.05 if exclamation_count > 3 else 0
    
    return {
        "clickbait_phrases": found_indicators,
        "nepal_sensational_phrases": nepal_indicators,
        "caps_ratio": round(caps_ratio, 3),
        "exclamation_count": exclamation_count,
        "flags": flags,
        "credibility_penalty": min(credibility_penalty, 0.4),  # Max 40% penalty
    }
