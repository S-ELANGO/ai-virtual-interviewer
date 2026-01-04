import { motion } from 'framer-motion';
import { Home, Info, Sparkles, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-center"
        >
            <div className="glass-card px-6 py-3 flex items-center gap-8 rounded-full bg-secondary/30 border-white/10 backdrop-blur-md shadow-lg">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 font-bold text-foreground hover:text-primary transition-colors">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>AI Interviewer</span>
                </Link>

                {/* Separator */}
                <div className="w-px h-4 bg-border/50" />

                {/* Links */}
                <div className="flex items-center gap-6">
                    <a href="#home" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        <Home className="w-4 h-4" />
                        Home
                    </a>
                    <a href="#features" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        <Layers className="w-4 h-4" />
                        Features
                    </a>
                    <a href="#about" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        <Info className="w-4 h-4" />
                        About
                    </a>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
