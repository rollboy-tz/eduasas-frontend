import { useNotifications } from "@/lib/hooks";
import { JSX } from "react";
import { MinNotifCard } from "./NotificationCard";
import { BellOff } from "lucide-react";


export const NotificationsCotainer = (): JSX.Element => {
    const { notifications, clearNotifications, markAsRead } = useNotifications();
    return (
        <div className="flex flex-col gap-2 p-2">
            <h2 className="font-heading font-black">Notifications</h2>

            {(notifications.length > 0) ? (
                <div className="flex flex-col space-y-1">
                    {notifications.map((notification, key) => (
                        <MinNotifCard
                            onCleared={(id) => clearNotifications([id])}
                            onClicked={(link, id) => {
                                markAsRead([id])
                                if (link) {
                                    window.location.href = link;
                                }
                            }}
                            key={key}
                            notification={notification}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center">
                    <div className="py-15 text-indigo-800 place-items-center space-y-3">
                        <div className="grid place-items-center rounded-full bg-blue-200/50 h-15 w-15">
                            <BellOff size={25}/>
                        </div>
                        <h3 className="font-heading font-black">No Notification</h3>
                    </div>
                </div>
            )}
        </div>
    )
}