"use client";
import Link from "next/link";
import { ReactNode, createContext, use } from "react";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{
    departmentId: string;
  }>;
}

interface DepartmentContextType {
  departmentId: string;
}

export const DepartmentContext = createContext<DepartmentContextType | null>(null);

const DepartmentDashboardLayout = ({ children, params }: LayoutProps) => {
  const { departmentId } = use(params);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {departmentId.toUpperCase()} Dashboard
          </h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href={`/department-dashboard/${departmentId}/about-department`}
                className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                About Department
              </Link>
            </li>
            <li>
 <Link
 href={`/department-dashboard/${departmentId}/hod-message`}
 className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
 >
 HOD Message
 </Link>
 </li>
            <li>
              <Link
                href={`/department-dashboard/${departmentId}/programmes-offered`}
                className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Programmes Offered
              </Link>
            </li>
            <li>
 <Link
 href={`/department-dashboard/${departmentId}/curriculum-syllabus`}
 className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
 >
 Curriculum & Syllabus
 </Link>
 </li>

            <li>
              <span className="block px-3 py-2 text-gray-500 font-medium">Facilities</span>
              <ul className="ml-4 mt-2 space-y-2">
                <li>
                  <Link
                    href={`/department-dashboard/${departmentId}/facilities/labs`}
                    className="block rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Labs
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/department-dashboard/${departmentId}/facilities/library`}
                    className="block rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Library
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <Link
                href={`/department-dashboard/${departmentId}/peo-pso-po`}
                className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                PEO / PSO / PO
              </Link>
            </li>

            <li>
              <Link
                href={`/department-dashboard/${departmentId}/newsLetter`}
                className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                People
              </Link>
            </li>
            <li>
              <span className="block px-3 py-2 text-gray-500 font-medium">Facilities</span>
              <ul className="ml-4 mt-2 space-y-2">
                <li>
                  <Link
                    href={`/department-dashboard/${departmentId}/people/students`}
                    className="block rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Students
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/department-dashboard/${departmentId}/people/dac`}
                    className="block rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    DAC
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/department-dashboard/${departmentId}/people/dqac`}
                    className="block rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    DQAC
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/department-dashboard/${departmentId}/people/bos`}
                    className="block rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Board of Studies
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <DepartmentContext.Provider value={{ departmentId }}>
        <main className="flex-1 p-8">{children}</main>
      </DepartmentContext.Provider>
    </div>
  );
};

export default DepartmentDashboardLayout;
