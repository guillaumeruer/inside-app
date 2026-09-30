import { useAuth } from "../auth/useAuth";

export function Home() {
    const { signOut } = useAuth();
    return (
        <>
            <div>Accueil</div>
            <button onClick={signOut}>Logout</button>
        </>
    );
}