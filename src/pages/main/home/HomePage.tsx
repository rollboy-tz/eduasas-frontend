import { useUser } from "@/lib/hooks";
import { DateUtils } from "@/lib/utils";

export const HomePage = () => {
    const { profile,  schools } = useUser();

    return (
        <div className="flex flex-col gap-6">

            {/* Welcome Header */}
            <div className="
        relative overflow-hidden
        rounded-xl sm:rounded-2xl
        bg-gradient-to-r from-blue-600 to-indigo-600
        p-5 sm:p-6 lg:p-8
        text-white shadow-md
    ">
                <div className="relative z-10 max-w-2xl">
                    <p className="text-sm text-blue-100">
                        {DateUtils.getGreeting()}
                    </p>

                    <h1 className="
                mt-1
                text-xl sm:text-2xl lg:text-3xl
                font-bold tracking-tight
            ">
                        Welcome,{" "}
                        {profile?.displayName ||
                            `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}` ||
                            "User"}
                    </h1>

                    <p className="
                mt-2
                text-sm sm:text-base
                text-blue-100
            ">
                        Manage your schools, students and activities from your dashboard.
                    </p>
                </div>

                {/* Background decoration */}
                <div className="
            absolute -right-16 -top-16
            h-40 w-40
            rounded-full
            bg-white/10
        " />

                <div className="
            absolute -bottom-20 right-10
            h-48 w-48
            rounded-full
            bg-white/5
        " />
            </div>


            {/* Main Section */}
            <section className="w-full">

                {schools?.length === 0 && (
                    <div className="
                flex flex-col items-center
                rounded-xl sm:rounded-2xl
                border border-dashed
                border-gray-300 dark:border-muted-700
                bg-white dark:bg-muted-900
                p-5 sm:p-8
                text-center
                shadow-sm
            ">
                        <div className="
                    flex h-12 w-12
                    items-center justify-center
                    rounded-full
                    bg-blue-100
                    text-blue-600
                    dark:bg-blue-900/30
                    dark:text-blue-400
                ">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 14l9-5-9-5-9 5 9 5z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 14l6.16-3.422A12.083 12.083 0 0118 15.5c0 1.105-.896 2-2 2H8c-1.104 0-2-.895-2-2 0-1.73.36-3.377 1.01-4.922L12 14z"
                                />
                            </svg>
                        </div>

                        <h3 className="
                    mt-4
                    text-lg sm:text-xl
                    font-semibold
                ">
                            Start with a school
                        </h3>

                        <p className="
                    mt-2
                    max-w-md
                    text-sm sm:text-base
                    text-gray-600
                    dark:text-gray-400
                ">
                            You haven't affiliated with any school yet.
                            Add your first school to get started.
                        </p>

                        <button className="
                    mt-5
                    w-full sm:w-auto
                    rounded-lg
                    bg-blue-600
                    px-5 py-2.5
                    text-sm font-medium
                    text-white
                    transition
                    hover:bg-blue-700
                    active:scale-95
                ">
                            Add School
                        </button>
                    </div>
                )}

            </section>

        </div>


    )
}