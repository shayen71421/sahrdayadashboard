"use client";
import Link from "next/link";
import { ReactNode, createContext, use } from "react"; // 👈 note: importing use

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
  // ✅ unwrap params (new requirement in Next.js 15+)
  const { departmentId } = use(params);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4">
        <nav>
          <ul>
            <li className="mb-2">
              <Link href={`/department-dashboard/${departmentId}/programmes-offered`}>
                Programmes Offered
              </Link>
            </li>
            <li className="mb-2">
              Facilities
              <ul className="ml-4 mt-1">
                <li>
                  <Link href={`/department-dashboard/${departmentId}/facilities/labs`}>
                    Labs
                  </Link>
                </li>
                <li>
                  <Link href={`/department-dashboard/${departmentId}/facilities/library`}>
                    Library
                  </Link>
                </li>
              </ul>
            </li>
            <li className="mb-2">
              <Link href={`/department-dashboard/${departmentId}/peo-pso-po`}>
                PEO/PSO/PO
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <DepartmentContext.Provider value={{ departmentId }}>
        <main className="flex-1 p-6">{children}</main>
      </DepartmentContext.Provider>
    </div>
  );
};

export default DepartmentDashboardLayout;
