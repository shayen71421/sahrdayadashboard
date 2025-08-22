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
              <Link
                href="/department-dashboard/programmes-offered"
                className="block px-3 py-2 rounded hover:bg-gray-700 transition"
              >
                Programmes Offered
              </Link>
            </li>
            <li>
              <span className="block px-3 py-2 rounded hover:bg-gray-700 transition cursor-pointer">Facilities</span>
              <ul className="ml-4 space-y-2">
                <li>
                  <Link href="/department-dashboard/facilities/labs" className="block px-3 py-2 rounded hover:bg-gray-700 transition">Labs</Link>
                </li>
                <li>
                  <Link href="/department-dashboard/facilities/library" className="block px-3 py-2 rounded hover:bg-gray-700 transition">Library</Link>
                </li>
              </ul>

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
