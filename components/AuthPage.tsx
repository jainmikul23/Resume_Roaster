import React, { useState, useRef, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useTransform, 
  useSpring,
  useMotionTemplate
} from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Github, Chrome, Check, Eye, EyeOff, Cpu, Sparkles } from 'lucide-react';

interface AuthPageProps {
  onLogin: () => void;
}

// Floating 3D Object Component
const FloatingObject = ({ delay, size, color, xRange, yRange, duration, type = 'circle' }: any) => (
  <motion.div
    className={`absolute mix-blend-screen blur-xl opacity-60 pointer-events-none`}
    style={{
      width: size,
      height: size,
      background: color,
      borderRadius: type === 'circle' ? '50%' : '20%',
      boxShadow: `0 0 ${size/2}px ${color}`,
    }}
    animate={{
      x: xRange,
      y: yRange,
      rotate: type === 'square' ? [0, 90, 180, 270, 360] : 0,
      scale: [1, 1.2, 0.9, 1.1, 1],
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay: delay,
    }}
  />
);

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [showPass, setShowPass] = useState(false);
  
  // 3D Tilt Logic
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  
  // Brighter, more visible spotlight
  const spotlightX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const spotlightY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;
    setStatus('loading');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStatus('success');
    setTimeout(() => {
      onLogin();
    }, 1000); 
  };

  const handleSocialLogin = async (provider: string) => {
    if (status !== 'idle') return;
    setStatus('loading');
    // Simulate network request delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStatus('success');
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  const handleGuestLogin = async () => {
    if (status !== 'idle') return;
    setStatus('loading');
    // Faster access for guests
    await new Promise(resolve => setTimeout(resolve, 800));
    setStatus('success');
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-900 font-sans text-white perspective-1000">
      
      {/* --- Moving Objects Layer --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
         {/* Giant Glowing Orbs */}
         <FloatingObject size={400} color="#3b82f6" xRange={[-100, 100]} yRange={[-50, 50]} duration={15} delay={0} />
         <FloatingObject size={300} color="#f43f5e" xRange={[200, -200]} yRange={[100, -100]} duration={18} delay={2} />
         <FloatingObject size={350} color="#10b981" xRange={[-150, 150]} yRange={[200, -50]} duration={20} delay={5} />
         
         {/* Floating Squares/Shapes */}
         <FloatingObject type="square" size={100} color="#8b5cf6" xRange={[400, 500]} yRange={[-200, 0]} duration={25} delay={0} />
         <FloatingObject type="square" size={80} color="#f59e0b" xRange={[-400, -300]} yRange={[200, 300]} duration={22} delay={1} />
      </div>

      {/* --- Glass Overlay --- */}
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] z-0" />

      {/* --- 3D Holographic Card --- */}
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: "preserve-3d" 
        }}
        className="relative z-10 w-full max-w-[440px] mx-4"
      >
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden group"
        >
          
          {/* Spotlight */}
          <motion.div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 mix-blend-overlay"
            style={{
              background: useMotionTemplate`radial-gradient(500px circle at ${spotlightX} ${spotlightY}, rgba(255,255,255,0.4), transparent 40%)`
            }}
          />

          {/* Content */}
          <div className="p-8 md:p-10 relative z-30">
            
            {/* Header with Floating Icon */}
            <div className="flex flex-col items-center mb-8">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-24 h-24 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 mb-6 relative"
              >
                 <div className="absolute inset-0 bg-white/20 rounded-3xl animate-pulse"></div>
                 {status === 'success' ? (
                    <Check className="text-white w-12 h-12 drop-shadow-lg" strokeWidth={3} />
                 ) : (
                    <Sparkles className="text-white w-12 h-12 drop-shadow-lg" strokeWidth={1.5} />
                 )}
              </motion.div>
              
              <div className="overflow-hidden h-10 mb-1 text-center">
                <AnimatePresence mode="wait">
                  <motion.h2 
                    key={isLogin ? "login" : "signup"}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    className="text-3xl font-bold tracking-tight text-white drop-shadow-md"
                  >
                    {isLogin ? "Welcome Back" : "Join the Future"}
                  </motion.h2>
                </AnimatePresence>
              </div>
              <p className="text-blue-100/70 text-sm font-medium tracking-wide">AI-POWERED CAREER CONSULTANT</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative group"
                  >
                    <User className="absolute left-4 top-3.5 text-blue-200 group-focus-within:text-white transition-colors z-10" size={18} />
                    <input 
                      type="text" 
                      placeholder="Username" 
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-blue-200/50 focus:outline-none focus:border-blue-400/50 focus:bg-black/30 transition-all hover:bg-black/30"
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-blue-200 group-focus-within:text-white transition-colors z-10" size={18} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-blue-200/50 focus:outline-none focus:border-blue-400/50 focus:bg-black/30 transition-all hover:bg-black/30"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-blue-200 group-focus-within:text-white transition-colors z-10" size={18} />
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="Password" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-blue-200/50 focus:outline-none focus:border-blue-400/50 focus:bg-black/30 transition-all hover:bg-black/30"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3.5 text-blue-200/70 hover:text-white transition-colors">
                   {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={status !== 'idle'}
                whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl font-bold tracking-wide text-sm flex items-center justify-center gap-3 transition-all shadow-xl relative overflow-hidden mt-2 ${
                   status === 'success' 
                   ? 'bg-emerald-500 text-white' 
                   : 'bg-white text-slate-900 hover:bg-blue-50'
                }`}
              >
                {status === 'idle' && (
                  <>
                     {isLogin ? "Sign In" : "Create Account"} <ArrowRight size={18} />
                  </>
                )}
                {status === 'loading' && (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"/> Processing...
                  </>
                )}
                {status === 'success' && (
                  <>
                    <Check size={20} className="animate-bounce"/> Success!
                  </>
                )}
              </motion.button>
            </form>

            {/* Switcher */}
            <div className="mt-6 flex items-center justify-between text-sm">
               <button onClick={() => setIsLogin(!isLogin)} className="text-blue-200 hover:text-white transition-colors font-medium">
                  {isLogin ? "New here? Create account" : "Already have an account?"}
               </button>
            </div>

            {/* Socials */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={status !== 'idle'}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/20 border border-white/5 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                 <Chrome size={18}/> <span className="text-xs font-bold">Google</span>
              </button>
              <button 
                type="button"
                onClick={() => handleSocialLogin('github')}
                disabled={status !== 'idle'}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/20 border border-white/5 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                 <Github size={18}/> <span className="text-xs font-bold">GitHub</span>
              </button>
            </div>

            {/* Guest Access */}
            <div className="mt-4">
              <button 
                type="button"
                onClick={handleGuestLogin}
                disabled={status !== 'idle'}
                className="w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-blue-400/30 hover:bg-blue-400/5 text-gray-400 hover:text-blue-300 transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                 <Cpu size={16}/> Access as Guest
              </button>
            </div>

          </div>

        </motion.div>
      </motion.div>

    </div>
  );
};

export default AuthPage;