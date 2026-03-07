// services/aiRanking.js
const natural = require('natural');

/**
 * Calculates Cosine Similarity between two arrays of tokens using TF-IDF.
 * @param {string[]} requiredSkillsTokens 
 * @param {string[]} studentSkillsTokens 
 * @returns {number} Value between 0 and 1
 */
const calculateSkillSimilarity = (requiredSkillsTokens, studentSkillsTokens) => {
    if (!requiredSkillsTokens.length || !studentSkillsTokens.length) return 0;

    // Create TF-IDF instance
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();

    // Document 1: Required Skills
    tfidf.addDocument(requiredSkillsTokens.join(' '));
    // Document 2: Student Skills
    tfidf.addDocument(studentSkillsTokens.join(' '));

    // Get vectors for both documents
    // We will extract unique terms across both documents
    const uniqueTerms = new Set([...requiredSkillsTokens, ...studentSkillsTokens]);

    let vec1 = [];
    let vec2 = [];

    uniqueTerms.forEach(term => {
        vec1.push(tfidf.tfidf(term, 0)); // Doc 0: Required
        vec2.push(tfidf.tfidf(term, 1)); // Doc 1: Student
    });

    // Dot Product
    let dotProduct = 0;
    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
    }

    // Magnitude
    const mag1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));

    if (mag1 === 0 || mag2 === 0) return 0;

    return dotProduct / (mag1 * mag2);
};

const sanitizeAndTokenize = (commaSeparatedSkills) => {
    if (!commaSeparatedSkills) return [];
    // Convert to lowercase, split by comma, trim whitespace, remove empty
    return commaSeparatedSkills
        .toLowerCase()
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
};

/**
 * Main ranking calculation function
 * @param {Object} student { cgpa, skills, experience }
 * @param {Object} job { min_cgpa, skills_required, exp_required }
 * @returns {Object} { match_score, matched_skills, missing_skills }
 */
const calculateMatchScore = (student, job) => {
    const studentSkills = sanitizeAndTokenize(student.skills);
    const requiredSkills = sanitizeAndTokenize(job.skills_required);

    // 1. Skill Similarity (0 - 1)
    let skillSim = calculateSkillSimilarity(requiredSkills, studentSkills);
    // Ensure it's bounded
    skillSim = Math.max(0, Math.min(skillSim, 1));

    // 2. CGPA Score (0 - 1)
    const cgpa = Number(student.cgpa) || 0;
    const cgpaScore = Math.max(0, Math.min(cgpa / 10, 1));

    // 3. Experience Match (0 - 1)
    let expMatch = 1;
    const studentExp = Number(student.experience) || 0;
    const reqExp = Number(job.exp_required) || 0;

    if (reqExp > 0) {
        expMatch = Math.min(studentExp / reqExp, 1);
    } else {
        expMatch = 1; // If no experience is required, they get full points
    }

    // Final Formula
    let match_score = (skillSim * 0.6) + (cgpaScore * 0.2) + (expMatch * 0.2);
    if (isNaN(match_score)) match_score = 0;

    // Identify matched and missing skills
    const matched_skills = requiredSkills.filter(reqSkill =>
        studentSkills.some(stuSkill => stuSkill.includes(reqSkill) || reqSkill.includes(stuSkill))
    );
    const missing_skills = requiredSkills.filter(reqSkill => !matched_skills.includes(reqSkill));

    return {
        match_score: Number(match_score.toFixed(4)),
        matched_skills: matched_skills.join(', '),
        missing_skills: missing_skills.join(', ')
    };
};

module.exports = { calculateMatchScore, sanitizeAndTokenize };
