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

*   **Implement adding new curriculum semesters to a scheme:**
    *   **Create a `addCurriculumSemester` function:** Define an asynchronous function that takes `departmentId`, `programId`, `schemeId`, `semesterId`, and `semesterData` as arguments. This function will add a document with the specified `semesterId` and `semesterData` to the "semesters" subcollection under the given scheme document.
    *   Add a UI element (e.g., a form) within the scheme details view in `curriculum-syllabus/page.tsx` to input new semester details and trigger the `addCurriculumSemester` function.
*   **Implement fetching and displaying semesters for a selected scheme:**
    *   **Create a `getCurriculumSemesters` function:** Define an asynchronous function that takes `departmentId`, `programId`, and `schemeId` as arguments. This function will fetch all documents from the "semesters" subcollection under the given scheme document.
    *   Modify the scheme details view in `curriculum-syllabus/page.tsx` to display the fetched semesters.
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
    *   **Create a `addCurriculumLab` function:** Define an asynchronous function in `/home/user/sahrdayadashboard/src/utils/department_dashboard_function.js` that takes `departmentId`, `programId`, `schemeId`, `semesterId`, and `labData` (including name, code, credit, elective status, and PDF file) as arguments. This function will:
        *   Upload the PDF file to Firebase Storage with a structured name (e.g., `gs://college-website-27cf1.firebasestorage.app/[departmentId]/curriculum&Syllabus/[programId]/schemes/[schemeId]/semesters/[semesterId]/labs/[lab-name].pdf`).
        *   Add a new document to a "labs" subcollection under the specified semester document, including the lab details and the downloaded URL of the uploaded PDF.
    *   Add a UI element (e.g., a form) within the semester details view in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` to input new lab details and upload the PDF, triggering the `addCurriculumLab` function.
*   **Implement fetching and displaying labs for a selected semester:**
    *   **Create a `getCurriculumLabs` function:** Define an asynchronous function in `/home/user/sahrdayadashboard/src/utils/department_dashboard_function.js` that takes `departmentId`, `programId`, `schemeId`, and `semesterId` as arguments.
    *   This function will fetch all lab documents from the "labs" subcollection for the given semester.
    *   Modify the semester details view in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` to display the fetched labs, including their names and a link to the uploaded PDF.
*   **Implement deleting labs from a semester:**
    *   **Create a `deleteCurriculumLab` function:** Define an asynchronous function in `/home/user/sahrdayadashboard/src/utils/department_dashboard_function.js` that takes `departmentId`, `programId`, `schemeId`, `semesterId`, and `labId` as arguments.
    *   This function will first delete the corresponding PDF file from Firebase Storage using the stored download URL or file path. Then, it will delete the lab document from the "labs" subcollection.
    *   Add a delete button next to each displayed lab in the semester details view in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx`. Implement a handler function for the delete button that confirms the deletion and calls the `deleteCurriculumLab` function. After successful deletion, refetch and display the updated list of labs for the selected semester.

*   **Fixing Errors:**

*   **Continue troubleshooting TypeScript error for missing `isLab` on state reset:** Re-examine the code on line 320 of `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` and ensure `isLab: false` is explicitly included in the object passed to `setNewSubjectData` when resetting the state.

*   **Implement deleting schemes from a program:**
    *   **Create a `deleteCurriculumScheme` function:** Define an asynchronous function that takes `departmentId`, `programId`, and `schemeId` as arguments. This function will use your Firebase utility functions to delete the document corresponding to the specified scheme.
    *   Add a delete button next to each displayed scheme in `curriculum-syllabus/page.tsx`.
    *   Implement a handler function for the delete button that confirms the deletion and calls the `deleteCurriculumScheme` function.
    *   After successful deletion, refresh the displayed list of schemes.

### 3. PEO, PSO, and PO Management
*   **Fix Undefined Variables and Syntax Errors in Lab Management UI:** Declare state variables (`loadingLabs`, `labs`, `newLabData`, `addingLab`) and their setters (`setLabs`, `setNewLabData`, `setAddingLab`, `setLabFile`) using the `useState` hook in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx`. Define the `handleAddLab` and `handleDeleteLab` functions in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` that will call the corresponding Firebase functions (`addCurriculumLab`, `getCurriculumLabs`, `deleteCurriculumLab`). Ensure that `selectedProgramId`, `selectedSchemeId`, and `selectedSemesterId` are correctly referenced in the lab management UI. Correct any syntax errors related to `div` and unexpected expressions around lines 841-843 in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx`.

*   **Fix nested button HTML error:** Modify the semester list rendering in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` to restructure the HTML and avoid nesting a button inside another button. This will likely involve using a `span` or `div` to wrap the semester name and placing the delete button as a sibling within the list item.

*   **Fix syntax error in semester delete button:** Fix the syntax error in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` at line 525 by adding the missing closing `</button>` tag for the semester delete button.

*   **Fix duplicate import of `deleteObject`:** Remove the redundant import statement for `deleteObject` from `/home/user/sahrdayadashboard/src/utils/department_dashboard_function.js`.

*   **Fix `ReferenceError: deleteObject is not defined`:** Add an import statement for `deleteObject` from the Firebase Storage SDK in `/home/user/sahrdayadashboard/src/utils/department_dashboard_function.js` to resolve the error when deleting subjects with associated PDF files.

*   **Fix `ReferenceError: ref is not defined`:** Add an import statement for `ref` from the Firebase Storage SDK in `/home/user/sahrdayadashboard/src/utils/department_dashboard_function.js` to resolve the error when creating a storage reference for deleting subjects.

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
2. Modify `src/utils/department_dashboard_function.js` to add the `isLab` boolean field to the subject document when adding a subject.
3. Modify the subject adding form in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` to include a checkbox for "Is Lab" and update the `handleAddSubject` function to include this value.
4. (Optional) Modify the subject display in `/home/user/sahrdayadashboard/src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` to visually distinguish labs from regular subjects based on the `isLab` field.
2. Modify `src/app/department-dashboard/[departmentId]/curriculum-syllabus/page.tsx` to include UI for managing subjects within a selected semester.
3. Implement the frontend logic for fetching, adding, and deleting subjects.
4. Continue with existing steps for Semester, Facilities, and PEO/PSO/PO management as planned.