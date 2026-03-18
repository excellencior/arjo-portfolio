import { motion } from 'framer-motion';

const Academics = () => {
  const education = [
    { title: "Bachelor of Science", institution: "University Name", duration: "2020 - 2024", description: "Focused on Computer Science and Engineering." },
    { title: "High School", institution: "College Name", duration: "2018 - 2020", description: "Completed with honors in Science." }
  ];

  const projects = [
    { title: "Portfolio Website", description: "A minimalistic personal portfolio built with React and Tailwind CSS.", tech: "React, Tailwind, Express" },
    { title: "E-Commerce Platform", description: "A full-stack e-commerce solution with payment integration.", tech: "Next.js, Node.js, Stripe" }
  ];

  return (
    <div className="space-y-12 animate-in transition-all duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Academics</h1>
        <p className="text-gray-600 dark:text-gray-400">My educational journey and academic achievements.</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Education</h2>
        <div className="grid gap-6">
          {education.map((edu, idx) => (
            <motion.div
              key={idx}
              whileHover={{ x: 5 }}
              className="p-6 bg-white dark:bg-gray-800/50 sharp border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{edu.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">{edu.institution} | {edu.duration}</p>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{edu.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-gray-800/50 sharp border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{project.title}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{project.description}</p>
              <div className="mt-4 flex gap-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-mono rounded">{project.tech}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Academics;
