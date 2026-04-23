import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import { maxWidth } from "@/styles";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signin(username, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center dark:bg-[#191624] bg-white">
      <div className={`${maxWidth} w-full max-w-md`}>
        <form
          onSubmit={handleSubmit}
          className="dark:bg-[#1e1a2e] bg-gray-50 rounded-lg p-8 shadow-lg"
        >
          <h1 className="text-2xl font-bold font-nunito dark:text-secColor text-black mb-6">
            Sign In
          </h1>

          {error && (
            <p className="text-red-500 text-sm mb-4 bg-red-500/10 p-3 rounded">
              {error}
            </p>
          )}

          <div className="mb-4">
            <label className="block dark:text-gray-300 text-gray-700 text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded bg-white dark:bg-[#2a2540] dark:text-secColor text-black border dark:border-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="mb-6">
            <label className="block dark:text-gray-300 text-gray-700 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-white dark:bg-[#2a2540] dark:text-secColor text-black border dark:border-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="mt-4 text-center dark:text-gray-400 text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-red-500 hover:text-red-400 font-medium"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default SignIn;
