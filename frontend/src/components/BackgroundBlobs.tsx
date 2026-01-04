import { motion } from 'framer-motion';

const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Purple Blob - Top Left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full animate-blob1"
        style={{
          background: 'radial-gradient(circle, hsl(263 70% 58% / 0.3), transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Pink Blob - Top Right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.3 }}
        className="absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full animate-blob2"
        style={{
          background: 'radial-gradient(circle, hsl(330 80% 60% / 0.25), transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Purple Blob - Bottom Right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.6 }}
        className="absolute -bottom-40 -right-20 w-[550px] h-[550px] rounded-full animate-blob3"
        style={{
          background: 'radial-gradient(circle, hsl(263 70% 58% / 0.25), transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Pink Blob - Bottom Left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.9 }}
        className="absolute -bottom-20 -left-40 w-[450px] h-[450px] rounded-full animate-blob1"
        style={{
          background: 'radial-gradient(circle, hsl(330 80% 60% / 0.2), transparent 60%)',
          filter: 'blur(60px)',
          animationDelay: '-5s',
        }}
      />

      {/* Center Subtle Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(263 70% 58% / 0.05), transparent 50%)',
        }}
      />
    </div>
  );
};

export default BackgroundBlobs;
