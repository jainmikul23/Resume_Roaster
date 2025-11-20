import React, { useState, useRef, useEffect } from 'react';
import { 
  Flame, 
  Sparkles, 
  Mic, 
  Image as ImageIcon, 
  Briefcase, 
  Upload,
  Brain,
  Menu,
  X,
  Wand2,
  Edit,
  MessageSquare,
  FileAudio,
  ScanEye,
  Loader2,
  Zap,
  AlertTriangle,
  ChevronRight,
  Bot,
  LogOut,
  DollarSign,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  UserCircle
} from 'lucide-react';
import { AppMode, AtsScoreData } from './types';
import * as Gemini from './services/geminiService';
import MockInterview from './components/MockInterview';
import AuthPage from './components/AuthPage';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- Animation Variants ---
const pageVariants: Variants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, filter: 'blur(5px)', transition: { duration: 0.2 } }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// --- Sub-Components ---

const SidebarItem = ({ active, icon: Icon, label, onClick, id }: any) => (
  <button 
    onClick={onClick}
    className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors z-10 group ${
      active ? 'text-white' : 'text-gray-400 hover:text-gray-100'
    }`}
  >
    {active && (
      <motion.div
        layoutId="active-pill"
        className="absolute inset-0 bg-dark-800/80 border border-white/10 shadow-lg rounded-xl backdrop-blur-sm"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-3">
      <Icon size={20} className={`transition-transform group-hover:scale-110 ${active ? 'text-brand-tech' : 'text-gray-500 group-hover:text-gray-300'}`} />
      <span className="font-medium tracking-wide">{label}</span>
    </span>
    {active && (
       <motion.div 
         initial={{ opacity: 0, x: -10 }} 
         animate={{ opacity: 1, x: 0 }}
         className="absolute right-4 text-brand-tech"
        >
         <ChevronRight size={14} />
       </motion.div>
    )}
  </button>
);

const FileUploader = ({ onUpload, label = "Upload Image" }: { onUpload: (file: File) => void, label?: string }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all duration-300 ${
        isDragging 
          ? 'border-brand-tech bg-brand-tech/10 scale-[1.02]' 
          : 'border-dark-700 hover:border-brand-tech/50 bg-dark-800/30 hover:bg-dark-800/50'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) onUpload(e.dataTransfer.files[0]);
      }}
    >
      <motion.div 
        className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <Upload className="text-brand-tech" size={32} />
      </motion.div>
      <h3 className="text-xl font-semibold mb-2 text-white">{label}</h3>
      <p className="text-gray-500 mb-8 text-sm max-w-xs mx-auto">Drag & drop your resume or image here, or click to browse.</p>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        className="hidden" 
        id="resume-upload"
      />
      <motion.label 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        htmlFor="resume-upload" 
        className="cursor-pointer bg-white text-dark-950 px-8 py-3 rounded-full font-bold shadow-lg shadow-white/10 hover:shadow-white/20 transition-all flex items-center gap-2"
      >
        <ImageIcon size={18} />
        Select File
      </motion.label>
    </motion.div>
  );
};

// --- Top Navigation Components ---

const RoastFixToggle = ({ mode, setMode }: { mode: AppMode, setMode: (m: AppMode) => void }) => {
  const isFix = mode === AppMode.FIX;
  const isRoast = mode === AppMode.ROAST || mode === AppMode.ROAST_INDIAN;

  const toggle = () => {
    // If currently fixing, go to roast. If anything else, go to fix.
    if (isFix) setMode(AppMode.ROAST);
    else setMode(AppMode.FIX);
  };

  return (
    <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-full border border-white/10 backdrop-blur-xl shadow-xl">
       <span className={`text-[10px] font-bold px-2 tracking-wider transition-colors cursor-pointer ${isRoast ? 'text-rose-400' : 'text-gray-600'}`} onClick={() => setMode(AppMode.ROAST)}>ROAST</span>
       <button 
         onClick={toggle}
         className={`relative w-16 h-8 rounded-full transition-colors duration-300 shadow-inner border border-white/5 group ${isFix ? 'bg-emerald-900/40' : 'bg-rose-900/40'}`}
       >
          <motion.div
            className={`absolute top-0.5 w-6 h-6 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 backdrop-blur-md border border-white/20 ${isFix ? 'left-[calc(100%-1.75rem)] bg-emerald-500' : 'left-1 bg-rose-500'}`}
            layout
          >
            <motion.div
                key={isFix ? 'sparkle' : 'flame'}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
            >
                {isFix ? <Sparkles size={14} className="text-white"/> : <Flame size={14} className="text-white"/>}
            </motion.div>
          </motion.div>
       </button>
       <span className={`text-[10px] font-bold px-2 tracking-wider transition-colors cursor-pointer ${isFix ? 'text-emerald-400' : 'text-gray-600'}`} onClick={() => setMode(AppMode.FIX)}>FIX</span>
    </div>
  )
};

const TopNavbar = ({ currentMode, setMode, userName }: { currentMode: AppMode, setMode: (m: AppMode) => void, userName: string }) => {
    return (
        <div className="w-full h-20 px-4 lg:px-8 flex items-center justify-between border-b border-white/5 bg-dark-950/80 backdrop-blur-md z-30 sticky top-0">
            <div className="flex items-center gap-4">
                 <div className="hidden md:block w-2 h-2 rounded-full bg-brand-tech animate-pulse"></div>
                 <h2 className="text-lg font-bold text-white/90 tracking-wide uppercase font-mono flex items-center gap-2">
                    {userName !== "User" ? <UserCircle size={20} className="text-brand-tech"/> : null}
                    {currentMode === AppMode.DASHBOARD ? (userName !== "User" ? `${userName}'s Hub` : 'Mission Control') : currentMode.replace('_', ' ')}
                 </h2>
            </div>
            
            <div className="flex items-center gap-4 lg:gap-6">
                {/* Transcribe Shortcut */}
                <motion.button 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => setMode(AppMode.TRANSCRIPTION)}
                   className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border text-sm font-bold ${
                       currentMode === AppMode.TRANSCRIPTION 
                       ? 'bg-blue-600/20 border-blue-400/50 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                       : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
                   }`}
                >
                    <Mic size={16} />
                    <span className="hidden sm:inline">Transcribe</span>
                </motion.button>

                <div className="h-6 w-[1px] bg-white/10 hidden sm:block"></div>

                {/* Roast / Fix Toggle */}
                <RoastFixToggle mode={currentMode} setMode={setMode} />
            </div>
        </div>
    )
};

const AtsScoreCard = ({ scoreData }: { scoreData: AtsScoreData }) => {
    const isSafe = scoreData.current >= 70;
    
    return (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-6 rounded-2xl border relative overflow-hidden mb-6 ${
                isSafe ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'
            }`}
        >
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest mb-2 opacity-80">
                        {isSafe ? <ShieldCheck size={16} className="text-emerald-400"/> : <ShieldAlert size={16} className="text-red-400"/>}
                        <span className={isSafe ? 'text-emerald-400' : 'text-red-400'}>
                            {isSafe ? 'ATS Safe' : 'ATS Alert'}
                        </span>
                    </div>
                    
                    <div className="flex items-end gap-4">
                        <div>
                            <div className={`text-5xl font-bold ${isSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                                {scoreData.current}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Current Score</div>
                        </div>

                        {scoreData.projected && (
                            <>
                                <ArrowRight className="mb-4 text-gray-600" size={24}/>
                                <div>
                                    <div className="text-5xl font-bold text-brand-tech">
                                        {scoreData.projected}
                                    </div>
                                    <div className="text-xs text-brand-tech/70 mt-1">Projected Score</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                
                <div className="text-right max-w-[200px]">
                     <p className={`text-sm font-medium ${isSafe ? 'text-emerald-200' : 'text-red-200'}`}>
                        {isSafe 
                         ? "This resume is likely to pass automated screening filters." 
                         : "Critical Issue: This resume risks immediate rejection by ATS software."}
                     </p>
                </div>
            </div>

            {/* Background Decoration */}
            <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${isSafe ? 'bg-emerald-500' : 'bg-red-500'}`} />
        </motion.div>
    );
}

