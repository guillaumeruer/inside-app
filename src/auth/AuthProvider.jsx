import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setLoading(false);
            }
        );
        return () => subscription.unsubscribe();
    }, []);

    const value = {
        session,
        user: session?.user ?? null,
        loading,
        signIn: (credentials) => supabase.auth.signInWithPassword(credentials),
        signgUp: (credentials) => supabase.auth.signUp(credentials),
        signOut: () => supabase.auth.signOut(),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}