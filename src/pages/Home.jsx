import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../utils/supabase";

export function Home() {
    const { signOut } = useAuth();
    const [workspaces, setWorkspaces] = useState([]);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            const {data, error} = await supabase.from("workspaces").select("*");
            if (error) {
                throw error;
            }
            setWorkspaces(data);
        }
        fetchWorkspaces();
    }, []);

    return (
        <>
            <div>Accueil</div>
            <button onClick={signOut}>Logout</button>
        </>
    );
}