import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/atoms";
import { apiMutation, isApiError } from "@/lib/api";
import { useToast } from "@/lib/store";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { resetuserKey } from "@/lib";

type VerifyRes = { resetToken: string } | null;

export const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const params = new URLSearchParams(searchParams.toString());
  const identity = searchParams.get("identity") || searchParams.get("ui") || "";
  const otp_reason = searchParams.get("reason"); // 'reset' or 'register'

  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string>("");
  
  // Muda wa kusubiri kabla ya kuruhusu Resend (Sekunde 180 = Dakika 3)
  const [countdown, setCountdown] = useState<number>(180);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Ulinzi: Hakikisha kuna identity na reason sahihi
  useEffect(() => {
    if (!identity || (otp_reason !== "reset" && otp_reason !== "register")) {
      navigate("/login", { replace: true });
    }
  }, [identity, otp_reason, navigate]);

  // Countdown timer kwa ajili ya Resend Code (Dakika 3)
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  // Handle input change for 6-digit OTP boxes
  const handleChange = (index: number, value: string) => {
    // Ruhusu namba pekee
    const digitsOnly = value.replace(/[^0-9]/g, "");
    if (!digitsOnly && value !== "") return;

    const newValues = [...otpValues];
    // Chukua namba ya mwisho tu ikiwa mtumiaji ameweka herufi zaidi ya moja kwenye boksi moja
    newValues[index] = digitsOnly.slice(-1);
    setOtpValues(newValues);
    setError("");

    // Auto-focus next input
    if (digitsOnly && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Smart Paste Handler: Inaondoa herufi zote (kama EAO au nyinginezo) na kuchukua namba 6 za mwisho au za mwanzo
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    
    // Chuja namba pekee kutoka kwenye maandishi yaliyopastiwa
    const extractedDigits = pastedText.replace(/[^0-9]/g, "").slice(0, 6);

    if (extractedDigits.length > 0) {
      const digits = extractedDigits.split("");
      // Jaza nafasi zilizobaki kama ni chini ya 6
      while (digits.length < 6) {
        digits.push("");
      }
      setOtpValues(digits);
      
      // Focus kwenye boksi la mwisho lililojazwa au la 5
      const focusIndex = Math.min(extractedDigits.length - 1, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const rawOtp = codeToVerify || otpValues.join("");
    if (rawOtp.length < 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    // ONGEZA PREFIX NYUMA YA PANZIA: EAO-XXXXXX
    const fullOtp = `EAO-${rawOtp}`;

    setError("");
    setIsLoading(true);

    try {
      const res = await apiMutation<VerifyRes>("post", "/auth/verify", {
        identity,
        otp: fullOtp
      });

      if (res.status === "success") {
        const message = res.message || "Verified successfully!";
        toast.show({ message, type: "success" });

        if (otp_reason === "reset") {
          const token = res.data?.resetToken;
          if (!token) {
            setError("Reset token missing from response");
            setIsLoading(false);
            return;
          }

          // Kwenda kwenye password form mpya kwa mtindo wa s=reset
          navigate(`/password?s=reset&token=${encodeURIComponent(token)}&identity=${encodeURIComponent(identity)}`, { replace: true });
        } else {
          let return_url = params.get("return_url") || "/home";

          if (return_url?.includes("/auth/login") || return_url?.startsWith("/auth/")) {
            return_url = "/home";
          }

          const finalParams = new URLSearchParams(searchParams.toString());
          const authParams = ["identity", "reason", "token", "return_url", "error", "code", "utm_source", "utm_campaign", "reset_token"];
          authParams.forEach((p) => finalParams.delete(p));

          const queryString = finalParams.toString();
          const destination = queryString
            ? `${return_url}${return_url.includes("?") ? "&" : "?"}${queryString}`
            : return_url;

          const event = new CustomEvent("eduasas:login");
          window.dispatchEvent(event);
          resetuserKey();

          navigate(destination, { replace: true });
        }
      } else {
        const message = res.message || "Something went wrong. Unable to verify the OTP.";
        setError(message);
      }
    } catch (error) {
      if (isApiError(error)) {
        const message = error.message || "Error occurred while verifying.";
        setError(message);
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    if (otpValues.every((val) => val !== "")) {
      handleVerify(otpValues.join(""));
    }
  }, [otpValues]);

  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    setResending(true);
    setError("");
    try {
      const purpose = otp_reason === "reset" ? "FORGOT_PASSWORD" : "RESEND_OTP";
      const response = await apiMutation("post", "/auth/resend", { identity, purpose });
      if (response.status === "success") {
        toast.show({ message: `New verification code sent to ${identity}`, type: "success" });
        setCountdown(180); // Anzisha upya hesabu ya dakika 3 (sekunde 180)
      }
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message || "Failed to resend code");
      } else {
        setError("Network error, please check your connection");
      }
    } finally {
      setResending(false);
    }
  };

  // Badilisha sekunde kuwa mfumo wa Dakika:Sekunde (mf. 03:00)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const loginHref = identity ? `/login?identity=${encodeURIComponent(identity)}` : "/login";

  return (
    <div className="w-full rounded-md flex flex-col gap-4 border border-slate-100 bg-white/80 p-6 shadow-none">
      {/* Header Section */}
      <div className="space-y-1.5 text-center sm:text-left">
        <h2 className="font-heading text-2xl font-black text-slate-900">
          Verify Code
        </h2>
        {error ? (
          <span className="w-full bg-red-50 border border-red-200/60 p-2 block rounded text-base lg:text-sm text-red-500">
            {error}
          </span>
        ) : (
          <p className="text-sm text-slate-500">
            Enter the 6-digit code sent to <strong className="text-slate-800">{identity}</strong>
          </p>
        )}
      </div>

      {/* OTP Input Boxes (Zero shadow, clean border only) */}
      <div className="flex justify-center gap-1.5 py-2" onPaste={handlePaste}>
        {otpValues.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-11 h-12 text-center text-xl font-bold rounded-md border border-slate-200 bg-white text-slate-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-600 outline-none transition-all shadow-none"
          />
        ))}
      </div>

      {/* Actions with proper spacing */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={() => handleVerify()}
          disabled={isLoading}
          className="font-bold text-base md:text-sm w-full h-11 rounded-lg cursor-pointer"
        >
          {isLoading ? "Verifying..." : "Verify & Continue"}
        </Button>

        <div className="flex items-center justify-between text-xs pt-2">
          <span className="text-slate-500">Didn't receive code?</span>
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
            {resending ? "Sending..." : countdown > 0 ? `Resend in ${formatTime(countdown)}` : "Resend Code"}
          </button>
        </div>
      </div>

      {/* Back to Login Link */}
      <div className="text-center pt-4 border-t border-slate-100 mt-1">
        <Link
          to={loginHref}
          className="text-xs font-semibold text-blue-600 hover:underline flex items-center justify-center gap-1.5"
        >
          <ChevronLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default VerifyPage;