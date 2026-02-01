# AI Algorithmic Trading System

## Architecture
This project follows an Event-Driven Microservices Architecture.
- **Backend**: Python (FastAPI, PyTorch, Polars)
- **Frontend**: Next.js (React, TailwindCSS)
- **Database**: PostgreSQL + TimescaleDB
- **Infrastructure**: Docker Compose

## Project Structure
- `backend/`: API, ML Models, and Trading Logic.
- `frontend/`: Real-time Dashboard (Next.js).
- `database/`: Database schemas and migration scripts.
- `notebooks/`: Jupyter Notebooks for research and backtesting.
- `docker-compose.yml`: Local development infrastructure.

## Getting Started
1. **Backend**:
   ```bash
   cd backend
   poetry install
   ```
2. **Infrastructure**:
   ```bash
   docker-compose up -d
   ```
