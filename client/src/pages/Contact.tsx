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
    <div className="max-w-4xl mx-auto pt-6 space-y-6 animate-in transition-all duration-700">
      <div className="space-y-1">
        <h1 className="inline-block text-4xl font-aladin bg-gradient-to-r from-black via-cyan-950 to-cyan-900 dark:from-white dark:via-cyan-100 dark:to-cyan-200 bg-clip-text text-transparent uppercase">
          Contact
        </h1>
        <p className="block text-lg font-aladin text-cyan-900 dark:text-cyan-100 opacity-90 leading-snug">
          Care to get in touch with me? I will try my best to reply and connect. Love talking to new people!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-base font-aladin text-cyan-950 dark:text-cyan-100 opacity-90">Name</label>
            <input
              type="text"
              id="name"
              required
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-800 focus:border-cyan-700/50 outline-none transition-all duration-300 focus:shadow-md text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="email" className="text-base font-aladin text-cyan-950 dark:text-cyan-100 opacity-90">Email</label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-800 focus:border-cyan-700/50 outline-none transition-all duration-300 focus:shadow-md text-sm"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="message" className="text-base font-aladin text-cyan-950 dark:text-cyan-100 opacity-90">Message</label>
          <textarea
            id="message"
            rows={4}
            required
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-800 focus:border-cyan-700/50 outline-none transition-all duration-300 focus:shadow-md text-sm"
          ></textarea>
        </div>
        <button
          type="submit"
          className="group relative inline-flex items-center gap-1.5 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-aladin text-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        >
          <Send size={16} className="relative z-10" />
          <span className="relative z-10">Send Message</span>
          <motion.div className="absolute inset-0 bg-cyan-900 dark:bg-cyan-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
        </button>
      </form>

    </div>
  );
};

export default Contact;
