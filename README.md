# DocuAI

AI-Powered Intelligent Document Generation Platform

DocuAI is a web-based platform that automatically analyzes DOCX templates, understands their structure, generates content using AI, and produces completed Word documents while preserving the original template formatting.

## 🚀 Features

- User authentication with Google
- DOCX template upload
- Automatic template analysis
- Semantic field detection
- AI-powered content generation
- Support for:
  - Title
  - Aim
  - Description
  - Program / Code
  - Output Screenshot
  - Result
  - Date
  - YouTube / Video links
- Table field detection
- Automatic DOCX population
- Screenshot/image insertion
- Generated document download
- Recent document history
- Responsive web interface
- Supabase authentication and database
- FastAPI backend
- Next.js frontend

## 🏗️ Project Architecture

```text
DocuAI
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   └── ...
│   │   └── lib/
│   │       ├── api.ts
│   │       └── supabase.ts
│   │
│   ├── package.json
│   └── next.config.ts
│
├── backend/
│   ├── api/
│   │   └── routes/
│   │
│   ├── documents/
│   │   ├── docx_populator.py
│   │   ├── content_mapper.py
│   │   ├── template_understanding.py
│   │   ├── template_map.py
│   │   └── ...
│   │
│   ├── database/
│   │   └── migrations/
│   │
│   ├── main.py
│   └── requirements.txt
│
└── README.md
🛠️ Technology Stack
Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase JavaScript Client
Backend
- Python
- FastAPI
- Uvicorn
- python-docx
Database & Authentication
- Supabase
- PostgreSQL
- Supabase Authentication
- Google OAuth
AI
- Google Gemini API
Deployment
- Vercel — Frontend
- Render — Backend
- Supabase — Database & Authentication
⚙️ Local Development
1. Clone the repository
git clone https://github.com/rokith-dev/docuai.git
cd docuai
2. Backend Setup
Create and activate a virtual environment:
python -m venv .venv
Activate it:
.venv\Scripts\Activate.ps1
Install dependencies:
pip install -r backend\requirements.txt
Create the backend environment file:
backend/.env
Add the required backend environment variables:
SUPABASE_URL=your_supabase_url
SUPABASE_SECRET_KEY=your_supabase_secret_key
GEMINI_API_KEY=your_gemini_api_key
Start the backend:
uvicorn backend.main:app --reload
Backend:
http://127.0.0.1:8000
3. Frontend Setup
Open another terminal:
cd frontend
npm install
Create:
frontend/.env.local
Add:
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
Start the frontend:
npm run dev
Open:
http://localhost:3000
🔐 Environment Variables
Never commit real API keys or secret credentials to GitHub.
Frontend
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
Backend
SUPABASE_URL=
SUPABASE_SECRET_KEY=
GEMINI_API_KEY=
Backend secret keys must never be exposed to the browser.
📄 Document Generation Flow
User
 │
 ▼
Login with Google
 │
 ▼
Upload DOCX Template
 │
 ▼
Template Analysis
 │
 ▼
Semantic Field Detection
 │
 ▼
AI Content Generation
 │
 ▼
User Reviews Content
 │
 ▼
Optional Output Screenshot
 │
 ▼
DOCX Population
 │
 ▼
Generated Word Document
 │
 ▼
Download
🧠 Template Understanding
DocuAI identifies common document sections automatically.
Example:
TITLE
↓
AIM
↓
DESCRIPTION
↓
PROGRAM
↓
OUTPUT SCREENSHOT
↓
RESULT
The system converts these sections into structured fields.
Example:
{
  "name": "output",
  "label": "Output Screenshot",
  "content_type": "image"
}
🖼️ Output Screenshot
DocuAI supports:
- PNG
- JPG
- JPEG
- WEBP
The screenshot can be sent to the backend using:
output_image
The backend temporarily stores the uploaded image and the DOCX population system can insert it into the generated Word document.
📊 Table Support
DocuAI can detect table-based fields such as:
- Exercise Number
- Date
- Title
- YouTube Link
- Other table content
This allows templates containing structured tables to be populated automatically.
🔑 Authentication
DocuAI uses Supabase Authentication with Google OAuth.
Authentication flow:
User
 ↓
Google Login
 ↓
Supabase Auth
 ↓
Session
 ↓
Frontend
 ↓
Authorization Token
 ↓
FastAPI Backend
🗄️ Database
Supabase PostgreSQL stores document metadata and user-related information.
The documents table supports user ownership through:
user_id
Generated documents can therefore be associated with the authenticated user.
🌐 Production Deployment
Frontend — Vercel
The frontend is deployed using Vercel.
Production frontend:
https://docuai-gamma.vercel.app
Vercel configuration:
Framework: Next.js
Root Directory: frontend
Build Command: npm run build
Install Command: npm install
Backend — Render
The FastAPI backend is deployed using Render.
Backend:
https://docuai-backend-d007.onrender.com
Render configuration:
Build Command:
pip install -r backend/requirements.txt

Start Command:
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
🔒 CORS
The production frontend must be allowed by the backend.
Example:
allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://docuai-gamma.vercel.app",
]
🧪 Testing
Backend Health Check
Open:
https://docuai-backend-d007.onrender.com
Expected response:
{
  "message": "Welcome to DocuAI API",
  "status": "running",
  "version": "0.1.0"
}
Frontend
Open:
https://docuai-gamma.vercel.app
Test:
1. Google login
2. DOCX upload
3. Template analysis
4. AI content generation
5. Screenshot upload
6. Document generation
7. DOCX download
8. Open downloaded document
9. Verify formatting and generated content
🐛 Troubleshooting
Frontend cannot connect to backend
Check:
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
for local development.
For production:
NEXT_PUBLIC_API_BASE_URL=https://docuai-backend-d007.onrender.com
Google Login doesn't work
Check:
- Supabase Google provider
- Google OAuth credentials
- Supabase Site URL
- Supabase Redirect URLs
- Vercel Supabase environment variables
AI generation fails
Check the backend environment:
GEMINI_API_KEY=your_key
Do not put the Gemini API key in the frontend.
DOCX screenshot doesn't appear
Check:
- Screenshot is actually selected
- Frontend sends output_image
- Backend receives output_image
- Template detects Output Screenshot as content_type: image
- DOCX populator uses add_picture()
📌 Project Status
DocuAI includes the complete core workflow:
- Authentication
- Template upload
- Template analysis
- AI generation
- DOCX generation
- Document download
- Database integration
- Production frontend
- Production backend
🚀 Future Improvements
Possible future enhancements:
- Multiple screenshot support
- PDF export
- More DOCX template formats
- Custom AI model selection
- Document editing before download
- Template library
- Document sharing
- Version history
- Advanced formatting controls
- Drag-and-drop template editor
- AI-generated tables
- Multi-language document generation
👨‍💻 Author
Rokith
📜 License
This project is developed for educational and project purposes.