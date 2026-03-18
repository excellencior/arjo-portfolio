import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';
import Photography from './pages/Photography';
import Academics from './pages/Academics';
import Extra from './pages/Extra';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';

const Home = () => (
  <div className="text-center mt-10 space-y-6 animate-in transition-all duration-700">
    <div className="space-y-4">
      <h1 className="inline-block text-7xl font-aladin bg-gradient-to-r from-black via-black to-blue-950 dark:from-white dark:via-white dark:to-blue-300 bg-clip-text text-transparent uppercase tracking-wider">
        ARJO PORTFOLIO
      </h1>
      <p className="block max-w-none mx-auto text-2xl font-aladin bg-gradient-to-r from-black via-black to-blue-900 dark:from-white dark:via-white dark:to-blue-400 bg-clip-text text-transparent leading-tight">
        A minimalistic sanctuary showcasing photography, academics, and personal stories.
      </p>
    </div>
    
    <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-6">
      <Link 
        to="/photography" 
        className="group relative px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-aladin text-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      >
        <span className="relative z-10">Explore Photography</span>
        <motion.div className="absolute inset-0 bg-blue-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
      </Link>
      <Link 
        to="/contact" 
        className="px-8 py-3 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white rounded-xl font-aladin text-xl hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all duration-300"
      >
        Start a Conversation
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="photography" element={<Photography />} />
            <Route path="academics" element={<Academics />} />
            <Route path="extra" element={<Extra />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:id" element={<BlogPost />} />
            <Route path="contact" element={<Contact />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
