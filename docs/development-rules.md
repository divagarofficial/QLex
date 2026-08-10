# QLex Development Guidelines & Architecture Conventions

## 1. Core Technology Stack
- **Backend Framework**: Python FastAPI with SQLAlchemy ORM and Alembic database migrations.
- **Frontend Framework**: Next.js 15 (App Router), TypeScript, TailwindCSS, and Framer Motion.
- **Database Engine**: PostgreSQL with UUID primary keys.
- **Microservices**: Node.js (`whatsapp-service`) for WhatsApp Baileys/Web JS daemon.

---

## 2. Coding & Architectural Standards

### A. Database Modifications & Migrations
- All database schema changes must be declared in SQLAlchemy models under `backend/app/models/`.
- Generate Alembic migration scripts via `alembic revision --autogenerate -m "<description>"`.
- Do not modify existing columns directly in production without a corresponding migration script.

### B. Navigation & Frontend Routing
- Always define pages inside `src/app/` using App Router conventions (`page.tsx`).
- Ensure all relative navigation links in sidebar/header components map to valid existing pages to prevent 404 errors.

### C. Automated Testing & Verification
- Unit and integration tests are placed under `backend/`.
- Ensure tests use pytest-compatible function signatures (`test_*`).
- Do not execute live external API calls at module import scope. Wrap calls in test functions with fallback error handling.

### D. WhatsApp Microservice Maintenance
- Keep `whatsapp-service/server.js` synchronized with `backend/whatsapp-service/server.js`.
- Always enforce message deduplication filters to prevent duplicate customer alerts.
