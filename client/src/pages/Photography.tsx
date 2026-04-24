import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lightbox from "yet-another-react-lightbox";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";

interface Photo {
  id?: number;
  src: string;
  width: number;
  height: number;
  title: string;
  intent: string;
  category: string;
}

const Skeleton = () => (
  <div className="relative p-3 border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/50 rounded-lg animate-pulse">
    <div className="aspect-[4/3] bg-gray-200 dark:bg-slate-800 rounded-md mb-4" />
    <div className="space-y-3">
      <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded-lg w-3/4" />
      <div className="h-14 bg-gray-200 dark:bg-slate-800 rounded-lg w-full" />
    </div>
  </div>
);

const API_URL = import.meta.env.VITE_API_URL;

const Photography = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(-1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/images`)
      .then(res => res.json())
      .then(data => {
        setPhotos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setPhotos([]);
        setLoading(false);
      });
  }, []);

  // Derive unique categories from photos
  const categories = Array.from(new Set(photos.map(p => p.category).filter(Boolean))).sort();
  
  // Filter photos by active category
  const filteredPhotos = activeCategory 
    ? photos.filter(p => p.category === activeCategory) 
    : photos;

  return (
    <div className="space-y-6 animate-in transition-all duration-700 pb-16">
      <div className="space-y-1 text-center mx-auto w-full">
        <h1 className="inline-block text-4xl font-aladin bg-gradient-to-r from-black via-blue-950 to-blue-900 dark:from-white dark:via-blue-100 dark:to-blue-200 bg-clip-text text-transparent uppercase mb-2">
          Photography
        </h1>
        <p className="block text-lg font-aladin text-blue-950 dark:text-blue-100 opacity-90 leading-snug">
          A collection of visual narratives, moments frozen in time, and the intentions behind them.
        </p>
      </div>

      {/* Category Filter */}
      {!loading && categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 border ${
              activeCategory === null
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 border ${
                activeCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
        ) : filteredPhotos.length > 0 ? (
          filteredPhotos.map((photo, idx) => (
            <motion.div
              key={photo.id ?? idx}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative"
              onClick={() => setIndex(photos.indexOf(photo))}
            >
              <div className="relative p-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-lg transition-all duration-500 hover:border-blue-700/50 hover:shadow-md">
                <div className="aspect-[4/3] overflow-hidden relative rounded-md">
                  <motion.img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    loading="lazy"
                  />
                  {photo.category && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-full">
                        {photo.category}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <h2 className="inline-block text-2xl font-aladin bg-gradient-to-r from-black via-blue-950 to-blue-900 dark:from-white dark:via-blue-100 dark:to-blue-200 bg-clip-text text-transparent tracking-wide">
                      {photo.title || "Untitled Photo"}
                    </h2>
                    <span className="text-xs font-mono text-slate-400">
                      {String(photos.indexOf(photo) + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {photo.intent && (
                    <p className="text-base font-aladin text-blue-900 dark:text-blue-100 leading-snug border-l-4 border-blue-900 dark:border-blue-500 pl-3 py-0.5">
                      {photo.intent}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-blue-200 dark:border-blue-900/50 rounded-xl col-span-full">
            <p className="font-aladin text-3xl text-slate-400 dark:text-slate-500 italic opacity-60">
              "The best camera is the one that's with you, capturing the unseen."
            </p>
          </div>
        )}
      </div>

      <Lightbox
        index={index}
        slides={photos.map(p => ({ src: p.src, download: `${p.src}?download` }))}
        open={index >= 0}
        close={() => setIndex(-1)}
        plugins={[Download]}
        styles={{ 
          container: { 
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(12px)"
          } 
        }}
      />
    </div>
  );
};

export default Photography;
