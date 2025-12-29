"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, signInAnonymously } from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const googleSignIn = () => {
        return signInWithPopup(auth, new GoogleAuthProvider());
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut, googleSignIn }}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};
