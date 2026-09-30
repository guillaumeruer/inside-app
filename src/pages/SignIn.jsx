import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { Navigate, useLocation, useNavigate } from "react-router";

export default function SignIn() {
    const { user, loading, signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname ?? "/home";

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    if (!loading && user) {
        return <Navigate to={from} replace />
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        const { error } = await signIn({ email, password });

        setSubmitting(false);
        if (error) {
            setError(error.message);
            return;
        }
        navigate(from, { replace: true });
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email</label>
                <input id="email" value={email} type="email" onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input id="password" value={password} type="password" onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && <p role="alert">{error}</p>}

            <button type="submit" disabled={submitting}>{submitting ? "Connecting..." : "Sign in"}</button>
        </form>
    )
}