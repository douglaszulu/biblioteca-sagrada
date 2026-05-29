import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Shield, Compass, BookOpen } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const NARRATIVE_STEPS = [
  {
    text: "“Talvez não tenha sido por acaso que você chegou até aqui...”",
    icon: Sparkles,
    color: "text-amber-400"
  },
  {
    text: "“Existe um momento… em que o coração cansa de carregar tudo sozinho.”",
    icon: Heart,
    color: "text-rose-400"
  },
  {
    text: "“Ansiedade… noites sem dormir… portas fechadas… silêncio na alma…”",
    icon: Compass,
    color: "text-blue-400"
  },
  {
    text: "“E às vezes… tudo o que precisamos… é de uma oração certa no momento certo. Foi pensando nisso que reunimos uma coleção especial de orações, salmos, áudios guiados e devocionais inspirados na tradição cristã...”",
    icon: BookOpen,
    color: "text-emerald-400"
  },
  {
    text: "“Dentro da Biblioteca Sagrada, você terá acesso imediato a orações para proteção, prosperidade, cura interior, restauração emocional e fortalecimento espiritual.”",
    icon: Shield,
    color: "text-amber-500"
  }
];

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isReadyForCallToAction, setIsReadyForCallToAction] = useState(false);

  useEffect(() => {
    // Automatically transition through narrative steps representing the user's poem
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < NARRATIVE_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsReadyForCallToAction(true);
          return prev;
        }
      });
    }, 4500); // 4.5 seconds per message, perfect for slow reading

    return () => clearInterval(interval);
  }, []);

  const skipToCallToAction = () => {
    setIsReadyForCallToAction(true);
    setCurrentStep(NARRATIVE_STEPS.length - 1);
  };

  const ActiveIcon = NARRATIVE_STEPS[currentStep].icon;

  return (
    <div id="landing-container" className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Decorative background lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between border-b border-slate-800 pb-4 z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-500" />
          <span className="font-serif-sacred text-lg md:text-xl tracking-wider text-amber-500">Biblioteca Sagrada</span>
        </div>
        {!isReadyForCallToAction && (
          <button 
            id="skip-intro-btn"
            onClick={skipToCallToAction}
            className="text-xs uppercase tracking-widest text-slate-400 hover:text-amber-400 font-mono transition-colors"
          >
            Pular Introdução
          </button>
        )}
      </header>

      {/* Main Narrative Area */}
      <main className="flex-1 max-w-3xl flex flex-col items-center justify-center text-center my-8 z-10 w-full">
        <AnimatePresence mode="wait">
          {!isReadyForCallToAction ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="flex flex-col items-center justify-center gap-6"
            >
              <div className="p-4 rounded-full bg-slate-800/50 border border-slate-700/60 shadow-xl shadow-amber-950/10">
                <ActiveIcon className={`w-8 h-8 ${NARRATIVE_STEPS[currentStep].color}`} />
              </div>
              <p className="text-xl md:text-2xl font-serif-reading leading-relaxed font-light tracking-wide max-w-2xl text-slate-200">
                {NARRATIVE_STEPS[currentStep].text}
              </p>
              
              {/* Step indicator */}
              <div className="flex gap-2 mt-8">
                {NARRATIVE_STEPS.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-700 ${
                      idx === currentStep ? 'w-8 bg-amber-500' : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-6"
            >
              <div className="p-5 rounded-full bg-amber-500/10 border border-amber-500/30 animate-pulse">
                <BookOpen className="w-10 h-10 text-amber-500" />
              </div>

              <h1 className="text-3xl md:text-5xl font-serif-sacred tracking-widest text-amber-500 mt-2">
                BIBLIOTECA SAGRADA
              </h1>

              <div id="final-narrative-block" className="space-y-4 max-w-xl text-slate-300 font-serif-reading text-base leading-relaxed md:text-lg">
                <p>
                  "Além de áudios guiados, novenas completas, salmos poderosos e mensagens diárias para trazer paz ao seu coração…"
                </p>
                <p>
                  "Tudo em um só lugar… simples… acolhedor… e feito para acompanhar você nos momentos mais difíceis."
                </p>
                <p className="font-semibold text-amber-400/90 italic">
                  "O acesso é imediato... Clique abaixo e entre agora."
                </p>
              </div>

              <motion.button
                id="enter-library-btn"
                onClick={onEnter}
                whileHover={{ scale: 1.05, shadow: "0 10px 25px rgba(245, 158, 11, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 px-10 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-900 font-sans font-bold tracking-wider text-base uppercase shadow-lg shadow-amber-950/40 cursor-pointer flex items-center gap-3"
              >
                <span>Entrar na Biblioteca Sagrada</span>
                <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
              </motion.button>

              <p className="text-xs text-slate-500 font-mono tracking-wide mt-4">
                Sinta-se abraçado e saiba que você não está sozinho nessa caminhada.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 font-mono z-10">
        &copy; {new Date().getFullYear()} Biblioteca Sagrada. Tecendo fios de comunhão e fé.
      </footer>
    </div>
  );
}
