import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

const Extra = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/content/extra`)
      .then(res => res.json())
      .then(data => {
        setActivities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch extra', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-20 font-aladin text-2xl animate-pulse">Loading passions...</div>;

  return (
    <div className="pt-6 space-y-6 animate-in transition-all duration-700">
      <div className="space-y-1">
        <h1 className="inline-block text-4xl font-aladin bg-gradient-to-r from-black via-rose-950 to-rose-900 dark:from-white dark:via-rose-100 dark:to-rose-200 bg-clip-text text-transparent uppercase">
          Extracurriculars
        </h1>
        <p className="block text-lg font-aladin text-orange-900 dark:text-orange-100 opacity-90 leading-snug">
          Beyond academics: My passions and community involvement.
        </p>
      </div>

      <div className="grid gap-4">
        {activities.map((activity, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-md hover:border-orange-700/30"
          >
            <h2 className="inline-block text-2xl font-aladin bg-gradient-to-r from-black via-rose-950 to-rose-900 dark:from-white dark:via-rose-100 dark:to-rose-200 bg-clip-text text-transparent uppercase">
              {activity.title}
            </h2>
            <p className="text-xs font-mono text-orange-700 dark:text-orange-400 uppercase tracking-widest mt-0.5">
              {activity.role}
            </p>
            <p className="mt-2 text-base font-aladin text-rose-950 dark:text-orange-100 opacity-90 leading-snug border-l-4 border-rose-900 dark:border-rose-500 pl-3">
              {activity.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Extra;
