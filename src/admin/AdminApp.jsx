import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline, Box, useMediaQuery } from "@mui/material";
import Login from "./assets/pages/Login";
import Dashboard from "./assets/pages/Dashboard";
import Internships from "./assets/pages/Internships";
import Applications from "./assets/pages/Applications";
import Navbar from "./assets/components/Navbar";
import Sidebar from "./assets/components/Sidebar";
import Users from "./assets/pages/Users";
import Profile from "./assets/pages/Profile";
import LogoAnimation from './assets/components/LogoAnimation.jsx';

import api from "./services/api";

const AdminApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("adminToken"));
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [refreshDashboard, setRefreshDashboard] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  // New state for logo animation
  const [animationDone, setAnimationDone] = useState(false);

  const handleLogin = () => setIsLoggedIn(true);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    setIsLoggedIn(false);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const refreshDashboardStats = () => setRefreshDashboard(prev => prev + 1);

  // On mount, validate any existing adminToken. If it's invalid (e.g. from
  // the old Backend1), clear it and force a fresh login against this backend.
  useEffect(() => {
    const validate = async () => {
      try {
        await api.get("/admin/profile");
      } catch {
        // Network or other error: be safe and clear stale token
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        setIsLoggedIn(false);
      }
    };

    const token = localStorage.getItem("adminToken");
    if (token) validate();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "internships":
        return <Internships onChange={refreshDashboardStats} darkMode={darkMode} />;
      case "applications":
        return <Applications darkMode={darkMode} />;
      case "users":
        return <Users darkMode={darkMode} />;
      case "profile":
        return <Profile darkMode={darkMode} />;
      default:
        return <Dashboard refresh={refreshDashboard} onNavigate={setCurrentPage} darkMode={darkMode} />;
    }
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? "#000000" : "#f4f6fa",
        paper: darkMode ? "#121212" : "#fff",
      },
      text: {
        primary: darkMode ? "#ffffff" : "#0A1A2F",
        secondary: darkMode ? "#cccccc" : "#555",
      },
      action: {
        hover: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
      },
    },
  });

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Show logo animation first, then app content
  if (!animationDone) {
    return <LogoAnimation onDone={() => setAnimationDone(true)} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isLoggedIn ? (
        <Box sx={{ display: "flex" }}>
          <Sidebar onNavigate={setCurrentPage} darkMode={darkMode} />

          <Box
            sx={{
              marginLeft: { xs: 0, md: "240px" },
              flexGrow: 1,
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              width: "100%",
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} onLogout={handleLogout} />
            <Box sx={{ width: "100%", p: { xs: 1, sm: 2, md: 2.5 } }}>
              {renderPage()}
            </Box>
          </Box>
        </Box>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </ThemeProvider>
  );
};

export default AdminApp;
