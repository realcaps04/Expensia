import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BrandLockup } from "../components/brand/ExpensiaLogo";
import { WelcomeBackground } from "../components/brand/WelcomeBackground";
import { Button } from "../components/ui/Button";

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface">
      <WelcomeBackground />

      <div className="relative z-10 flex flex-1 flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))]">
        <div className="flex flex-1 flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <BrandLockup markSize={132} />
          </motion.div>
        </div>

        <motion.div
          className="mt-auto w-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button fullWidth onClick={() => navigate("/signup")}>
            Get Started
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
