import { GoogleGenAI, Modality } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Advanced Image Processing
 * - Resizes large images to max 800px width (optimizes token usage and latency)
 * - Flattens transparency (RGBA -> RGB with white background)
 * - Converts to JPEG for consistent mime type
 */
export const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Resize logic: max width 800px
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Handle transparency: Fill with white
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Get base64 as JPEG (0.85 quality is good balance)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        // Remove prefix
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * ROAST Mode: Uses Gemini 2.5 Flash
 */
export const roastResume = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `ROLE: You are a ruthless Senior Technical Recruiter. You are cynical, burnt-out, and have zero tolerance for bad resumes.

TASK: Roast this resume image.

GUIDELINES:
1. Tone: Sarcastic, funny, brutal, but specific.
2. Visuals: Mock the layout, font choices, and whitespace usage.
3. Content: Destroy vague buzzwords.
4. **ATS SCORE**: You MUST estimate a strict ATS Score (0-100).

OUTPUT FORMAT:
- A 3-sentence opening roast about the "vibe".
- [[ATS_SCORE: XX]] (Put the number inside these brackets, e.g., [[ATS_SCORE: 45]])
- A bulleted list of 3 specific failures.
- One sentence on why it belongs in the trash.

Use Markdown formatting.`
          }
        ]
      }
    });
    return response.text || "I'm too tired to even roast this.";
  } catch (e) {
    console.error(e);
    return "Error: Even the AI refused to look at this resume. (Model 404 or Error)";
  }
};

/**
 * ROAST INDIAN Mode (Strict): Uses Gemini 2.5 Flash
 */
export const roastResumeIndian = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `You are a strict Indian Engineering Senior. Analyze this resume image.

            TASK:
            1. Scan for ALL mistakes (Layout, Typos, Weak Skills, Generic Projects).
            2. **Dynamic Count:** If you find 3 mistakes, write 3 roasts.
            3. **The Style:** Strict "Desi" sarcasm. References like "Sharma ji," "Mass Recruiter."
            4. **ATS SCORE**: Estimate score (0-100). Format: [[ATS_SCORE: XX]]

            OUTPUT FORMAT:
            [[ATS_SCORE: XX]]
            🔥 Mistake #[N]: [Name]
            👉 [Roast Line]

            VERDICT: [FAIL/PASS]`
          }
        ]
      }
    });
    return response.text || "Even the Super Senior is speechless.";
  } catch (e) {
    console.error(e);
    return "Error: System threw a backlog error.";
  }
};

/**
 * FIX Mode: Uses Gemini 2.5 Flash
 * UPDATED: Returns a full organized resume structure.
 */
export const fixResume = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `ROLE: Elite Executive Resume Writer.
TASK: Completely rewrite this resume into a high-impact, ATS-friendly, professional document.

REQUIREMENTS:
1. **Structure**: Organize into clear sections (Summary, Skills, Experience, Projects, Education).
2. **Content**: Rewrite generic bullet points using the "XYZ Formula" (Accomplished [X] as measured by [Y], by doing [Z]). Use strong action verbs.
3. **ATS Optimization**: Ensure keywords relevant to the role are naturally integrated.
4. **Scoring**: Estimate current and projected ATS scores.

OUTPUT FORMAT (Strict Markdown):
[[CURRENT_ATS: XX]]
[[PROJECTED_ATS: YY]]

# [Candidate Name] (Optimized)
*[Job Title Target]*

## Professional Summary
[A punchy 3-line summary highlighting years of exp, top skills, and value add.]

## Core Competencies
* [Skill 1]
* [Skill 2]
* [Skill 3]
* ...

## Professional Experience

### [Role Name] | [Company]
*Date Range*
* [Strong Action Verb] [Result] using [Tech/Skill].
* [Strong Action Verb] [Result] by implementing [Strategy].
* [Strong Action Verb] [Result].

*(Repeat for other roles found in image)*

## Education
* **[Degree]** | [University]

## Projects (If applicable)
* **[Project Name]**: [Description with metrics].

---
**Coach's Note**: [One final specific tip for this user]`
          }
        ]
      }
    });
    return response.text || "Analysis failed. Ensure the image is clear.";
  } catch (e) {
    console.error(e);
    return "Error analyzing resume. Please try again.";
  }
};

