# Environment Setup

This project consists of a React frontend and a FastAPI backend.

## Frontend
The frontend is built with React and Vite. dependencies are managed via `npm`.
- Setup command: `npm install`
- Start command: `npm run dev`
- Build command: `npm run build`

## Backend
The backend is built with FastAPI. Dependencies are in `requirements.backend.txt`.
- Setup command: `pip install -r requirements.backend.txt`
- Entry point: `main.py`
- Server run command: `python main.py` or `uvicorn api.index:app --reload`
