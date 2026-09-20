import { EduButton, SmartResponsiveList, SmartTable } from "@/components/elements";
import { EduInput } from "@/components/fields/EduInput";
import { useSchoolStaffList, useSort, useSearch } from "@/lib/hooks";
import { FaUserTie } from "react-icons/fa";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { Search, User, Briefcase, Shield, MoreVertical, Edit, Eye } from "lucide-react";
import { useState } from "react";
import { DateUtils } from "@/lib";

export type StaffMember = {
    staffId: string;
    staffNumber: string;
    designation: string | null;
    joiningDate: string;
    status: "ACTIVE" | "ON-LEAVE" | "RESIGNED" | "TERMINATED" | "TRASHED" | "SUSPENDED";
    roles: {
        roleKey: string;
        displayName: string;
        priority: number;
        restrictionLevel?: string;
        assignedAt: string;
    }[];
    user: {
        uid: string;
        picture: string | null;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
    };
};

export const StaffDirectoryView = () => {
    const { staffList } = useSchoolStaffList();
    const [searchTerm, setSearchTerm] = useState("");

    const searched = useSearch(staffList, searchTerm);
    const { sorted, dir, setDir } = useSort(searched, "user.firstName", "asc");

    const getStatusBadge = (status: StaffMember["status"]) => {
        const styles: Record<string, string> = {
            ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
            "ON-LEAVE": "bg-amber-50 text-amber-700 border-amber-200",
            SUSPENDED: "bg-orange-50 text-orange-700 border-orange-200",
            RESIGNED: "bg-gray-100 text-gray-700 border-gray-200",
            TERMINATED: "bg-rose-50 text-rose-700 border-rose-200",
            TRASHED: "bg-red-50 text-red-700 border-red-200",
        };
        return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
    };
    const Icon = dir === "asc" ? HiSortDescending : HiSortAscending;
    return (
        <div className="w-full flex flex-col gap-3">
            {/* Toolbar section */}
            <div className="flex items-center justify-between md:justify-end gap-2">
                <div className="flex items-center gap-1">
                    <EduInput
                        size="sm"
                        icon={Search}
                        placeholder="Search staff by name or number..."
                        onChange={(val) => setSearchTerm(val)}
                        className="rounded-md border border-slate-200 shadow-2xs max-w-xs"
                    />

                    {/* <EduButton
                        variant="secondary"
                        className="h-10"
                        onClick={() => {
                            const sDir = dir === "asc" ? "desc" : "asc";
                            setDir(sDir);
                        }}
                    >
                        <Icon className="h-6 w-6" />
                    </EduButton> */}
                </div>
            </div>

            {/* Responsive Staff List */}
            <SmartResponsiveList
                className="bg-gray-50 rounded-sm"
                stickyHeaderClassName="py-3"
                bodyClassName="bg-white/60 border-y border-slate-200"
                cardClassName="border border-slate-200 rounded-sm bg-white hover:bg-white/90 p-2"
                cardHeaderClassName="border-slate-100"
                cardRowsClassName="text-gray-700 text-xs"
                rowClassName="text-sm hover:bg-gray-100 text-gray-700 transition-all duration-300"
                rowKey="staffId"
                data={sorted}
                columns={[
                    {
                        header: "Staff Member",
                        className: "flex-1 min-w-[220px]",
                        isPrimary: true,
                        render: (item: StaffMember) => (
                            <div className="flex gap-3 items-center py-1 line-clamp-1">
                                {item.user.picture ? (
                                    <img
                                        src={item.user.picture}
                                        alt=""
                                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                                    />
                                ) : (
                                    <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-blue-100 text-blue-900 rounded-full font-medium">
                                        <FaUserTie className="h-5 w-5" />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {item.user.firstName} {item.user.lastName}
                                    </span>
                                    <span className="text-xs text-gray-500 w-53 line-clamp-1">{item.user.email || item.user.phone || "No contact info"}</span>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: "Staff No. & Designation",
                        className: "w-48 flex-1 text-center",
                        render: (item: StaffMember) => (
                            <div className="flex flex-col py-1">
                                <span className="font-medium text-gray-800 text-sm font-semibold">
                                    {item.designation || item.roles[0].displayName}
                                </span>
                            </div>
                        )
                    },
                    {
                        header: "Roles",
                        className: "w-44 hidden md:flex flex-col",
                        render: (item: StaffMember) => (
                            <div className="flex flex-wrap gap-1 py-1 text-sm font-mibold">
                                <span>{item.staffNumber}</span>
                            </div>
                        )
                    },
                    {
                        header: "Joining Date",
                        className: "w-32 hidden lg:block",
                        render: (item: StaffMember) => (
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                                {DateUtils.formatDate(item.joiningDate)}
                            </div>
                        )
                    },
                    {
                        header: "Status",
                        className: "w-28 text-center",
                        isSecondary: true,
                        render: (item: StaffMember) => (
                            <div className="h-10 flex items-center justify-center">
                                <span className={`text-[11px] shrink-0 font-semibol px-2 py-0.5 rounded-full border ${getStatusBadge(item.status)}`}>
                                    {item.status}
                                </span>
                            </div>

                        )
                    },
                    {
                        header: "Actions",
                        className: "w-24 text-right",
                        render: (item: StaffMember) => (
                            <div className="flex items-center justify-end gap-1">
                                <button
                                    onClick={() => console.log("View staff:", item.staffId)}
                                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                                    title="View Profile"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => console.log("Edit staff:", item.staffId)}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded transition-colors"
                                    title="Edit Staff"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                            </div>
                        )
                    }
                ]}
            />
        </div>
    );
};