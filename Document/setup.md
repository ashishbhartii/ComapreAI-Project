# CompareAI Setup Guide

## 1. Clone repository

git clone https://github.com/YOUR_USERNAME/compareai.git

cd compareai

---

## 2. Setup Backend

cd backend

cp .env.example .env

# edit .env and add your keys

npm install

npm run start:dev

Backend will run on:
http://localhost:3001

---

## 3. Setup Frontend

open new terminal

cd frontend

npm install

npm run dev

Frontend will run on:
http://localhost:5173

---

## 4. Verify backend

Open browser:

http://localhost:3001/health

Expected:

{
  "status": "healthy"
}

---

## 5. Test system

Open:

http://localhost:5173

Enter prompt and test streaming.