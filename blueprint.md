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
*   **Newsletter Management:**
    *   Implement fetching and displaying newsletters for a department. This is handled by the `fetchDepartmentNewsletters` function in `src/utils/department_dashboard_function_2.js`.
    *   Implement adding new newsletter years. This is handled by the `addNewsletterYear` function in `src/utils/department_dashboard_function_2.js`.
    *   Implement deleting newsletter years. This is handled by the `deleteNewsletterYear` function in `src/utils/department_dashboard_function_2.js`.
    *   **Implement adding new newsletter events (individual newsletters) to a specific year.** This is handled by the **`addNewsletterEvent` function** in `src/utils/department_dashboard_function_2.js`. This function takes `departmentId`, `year`, `newsletterName`, `start`, `end`, and `pdf` as arguments and adds a new document with the provided `newsletterName` as the document ID within the `newsLetter` subcollection of the specified year document for the given department, including the `start`, `end`, and `pdf` fields.
    *   Implement deleting individual newsletter events.
        *   Implement uploading newsletter PDFs to Firebase Storage with a path structure of `[departmentId]/newsLetter/[year]/[newsletterName].pdf`. The download URL and storage path are stored in Firestore.
    *   Create a UI in `src/app/department-dashboard/[departmentId]/newsLetter/page.tsx` to manage newsletter years and events.
        *   **Note:** The 'start' and 'end' date fields for newsletter events must be in the 'MM/DD/YYYY' format.
        *   **Add a form in `src/app/department-dashboard/[departmentId]/newsLetter/page.tsx` to add new newsletter events to a specific year.** This form includes input fields for 'Newsletter Name', 'Start Date', 'End Date', and 'PDF Link', as well as a dropdown to select the year. The form submission is handled by the `handleAddEvent` function, which calls the `addNewsletterEvent` utility function to add the new event to Firestore. After successful submission, the form fields are cleared and the newsletters are reloaded to display the new entry.

    *   Create dedicated components or sections within `facilities/layout.tsx` to handle the display of lab and library information.
    *   Ensure the routes `facilities/labs/page.tsx` and `facilities/library/page.tsx` correctly fetch and display their respective data.

        *   **Bug Fix:** A bug in the `uploadNewsletterPdf` function in `src/utils/department_dashboard_function_2.js` was fixed by adding proper error handling.
        *   **Bug Fix:** A bug in the `handleAddEvent` function in `src/app/department-dashboard/[departmentId]/newsLetter/page.tsx` was fixed by using the correct state setter for the PDF file.
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

*   **Implement adding new curriculum semesters to a scheme:**
    *   **Create a `addCurriculumSemester` function:** Define an asynchronous function that takes `departmentId`, `programId`, `schemeId`, `semesterId`, and `semesterData` as arguments. This function will add a document with the specified `semesterId` and `semesterData` to the "semesters" subcollection under the given scheme document.
    *   Add a UI element (e.g., a form) within the scheme details view in `curriculum-syllabus/page.tsx` to input new semester details and trigger the `addCurriculumSemester` function.
*   **Implement fetching and displaying semesters for a selected scheme:**
*   **Implement deleting semesters from a scheme:**
    *   **Create a `deleteCurriculumSemester` function:** Define an asynchronous function that takes `departmentId`, `programId`, `schemeId`, and `semesterId` as arguments. This function will delete the document with the specified `semesterId` from the "semesters" subcollection under the given scheme document.
    *   Add a delete button next to each displayed semester in the scheme details view in `curriculum-syllabus/page.tsx`.
    *   Implement a handler function for the delete button that confirms the deletion and calls the `deleteCurriculumSemester` function.
    *   After successful deletion, refetch and display the updated list of semesters for the selected scheme.

*   **Implement adding new curriculum subjects to a semester:**
    *   **Create a `addCurriculumSubject` function:** Define an asynchronous function in `/home/user/sahrdayadashboard/src/utils/department_dashboard_function.js` that takes `departmentId`, `programId`, `schemeId`, `semesterId`, and `subjectData` (including name, code, credit, elective status, and PDF file) as arguments.
    *   This function will handle uploading the subject's PDF file to Firebase Storage with a structured name (e.g., `gs://college-website-27cf1.firebasestorage.app/[departmentId]/curriculum&Syllabus/[programId]/schemes/[schemeId]/semesters/[semesterId]/subjects/[subject-name].pdf`).
    *   **Add 'isLab' field to subject data:** Modify the subject data structure to include a boolean field, `isLab`, to indicate if a subject is a lab.
    *   After successful upload, it will add a new document to the "subjects" subcollection under the specified semester document, including the subject details and the downloaded URL of the uploaded PDF.
    *   **Remove 'lab' subcollection creation in `addCurriculumSemester`:** Since subjects and labs are now integrated, remove the code that creates a separate 'lab' subcollection when adding a semester.
