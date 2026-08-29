import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { markWelcomeSeen } from "../lib/onboarding";
import { BrandLockup } from "../components/brand/ExpensiaLogo";
import { WelcomeBackground } from "../components/brand/WelcomeBackground";
import { Button } from "../components/ui/Button";

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-surface">
      <WelcomeBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrandLockup markSize={132} />
        </motion.div>

        <motion.div
          className="mt-12 w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button
            fullWidth
            onClick={() => {
              markWelcomeSeen();
              navigate("/signup");
            }}
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
