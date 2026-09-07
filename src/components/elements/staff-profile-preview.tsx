// import { CopyButton } from "@/components/elements";
// import { ProfileHeader } from "@/components/ui";
// import { useRouter } from "next/navigation";
// import { Mail, Phone, Calendar, Briefcase, Hash, SquareArrowOutUpRight } from "lucide-react";
// import { useSchoolStaffList } from "@/hooks/school";
// import { cn, DateUtils } from "@/lib/utils";
// import Router from "next/router";
// import { routerServerGlobal } from "next/dist/server/lib/router-utils/router-server-context";

// export const StaffProfilePreview = ({ staffId }: { staffId: string }) => {
//     // ... logic yako ya kupata data (hapa tunatumia staffProfile kama object uliyotoa)
//     const { staffList } = useSchoolStaffList();
//     const staffProfile = staffList.find(s => s.staffId === staffId);
//     const router = useRouter();
//     if (!staffProfile) return <div>Staff not found</div>;

//     const { user, roles, designation, status, staffNumber, joiningDate } = staffProfile;
//     const primaryRole = roles.sort((a, b) => a.priority - b.priority)[0];

//     return (
//         <div className="w-full w-full bg-card rounded-xl overflow-hidden border shadow-sm">
//             {/* Header yenye picha na background */}
//             <ProfileHeader size="md" avatarPosition="left" className="mb-10" />

//             {/* Content Body */}
//             <div className="px-5 pb-5 -mt-6">
//                 <div className="flex justify-between items-start mb-4">
//                     <div>
//                         <h3 className="text-xl font-bold">{`${user.firstName} ${user.lastName}`}</h3>
//                         <p className="text-sm text-muted-foreground font-medium">
//                             {designation ?? primaryRole?.displayName}
//                         </p>
//                     </div>
//                     <span className={cn("badge", status === "ACTIVE" ? "badge-success" : "badge-error")}>
//                         {status}
//                     </span>
//                 </div>

//                 {/* Data Grid: Taarifa za mawasiliano na ajira */}
//                 <div className="grid grid-cols-1 gap-2 text-sm">
//                     <DataRow icon={<Mail size={16} />} label="Email" value={user.email} />
//                     <DataRow icon={<Phone size={16} />} label="Phone" value={user.phone || "N/A"} />
//                     <DataRow icon={<Hash size={16} />} label="Staff No" value={staffNumber} isCopyable />
//                     <DataRow icon={<Briefcase size={16} />} label="Role" value={primaryRole?.displayName} />
//                     <DataRow icon={<Calendar size={16} />} label="Joined" value={new Date(joiningDate).toLocaleDateString()} />
//                 </div>

//                 {/* Button */}
//                 <div className="mt-3">
//                     <button
//                         onClick={() => console.log(staffProfile.staffId)}
//                         className={cn("flex items-center gap-3 text-center justify-center h-10 bg-ring rounded-md shadow-sm w-full")}
//                     >
//                         <span className=" text-primary-foreground font-medium">View full profile</span>
//                         <SquareArrowOutUpRight size={16} className="text-primary-foreground"/>
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // Helper Component kwa ajili ya layout safi ya data
// const DataRow = ({ icon, label, value, isCopyable }: any) => (
//     <div className="flex items-center cursor-pointer justify-between p-2 hover:bg-ring/10 rounded-sm transition-colors">
//         <div className="flex items-center gap-2 text-muted-foreground">
//             {icon}
//             <span>{label}:</span>
//         </div>
//         <div className="flex items-center gap-2 font-medium">
//             {value}
//             {isCopyable && <CopyButton content={value} />}
//         </div>
//     </div>
// );