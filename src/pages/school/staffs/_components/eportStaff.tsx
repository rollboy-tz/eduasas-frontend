import { Download } from "lucide-react";
import { exportDataToSpreadsheet, type SpreadsheetColumnDef } from "@/lib//utils";
import { useSchoolStaffList } from "@/lib/hooks";

interface StaffExportRow {
  staffNumber: string;
  firstName: string;
  lastName: string;
  status: string;
}

const staffExportColumns: SpreadsheetColumnDef<StaffExportRow>[] = [
  { key: "staffNumber", header: "Staff No" },
  { key: "firstName", header: "First Name" },
  { key: "lastName", header: "Last Name" },
  { key: "status", header: "Status" },
];

export function ExportStaffButton() {
  const { staffList } = useSchoolStaffList();

  function handleExport() {
    const rows: StaffExportRow[] = staffList.map((s) => ({
      staffNumber: s.staffNumber,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      status: s.status,
    }));

    exportDataToSpreadsheet({
      fileName: "staff-directory.xlsx",
      columns: staffExportColumns,
      data: rows,
    });
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
    >
      <Download className="h-3.5 w-3.5" />
      Export
    </button>
  );
}