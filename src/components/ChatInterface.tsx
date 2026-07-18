import { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { databaseService } from '../lib/firebase';
import { Conversation, Message, UserProfile } from '../types';
import { 
  getSpeechRecognition, 
  isSpeechRecognitionSupported, 
  speakText, 
  stopSpeaking 
} from '../lib/speech';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Plus, 
  Sparkles, 
  BookOpen, 
  ShieldAlert, 
  Clock, 
  Smile, 
  Play, 
  Square,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatInterfaceProps {
  uid: string;
  initialPrompt?: string;
  onClearInitialPrompt: () => void;
  onNavigateToDashboard: () => void;
}

export default function ChatInterface({ uid, initialPrompt, onClearInitialPrompt, onNavigateToDashboard }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // States for interaction features
  const [streamingText, setStreamingText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  // Voice STT recording state
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  // Audio playback state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Profile and Initial Conversations
  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await databaseService.getUserProfile(uid);
        if (userProfile) {
          setProfile(userProfile);
          setVoiceEnabled(userProfile.voiceEnabled);
        }

        const list = await databaseService.getConversations(uid);
        setConversations(list);

        if (list.length > 0) {
          // Open the most recent conversation
          setActiveConvId(list[0].id);
        } else {
          // Auto-create initial general conversation thread
          const newC = await databaseService.createConversation(uid, "Compulsory & General Help");
          setConversations([newC]);
          setActiveConvId(newC.id);
        }
      } catch (err) {
        console.error("Failed to load initial chat details:", err);
      }
    }
    loadData();
  }, [uid]);

  // Handle Initial Prompt Redirect from Dashboard
  useEffect(() => {
    if (initialPrompt && activeConvId) {
      setInputText(initialPrompt);
      onClearInitialPrompt();
    }
  }, [initialPrompt, activeConvId]);

  // Load Messages whenever active conversation changes
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      try {
        // Stop any active text-to-speech when switching threads
        stopSpeaking();
        setIsSpeaking(false);
        setStreamingText('');

        const msgs = await databaseService.getMessages(uid, activeConvId!);
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }
    loadMessages();
  }, [uid, activeConvId]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Setup Speech Recognition STT on mount
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      const rec = getSpeechRecognition();
      if (rec) {
        rec.onstart = () => {
          setIsListening(true);
        };
        rec.onend = () => {
          setIsListening(false);
        };
        rec.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          setIsListening(false);
        };
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(prev => prev + (prev ? ' ' : '') + transcript);
          }
        };
        setRecognition(rec);
      }
    }
  }, []);

  // Handle Speech Recognition Mic Toggle
  const toggleListening = () => {
    if (!recognition) {
      alert("Voice recognition is not supported or permission is blocked in your browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      stopSpeaking();
      setIsSpeaking(false);
      try {
        recognition.start();
      } catch (e) {
        console.error("Failed to start SpeechRecognition:", e);
      }
    }
  };

  // Manage Thread Operations
  const handleNewThread = async () => {
    stopSpeaking();
    setIsSpeaking(false);
    
    // Choose a friendly name
    const threadTitles = [
      "Essay Structure & Arguments",
      "Syllabus Study Plan",
      "Current Affairs Discussion",
      "Past-Paper Quiz & Evaluation",
      "General Motivation"
    ];
    const pickedTitle = threadTitles[Math.floor(Math.random() * threadTitles.length)];
    const title = prompt("Enter a title for this new preparation thread:", pickedTitle);
    
    if (!title || !title.trim()) return;

    try {
      const newC = await databaseService.createConversation(uid, title.trim());
      setConversations(prev => [newC, ...prev]);
      setActiveConvId(newC.id);
    } catch (err) {
      console.error("Failed to create thread:", err);
    }
  };

  const handleDeleteThread = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this study thread and its messages?")) return;

    try {
      stopSpeaking();
      setIsSpeaking(false);

      await databaseService.deleteConversation(uid, convId);
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);

      if (activeConvId === convId) {
        if (remaining.length > 0) {
          setActiveConvId(remaining[0].id);
        } else {
          setActiveConvId(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  // ═══════════════════════════════
  // CHAT SENDING AND STREAMING LOGIC
  // ═══════════════════════════════
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || isSending) return;

    const userText = inputText.trim();
    setInputText('');
    setIsSending(true);
    setStreamingText('');
    stopSpeaking();
    setIsSpeaking(false);

    try {
      // 1. Save user message to database
      const userMsg = await databaseService.addMessage(uid, activeConvId, 'user', userText);
      setMessages(prev => [...prev, userMsg]);

      // 2. Prepare conversation history for Gemini API
      // We extract all messages up to this point
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      // 3. Initiate chunked stream request to the Express server
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: history })
      });

      if (!response.body) {
        throw new Error("No streamable body returned from backend.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponseText = '';

      // Read chunk by chunk
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value);
        // Clean SSE formatting e.g., 'data: {"text": "chunk"}\n\n'
        const lines = chunkStr.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataContent = line.slice(6).trim();
            if (dataContent === "[DONE]") {
              // Streaming finished
              break;
            }
            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.text) {
                fullResponseText += parsed.text;
                setStreamingText(fullResponseText);
              }
            } catch (jsonErr) {
              // Non-JSON or broken chunks ignored
            }
          }
        }
      }

      // 4. Stream finished. Save full Study Buddy response to Firestore / LocalStorage
      if (fullResponseText.trim()) {
        const assistantMsg = await databaseService.addMessage(uid, activeConvId, 'study_buddy', fullResponseText);
        setMessages(prev => [...prev, assistantMsg]);
        
        // 5. Speak response aloud if voice preference is active
        if (voiceEnabled) {
          speakText(
            fullResponseText,
            () => setIsSpeaking(false),
            () => setIsSpeaking(true)
          );
        }

        // 6. Dynamically update stats in background
        const currentStats = await databaseService.getUserStats(uid);
        await databaseService.updateUserStats(uid, {
          totalMinutes: currentStats.totalMinutes + 1, // increment time
          topicsReviewed: currentStats.topicsReviewed + (Math.random() > 0.7 ? 1 : 0) // maybe increment topics
        });
      }

    } catch (err: any) {
      console.error("Failed to stream/save message:", err);
      // Construct a gentle study buddy message explaining the connectivity issue
      const errorMsgText = "*(Apologies, my student friend! I ran into an issue connecting to my brain systems. Let's try sending that message again!)*";
      const assistantMsg = await databaseService.addMessage(uid, activeConvId, 'study_buddy', errorMsgText);
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setStreamingText('');
      setIsSending(false);
    }
  };

  // Voice Speech Synthesis manual control
  const handleVocalizeMessage = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(
        text,
        () => setIsSpeaking(false),
        () => setIsSpeaking(true)
      );
    }
  };

  const handleToggleVoicePreference = async () => {
    const newVal = !voiceEnabled;
    setVoiceEnabled(newVal);
    stopSpeaking();
    setIsSpeaking(false);
    
    // Save to user profile
    try {
      await databaseService.updateUserProfile(uid, { voiceEnabled: newVal });
    } catch (e) {
      console.error("Failed to save voice enabled preference:", e);
    }
  };

  // Specific CSS layout styling for the exact off-topic guardrail phrase:
  // "I can only guide you regarding CSS and PMS related questions."
  const isOffTopic = (text: string): boolean => {
    return text.includes("I can only guide you regarding CSS and PMS related questions.");
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-70px)] bg-[#FDFCF9] overflow-hidden">
      
      {/* ═══════════════════════════════
          SIDEBAR: THREAD MANAGEMENT
          ═══════════════════════════════ */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#E9E5DB] bg-white flex flex-col shrink-0">
        {/* Threads Header */}
        <div className="p-4 border-b border-[#FDFCF9] flex items-center justify-between">
          <span className="text-xs font-bold text-[#2D4F4D] uppercase tracking-wider flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-[#2D4F4D]" />
            <span>Study Threads</span>
          </span>
          <button
            onClick={handleNewThread}
            className="p-1.5 rounded-lg bg-[#4D7C7A] text-[#FDFCF9] hover:bg-[#3B615F] transition shadow-xs cursor-pointer"
            title="Create New Thread"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Threads List */}
        <div className="flex-grow overflow-y-auto p-2.5 space-y-1 custom-scrollbar max-h-[160px] md:max-h-none">
          {conversations.length > 0 ? (
            conversations.map((c) => {
              const isActive = activeConvId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full p-3 rounded-xl text-left text-xs transition flex items-center justify-between group cursor-pointer ${
                    isActive
                      ? 'bg-[#4D7C7A] text-[#FDFCF9] font-medium shadow-sm'
                      : 'hover:bg-[#E8F1F0]/40 text-stone-600'
                  }`}
                >
                  <span className="truncate pr-2 font-medium">{c.title}</span>
                  <button
                    onClick={(e) => handleDeleteThread(c.id, e)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-red-600 transition ${
                      isActive ? 'group-hover:text-red-400 hover:bg-white/10' : ''
                    }`}
                    title="Delete Thread"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-[11px] text-stone-400">
              No threads active. Click + to begin.
            </div>
          )}
        </div>

        {/* Mobile Info Banner */}
        <div className="hidden md:block p-4 border-t border-[#FDFCF9] bg-[#E8F1F0]/20 text-[10px] text-stone-500 space-y-1.5">
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-[#2D4F4D]">Active Mentoring</span>
          </div>
          <p className="leading-relaxed">Keep your threads organized by syllabus papers (e.g. "Syllabus Essay outline", "PMS Punjabi help").</p>
        </div>
      </div>

      {/* ═══════════════════════════════
          MAIN CHAT SCREEN
          ═══════════════════════════════ */}
      <div className="flex-grow flex flex-col bg-[#FDFCF9] h-full relative overflow-hidden">
        
        {/* Chat Window Header */}
        <div className="px-6 py-4 border-b border-[#E9E5DB] bg-white flex items-center justify-between shadow-xs z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4D7C7A] flex items-center justify-center text-xl font-serif text-[#FEF9E7] shadow-sm">
              📖
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#2D4F4D] flex items-center">
                Study Buddy
                <span className="ml-2 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              </h3>
              <p className="text-[10px] text-stone-500 font-mono">
                {isSending ? "Structuring answer..." : "Polite Senior Civil Advisor"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Return back button */}
            <button
              onClick={onNavigateToDashboard}
              className="px-3 py-1.5 rounded-xl border border-[#E9E5DB] text-[10px] font-semibold text-[#5C5A55] hover:bg-stone-50 transition cursor-pointer"
            >
              ← Study Desk
            </button>

            {/* Voice Mute/Unmute Toggle */}
            <button
              onClick={handleToggleVoicePreference}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                voiceEnabled
                  ? 'border-[#4D7C7A] bg-[#E8F1F0] text-[#2D4F4D]'
                  : 'border-stone-200 text-stone-400 hover:bg-stone-50'
              }`}
              title={voiceEnabled ? "Mute Voice Out" : "Enable Voice Out"}
            >
              {voiceEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar pb-24">
          {messages.length === 0 && !streamingText && (
            <div className="max-w-md mx-auto text-center py-12 space-y-4">
              <div className="text-3xl">☕</div>
              <h4 className="text-sm font-serif font-semibold text-[#2D4F4D]">
                Welcome to your interactive study thread!
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                I am here to guide you with complete syllabus layouts. Type your query below or utilize our microphone button to dictate!
              </p>
              <div className="bg-[#FDFCF9] p-3 rounded-xl border border-[#E9E5DB] text-[10px] text-[#8C8A82] max-w-xs mx-auto">
                Example: <em>"Review my English Essay outline on water governance"</em> or <em>"Suggest optional marks for CSS"</em>.
              </div>
            </div>
          )}

          {/* Render Saved Messages */}
          {messages.map((m) => {
            const isUser = m.role === 'user';
            const textOffTopic = isOffTopic(m.text);

            return (
              <div
                key={m.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-4.5 relative ${
                    isUser
                      ? 'bg-[#4D7C7A] text-[#FDFCF9] rounded-tr-xs'
                      : textOffTopic
                      ? 'bg-[#FEF9E7] border border-[#F9F0CE] text-stone-800 rounded-tl-xs shadow-xs'
                      : 'bg-white border border-[#E9E5DB] text-[#2D4F4D] rounded-tl-xs shadow-xs'
                  }`}
                >
                  {/* Distinct, polite layout for off-topic guardrail */}
                  {textOffTopic && (
                    <div className="flex items-center space-x-1.5 text-[9px] font-bold text-[#B7950B] uppercase tracking-wider mb-2 border-b border-[#F9F0CE] pb-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Syllabus Guardrail Enforced</span>
                    </div>
                  )}

                  <div className="markdown-body text-xs leading-relaxed">
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <Markdown>{m.text}</Markdown>
                    )}
                  </div>

                  <div className={`mt-2 flex items-center justify-between text-[9px] ${
                    isUser ? 'text-white/60' : 'text-stone-400'
                  }`}>
                    <span>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Vocalize button on assistant messages */}
                    {!isUser && !textOffTopic && (
                      <button
                        onClick={() => handleVocalizeMessage(m.text)}
                        className="p-1 rounded hover:bg-stone-100 transition text-stone-400 hover:text-[#4D7C7A] flex items-center gap-0.5 cursor-pointer"
                        title="Vocalize this text"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span className="text-[8px]">Speak</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Render Streaming response chunk */}
          {streamingText && (
            <div className="flex justify-start w-full">
              <div className="max-w-[85%] md:max-w-[75%] bg-white border border-[#E9E5DB] text-stone-800 rounded-3xl p-4.5 rounded-tl-xs shadow-xs relative">
                <div className="flex items-center space-x-1.5 text-[9px] font-mono text-stone-400 mb-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <span>Streaming Study Buddy Response...</span>
                </div>
                <div className="markdown-body text-xs leading-relaxed">
                  <Markdown>{streamingText}</Markdown>
                </div>
              </div>
            </div>
          )}

          {/* Ref marker */}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#FDFCF9] via-[#FDFCF9] to-transparent">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#E9E5DB] p-1.5 flex items-center shadow-lg relative"
          >
            {/* Dictate Microphone Trigger */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl transition shrink-0 cursor-pointer ${
                isListening
                  ? 'bg-[#FEF9E7] text-[#B7950B] animate-pulse border border-[#F9F0CE]'
                  : 'text-stone-400 hover:bg-stone-50'
              }`}
              title={isListening ? "Listening... click to pause" : "Dictate (Speech to Text)"}
            >
              <Mic className="w-4.5 h-4.5" />
            </button>

            {/* Input message field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Listening closely... speak now." : "Query Study Buddy on Essays, Syllabus, PMS..."}
              disabled={isSending}
              className="flex-grow px-3 py-2 text-xs focus:outline-none bg-transparent"
            />

            {/* Submit Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-3 bg-[#4D7C7A] hover:bg-[#3B615F] disabled:bg-stone-200 text-[#FDFCF9] rounded-xl transition shrink-0 shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Active audio stop notifier */}
          {isSpeaking && (
            <div className="max-w-xs mx-auto mt-2 p-1.5 rounded-full bg-stone-100 text-stone-600 text-[10px] text-center flex items-center justify-center gap-2 border border-stone-200 shadow-sm">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
              <span>Study Buddy is speaking out loud.</span>
              <button 
                onClick={() => { stopSpeaking(); setIsSpeaking(false); }}
                className="text-[9px] font-bold text-red-600 hover:underline cursor-pointer flex items-center gap-0.5 ml-1"
              >
                <Square className="w-2.5 h-2.5 fill-red-600" /> Stop Speech
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
