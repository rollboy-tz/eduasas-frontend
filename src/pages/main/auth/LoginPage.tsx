import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EduInput } from "@/components/fields/EduInput";
import { Button } from "@/components/atoms";
import { InputLabel } from "@/components/atoms";
import { apiMutation, isApiError, useToast } from "@/lib";
import { parseContact } from "@/lib/utils/contact";
import { useRedirectDestination } from '@/lib/hooks';
import { z } from "zod";
import { resetuserKey } from "@/lib/utils/helper";
import { EduSocialButton } from '@/components/elements';

// Zod schema rasmi ya kuweka validation imara ya Login
const loginSchema = z.object({
  identity: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface LoginData {
  identity: string;
  password: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const toast = useToast();


  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<LoginData>({ identity: "", password: "" });

  const { redirectTo, addQuery, removeQuery, getPreservedState } = useRedirectDestination("/home");
  
  const destination = React.useMemo(() => {
  if (data.identity && parseContact(data.identity).isValid) {
    return addQuery({ identity: data.identity });
  }
  return redirectTo;
}, [redirectTo, data.identity, addQuery]);

  const handleSubmit = async () => {
    setError("");

    const validationResult = loginSchema.safeParse(data);
    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      return;
    }

    const contactInfo = parseContact(data.identity);
    if (!contactInfo.isValid) {
      setError("Please enter a valid email address or phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiMutation("post", "/auth/login", {
        identity: data.identity.trim(),
        password: data.password,
      });

      if (response.status === "success") {
        setError("");
        const finalDestination = removeQuery(["identity", "utm_src", "utm_medium", "utm_campaign"]);

        const event = new CustomEvent("eduasas:login");
        window.dispatchEvent(event);
        toast.show({ message: "Authenticated, Welcome in...", type: "success" })
        resetuserKey();
        setTimeout(() => {
          navigate(finalDestination, { replace: true });
        }, 500);
      }
    } catch (e) {
      if (isApiError(e)) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Login uncaught error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  // Mantiki ya Google OAuth Login
  const handleGoogleLogin = () => {
    // Hapa unaweza kuelekeza kwenye endpoint ya Google Auth ya backend yako
    window.location.href = "/auth/google";
  };

  return (
    <div className="w-full rounded-md flex flex-col gap-2 border border-slate-100 bg-white/80 p-5">
      <div className="mb-3">
        <h2 className="font-heading text-2xl font-black mb-2">Login</h2>

        {error ? (
          <span className="w-full bg-red-50 border border-red-200/60 p-1.5 block rounded text-base lg:text-sm text-red-500">
            {error}
          </span>
        ) : (
          <span className="w-full p-1 text-base lg:text-sm text-slate-500 block">
            Enter your credentials below to login.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 mb-2">
        <InputLabel label="Email or Phone" required />
        <EduInput
          type="contact"
          required
          size="lg"
          value={data.identity}
          onChange={(v) => setData({ ...data, identity: v })}
          onError={(e) => console.log(e)}
          className="bg-white border border-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1 mb-2">
        <InputLabel label="Password" required />
        <EduInput
          type="password"
          required
          size="lg"
          value={data.password}
          onChange={(v) => setData({ ...data, password: v })}
          onError={(e) => console.log(e)}
          className="bg-white border border-slate-100"
        />
      </div>

      <div className="flex items-center justify-end text-right px-2 mb-2">
        <Link 
          to="/password" {...getPreservedState(destination)} 
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <AuthButtons 
        onPrimaryClick={handleSubmit} 
        onGoogleClick={handleGoogleLogin}
        primaryDisabled={submitting}
        //Path with destination to the child component to preserve state and query params
        getPreservedState={() => {
          const forgotDestination = addQuery({ s: "forgot" });
          return getPreservedState(forgotDestination);
        }}
      />
    </div>
  );
};

interface AuthButtonsAction {
  onPrimaryClick?: () => void;
  onGoogleClick?: () => void;
  primaryDisabled?: boolean;
  getPreservedState?: (destination?: Record<string, unknown>) => Record<string, unknown>; 
}

const AuthButtons = ({ onPrimaryClick, onGoogleClick, primaryDisabled, getPreservedState }: AuthButtonsAction) => {
  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Kitufe kikuu cha Login */}
      <Button
        onClick={onPrimaryClick}
        disabled={primaryDisabled}
        className="font-bold text-base md:text-sm w-full"
      >
        {primaryDisabled ? "Authenticating..." : "Login"}
      </Button>

      {/* Kistari cha 'Or' cha kuunganisha njia mbadala */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-wider font-medium">Or</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Kitufe cha Google OAuth kilichosafishwa */}
      <EduSocialButton
        type="button"
        text="Continue with Google"
        onClick={onGoogleClick}
        disabled={primaryDisabled}
        size="md"
      />

      {/* Kiungo cha kwenda kwenye ukurasa wa kujisajili (Register) */}
      <div className="text-center mt-2 text-base lg:text-sm text-slate-500">
        Don't have an account?{" "}
        <Link to="/register" {...(getPreservedState ? getPreservedState() : {})} className="font-semibold text-blue-600 hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
