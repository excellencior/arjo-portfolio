import { motion } from 'framer-motion';

const Extra = () => {
  const activities = [
    { title: "Photography Club", role: "Member", description: "Participating in photo walks and exhibitions." },
    { title: "Volunteer Work", role: "Contributor", description: "Helping out at local community centers." }
  ];

  return (
    <div className="space-y-12 animate-in transition-all duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Extracurriculars</h1>
        <p className="text-gray-600 dark:text-gray-400">Beyond academics: My passions and community involvement.</p>
      </div>

      <div className="grid gap-6">
        {activities.map((activity, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="p-8 bg-white dark:bg-gray-800/50 sharp border border-gray-100 dark:border-gray-800 transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activity.title}</h2>
            <p className="text-blue-500 dark:text-blue-400 font-medium">{activity.role}</p>
            <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">{activity.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Extra;
