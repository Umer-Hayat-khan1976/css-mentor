import { useState, useEffect } from 'react';
import { databaseService } from '../lib/firebase';
import { UserProfile, TargetExam } from '../types';
import { motion } from 'motion/react';
import { Save, User, Compass, Layers, Check, Volume2, ShieldCheck, LogOut, Settings } from 'lucide-react';

interface SettingsPageProps {
  uid: string;
  onLogout: () => void;
  onSaveCompleted: () => void;
}

const AVAILABLE_OPTIONALS = [
  "Political Science",
  "International Relations",
  "US History",
  "European History",
  "Islamic History & Culture",
  "Gender Studies",
  "Criminology",
  "Environmental Sciences",
  "Public Administration",
  "Town Planning & Urban Management",
  "Constitutional Law",
  "International Law",
  "Sociology",
  "Anthropology",
  "Punjabi",
  "Sindhi",
  "Pashto",
  "Balochi",
  "Persian",
  "Arabic",
  "Computer Science",
  "Business Administration"
];

export default function SettingsPage({ uid, onLogout, onSaveCompleted }: SettingsPageProps) {
  const [name, setName] = useState('');
  const [targetExam, setTargetExam] = useState<TargetExam>('CSS');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedOptionals, setSelectedOptionals] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await databaseService.getUserProfile(uid);
        if (profile) {
          setName(profile.name);
          setTargetExam(profile.targetExam);
          setVoiceEnabled(profile.voiceEnabled);
          setSelectedOptionals(profile.optionalSubjects || []);
        }
      } catch (err) {
        console.error("Failed to load settings profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [uid]);

  const handleToggleOptional = (subject: string) => {
    setSelectedOptionals(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      } else {
        // Limit selection to 6 subjects to follow standard syllabus structures
        if (prev.length >= 6) {
          alert("You can select up to 6 optional subjects to meet syllabus limits!");
          return prev;
        }
        return [...prev, subject];
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setSuccessMsg(null);

    try {
      await databaseService.updateUserProfile(uid, {
        name: name.trim(),
        targetExam,
        voiceEnabled,
        optionalSubjects: selectedOptionals
      });
      setSuccessMsg("Profile and syllabus saved successfully!");
      setTimeout(() => {
        setSuccessMsg(null);
        onSaveCompleted();
      }, 1200);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#4D7C7A] border-t-transparent"></div>
          <p className="text-xs text-stone-500 font-serif">Consulting FPSC syllabus rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto p-6 space-y-8">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E9E5DB] pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F1F0] border border-[#CDE1E0] flex items-center justify-center text-[#2D4F4D]">
            <Settings className="w-5 h-5 text-[#2D4F4D]" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#2D4F4D]">Syllabus & Profile Settings</h2>
            <p className="text-xs text-[#8C8A82]">Configure your commission examination goals and elective syllabus subjects.</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-50 hover:text-red-800 transition flex items-center space-x-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Aspirant Session</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid md:grid-cols-12 gap-8">
        {/* Core Profile Fields */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E9E5DB] p-6 space-y-5 shadow-xs">
            <h3 className="text-base font-serif font-semibold text-[#2D4F4D] border-b border-[#FDFCF9] pb-2">
              Primary Identity
            </h3>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C5A55] block" htmlFor="settings-name">
                Candidate Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                <input
                  id="settings-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FDFCF9] border border-[#E9E5DB] focus:outline-none focus:ring-1 focus:ring-[#4D7C7A] focus:border-[#4D7C7A] transition"
                />
              </div>
            </div>

            {/* Target Exam */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5C5A55] block">
                Target Civil Commission Exam
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetExam('CSS')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    targetExam === 'CSS'
                      ? 'border-[#4D7C7A] bg-[#E8F1F0] text-[#2D4F4D]'
                      : 'border-[#E9E5DB] bg-white text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-sm font-bold">CSS</span>
                  <span className="text-[8px] uppercase tracking-wider opacity-80">Federal Service</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetExam('PMS')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    targetExam === 'PMS'
                      ? 'border-[#4D7C7A] bg-[#E8F1F0] text-[#2D4F4D]'
                      : 'border-[#E9E5DB] bg-white text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-sm font-bold">PMS</span>
                  <span className="text-[8px] uppercase tracking-wider opacity-80">Provincial Service</span>
                </button>
              </div>
            </div>

            {/* Voice preferences */}
            <div className="pt-4 border-t border-[#FDFCF9] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4.5 h-4.5 text-[#4D7C7A]" />
                  <span className="text-xs font-semibold text-[#5C5A55]">Mouth-to-Ear Speech synthesis</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`w-10 h-6 rounded-full transition relative p-0.5 cursor-pointer ${
                    voiceEnabled ? 'bg-[#4D7C7A]' : 'bg-stone-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    voiceEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>
              <p className="text-[10px] text-[#8C8A82] leading-normal">
                If enabled, Study Buddy will automatically vocalize its answers back to you out loud after generation. Great for auditory learners!
              </p>
            </div>
          </div>

          <div className="bg-[#4D7C7A] text-white rounded-2xl p-5 space-y-2.5">
            <h4 className="text-xs font-bold text-[#FEF9E7] uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FEF9E7]" />
              <span>FPSC Syllabus Guard</span>
            </h4>
            <p className="text-[11px] text-[#FDFCF9]/80 leading-relaxed">
              Optional subjects are grouped into distinct lists. Select up to 6 of your subjects. Your choice is embedded inside Study Buddy's custom context when chatting!
            </p>
          </div>
        </div>

        {/* Optional Subjects checklist */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-[#E9E5DB] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#FDFCF9] pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4.5 h-4.5 text-[#4D7C7A]" />
              <h3 className="text-base font-serif font-semibold text-[#2D4F4D]">Elective / Optional Syllabus Selection</h3>
            </div>
            <span className="text-[10px] bg-[#E8F1F0] border border-[#CDE1E0] text-[#2D4F4D] px-2.5 py-1 rounded-full font-semibold">
              {selectedOptionals.length} / 6 selected
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 max-h-[350px] overflow-y-auto pr-1.5 custom-scrollbar">
            {AVAILABLE_OPTIONALS.map((subject, idx) => {
              const isChecked = selectedOptionals.includes(subject);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleToggleOptional(subject)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between group cursor-pointer ${
                    isChecked
                      ? 'bg-[#E8F1F0] border-[#4D7C7A] text-[#2D4F4D]'
                      : 'bg-[#FDFCF9] border-[#E9E5DB] text-stone-600 hover:bg-[#E8F1F0]/30 hover:border-[#4D7C7A]'
                  }`}
                >
                  <span className="truncate pr-1 group-hover:translate-x-0.5 transition-transform">{subject}</span>
                  <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition ${
                    isChecked ? 'bg-[#4D7C7A] border-[#4D7C7A] text-white' : 'border-stone-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Save bar */}
          <div className="pt-4 border-t border-[#E9E5DB] flex items-center justify-between">
            <div>
              {successMsg && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-emerald-700 font-semibold flex items-center gap-1"
                >
                  <Check className="w-4.5 h-4.5 text-emerald-600 stroke-[3px]" />
                  {successMsg}
                </motion.span>
              )}
            </div>
            
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#4D7C7A] text-[#FDFCF9] hover:bg-[#3B615F] disabled:bg-stone-400 transition flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              {saving ? (
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Persist Study Desk Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
