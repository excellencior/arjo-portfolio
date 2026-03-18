import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lightbox from "yet-another-react-lightbox";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";

interface Photo {
  src: string;
  width: number;
  height: number;
  title: string;
  intent: string;
  category: string;
}

const Skeleton = () => (
  <div className="relative p-6 border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl animate-pulse">
    <div className="aspect-[4/3] bg-gray-200 dark:bg-slate-800 rounded-xl mb-8" />
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded-lg w-3/4" />
      <div className="h-20 bg-gray-200 dark:bg-slate-800 rounded-lg w-full" />
    </div>
  </div>
);

const Photography = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    // Simulate loading for the premium feel
    const timer = setTimeout(() => {
      const mockPhotos: Photo[] = [
        { 
          src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b", 
          width: 1080, height: 720, 
          title: "Ethereal Peaks", 
          intent: "Capturing the silent majesty of the Himalayas at first light, where the mist meets the morning sun.",
          category: "Landscape"
        },
        { 
          src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470", 
          width: 1080, height: 1620, 
          title: "Urban Geometry", 
          intent: "A study on the interplay of light and shadow against the brutalist architecture of the city.",
          category: "Architecture"
        },
        { 
          src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e", 
          width: 1080, height: 720, 
          title: "Nature's Palette", 
          intent: "Exploring the vibrant colors of a hidden valley during the golden hour.",
          category: "Nature"
        },
        { 
          src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e", 
          width: 1080, height: 1620, 
          title: "Solitude", 
          intent: "Finding peace in the deep woods, where the only sound is the rustling of leaves.",
          category: "Nature"
        },
        {
          src: "https://images.unsplash.com/photo-1532270660266-d47260c30de2",
          width: 1080, height: 720,
          title: "Forgotten Path",
          intent: "A journey through time along a trail reclaimed by the wild forest.",
          category: "Adventure"
        },
        {
          src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
          width: 1080, height: 1620,
          title: "Morning Mist",
          intent: "The world waking up in a blanket of soft, silver fog.",
          category: "Atmospheric"
        }
      ];
      setPhotos(mockPhotos);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pt-10 space-y-6 animate-in transition-all duration-700">
      <div className="space-y-2 text-center mx-auto w-full">
        <h1 className="inline-block text-6xl font-aladin bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent uppercase mb-4">
          Photography
        </h1>
        <div className="h-1 w-20 bg-blue-600 mx-auto mb-4" />
        <p className="block text-xl font-aladin bg-gradient-to-r from-slate-600 via-slate-500 to-blue-400 bg-clip-text text-transparent leading-tight">
          A collection of visual narratives, moments frozen in time, and the intentions behind them.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 px-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
        ) : (
          photos.map((photo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative"
              onClick={() => setIndex(idx)}
            >
              <div className="relative p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-2xl transition-all duration-500 hover:border-blue-500/50 hover:shadow-xl">
                <div className="aspect-[4/3] overflow-hidden relative rounded-xl">
                  <motion.img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-full">
                      {photo.category}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h2 className="inline-block text-4xl font-aladin bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-wide">
                      {photo.title || "Untitled Photo"}
                    </h2>
                    <span className="text-sm font-mono text-slate-400">0{idx + 1}</span>
                  </div>
                  <p className="text-lg font-aladin bg-gradient-to-r from-slate-600 via-slate-500 to-slate-400 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-transparent leading-tight border-l-4 border-blue-600 pl-4 py-1">
                    {photo.intent || "No description provided."}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
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
