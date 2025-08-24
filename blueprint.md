# Project Blueprint

This blueprint outlines the development plan for the Sahrdaya website, focusing on the department dashboard and curriculum/syllabus sections.

## Current Status

*   Basic project structure is set up with Next.js.
*   Firebase integration is started, with initial utility functions for interacting with Firestore.
*   Routing for department dashboards and specific sections (about, HOD message, curriculum, etc.) is in place.
*   Basic fetching and displaying of curriculum programs is implemented in `src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx`.

## Planned Features and Development Steps

### 1. Department Dashboard Core Functionality

*   **Implement dynamic department content loading:**
    *   Fetch department-specific data (HOD message, about information, facilities, etc.) based on the `departmentId` in the URL.
    *   Use Firebase utility functions (`getDepartmentData`, etc.) to retrieve data from Firestore.
    *   Display the fetched data in the respective pages (`hod-message/page.tsx`, `about-department/page.tsx`, etc.).
*   **Enhance Facilities Section:**
    *   Implement fetching and displaying data for specific facilities (labs, library).
    *   Create dedicated components or sections within `facilities/layout.tsx` to handle the display of lab and library information.
    *   Ensure the routes `facilities/labs/page.tsx` and `facilities/library/page.tsx` correctly fetch and display their respective data.

### 2. Curriculum and Syllabus Management

*   **Implement adding new curriculum programs:**
    *   Create a UI (form) in `curriculum-syllabus/page.tsx` to input new program details.
    *   Utilize the existing `addCurriculumProgram` function to add the new program to Firestore.
    *   Handle form submission and display feedback to the user.
*   **Implement fetching and displaying schemes for selected programs:**
    *   Modify `curriculum-syllabus/page.tsx` to allow users to select a specific program.
    *   When a program is selected, fetch the associated "schemes" (curricula/syllabi) from a subcollection under the program document in Firestore.
    *   **Create a `getProgramSchemes` function** in `src/utils/department_dashboard_function.js` (or a similar utility file) to fetch the schemes subcollection for a given department ID and program ID.
    *   Display the fetched schemes to the user.
*   **Implement adding new schemes to a program:**
    *   **Create a `addCurriculumScheme` function:** Define an asynchronous function that takes `departmentId`, `programId`, and `schemeData` as arguments. This function will use your Firebase utility functions to add a document to the "schemes" subcollection under the specified program document for the given department.
    *   Add a UI element (e.g., a button or form) in `curriculum-syllabus/page.tsx` that appears when a program is selected, allowing the user to input the details for a new scheme and trigger the `addCurriculumScheme` function.
    *   Handle form submission and display feedback.

*   **Implement deleting schemes from a program:**
    *   **Create a `deleteCurriculumScheme` function:** Define an asynchronous function that takes `departmentId`, `programId`, and `schemeId` as arguments. This function will use your Firebase utility functions to delete the document corresponding to the specified scheme.
    *   Add a delete button next to each displayed scheme in `curriculum-syllabus/page.tsx`.
    *   Implement a handler function for the delete button that confirms the deletion and calls the `deleteCurriculumScheme` function.
    *   After successful deletion, refresh the displayed list of schemes.

### 3. PEO, PSO, and PO Management

*   **Implement fetching and displaying PEOs, PSOs, and POs:**
    *   Fetch the relevant data for PEOs, PSOs, and POs from Firestore in `peo-pso-po/page.tsx`.
    *   Display this data in a clear and organized manner.
*   **Implement adding and editing PEOs, PSOs, and POs (Optional in initial phase):**
    *   If required, add UI and functions to add and edit this data in Firestore.

## Data Structure (Firestore)

*   `/departments` (collection)
    *   `[departmentId]` (document)
        *   `name`: String
        *   `hodMessage`: String
        *   `about`: String
        *   `/curriculumPrograms` (collection)
            *   `[programId]` (document)
                *   `name`: String
                *   `description`: String
                *   `/schemes` (collection)
                    *   `[schemeId]` (document)
                        *   `name`: String
                        *   `year`: Number
                        *   `syllabusLink`: String
                        *   `curriculumLink`: String
        *   `/facilities` (collection)
            *   `[facilityId]` (document)
                *   `name`: String
                *   `description`: String
                *   `type`: "lab" or "library"
        *   `/peoPsoPo` (document)
            *   `peos`: Array of Strings
            *   `psos`: Array of Strings
            *   `pos`: Array of Strings

## Technologies

*   Next.js (React Framework)
*   TypeScript
*   Firebase (Authentication, Firestore, Hosting)
*   Tailwind CSS (for styling)

## Next Steps

1.  Create the `addCurriculumScheme` and `getProgramSchemes` functions in the Firebase utility file.
2.  Modify `curriculum-syllabus/page.tsx` to include UI for selecting programs, displaying schemes, and adding new schemes.
3.  Implement the data fetching and display logic for facilities (labs and library).
4.  Implement the data fetching and display logic for PEOs, PSOs, and POs.