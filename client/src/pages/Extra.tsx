import { motion } from 'framer-motion';

const Extra = () => {
  const activities = [
    { title: "Photography Club", role: "Member", description: "Participating in photo walks and exhibitions." },
    { title: "Volunteer Work", role: "Contributor", description: "Helping out at local community centers." }
  ];

  return (
    <div className="pt-10 space-y-10 animate-in transition-all duration-700">
      <div className="space-y-2">
        <h1 className="inline-block text-6xl font-aladin bg-gradient-to-r from-black via-rose-950 to-rose-900 dark:from-white dark:via-rose-100 dark:to-rose-200 bg-clip-text text-transparent uppercase">
          Extracurriculars
        </h1>
        <p className="block text-xl font-aladin text-orange-900 dark:text-orange-100 opacity-90 leading-tight">
          Beyond academics: My passions and community involvement.
        </p>
      </div>

      <div className="grid gap-6">
        {activities.map((activity, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:border-orange-700/30"
          >
            <h2 className="inline-block text-3xl font-aladin bg-gradient-to-r from-black via-rose-950 to-rose-900 dark:from-white dark:via-rose-100 dark:to-rose-200 bg-clip-text text-transparent uppercase">
              {activity.title}
            </h2>
            <p className="text-sm font-mono text-orange-700 dark:text-orange-400 uppercase tracking-widest mt-1">
              {activity.role}
            </p>
            <p className="mt-4 font-aladin text-lg text-rose-950 dark:text-orange-100 opacity-90 leading-tight border-l-4 border-rose-900 dark:border-rose-500 pl-4">
              {activity.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Extra;
