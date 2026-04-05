import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Send the Verification Mail
  const sendVerificationMail = async (email) => {
    const actionCodeSettings = {
      url: window.location.origin + '/login', 
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  };

  // 2. Complete the Sign In when they click the link
  const completeLinkLogin = async (windowUrl) => {
    if (isSignInWithEmailLink(auth, windowUrl)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      const result = await signInWithEmailLink(auth, email, windowUrl);
      window.localStorage.removeItem('emailForSignIn');
      return result;
    }
  };

  // 3. Set Password
  const setupAccountPassword = async (newPassword) => {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPassword);
    } else {
      throw new Error("No authenticated user found to set password.");
    }
  };

  // 4. Regular Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 5. Google Login
  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // 6. PASSWORD STRENGTH VALIDATOR (Added back!)
  const validatePasswordStrength = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    return {
      score: [minLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length,
      isStrong: minLength && hasUpper && hasNumber && hasSpecial,
    };
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    sendVerificationMail,
    completeLinkLogin,
    setupAccountPassword,
    login,
    googleLogin,
    validatePasswordStrength, // Exported here!
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};