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
    <div className="pt-10 space-y-10 animate-in transition-all duration-700">
      <div className="space-y-2">
        <h1 className="inline-block text-6xl font-aladin bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent uppercase">
          Academics
        </h1>
        <p className="block text-xl font-aladin bg-gradient-to-r from-slate-600 via-slate-500 to-blue-400 bg-clip-text text-transparent leading-tight">
          My educational journey and academic achievements.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="inline-block text-4xl font-aladin bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Education
        </h2>
        <div className="grid gap-6">
          {education.map((edu, idx) => (
            <motion.div
              key={idx}
              whileHover={{ x: 5 }}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:border-blue-500/30"
            >
              <h3 className="inline-block text-2xl font-aladin bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-500 bg-clip-text text-transparent">
                {edu.title}
              </h3>
              <p className="text-sm font-mono text-slate-400 mt-1">{edu.institution} | {edu.duration}</p>
              <p className="mt-3 font-aladin text-lg bg-gradient-to-r from-slate-600 via-slate-500 to-slate-400 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-transparent leading-tight">
                {edu.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="inline-block text-4xl font-aladin bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Projects
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, idx) => (
            <div key={idx} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:border-blue-500/30">
              <h3 className="inline-block text-2xl font-aladin bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-500 bg-clip-text text-transparent">
                {project.title}
              </h3>
              <p className="mt-3 font-aladin text-lg bg-gradient-to-r from-slate-600 via-slate-500 to-slate-400 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-transparent leading-tight">
                {project.description}
              </p>
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400 rounded-full">
                  {project.tech}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Academics;
