import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Trusted news sources database
const TRUSTED_SOURCES: Record<string, { name: string; score: number; type: string }> = {
  // Nepali Sources
  "kathmandupost.com": { name: "The Kathmandu Post", score: 90, type: "mainstream" },
  "tkpo.st": { name: "The Kathmandu Post", score: 90, type: "mainstream" },
  "ekantipur.com": { name: "Kantipur", score: 88, type: "mainstream" },
  "kantipurdaily.com": { name: "Kantipur Daily", score: 88, type: "mainstream" },
  "onlinekhabar.com": { name: "Online Khabar", score: 85, type: "mainstream" },
  "setopati.com": { name: "Setopati", score: 85, type: "mainstream" },
  "ratopati.com": { name: "Ratopati", score: 80, type: "mainstream" },
  "himalayantimes.com": { name: "The Himalayan Times", score: 87, type: "mainstream" },
  "nagariknews.com": { name: "Nagarik News", score: 85, type: "mainstream" },
  "nepalitimes.com": { name: "Nepali Times", score: 88, type: "mainstream" },
  "myrepublica.com": { name: "My Republica", score: 85, type: "mainstream" },
  "theannapurnaexpress.com": { name: "The Annapurna Express", score: 85, type: "mainstream" },
  "risingnepaldaily.com": { name: "The Rising Nepal", score: 82, type: "state" },
  "gorkhapatraonline.com": { name: "Gorkhapatra", score: 80, type: "state" },
  "nrna.org": { name: "NRNA", score: 75, type: "organization" },
  // International Sources
  "bbc.com": { name: "BBC", score: 92, type: "international" },
  "bbc.co.uk": { name: "BBC", score: 92, type: "international" },
  "cnn.com": { name: "CNN", score: 88, type: "international" },
  "reuters.com": { name: "Reuters", score: 95, type: "wire" },
  "apnews.com": { name: "Associated Press", score: 95, type: "wire" },
  "aljazeera.com": { name: "Al Jazeera", score: 85, type: "international" },
  "nytimes.com": { name: "New York Times", score: 90, type: "international" },
  "theguardian.com": { name: "The Guardian", score: 88, type: "international" },
  "washingtonpost.com": { name: "Washington Post", score: 88, type: "international" },
  // Fact-checking
  "snopes.com": { name: "Snopes", score: 92, type: "fact-check" },
  "factcheck.org": { name: "FactCheck.org", score: 95, type: "fact-check" },
  "politifact.com": { name: "PolitiFact", score: 90, type: "fact-check" },
  "southasiacheck.org": { name: "South Asia Check", score: 90, type: "fact-check" },
};

// Known unreliable sources
const UNRELIABLE_SOURCES: Record<string, { name: string; score: number; reason: string }> = {
  "theonion.com": { name: "The Onion", score: 10, reason: "satire" },
  "babylonbee.com": { name: "The Babylon Bee", score: 10, reason: "satire" },
  "infowars.com": { name: "InfoWars", score: 15, reason: "conspiracy" },
  "naturalnews.com": { name: "Natural News", score: 20, reason: "misinformation" },
};