// --- Main App Component ---

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeBase64, setResumeBase64] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  
  // Separate loading state for salary to avoid blocking main UI
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryData, setSalaryData] = useState<{ text: string, chunks: any[] } | null>(null);
  
  // ATS Score State
  const [atsScore, setAtsScore] = useState<AtsScoreData | null>(null);

  const [quickTip, setQuickTip] = useState<string>("");
  const [editInstruction, setEditInstruction] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [strategyQuery, setStrategyQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [analyzePrompt, setAnalyzePrompt] = useState("");
  const [verdict, setVerdict] = useState<'PASS' | 'FAIL' | null>(null);

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    Gemini.getQuickTip().then(setQuickTip);
  }, []);

  useEffect(() => {
    setResult(null);
    setLoadingMessage(null);
    setGeneratedImage(null);
    setVerdict(null);
    setSalaryData(null);
    setSalaryLoading(false);
    setAtsScore(null);
    setMobileMenuOpen(false);
  }, [mode]);

  // Auth Guard
  if (!isAuthenticated) {
    return <AuthPage onLogin={() => setIsAuthenticated(true)} />;
  }

  const handleUpload = async (file: File) => {
    setResumeFile(file);
    setLoadingMessage("Optimizing image...");
    const b64 = await Gemini.processImage(file);
    setResumeBase64(b64);
    setLoadingMessage(null);
    setResult(null);
    setVerdict(null);
    setSalaryData(null);
    setAtsScore(null);
  };

  // Helper to get details first, update name, then trigger salary search
  const extractAndFetchSalary = async (b64: string) => {
    setSalaryLoading(true);
    try {
      // 1. Identify details (Name, Role, Location)
      const details = await Gemini.identifyResumeDetails(b64);
      
      // 2. Update User Name if found
      if (details.name && details.name !== "User") {
        setUserName(details.name);
      }
      
      // 3. Search Salary with explicit extracted details
      console.log("Searching salary for:", details.role, details.location);
      const salary = await Gemini.searchSalaryData(details.role, details.location);
      setSalaryData(salary);
    } catch (e) {
      console.error("Error in background data fetch:", e);
    } finally {
      setSalaryLoading(false);
    }
  };

  const parseAtsScore = (text: string, isFixMode: boolean) => {
      // Look for [[ATS_SCORE: XX]] or [[CURRENT_ATS: XX]]
      const scoreMatch = text.match(/\[\[ATS_SCORE:\s*(\d+)\]\]/);
      const currentMatch = text.match(/\[\[CURRENT_ATS:\s*(\d+)\]\]/);
      const projectedMatch = text.match(/\[\[PROJECTED_ATS:\s*(\d+)\]\]/);

      if (isFixMode) {
          const current = currentMatch ? parseInt(currentMatch[1]) : (scoreMatch ? parseInt(scoreMatch[1]) : 0);
          const projected = projectedMatch ? parseInt(projectedMatch[1]) : undefined;
          if (current > 0) {
              setAtsScore({
                  current,
                  projected,
                  status: current >= 70 ? 'SAFE' : 'RISK'
              });
          }
      } else {
          // Roast Mode
          if (scoreMatch) {
              const score = parseInt(scoreMatch[1]);
              setAtsScore({
                  current: score,
                  status: score >= 70 ? 'SAFE' : 'RISK'
              });
          }
      }
  };

  const handleRoast = async () => {
    if (!resumeBase64) return;
    setSalaryData(null);
    setAtsScore(null);
    setLoadingMessage("🔥 Reading your resume... Preparing insults...");
    
    // Start salary fetch & name extraction in background
    extractAndFetchSalary(resumeBase64);

    const text = await Gemini.roastResume(resumeBase64);
    parseAtsScore(text, false);
    
    // Clean up tags from display text
    const cleanText = text.replace(/\[\[ATS_SCORE:\s*\d+\]\]/g, '');
    setResult(cleanText);
    setLoadingMessage(null);
  };

  const handleRoastIndian = async () => {
    if (!resumeBase64) return;
    setSalaryData(null);
    setAtsScore(null);
    setLoadingMessage("🌶️ Consulting 'Super Senior'...");
    
    extractAndFetchSalary(resumeBase64);

    const text = await Gemini.roastResumeIndian(resumeBase64);
    parseAtsScore(text, false);
    
    if (text.includes("VERDICT: FAIL")) setVerdict("FAIL");
    else if (text.includes("VERDICT: PASS")) setVerdict("PASS");
    
    const cleanText = text.replace(/\[\[ATS_SCORE:\s*\d+\]\]/g, '');
    setResult(cleanText);
    setLoadingMessage(null);
  };

  const handleFix = async () => {
    if (!resumeBase64) return;
    setSalaryData(null);
    setAtsScore(null);
    setLoadingMessage("🧠 Rebuilding your entire resume...");
    
    extractAndFetchSalary(resumeBase64);

    const text = await Gemini.fixResume(resumeBase64);
    parseAtsScore(text, true);

    const cleanText = text
        .replace(/\[\[CURRENT_ATS:\s*\d+\]\]/g, '')
        .replace(/\[\[PROJECTED_ATS:\s*\d+\]\]/g, '');
        
    setResult(cleanText);
    setLoadingMessage(null);
  };

  const handleAnalyzeImage = async () => {
    if (!resumeBase64) return;
    setLoadingMessage("🔍 Analyzing image details...");
    const text = await Gemini.analyzeImage(resumeBase64, analyzePrompt || "Describe this image in detail.");
    setResult(text);
    setLoadingMessage(null);
  }

  const handleImageEdit = async () => {
    if (!resumeBase64 || !editInstruction) return;
    setLoadingMessage("🎨 Editing with Flash Image...");
    const newImage = await Gemini.editResumePhoto(resumeBase64, editInstruction);
    setGeneratedImage(newImage);
    setLoadingMessage(null);
  };

  const handleGenBackground = async () => {
    setLoadingMessage("✨ Generating with Imagen 4...");
    const prompt = editInstruction || `Professional abstract background, geometric style, corporate color palette.`;
    const img = await Gemini.generateBackground(prompt, aspectRatio);
    setGeneratedImage(img);
    setLoadingMessage(null);
  };

  const handleStrategy = async () => {
    if (!strategyQuery) return;
    setLoadingMessage("🧠 Thinking deeply (Gemini 3 Pro)...");
    const text = await Gemini.getCareerStrategy(strategyQuery);
    setResult(text);
    setLoadingMessage(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
              const base64String = (reader.result as string).split(',')[1];
               setLoadingMessage("🎤 Transcribing audio...");
               const text = await Gemini.transcribeAudio(base64String, 'audio/webm');
               setResult(text);
               setLoadingMessage(null);
          };
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (e) {
      console.error(e);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
      mediaRecorderRef.current?.stop();
      setRecording(false);
  };

  const renderContent = () => {
    if (loadingMessage) {
      return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full"
        >
            <div className="relative">
                <div className="absolute inset-0 bg-brand-tech/20 blur-xl rounded-full animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-brand-tech mb-6 animate-spin relative z-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{loadingMessage}</h2>
            <p className="text-gray-500 font-mono text-sm">Powered by Google GenAI</p>
        </motion.div>
      );
    }

    switch (mode) {
      case AppMode.DASHBOARD:
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
            {/* Hero Section */}
            <motion.div 
                variants={itemVariants}
                className="relative rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl border border-white/5 bg-dark-800/50 backdrop-blur-sm"
            >
              {/* Animated background elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                 <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[80px] animate-blob"></div>
                 <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[80px] animate-blob animation-delay-2000"></div>
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-[80px] animate-blob animation-delay-4000"></div>
              </div>

              <div className="relative z-10 max-w-3xl">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 mb-4 text-brand-tech font-mono text-sm uppercase tracking-wider"
                >
                    <Sparkles size={16} /> AI-Powered Career Accelerator
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
                   {userName !== "User" ? `Welcome back, ${userName}` : "Resume Roast & Rescue"}
                </h1>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl">
                  The ultimate AI career toolkit. Roast your resume with a cynical recruiter persona, fix it with an elite career coach, and practice interviews with real-time voice AI.
                </p>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode(AppMode.ROAST)}
                    className="bg-white text-dark-950 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2"
                >
                  Get Started <ChevronRight size={20}/>
                </motion.button>
              </div>
            </motion.div>

            {/* Quick Action Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-dark-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-brand-accent/50 transition-colors group">
                    <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center mb-4 text-brand-accent group-hover:scale-110 transition-transform">
                        <Flame size={24}/>
                    </div>
                    <h3 className="font-bold text-xl mb-2">Daily Ruthless Tip</h3>
                    <p className="text-gray-400 italic text-sm leading-relaxed">"{quickTip}"</p>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-dark-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-brand-tech/50 transition-colors group">
                    <div className="w-12 h-12 bg-brand-tech/10 rounded-xl flex items-center justify-center mb-4 text-brand-tech group-hover:scale-110 transition-transform">
                        <Mic size={24}/>
                    </div>
                    <h3 className="font-bold text-xl mb-2">Live Interview</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">Real-time voice interviews with Gemini 2.5 Native Audio.</p>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-dark-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-brand-success/50 transition-colors group">
                     <div className="w-12 h-12 bg-brand-success/10 rounded-xl flex items-center justify-center mb-4 text-brand-success group-hover:scale-110 transition-transform">
                        <Brain size={24}/>
                     </div>
                     <h3 className="font-bold text-xl mb-2">Deep Strategy</h3>
                     <p className="text-gray-400 text-sm leading-relaxed">Complex career planning with Gemini 3 Pro Thinking Mode.</p>
                </motion.div>
            </div>
          </motion.div>
        );

      case AppMode.ROAST:
      case AppMode.ROAST_INDIAN:
      case AppMode.FIX:
      case AppMode.ANALYZE:
        return (
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="grid lg:grid-cols-2 gap-8 h-full">
            <div className="flex flex-col gap-6">
              {!resumeFile ? (
                <FileUploader 
                  onUpload={handleUpload} 
                  label={mode === AppMode.ANALYZE ? "Upload Image to Analyze" : "Upload Resume (Image)"}
                />
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
                   <img src={resumeBase64 ? `data:image/jpeg;base64,${resumeBase64}` : ''} className="w-full rounded-2xl border border-dark-700 shadow-2xl bg-white object-cover" />
                   <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setResumeFile(null); setResumeBase64(null); setResult(null); setVerdict(null); setSalaryData(null); setAtsScore(null); setSalaryLoading(false); }}
                    className="absolute top-4 right-4 bg-dark-950/50 backdrop-blur p-2 rounded-full text-white hover:bg-brand-accent transition-colors"
                   >
                       <X size={20} />
                   </motion.button>
                </motion.div>
              )}

              {mode === AppMode.ANALYZE && resumeBase64 && (
                <input 
                  type="text"
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-6 py-4 focus:border-brand-tech outline-none transition-all shadow-lg"
                  placeholder="Ask something about this image..."
                  value={analyzePrompt}
                  onChange={(e) => setAnalyzePrompt(e.target.value)}
                />
              )}

              {resumeBase64 && (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={
                    mode === AppMode.ROAST ? handleRoast : 
                    mode === AppMode.ROAST_INDIAN ? handleRoastIndian :
                    mode === AppMode.FIX ? handleFix : 
                    handleAnalyzeImage
                  }
                  className={`w-full py-4 rounded-xl font-bold text-xl transition-all shadow-lg flex items-center justify-center gap-3 ${
                      mode === AppMode.ROAST 
                      ? 'bg-brand-accent hover:bg-rose-600 shadow-rose-900/20' 
                      : mode === AppMode.ROAST_INDIAN
                        ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20'
                        : mode === AppMode.FIX 
                          ? 'bg-brand-success hover:bg-emerald-600 shadow-emerald-900/20'
                          : 'bg-brand-tech hover:bg-blue-500 shadow-blue-900/20'
                  }`}
                >
                  {mode === AppMode.ROAST ? <><Flame/> ROAST THIS RESUME</> : 
                   mode === AppMode.ROAST_INDIAN ? <><Zap/> ROAST ME (DESI STYLE)</> :
                   mode === AppMode.FIX ? <><Sparkles/> FIX RESUME (FULL REWRITE)</> : <><ScanEye/> ANALYZE IMAGE</>}
                </motion.button>
              )}
            </div>
            <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-dark-800/40 backdrop-blur-md rounded-2xl p-8 border border-white/5 overflow-y-auto max-h-[800px] shadow-inner"
            >
                {result ? (
                    <motion.div initial="hidden" animate="show" variants={containerVariants}>
                        {atsScore && <AtsScoreCard scoreData={atsScore} />}

                        {verdict && (
                            <motion.div 
                                variants={itemVariants}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className={`mb-6 p-5 rounded-xl border flex items-center gap-4 font-bold shadow-lg ${
                                    verdict === 'FAIL' 
                                    ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                                    : 'bg-green-500/10 border-green-500/50 text-green-400'
                                }`}
                            >
                                {verdict === 'FAIL' ? <Zap size={28} className="animate-pulse"/> : <Sparkles size={28} className="animate-bounce"/>}
                                <div className="text-xl tracking-wide">VERDICT: {verdict}</div>
                            </motion.div>
                        )}
                        
                        {/* Result Display - Differentiates Fix Mode for better styling */}
                        <motion.div 
                            variants={itemVariants} 
                            className={`prose prose-invert max-w-none ${mode === AppMode.FIX ? 'prose-headings:text-brand-success prose-p:text-gray-200 prose-li:text-gray-300 font-normal' : 'prose-headings:text-gray-100 prose-p:text-gray-300 prose-strong:text-brand-tech'}`}
                        >
                            {mode === AppMode.FIX && (
                                <div className="bg-brand-success/10 border border-brand-success/20 p-4 rounded-lg mb-6 flex items-center gap-2 text-brand-success text-sm font-bold">
                                    <Sparkles size={16}/> COPY THE TEXT BELOW INTO YOUR RESUME DOCUMENT
                                </div>
                            )}
                            <ReactMarkdown>{result.replace(/VERDICT: (PASS|FAIL)/g, '')}</ReactMarkdown>
                        </motion.div>

                        {/* Salary Section: Shows Loading or Data */}
                        {(salaryData || salaryLoading) && (
                            <motion.div 
                                variants={itemVariants}
                                className="mt-8 bg-gradient-to-br from-emerald-900/30 to-dark-800 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden min-h-[160px]"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <DollarSign size={100} />
                                </div>
                                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                    <TrendingUp /> Estimated Market Value
                                </h3>
                                
                                {salaryLoading ? (
                                    <div className="flex flex-col gap-3 animate-pulse">
                                        <div className="h-4 bg-emerald-500/20 rounded w-3/4"></div>
                                        <div className="h-4 bg-emerald-500/20 rounded w-1/2"></div>
                                        <div className="h-4 bg-emerald-500/20 rounded w-5/6"></div>
                                        <div className="text-xs text-emerald-500/50 pt-2">Extracting profile & searching salaries in India...</div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="prose prose-invert prose-sm max-w-none mb-4">
                                            <ReactMarkdown>{salaryData?.text || "Data unavailable"}</ReactMarkdown>
                                        </div>
                                        {salaryData?.chunks && (
                                            <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                                                {salaryData.chunks.map((chunk: any, i: number) => (
                                                    chunk.web?.uri && (
                                                        <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" 
                                                        className="text-xs bg-dark-950/50 border border-white/10 px-3 py-1 rounded-full hover:bg-emerald-500/20 transition-colors flex items-center gap-1 text-emerald-300">
                                                            <ExternalLink size={10} /> {chunk.web.title}
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}

                        {mode === AppMode.ROAST_INDIAN && verdict === 'FAIL' && (
                            <motion.div 
                                variants={itemVariants}
                                className="mt-8 p-6 bg-red-950/40 border border-red-500/30 rounded-xl"
                            >
                                <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                                    <AlertTriangle size={20} /> SYSTEM ALERT
                                </h4>
                                <p className="text-gray-400 mb-4 text-sm">
                                    This resume will get rejected by every ATS in India. Immediate rescue is recommended.
                                </p>
                                <motion.button 
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setMode(AppMode.FIX)}
                                    className="w-full bg-brand-success hover:bg-emerald-600 text-white py-3 px-4 rounded-lg font-bold transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={18}/> ✨ Fix This Mess (Professional Rewrite)
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.1, 1], 
                                rotate: [0, 5, -5, 0],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                        >
                            {mode === AppMode.ROAST ? <Flame size={80} /> : 
                             mode === AppMode.ROAST_INDIAN ? <Zap size={80} /> :
                             mode === AppMode.FIX ? <Sparkles size={80} /> : <ScanEye size={80} />}
                        </motion.div>
                        <p className="mt-6 font-medium tracking-wide uppercase text-sm">Waiting for input...</p>
                    </div>
                )}
            </motion.div>
          </motion.div>
        );

      case AppMode.INTERVIEW:
        return <MockInterview />;

      case AppMode.PHOTO_EDITOR:
        return (
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <h2 className="text-3xl font-bold flex items-center gap-3"><ImageIcon className="text-brand-warning"/> AI Photo Studio</h2>
                <p className="text-gray-400">Uses <span className="text-brand-warning font-mono bg-brand-warning/10 px-1 rounded">Gemini 2.5 Flash Image</span> for edits.</p>
                
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                         {!resumeBase64 ? <FileUploader onUpload={handleUpload} label="Upload Image to Edit" /> : (
                             <div className="relative group">
                                 <img src={resumeBase64 ? `data:image/jpeg;base64,${resumeBase64}` : ''} className="max-h-96 rounded-2xl mx-auto bg-white shadow-xl" />
                                 <button onClick={() => { setResumeFile(null); setResumeBase64(null); }} className="absolute top-4 right-4 bg-dark-950/60 backdrop-blur p-2 rounded-full hover:bg-red-500 transition-colors text-white"><X size={18}/></button>
                             </div>
                         )}
                         <div className="bg-dark-800/50 p-6 rounded-2xl border border-white/5 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Magic Instruction</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 focus:border-brand-tech outline-none transition-colors"
                                    placeholder='e.g., "Make it cyberpunk" or "Professional studio lighting"'
                                    value={editInstruction}
                                    onChange={e => setEditInstruction(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="flex-1 flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Aspect Ratio</label>
                                    <select 
                                      value={aspectRatio}
                                      onChange={(e) => setAspectRatio(e.target.value)}
                                      className="bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-sm focus:border-brand-tech outline-none"
                                    >
                                      <option value="1:1">1:1 (Square)</option>
                                      <option value="16:9">16:9 (Landscape)</option>
                                      <option value="9:16">9:16 (Portrait)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleImageEdit}
                                    disabled={!resumeBase64}
                                    className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:to-yellow-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-900/20"
                                >
                                    <Edit size={18} /> Edit Photo
                                </motion.button>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenBackground}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:to-purple-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                                >
                                    <Wand2 size={18} /> Gen Background
                                </motion.button>
                            </div>
                         </div>
                    </div>
                    <div className="bg-dark-800/30 backdrop-blur-sm rounded-2xl border border-white/5 p-8 flex items-center justify-center min-h-[400px] relative overflow-hidden">
                        {generatedImage ? (
                            <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={generatedImage} className="max-w-full max-h-full rounded-lg shadow-2xl relative z-10" />
                        ) : (
                            <div className="text-center text-gray-600">
                                <ImageIcon size={48} className="mx-auto mb-4 opacity-50"/>
                                <p>Generated masterpiece will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );

      case AppMode.STRATEGY:
        return (
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto space-y-8">
                <div className="text-center mb-12">
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} 
                        className="w-16 h-16 bg-brand-tech/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-tech"
                    >
                        <Brain size={32} />
                    </motion.div>
                    <h2 className="text-4xl font-bold mb-3">Deep Career Strategy</h2>
                    <p className="text-gray-400 max-w-md mx-auto">Powered by <span className="text-brand-tech font-bold">Gemini 3 Pro</span> with Thinking Budget (32k). It thinks before it speaks.</p>
                </div>
                
                <div className="bg-dark-800/80 backdrop-blur-md p-2 rounded-3xl border border-white/10 flex gap-2 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-tech/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <textarea 
                        className="flex-1 bg-transparent px-6 py-4 outline-none text-lg resize-none h-20 pt-6 placeholder-gray-600"
                        placeholder="Describe your complex career dilemma..."
                        value={strategyQuery}
                        onChange={(e) => setStrategyQuery(e.target.value)}
                    />
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStrategy} 
                        className="bg-brand-tech px-8 rounded-2xl font-bold hover:bg-blue-500 transition text-white shadow-lg shadow-blue-900/30"
                    >
                        Think
                    </motion.button>
                </div>

                {result && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-dark-800/40 backdrop-blur-md p-10 rounded-3xl border border-white/5 prose prose-invert max-w-none shadow-inner"
                    >
                         <ReactMarkdown>{result}</ReactMarkdown>
                    </motion.div>
                )}
            </motion.div>
        );

      case AppMode.TRANSCRIPTION:
        return (
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-2xl mx-auto text-center space-y-12 py-12">
                <div>
                    <h2 className="text-4xl font-bold mb-4">Audio Transcription</h2>
                    <p className="text-gray-400">Record your voice to transcribe it using <span className="text-blue-400">Gemini 2.5 Flash</span>.</p>
                </div>
                
                <div className="flex justify-center py-8 relative">
                    {/* Pulse rings */}
                    {recording && (
                        <>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-500/10 rounded-full animate-ping"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-red-500/20 rounded-full animate-pulse"></div>
                        </>
                    )}
                    
                    {!recording ? (
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={startRecording}
                            className="w-24 h-24 rounded-full bg-brand-tech hover:bg-blue-500 flex items-center justify-center shadow-xl shadow-blue-900/30 transition-all relative z-10 group"
                        >
                            <Mic size={40} className="group-hover:text-white" />
                        </motion.button>
                    ) : (
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={stopRecording}
                            className="w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-xl shadow-red-900/30 transition-all relative z-10"
                        >
                            <div className="w-8 h-8 bg-white rounded-lg animate-pulse" />
                        </motion.button>
                    )}
                </div>
                <p className="text-sm font-mono uppercase tracking-widest text-gray-500">{recording ? "Recording in progress..." : "Tap to record"}</p>

                {result && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-dark-800/50 backdrop-blur p-8 rounded-2xl border border-white/5 text-left prose prose-invert max-w-none shadow-2xl"
                    >
                        <ReactMarkdown>{result}</ReactMarkdown>
                    </motion.div>
                )}
            </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-dark-900/80 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-out flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 font-mono text-xl font-bold text-white mb-10 cursor-pointer" onClick={() => setMode(AppMode.DASHBOARD)}>
             <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-brand-tech rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20">
                <Bot size={24} className="text-white" />
             </div>
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                 {userName !== "User" ? `${userName}'s HQ` : 'Roast&Rescue'}
             </span>
          </div>

          <nav className="space-y-2">
            <SidebarItem id="dash" active={mode === AppMode.DASHBOARD} icon={Briefcase} label="Dashboard" onClick={() => setMode(AppMode.DASHBOARD)} />
            
            <div className="pt-6 pb-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4">Career Tools</div>
            <SidebarItem id="roast" active={mode === AppMode.ROAST} icon={Flame} label="Roast Resume" onClick={() => setMode(AppMode.ROAST)} />
            <SidebarItem id="indian" active={mode === AppMode.ROAST_INDIAN} icon={Zap} label="Desi Roast (Strict)" onClick={() => setMode(AppMode.ROAST_INDIAN)} />
            <SidebarItem id="fix" active={mode === AppMode.FIX} icon={Sparkles} label="Fix Resume" onClick={() => setMode(AppMode.FIX)} />
            <SidebarItem id="interview" active={mode === AppMode.INTERVIEW} icon={MessageSquare} label="Mock Interview" onClick={() => setMode(AppMode.INTERVIEW)} />
            
            <div className="pt-6 pb-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4">AI Utilities</div>
            <SidebarItem id="analyze" active={mode === AppMode.ANALYZE} icon={ScanEye} label="Analyze Image" onClick={() => setMode(AppMode.ANALYZE)} />
            <SidebarItem id="transcribe" active={mode === AppMode.TRANSCRIPTION} icon={FileAudio} label="Transcribe" onClick={() => setMode(AppMode.TRANSCRIPTION)} />
            <SidebarItem id="photo" active={mode === AppMode.PHOTO_EDITOR} icon={ImageIcon} label="Photo Studio" onClick={() => setMode(AppMode.PHOTO_EDITOR)} />
            <SidebarItem id="strat" active={mode === AppMode.STRATEGY} icon={Brain} label="Deep Strategy" onClick={() => setMode(AppMode.STRATEGY)} />
          </nav>
        </div>
        
        <div className="p-6 border-t border-white/5 bg-dark-950/30">
            <button 
                onClick={() => setIsAuthenticated(false)} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors mb-4 group"
            >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/>
                <span className="font-medium">Sign Out</span>
            </button>
            <div className="text-xs text-gray-500 flex items-center gap-2 font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                v2.6.0 Online
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full relative bg-transparent overflow-hidden flex flex-col">
        
        {/* NEW TOP NAV BAR */}
        <TopNavbar currentMode={mode} setMode={setMode} userName={userName} />

        {/* Mobile Header (Legacy - hidden on md, but kept for safety if sidebar used on small screens) */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-dark-900/80 backdrop-blur z-20 relative">
           <span className="font-bold font-mono">Roast&Rescue</span>
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
             {mobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
            <AnimatePresence mode="wait">
                {renderContent()}
            </AnimatePresence>
        </div>
      </main>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
};

export default App;