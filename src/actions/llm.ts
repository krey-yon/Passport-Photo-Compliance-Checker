"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai"
import type { Country } from "@/types";

interface GeminiAnalysisResult {
  overallScore: number;
  checks: Array<{
    category: string;
    status: "pass" | "warning" | "fail";
    message: string;
    failMessage?: string;
    warningMessage?: string;
    suggestion: string;
  }>;
  recommendations: string[];
  countrySpecificNotes: string[];
}

interface AnalysisData {
  ocrResult: any;
  faceAnalysisResult: any;
}
// interface AnalysisData {
//   ocrResult: any;
//   faceAnalysisResult: any;
// }

export async function analyzePassportWithGemini(
  analysisData: any,
  country: Country
): Promise<GeminiAnalysisResult | { error: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return { error: "Gemini API key not configured" };
    }

    const genAI = new GoogleGenAI({ apiKey });
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = createAnalysisPrompt(analysisData, country);
    
    const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
    // const response = await result.response;
    const text = result.text
    
    // Parse JSON response
    const jsonMatch = text?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { error: "Invalid response format from Gemini" };
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
    
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      error: error instanceof Error ? error.message : "Analysis failed"
    };
  }
}

function createAnalysisPrompt(analysisData: AnalysisData, country: Country): string {
//   const { ocrResult, faceAnalysisResult } = analysisData;
  
  return `
You are an expert passport photo compliance analyzer. Analyze the provided data from OCR and facial analysis APIs according to ${country.name} official passport photo guidelines.

**ANALYSIS DATA:**
${JSON.stringify(analysisData, null, 2)}

**COUNTRY:** ${country.name} (${country.code})

**TASK:** Analyze this passport photo data against ${country.name}'s official guidelines and provide a comprehensive compliance assessment.

**Analyze the OCR data or ocrResult check all details even other details in that data check that data is required or not in COUNTRY-SPECIFIC GUIDELINES **

**COUNTRY-SPECIFIC GUIDELINES TO CONSIDER NOTE: THEY ARE NOT ABSOLUTE YOU CAN YOU USE YOUR KNOWLEDGE AND INFORMATION TO ADD INTO THIS DETAILS SO THE OVERALL TOOL WILL BE MORE USEFULL :**

**India Guidelines:** Name must be visible if present, neutral expression, plain light background, face 70-80% of image height, no glasses preferred, eyes open and visible, head straight.

**USA Guidelines:** Neutral expression mandatory, plain white/off-white background, face 50-69% of image height, recent photo (within 6 months), no glasses, eyes open, head facing forward.

**UK Guidelines:** Neutral expression, plain light background, face 70-80% of image height, no glasses, eyes open and looking at camera, head straight and facing forward.

**Canada Guidelines:** Neutral expression, plain white background, face occupies 31-36mm (about 70-80% of image), no glasses, eyes open, head facing camera directly.

**Australia Guidelines:** Neutral expression with mouth closed, plain light background, face 32-36mm in height, no glasses, eyes open and visible, head upright.

**Germany Guidelines:** Neutral facial expression, plain light background, face height 32-36mm, no glasses, eyes open and looking at camera, head upright and facing forward.

**France Guidelines:** Neutral expression, plain light background, face height 32-36mm, no glasses allowed, eyes open and visible, head straight.

**ANALYSIS CATEGORIES TO EVALUATE:**
1. Face Detection - Check if face is properly detected and positioned
2. Background - Evaluate background compliance (plain, light-colored)
3. Image Quality - Assess overall image sharpness and resolution
4. Face Size - Check if face size meets country requirements
5. Eye Level - Verify eyes are properly positioned and open
6. Lighting - Evaluate lighting quality and shadow presence
7. Expression - Check for neutral expression compliance
8. Head Position - Assess head orientation and straightness
9. Text/Data Requirements - Check OCR data compliance for country
10. Glasses/Accessories - Evaluate compliance with eyewear rules

**Important Note : you can add any other category to evaluate too depending upon country use your knowledge and other important note is if there is any country which required name or date or any other info on passport and that data is not present in the ocrResult or OCR DATA's any field including other than give user warning/recommendation/suggestion that this particular country want this data on the photo but if that selected country not required these data the pass this field also you can reduce the overall score based on this thing significantly**

**SCORING CRITERIA:**
- Face Detection: 15% weight
- Background: 10% weight  
- Image Quality: 10% weight
- Face Size: 15% weight
- Eye Level: 10% weight
- Lighting: 10% weight
- Expression: 10% weight
- Head Position: 15% weight
- Country-specific requirements: 5% weight

**RESPONSE FORMAT (JSON ONLY):**
{
  "overallScore": <percentage 0-100>,
  "checks": [
    {
      "category": "Face Detection",
      "status": "pass|warning|fail",
      "message": "Description when passed",
      "failMessage": "Description when failed (if applicable)",
      "warningMessage": "Description when warning (if applicable)", 
      "suggestion": "Specific improvement suggestion"
    }
    // ... repeat for all categories
  ],
  "recommendations": [
    "Overall recommendation 1",
    "Overall recommendation 2"
  ],
  "countrySpecificNotes": [
    "Country-specific requirement note 1",
    "Country-specific requirement note 2"
  ]
}

**IMPORTANT:**
- Base scores on actual data provided, not random values
- Consider country-specific requirements strictly
- Provide actionable suggestions
- Use "pass" (80-100%), "warning" (60-79%), "fail" (<60%) for each category
- Overall score should reflect weighted average of all categories
- Include specific country compliance notes
- Respond with ONLY the JSON object, no additional text

Analyze now:
`;
}