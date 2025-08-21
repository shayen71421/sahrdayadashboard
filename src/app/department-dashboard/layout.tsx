import Link from 'next/link';

interface DepartmentDashboardLayoutProps {
  children: React.ReactNode;
}

const DepartmentDashboardLayout = ({ children }: DepartmentDashboardLayoutProps) => {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Department Dashboard</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <Link href="/department-dashboard/peo-pso-po">
                PEO, PSO, PO
              </Link>
            </li>
            {/* Add more navigation links here for other sub-pages */}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default DepartmentDashboardLayout;