/**
 * ANALYZE Mode: General Image Analysis
 */
export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: prompt || "Analyze this image in detail."
          }
        ]
      }
    });
    return response.text || "No analysis generated.";
  } catch (e) {
    console.error(e);
    return "Error analyzing image.";
  }
};

/**
 * STRATEGY Mode: Uses Thinking Budget with Gemini 2.5 Flash
 */
export const getCareerStrategy = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        thinkingConfig: { thinkingBudget: 24576 } // Max for Flash
      }
    });
    return response.text;
  } catch (e) {
    console.error(e);
    return "Thinking process failed.";
  }
};

/**
 * EXTRACT DETAILS: Helper to identify Name, Role and Location for Salary Search
 * Uses Flash Lite for speed.
 */
export const identifyResumeDetails = async (base64Image: string): Promise<{name: string, role: string, location: string}> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', // Faster model
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: `Identify the candidate's Name, primary Job Title and City/State. Return ONLY JSON: { "name": "John Doe", "role": "Software Engineer", "location": "Bangalore" }. If name is not found, use "User".` }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });
    const jsonText = response.text || "{}";
    // Safe parsing
    try {
        return JSON.parse(jsonText);
    } catch {
        const match = jsonText.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        return { name: "User", role: "Professional", location: "India" };
    }
  } catch (e) {
    console.error("Failed to extract details", e);
    return { name: "User", role: "Professional", location: "India" };
  }
};

/**
 * SEARCH Mode: Uses Grounding
 * Enforces Indian Context and INR currency.
 */
export const searchSalaryData = async (role: string, location: string) => {
  try {
    // Ensure we have valid defaults if extraction failed partly
    const effectiveRole = role || "Professional";
    const effectiveLocation = location || "India";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `What is the current market salary range (in Indian Rupees ₹ / Lakhs Per Annum - LPA) for a ${effectiveRole} in India?
      
      Context:
      - The candidate is based in (or looking in) ${effectiveLocation}. 
      - If ${effectiveLocation} is outside India, provide the equivalent salary for a similar role in major Indian tech hubs (Bangalore, Hyderabad, Pune).
      
      Requirements:
      1. Output STRICTLY in Indian Rupees (₹) or LPA. Do NOT use Dollars.
      2. List 3-5 top companies hiring for this role in India (MNCs or Indian Unicorns).
      3. Provide a brief sentence on the market trend in India for this role.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const text = response.text;
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    return { text, chunks };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * PHOTO EDITOR: Uses Gemini 2.5 Flash Image
 */
export const editResumePhoto = async (base64Image: string, instruction: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: instruction,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * IMAGE GEN: Uses Imagen 4
 */
export const generateBackground = async (prompt: string, aspectRatio: string) => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio as any,
        outputMimeType: 'image/jpeg',
      },
    });
    
    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64ImageBytes) {
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * AUDIO TRANSCRIPTION: Uses Gemini 2.5 Flash
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Audio
                        }
                    },
                    { text: "Transcribe this audio exactly. Do not add any commentary." }
                ]
            }
        });
        return response.text;
    } catch (e) {
        console.error(e);
        return "Error transcribing audio.";
    }
};

/**
 * QUICK TIP: Uses Gemini Flash Lite
 */
export const getQuickTip = async () => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: "Give me one ruthless, sarcastic, one-sentence tip for job seekers."
        });
        return response.text || "Fix your resume.";
    } catch (e) { 
        console.error(e);
        return "Fix your resume."; 
    }
};