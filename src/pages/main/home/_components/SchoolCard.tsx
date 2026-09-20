
import { JSX } from "react"
import { text } from "@/lib/string";
import { cn } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";
import { UserAffiliatedSchool } from "@/types";
import { CopyButton } from "@/components/atoms";
import { LucideIcon, MoreHorizontal, School2 } from "lucide-react";

interface SchoolCardProps {
    school: UserAffiliatedSchool;
}

const STATUS_STYLES: { [key: string]: string } = {
    pending: "bg-blue-400 text-white",
    active: "bg-green-700 text-white",
    closed: "bg-red-700 text-white",
    trashed: "bg-red-700 text-white",
    suspended: "bg-yellow-700 text-white"
} as const;

import {
    AlertCircle,
    CheckCircle2,
    ShieldAlert,
    Trash2,
} from "lucide-react";



export const SchoolCard = ({ school }: SchoolCardProps): JSX.Element => {

    const navigate = useNavigate();

    const STATUS_INFO = {
        pending: {
            icon: AlertCircle,
            className: "bg-blue-50 border-blue-200 text-blue-700",
            message:
                "Your school setup is incomplete. Complete the academic calendar and grading system configuration to activate your workspace.",
        },

        active: {
            icon: CheckCircle2,
            className: "bg-green-50 border-green-200 text-green-700",
            message:
                "Workspace is active and ready",
        },

        suspended: {
            icon: ShieldAlert,
            className: "bg-yellow-50 border-yellow-200 text-yellow-700",
            message:
                school.primaryRole.roleKey === "OWNER"
                    ? "Your school has been suspended. Please contact support to resolve the issue and restore access."
                    : "This school has been suspended by the owner or administrator. Please contact them for more information.",
        },

        closed: {
            icon: AlertCircle,
            className: "bg-red-50 border-red-200 text-red-700",
            message:
                school.primaryRole.roleKey === "OWNER"
                    ? "This school is currently closed. You can reopen it at any time or permanently delete it if it is no longer needed."
                    : "This school has been closed by its owner. Please contact the owner if you need access.",
        },

        trashed: {
            icon: Trash2,
            className: "bg-red-100 border-red-300 text-red-800",
            message:
                school.primaryRole.roleKey === "OWNER"
                    ? "This school has been moved to the trash. You can restore it before it is permanently deleted."
                    : "This school has been moved to the trash by its owner and is no longer accessible.",
        },
    } as const;

    const BUTTON_ITEMS = {
        pending: {
            onclick: () => navigate(`/school/setup?schoolId=${school.schoolId}&request_src=school_card`),
            text: "Setup Now",
            className: ""
        },

        active: {
            onclick: () => navigate(`/schools/switch-workspace?school_slug=${school.slug}&request_src=school_card`),
            text: "Open Workspace",
            className: ""
        },

        closed: {
            onclick: () => console.log("Closed"),
            text: school.primaryRole.roleKey === "OWNER" ? "Retrieve" : "Contact Support",
            className: "",
        },

        trashed: {
            onclick: () => console.log("Trashed"),
            text: school.primaryRole.roleKey === "OWNER" ? "Restore" : "Contact Support",
            className: "",
        },

        suspended: {
            onclick: () => console.log("Suspended"),
            text: school.primaryRole.roleKey === "OWNER" ? "Review Reason" : "Contact Support",
            className: ""
        }
    } as const;

    const status = school.status.toLowerCase();

    //const status = "closed"

    const info = STATUS_INFO[status as keyof typeof STATUS_INFO];
    const buttonStatus = BUTTON_ITEMS[status as keyof typeof BUTTON_ITEMS]

    const StatusIcon = info.icon;
    return (
        <div
            className="w-full max-w-md rounded-md bg-white shadow-sm p-4 flex flex-col overflow-hidden"
        >
            <div className="flex items-start">
                <div className="border-r border-gray-200 px-2">
                    <div className="rounded bg-blue-900 p-2 rounded-full">
                        <School2 className="h-5 w-5 text-white" />
                    </div>
                </div>
                <div className="flex-1 flex flex-col space-y-5 p-2">
                    <div className="flex items-center justify-between h-7">

                        {/* School name & ID */}
                        <div className="flex-1 flex flex-col gap-1">
                            <h3 className="text-xs font-black capitalize">{school.displayName || school.name}</h3>
                            <div className="flex gap-1 items-center">
                                <span className="text-[11px] font-bold">ID: </span>
                                <span className="text-[10px] tracking-wider font-bold bg-muted-200 px-[2px] py-[1px] rounded-[2px] border border-muted-300">{school.schoolId}</span>
                                <CopyButton content={school.schoolId} />
                            </div>
                        </div>

                        {/* Scool status */}
                        <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-medium rounded-full px-3 py-1 tracking-wider", STATUS_STYLES[status])}>
                                {text.capitalize(status)}
                            </span>

                            <div className="bg-muted-300 p-1 rounded-full cursor-pointer">
                                <MoreHorizontal size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Action center */}
                    <div className="flex flex-col gap-1">
                        <div
                            className={cn(
                                "flex items-start gap-2 rounded-md border p-2",
                                info.className
                            )}
                        >
                            <StatusIcon size={15} className="mt-0.5 shrink-0" />

                            <p className="text-[11px] leading-5">
                                {info.message}

                                {status !== "active" && (
                                    <>
                                        {" "}
                                        <Link
                                            to="#"
                                            className="font-semibold text-primary-500 hover:underline"
                                        >
                                            Learn more...
                                        </Link>
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-4">

                            <button
                                onClick={buttonStatus.onclick}
                                className="rounded-md cursor-pointer text-xs tracking-wider font-semibold text-white bg-primary-500 px-5 py-2"
                            >
                                {buttonStatus.text}
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface RowProps {
    icon: LucideIcon;
    value?: string | null;
    label?: string;
    className?: string;
    variant?: "default" | "code";
}

export const Row = ({
    icon: Icon,
    value,
    label,
    className,
    variant = "default",
}: RowProps) => {
    if (!value) return null;

    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted-100">
                <Icon size={15} className="text-muted-600" />
            </div>

            <div className="min-w-0 flex-1">
                {label && (
                    <p className="text-[9px] font-medium uppercase tracking-wide text-muted-500">
                        {label}
                    </p>
                )}

                <p
                    className={cn(
                        "truncate text-sm text-foreground",

                        variant === "default" &&
                        "font-medium",

                        variant === "code" &&
                        "inline-flex w-fit rounded-md border border-muted-300 bg-muted-100 px-2 py-0.5 font-mono text-xs tracking-normal text-muted-700",

                        className
                    )}
                >
                    {value}
                </p>
            </div>
        </div>
    );
};