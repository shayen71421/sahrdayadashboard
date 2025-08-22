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
│   │   ├── department-dashboard/
│   │   │   ├── facilities/
│   │   │   │   ├── labs/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── library/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── department-dashboard/
│   │   │   └── peo-pso-po/
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

*   **Facilities Layout (`src/app/department-dashboard/facilities/layout.tsx`)**:
    *   Provides a shared layout for all pages within the facilities section (e.g., Labs, Library).
    *   Likely includes navigation specific to the facilities section.

*   **Labs Page (`src/app/department-dashboard/facilities/labs/page.tsx`)**:
    *   This page displays information about all labs within the department.
    *   It will fetch data for all labs and present it on a single page.
    *   This eliminates the need for separate pages for individual lab details.
*   **Firestore Structure:** Lab data is stored as arrays within a single document located at `department/cse/facilities/labs`. Each array within this document represents a different lab.
*   **Adding a Lab:** Adding a new lab involves adding a new array to the `department/cse/facilities/labs` document, where the key of the new array is the name of the new lab. This new array will be initialized with a size of 4, containing empty strings.
*   **Data Fetching:** The page will fetch the document at `department/cse/facilities/labs`, iterate over its fields, and extract the data from the arrays within it to display each lab.
*   **Display:** The page will display the name of each lab (which is the key in the Firestore document) and the contents of the array associated with that lab. It will also list the names of all other arrays present within the lab's data.
*   **New Functionality:** Users will be able to delete individual labs directly from this page. This involves adding a delete control for each lab and implementing a handler that utilizes the `deleteLab` function from `src/utils/department_dashboard_function.js`.
*   The page will display the contents of the 'lab name' array for each lab, and also list the names of all other arrays present within the lab's data.
 
*   **Library Page (`src/app/department-dashboard/facilities/library/page.tsx`)**:
*   This page displays information about the department's library.
*   It will fetch and display relevant library details.
*   **Deleting a Lab:** Deleting a lab involves removing the corresponding array field (using the lab name as the key) from the `department/cse/facilities/labs` document in Firestore.

  
*   **Individual Lab Detail Page (`src/app/department-dashboard/facilities/labs/[labId]/page.tsx`) - REMOVED**:
    *   This page has been removed as individual lab details are now displayed on the main Labs page (`src/app/department-dashboard/facilities/labs/page.tsx`).




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