import { motion } from 'framer-motion';

const Extra = () => {
  const activities = [
    { title: "Photography Club", role: "Member", description: "Participating in photo walks and exhibitions." },
    { title: "Volunteer Work", role: "Contributor", description: "Helping out at local community centers." }
  ];

  return (
    <div className="pt-10 space-y-10 animate-in transition-all duration-700">
      <div className="space-y-2">
        <h1 className="text-6xl font-aladin bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent uppercase">
          Extracurriculars
        </h1>
        <p className="text-xl font-aladin bg-gradient-to-r from-gray-600 to-gray-400 dark:from-slate-400 dark:to-slate-500 bg-clip-text text-transparent leading-tight">
          Beyond academics: My passions and community involvement.
        </p>
      </div>

      <div className="grid gap-6">
        {activities.map((activity, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:border-blue-500/30"
          >
            <h2 className="text-3xl font-aladin bg-gradient-to-r from-slate-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent uppercase">
              {activity.title}
            </h2>
            <p className="text-sm font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest mt-1">
              {activity.role}
            </p>
            <p className="mt-4 font-aladin text-lg bg-gradient-to-r from-slate-600 to-slate-400 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-transparent leading-tight">
              {activity.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Extra;
