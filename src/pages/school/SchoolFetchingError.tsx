import React from "react";
import { Button } from "@/components/atoms";
import { WifiOff, RefreshCw, ShieldAlert } from "lucide-react";

interface SchoolFetchingErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const SchoolFetchingError: React.FC<SchoolFetchingErrorProps> = ({
  message,
  onRetry,
}) => {
  const currentYear = new Date().getFullYear();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div>
      {/* Minimal Header */}
      <header>
        <div>
          <ShieldAlert />
          <span>EduAsas System</span>
        </div>
      </header>

      {/* Main Content / Error Box */}
      <main>
        <div>
          <div>
            <WifiOff />
          </div>

          <h1>Connection Error</h1>
          
          <p>
            {message ||
              "We encountered a network issue or the main server is currently unreachable. Please check your internet connection and try again."}
          </p>

          <div>
            <Button onClick={handleRetry}>
              <RefreshCw /> Try Again
            </Button>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer>
        <div>
          <p>&copy; {currentYear} EduAsas. All rights reserved.</p>
          <p>Powered by Rollboy Services</p>
        </div>
      </footer>
    </div>
  );
};

export default SchoolFetchingError;