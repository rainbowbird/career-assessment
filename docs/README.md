# Career Assessment System - Debug Manual

> Comprehensive debugging guide for developers and DevOps engineers

## 📚 Document Structure

```mermaid
graph TD
    A[Debug Manual] --> B[01-Frontend Debugging]
    A --> C[02-Backend Debugging]
    A --> D[03-Database Debugging]
    A --> E[04-Nginx Debugging]
    A --> F[05-Docker Debugging]
    A --> G[06-Common Issues]
    A --> H[07-Command Cheatsheet]
    
    B --> B1[Browser DevTools]
    B --> B2[API Debugging]
    B --> B3[Async Issues]
    
    C --> C1[Node.js Inspector]
    C --> C2[API Testing]
    C --> C3[Authentication]
    
    D --> D1[MySQL Queries]
    D --> D2[Data Validation]
    D --> D3[Connection Issues]
    
    E --> E1[Proxy Config]
    E --> E2[Static Files]
    E --> E3[Routing Rules]
    
    F --> F1[Container Status]
    F --> F2[Logs Analysis]
    F --> F3[Network Debug]
```

## 🚀 Quick Start

### System Architecture

```mermaid
graph LR
    User[User Browser] -->|HTTP| Nginx[Nginx :8080]
    Nginx -->|/api/*| Backend[Node.js :3000]
    Nginx -->|/*| Frontend[Static Files]
    Backend -->|SQL| MySQL[MySQL :3306]
    
    style User fill:#e1f5ff
    style Nginx fill:#ffeb3b
    style Backend fill:#c8e6c9
    style MySQL fill:#ffcdd2
```

### Debug Ports Reference

| Service | Port | Purpose | Access Command |
|---------|------|---------|----------------|
| Frontend | 8080 | Web Application | `http://localhost:8080` |
| Backend API | 3000 | REST API | `http://localhost:3000/api` |
| Node Inspector | 9229 | Debug Node.js | `chrome://inspect` |
| MySQL | 3306 | Database | `mysql -h localhost -P 3306` |
| MySQL X Protocol | 33060 | Extended Protocol | MySQL Shell |

## 📖 Document Guide

### For Frontend Developers
Start with:
1. [01-frontend-debugging.md](01-frontend-debugging.md) - Browser DevTools, API calls, async debugging
2. [06-common-issues.md](06-common-issues.md) - Quick reference for undefined values, caching issues

### For Backend Developers
Start with:
1. [02-backend-debugging.md](02-backend-debugging.md) - Node.js debugging, API testing
2. [03-database-debugging.md](03-database-debugging.md) - MySQL queries and data validation
3. [04-nginx-debugging.md](04-nginx-debugging.md) - Reverse proxy and routing

### For DevOps Engineers
Start with:
1. [05-docker-debugging.md](05-docker-debugging.md) - Container management and logs
2. [04-nginx-debugging.md](04-nginx-debugging.md) - Load balancer and static files
3. [07-command-cheatsheet.md](07-command-cheatsheet.md) - Quick commands reference

## 🔍 Debug Workflow

```mermaid
flowchart TD
    A[Issue Reported] --> B{Type?}
    
    B -->|Frontend| C[Check Browser Console]
    B -->|Backend| D[Check Docker Logs]
    B -->|Database| E[Check MySQL]
    B -->|Network| F[Check Nginx]
    
    C --> C1[Network Tab]
    C --> C2[Console Errors]
    C --> C3[LocalStorage]
    
    D --> D1[App Logs]
    D --> D2[Error Stack]
    D --> D3[API Response]
    
    E --> E1[Table Data]
    E --> E2[Connection]
    E --> E3[Query Log]
    
    F --> F1[Access Log]
    F --> F2[Error Log]
    F --> F3[Config Test]
    
    C1 --> G[Identify Issue]
    C2 --> G
    C3 --> G
    D1 --> G
    D2 --> G
    D3 --> G
    E1 --> G
    E2 --> G
    E3 --> G
    F1 --> G
    F2 --> G
    F3 --> G
    
    G --> H[Apply Fix]
    H --> I[Test Again]
    I -->|Fixed| J[Document Solution]
    I -->|Not Fixed| A
```

## 🛠️ Environment Setup

### Required Tools
- Docker & Docker Compose
- curl or HTTP client (Postman, Insomnia)
- MySQL client
- Node.js (for local debugging)
- Modern web browser with DevTools

### Optional Tools
- VS Code with debugging extensions
- MySQL Workbench
- Nginx (for local config testing)

## 📝 Contributing

When adding new debug scenarios:
1. Identify the component (Frontend/Backend/Database/Nginx/Docker)
2. Add to the appropriate document
3. Include actual error messages and solutions
4. Add to [06-common-issues.md](06-common-issues.md) if applicable

## ⚡ Emergency Contacts

- **System Down**: Check Docker first → `docker-compose ps`
- **Data Loss**: Check MySQL backups → `database/init.sql`
- **Security Issue**: Check `.env` files are in `.gitignore`

---

**Last Updated**: 2026-03-19  
**Version**: 1.0.0  
**Maintainers**: Development Team