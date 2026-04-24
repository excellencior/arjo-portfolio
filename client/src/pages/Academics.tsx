import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Academics = () => {
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/content/academics`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEducation(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch academics', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-20 font-aladin text-2xl animate-pulse">Gathering wisdom...</div>;

  return (
    <div className="space-y-10 animate-in transition-all duration-700 pb-16 w-full lg:w-[40%] mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="inline-block text-4xl font-aladin bg-gradient-to-r from-black via-emerald-950 to-emerald-900 dark:from-white dark:via-emerald-100 dark:to-emerald-200 bg-clip-text text-transparent uppercase text-left">
          Academics
        </h1>
        <p className="block text-lg font-aladin text-emerald-950 dark:text-emerald-100 opacity-90 leading-snug">
          My educational journey and academic milestones.
        </p>
      </div>

      {education.length > 0 ? (
        <div className="relative">
          {/* Vertical timeline spine */}
          <div className="absolute left-[23px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-400/60 via-emerald-300/30 to-transparent dark:from-emerald-500/40 dark:via-emerald-700/20" />

          <div className="space-y-0">
            {education.map((edu, idx) => {
              const isOngoing = !edu.end_year;
              const duration = edu.end_year 
                ? `${edu.end_year - edu.start_year} year${edu.end_year - edu.start_year !== 1 ? 's' : ''}`
                : `${new Date().getFullYear() - edu.start_year}+ years`;

              return (
                <motion.div
                  key={edu.id ?? idx}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="relative pl-14 pb-10 last:pb-0 group"
                >
                  {/* Timeline node */}
                  <div className={`absolute left-[15px] top-1 z-10 w-[17px] h-[17px] rounded-full border-[3px] transition-colors duration-300 ${
                    isOngoing 
                      ? 'bg-emerald-500 border-emerald-200 dark:border-emerald-900 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                      : 'bg-white dark:bg-slate-900 border-emerald-400 dark:border-emerald-600 group-hover:bg-emerald-500 group-hover:border-emerald-200 dark:group-hover:border-emerald-900'
                  }`} />

                  {/* Horizontal connector */}
                  <div className="absolute left-[32px] top-[8.5px] w-[20px] h-px bg-emerald-300/50 dark:bg-emerald-700/40" />

                  {/* Card */}
                  <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:shadow-md transition-all duration-400 group-hover:translate-x-1">
                    {/* Top row: year range + duration */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-md ${
                          isOngoing
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {edu.start_year} — {edu.end_year || 'Present'}
                        </span>
                        {isOngoing && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {duration}
                      </span>
                    </div>

                    {/* Degree title */}
                    <h3 className="text-xl font-aladin text-slate-900 dark:text-white uppercase leading-tight tracking-tight">
                      {edu.title}
                    </h3>
                    
                    {/* Institution */}
                    <div className="flex items-center gap-1.5 mt-1 mb-3">
                      <GraduationCap size={13} className="text-emerald-500 shrink-0" />
                      <p className="text-xs font-aladin text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.15em]">
                        {edu.institution}
                      </p>
                    </div>
                    
                    {/* Description */}
                    {edu.description && (
                      <p className="font-aladin text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-l-2 border-emerald-200 dark:border-emerald-800 pl-3">
                        {edu.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-emerald-200 dark:border-emerald-900/50 rounded-xl">
          <p className="font-aladin text-3xl text-slate-400 dark:text-slate-500 italic opacity-60">
            "The pursuit of knowledge is a journey with no finish line."
          </p>
        </div>
      )}
    </div>
  );
};

export default Academics;
