# SmartQuiz 🚀

## 🛠 Prerequisites
- Docker Desktop
- Node.js (v18+)

## 🚀 Getting Started

### 1. Database & Cache
Run the infrastructure using Docker:
```bash
docker compose up -d
2. Backend Setup
Bash
cd backend
npm install
# Create a .env file based on the credentials in docker-compose.yml
npm run start:dev
3. Frontend Setup
Bash
cd frontend
npm install
ng serve
