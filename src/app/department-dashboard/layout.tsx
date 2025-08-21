import Link from "next/link";

interface DepartmentDashboardLayoutProps {
  children: React.ReactNode;
}

const DepartmentDashboardLayout = ({
  children,
}: DepartmentDashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Department Dashboard</h2>
        <nav>
          <ul className="space-y-3">
            <li>
              <Link
                href="/department-dashboard/peo-pso-po"
                className="block px-3 py-2 rounded hover:bg-gray-700 transition"
              >
                PEO, PSO, PO
              </Link>
            </li>
             <li>
               <a href="/department-dashboard/programmes-offered">Programmes Offered</a>
              </li>

            {/* Future nav links */}
            <li>
              <Link
                href="/department-dashboard/courses"
                className="block px-3 py-2 rounded hover:bg-gray-700 transition"
              >
                Courses
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
};

export default DepartmentDashboardLayout;
