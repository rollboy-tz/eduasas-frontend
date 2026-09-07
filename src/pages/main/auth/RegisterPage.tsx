import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { EduInput } from "@/components/fields/EduInput";
import { Button, InputLabel } from "@/components/atoms";
import { EduSocialButton } from "@/components/elements"; // Hakikisha path ya EduSocialButton ipo sahihi kulingana na project yako
import { AnimatePresence, motion } from "framer-motion";
import { apiMutation, isApiError } from "@/lib/api";
import { parseContact } from "@/lib/utils/contact";
import { z } from "zod";
import { useToast } from "@/lib";

// Zod validation kwa ajili ya Hatua ya Kwanza
const stepOneSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// Zod validation kwa ajili ya Hatua ya Pili
const stepTwoSchema = z.object({
  contact: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = {
  firstName: string;
  lastName: string;
  contact: string;
  password: string;
  confirmPassword: string;
};

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({ 
    firstName: "", 
    lastName: "", 
    contact: "", 
    password: "", 
    confirmPassword: "" 
  });

  const getCleanParams = (currentIdentity: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (currentIdentity) {
      newParams.set("identity", currentIdentity);
    } else {
      newParams.delete("identity");
    }
    newParams.delete("verified");
    newParams.delete("utm_campaign");
    newParams.delete("utm_source");
    return newParams.toString();
  };

  const handleStepOneNext = () => {
    setError(null);
    const validation = stepOneSchema.safeParse({
      firstName: formData.firstName,
      lastName: formData.lastName,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setError(null);

    const validation = stepTwoSchema.safeParse({
      contact: formData.contact,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    const contact = parseContact(formData.contact.trim());
    if (!contact.isValid || contact.type === "unkown") {
      setError("Please enter a valid email address or phone number.");
      return;
    }

    let updatedEmail = null;
    let updatedPhone = null;

    if (contact.type === "EMAIL") {
      updatedEmail = contact.value;
    } else if (contact.type === "PHONE") {
      updatedPhone = contact.value;
    }

    setIsLoading(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: updatedEmail,
        phone: updatedPhone,
        password: formData.password,
      };

      const res = await apiMutation("post", "/auth/register", payload);
      if (res.status === "success") {
        setError(null);
        toast.show({ message: res.message || "Account created successfully", type: "success" });
        const identityParam = encodeURIComponent(updatedEmail ?? updatedPhone ?? formData.contact);
        setTimeout(() => {
          navigate(`/verify?identity=${identityParam}&reason=register`);
        }, 500);
      }
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
      } else {
        setError("An error occurred during registration. Please try again.");
      }
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const cleanParamsString = getCleanParams(formData.contact);
  const loginHref = cleanParamsString ? `/login?${cleanParamsString}` : `/login`;

  return (
    <div className="w-full rounded-md flex flex-col gap-2 border border-slate-100 bg-white/80 p-5">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          // ===================== HATUA YA 1 ======================
          <motion.div
            key={1}
            className="flex flex-col gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-3">
              <h2 className="font-heading text-2xl font-black mb-2">Create Account</h2>
              {error ? (
                <span className="w-full bg-red-50 border border-red-200/60 p-1.5 block rounded text-base lg:text-sm text-red-500">
                  {error}
                </span>
              ) : (
                <span className="w-full p-1 text-base lg:text-sm text-slate-500 block">
                  Enter your personal details to get started.
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 mb-2">
              <InputLabel label="First Name" required />
              <EduInput
                type="text"
                required
                size="lg"
                placeholder="John"
                value={formData.firstName}
                onChange={(v) => setFormData({ ...formData, firstName: v })}
                onError={(msg) => console.log("First name validation:", msg)}
                className="bg-white border border-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1 mb-2">
              <InputLabel label="Last Name" required />
              <EduInput
                type="text"
                required
                size="lg"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(v) => setFormData({ ...formData, lastName: v })}
                onError={(msg) => console.log("Last name validation:", msg)}
                className="bg-white border border-slate-100"
              />
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Button onClick={handleStepOneNext} className="font-bold text-base md:text-sm w-full">
                Continue
              </Button>

              {/* Kistari cha 'Or' */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-wider font-medium">Or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Kitufe cha Google kwenye Step 1 */}
              <EduSocialButton
                type="button"
                text="Continue with Google"
                onClick={handleGoogleLogin}
                size="md"
              />
            </div>

            <div className="text-center pt-3 border-t border-slate-100 mt-2">
              <p className="text-xs text-slate-500">
                Already have an account?{" "}
                <Link to={loginHref} className="font-semibold text-blue-600 hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </motion.div>
        ) : (
          // ===================== HATUA YA 2 ======================
          <motion.div
            key={2}
            className="flex flex-col gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-black mb-1">Security</h2>
                <span className="w-full p-0 text-base lg:text-sm text-slate-500 block">
                  Almost done setting up your account.
                </span>
              </div>
              <button 
                onClick={() => setStep(1)}
                className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Back
              </button>
            </div>

            {error && (
              <span className="w-full bg-red-50 border border-red-200/60 p-1.5 block rounded text-base lg:text-sm text-red-500 mb-2">
                {error}
              </span>
            )}

            <div className="flex flex-col gap-1 mb-2">
              <InputLabel label="Email or Phone Number" required />
              <EduInput
                type="contact"
                required
                size="lg"
                placeholder="name@institution.com or phone"
                value={formData.contact}
                onChange={(v) => setFormData({ ...formData, contact: v })}
                onError={(msg) => console.log("Contact validation:", msg)}
                className="bg-white border border-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1 mb-2">
              <InputLabel label="Password" required />
              <EduInput
                type="password"
                required
                size="lg"
                placeholder="••••••••"
                value={formData.password}
                onChange={(v) => setFormData({ ...formData, password: v })}
                onError={(msg) => console.log("Password validation:", msg)}
                className="bg-white border border-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1 mb-2">
              <InputLabel label="Confirm Password" required />
              <EduInput
                type="password"
                required
                size="lg"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(v) => setFormData({ ...formData, confirmPassword: v })}
                onError={(msg) => console.log("Confirm Password validation:", msg)}
                className="bg-white border border-slate-100"
              />
            </div>

            <div className="pt-2">
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="font-bold text-lg w-full"
              >
                {isLoading ? "Creating Account..." : "Complete Registration"}
              </Button>
            </div>

            <div className="text-center pt-3 border-t border-slate-100 mt-2">
              <p className="text-xs text-slate-500">
                Already have an account?{" "}
                <Link to={loginHref} className="font-semibold text-blue-600 hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;