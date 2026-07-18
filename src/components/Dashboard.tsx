import { useState, useEffect } from 'react';
import { databaseService } from '../lib/firebase';
import { UserProfile, UserStats } from '../types';
import { Flame, Clock, CheckCircle, ArrowRight, Sparkles, BookOpen, Layers, Edit, Calendar } from 'lucide-react';

interface DashboardProps {
  uid: string;
  onNavigateToChat: (initialPrompt?: string) => void;
  onNavigateToSettings: () => void;
}

export default function Dashboard({ uid, onNavigateToChat, onNavigateToSettings }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await databaseService.getUserProfile(uid);
        const userStats = await databaseService.getUserStats(uid);
        setProfile(userProfile);
        setStats(userStats);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#4D7C7A] border-t-transparent"></div>
          <p className="text-xs text-stone-500 font-serif">Loading your Study Desk...</p>
        </div>
      </div>
    );
  }

  const quickPrompts = [
    {
      title: "Weekly Study Plan",
      description: "Ask Study Buddy to map out your study schedule for the coming week.",
      prompt: "Assalam-o-Alaikum! Please help me structure a balanced weekly study timetable for my CSS exam preparation.",
      icon: "📅",
      badge: "Syllabus Plan"
    },
    {
      title: "Pakistan Affairs Quiz",
      description: "Test your knowledge on key past-paper topics in Pakistan Affairs.",
      prompt: "Can you quiz me with 5 CSS-level questions on Pakistan Affairs (focusing on post-1947 constitutional history)? Provide constructive feedback.",
      icon: "✍️",
      badge: "General Knowledge"
    },
    {
      title: "Review Essay Outline",
      description: "Get feedback on an essay outline structure and thesis argument.",
      prompt: "Here is an essay topic: 'Global Warming and its Impact on Pakistan'. Can I share my draft outline with you to receive polite feedback on its coherence?",
      icon: "📝",
      badge: "Compulsory Essay"
    },
    {
      title: "Précis Writing Rules",
      description: "Learn the absolute essentials and FPSC rules for précis drafting.",
      prompt: "What are the core FPSC rules and grading criteria for writing a good English Précis? Explain simply with a short example.",
      icon: "📚",
      badge: "Précis & Composition"
    }
  ];

  return (
    <div className="max-w-6xl w-full mx-auto p-6 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl border border-[#E9E5DB] p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E8F1F0] opacity-40 rounded-full blur-3xl"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8C8A82]">
              Current Candidate profile
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#4D7C7A]/10 text-[#2D4F4D] font-bold">
              {profile?.targetExam || 'CSS'} Aspirant
            </span>
          </div>
          <h2 className="text-3xl font-serif font-semibold text-[#2D4F4D]">
            Assalam-o-Alaikum, {profile?.name || 'Aspirant'}!
          </h2>
          <p className="text-xs text-[#5C5A55] max-w-xl leading-relaxed">
            Welcome to your digital study cabinet. Your senior advisor, <strong className="text-[#2D4F4D]">Study Buddy</strong>, is here. Pick a quick prompt below or visit the study chat to discuss details.
          </p>
        </div>

        <button
          onClick={onNavigateToSettings}
          className="px-5 py-2.5 rounded-xl border border-[#E9E5DB] text-xs font-medium text-[#5C5A55] hover:bg-[#E8F1F0]/40 transition flex items-center space-x-1.5 cursor-pointer shrink-0"
        >
          <Edit className="w-3.5 h-3.5 text-[#4D7C7A]" />
          <span>Edit Syllabus Profile</span>
        </button>
      </div>

      {/* Consistency Trackers & Core Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Streak indicator */}
        <div className="bg-white rounded-2xl border border-[#E9E5DB] p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEF9E7] border border-[#F9F0CE] flex items-center justify-center">
            <Flame className="w-6 h-6 text-[#B7950B] fill-[#B7950B]" />
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-[#2D4F4D]">{stats?.streak || 1} Days</p>
            <p className="text-[11px] text-[#8C8A82]">Study Streak Consistency</p>
          </div>
        </div>

        {/* Study time indicator */}
        <div className="bg-white rounded-2xl border border-[#E9E5DB] p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F1F0] border border-[#CDE1E0] flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#4D7C7A]" />
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-[#2D4F4D]">{stats?.totalMinutes || 0} mins</p>
            <p className="text-[11px] text-[#8C8A82]">Cumulative Interaction Time</p>
          </div>
        </div>

        {/* Topics Reviewed */}
        <div className="bg-white rounded-2xl border border-[#E9E5DB] p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F1F0] border border-[#CDE1E0] flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-[#2D4F4D]" />
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-[#2D4F4D]">{stats?.topicsReviewed || 0} Topics</p>
            <p className="text-[11px] text-[#8C8A82]">Unique Subjects Evaluated</p>
          </div>
        </div>

        {/* Target commission details */}
        <div className="bg-[#4D7C7A] text-[#FDFCF9] rounded-2xl border border-[#4D7C7A] p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-[#FEF9E7] text-xl font-bold font-serif">
            📜
          </div>
          <div>
            <p className="text-lg font-serif font-bold text-[#FEF9E7]">{profile?.targetExam || 'CSS'} Syllabus</p>
            <p className="text-[10px] text-[#FDFCF9]/80">FPSC/PPSC Compulsories Active</p>
          </div>
        </div>
      </div>

      {/* Selected Optional Subjects & Syllabus */}
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E9E5DB] p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#4D7C7A]" />
            <h3 className="text-lg font-serif font-semibold text-[#2D4F4D]">Selected Optionals</h3>
          </div>
          <p className="text-xs text-[#5C5A55] leading-relaxed">
            Your customized elective subjects for scoring. Speak with Study Buddy to optimize high-scoring strategies.
          </p>

          <div className="space-y-2.5 pt-2">
            {profile?.optionalSubjects && profile.optionalSubjects.length > 0 ? (
              profile.optionalSubjects.map((sub, i) => (
                <div key={i} className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-[#FDFCF9] border border-[#E9E5DB]">
                  <span className="w-2 h-2 rounded-full bg-[#B7950B]"></span>
                  <span className="text-xs font-medium text-stone-700">{sub}</span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-stone-200 text-center text-xs text-stone-400">
                No optional subjects selected yet.
                <button 
                  onClick={onNavigateToSettings}
                  className="block mt-2 mx-auto px-3 py-1 rounded bg-[#E9E5DB]/60 text-stone-600 hover:bg-[#E9E5DB] text-[10px] cursor-pointer"
                >
                  Configure Subjects
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick-Start Prompt Suggestions */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#4D7C7A]" />
            <h3 className="text-lg font-serif font-semibold text-[#2D4F4D]">Recommended Interactive Topics</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {quickPrompts.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-[#E9E5DB] p-5 space-y-3 hover:border-[#4D7C7A] transition group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-[#FDFCF9] border border-[#E9E5DB] text-[#5C5A55] font-medium font-mono">
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#2D4F4D] group-hover:text-[#4D7C7A] transition">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <button
                  onClick={() => onNavigateToChat(item.prompt)}
                  className="pt-2 flex items-center text-[11px] font-semibold text-[#4D7C7A] hover:text-[#2D4F4D] transition space-x-1 cursor-pointer self-start"
                >
                  <span>Discuss This Topic</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
