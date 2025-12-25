import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  Divider,
  Stack,
  useTheme,
  Chip,
  Grid,
  Card,
  CardContent,
  Fade,
  Skeleton,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import ShieldIcon from "@mui/icons-material/Shield";
import VerifiedIcon from "@mui/icons-material/Verified";
import api from "../../services/api";

const Profile = ({ darkMode }) => {
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/admin/profile");
        setAdmin(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const getInitials = (name) => {
    if (!name) return "AD";
    const names = name.split(" ");
    const initials =
      names.length === 1
        ? names[0][0]
        : names[0][0] + names[names.length - 1][0];
    return initials.toUpperCase();
  };

  if (!admin) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: darkMode
            ? "linear-gradient(135deg, #0a0e27 0%, #1a1d35 100%)"
            : "linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <Paper
          sx={{
            p: 6,
            borderRadius: 4,
            maxWidth: 800,
            width: "100%",
            textAlign: "center",
            background: darkMode
              ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
              : "#ffffff",
          }}
        >
          <Skeleton variant="circular" width={120} height={120} sx={{ mx: "auto", mb: 3 }} />
          <Skeleton variant="text" width="60%" height={40} sx={{ mx: "auto", mb: 2 }} />
          <Skeleton variant="text" width="40%" height={30} sx={{ mx: "auto", mb: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: 2 }} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: darkMode
          ? "linear-gradient(135deg, #0a0e27 0%, #1a1d35 100%)"
          : "linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 4,
      }}
    >
      <Fade in timeout={800}>
        <Box sx={{ maxWidth: 800, width: "100%" }}>
          {/* Main Profile Card */}
          <Paper
            elevation={darkMode ? 8 : 3}
            sx={{
              p: 5,
              borderRadius: 4,
              mb: 3,
              textAlign: "center",
              boxShadow: darkMode
                ? "0 12px 40px rgba(0,0,0,0.5)"
                : "0 12px 32px rgba(14,30,37,0.1)",
              background: darkMode
                ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                : "#ffffff",
              border: `1px solid ${darkMode ? "#2a2a3e" : "#e0e7ff"}`,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "120px",
                background: darkMode
                  ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                  : "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                opacity: 0.15,
                zIndex: 0,
              },
            }}
          >
            {/* Verified Badge */}
            <Box
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 2,
              }}
            >
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: 18 }} />}
                label="Verified Admin"
                size="small"
                sx={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              />
            </Box>

            <Box sx={{ position: "relative", zIndex: 1 }}>
              {/* Avatar with gradient border */}
              <Box
                sx={{
                  display: "inline-block",
                  p: 0.5,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  mb: 2,
                }}
              >
                <Avatar
                  src={admin.profilePic || ""}
                  alt={admin.name}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: darkMode ? "#1e40af" : "#3b82f6",
                    fontSize: 48,
                    fontWeight: 700,
                    color: "#fff",
                    border: `4px solid ${darkMode ? "#1e1e2e" : "#ffffff"}`,
                  }}
                >
                  {!admin.profilePic && getInitials(admin.name)}
                </Avatar>
              </Box>

              <Typography
                variant="h4"
                fontWeight={800}
                gutterBottom
                sx={{
                  color: darkMode ? "#fff" : "#0A1A2F",
                  mb: 1,
                }}
              >
                {admin.name}
              </Typography>

              <Chip
                icon={<ShieldIcon sx={{ fontSize: 16 }} />}
                label="System Administrator"
                sx={{
                  background: darkMode
                    ? "rgba(59, 130, 246, 0.15)"
                    : "rgba(59, 130, 246, 0.1)",
                  color: darkMode ? "#60a5fa" : "#1e40af",
                  fontWeight: 600,
                  px: 2,
                  py: 2.5,
                  fontSize: "0.9rem",
                }}
              />
            </Box>
          </Paper>

          {/* Info Cards */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Card
                elevation={darkMode ? 6 : 2}
                sx={{
                  borderRadius: 3,
                  background: darkMode
                    ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                    : "#ffffff",
                  border: `1px solid ${darkMode ? "#2a2a3e" : "#e0e7ff"}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: darkMode
                      ? "0 12px 32px rgba(0,0,0,0.4)"
                      : "0 12px 24px rgba(14,30,37,0.12)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: darkMode
                          ? "rgba(59, 130, 246, 0.15)"
                          : "rgba(59, 130, 246, 0.1)",
                      }}
                    >
                      <EmailIcon sx={{ fontSize: 28, color: "#3b82f6" }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                      >
                        Email Address
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{
                          color: darkMode ? "#fff" : "#0A1A2F",
                          wordBreak: "break-all",
                        }}
                      >
                        {admin.email}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                elevation={darkMode ? 6 : 2}
                sx={{
                  borderRadius: 3,
                  background: darkMode
                    ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                    : "#ffffff",
                  border: `1px solid ${darkMode ? "#2a2a3e" : "#e0e7ff"}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: darkMode
                      ? "0 12px 32px rgba(0,0,0,0.4)"
                      : "0 12px 24px rgba(14,30,37,0.12)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: darkMode
                          ? "rgba(139, 92, 246, 0.15)"
                          : "rgba(139, 92, 246, 0.1)",
                      }}
                    >
                      <AdminPanelSettingsIcon sx={{ fontSize: 28, color: "#8b5cf6" }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                      >
                        Role & Permissions
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{ color: darkMode ? "#fff" : "#0A1A2F" }}
                      >
                        Administrator
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Additional Info */}
          <Paper
            elevation={darkMode ? 6 : 2}
            sx={{
              p: 3,
              borderRadius: 3,
              background: darkMode
                ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                : "#ffffff",
              border: `1px solid ${darkMode ? "#2a2a3e" : "#e0e7ff"}`,
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              mb={2}
              sx={{ color: darkMode ? "#fff" : "#0A1A2F" }}
            >
              Account Privileges
            </Typography>
            <Divider sx={{ mb: 2, borderColor: darkMode ? "#2a2a3e" : "#e0e7ff" }} />
            <Grid container spacing={2}>
              {[
                "Manage Internships",
                "Review Applications",
                "Track Attendance",
                "User Management",
                "System Settings",
                "Full Access Control",
              ].map((privilege, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <VerifiedIcon sx={{ fontSize: 20, color: "#10b981" }} />
                    <Typography
                      variant="body2"
                      sx={{ color: darkMode ? "#ccc" : "#555" }}
                    >
                      {privilege}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Logout Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={() => {
              localStorage.removeItem("adminToken");
              window.location.reload();
            }}
            sx={{
              py: 1.8,
              fontWeight: 700,
              borderRadius: 3,
              textTransform: "none",
              fontSize: "1rem",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                boxShadow: "0 6px 20px rgba(239, 68, 68, 0.5)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Logout from Admin Panel
          </Button>
        </Box>
      </Fade>
    </Box>
  );
};

export default Profile;
