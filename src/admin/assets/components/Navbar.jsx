import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  Box,
  Tooltip,
  Divider,
  Avatar,
  Stack,
  Button,
  Paper,
  Chip,
  Fade,
  Slide,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArchiveIcon from '@mui/icons-material/Archive';
import MenuIcon from "@mui/icons-material/Menu";
import api from "../../services/api";

const Navbar = ({ darkMode, toggleDarkMode, onDrawerToggle }) => {
  const [greeting, setGreeting] = useState("");
  const [username, setUsername] = useState("Admin");
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentLogins, setRecentLogins] = useState([]);
  const [filter, setFilter] = useState("all");
  const [recentLoginsSource, setRecentLoginsSource] = useState(null);

  useEffect(() => {
    const indiaHour = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    const hour = parseInt(indiaHour, 10);
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    fetchProfile();
    fetchNotifications();
    fetchRecentLogins();
    fetchUnreadCount();

    setRecentLoginsSource(null);

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/admin/profile");
      if (response?.name) setUsername(response.name);
    } catch (err) {
      console.error("Navbar fetch error:", err);
    }
  };

  const fetchRecentLogins = async () => {
    try {
      // Try to fetch from users/recent-logins endpoint first
      try {
        const response = await api.get("/users/recent-logins");
        setRecentLoginsSource('users-recent');
        if (response && Array.isArray(response)) {
          const mapped = response
            .map((u) => {
              if (!u) return null;
              const id = u._id ?? u.id ?? u._id?.toString();
              const name = u.name ?? u.fullName ?? u.email ?? id;
              const email = u.email ?? null;
              const lastSeen = u.lastLogin ?? u.updatedAt ?? u.lastSeen ?? u.lastActive ?? null;
              return { id, name, email, lastSeen };
            })
            .filter(Boolean)
            .sort((a, b) => {
              const ta = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
              const tb = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
              return tb - ta;
            })
            .slice(0, 8);

          if (mapped.length) {
            setRecentLogins(mapped);
            return;
          }
        }
      } catch (err) {
        console.debug("Failed to fetch from /users/recent-logins, trying /users");
      }

      // Try to fetch from users endpoint
      try {
        const response = await api.get("/users");
        setRecentLoginsSource('users');
        const payload = Array.isArray(response)
          ? response
          : response?.users || response?.data || response?.results || Object.values(response || {});

        const mapped = payload
          .map((u) => {
            if (!u) return null;
            const id = u._id ?? u.id ?? u._id?.toString();
            const name = u.name ?? u.fullName ?? u.email ?? id;
            const email = u.email ?? null;
            const lastSeen = u.lastLogin ?? u.updatedAt ?? u.lastSeen ?? u.lastActive ?? null;
            return { id, name, email, lastSeen };
          })
          .filter(Boolean)
          .sort((a, b) => {
            const ta = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
            const tb = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
            return tb - ta;
          })
          .slice(0, 8);

        if (mapped.length) {
          setRecentLogins(mapped);
          return;
        }
      } catch (err) {
        console.debug("Failed to fetch from /users, trying /attendance");
      }

      // Try to fetch from attendance endpoint
      try {
        const response = await api.get("/attendance");
        setRecentLoginsSource('attendance');
        const arr = Array.isArray(response) ? response : response?.data || response?.results || [];

        const byId = {};
        arr.forEach((r) => {
          const intern = r?.intern;
          const id = typeof intern === "string" ? intern : (intern?._id ?? intern?.id ?? null);
          if (!id) return;
          const ts = new Date(r.createdAt || r.date || r._id?.getTimestamp?.() || Date.now()).getTime();
          if (!byId[id] || ts > byId[id].ts) {
            byId[id] = { id, name: (r.intern && (r.intern.name || r.intern.fullName)) || id, lastSeen: new Date(ts).toISOString(), ts };
          }
        });

        const fallback = Object.values(byId).sort((a, b) => b.ts - a.ts).slice(0, 8).map(({ id, name, lastSeen }) => ({ id, name, email: null, lastSeen }));
        setRecentLogins(fallback);
      } catch (err) {
        console.error("Failed to fetch recent logins:", err);
        setRecentLogins([]);
      }
    } catch (err) {
      console.error("Failed to fetch recent logins:", err);
      setRecentLogins([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      const notificationsPayload = Array.isArray(response)
        ? response
        : response?.notifications || response?.results || [];

      setNotifications(notificationsPayload);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      fetchUnreadCount();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const snoozeNotification = async (notificationId, minutes = 60) => {
    try {
      await api.patch(`/notifications/${notificationId}/snooze`, { minutes });
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (e) {
      console.error("Failed to snooze notification", e);
    }
  };

  const unsnoozeNotification = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/unsnooze`);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (e) {
      console.error("Failed to unsnooze notification", e);
    }
  };

  const archiveNotification = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/archive`);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (e) {
      console.error("Failed to archive notification", e);
    }
  };

  const visibleNotifications = (notifications || []).filter((n) => {
    const id = n?._id ?? n?.id;
    if (!id) return false;
    if (n.snoozedUntil && new Date(n.snoozedUntil).getTime() > Date.now()) return false;
    if (filter === "unread") return !n.isRead;
    if (filter === "pending") {
      const status = (n.status || n.type || "").toString().toLowerCase();
      return status === "pending" || status === "warning" || n.isPending === true;
    }
    return true;
  });

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);

      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      fetchUnreadCount();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const getNotificationIcon = (type) => {
    const iconProps = { sx: { fontSize: 20 } };
    switch (type) {
      case "success":
        return (
          <CheckCircleIcon
            {...iconProps}
            sx={{ ...iconProps.sx, color: "#4caf50" }}
          />
        );
      case "warning":
        return (
          <WarningIcon {...iconProps} sx={{ ...iconProps.sx, color: "#ff9800" }} />
        );
      case "error":
        return (
          <ErrorIcon {...iconProps} sx={{ ...iconProps.sx, color: "#f44336" }} />
        );
      default:
        return (
          <InfoIcon {...iconProps} sx={{ ...iconProps.sx, color: "#2196f3" }} />
        );
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "success":
        return "#4caf50";
      case "warning":
        return "#ff9800";
      case "error":
        return "#f44336";
      default:
        return "#2196f3";
    }
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleNotificationClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        background: darkMode
          ? "linear-gradient(135deg, #0A1A2F 0%, #1a2332 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        color: darkMode ? "#fff" : "#0A1A2F",
        boxShadow: darkMode
          ? "0 4px 20px rgba(0,0,0,0.3)"
          : "0 4px 20px rgba(0,0,0,0.08)",
        borderBottom: darkMode ? "1px solid #1e3a5f" : "1px solid #e3e8ef",
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{
              mr: 2,
              display: { md: "none" },
              background: darkMode
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
              "&:hover": {
                background: darkMode
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.08)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: darkMode
                  ? "linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)"
                  : "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {greeting}, {username}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: darkMode ? "#90caf9" : "#64748b",
                fontWeight: 500,
              }}
            >
              Welcome back to your dashboard
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Toggle light/dark mode">
            <IconButton
              onClick={toggleDarkMode}
              sx={{
                background: darkMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
                "&:hover": {
                  background: darkMode
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.08)",
                },
              }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              sx={{
                background: darkMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
                "&:hover": {
                  background: darkMode
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.08)",
                },
              }}
            >
              <NotificationsIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleNotificationClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            TransitionComponent={Fade}
            transitionDuration={300}
            PaperProps={{
              sx: {
                mt: 1.5,
                width: 450,
                maxHeight: 650,
                borderRadius: "20px",
                boxShadow: darkMode
                  ? "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)"
                  : "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                background: darkMode
                  ? "linear-gradient(180deg, #1e2936 0%, #18222e 100%)"
                  : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                border: darkMode ? "1px solid #2d3748" : "1px solid #e2e8f0",
                overflow: "hidden",
              },
            }}
          >
            {/* Enhanced Header with Gradient Background */}
            <Box
              sx={{
                p: 3,
                pb: 2,
                background: darkMode
                  ? "linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.05) 100%)"
                  : "linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.02) 100%)",
                borderBottom: `1px solid ${darkMode ? "#2d3748" : "#e2e8f0"}`,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      background: darkMode
                        ? "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)"
                        : "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: darkMode
                        ? "0 4px 12px rgba(33, 150, 243, 0.3)"
                        : "0 4px 12px rgba(25, 118, 210, 0.3)",
                    }}
                  >
                    <NotificationsIcon sx={{ color: "#fff", fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Notifications
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: darkMode ? "#90caf9" : "#64748b",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                      }}
                    >
                      {visibleNotifications.length} notification{visibleNotifications.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                </Stack>
                {unreadCount > 0 && (
                  <Chip
                    label={`${unreadCount} new`}
                    size="small"
                    sx={{
                      background: "linear-gradient(135deg, #f44336 0%, #e53935 100%)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      height: 28,
                      borderRadius: "14px",
                      boxShadow: "0 2px 8px rgba(244, 67, 54, 0.3)",
                      animation: "pulse 2s ease-in-out infinite",
                      "@keyframes pulse": {
                        "0%, 100%": { transform: "scale(1)" },
                        "50%": { transform: "scale(1.05)" },
                      },
                    }}
                  />
                )}
              </Stack>

              {/* Enhanced Filters */}
              <Stack direction="row" spacing={1}>
                {["all", "unread", "pending"].map((f) => (
                  <Chip
                    key={f}
                    label={f.charAt(0).toUpperCase() + f.slice(1)}
                    size="small"
                    clickable
                    onClick={() => setFilter(f)}
                    sx={{
                      borderRadius: "10px",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      height: 32,
                      transition: "all 0.2s ease",
                      ...(filter === f
                        ? {
                          background: darkMode
                            ? "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)"
                            : "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                          color: "#fff",
                          boxShadow: darkMode
                            ? "0 2px 8px rgba(33, 150, 243, 0.4)"
                            : "0 2px 8px rgba(25, 118, 210, 0.4)",
                          transform: "translateY(-1px)",
                        }
                        : {
                          background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                          color: darkMode ? "#cbd5e0" : "#64748b",
                          "&:hover": {
                            background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                            transform: "translateY(-1px)",
                          },
                        }),
                    }}
                  />
                ))}
              </Stack>

              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<MarkEmailReadIcon />}
                  onClick={markAllAsRead}
                  sx={{
                    mt: 1.5,
                    textTransform: "none",
                    fontSize: "0.8rem",
                    color: darkMode ? "#90caf9" : "#1976d2",
                    fontWeight: 700,
                    borderRadius: "10px",
                    px: 2,
                    py: 0.5,
                    "&:hover": {
                      background: darkMode ? "rgba(144, 202, 249, 0.08)" : "rgba(25, 118, 210, 0.08)",
                    },
                  }}
                >
                  Mark all as read
                </Button>
              )}
            </Box>

            {/* Enhanced Notifications List */}
            <Box
              sx={{
                maxHeight: 400,
                overflow: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: darkMode ? "#1a2332" : "#f1f5f9",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: darkMode ? "#2d3748" : "#cbd5e1",
                  borderRadius: "4px",
                  "&:hover": {
                    background: darkMode ? "#4a5568" : "#94a3b8",
                  },
                },
              }}
            >
              {visibleNotifications.length === 0 ? (
                <Box sx={{ p: 6, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: darkMode
                        ? "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)"
                        : "linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.02) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      mb: 2,
                    }}
                  >
                    <NotificationsIcon
                      sx={{ fontSize: 40, color: darkMode ? "#4a5568" : "#cbd5e1" }}
                    />
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: darkMode ? "#a0aec0" : "#64748b",
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    No notifications yet
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: darkMode ? "#718096" : "#94a3b8",
                      fontSize: "0.85rem",
                    }}
                  >
                    We'll notify you when something arrives
                  </Typography>
                </Box>
              ) : (
                visibleNotifications.map((notification, index) => {
                  const id = notification._id || notification.id;
                  const snoozedNow = notification.snoozedUntil && new Date(notification.snoozedUntil).getTime() > Date.now();
                  return (
                    <Slide
                      key={id}
                      direction="down"
                      in={true}
                      timeout={200 + index * 50}
                      mountOnEnter
                      unmountOnExit
                    >
                      <Box>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            mx: 1.5,
                            my: 1,
                            borderRadius: "16px",
                            background: notification.isRead
                              ? "transparent"
                              : darkMode
                                ? "linear-gradient(135deg, rgba(33, 150, 243, 0.12) 0%, rgba(33, 150, 243, 0.06) 100%)"
                                : "linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.04) 100%)",
                            border: notification.isRead
                              ? "none"
                              : `1px solid ${darkMode ? "rgba(33, 150, 243, 0.2)" : "rgba(25, 118, 210, 0.15)"}`,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                            "&::before": notification.isRead ? {} : {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "4px",
                              height: "100%",
                              background: `linear-gradient(180deg, ${getTypeColor(notification.type)} 0%, ${getTypeColor(notification.type)}88 100%)`,
                              borderRadius: "0 2px 2px 0",
                            },
                            "&:hover": {
                              background: darkMode
                                ? "rgba(255,255,255,0.06)"
                                : "rgba(0,0,0,0.03)",
                              transform: "translateX(4px)",
                              boxShadow: darkMode
                                ? "0 4px 12px rgba(0,0,0,0.2)"
                                : "0 4px 12px rgba(0,0,0,0.08)",
                            },
                          }}
                          onClick={() => !notification.isRead && markAsRead(id)}
                        >
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            {/* Enhanced Icon Avatar */}
                            <Avatar
                              sx={{
                                width: 46,
                                height: 46,
                                background: `linear-gradient(135deg, ${getTypeColor(notification.type)}22 0%, ${getTypeColor(notification.type)}33 100%)`,
                                border: `2px solid ${getTypeColor(notification.type)}55`,
                                boxShadow: `0 4px 12px ${getTypeColor(notification.type)}33`,
                              }}
                            >
                              {getNotificationIcon(notification.type)}
                            </Avatar>

                            {/* Content */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                spacing={1}
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: notification.isRead ? 600 : 800,
                                    color: darkMode ? "#fff" : "#1a202c",
                                    lineHeight: 1.4,
                                    fontSize: "0.95rem",
                                    letterSpacing: "-0.01em",
                                  }}
                                >
                                  {notification.title}
                                </Typography>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Tooltip title={snoozedNow ? "Unsnooze" : "Snooze 1 hour"} arrow>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (snoozedNow) unsnoozeNotification(id);
                                        else snoozeNotification(id, 60);
                                      }}
                                      sx={{
                                        opacity: 0.6,
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                          opacity: 1,
                                          background: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                                          color: "#2196f3",
                                        },
                                      }}
                                    >
                                      <AccessTimeIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Archive" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        archiveNotification(id);
                                      }}
                                      sx={{
                                        opacity: 0.6,
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                          opacity: 1,
                                          background: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                                          color: "#ff9800",
                                        },
                                      }}
                                    >
                                      <ArchiveIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(id);
                                      }}
                                      sx={{
                                        opacity: 0.6,
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                          opacity: 1,
                                          color: "#f44336",
                                          background: "rgba(244, 67, 54, 0.1)",
                                        },
                                      }}
                                    >
                                      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Stack>

                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 0.5,
                                  color: darkMode ? "#cbd5e0" : "#64748b",
                                  lineHeight: 1.6,
                                  fontSize: "0.875rem",
                                }}
                              >
                                {notification.message}
                              </Typography>

                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mt: 1.5 }}
                              >
                                <Chip
                                  icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                                  label={getRelativeTime(notification.createdAt)}
                                  size="small"
                                  sx={{
                                    height: 24,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                                    color: darkMode ? "#90caf9" : "#64748b",
                                    border: "none",
                                    "& .MuiChip-icon": {
                                      color: "inherit",
                                    },
                                  }}
                                />
                                {!notification.isRead && (
                                  <Box
                                    sx={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: "50%",
                                      background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                                      boxShadow: "0 0 8px rgba(33, 150, 243, 0.6)",
                                      ml: "auto !important",
                                      animation: "glow 2s ease-in-out infinite",
                                      "@keyframes glow": {
                                        "0%, 100%": { opacity: 1 },
                                        "50%": { opacity: 0.6 },
                                      },
                                    }}
                                  />
                                )}
                              </Stack>
                            </Box>
                          </Stack>
                        </Paper>
                      </Box>
                    </Slide>
                  );
                })
              )}
            </Box>

            {/* Enhanced Recent Logins Section */}
            <Box
              sx={{
                borderTop: `1px solid ${darkMode ? "#2d3748" : "#e2e8f0"}`,
                background: darkMode
                  ? "linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, transparent 100%)"
                  : "linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, transparent 100%)",
              }}
            >
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "10px",
                      background: darkMode
                        ? "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)"
                        : "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "#fff", fontSize: 18 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Recent Logins
                    </Typography>
                    {recentLoginsSource && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: darkMode ? "#90caf9" : "#64748b",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      >
                        {recentLoginsSource === 'users-recent'
                          ? 'from users (recent)'
                          : recentLoginsSource === 'users'
                            ? 'from users'
                            : 'from attendance'}
                      </Typography>
                    )}
                  </Box>
                </Stack>
                {recentLogins.length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: darkMode ? "#cbd5e0" : "#64748b",
                      textAlign: "center",
                      py: 2,
                    }}
                  >
                    No recent logins to show
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {recentLogins.map((u) => (
                      <Paper
                        key={u.id}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: "12px",
                          background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                          border: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                            transform: "translateX(4px)",
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              background: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
                              fontWeight: 700,
                              fontSize: "1rem",
                              boxShadow: "0 2px 8px rgba(156, 39, 176, 0.3)",
                            }}
                          >
                            {(u.name || "U")[0].toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.875rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color: darkMode ? "#fff" : "#1a202c",
                              }}
                            >
                              {u.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: darkMode ? "#90caf9" : "#64748b",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                              }}
                            >
                              {u.email ? u.email : u.id}
                            </Typography>
                          </Box>
                          <Chip
                            label={u.lastSeen ? getRelativeTime(u.lastSeen) : "—"}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              background: darkMode
                                ? "rgba(76, 175, 80, 0.15)"
                                : "rgba(76, 175, 80, 0.1)",
                              color: "#4caf50",
                              border: "none",
                            }}
                          />
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            </Box>

            {/* Enhanced Footer */}
            {notifications.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  borderTop: `1px solid ${darkMode ? "#2d3748" : "#e2e8f0"}`,
                  background: darkMode ? "#1a2332" : "#f8fafc",
                }}
              >
                <Button
                  fullWidth
                  onClick={handleNotificationClose}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: darkMode ? "#90caf9" : "#1976d2",
                    borderRadius: "12px",
                    py: 1.5,
                    background: darkMode
                      ? "rgba(33, 150, 243, 0.08)"
                      : "rgba(25, 118, 210, 0.08)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: darkMode
                        ? "rgba(33, 150, 243, 0.15)"
                        : "rgba(25, 118, 210, 0.12)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Close Notifications
                </Button>
              </Box>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;