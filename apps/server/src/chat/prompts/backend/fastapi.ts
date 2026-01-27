/**
 * FastAPI Backend Prompt
 *
 * FastAPI + Python + SQLAlchemy 백엔드 개발 가이드
 */

export const FASTAPI_PROMPT = `## Backend: FastAPI + Python + SQLAlchemy

You are building a FastAPI backend with Python and SQLAlchemy ORM.

### Technology Stack (Backend)

| Category | Technology | Notes |
|----------|------------|-------|
| Runtime | Python 3.11+ | Latest stable |
| Framework | FastAPI | Async-first API framework |
| ORM | SQLAlchemy 2.0 | Async support |
| Database | SQLite (dev) / PostgreSQL (prod) | |
| Validation | Pydantic | Built into FastAPI |
| Server | Uvicorn | ASGI server |

### Project Structure

\`\`\`
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app
│   ├── config.py         # Settings
│   ├── database.py       # DB connection
│   ├── models/           # SQLAlchemy models
│   │   └── user.py
│   ├── schemas/          # Pydantic schemas
│   │   └── user.py
│   ├── routers/          # API routes
│   │   └── users.py
│   └── services/         # Business logic
│       └── user_service.py
├── requirements.txt
└── .env
\`\`\`

### Python Environment Setup (CRITICAL)

**ALWAYS use virtual environment for Python projects:**

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

pip install fastapi uvicorn sqlalchemy aiosqlite python-dotenv
pip freeze > requirements.txt
\`\`\`

### Virtual Environment Rules

1. **ALWAYS create venv** in the \`backend/\` directory
2. **NEVER install packages globally** - always use venv
3. **Keep requirements.txt updated** after installing new packages
4. **Include .gitignore** with venv/ excluded:
   \`\`\`
   # backend/.gitignore
   venv/
   __pycache__/
   *.pyc
   .env
   *.db
   \`\`\`
5. **Use python -m pip** to ensure correct pip version:
   \`\`\`bash
   python -m pip install <package>
   \`\`\`

### Main Application

\`\`\`python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
\`\`\`

### Database Configuration

\`\`\`python
# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
\`\`\`

### SQLAlchemy Model

\`\`\`python
# backend/app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
\`\`\`

### Pydantic Schemas

\`\`\`python
# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
\`\`\`

### Router with CRUD

\`\`\`python
# backend/app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserResponse, status_code=201)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
\`\`\`

### Run Command

\`\`\`bash
# Do NOT run this - the preview system handles it
uvicorn app.main:app --reload --port 3001
\`\`\`

### Environment Variables

\`\`\`
# backend/.env
DATABASE_URL=sqlite:///./dev.db
\`\`\`

### API Design Guidelines

- **RESTful conventions**: GET read, POST create, PUT update, DELETE delete
- **Use Pydantic schemas** for request/response validation
- **Dependency injection** with \`Depends()\`
- **Proper status codes**: 200, 201, 400, 404, 500
- **HTTPException** for error responses`;
