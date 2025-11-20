import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, Square, Activity, Volume2, User, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

// Audio Utils (Manual Encode/Decode as per guidelines)
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// Resampler to convert system audio (e.g. 44.1k/48k) to 16k for Gemini
function resampleTo16kHz(audioData: Float32Array, origSampleRate: number) {
  const targetSampleRate = 16000;
  if (origSampleRate === targetSampleRate) return audioData;

  const ratio = origSampleRate / targetSampleRate;
  const newLength = Math.round(audioData.length / ratio);
  const result = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const index = i * ratio;
    const indexFloor = Math.floor(index);
    const indexCeil = Math.min(audioData.length - 1, indexFloor + 1);
    const fraction = index - indexFloor;
    // Linear interpolation
    result[i] = audioData[indexFloor] * (1 - fraction) + audioData[indexCeil] * fraction;
  }
  return result;
}

const MockInterview: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for audio context and session
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Clean up function
  const disconnect = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setConnected(false);
    setSpeaking(false);
  };

  useEffect(() => {
    return () => disconnect();
  }, []);

  const startSession = async () => {
    try {
      setError(null);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio Contexts without fixed sampleRate (fixes NotSupportedError on some browsers)
      // We will handle resampling manually.
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume contexts to prevent browser autoplay block
      await inputAudioContext.resume();
      await outputAudioContext.resume();

      inputContextRef.current = inputAudioContext;
      outputContextRef.current = outputAudioContext;
      
      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setConnected(true);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Resample input from system rate (e.g. 48k) to 16k required by Gemini
              const resampledData = resampleTo16kHz(inputData, inputAudioContext.sampleRate);
              const pcmBlob = createBlob(resampledData);
              
              // Send input only if session is established
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination); // Required for script processor to run
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setSpeaking(true);
              // Ensure gapless playback
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContext,
                24000, // Gemini sends 24kHz audio
                1
              );
              
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setSpeaking(false);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            
            // Handle Interruptions
            if (message.serverContent?.interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
               setSpeaking(false);
            }
          },
          onclose: () => {
            setConnected(false);
          },
          onerror: (e) => {
            console.error(e);
            setError("Connection failed. Check your internet or API Key.");
            disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          // STRICT INTERVIEWER PERSONA
          systemInstruction: `You are Alex, a Senior Hiring Manager at a top tech company in India (like Swiggy, CRED, or Flipkart).
          
          YOUR GOAL:
          Conduct a 5-minute screening interview.

          BEHAVIOR:
          1.  Wait for the candidate to say "Hello" or start speaking.
          2.  Once they speak, greet them professionally and ask them to introduce themselves.
          3.  Ask one behavioral or technical question at a time.
          4.  If they ramble, interrupt politely ("Let's focus on X...").
          5.  Keep your responses short (under 20 seconds).
          6.  Be neutral but professional.
          
          Start now.`,
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      setError("Could not access microphone or connect. Please verify permissions.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="p-12 bg-dark-800/40 backdrop-blur-md rounded-3xl border border-white/5 flex flex-col items-center justify-center min-h-[600px] text-center relative overflow-hidden shadow-2xl"
    >
      {/* Animated Background Effect */}
      {connected && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-tech/10 rounded-full blur-[100px] transition-opacity duration-1000 ${speaking ? 'opacity-100' : 'opacity-30'}`}></div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-2xl mx-auto">
          
          {/* Status Indicator */}
          <div className="flex justify-center mb-12">
            <motion.div 
                className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 relative border-4 ${
                    connected 
                    ? speaking 
                        ? 'bg-brand-tech border-white shadow-[0_0_60px_rgba(59,130,246,0.6)]' 
                        : 'bg-brand-success border-transparent shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                    : 'bg-dark-700 border-dark-600'
                }`}
                animate={speaking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                {connected && (
                    <div className={`absolute -bottom-12 text-sm font-bold font-mono tracking-widest uppercase ${speaking ? 'text-brand-tech' : 'text-brand-success'}`}>
                        {speaking ? "Interviewer Speaking" : "Listening..."}
                    </div>
                )}

                {connected ? (
                    speaking ? (
                         <Bot size={64} className="text-white" />
                    ) : (
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                            <User size={64} className="text-white relative z-10" />
                        </div>
                    )
                ) : (
                    <Mic size={48} className="text-gray-500" />
                )}
            </motion.div>
          </div>

          <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            AI Interviewer <span className="text-xs bg-brand-tech px-2 py-1 rounded text-white font-mono align-middle">LIVE</span>
          </h2>
          
          {!connected ? (
              <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg">
                Practice with <b>Alex</b>, a Senior Hiring Manager. <br/>
                <span className="text-sm opacity-70">Real-time voice feedback. No typing required.</span>
              </p>
          ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-950/50 border border-white/10 rounded-xl p-6 mb-10 max-w-md mx-auto"
              >
                  <h3 className="text-brand-success font-bold mb-2 flex items-center justify-center gap-2">
                    <Activity size={18} className="animate-pulse"/> Session Active
                  </h3>
                  <p className="text-white text-lg font-medium">
                    Say <span className="text-brand-tech">"Hello"</span> to start the interview.
                  </p>
              </motion.div>
          )}

          {error && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 bg-red-900/20 px-4 py-2 rounded-lg mb-6 border border-red-500/20">
                {error}
             </motion.div>
          )}

          {!connected ? (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startSession}
              className="flex items-center gap-3 bg-brand-tech hover:bg-blue-600 px-10 py-5 rounded-full text-xl font-bold transition-all shadow-lg shadow-blue-900/30 mx-auto"
            >
              <Mic size={24} />
              Connect & Interview
            </motion.button>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={disconnect}
              className="flex items-center gap-3 bg-red-500 hover:bg-red-600 px-10 py-5 rounded-full text-xl font-bold transition-all shadow-lg shadow-red-900/30 mx-auto"
            >
              <Square size={24} />
              End Session
            </motion.button>
          )}
      </div>
    </motion.div>
  );
};

export default MockInterview;