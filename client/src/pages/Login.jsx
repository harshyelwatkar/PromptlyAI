import React from "react";

import { useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Login = () => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { axios, setToken } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = state === "login" ? "/api/user/login" : "/api/user/register";

    try {
      const { data } = await axios.post(url, {
        name,
        email,
        password,
      });

      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);

        toast.success(
          state === "login"
            ? "Logged in successfully!"
            : "Account created successfully!"
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <form
        onSubmit={handleSubmit}
        className="max-w-[400px] w-full text-center border border-gray-300/60 rounded-2xl px-8 py-8 bg-white shadow-2xl animate-fade-in"
      >
        {/* Logo */}
        <img
          src={assets.logo}
          alt="PromptlyAI Logo"
          className="w-16 h-16 object-contain mx-auto mb-4"
        />

        {/* Heading */}
        <h1 className="text-gray-900 dark:text-white text-3xl font-semibold">
          {state === "login" ? "Login" : "Create Account"}
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          {state === "login"
            ? "Please sign in to continue"
            : "Create your account to get started"}
        </p>

        {/* Name Field (Register Only) */}
        {state === "register" && (
          <div className="flex items-center w-full mt-8 bg-white dark:bg-white/5 border border-gray-300/80 dark:border-white/10 h-12 rounded-full overflow-hidden pl-6 gap-3">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent text-gray-700 dark:text-white placeholder-gray-500 outline-none text-sm w-full h-full"
              required
            />
          </div>
        )}

        {/* Email Field */}
        <div
          className={`flex items-center w-full bg-white dark:bg-white/5 border border-gray-300/80 dark:border-white/10 h-12 rounded-full overflow-hidden pl-6 gap-3 ${
            state === "register" ? "mt-4" : "mt-8"
          }`}
        >
          <svg
            width="16"
            height="11"
            viewBox="0 0 16 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
              fill="#6B7280"
            />
          </svg>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent text-gray-700 dark:text-white placeholder-gray-500 outline-none text-sm w-full h-full"
            required
          />
        </div>

        {/* Password Field */}
        <div className="flex items-center mt-4 w-full bg-white dark:bg-white/5 border border-gray-300/80 dark:border-white/10 h-12 rounded-full overflow-hidden pl-6 gap-3">
          <svg
            width="13"
            height="17"
            viewBox="0 0 13 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
              fill="#6B7280"
            />
          </svg>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent text-gray-700 dark:text-white placeholder-gray-500 outline-none text-sm w-full h-full"
            required
          />
        </div>

        {/* Forgot Password (Login Only) */}
        {state === "login" && (
          <div className="mt-4 text-left text-sky-600">
            <button
              type="button"
              className="text-sm hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-5 w-full h-11 rounded-full text-white bg-sky-600 hover:bg-sky-700 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg"
        >
          {state === "register" ? "Create Account" : "Login"}
        </button>

        {/* Toggle Login/Register */}
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
          {state === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <span
                onClick={() => setState("register")}
                className="text-sky-600 cursor-pointer hover:underline"
              >
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setState("login")}
                className="text-sky-600 cursor-pointer hover:underline"
              >
                Login
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default Login;
