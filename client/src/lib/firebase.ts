// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDN8iE9-dxsjCpRE4P4Zjt1r1vXAoCIK40",
  authDomain: "vyomang-5c015.firebaseapp.com",
  projectId: "vyomang-5c015",
  storageBucket: "vyomang-5c015.firebasestorage.app",
  messagingSenderId: "948666577558",
  appId: "1:948666577558:web:5bf344df8aabac1c4588b7",
  measurementId: "G-07Z3RW280D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Create a Recaptcha verifier instance
const createRecaptchaVerifier = (container: string | HTMLElement) => {
  const verifier = new RecaptchaVerifier(auth, container, {
    'size': 'invisible',
    'callback': (response: any) => {
      console.log('Recaptcha solved', response);
    },
    'expired-callback': () => {
      console.log('Recaptcha expired');
    }
  });
  return verifier;
};

// Function to send OTP to phone number
const sendOTP = async (phoneNumber: string, recaptchaContainer: string | HTMLElement) => {
  try {
    const appVerifier = createRecaptchaVerifier(recaptchaContainer);
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

// Function to verify OTP
const verifyOTP = async (confirmationResult: any, otp: string) => {
  try {
    const result = await confirmationResult.confirm(otp);
    return result.user;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

export { auth, sendOTP, verifyOTP };