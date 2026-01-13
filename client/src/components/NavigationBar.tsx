import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, Info, Ticket, Phone } from 'lucide-react';
import { GlassPanel } from './GlassPanel';

interface NavigationBarProps {
  currentScreen: string;
  navigateTo: (screen: any) => void;
  isMobile: boolean;
  openOverlay?: (overlay: string) => void;
}

const NavigationBar = ({ currentScreen, navigateTo, isMobile, openOverlay }: NavigationBarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Overlays are handled by the parent component

  const navItems = [
    { id: 'home', label: 'VYOMANG', icon: null },
    { id: 'about', label: 'About', icon: Info },
    { id: 'events', label: 'Events', icon: Ticket },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  const handleNavItemClick = (id: string) => {
    if (id === 'home') {
      navigateTo('home');
    } else if (id === 'guest-pass') {
      navigateTo('guest-pass');
    } else if (openOverlay) {
      openOverlay(id);
    }
  };

  // Content for each overlay
  const overlayContent = {
    about: {
      title: '🏛️ About VYOMANG',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            VYOMANG is a flagship college fest created to celebrate innovation, creativity, and collaboration.
          </p>
          <p>
            It is a platform where students come together to showcase talent, exchange ideas, and experience something beyond routine college events. VYOMANG represents ambition, unity, and the spirit of building a legacy that lasts beyond the fest itself.
          </p>
        </div>
      )
    },
    events: {
      title: '🎭 Events',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            VYOMANG hosts a wide range of events designed to engage students across different interests and skills.
          </p>
          <p>
            These include technical competitions, cultural performances, interactive games, exhibitions, and workshops. Each event is curated to encourage participation, learning, and healthy competition in a vibrant environment.
          </p>
        </div>
      )
    },
    schedule: {
      title: '🗓️ Schedule',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            The schedule section provides a clear overview of the event timeline.
          </p>
          <p>
            It highlights important dates, major activities, and key sessions planned throughout the fest. This helps participants and visitors plan their day and make the most out of their time at VYOMANG.
          </p>
        </div>
      )
    },
    contact: {
      title: '📞 Contact',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            The Contact section is available for queries, support, and coordination.
          </p>
          <p>
            Participants can reach out to the organizing team for information related to registrations, events, schedules, or any general assistance required before or during the fest.
          </p>
        </div>
      )
    },
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center px-4">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo on the left */}
          <button 
            onClick={() => navigateTo('home')}
            className="font-display text-xl font-bold gold-gradient-text hover:opacity-80 transition-opacity"
          >
            VYOMANG
          </button>

          {/* Desktop Navigation Items */}
          {!isMobile && (
            <div className="flex space-x-6">
              {navItems.slice(1).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item.id)}
                  className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1"
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-white hover:text-white/80 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col"
          >
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-white/80 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-sm">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'home') {
                        navigateTo('home');
                        setMobileMenuOpen(false);
                      } else if (item.id === 'guest-pass') {
                        navigateTo('guest-pass');
                        setMobileMenuOpen(false);
                      } else {
                        handleNavItemClick(item.id);
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="w-full py-4 px-6 text-left text-lg text-white/90 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3"
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays are handled by the parent component */}
    </>
  );
};

export default NavigationBar;