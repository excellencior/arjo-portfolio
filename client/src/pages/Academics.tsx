import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const Academics = () => {
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/content/academics`)
      .then(res => res.json())
      .then(data => {
        setEducation(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch academics', err);
        setLoading(false);
      });
  }, []);


  if (loading) return <div className="text-center mt-20 font-aladin text-2xl animate-pulse">Gathering wisdom...</div>;

  return (
    <div className="space-y-8 animate-in transition-all duration-700 max-w-4xl mx-auto pb-16">
      <div className="space-y-1">
        <h1 className="inline-block text-4xl font-aladin bg-gradient-to-r from-black via-emerald-950 to-emerald-900 dark:from-white dark:via-emerald-100 dark:to-emerald-200 bg-clip-text text-transparent uppercase text-left">
          Academics
        </h1>
        <p className="block text-lg font-aladin text-emerald-950 dark:text-emerald-100 opacity-90 leading-snug">
          My educational journey and academic achievements.
        </p>
      </div>

      <div className="relative px-2 pb-16">
        {/* Central Vertical Line (Desktop) */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
        
        {/* Sidebar Line (Mobile) */}
        <div className="md:hidden absolute left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="space-y-8 md:space-y-0">
          {education.length > 0 ? (
            education.map((edu, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className={`relative flex flex-col md:flex-row items-center md:justify-between w-full md:mb-10 last:mb-0`}>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-8 md:left-1/2 top-0 md:top-5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-slate-50 dark:ring-slate-950 shadow-sm z-10" />

                  {/* Card Wrapper */}
                  <div className={`w-full md:w-[45%] pl-14 md:pl-0 ${isEven ? 'md:mr-auto' : 'md:ml-auto'}`}>
                    <div className={`bg-white dark:bg-slate-900/40 backdrop-blur-sm rounded-lg p-3 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500 hover:shadow-md ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                      <div className={`flex flex-col mb-2 ${isEven ? 'md:items-end' : 'md:items-start'}`}>
                        <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-[0.2em] bg-emerald-50/50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded w-fit">
                          {edu.start_year} — {edu.end_year || 'Present'}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-aladin text-slate-900 dark:text-white uppercase leading-none tracking-tight mb-1">
                        {edu.title}
                      </h3>
                      
                      <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 opacity-70 uppercase tracking-widest mb-2">
                        {edu.institution}
                      </p>
                      
                      <div className={`border-t border-slate-50 dark:border-slate-800/50 pt-2 mt-1`}>
                        <p className="font-aladin text-sm text-slate-500 dark:text-slate-400 leading-snug">
                          {edu.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 border border-dashed border-emerald-200 dark:border-emerald-900/50 rounded-xl col-span-full">
              <p className="font-aladin text-3xl text-slate-400 dark:text-slate-500 italic opacity-60">
                "The pursuit of knowledge is a journey with no finish line."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Academics;