function extractDomain(urlOrText: string): string | null {
  try {
    // Try to parse as URL
    const url = new URL(urlOrText.startsWith("http") ? urlOrText : `https://${urlOrText}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    // Try to extract domain from text
    const urlMatch = urlOrText.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
    return urlMatch ? urlMatch[1] : null;
  }
}

function getSourceCredibility(domain: string | null): { 
  name: string; 
  score: number; 
  type: string; 
  known: boolean;
  isReliable: boolean;
  reason?: string;
} {
  if (!domain) {
    return { name: "Unknown", score: 50, type: "unknown", known: false, isReliable: false };
  }

  // Check trusted sources
  if (TRUSTED_SOURCES[domain]) {
    const source = TRUSTED_SOURCES[domain];
    return { ...source, known: true, isReliable: true };
  }

  // Check unreliable sources
  if (UNRELIABLE_SOURCES[domain]) {
    const source = UNRELIABLE_SOURCES[domain];
    return { 
      name: source.name, 
      score: source.score, 
      type: source.reason, 
      known: true, 
      isReliable: false,
      reason: source.reason 
    };
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(TRUSTED_SOURCES)) {
    if (domain.includes(key) || key.includes(domain)) {
      return { ...value, known: true, isReliable: true };
    }
  }

  // Unknown source - neutral score
  return { name: domain, score: 50, type: "unknown", known: false, isReliable: false };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, url, source } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const contentToAnalyze = text || "";
    const sourceUrl = url || source || "";
    
    // Extract domain and get source credibility
    const domain = extractDomain(sourceUrl);
    const sourceInfo = getSourceCredibility(domain);

    const systemPrompt = `You are an expert fact-checker and misinformation analyst specializing in South Asian news, particularly Nepali news. Your task is to analyze news content and determine its credibility.

ANALYSIS FRAMEWORK:
1. **Linguistic Analysis**: Check for sensationalism, emotional manipulation, clickbait language
2. **Logical Consistency**: Look for internal contradictions, logical fallacies
3. **Claim Verification**: Identify verifiable claims and assess their plausibility
4. **Source Attribution**: Check if sources are cited, if quotes are attributed
5. **Propaganda Techniques**: Detect loaded language, appeals to emotion, false dichotomies
6. **Nepali Context**: Understand Nepali political, social, and cultural context

INDICATORS OF FAKE NEWS:
- Excessive use of capital letters, exclamation marks
- Sensational headlines not supported by content
- No named sources or "some people say" attributions
- Requests to share urgently
- Emotional manipulation (fear, anger, outrage)
- Too-good-to-be-true claims
- Conspiracy theory elements
- Anti-establishment rhetoric without evidence

INDICATORS OF REAL NEWS:
- Balanced reporting with multiple perspectives
- Named, verifiable sources
- Neutral, factual language
- Proper attribution and citations
- Context and background provided
- Professional journalistic standards

IMPORTANT: 
- If the news is from a known credible source (score > 80), give significant weight to that
- Be cautious about labeling news as "FAKE" if it's from reputable outlets
- When uncertain, express uncertainty clearly
- Consider that breaking news may lack full verification initially

Respond in JSON format:
{
  "verdict": "REAL" | "FAKE" | "UNCERTAIN",
  "confidence": number (0-100),
  "reasoning": "Brief explanation of your analysis",
  "indicators": {
    "sensationalism_score": number (0-100),
    "source_attribution": number (0-100),
    "logical_consistency": number (0-100),
    "emotional_manipulation": number (0-100),
    "factual_claims_verifiable": number (0-100)
  },
  "red_flags": ["list of specific concerns if any"],
  "positive_signals": ["list of credibility indicators if any"],
  "recommendation": "What the reader should do"
}`;

    const userPrompt = `Analyze this news content for authenticity:

SOURCE INFORMATION:
- Domain: ${domain || "Not provided"}
- Source Name: ${sourceInfo.name}
- Source Credibility Score: ${sourceInfo.score}/100
- Source Type: ${sourceInfo.type}
- Known Source: ${sourceInfo.known ? "Yes" : "No"}
- Reliable Source: ${sourceInfo.isReliable ? "Yes" : "No"}

NEWS CONTENT:
${contentToAnalyze.slice(0, 4000)}

Please analyze this content and provide your assessment.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";
    
    // Parse AI response
    let aiAnalysis;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback analysis
      aiAnalysis = {
        verdict: "UNCERTAIN",
        confidence: 50,
        reasoning: "Unable to fully analyze the content. Please verify with additional sources.",
        indicators: {
          sensationalism_score: 50,
          source_attribution: 50,
          logical_consistency: 50,
          emotional_manipulation: 50,
          factual_claims_verifiable: 50,
        },
        red_flags: [],
        positive_signals: [],
        recommendation: "Cross-reference with multiple trusted news sources.",
      };
    }

    // Calculate hybrid score: 70% AI + 30% Source
    const aiConfidence = aiAnalysis.confidence || 50;
    const sourceScore = sourceInfo.score;
    
    // Determine AI prediction as a number (100 for REAL, 0 for FAKE, 50 for UNCERTAIN)
    let aiPredictionScore = 50;
    if (aiAnalysis.verdict === "REAL") aiPredictionScore = aiConfidence;
    else if (aiAnalysis.verdict === "FAKE") aiPredictionScore = 100 - aiConfidence;
    else aiPredictionScore = 50;

    // Hybrid calculation
    const hybridScore = (aiPredictionScore * 0.7) + (sourceScore * 0.3);
    
    // Determine final verdict with uncertainty handling
    let finalVerdict: "REAL" | "FAKE" | "LIKELY_REAL" | "LIKELY_FAKE" | "UNCERTAIN";
    let isUncertain = false;
    
    // Check for uncertainty case: credible source + AI says FAKE with low confidence
    if (sourceInfo.score >= 80 && aiAnalysis.verdict === "FAKE" && aiConfidence < 70) {
      finalVerdict = "LIKELY_REAL";
      isUncertain = true;
    } else if (sourceInfo.score < 40 && aiAnalysis.verdict === "REAL" && aiConfidence < 70) {
      finalVerdict = "LIKELY_FAKE";
      isUncertain = true;
    } else if (hybridScore >= 65) {
      finalVerdict = "REAL";
    } else if (hybridScore <= 35) {
      finalVerdict = "FAKE";
    } else {
      finalVerdict = "UNCERTAIN";
      isUncertain = true;
    }

    const result = {
      // AI Analysis
      ai_prediction: aiAnalysis.verdict,
      ai_confidence: aiConfidence,
      ai_reasoning: aiAnalysis.reasoning,
      ai_indicators: aiAnalysis.indicators,
      ai_red_flags: aiAnalysis.red_flags || [],
      ai_positive_signals: aiAnalysis.positive_signals || [],
      
      // Source Information
      source_domain: domain,
      source_name: sourceInfo.name,
      source_score: sourceScore,
      source_type: sourceInfo.type,
      source_known: sourceInfo.known,
      source_reliable: sourceInfo.isReliable,
      
      // Hybrid Calculation
      hybrid_score: Math.round(hybridScore),
      ai_weight: 0.7,
      source_weight: 0.3,
      
      // Final Result
      final_verdict: finalVerdict,
      final_confidence: Math.round(hybridScore),
      is_uncertain: isUncertain,
      recommendation: aiAnalysis.recommendation || "Always verify important news with multiple trusted sources.",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-news error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Analysis failed",
        fallback: true 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
