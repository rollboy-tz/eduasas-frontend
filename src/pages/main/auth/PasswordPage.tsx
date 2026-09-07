import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { EduInput } from "@/components/fields/EduInput";
import { Button, InputLabel } from "@/components/atoms";
import { apiMutation, isApiError } from "@/lib/api";
import { useToast } from "@/lib/store";
import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const PasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();

    const mode = searchParams.get("s");
    const parIdentity = searchParams.get("identity") || searchParams.get("ui") || "";
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [identity, setIdentity] = useState("");
    const [formData, setFormData] = useState({ password: "", confirm: "" });
    const [error, setError] = useState<string | null>(null);

    // Ulinzi: Kama s haipo au sio sahihi, mlinde asipotee kwenye path isiyo na maana
    useEffect(() => {
        if (mode !== "forgot" && mode !== "reset") {
            navigate("/password?s=forgot", { replace: true });
            return;
        }
        if (mode === "reset" && !token?.trim()) {
            toast.show({ message: "Unauthorized access or missing reset token.", type: "error" });
            navigate("/password?s=forgot", { replace: true });
        }
    }, [mode, token, navigate, toast]);

    useEffect(() => {
        if (parIdentity) {
            setIdentity(parIdentity);
        }
    }, [parIdentity]);

    const handleForgotSubmit = async () => {
        setError(null);
        if (!identity.trim()) {
            setError("Please enter your email or phone number");
            return;
        }

        setLoading(true);
        try {
            const payload = { identity: identity.trim(), purpose: "FORGOT_PASSWORD" };
            const response = await apiMutation("post", "/auth/resend", payload);
            if (response.status === "success") {
                toast.show({ message: `OTP successfully sent to ${identity}`, type: "success" });
                navigate(`/verify?reason=reset&identity=${encodeURIComponent(identity.trim())}`);
            }
        } catch (err) {
            if (isApiError(err)) {
                setError(err.message || "Something went wrong, please try again");
            } else {
                setError("Network error, please check your connection");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async () => {
        setError(null);
        if (!formData.password || !formData.confirm) {
            setError("Please fill out all fields");
            return;
        }

        if (formData.password !== formData.confirm) {
            setError("Password and confirm password don't match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const response = await apiMutation("patch", "/auth/reset-password", { 
                resetToken: token, 
                newPassword: formData.password 
            });

            if (response.status === "success") {
                toast.show({ message: response.message || "Password changed successfully.", type: "success" });
                const loginParams = identity ? `?identity=${encodeURIComponent(identity)}` : "";
                navigate(`/login${loginParams}`, { replace: true });
            }
        } catch (err) {
            if (isApiError(err)) {
                setError(err.message || "Something went wrong, please retry");
            } else {
                setError("Network error, please check your connection");
            }
        } finally {
            setLoading(false);
        }
    };

    const getCleanParams = (currentIdentity: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (currentIdentity) {
            newParams.set("identity", currentIdentity);
        } else {
            newParams.delete("identity");
        }
        newParams.delete("s");
        newParams.delete("token");
        newParams.delete("ui");
        return newParams.toString();
    };

    const cleanParamsString = getCleanParams(identity);
    const loginHref = cleanParamsString ? `/login?${cleanParamsString}` : `/login`;

    return (
        <div className="w-full rounded-md flex flex-col gap-2 border border-slate-100 bg-white/80 p-5">
            <AnimatePresence mode="wait">
                {mode === "forgot" ? (
                    <motion.div
                        key="forgot"
                        className="flex flex-col gap-2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="mb-3">
                            <h2 className="font-heading text-2xl font-black mb-2">Forgot Password?</h2>
                            {error ? (
                                <span className="w-full bg-red-50 border border-red-200/60 p-1.5 block rounded text-base lg:text-sm text-red-500">
                                    {error}
                                </span>
                            ) : (
                                <span className="w-full p-1 text-base lg:text-sm text-slate-500 block">
                                    Enter your registered email or phone to receive a verification OTP.
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 mb-2">
                            <InputLabel label="Email or Phone Number" required />
                            <EduInput
                                type="contact"
                                required
                                size="lg"
                                placeholder="name@institution.com or phone"
                                value={identity}
                                onChange={(v) => setIdentity(v)}
                                onError={(msg) => setError(msg)}
                                className="bg-white border border-slate-100"
                            />
                        </div>

                        <div className="pt-2">
                            <Button 
                                onClick={handleForgotSubmit}
                                disabled={loading}
                                className="font-bold text-base md:text-sm w-full"
                            >
                                {loading ? "Sending OTP..." : "Request OTP"}
                            </Button>
                        </div>

                        <div className="text-center pt-3 border-t border-slate-100 mt-2">
                            <Link 
                                to={loginHref}
                                className="text-xs font-semibold text-blue-600 hover:underline flex items-center justify-center gap-1.5"
                            >
                                <ChevronLeft size={14} /> Back to Sign In
                            </Link>
                        </div>
                    </motion.div>
                ) : mode === "reset" ? (
                    <motion.div
                        key="reset"
                        className="flex flex-col gap-2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="mb-3">
                            <h2 className="font-heading text-2xl font-black mb-2">Reset Password</h2>
                            {error ? (
                                <span className="w-full bg-red-50 border border-red-200/60 p-1.5 block rounded text-base lg:text-sm text-red-500">
                                    {error}
                                </span>
                            ) : (
                                <span className="w-full p-1 text-base lg:text-sm text-slate-500 block">
                                    Please enter a secure new password for your account.
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 mb-2">
                            <InputLabel label="New Password" required />
                            <EduInput
                                type="password"
                                required
                                size="lg"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(v) => setFormData({ ...formData, password: v })}
                                onError={(msg) => setError(msg)}
                                className="bg-white border border-slate-100"
                            />
                        </div>

                        <div className="flex flex-col gap-1 mb-2">
                            <InputLabel label="Confirm New Password" required />
                            <EduInput
                                type="password"
                                required
                                size="lg"
                                placeholder="••••••••"
                                value={formData.confirm}
                                onChange={(v) => setFormData({ ...formData, confirm: v })}
                                onError={(msg) => setError(msg)}
                                className="bg-white border border-slate-100"
                            />
                        </div>

                        <div className="pt-2">
                            <Button
                                onClick={handleResetSubmit}
                                disabled={loading}
                                className="font-bold text-base md:text-sm w-full"
                            >
                                {loading ? "Updating Password..." : "Reset Password"}
                            </Button>
                        </div>

                        <div className="text-center pt-3 border-t border-slate-100 mt-2">
                            <Link 
                                to={loginHref}
                                className="text-xs font-semibold text-blue-600 hover:underline flex items-center justify-center gap-1.5"
                            >
                                <ChevronLeft size={14} /> Back to Sign In
                            </Link>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default PasswordPage;