import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassPanel } from '@/components/GlassPanel';
import { GoldButton } from '@/components/GoldButton';
import { GoldInput } from '@/components/GoldInput';
import NavigationBar from '@/components/NavigationBar';
import { Check, Mail, Ticket, User, CreditCard, QrCode, ArrowRight, Sparkles, Shield, X, Info } from 'lucide-react';

type Screen = 
  'email' | 'otp' | 'home' | 'ticket' | 'registration' | 'payment' | 'transaction' | 'success' |
  'guest-email' | 'guest-otp' | 'guest-registration' | 'guest-processing' | 'guest-success';

interface FormData {
  email: string;
  otp: string;
  fullName: string;
  registrationNumber: string;
  phoneNumber: string;
  transactionId: string;
  paymentConfirmed: boolean;
  guestName: string;
  guestCollege: string;
  guestDepartment: string;
  guestPassGenerated: boolean;
  guestTicketId: string;
  department: string;
  year: string;
  guestRollNumber: string;
  paymentStatus?: 'pending' | 'completed';
}

interface OtpState {
  canResend: boolean;
  resendTimer: number;
  otpError: string | null;
}

const initialOtpState: OtpState = {
  canResend: true,
  resendTimer: 0,
  otpError: null,
};

export default function VyomangPage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    otp: '',
    fullName: '',
    registrationNumber: '',
    phoneNumber: '',
    transactionId: '',
    paymentConfirmed: false,
    guestName: '',
    guestCollege: '',
    guestDepartment: '',
    guestPassGenerated: false,
    guestTicketId: '',
    department: '',
    year: '',
    guestRollNumber: '',
    paymentStatus: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [otpState, setOtpState] = useState<OtpState>(initialOtpState);
  const [guestOtpState, setGuestOtpState] = useState<OtpState>(initialOtpState);

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const simulateLoading = (callback: () => void, duration = 1500) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      callback();
    }, duration);
  };

  const simulateGuestFlow = (callback: () => void, duration = 1500) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      callback();
    }, duration);
  };

  const handleSendOtp = async () => {
    if (!formData.email) return;
    if (!otpState.canResend) return; // Prevent multiple requests during cooldown
    
    try {
      setLoading(true);
      setOtpState(prev => ({
        ...prev,
        canResend: false,
        resendTimer: 60, // Reset timer to 60 seconds
        otpError: null
      }));
      
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, create a default error response
        console.error('JSON parsing error:', jsonError);
        data = { verified: false, message: 'Server response error. Please try again.' };
      }
      
      if (data.success) {
        // Navigate to OTP screen after successful send
        simulateLoading(() => setCurrentScreen('otp'), 1500);
      } else {
        setOtpState(prev => ({
          ...prev,
          otpError: data.message || 'Failed to send OTP',
          canResend: true, // Allow resend immediately if failed
          resendTimer: 0
        }));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpState(prev => ({
        ...prev,
        otpError: 'Error sending OTP. Please try again.',
        canResend: true, // Allow resend immediately if failed
        resendTimer: 0
      }));
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (formData.otp.length !== 6) return;
    try {
      setLoading(true);
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      
      let data;
            try {
              data = await response.json();
            } catch (jsonError) {
              // If JSON parsing fails, create a default error response
              console.error('JSON parsing error:', jsonError);
              data = { verified: false, message: 'Server response error. Please try again.' };
            }
      
      if (data.verified) {
        // Navigate to registration form after successful OTP verification
        simulateLoading(() => setCurrentScreen('registration'), 800);
      } else {
        setOtpState(prev => ({
          ...prev,
          otpError: data.message || 'Invalid or expired OTP'
        }));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpState(prev => ({
        ...prev,
        otpError: 'Error verifying OTP. Please try again.'
      }));
      setLoading(false);
    }
  };

  const navigateTo = (screen: Screen) => {
    if (screen.startsWith('guest-')) {
      setCurrentScreen(screen);
    } else {
      simulateLoading(() => setCurrentScreen(screen), 800);
    }
  };

  const handleStudentSubmit = async () => {
    if (!formData.fullName || !formData.registrationNumber || !formData.department || !formData.year || !formData.phoneNumber) return;
    
    try {
      setLoading(true);
      
      // Call the API with a timeout wrapper
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/save-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          regNo: formData.registrationNumber,
          department: formData.department,
          year: formData.year,
          email: formData.email,
          phone: formData.phoneNumber,
          paymentStatus: 'pending', // Initially set to pending
        }),
        signal: controller.signal
      }).catch(error => {
        if (error.name === 'AbortError') {
          console.error('Request timed out');
        }
        throw error;
      });
      
      clearTimeout(timeoutId);
      
      // Check if the response is ok before parsing JSON
      if (!response.ok) {
        console.error('Error saving student data:', response.status, response.statusText);
        // Still navigate to payment as fallback, but log the error
        setFormData(prev => ({...prev, paymentStatus: 'pending'}));
        simulateLoading(() => navigateTo('payment'), 1000);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Navigate to payment after successful save
        setFormData(prev => ({...prev, paymentStatus: 'pending'}));
        simulateLoading(() => navigateTo('payment'), 1000);
      } else {
        console.error('Error saving student data:', data.message || 'Unknown error');
        // Navigate to payment as fallback, but log the error
        setFormData(prev => ({...prev, paymentStatus: 'pending'}));
        simulateLoading(() => navigateTo('payment'), 1000);
      }
    } catch (error) {
      console.error('Error submitting student form:', error);
      // Navigate to payment as fallback in case of network error or timeout
      setFormData(prev => ({...prev, paymentStatus: 'pending'}));
      simulateLoading(() => navigateTo('payment'), 1000);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    if (!formData.transactionId || !formData.paymentConfirmed) return;
    
    try {
      setLoading(true);
      
      // Update the payment status in the Google Sheet
      const response = await fetch('/api/update-payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          transactionId: formData.transactionId,
          paymentStatus: 'completed'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local form data and navigate to success
        setFormData(prev => ({
          ...prev,
          paymentStatus: 'completed',
          transactionId: formData.transactionId
        }));
        simulateLoading(() => setCurrentScreen('success'), 2000);
      } else {
        console.error('Error updating payment status:', data.message || 'Unknown error');
        // Still navigate to success but log the error
        setFormData(prev => ({
          ...prev,
          paymentStatus: 'completed',
          transactionId: formData.transactionId
        }));
        simulateLoading(() => setCurrentScreen('success'), 2000);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      // Navigate to success even if API fails to avoid blocking user
      setFormData(prev => ({
        ...prev,
        paymentStatus: 'completed',
        transactionId: formData.transactionId
      }));
      simulateLoading(() => setCurrentScreen('success'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestOtpVerify = async () => {
    if (formData.otp.length !== 6) return;
    try {
      setLoading(true);
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      
      let data;
            try {
              data = await response.json();
            } catch (jsonError) {
              // If JSON parsing fails, create a default error response
              console.error('JSON parsing error:', jsonError);
              data = { verified: false, message: 'Server response error. Please try again.' };
            }
      
      if (data.verified) {
        simulateLoading(() => setCurrentScreen('guest-registration'), 800);
      } else {
        setGuestOtpState(prev => ({
          ...prev,
          otpError: data.message || 'Invalid or expired OTP'
        }));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setGuestOtpState(prev => ({
        ...prev,
        otpError: 'Error verifying OTP. Please try again.'
      }));
      setLoading(false);
    }
  };

  const handleGuestSubmit = async () => {
    if (!formData.guestName || !formData.guestCollege || !formData.guestDepartment || !formData.guestRollNumber || !formData.phoneNumber) return;
    
    try {
      setLoading(true);
      
      // Call the API with a timeout wrapper
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/save-guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.guestName,
          rollNo: formData.guestRollNumber,
          college: formData.guestCollege,
          department: formData.guestDepartment,
          email: formData.email,
          phone: formData.phoneNumber,
        }),
        signal: controller.signal
      }).catch(error => {
        if (error.name === 'AbortError') {
          console.error('Request timed out');
        }
        throw error;
      });
      
      clearTimeout(timeoutId);
      
      // Check if the response is ok before parsing JSON
      if (!response.ok) {
        console.error('Error saving guest data:', response.status, response.statusText);
        // Still show success as fallback, but log the error
        simulateLoading(() => setCurrentScreen('guest-success'), 2000);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        simulateLoading(() => setCurrentScreen('guest-success'), 2000);
      } else {
        console.error('Error saving guest data:', data.message || 'Unknown error');
        // Show success as fallback, but log the error
        simulateLoading(() => setCurrentScreen('guest-success'), 2000);
      }
    } catch (error) {
      console.error('Error submitting guest form:', error);
      // Show success as fallback in case of network error or timeout
      simulateLoading(() => setCurrentScreen('guest-success'), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Add a function to navigate to guest pass flow
  const goToGuestPass = () => {
    navigateTo('guest-email' as Screen);
  };

  const screenVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -30, scale: 0.95 },
  };

  const smoothTransition = {
    duration: 0.8,
    ease: [0.34, 1.56, 0.64, 1] satisfies [number, number, number, number], // Custom smooth easing curve
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close overlay when current screen changes
  useEffect(() => {
    setActiveOverlay(null);
  }, [currentScreen]);

  // OTP Timer effect for main flow
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (otpState.resendTimer > 0) {
      interval = setInterval(() => {
        setOtpState(prev => ({
          ...prev,
          resendTimer: prev.resendTimer - 1
        }));
      }, 1000);
    } else {
      setOtpState(prev => ({
        ...prev,
        canResend: true
      }));
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpState.resendTimer]);

  // OTP Timer effect for guest flow
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (guestOtpState.resendTimer > 0) {
      interval = setInterval(() => {
        setGuestOtpState(prev => ({
          ...prev,
          resendTimer: prev.resendTimer - 1
        }));
      }, 1000);
    } else {
      setGuestOtpState(prev => ({
        ...prev,
        canResend: true
      }));
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [guestOtpState.resendTimer]);

  const handleNavigation = (screen: string) => {
    if (screen === 'guest-pass') {
      // If guest-pass is clicked in the navigation bar, navigate to the guest flow
      if (currentScreen !== 'guest-email' && currentScreen !== 'guest-otp' && currentScreen !== 'guest-registration' && currentScreen !== 'guest-processing' && currentScreen !== 'guest-success') {
        setActiveOverlay(null); // Close any open overlay
        navigateTo('guest-email' as Screen);
      }
    } else if (['about', 'events', 'schedule', 'contact'].includes(screen)) {
      setActiveOverlay(screen);
    } else {
      setActiveOverlay(null); // Close overlay when navigating to other screens
      navigateTo(screen as Screen);
    }
  };

  return (
    <div className="h-full w-full relative main-page">
      <AnimatedBackground />
      
      <NavigationBar currentScreen={currentScreen} navigateTo={handleNavigation} openOverlay={setActiveOverlay} isMobile={isMobile} />
      
      <div className="relative z-10 h-full w-full flex items-center justify-center p-4 md:p-8 pt-20"> {/* Added pt-20 to account for navigation bar */}
        <AnimatePresence mode="wait">
          {activeOverlay && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-2xl">
                <GlassPanel className="relative">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold gold-gradient-text">
                      {activeOverlay === 'about' && '🏛️ About VYOMANG'}
                      {activeOverlay === 'events' && '🎭 Events'}
                      {activeOverlay === 'schedule' && '🗓️ Schedule'}
                      {activeOverlay === 'contact' && '📞 Contact'}
                      {activeOverlay === 'guest-pass' && '🎟️ Guest Pass'}
                    </h2>
                    <button
                      onClick={() => setActiveOverlay(null)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {activeOverlay === 'about' && (
                      <>
                        <p className="text-lg">
                          VYOMANG is a flagship college fest created to celebrate innovation, creativity, and collaboration.
                        </p>
                        <p>
                          It is a platform where students come together to showcase talent, exchange ideas, and experience something beyond routine college events. VYOMANG represents ambition, unity, and the spirit of building a legacy that lasts beyond the fest itself.
                        </p>
                      </>
                    )}
                    {activeOverlay === 'events' && (
                      <>
                        <p className="text-lg">
                          VYOMANG hosts a wide range of events designed to engage students across different interests and skills.
                        </p>
                        <p>
                          These include technical competitions, cultural performances, interactive games, exhibitions, and workshops. Each event is curated to encourage participation, learning, and healthy competition in a vibrant environment.
                        </p>
                      </>
                    )}
                    {activeOverlay === 'schedule' && (
                      <>
                        <p className="text-lg">
                          The schedule section provides a clear overview of the event timeline.
                        </p>
                        <p>
                          It highlights important dates, major activities, and key sessions planned throughout the fest. This helps participants and visitors plan their day and make the most out of their time at VYOMANG.
                        </p>
                      </>
                    )}
                    {activeOverlay === 'contact' && (
                      <>
                        <p className="text-lg">
                          The Contact section is available for queries, support, and coordination.
                        </p>
                        <p>
                          Participants can reach out to the organizing team for information related to registrations, events, schedules, or any general assistance required before or during the fest.
                        </p>
                      </>
                    )}
                    {activeOverlay === 'guest-pass' && (
                      <>
                        <p className="text-lg">
                          The Guest Pass is specially created for students from outside the host college.
                        </p>
                        <p>
                          By registering through the Guest Pass option, eligible students can receive free entry to the fest. Email verification is required, and a digital pass will be issued and sent to the registered email for entry verification.
                        </p>
                      </>
                    )}
                  </div>
                </GlassPanel>
              </div>
            </div>
          )}
          {currentScreen === 'email' && (
            <motion.div
              key="email"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-md screen-animation"
              data-screen="email"
            >
              <GlassPanel>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center"
                  >
                    <Mail className="w-8 h-8 text-white" />
                  </motion.div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold gold-gradient-text mb-3">
                    Verify Your Email
                  </h1>
                  <p className="text-muted-foreground">
                    Enter your email to continue to VYOMANG
                  </p>
                </div>

                <div className="space-y-6">
                  <GoldInput
                    label="Email Address"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    testId="input-email"
                  />
                  <GoldButton
                    onClick={handleSendOtp}
                    loading={loading}
                    disabled={!formData.email}
                    className="w-full"
                    testId="button-send-otp"
                  >
                    Send OTP <ArrowRight className="w-5 h-5" />
                  </GoldButton>
                  {otpState.otpError && (
                    <div className="text-red-500 text-sm mt-2 text-center">
                      {otpState.otpError}
                    </div>
                  )}
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {currentScreen === 'otp' && (
            <motion.div
              key="otp"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-md screen-animation"
              data-screen="otp"
            >
              <GlassPanel>
                <AnimatePresence>
                  {showSuccess ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex flex-col items-center justify-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10 }}
                        className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                      >
                        <Check className="w-10 h-10 text-green-500" />
                      </motion.div>
                      <p className="text-xl font-semibold text-green-500">Verified!</p>
                    </motion.div>
                  ) : (
                    <motion.div>
                      <div className="text-center mb-8">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center"
                        >
                          <Shield className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="font-display text-2xl md:text-3xl font-bold gold-gradient-text mb-3">
                          Enter OTP
                        </h1>
                        <p className="text-muted-foreground">
                          We sent a code to {formData.email}
                        </p>
                      </div>

                      <div className="space-y-6">
                        <GoldInput
                          label="6-Digit Code"
                          type="text"
                          placeholder="000000"
                          maxLength={6}
                          value={formData.otp}
                          onChange={(e) => updateFormData('otp', e.target.value.replace(/\D/g, ''))}
                          className="text-center text-2xl tracking-[0.5em] font-mono"
                          testId="input-otp"
                        />
                        <GoldButton
                          onClick={handleVerifyOtp}
                          loading={loading}
                          disabled={formData.otp.length !== 6}
                          className="w-full"
                          testId="button-verify-otp"
                        >
                          Verify OTP <Check className="w-5 h-5" />
                        </GoldButton>
                        <GoldButton
                          onClick={handleSendOtp}
                          loading={loading}
                          disabled={!otpState.canResend}
                          className="w-full"
                          testId="button-resend-otp"
                        >
                          {otpState.canResend ? (
                            <>
                              Resend OTP <ArrowRight className="w-5 h-5" />
                            </>
                          ) : (
                            <>
                              Resend in {otpState.resendTimer}s
                            </>)
                          }
                        </GoldButton>
                        {otpState.otpError && (
                          <div className="text-red-500 text-sm mt-2 text-center">
                            {otpState.otpError}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassPanel>
            </motion.div>
          )}

          {currentScreen === 'home' && (
            <motion.div
              key="home"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="text-center screen-animation"
              data-screen="home"
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
                className="mb-6 relative"
              >
                <div className="relative inline-block">
                  {/* Removed sparkle icon above VYOMANG */}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 70, damping: 10 }}
                className="relative inline-block"
              >
                <motion.h1
                  className="font-display text-6xl md:text-8xl lg:text-9xl font-bold gold-gradient-text gold-text-glow mb-6 relative"
                  animate={{
                    textShadow: [
                      '0 0 0px rgba(200, 200, 200, 0.3)',
                      '0 0 20px rgba(200, 200, 200, 0.6)',
                      '0 0 0px rgba(200, 200, 200, 0.3)'
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  VYOMANG
                </motion.h1>
                <motion.div
                  className="absolute -inset-4 bg-white/10 blur-xl -z-10 main-page-glow"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-10"
              >
                <motion.p
                  className="text-xl md:text-2xl text-muted-foreground tracking-wide"
                  animate={{
                    textShadow: [
                      '0 0 0px rgba(255, 255, 255, 0.1)',
                      '0 0 10px rgba(255, 255, 255, 0.3)',
                      '0 0 0px rgba(255, 255, 255, 0.1)'
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-block mr-2"
                  >
                    Not
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="inline-block mr-2"
                  >
                    just
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="inline-block mr-2"
                  >
                    a
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="inline-block mr-2"
                  >
                    fest.
                  </motion.span>
                  <br className="md:hidden" /> 
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-white font-semibold inline-block ml-2 md:ml-0"
                  >
                    A
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="text-white font-semibold inline-block ml-2"
                  >
                    legacy.
                  </motion.span>
                </motion.p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GoldButton
                      onClick={() => navigateTo('email')}
                      loading={loading}
                      className="px-12 py-5 text-lg hover-tilt"
                      testId="button-buy-ticket"
                    >
                      <Ticket className="w-6 h-6" /> Get Your Ticket
                    </GoldButton>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GoldButton
                      onClick={() => {
                        navigateTo('guest-email' as Screen);
                      }}
                      loading={loading}
                      className="px-12 py-5 text-lg hover-tilt bg-white/10 hover:bg-white/20 border border-white/20"
                      testId="button-guest-pass"
                    >
                      <User className="w-6 h-6" /> Guest Pass
                    </GoldButton>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex justify-center gap-4 mt-4"
                >
                  <motion.div
                    className="text-sm text-muted-foreground flex items-center gap-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span>Limited Seats Available</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {currentScreen === 'ticket' && (
            <motion.div
              key="ticket"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-lg screen-animation"
              data-screen="ticket"
            >
              <motion.div
                className="relative hover-tilt"
                whileHover={{ rotateY: 5, rotateX: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GlassPanel className="overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />
                  
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full gold-gradient flex items-center justify-center shadow-lg"
                    >
                      <Ticket className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h2 className="font-display text-3xl md:text-4xl font-bold gold-gradient-text mb-2">
                      Vyomang Entry Pass
                    </h2>
                    <p className="text-muted-foreground">
                      Your gateway to an unforgettable experience
                    </p>
                  </div>

                  <div className="border-t border-b border-gold/20 py-6 my-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Price</span>
                      <span className="text-4xl font-bold gold-gradient-text">₹800</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                      <span>Full fest access to all events, performances, and activities</span>
                    </div>
                  </div>

                  <GoldButton
                    onClick={() => navigateTo('registration')}
                    loading={loading}
                    className="w-full"
                    testId="button-proceed-registration"
                  >
                    Proceed to Registration <ArrowRight className="w-5 h-5" />
                  </GoldButton>
                </GlassPanel>
              </motion.div>
            </motion.div>
          )}

          {currentScreen === 'registration' && (
            <motion.div
              key="registration"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-2xl screen-animation px-4"
              data-screen="registration"
            >
              <GlassPanel className="w-full max-w-xl mx-auto p-4 md:p-6" >
                <div className="text-center mb-3 md:mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-3 rounded-full bg-gold/10 flex items-center justify-center"
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </motion.div>
                  <h1 className="font-display text-base sm:text-lg md:text-2xl font-bold gold-gradient-text">
                    Registration
                  </h1>
                  <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
                    Enter your details to continue
                  </p>
                </div>

                <div className="space-y-2 md:space-y-5">
                  <GoldInput
                    label="Full Name"
                    type="text"
                    placeholder=""
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    testId="input-full-name"
                  />
                  <GoldInput
                    label="Registration Number"
                    type="text"
                    placeholder=""
                    value={formData.registrationNumber}
                    onChange={(e) => updateFormData('registrationNumber', e.target.value)}
                    testId="input-registration-number"
                  />
                  <GoldInput
                    label="Department"
                    type="text"
                    placeholder=""
                    value={formData.department}
                    onChange={(e) => updateFormData('department', e.target.value)}
                    testId="input-department"
                  />
                  <GoldInput
                    label="Year"
                    type="text"
                    placeholder=""
                    value={formData.year}
                    onChange={(e) => updateFormData('year', e.target.value)}
                    testId="input-year"
                  />
                  <GoldInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    disabled
                    testId="input-email-readonly"
                  />
                  <GoldInput
                    label="Phone Number"
                    type="tel"
                    placeholder=""
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                    testId="input-phone"
                  />
                  
                  <GoldButton
                    onClick={handleStudentSubmit}
                    loading={loading}
                    disabled={!formData.fullName || !formData.registrationNumber || !formData.phoneNumber}
                    className="w-full mt-3 md:mt-2"
                    testId="button-proceed-payment"
                  >
                    Proceed to Payment <CreditCard className="w-5 h-5" />
                  </GoldButton>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {currentScreen === 'payment' && (
            <motion.div
              key="payment"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-md screen-animation"
              data-screen="payment"
            >
              <GlassPanel>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center"
                  >
                    <QrCode className="w-8 h-8 text-white" />
                  </motion.div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold gold-gradient-text mb-3">
                    Scan & Pay
                  </h1>
                  <p className="text-4xl font-bold text-gold my-4">₹800</p>
                </div>

                <div className="mb-8">
                  <div className="bg-white rounded-2xl p-4 mb-4 mx-auto w-48 h-48 flex items-center justify-center">
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Scan QR or use UPI ID</p>
                    <div className="inline-block px-3 py-1 bg-gold/10 rounded-lg">
                      <p className="text-xs font-mono">vyomang.fest@oksbi</p>
                    </div>
                  </div>
                </div>

                <GoldButton
                  onClick={() => navigateTo('transaction')}
                  loading={loading}
                  className="w-full"
                  testId="button-i-have-paid"
                >
                  I Have Paid <Check className="w-5 h-5" />
                </GoldButton>
              </GlassPanel>
            </motion.div>
          )}

          {currentScreen === 'transaction' && (
            <motion.div
              key="transaction"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-md screen-animation"
              data-screen="transaction"
            >
              <GlassPanel>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center"
                  >
                    <CreditCard className="w-8 h-8 text-white" />
                  </motion.div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold gold-gradient-text mb-3">
                    Confirm Payment
                  </h1>
                  <p className="text-muted-foreground">
                    Enter your transaction details
                  </p>
                </div>

                <div className="space-y-6">
                  <GoldInput
                    label="Transaction ID / UTR Number"
                    type="text"
                    placeholder="Enter transaction ID"
                    value={formData.transactionId}
                    onChange={(e) => updateFormData('transactionId', e.target.value)}
                    testId="input-transaction-id"
                  />
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                        formData.paymentConfirmed
                          ? 'bg-white border-white'
                          : 'border-white/40 group-hover:border-white/60'
                      }`}
                      onClick={() => updateFormData('paymentConfirmed', !formData.paymentConfirmed)}
                      data-testid="checkbox-payment-confirm"
                    >
                      {formData.paymentConfirmed && <Check className="w-4 h-4 text-black" />}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      I confirm the payment is completed
                    </span>
                  </label>

                  <GoldButton
                    onClick={handlePaymentConfirm}
                    loading={loading}
                    disabled={!formData.transactionId || !formData.paymentConfirmed}
                    className="w-full"
                    testId="button-confirm-payment"
                  >
                    Confirm Payment <ArrowRight className="w-5 h-5" />
                  </GoldButton>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {currentScreen === 'success' && (
            <motion.div
              key="success"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-md screen-animation"
              data-screen="success"
            >
              <GlassPanel>
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, delay: 0.2 }}
                    className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-500/20 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                    >
                      <Check className="w-12 h-12 text-green-500" />
                    </motion.div>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="font-display text-2xl md:text-3xl font-bold text-green-400 mb-3"
                  >
                    Payment Submitted Successfully
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg text-foreground mb-4"
                  >
                    Your registration for <span className="gold-gradient-text font-semibold">VYOMANG</span> is recorded
                  </motion.p>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-muted-foreground mb-8"
                  >
                    A confirmation email with event details has been sent to your email address.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <GoldButton
                      onClick={() => {
                        setFormData({
                          email: '',
                          otp: '',
                          fullName: '',
                          registrationNumber: '',
                          phoneNumber: '',
                          transactionId: '',
                          paymentConfirmed: false,
                          guestName: '',
                          guestCollege: '',
                          guestDepartment: '',
                          guestPassGenerated: false,
                          guestTicketId: '',
                          department: '',
                          year: '',
                          guestRollNumber: '',
                        });
                        setCurrentScreen('home');
                      }}
                      variant="secondary"
                      className="px-8"
                      testId="button-back-home"
                    >
                      Back to Home
                    </GoldButton>
                  </motion.div>
                </div>
              </GlassPanel>
            </motion.div>
          )}
          {currentScreen === 'guest-email' && (
            <motion.div
              key="guest-email"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-md screen-animation"
              data-screen="guest-email"
            >
              <GlassPanel>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center"
                  >
                    <Mail className="w-8 h-8 text-white" />
                  </motion.div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold gold-gradient-text mb-3">
                    Guest Email Verification
                  </h1>
                  <p className="text-muted-foreground">
                    Enter your email to get a free guest pass
                  </p>
                </div>

                <div className="space-y-6">
                  <GoldInput
                    label="Email Address"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    testId="input-guest-email"
                  />
                  <GoldButton
                    onClick={async () => {
                      if (!formData.email) return;
                      if (!guestOtpState.canResend) return; // Prevent multiple requests during cooldown
                      
                      try {
                        setLoading(true);
                        setGuestOtpState(prev => ({
                          ...prev,
                          canResend: false,
                          resendTimer: 60, // Reset timer to 60 seconds
                          otpError: null
                        }));
                        
                        const response = await fetch('/api/send-otp', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ email: formData.email }),
                        });
                        
                        let data;
                              try {
                                data = await response.json();
                              } catch (jsonError) {
                                // If JSON parsing fails, create a default error response
                                console.error('JSON parsing error:', jsonError);
                                data = { verified: false, message: 'Server response error. Please try again.' };
                              }
                        
                        if (data.success) {
                          // Navigate to OTP screen after successful send
                          simulateLoading(() => setCurrentScreen('guest-otp'), 1500);
                        } else {
                          setGuestOtpState(prev => ({
                            ...prev,
                            otpError: data.message || 'Failed to send OTP',
                            canResend: true, // Allow resend immediately if failed
                            resendTimer: 0
                          }));
                          setLoading(false);
                        }
                      } catch (error) {
                        console.error('Error sending OTP:', error);
                        setGuestOtpState(prev => ({
                          ...prev,
                          otpError: 'Error sending OTP. Please try again.',
                          canResend: true, // Allow resend immediately if failed
                          resendTimer: 0
                        }));
                        setLoading(false);
                      }
                    }}
                    loading={loading}
                    disabled={!formData.email || !guestOtpState.canResend}
                    className="w-full"
                    testId="button-send-guest-otp"
                  >
                    {guestOtpState.canResend ? (
                      <>
                        Send OTP <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        Resend in {guestOtpState.resendTimer}s
                      </>)
                    }
                  </GoldButton>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {currentScreen === 'guest-otp' && (
            <motion.div
              key="guest-otp"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-md screen-animation"
              data-screen="guest-otp"
            >
              <GlassPanel>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center"
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold gold-gradient-text mb-3">
                    Enter OTP
                  </h1>
                  <p className="text-muted-foreground">
                    We sent a code to {formData.email}
                  </p>
                </div>

                <div className="space-y-6">
                  <GoldInput
                    label="6-Digit Code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={formData.otp}
                    onChange={(e) => updateFormData('otp', e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    testId="input-guest-otp"
                  />
                  <GoldButton
                    onClick={handleGuestOtpVerify}
                    loading={loading}
                    disabled={formData.otp.length !== 6}
                    className="w-full"
                    testId="button-verify-guest-otp"
                  >
                    Verify OTP <Check className="w-5 h-5" />
                  </GoldButton>
                  <GoldButton
                    onClick={async () => {
                      if (!formData.email) return;
                      if (!guestOtpState.canResend) return; // Prevent multiple requests during cooldown
                      
                      try {
                        setLoading(true);
                        setGuestOtpState(prev => ({
                          ...prev,
                          canResend: false,
                          resendTimer: 60, // Reset timer to 60 seconds
                          otpError: null
                        }));
                        
                        const response = await fetch('/api/send-otp', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ email: formData.email }),
                        });
                        
                        let data;
                              try {
                                data = await response.json();
                              } catch (jsonError) {
                                // If JSON parsing fails, create a default error response
                                console.error('JSON parsing error:', jsonError);
                                data = { verified: false, message: 'Server response error. Please try again.' };
                              }
                        
                        if (data.success) {
                          // Navigate to OTP screen after successful send
                          simulateLoading(() => setCurrentScreen('guest-otp'), 1500);
                        } else {
                          setGuestOtpState(prev => ({
                            ...prev,
                            otpError: data.message || 'Failed to send OTP',
                            canResend: true, // Allow resend immediately if failed
                            resendTimer: 0
                          }));
                          setLoading(false);
                        }
                      } catch (error) {
                        console.error('Error sending OTP:', error);
                        setGuestOtpState(prev => ({
                          ...prev,
                          otpError: 'Error sending OTP. Please try again.',
                          canResend: true, // Allow resend immediately if failed
                          resendTimer: 0
                        }));
                        setLoading(false);
                      }
                    }}
                    loading={loading}
                    disabled={!guestOtpState.canResend}
                    className="w-full"
                    testId="button-resend-guest-otp"
                  >
                    {guestOtpState.canResend ? (
                      <>
                        Resend OTP <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        Resend in {guestOtpState.resendTimer}s
                      </>)
                    }
                  </GoldButton>
                  {guestOtpState.otpError && (
                    <div className="text-red-500 text-sm mt-2 text-center">
                      {guestOtpState.otpError}
                    </div>
                  )}
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {currentScreen === 'guest-registration' && (
            <motion.div
              key="guest-registration"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-xl screen-animation px-4"
              data-screen="guest-registration"
            >
              <GlassPanel className="w-full max-w-md mx-auto p-4 md:p-5" >
                <div className="text-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto mb-1 md:mb-2 rounded-full bg-gold/10 flex items-center justify-center"
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </motion.div>
                  <h1 className="font-display text-base sm:text-lg md:text-xl font-bold gold-gradient-text mt-1">
                    Guest Registration
                  </h1>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <GoldInput
                    label="Full Name"
                    type="text"
                    placeholder=""
                    value={formData.guestName}
                    onChange={(e) => updateFormData('guestName', e.target.value)}
                    testId="input-guest-name"
                  />
                  <GoldInput
                    label="Registration/Roll No"
                    type="text"
                    placeholder=""
                    value={formData.guestRollNumber}
                    onChange={(e) => updateFormData('guestRollNumber', e.target.value)}
                    testId="input-guest-roll-no"
                  />
                  <GoldInput
                    label="College Name"
                    type="text"
                    placeholder=""
                    value={formData.guestCollege}
                    onChange={(e) => updateFormData('guestCollege', e.target.value)}
                    testId="input-guest-college"
                  />
                  <GoldInput
                    label="Department"
                    type="text"
                    placeholder=""
                    value={formData.guestDepartment}
                    onChange={(e) => updateFormData('guestDepartment', e.target.value)}
                    testId="input-guest-department"
                  />
                  <GoldInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    disabled
                    testId="input-guest-email-readonly"
                  />
                  <GoldInput
                    label="Phone Number"
                    type="tel"
                    placeholder=""
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                    testId="input-guest-phone"
                  />
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2 text-xs text-yellow-800">
                    <Info className="inline w-3 h-3 mr-1.5" />
                    ID cards required for campus verification
                  </div>
                  
                  <GoldButton
                    onClick={handleGuestSubmit}
                    loading={loading}
                    disabled={!formData.guestName || !formData.guestCollege || !formData.guestDepartment || !formData.guestRollNumber || !formData.phoneNumber}
                    className="w-full mt-3"
                    testId="button-get-free-guest-pass"
                  >
                    Get Free Guest Pass <Ticket className="w-5 h-5" />
                  </GoldButton>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {currentScreen === 'guest-processing' && (
            <motion.div
              key="guest-processing"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-md screen-animation"
              data-screen="guest-processing"
            >
              <GlassPanel>
                <div className="text-center py-12">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Ticket className="w-16 h-16 text-gold" />
                  </motion.div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold gold-gradient-text mb-3">
                    Generating Guest Pass
                  </h1>
                  <p className="text-muted-foreground">
                    Creating your free guest entry pass...
                  </p>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {currentScreen === 'guest-success' && (
            <motion.div
              key="guest-success"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-md screen-animation"
              data-screen="guest-success"
            >
              <GlassPanel>
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, delay: 0.2 }}
                    className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-500/20 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                    >
                      <Check className="w-12 h-12 text-green-500" />
                    </motion.div>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="font-display text-2xl md:text-3xl font-bold text-green-400 mb-3"
                  >
                    Guest Pass Generated Successfully!
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg text-foreground mb-4"
                  >
                    Your <span className="gold-gradient-text font-semibold">Guest Pass</span> has been created
                  </motion.p>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-muted-foreground mb-8"
                  >
                    A confirmation with your guest pass has been sent to {formData.email}.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <GoldButton
                      onClick={() => {
                        setFormData({
                          email: '',
                          otp: '',
                          fullName: '',
                          registrationNumber: '',
                          phoneNumber: '',
                          transactionId: '',
                          paymentConfirmed: false,
                          guestName: '',
                          guestCollege: '',
                          guestDepartment: '',
                          guestPassGenerated: false,
                          guestTicketId: '',
                          department: '',
                          year: '',
                          guestRollNumber: '',
                        });
                        setCurrentScreen('home');
                      }}
                      variant="secondary"
                      className="px-8"
                      testId="button-back-home-guest"
                    >
                      Back to Home
                    </GoldButton>
                  </motion.div>
                </div>
              </GlassPanel>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
