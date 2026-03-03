# Campus Placement Portal 🎓

A production-ready full-stack job portal designed for campus placements. Features an advanced AI-based candidate shortlisting system to help recruiters instantly identify the best talent.

## 🌟 Key Features

### For Students
- **Profile Management:** Build a comprehensive profile with skills, CGPA, and experience.
- **Job Discovery:** Browse available job postings.
- **AI Matching Visibility:** See real-time match scores against job requirements.

### For Recruiters
- **Job Posting:** Define specific requirements including minimum CGPA, skills, and experience.
- **AI Candidate Ranking:** Automatically sort and highlight top applicants based on an intelligent scoring algorithm.
- **Actionable Insights:** View exactly which skills a candidate matched and which they missed.

---

## 🏗️ Architecture Design

Our platform is separated into a lightweight, high-performance frontend and a robust, secure backend.

1. **Frontend (React + Vite + Tailwind CSS)**
   - **Component-Based:** Modular UI pieces for rapid scaling.
   - **Context API:** Handles robust JWT role-based authentication state.
   - **Axios Interceptors:** Securely manages token injections and automatic logouts.

2. **Backend (Node.js + Express + PostgreSQL)**
   - **Security First:** Utilizes \`helmet\` for HTTP headers, \`express-rate-limit\` to prevent DDoS, and \`express-validator\` for strict input sanitization.
   - **Centralized Error Handling:** Consistent API responses via a standardized middleware.
   - **Database Efficiency:** PostgreSQL tailored with B-Tree indexes on frequent lookups (\`email\`, \`job_id\`, \`recruiter_id\`) and strict constraints.

---

## 🤖 AI Ranking Formula

We process resume-skills vs job-requirements using Natural Language Processing without relying on expensive paid APIs. 

**Formula:**
\`Final Score = (Skill Similarity * 0.6) + (CGPA Score * 0.2) + (Experience Match * 0.2)\`

1. **Skill Similarity (Weight: 60%)**
   - Utilizes the \`natural\` NPM library.
   - We extract comma-separated skills, convert to lowercase, and construct a **TF-IDF mapping**.
   - We calculate the **Cosine Similarity** between the Job Requirement Vector and the Student Skill Vector. Result is neatly bounded between 0 and 1.
2. **CGPA Score (Weight: 20%)**
   - Normalized: \`CGPA / 10\`. Extracted safely between 0 and 1.
3. **Experience Match (Weight: 20%)**
   - Normalized: \`min(Student Exp / Required Exp, 1)\`.

**Optimization Note:** The calculation is strictly done *only* when a student applies. The result is saved directly into the \`rankings\` database table to keep the recruiter dashboard reads lightning fast O(1).

---

## 🚀 Scalability & Future Improvements

**Current Scalability Measures:**
- Indexing heavily queried columns.
- Separating AI logic into an isolated service module.
- Pre-computing and caching match scores in the DB.

**Future Improvements:**
1. **Redis Caching:** Implement Redis to cache frequent read operations (like available jobs list).
2. **Microservice Splitting:** Move the AI NLP processing to an isolated Python container (FastAPI) utilizing \`scikit-learn\` for advanced contextual embeddings (like Word2Vec/BERT) instead of standard TF-IDF.
3. **Queue System:** If applications scale to thousands per minute, use RabbitMQ to queue AI ranking calculations instead of computing them inline on the POST request.

---

## 💻 Local Setup Instructions

### 1. Database
- Install PostgreSQL.
- Run the commands inside \`database/schema.sql\` to set up tables.

### 2. Backend
\`\`\`bash
cd backend
npm install
# Copy .env.example to .env and configure DATABASE_URL and JWT_SECRET
npm run dev # (requires setting up a dev script in package.json: "dev": "node server.js")
\`\`\`

### 3. Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
