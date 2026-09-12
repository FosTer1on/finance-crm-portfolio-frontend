# Finance CRM — Frontend

Frontend for a multi-company financial CRM focused on fast daily financial operations, cash management, debt workflows, settlements, and end-of-day reconciliation.

The interface is designed for dense desktop workflows where operators need to enter and review many financial operations with minimal friction.

> **Disclaimer:** All company names, counterparties, financial figures, and business scenarios shown in this repository are fictional/demo data used solely to demonstrate the system's functionality.

## Overview

Finance CRM is a React application built as the operator-facing interface for a modular Django REST backend.

The frontend covers multiple financial domains:

- Dashboard
- Clearing
- ASIA
- TARLE
- DEN XAN
- MMA
- Cash
- Debts

The UI is intentionally desktop-first and optimized for repetitive financial data entry rather than consumer-style navigation.

Backend repository:

`https://github.com/FosTer1on/finance-crm-portfolio-backend`

---

## Key Features

### Dashboard

The main dashboard provides a consolidated view of the selected business day.

It displays:

- business-day status;
- cash balances;
- bank-account balances;
- module-level totals;
- cash to receive;
- cash to give;
- profit/loss results;
- daily counterparty settlements;
- drill-down details by counterparty and module;
- close-day controls.

The dashboard supports detailed views for daily settlement data without requiring users to navigate away from the main workflow.

---

### Clearing

The clearing module supports:

- incoming and outgoing operations;
- counterparties;
- percentages;
- calculated settlement amounts;
- daily operation lists;
- day-based filtering;
- participation in end-of-day settlement calculations.

---

### ASIA

The ASIA interface supports:

- incoming operations;
- outgoing operations;
- counterparty selection;
- operation percentages;
- daily totals;
- settlement summaries;
- configurable daily settlement parameters.

---

### TARLE

The TARLE module supports:

- incoming operations;
- outgoing operations;
- product selection;
- operation percentages;
- day-based operation lists;
- settlement totals.

---

### DEN XAN

The DEN XAN interface includes:

- distributor-based operations;
- incoming operations;
- outgoing operations;
- MTG amounts;
- redirects;
- commissions;
- VAT-related flows;
- exchange-rate inputs;
- expenses;
- daily totals;
- integration with MMA operations.

---

### MMA

The MMA interface supports:

- multiple bank accounts;
- incoming operations;
- outgoing operations;
- DEN XAN-related operations;
- VAT operations;
- redirects;
- bank commissions;
- expenses;
- daily settlement calculations.

---

### Cash

The Cash page manages real cash balances separately by currency.

Supported currencies include:

- UZS
- USD

Features include:

- cash deposits;
- cash withdrawals;
- currency exchange;
- transaction history;
- current balance display.

---

### Debts

The portfolio snapshot includes a complete debt-management interface.

Supported workflows include:

- viewing current debts;
- `They owe us`;
- `We owe them`;
- UZS and USD balances;
- manual debt creation;
- partial repayment;
- repayment of a specific debt;
- multi-currency repayment;
- netting;
- conversion;
- forgiveness;
- audit/history views.

---

## Backend-Driven Financial Logic

The frontend is intentionally not the source of truth for financial calculations.

The general flow is:

```text
User input
   ↓
Frontend validation / formatting
   ↓
Backend command
   ↓
Backend financial calculation
   ↓
Fresh state returned from API
   ↓
UI refresh
```

Official financial totals, balances, settlement results, commissions, and business-rule outcomes are calculated by the backend.

The frontend avoids using JavaScript floating-point arithmetic as the authoritative source for financial results.

---

## Financial Inputs

Reusable financial input components are used across the application.

### MoneyInput

`MoneyInput` provides:

- formatted money entry;
- string-based value handling;
- consistent UX for large financial values;
- reusable integration across multiple forms.

### CounterpartySelect

`CounterpartySelect` provides a shared counterparty-selection workflow used across financial modules.

This reduces duplicated selection logic between pages.

---

## Keyboard-First Workflow

The application includes reusable keyboard-navigation hooks designed for fast operator workflows.

### `useFormKeyboardNavigation`

Supports:

- Enter → next field;
- programmable field ordering;
- focus first/last field;
- focus next/previous field;
- submit-on-Enter behavior;
- textarea handling with `Shift + Enter`.

### `usePairedFormNavigation`

Supports paired financial forms where left/right inputs are logically related.

For configured field pairs:

```text
Tab
→ move to matching field in the opposite form
```

This is useful for dense two-sided financial entry workflows.

---

## Request Race Protection

Several data-heavy pages protect against stale asynchronous responses.

The frontend uses request IDs to ensure that an older request cannot overwrite newer state.

Example scenario:

```text
User selects 10 Sep
→ immediately selects 11 Sep
→ request for 10 Sep finishes last
```

The stale response is ignored instead of replacing the current 11 Sep data.

This pattern is used in modules such as:

- Dashboard detail views;
- Clearing;
- DEN XAN;
- other day-based financial pages.

---

## Authentication

The frontend uses JWT authentication with:

- access token;
- refresh token;
- automatic token refresh;
- authenticated user bootstrap;
- protected routes;
- public login route;
- automatic logout on authentication failure.

