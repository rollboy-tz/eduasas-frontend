import { cn, DateUtils } from "@/lib/utils";
import { NotificationItem } from "@/types"
import { Trash2 } from "lucide-react";

interface MinNotiCardfProps {
    notification: NotificationItem;
    onClicked: (link: string | null, id: string) => void;
    onCleared: (id: string) => void;
}


export const MinNotifCard = ({ notification, onClicked, onCleared }: MinNotiCardfProps) => {
    const handleClick = () => {
        onClicked(notification.link, notification.id)
    }

    const handleClear = () => {
        onCleared(notification.id)
    }

    return (
        <div className={cn("flex flex-col text-xs space-y-1 bg-slate-100 hover:bg-muted-200 border border-slate-200 p-2 rounded-sm cursor-default",
        )} onClick={handleClick}>
            <div className="flex flex-1 items-center w-full justify-between">
                <h3 className="font-bold">{notification.title}</h3>
                {!notification.isRead && <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>}
            </div>

            <span className="text-slate-800">{notification.content}</span>
            <div className="flex items-center gap-2 justify-end">
                <button className="p-[3px] cursor-pointer" onClick={handleClear}>
                    <Trash2 size={15} className="text-amber-800/80" />
                </button>
                <span className="text-[11px] text-indigo-500">
                    {DateUtils.formatRelative(notification.createdAt)}
                </span>
            </div>
        </div>
    )
}