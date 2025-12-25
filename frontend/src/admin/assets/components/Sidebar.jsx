import React, { useState } from "react";
import {
  Dashboard,
  Work,
  People,
  CalendarMonth,
  AccountCircle,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  Chip,
  Avatar,
} from "@mui/material";

const Sidebar = ({ onNavigate, mobileOpen, onClose }) => {
  const [active, setActive] = useState("dashboard");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const topItems = [
    { label: "Dashboard", page: "dashboard", icon: <Dashboard />, color: "#60a5fa" },
    { label: "Internships", page: "internships", icon: <Work />, color: "#a78bfa" },
    { label: "Applications", page: "applications", icon: <People />, color: "#34d399" },
    { label: "Attendance", page: "attendance", icon: <CalendarMonth />, color: "#fbbf24" },
    { label: "Users", page: "users", icon: <People />, color: "#38bdf8" },
  ];

  const bottomItems = [
    { label: "Profile", page: "profile", icon: <AccountCircle />, color: "#f87171" },
  ];

  const handleNavigation = (page) => {
    setActive(page);
    onNavigate(page);
    if (isMobile) {
      onClose();
    }
  };

  const sidebarContent = (
    <Box
      sx={{
        width: "240px",
        height: "100%",
        background: "linear-gradient(180deg, #0a1628 0%, #1a2942 100%)",
        color: "white",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        },
      }}
    >
      {/* Top Section */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Logo/Brand Section */}
        <Box
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 3,
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
            border: "1px solid rgba(96, 165, 250, 0.2)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              letterSpacing: 0.5,
              background: "#fff",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            EXTERNSHIP
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Management System
          </Typography>
        </Box>

        <List sx={{ padding: 0 }}>
          {topItems.map((item) => {
            const isActive = active === item.page;

            return (
              <ListItemButton
                key={item.page}
                onClick={() => handleNavigation(item.page)}
                sx={{
                  mb: 1,
                  borderRadius: "12px",
                  padding: "12px 14px",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: isActive
                    ? "rgba(59, 130, 246, 0.15)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(96, 165, 250, 0.3)"
                    : "1px solid transparent",
                  "&::before": isActive ? {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    background: `linear-gradient(180deg, ${item.color}, ${item.color}90)`,
                    borderRadius: "0 4px 4px 0",
                  } : {},
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                    transform: "translateX(4px)",
                    border: "1px solid rgba(96, 165, 250, 0.2)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? item.color : "rgba(255,255,255,0.7)",
                    minWidth: "40px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#fff" : "rgba(255,255,255,0.85)",
                        fontSize: "0.95rem",
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />

                {isActive && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.color,
                      boxShadow: `0 0 12px ${item.color}`,
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ mt: 2, position: "relative", zIndex: 1 }}>
        <Divider
          sx={{
            borderColor: "rgba(255,255,255,0.15)",
            mb: 2,
            "&::before, &::after": {
              borderColor: "rgba(255,255,255,0.15)",
            },
          }}
        />

        <List sx={{ padding: 0 }}>
          {bottomItems.map((item) => {
            const isActive = active === item.page;

            return (
              <ListItemButton
                key={item.page}
                onClick={() => handleNavigation(item.page)}
                sx={{
                  mb: 1,
                  borderRadius: "12px",
                  padding: "12px 14px",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: isActive
                    ? "rgba(59, 130, 246, 0.15)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(96, 165, 250, 0.3)"
                    : "1px solid transparent",
                  "&::before": isActive ? {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    background: `linear-gradient(180deg, ${item.color}, ${item.color}90)`,
                    borderRadius: "0 4px 4px 0",
                  } : {},
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                    transform: "translateX(4px)",
                    border: "1px solid rgba(96, 165, 250, 0.2)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? item.color : "rgba(255,255,255,0.7)",
                    minWidth: "40px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#fff" : "rgba(255,255,255,0.85)",
                        fontSize: "0.95rem",
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />

                {isActive && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.color,
                      boxShadow: `0 0 12px ${item.color}`,
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: "240px",
            height: "100vh",
            position: "fixed",
            boxShadow: "8px 0 32px rgba(0,0,0,0.3)",
            zIndex: 1200,
          }}
        >
          {sidebarContent}
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={onClose}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
            border: "none",
            boxShadow: "8px 0 32px rgba(0,0,0,0.3)",
          },
        }}
      >
        {/* Close button for mobile */}
        <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}>
          <IconButton
            onClick={onClose}
            sx={{
              color: "rgba(255,255,255,0.7)",
              "&:hover": {
                color: "#fff",
                background: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default Sidebar;