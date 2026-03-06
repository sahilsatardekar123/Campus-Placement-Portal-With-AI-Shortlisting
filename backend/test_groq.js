require('dotenv').config();
const Groq = require('groq-sdk');

async function testGroq() {
    try {
        console.log("Testing Groq API with key:", process.env.GROQ_API_KEY.substring(0, 5) + '...');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: "Say 'Hello World'" }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.1,
        });

        console.log("Response:", chatCompletion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Groq Error:", error);
    }
}

testGroq();
