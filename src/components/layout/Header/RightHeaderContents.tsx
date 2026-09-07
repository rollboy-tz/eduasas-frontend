//path: src/components/layout/HeaverV2/RightHeaderContents
import { useIsMobileView } from "@/lib/store"
//import { useBadges } from "@/lib/hooks"
import { useProfilePanel } from "../ProfilePanel"
import { CommandIcon, Search, User } from "lucide-react"

export const RightHeaderContents = () => {
    const isMobile = useIsMobileView();
    //const { hasAnyPending } = useBadges();
    const { toggleProfilePanel } = useProfilePanel();
    return (
        <div className="flex items-center gap-3">

            {/* Serch togggle point */}
            <button className="flex items-center h-7 gap-1 p-1 rounded-md bg-white shadow-sm">
                <Search size={19} />
                {!isMobile && (
                    <div className="flex items-center gap-5">
                        <span className="bg-muted-50 text-sm text-muted-500 font-medium text-start font-medium rounded h-6 w-25 p-1">Search...</span>
                        <div className="flex items-center p-1 gap-1 bg-primary-100 h-5 rounded text-muted-500 font-semibold text-sm">
                            <CommandIcon size={14} /> <span className="font-semibold text-sm">K</span>
                        </div>
                    </div>
                )}
            </button>


            {/* User avatar point */}
            <button className="flex h-7 items-center bg-white rounded-md shadow-sm gap-1 px-1 cursor-pointer"
                onClick={toggleProfilePanel}
            >
                <div className="rounded-full hover:bg-primary-50 p-1">
                    <User size={16} fill="muted-900" />
                </div>
            </button>

        </div>
    )
}