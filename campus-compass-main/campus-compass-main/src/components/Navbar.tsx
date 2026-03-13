import { Compass } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[70px] glass">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-ui text-sm font-bold tracking-wider text-primary">
              CAMPUS NAV
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 font-ui text-xs tracking-widest">
          <span className="text-text-2 hover:text-primary transition-colors cursor-pointer">SJCE</span>
          <span className="text-text-2 hover:text-secondary transition-colors cursor-pointer">SJIT</span>
        </div>
        
        <div className="font-mono text-xs text-text-3">
          v1.0 · LUMINA
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
