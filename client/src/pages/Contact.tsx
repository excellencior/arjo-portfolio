import { Send } from 'lucide-react';

const Contact = () => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      name: (e.target as any).name.value,
      email: (e.target as any).email.value,
      message: (e.target as any).message.value,
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Message sent successfully!');
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      alert('Failed to send message.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in transition-all duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Contact</h1>
        <p className="text-gray-600 dark:text-gray-400">Let's build something together.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              id="name"
              required
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 sharp border border-gray-100 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 sharp border border-gray-100 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
          <textarea
            id="message"
            rows={6}
            required
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 sharp border border-gray-100 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
          ></textarea>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 sharp font-bold hover:opacity-90 transition-opacity"
        >
          <Send size={18} />
          <span>Send Message</span>
        </button>
      </form>

      <div className="pt-12 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Connect Elsewhere</h3>
        <div className="mt-4 flex gap-4">
          <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors underline underline-offset-4">LinkedIn</a>
          <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors underline underline-offset-4">GitHub</a>
          <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors underline underline-offset-4">Instagram</a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
