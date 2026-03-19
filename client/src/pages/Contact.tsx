import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAlert } from '../context/AlertContext';

const API_URL = import.meta.env.VITE_API_URL;

const Contact = () => {
  const { showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      name: (e.target as any).name.value,
      email: (e.target as any).email.value,
      message: (e.target as any).message.value,
    };
    
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        showAlert('Success', 'Message sent successfully!', 'success');
        (e.target as HTMLFormElement).reset();
      } else {
        showAlert('Error', 'Failed to send message.', 'error');
      }
    } catch (error) {
      showAlert('Error', 'Error connecting to server.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-5 space-y-10 animate-in transition-all duration-700">
      <div className="space-y-2">
        <h1 className="inline-block text-6xl font-aladin bg-gradient-to-r from-black via-cyan-950 to-cyan-900 dark:from-white dark:via-cyan-100 dark:to-cyan-200 bg-clip-text text-transparent uppercase">
          Contact
        </h1>
        <p className="block text-xl font-aladin text-cyan-900 dark:text-cyan-100 opacity-90 leading-tight">
          Care to get in touch with me?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-lg font-aladin text-cyan-950 dark:text-cyan-100 opacity-90">Name</label>
            <input
              type="text"
              id="name"
              required
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-cyan-700/50 outline-none transition-all duration-300 focus:shadow-lg"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-lg font-aladin text-cyan-950 dark:text-cyan-100 opacity-90">Email</label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-cyan-700/50 outline-none transition-all duration-300 focus:shadow-lg"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-lg font-aladin text-cyan-950 dark:text-cyan-100 opacity-90">Message</label>
          <textarea
            id="message"
            rows={5}
            required
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-cyan-700/50 outline-none transition-all duration-300 focus:shadow-lg"
          ></textarea>
        </div>
        <button
          type="submit"
          className="group relative inline-flex items-center gap-2 px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-aladin text-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
        >
          <Send size={20} className="relative z-10" />
          <span className="relative z-10">Send Message</span>
          <motion.div className="absolute inset-0 bg-cyan-900 dark:bg-cyan-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
        </button>
      </form>

      <div className="pt-10 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-3xl font-aladin bg-gradient-to-r from-slate-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">Connect Elsewhere</h3>
        <div className="mt-4 flex gap-6">
          {['LinkedIn', 'GitHub', 'Instagram'].map((item) => (
            <a key={item} href="#" className="font-aladin text-xl bg-gradient-to-r from-slate-500 to-slate-400 dark:from-slate-400 dark:to-slate-500 bg-clip-text text-transparent hover:from-blue-600 hover:to-blue-400 transition-all duration-300 underline-offset-4 decoration-blue-600/30 hover:underline">
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
