import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassPanel } from '@/components/GlassPanel';
import { GoldButton } from '@/components/GoldButton';
import { GoldInput } from '@/components/GoldInput';
import { Check, Mail, Ticket, User, CreditCard, QrCode, ArrowRight, Sparkles, Shield } from 'lucide-react';

type Screen = 'email' | 'otp' | 'home' | 'ticket' | 'registration' | 'payment' | 'transaction' | 'success';

interface FormData {
  email: string;
  otp: string;
  fullName: string;
  registrationNumber: string;
  phoneNumber: string;
  transactionId: string;
  paymentConfirmed: boolean;
}

export default function VyomangPage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('email');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    otp: '',
    fullName: '',
    registrationNumber: '',
    phoneNumber: '',
    transactionId: '',
    paymentConfirmed: false,
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleSendOtp = () => {
    if (!formData.email) return;
    simulateLoading(() => setCurrentScreen('otp'));
  };

  const handleVerifyOtp = () => {
    if (formData.otp.length !== 6) return;
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentScreen('home');
    }, 1500);
  };

  const navigateTo = (screen: Screen) => {
    simulateLoading(() => setCurrentScreen(screen), 800);
  };

  const handlePaymentConfirm = () => {
    if (!formData.transactionId || !formData.paymentConfirmed) return;
    simulateLoading(() => setCurrentScreen('success'), 2000);
  };

  const screenVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -30, scale: 0.95 },
  };

  return (
    <div className="h-full w-full relative">
      <AnimatedBackground />
      
      <div className="relative z-10 h-full w-full flex items-center justify-center p-4 md:p-8">
        <AnimatePresence mode="wait">
          {currentScreen === 'email' && (
            <motion.div
              key="email"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
            >
              <GlassPanel>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center"
                  >
                    <Mail className="w-8 h-8 text-gold" />
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
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
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
                          <Shield className="w-8 h-8 text-gold" />
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
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <Sparkles className="w-12 h-12 mx-auto text-gold animate-pulse" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-6xl md:text-8xl lg:text-9xl font-bold gold-gradient-text gold-text-glow mb-6"
              >
                VYOMANG
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-muted-foreground mb-12 tracking-wide"
              >
                Not just a fest. <span className="text-gold">A legacy.</span>
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <GoldButton
                  onClick={() => navigateTo('ticket')}
                  loading={loading}
                  className="px-12 py-5 text-lg hover-tilt"
                  testId="button-buy-ticket"
                >
                  <Ticket className="w-6 h-6" /> Buy Ticket
                </GoldButton>
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
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg"
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
                      <Ticket className="w-10 h-10 text-black" />
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
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
            >
              <GlassPanel>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center"
                  >
                    <User className="w-8 h-8 text-gold" />
                  </motion.div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold gold-gradient-text mb-3">
                    Registration
                  </h1>
                  <p className="text-muted-foreground">
                    Enter your details to continue
                  </p>
                </div>

                <div className="space-y-5">
                  <GoldInput
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    testId="input-full-name"
                  />
                  <GoldInput
                    label="Registration Number"
                    type="text"
                    placeholder="REG2024001"
                    value={formData.registrationNumber}
                    onChange={(e) => updateFormData('registrationNumber', e.target.value)}
                    testId="input-registration-number"
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
                    placeholder="+91 9876543210"
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                    testId="input-phone"
                  />
                  
                  <GoldButton
                    onClick={() => navigateTo('payment')}
                    loading={loading}
                    disabled={!formData.fullName || !formData.registrationNumber || !formData.phoneNumber}
                    className="w-full mt-2"
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
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
            >
              <GlassPanel>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center"
                  >
                    <QrCode className="w-8 h-8 text-gold" />
                  </motion.div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold gold-gradient-text mb-3">
                    Scan & Pay
                  </h1>
                  <p className="text-4xl font-bold text-gold my-4">₹800</p>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 mx-auto w-48 h-48 flex items-center justify-center mb-8"
                >
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                      />
                    ))}
                  </div>
                </motion.div>

                <div className="flex justify-center gap-4 mb-8">
                  {['GPay', 'PhonePe', 'Paytm'].map((app, i) => (
                    <motion.div
                      key={app}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="px-4 py-2 rounded-lg bg-white/5 border border-gold/20 text-sm text-muted-foreground"
                    >
                      {app}
                    </motion.div>
                  ))}
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
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
            >
              <GlassPanel>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center"
                  >
                    <CreditCard className="w-8 h-8 text-gold" />
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
                          ? 'bg-gold border-gold'
                          : 'border-gold/40 group-hover:border-gold/60'
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
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
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
                        });
                        setCurrentScreen('email');
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
        </AnimatePresence>
      </div>
    </div>
  );
}
