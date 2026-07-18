import { motion } from 'motion/react';
import { BookOpen, Compass, Award, ShieldAlert, Sparkles, HelpCircle, ArrowRight, BookMarked, Layers } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF9]">
      {/* Navigation */}
      <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#4D7C7A] flex items-center justify-center shadow-sm">
            <Compass className="text-[#FEF9E7] w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#2D4F4D]">CSS Mentor</h1>
            <p className="text-[10px] font-mono tracking-widest text-[#8C8A82] uppercase">Aspirant Companion</p>
          </div>
        </div>
        <button
          onClick={onStart}
          className="px-5 py-2 rounded-xl text-sm font-medium bg-[#4D7C7A] text-[#FDFCF9] hover:bg-[#3B615F] transition shadow-sm cursor-pointer"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 md:py-16 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#E8F1F0] border border-[#CDE1E0] text-[#2D4F4D] text-xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B7950B]" />
            <span>FPSC & PPSC Competitive Exams Assistant</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-[#2D4F4D] leading-[1.15]">
              Master CSS & PMS with <br />
              <span className="text-[#B7950B] italic font-normal">Study Buddy</span> at your side.
            </h2>
            <p className="text-base md:text-lg text-[#5C5A55] leading-relaxed max-w-xl">
              An AI-powered mentor crafted specifically for Pakistani civil service aspirants. Chat, discuss, speak, and perfect your Essay, Précis, Current Affairs, and Optional subjects.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <button
              onClick={onStart}
              className="px-8 py-4 rounded-xl text-base font-medium bg-[#4D7C7A] text-[#FDFCF9] hover:bg-[#3B615F] transition shadow-md flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <span>Begin Preparation</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="px-6 py-4 rounded-xl text-base font-medium border border-[#E9E5DB] text-[#5C5A55] hover:bg-[#E8F1F0]/45 transition text-center"
            >
              Explore Features
            </a>
          </motion.div>

          {/* Quick Stats Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E9E5DB]"
          >
            <div>
              <p className="text-2xl font-serif font-bold text-[#2D4F4D]">100%</p>
              <p className="text-xs text-[#8C8A82]">FPSC Syllabus Coverage</p>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-[#2D4F4D]">Interactive</p>
              <p className="text-xs text-[#8C8A82]">Voice & Chat Mentoring</p>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-[#2D4F4D]">Free</p>
              <p className="text-xs text-[#8C8A82]">Study Companionship</p>
            </div>
          </motion.div>
        </div>

        {/* Right side graphic or introductory mock chat card */}
        <div className="md:col-span-5 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-sm bg-white rounded-3xl border border-[#E9E5DB] p-6 shadow-xl relative"
          >
            {/* Soft decorative accent background */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#FEF9E7] opacity-60 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#E8F1F0] opacity-60 rounded-full blur-xl"></div>

            {/* Simulated Study Buddy Card */}
            <div className="flex items-center space-x-3 mb-5 border-b border-[#FDFCF9] pb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#4D7C7A] flex items-center justify-center text-[#FEF9E7] text-xl font-bold font-serif shadow-inner">
                📖
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#2D4F4D] flex items-center">
                  Study Buddy
                  <span className="ml-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                </h4>
                <p className="text-[10px] text-stone-400">Senior Civil Service Advisor</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FDFCF9] rounded-2xl p-3 text-xs text-[#5C5A55] max-w-[85%] self-start border border-[#E9E5DB]">
                Assalam-o-Alaikum! I am your Study Buddy. Are you preparing for CSS or PMS this year? Let's choose your optional subjects!
              </div>

              <div className="bg-[#4D7C7A] text-[#FDFCF9] rounded-2xl p-3 text-xs max-w-[85%] ml-auto text-right">
                Walaikum Assalam! I need help structuring my English Essay outline on 'Water Crisis in Pakistan'.
              </div>

              <div className="bg-[#FDFCF9] rounded-2xl p-3 text-xs text-[#5C5A55] max-w-[95%] self-start border border-[#E9E5DB] space-y-2">
                <p className="font-semibold text-[#2D4F4D]">Perfect! Let's draft a 3-part outline:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>I. Introduction:</strong> Thesis statement on water resource depletion and socio-economic impact.</li>
                  <li><strong>II. Key Causes:</strong> Climate change, poor water-governance, and treaty disputes.</li>
                  <li><strong>III. Way Forward:</strong> Modern irrigation techniques and reservoir building.</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#FDFCF9] flex justify-between items-center text-[11px] text-[#8C8A82]">
              <span className="flex items-center gap-1">🎙️ Microphone Enabled</span>
              <span className="text-[#B7950B] font-medium">Ready when you are</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Feature Section */}
      <section id="how-it-works" className="bg-white border-y border-[#E9E5DB] py-16 px-6">
        <div className="max-w-7xl w-full mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h3 className="text-2xl md:text-3xl font-serif font-semibold text-[#2D4F4D]">
              Why Prepare with CSS Mentor?
            </h3>
            <p className="text-sm text-[#5C5A55]">
              Designed with the structure of Pakistani Federal Public Service Commission (FPSC) rules in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#FDFCF9] border border-[#E9E5DB] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F1F0] border border-[#CDE1E0] flex items-center justify-center text-[#2D4F4D]">
                <BookMarked className="w-5 h-5 text-[#2D4F4D]" />
              </div>
              <h4 className="text-lg font-serif font-semibold text-[#2D4F4D]">Subject Selection & Syllabus</h4>
              <p className="text-xs text-[#5C5A55] leading-relaxed">
                Struggling to cross the 600-mark optional hurdle? Study Buddy analyzes your background to recommend optimal subject combinations under FPSC/PPSC rules.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFCF9] border border-[#E9E5DB] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#FEF9E7] border border-[#F9F0CE] flex items-center justify-center text-[#B7950B]">
                <Layers className="w-5 h-5 text-[#B7950B]" />
              </div>
              <h4 className="text-lg font-serif font-semibold text-[#2D4F4D]">Essay & Précis Evaluation</h4>
              <p className="text-xs text-[#5C5A55] leading-relaxed">
                Get instant, polite grading of your English Essay structures, thesis statements, or grammar outlines, reducing the anxiety of the 95% fail-rate subject.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFCF9] border border-[#E9E5DB] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F1F0] border border-[#CDE1E0] flex items-center justify-center text-[#2D4F4D]">
                <Compass className="w-5 h-5 text-[#2D4F4D]" />
              </div>
              <h4 className="text-lg font-serif font-semibold text-[#2D4F4D]">Voice Mentoring Mode</h4>
              <p className="text-xs text-[#5C5A55] leading-relaxed">
                Tired of typing? Toggle the Voice icon to have actual spoke-to-spoken chats with Study Buddy. Rehearse CSS psychological or viva questions out loud!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4D7C7A] text-[#FDFCF9]/80 py-8 px-6 text-center text-xs border-t border-[#3B615F]">
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 text-left">
            <Compass className="text-[#FEF9E7] w-5 h-5" />
            <div>
              <span className="font-bold text-[#FDFCF9]">CSS Mentor</span>
              <p className="text-[10px] text-[#CDE1E0]">Polite Guidance for Pakistan Civil Services</p>
            </div>
          </div>
          <p>© 2026 CSS Mentor. Strictly aligned with FPSC and PPSC Syllabus recommendations.</p>
        </div>
      </footer>
    </div>
  );
}
