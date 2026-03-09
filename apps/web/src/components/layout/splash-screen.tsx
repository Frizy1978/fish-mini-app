import { motion } from "framer-motion";

export function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,124,130,0.22),_transparent_35%),linear-gradient(180deg,#f8f1e8_0%,#f3efe8_45%,#e7f0ef_100%)] px-6">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm rounded-[2.25rem] border border-white/70 bg-white/80 p-8 text-center shadow-glow backdrop-blur"
      >
        <p className="font-display text-4xl text-ink">Море рядом</p>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Собираем свежую рыбу и морепродукты для ближайшей выдачи. Подготовка мини-приложения.
        </p>
      </motion.div>
    </div>
  );
}
