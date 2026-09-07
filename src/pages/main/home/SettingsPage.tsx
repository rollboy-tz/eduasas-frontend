import { showFeedback, showConfirm } from "@/components/modals";
import { Button } from "@/components/atoms";
import { useToast } from "@/lib";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost" | undefined

export interface Confirm {
    title: string;
    message: string;
    confirmLabel?: string | undefined;
    cancelLabel?: string | undefined;
    variant?: ("primary" | "danger") | undefined;
    onConfirm: () => void | Promise<void>;
    onCancel?: (() => void) | undefined;
    buttonVariant?: ButtonVariant;
}

export interface Feedback {
    type: "success" | "error" | "warning";
    message: string;
    buttonVariant?: ButtonVariant;
    actions?: {
        label: string;
        onClick: () => void;
        variant?: "primary" | "secondary" | "danger" | undefined;
    }
}

export interface Toasts {
    message: string;
    type: "success" | "warning" | "error" | "info" | "loading";
    buttonVariant?: ButtonVariant;
}

export const SettingsPage = () => {
    
    const toast = useToast();

    const confirm: Confirm[] = [
        { variant: "primary", title: "Primary Confirm", message: "", onConfirm: () => console.log("Primary confirm"), onCancel: () => console.log("Primary Cancelled") },
        { variant: "danger", title: "Confirm Deletion", message: "Do you really want to delete this school?, This action can't be undone", onConfirm: () => console.log("Danger confirmed"), onCancel: () => console.log("Primary Cancelled") },
    ]

    const feedback: Feedback[] = [
        { type: "success", message: "Student Added: Student enrolled successfully", buttonVariant: "primary", actions: { label: "Ok", onClick: () => {""}, variant: "secondary" }  },
        { type: "error", message: "Access Denied: You don't have enough permission to perform this action.", buttonVariant: "danger", actions: { label: "Force", onClick: () => {""}, variant: "danger" }   },
        { type: "warning", message: "Thiss user need to come here", buttonVariant: "ghost"  },
    ]

    const toasts: Toasts[] = [
        { message: "Authentication suscessed!", type: "success", buttonVariant: "primary"  },
        { message: "Warning for a time", type: "warning", buttonVariant: "secondary" },
        { message: "Something went wrong", type: "error", buttonVariant: "danger"  },
        { message: "System was updated", type: "info", buttonVariant: "ghost"  }
    ]

    const buttonClasses = "text-base md:text-sm font-semibold min-w-23 capitalize";

    return (
        <div className="w-full min-h-screen place-items-center border border-slate-200">
            <div className="min-w-md p-3 rounded-lg bg-white shadow-lg flex flex-col items-center justify-center gap-5">

                <div className="flex flex-col justify-center gap-2">
                    <h2 className="font-heading text-lg font-black">Confirmation modals</h2>
                    <div className="w-full flex justify-center gap-3">
                        {
                            confirm.map((c, i) => (
                                <Button
                                    key={i}
                                    className={buttonClasses}
                                    variant={c.buttonVariant}
                                    onClick={() => {
                                        showConfirm({
                                            title: c.title,
                                            message: c.message,
                                            variant: c.variant,
                                            onConfirm: c.onConfirm,
                                            onCancel: c.onCancel

                                            
                                        })
                                    }}
                                >{c.variant}</Button>
                            ))
                        }
                    </div>
                </div>

                <div className="h-[1px] w-full bg-slate-200 block" />

                <div className="flex flex-col justify-center gap-2">
                    <h2 className="font-heading text-lg font-black">Feedback modals</h2>
                    <div className="w-full flex justify-center gap-3">
                        {
                            feedback.map((f, i) => (
                                <Button
                                    key={i}
                                    className={buttonClasses}
                                    variant={f.buttonVariant}
                                    onClick={()=> {
                                        showFeedback({
                                            type: f.type,
                                            message: f.message,
                                            actions: f.actions ? [
                                                { label: f.actions?.label, onClick: f.actions?.onClick, variant: f.actions?.variant }
                                            ] : undefined
                                        })
                                    }}
                                >{f.type}</Button>
                            ))
                        }
                    </div>
                </div>

                <div className="h-[1px] w-full bg-slate-200 block" />

                <div className="flex flex-col justify-center gap-2">
                    <h2 className="font-heading text-lg font-black">Toast</h2>
                    <div className="w-full flex justify-center gap-3">{
                        toasts.map((t, k) => (
                            <Button 
                                variant={t.buttonVariant}
                                className={buttonClasses}
                                onClick={() => {
                                    toast.show({ message: t.message, type: t.type, duration: 5000 })
                                }}
                                key={k}
                            >
                                {t.type}
                            </Button>
                        ))
                    }
                    </div>
                </div>
            </div>
        </div>
    )
}