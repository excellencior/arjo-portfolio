import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
    <div className="pt-5 space-y-10 animate-in transition-all duration-700">
      <div className="space-y-2">
        <h1 className="inline-block text-6xl font-aladin bg-gradient-to-r from-black via-emerald-950 to-emerald-900 dark:from-white dark:via-emerald-100 dark:to-emerald-200 bg-clip-text text-transparent uppercase">
          Academics
        </h1>
        <p className="block text-xl font-aladin text-emerald-950 dark:text-emerald-100 opacity-90 leading-tight">
          My educational journey and academic achievements.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="inline-block text-4xl font-aladin bg-gradient-to-r from-black via-emerald-950 to-emerald-900 dark:from-white dark:via-emerald-100 dark:to-emerald-200 bg-clip-text text-transparent">
          Education
        </h2>
        <div className="grid gap-6">
          {education.map((edu, idx) => (
            <motion.div
              key={idx}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-md hover:border-emerald-600/20"
            >
              <h3 className="inline-block text-2xl font-aladin bg-gradient-to-r from-black via-emerald-950 to-emerald-900 dark:from-white dark:via-emerald-100 dark:to-emerald-200 bg-clip-text text-transparent">
                {edu.title}
              </h3>
              <p className="text-sm font-mono text-slate-400 mt-1">{edu.institution} | {edu.duration}</p>
              <p className="mt-3 font-aladin text-lg text-emerald-900 dark:text-emerald-100 leading-tight border-l-4 border-emerald-900 dark:border-emerald-500 pl-4">
                {edu.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Academics;
