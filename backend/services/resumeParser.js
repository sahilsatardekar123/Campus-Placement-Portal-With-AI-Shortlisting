const Groq = require('groq-sdk');
const pdfParse = require('pdf-parse');

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Extracts raw text from a PDF buffer and asks Groq to extract technical skills.
 * @param {Buffer} fileBuffer
 * @returns {Promise<string>} Comma-separated list of skills
 */
const parseResumePdf = async (fileBuffer) => {
    try {
        // 1. Extract raw text from PDF
        const pdfData = await pdfParse(fileBuffer);
        const rawText = pdfData.text;

        if (!rawText || rawText.trim().length === 0) {
            throw new Error('Could not extract text from the provided PDF.');
        }

        // 2. Shorten text if it's too long to save on tokens (usually a resume is short anyway)
        const truncatedText = rawText.substring(0, 8000);

        // 3. Prompt Groq for skills extraction
        const prompt = `
You are an expert technical recruiter AI. 
Extract all the technical skills, programming languages, frameworks, databases, and tools from the following resume text.
Do not include soft skills like "leadership" or "communication".
Return ONLY a single comma-separated list of the technical skills. No introductory text, no categories, no bullet points, just the raw comma-separated string.
If you cannot find any, return an empty string.

Resume Text:
---
${truncatedText}
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.1, // Low temperature for factual extraction
        });

        const extractedSkills = chatCompletion.choices[0]?.message?.content || '';

        // Clean up the response (remove any potential trailing periods or weird formatting)
        return extractedSkills.replace(/\.$/, '').trim();

    } catch (error) {
        console.error('Error in parseResumePdf:', error);
        throw new Error('Failed to parse resume using AI.');
    }
};

module.exports = { parseResumePdf };
