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
  <div className="text-center mt-20 space-y-8 animate-in transition-all duration-700">
    <div className="space-y-4">
      <h1 className="text-6xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">
        ARJO <span className="text-blue-500 italic font-serif">PORTFOLIO</span>
      </h1>
      <p className="max-w-xl mx-auto text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
        A minimalistic sanctuary showcasing photography, academics, and personal stories.
      </p>
    </div>
    
    <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-6">
      <Link 
        to="/photography" 
        className="group relative px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 sharp font-bold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      >
        <span className="relative z-10">Explore Photography</span>
        <motion.div className="absolute inset-0 bg-blue-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
      </Link>
      <Link 
        to="/contact" 
        className="px-8 py-3 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white sharp font-bold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-300"
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