*   **Implement fetching and displaying semesters for a selected scheme:**
    *   Update the UI in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` to allow users to specify if a subject is a lab (e.g., using a checkbox) and potentially visually distinguish labs.
    *   **Create a `getCurriculumSubjects` function:** Define an asynchronous function in `/home/user/sahrdayadashboard/src/utils/department_dashboard_function.js` that takes `departmentId`, `programId`, `schemeId`, and `semesterId` as arguments.
    *   This function will fetch all subject documents from the "subjects" subcollection for the given semester.
    *   Modify the semester details view in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` to display the fetched subjects, including their names and a link to the uploaded PDF.
*   **Implement deleting subjects from a semester:**
    *   **Create a `deleteCurriculumSubject` function:** Define an asynchronous function in `/home/user/sahrdayadashboard/src/utils/department_dashboard_function.js` that takes `departmentId`, `programId`, `schemeId`, `semesterId`, and `subjectId` as arguments.
*   **Fix TypeScript error for missing `isLab` on state reset:** Ensure that when resetting the `newSubjectData` state in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx`, the object passed to `setNewSubjectData` includes the `isLab` property, initialized to `false`.

    *   This function will first delete the corresponding PDF file from Firebase Storage using the stored download URL or file path.
    *   Then, it will delete the subject document from the "subjects" subcollection.
    *   Add a delete button next to each displayed subject in the semester details view in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx`.
    *   Implement a handler function for the delete button that confirms the deletion and calls the `deleteCurriculumSubject` function. After successful deletion, refetch and display the updated list of subjects for the selected semester.

*   **Implement adding new curriculum labs to a semester:** Implement managing labs as a separate type from subjects.
*   **Fixing Errors:**

*   **Implement deleting schemes from a program:**
    *   **Create a `deleteCurriculumScheme` function:** Define an asynchronous function that takes `departmentId`, `programId`, and `schemeId` as arguments. This function will use your Firebase utility functions to delete the document corresponding to the specified scheme.
    *   Add a delete button next to each displayed scheme in `curriculum-syllabus/page.tsx`.
    *   Implement a handler function for the delete button that confirms the deletion and calls the `deleteCurriculumScheme` function.
    *   After successful deletion, refresh the displayed list of schemes.

### 3. PEO, PSO, and PO Management
*   **Fix nested button HTML error:** Modify the semester list rendering in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` to restructure the HTML and avoid nesting a button inside another button. This will likely involve using a `span` or `div` to wrap the semester name and placing the delete button as a sibling within the list item.

*   **Fix syntax error in semester delete button:** Fix the syntax error in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` at line 525 by adding the missing closing `</button>` tag for the semester delete button.

*   **Fix duplicate import of `deleteObject`:** Remove the redundant import statement for `deleteObject` from `/home/user/sahrdayadashboard/src/utils/department_dashboard_function.js`.

*   **Fix `ReferenceError: deleteObject is not defined`:** Add an import statement for `deleteObject` from the Firebase Storage SDK in `/home/user/sahrdayadashboard/src/utils/department_dashboard_function.js` to resolve the error when deleting subjects with associated PDF files.

*   **Fix `ReferenceError: ref is not defined`:** Add an import statement for `ref` from the Firebase Storage SDK in `/home/user/sahrdayadashboard/src/utils/department_dashboard_function.js` to resolve the error when creating a storage reference for deleting subjects.

*   **Fix TypeScript error for missing `isLab` on state reset:** Ensure that when resetting the `newSubjectData` state in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx`, the object passed to `setNewSubjectData` includes the `isLab` property, initialized to `false`.


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

                    *   `/semesters` (collection)
                        *   `[semesterId]` (document)
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

1. Continue troubleshooting the TypeScript error related to the missing `isLab` property when resetting the `newSubjectData` state in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx`.
2. Modify `src/utils/department_dashboard_function.js` to remove the creation of the 'lab' subcollection in the `addCurriculumSemester` function.
3. Implement the frontend logic for fetching, adding, and deleting subjects.
4. Continue with existing steps for Semester, Facilities, and PEO/PSO/PO management as planned.
