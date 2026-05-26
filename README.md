# Nakowa-mangement-system
# Nakowa EMS — Event & Restaurant Management System

> A frontend management system for Nakowa Events Centres and Restaurants Ltd, combining event hall booking, restaurant POS, kitchen operations, inventory tracking, and business reporting into one centralized platform.

---

## About the Project

Nakowa EMS was built to solve the challenge of running an event centre and a restaurant under one roof with no unified system. Before this, bookings were tracked manually, restaurant sales were unrecorded, and there was no clear view of business performance.

This system brings everything together — from the moment a customer books a hall, to the kitchen receiving a live order, to the cashier processing payment, to management pulling a monthly report.

> **Current phase:** Frontend only. All data is handled through API requests to a JSON Server mock backend (`db.json`). The real backend with Express and PostgreSQL will be written in the next phase.

---

## Features

### Event management
- Hall booking and reservations
- Event scheduling calendar
- Customer records and contact management
- Payment tracking and deposit management
- Invoice and receipt generation for events

### Restaurant operations
- Point-of-sale (POS) system for food and drinks
- Table management
- Live kitchen order display (kitchen screen)
- Receipt printing integration
- Menu and pricing management

### Inventory & stock
- Stock tracking for ingredients and supplies
- Low-stock alerts
- Inventory usage reports

### Reporting & analytics
- Daily and monthly sales reports
- Event income tracking
- Restaurant income tracking
- Combined business performance overview

### System administration
- Role-based access control
- Secure login for all staff
- System preferences and configuration
- User account management

---

## User Roles

| Role | Access level |
|------|-------------|
| **Admin** | Full system access — settings, users, all modules, all reports |
| **Manager** | Same as admin for daily operations — no system settings or user management |
| **Kitchen** | Live order display only — sees what to cook, no prices or payments |
| **Cashier** | POS transactions — takes orders, processes payments, prints receipts |

---

## Tech Stack

### Current (Phase 1 — Frontend)

| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Routing | React Router |
| State management | (Context API / Zustand ) |
| HTTP requests | Fetch API / Axios |
| Mock backend | JSON Server |
| Mock database | db.json |
| Styling | (Tailwind / nd like some CSS modules) |

### Planned (Phase 2 — Full Stack)

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT (role-based) |
| ORM | Prisma / Sequelize |

---

## Getting Started

### Prerequisites

```bash
node >= 18.x
npm >= 9.x
```

### Installation

```bash
# Clone the repository
git clone https://github.com/brodamusleem.git

# Navigate into the project
cd nakowa

# Install dependencies
npm install
```

### Running the app

You need two terminals — one for React, one for JSON Server.

```bash
# Terminal 1 — start the React frontend
npm run dev
# then for the server you run
npm start
for concurent running

# Terminal 2 — start the JSON Server mock backend

# then for the server you run
npm start  db.json --port 3001
for concurent running
```

Then open `http://localhost:5173` in your browser.

---

## API Endpoints (JSON Server)

All requests go to `http://localhost:3001`. JSON Server auto-generates REST endpoints from `db.json`.

| Resource | Endpoint | Methods |
|----------|----------|---------|
| Events | `/events` | GET, POST, PUT, DELETE |
| Bookings | `/bookings` | GET, POST, PUT, DELETE |
| Customers | `/customers` | GET, POST, PUT, DELETE |
| Orders | `/orders` | GET, POST, PUT, DELETE |
| Menu items | `/menuItems` | GET, POST, PUT, DELETE |
| Inventory | `/inventory` | GET, POST, PUT, DELETE |
| Payments | `/payments` | GET, POST, PUT, DELETE |
| Users | `/users` | GET, POST, PUT, DELETE |
| Reports | `/reports` | GET |

---

## Project Structure

```

```

---

## Roadmap

### Phase 1 — Frontend (current)
- [x] System design and role planning
- [x] Proposal and requirements
- [ ] Project setup (React + JSON Server)
- [ ] Auth and role-based routing
- [ ] Admin & manager dashboard
- [ ] Event booking module
- [ ] Cashier POS screen
- [ ] Kitchen live order display
- [ ] Inventory management module
- [ ] Reports and analytics module

### Phase 2 — Backend (coming next)
- [ ] Express server setup
- [ ] PostgreSQL database design
- [ ] REST API endpoints
- [ ] JWT authentication
- [ ] Connect frontend to real backend
- [ ] Deployment

---

## Client

**Nakowa Events Centres and Restaurants Ltd**
Developed by **Muslim Hafiz**

---

## License

This project is proprietary software developed for Nakowa Events Centres and Restaurants Ltd. All rights reserved.
 
