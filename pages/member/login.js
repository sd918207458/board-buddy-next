import React, { useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/NavbarSwitcher";
import Footer from "@/components/footer";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { CSSTransition } from "react-transition-group";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
  
    try {
      const response = await fetch("http://localhost:3005/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // 確保 cookies 被發送
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // 如果登入成功，跳轉至首頁
        router.push("/");
      } else {
        // 如果登入失敗，顯示錯誤訊息
        setErrorMessage(data.message || "登入失敗");
      }
    } catch (error) {
      console.error("錯誤:", error);
      setErrorMessage("登入失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-[#003E52] dark:bg-gray-900">
        <div className="flex w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 lg:max-w-4xl">
          <div
            className="hidden bg-cover lg:block lg:w-1/2"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1606660265514-358ebbadc80d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1575&q=80")',
            }}
          />
          <div className="w-full px-6 py-8 md:px-8 lg:w-1/2">
            <div className="flex justify-center mx-auto">
              <img
                className="w-auto h-7 sm:h-8"
                src="https://merakiui.com/images/logo.svg"
                alt="Logo"
              />
            </div>

            <p className="mt-3 text-xl text-center text-gray-600 dark:text-gray-200">
              登入
            </p>

            {/* 顯示錯誤訊息 */}
            {errorMessage && (
              <CSSTransition
                in={!!errorMessage}
                timeout={300}
                classNames="fade"
                unmountOnExit
              >
                <div className="text-red-500 text-center mt-4">
                  {errorMessage}
                </div>
              </CSSTransition>
            )}

            <form onSubmit={handleLogin}>
              <div className="mt-4">
                <label
                  className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                  htmlFor="LoggingUsername"
                >
                  使用者名稱
                </label>
                <input
                  id="LoggingUsername"
                  className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="mt-4">
                <div className="flex justify-between">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                    htmlFor="loggingPassword"
                  >
                    密碼
                  </label>
                  <a
                    href="forgot-password"
                    className="text-xs text-gray-500 dark:text-gray-300 hover:underline"
                  >
                    忘記密碼?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="loggingPassword"
                    className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {/* 顯示/隱藏密碼按鈕 */}
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
              </div>

              {/* 保持登入選項 */}
              <div className="mt-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-200">
                    保持登入狀態
                  </span>
                </label>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className={`w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-[#003E52] rounded-lg focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50 ${
                    isLoading ? "loading" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "登入中..." : "登入"}
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between mt-4">
              <span className="w-1/5 border-b dark:border-gray-600 lg:w-1/4" />
              <span className="text-xs text-gray-500 uppercase dark:text-gray-400">
                還沒有帳戶嗎?
                <a
                  href="register"
                  className="ml-1 text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline"
                >
                  註冊
                </a>
              </span>
              <span className="w-1/5 border-b dark:border-gray-600 lg:w-1/4" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
