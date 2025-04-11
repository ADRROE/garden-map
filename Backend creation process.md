# 🧱 FastAPI Backend Setup for Garden Elements API

This document is a step-by-step guide capturing the full process of building a FastAPI backend to support a garden elements editor built in Next.js.

---

## 🔧 Starting Point
- We started with a **fully finished frontend** (Next.js) that displays a visual map with draggable elements.
- The backend needed to:
  - Store garden elements in a persistent database
  - Expose a REST API for Create, Read, Update, Delete (CRUD)

---

## 📁 Backend Setup Overview

### 1. **Project Structure**
```
backend/
├── app/
│   ├── crud.py              # Reusable database logic (SQLAlchemy)
│   ├── database.py          # SQLAlchemy DB connection setup
│   ├── elements.py          # FastAPI API endpoints (router)
│   ├── models.py            # SQLAlchemy table definitions
│   ├── schemas.py           # Pydantic data models (API I/O)
├── main.py                  # FastAPI app instance + router include
```

---

## ⚙️ Key Files and Responsibilities

### `database.py`
Sets up the database engine and session logic using SQLAlchemy.

```python
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

### `models.py`
Defines the actual database table via SQLAlchemy ORM class:
```python
class GardenElement(Base):
    __tablename__ = "garden_elements"
    id = Column(String, primary_key=True)
    name = Column(String)
    ...
```

### `schemas.py`
Defines the data shapes that FastAPI uses to validate input and format output. These are **Pydantic models**.
```python
class GardenElementBase(BaseModel):
    id: str
    name: str
    ...

class GardenElementCreate(GardenElementBase):
    pass

class GardenElement(GardenElementBase):
    pass

class GardenElementUpdate(BaseModel):
    id: str
    name: Optional[str] = None
    ...
```

### `crud.py`
This file encapsulates all **database interaction logic**. It’s called by the route functions in `elements.py`.
```python
def get_elements(db: Session):
    return db.query(models.GardenElement).all()

def create_element(...):
    ...
```

### `elements.py`
This file defines the **API routes**. It uses FastAPI’s routing system and depends on the functions defined in `crud.py`.
```python
@router.get("/")
def get_elements(...):
    return crud.get_elements(...)

@router.post("/")
def create_element(...):
    return crud.create_element(...)
```

### `main.py`
This is the main FastAPI app file.
```python
app = FastAPI()
app.include_router(elements.router, prefix="/api/elements")
```

---

## ✅ Functional Milestones

1. **GET** all elements from the DB
2. **POST** new elements from frontend and persist to DB
3. **PUT** to update position/size/etc of existing elements
4. **DELETE** to remove an element by ID

All operations successfully reflect in the database and sync with the frontend.

---

## 💡 Additional Explanations

### 1. `class GardenElementBase(BaseModel)` – What is this?
This is a **Pydantic model**, a special kind of Python class used to define and validate data in FastAPI. Think of it as a Python-native version of a TypeScript interface, but with extra powers like:

- Type validation at runtime (not just at development time like TS)
- Automatic request body parsing and response serialization
- Support for things like default values, aliases, field validators

It’s the core way FastAPI ensures incoming and outgoing data conforms to a defined structure.

### 2. Why do we need those empty subclasses like `GardenElementCreate` and `GardenElement`?
These are **specialized versions** of the base model for different use cases:

- `GardenElementCreate` is used when a new element is created via the API. It might omit read-only fields (like auto-generated timestamps or IDs in some cases).
- `GardenElement` is returned in API responses and may include extra fields the client should receive (like computed fields, timestamps, IDs).

Even if they look identical now, this pattern allows for clean separation of concerns and easy future extension.

> This is similar to how you'd create different TS interfaces extending the same base type for input vs output structures.

### 3. Why do we use `BaseModel` again for `GardenElementUpdate`, and this one isn’t empty?
`GardenElementUpdate` describes **partial updates**. It's based on `BaseModel` directly (not `GardenElementBase`) because it's not a full element definition — just a subset.

We don't extend `GardenElementBase` here because:
- All fields are optional (for PATCH-like behavior).
- It may not make sense to reuse validations or required fields from the base model.

### 4. What’s the point of `crud.py`?
The `crud.py` file contains **reusable database logic** — the actual SQLAlchemy operations (queries, inserts, deletes, etc.).

Why it’s useful:
- Keeps your route handlers (in `elements.py`) clean and focused on HTTP concerns.
- Helps with testing — you can test your logic without spinning up the full API server.
- Encourages separation of concerns: HTTP logic vs DB logic.

### 5. Why do we define similar functions again in `elements.py`?
In `elements.py`, you're defining the **API endpoints**. These:

- Handle incoming requests
- Parse and validate data via Pydantic
- Delegate the heavy lifting to `crud.py`
- Return responses to the client

Think of it like:

| File           | Responsibility                         |
|----------------|----------------------------------------|
| `elements.py`  | API logic (routes, validation)         |
| `crud.py`      | Database logic (query/update/insert)   |

They look similar because they deal with the same concepts — but they're different layers of your app.

### 6. If I want to extend the API, what should I reuse and what needs to be added?
Here's a quick checklist:

| When you want to...                       | You'll need to...                                                                 |
|------------------------------------------|-----------------------------------------------------------------------------------|
| Add a new kind of element                | - Add to `models.py` <br> - Add to `schemas.py` <br> - Extend `crud.py` and `elements.py` |
| Add a new route                          | - Add a new function in `elements.py` <br> - Possibly a helper in `crud.py`       |
| Change validation or structure           | - Update your Pydantic models in `schemas.py`                                     |
| Update how data is stored                | - Change your SQLAlchemy models in `models.py`                                    |
| Add new DB tables                        | - Define new SQLAlchemy models <br> - Create migrations (e.g. with Alembic)       |
| Add new computed fields or logic         | - Extend `crud.py` and schemas as needed                                          |

As you build more features, you'll reuse your:
- Pydantic base models
- DB connection logic
- API router and route style

And you'll extend:
- The `schemas.py` and `models.py` definitions
- The actual endpoint functions

---

This guide captures the full development lifecycle of a FastAPI + Next.js application with a clear separation between database logic, API routing, and data validation.

