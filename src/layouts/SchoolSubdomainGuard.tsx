import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { apiFetch, isApiError } from "@/lib/api";
import { parseDomainAndTenant } from "@/lib/utils";
import { PublicSchoolProvider, SchoolProfile } from "@/shared/providers";
import { EduScreenLoader } from "@/components/elements";
import { SchoolFetchingError } from "@/pages/school";
import { text } from "@/lib/string";

export const SchoolSubdomainGuard: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<SchoolProfile | null>(null);
  const [errorType, setErrorType] = useState<"not_found" | "network_error" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const tenantSlug = useMemo(() => {
    const hostname = window.location.hostname;
    const context = parseDomainAndTenant(hostname);
    return context.tenant ? context.tenant.trim().toLowerCase() : "";
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveSchoolAndSession = async () => {
      if (!tenantSlug) {
        if (isMounted) {
          setErrorType("not_found");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setErrorType(null);

        const school = await apiFetch<SchoolProfile>(`/public/school-profile?slug=${tenantSlug}`);

        if (!isMounted) return;

        if (school && school.schoolId) {
          setProfileData(school);
          document.title = `${text.titleCase(school.displayName) || text.titleCase(school.name)} - EduAsas`;
        } else {
          setErrorType("not_found");
          setErrorMessage("No school resolved in provided URL. Either the school was removed or the subdomain changed.");
        }
      } catch (error) {
        if (!isMounted) return;

        if (isApiError(error)) {
          if (error.errorCode === "SCHOOL_NOT_FOUND") {
            setErrorType("not_found");
          } else {
            setErrorType("network_error");
          }
          setErrorMessage(error.message);
        } else {
          setErrorType("network_error");
          setErrorMessage("Network error or server is unreachable.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    resolveSchoolAndSession();

    return () => {
      isMounted = false;
      document.title = "EduAsas - School Management System";
    };
  }, [tenantSlug]);

  if (loading) {
    return <EduScreenLoader loadingText="Fetching school profile..." />;
  }

  if (errorType === "network_error") {
  return <SchoolFetchingError message={errorMessage} onRetry={() => window.location.reload()} />;
}

  if (errorType === "not_found" || !profileData) {
    navigate("/school-not-found", { replace: true });
    return null;
  }

  return (
    <PublicSchoolProvider school={profileData} subdomain={tenantSlug}>
      <Outlet />
    </PublicSchoolProvider>
  );
};

export default SchoolSubdomainGuard;