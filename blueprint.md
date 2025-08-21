# Project Blueprint

## Project Structure
```
sahrdaya-website/
├── .idx/
│   ├── airules.md
│   ├── dev.nix
│   └── mcp.json
├── .vscode/
│   └── settings.json
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── department-dashboard/
│   │   │   ├── peo-pso-po/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── utils/
│       ├── department_dashboard_function.js
│       └── firebase.js
├── GEMINI.md
├── README.md
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```
## New Features and Functionality

### Department Dashboard (`src/app/department-dashboard/`)

This section of the application provides a dashboard for managing department-specific information.

*   **Layout (`src/app/department-dashboard/layout.tsx`)**:
    *   Provides a shared layout for all pages within the department dashboard.
    *   Includes a navigation sidebar for easy access to different sections of the dashboard.
    *   Renders the child routes (sub-pages).

*   **PEO, PSO, PO Page (`src/app/department-dashboard/peo-pso-po/page.tsx`)**:
    *   This page is dedicated to viewing and editing the Program Educational Objectives (PEO), Program Specific Outcomes (PSO), and Program Outcomes (PO) data for a specific department.
    *   It utilizes the `getPoPsoPeo` function from `src/utils/department_dashboard_function.js` to fetch the relevant data from Firebase Firestore.
    *   The fetched data is displayed on the page.
    *   Includes functionality to edit the displayed PEO, PSO, and PO information.

### Utilities (`src/utils/`)

*   **`department_dashboard_function.js`**:
    *   Contains Firebase functions specifically designed for the department dashboard.
    *   Includes functions to fetch (`getPoPsoPeo`) and potentially edit the `poPsoPeo` data stored in Firestore.
    *   Imports the Firebase `db` instance from `src/utils/firebase.js`.

*   **`firebase.js`**:
    *   Initializes the Firebase application.
    *   Exports the Firebase `app` instance.
    *   Exports the Firestore database instance (`db`) for use in other parts of the application.

## Data Structure (Firebase Firestore)

*   `department` (collection)
    *   `[departmentId]` (document - e.g., `cse`)
        *   `poPsoPeo` (collection)
            *   `[btech/mtech/phd etc]` (document - e.g., `btech`)
                *   `peo` (field - array of strings)
                *   `pso` (field - array of strings)
                *   `po` (field - array of strings)