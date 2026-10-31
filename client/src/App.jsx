import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import ResearchPage from "./pages/ResearchPage";

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("deepscope-session") || "null"); }
    catch { return null; }
  });
  function signIn(next) {
    sessionStorage.setItem("deepscope-session", JSON.stringify(next));
    setSession(next);
  }
  function signOut() {
    sessionStorage.removeItem("deepscope-session");
    setSession(null);
  }
  return session ? <ResearchPage session={session} onSignOut={signOut} /> : <LoginPage onSignIn={signIn} />;
}