Authentication state is managed through Zustand.

Tokens are stored through a centralized storage utility.

---

## Routing

Main routes:

```text
/login
/
/clearing
/asia
/tarle
/den-xan
/mma
/cash
/debts
```

Protected financial pages are wrapped by `ProtectedRoute`.

Unauthenticated users are redirected to `/login`.

Authenticated users are redirected away from the public login page.

---

## Application Layout

The main application layout includes:

- fixed account controls;
- authenticated user display;
- logout action;
- shared bottom navigation;
- routed page content.

The UI uses a dense desktop layout intended for operational work rather than large marketing-style screens.

---

## Architecture

The frontend is organized by responsibility:

```text
src/
├── api/
├── app/
│   ├── providers/
│   └── router/
├── components/
│   ├── common/
│   ├── feedback/
│   ├── finance/
│   └── navigation/
├── constants/
├── hooks/
├── layouts/
├── pages/
├── store/
├── styles/
└── utils/
```

### `api/`

Contains API clients grouped by backend domain:

```text
auth
dashboard
clearing
asia
tarle
denXan
mma
cash
debts
companies
counterparties
settlements
```

### `components/finance/`

Contains reusable finance-oriented UI components such as:

- money inputs;
- money display;
- counterparty selection;
- date-related controls;
- common financial form elements.

### `hooks/`

Contains reusable interaction logic, including:

- debounced values;
- keyboard form navigation;
- paired-form navigation.

### `pages/`

Each financial domain owns its page-level UI, components, hooks, and styles.

---

## State Management

Zustand is used for application-level state where shared persistence is useful.

The authentication store manages:

- current user;
- access token;
- refresh token;
- authenticated state;
- application initialization;
- login;
- logout;
- token-refresh updates.

Most financial page state remains local to page-specific hooks and components instead of being pushed into one global store.

---

## Error Handling

API errors are normalized through a shared error layer.

This allows the UI to display consistent error messages instead of leaking raw Axios/server responses directly into components.

---

## UI Stack

The application uses:

- Ant Design
- Ant Design Icons
- CSS Modules
- shared application styles

The visual approach is intentionally compact:

- dense tables;
- small spacing;
- clear borders;
- minimal decoration;
- explicit financial labels;
- fast data entry.

---

## Tech Stack

- React 19
- React DOM 19
- Vite 8
- React Router 7
- Zustand 5
- Axios
- Ant Design 6
- Ant Design Icons
- Day.js
- CSS Modules
- ESLint

---

## Local Development

### 1. Clone the repository

```bash
git clone git@github.com:FosTer1on/finance-crm-portfolio-frontend.git
cd finance-crm-portfolio-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy:

```text
.env.example
```

to:

```text
.env
```

Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

The API base URL is required by the shared Axios client.

### 4. Start development server

```bash
npm run dev
```

Default Vite development URL:

```text
http://localhost:5173
```

---

## Available Scripts

Development:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Validation

The portfolio snapshot was validated with:

```bash
npm install
npm run lint
npm run build
```

Result:

```text
0 npm vulnerabilities
ESLint passed
Production build completed successfully
```

Vite may report a large-chunk warning for the current bundle.

This is a performance optimization opportunity rather than a build failure.

---

## Environment

Required frontend environment variable:

```env
VITE_API_BASE_URL=<backend-api-base-url>
```

Example development value:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

No API secrets should be stored in frontend environment variables.

---

## Backend Integration

The frontend expects the companion Django REST API.

Backend repository:

**Finance CRM — Backend**

https://github.com/FosTer1on/finance-crm-portfolio-backend

Typical local setup:

```text
React / Vite
http://localhost:5173
        │
        ▼
Django REST API
http://127.0.0.1:8000/api
        │
        ▼
SQLite / PostgreSQL
```

---

## Design Decisions

### Desktop-first UI

The application is built primarily for internal operators working with many financial records during the day.

A dense desktop interface is more appropriate for this workflow than a card-heavy consumer UI.

### Backend as financial source of truth

The frontend does not attempt to reproduce complex financial rules independently.

This reduces the chance of frontend/backend calculation divergence.

### Page-level domain separation

ASIA, TARLE, DEN XAN, MMA, Clearing, Cash, and Debts have separate pages because their workflows differ significantly.

Trying to force all of them into a single generic transaction screen would reduce clarity.

### Reusable financial components

Common financial inputs and selection workflows are implemented once and reused across modules.

### Explicit async race handling

Fast date switching and repeated requests can otherwise create stale UI state.

Request guards are used where needed to keep the interface consistent.

---

## Repository Purpose

This repository is a portfolio snapshot of a non-trivial financial CRM frontend.

It is intended to demonstrate:

- React application architecture;
- domain-oriented page structure;
- REST API integration;
- authentication flows;
- reusable financial components;
- keyboard-oriented UX;
- complex operational forms;
- request race handling;
- financial dashboard design;
- maintainable separation between UI and financial business logic.

It is not distributed as an accounting product or financial advisory system.

---

## Disclaimer

All company names, counterparties, financial figures, and business scenarios contained in this repository are fictional/demo data used solely to demonstrate the application's functionality.

No real credentials, production secrets, or customer financial data are included in the repository.
