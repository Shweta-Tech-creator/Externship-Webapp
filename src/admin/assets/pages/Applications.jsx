import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Stack,
  useTheme,
  Container,
  Chip,
  Fade,
  Grid,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import GitHubIcon from "@mui/icons-material/GitHub";
import LaunchIcon from "@mui/icons-material/Launch";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FeedbackIcon from "@mui/icons-material/Feedback";
import api from "../../services/api";

const Applications = ({ onUpdateStats, darkMode }) => {
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();
  const [applications, setApplications] = useState([]);
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [filters, setFilters] = useState({
    status: "",
    internshipId: "",
    startDate: "",
    endDate: "",
  });

  const token = localStorage.getItem("adminToken");

  const handleFeedbackChange = (id, value) => {
    setFeedbackInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/application?${query}`);
      setApplications(data);
      if (onUpdateStats) onUpdateStats();
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line
  }, []);

  // Update status
  const handleStatusChange = async (id, status) => {
    try {
      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
      const feedback = feedbackInputs[id]?.trim();
      await api.put(`/application/${id}/status`, {
        status: normalizedStatus,
        ...(feedback ? { feedback } : {})
      });
      fetchApplications();
    } catch (error) {
      alert(error.message);
    }
  };

  // Export CSV
  const exportCSV = () => {
    const csvContent = [
      ["Student Name", "Email", "Internship", "Role", "Status", "GitHub", "Live URL", "Applied On"],
      ...applications.map((app) => [
        app.studentName || app.user?.name || "",
        app.studentEmail || app.user?.email || "",
        app.internship?.title || "",
        app.internship?.role || "",
        app.status,
        app.githubUrl || "",
        app.liveUrl || "",
        new Date(app.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "applications.csv";
    link.click();
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "approved") return { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981", icon: <CheckCircleIcon /> };
    if (statusLower === "rejected") return { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", icon: <CancelIcon /> };
    return { bg: "rgba(251, 191, 36, 0.15)", color: "#f59e0b", icon: <PendingIcon /> };
  };

  const getStatusCount = (status) => {
    return applications.filter((app) => app.status.toLowerCase() === status.toLowerCase()).length;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: darkMode
          ? "linear-gradient(135deg, #0a0e27 0%, #1a1d35 100%)"
          : "linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 5, textAlign: "center" }}>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                background: darkMode
                  ? "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)"
                  : "linear-gradient(135deg, #0A1A2F 0%, #1e40af 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Internship Applications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review and manage all submitted applications
            </Typography>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Fade in timeout={800}>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={darkMode ? 6 : 2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: darkMode
                    ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                    : "#ffffff",
                  border: `1px solid ${darkMode ? "#2a2a3e" : "#e0e7ff"}`,
                  borderLeft: "4px solid #f59e0b",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      PENDING
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color={darkMode ? "#fff" : "#0A1A2F"}>
                      {getStatusCount("pending")}
                    </Typography>
                  </Box>
                  <PendingIcon sx={{ fontSize: 48, color: "#f59e0b", opacity: 0.3 }} />
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={darkMode ? 6 : 2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: darkMode
                    ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                    : "#ffffff",
                  border: `1px solid ${darkMode ? "#2a2a3e" : "#e0e7ff"}`,
                  borderLeft: "4px solid #10b981",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      APPROVED
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color={darkMode ? "#fff" : "#0A1A2F"}>
                      {getStatusCount("approved")}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 48, color: "#10b981", opacity: 0.3 }} />
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={darkMode ? 6 : 2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: darkMode
                    ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                    : "#ffffff",
                  border: `1px solid ${darkMode ? "#2a2a3e" : "#e0e7ff"}`,
                  borderLeft: "4px solid #ef4444",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      REJECTED
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color={darkMode ? "#fff" : "#0A1A2F"}>
                      {getStatusCount("rejected")}
                    </Typography>
                  </Box>
                  <CancelIcon sx={{ fontSize: 48, color: "#ef4444", opacity: 0.3 }} />
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Fade>

        {/* Filter Section */}
        <Fade in timeout={1000}>
          <Paper
            elevation={darkMode ? 8 : 3}
            sx={{
              mb: 4,
              p: 4,
              borderRadius: 4,
              background: darkMode
                ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                : "#ffffff",
              border: `1px solid ${darkMode ? "#2a2a3e" : "#e0e7ff"}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: darkMode
                    ? "rgba(96, 165, 250, 0.1)"
                    : "rgba(59, 130, 246, 0.1)",
                }}
              >
                <FilterListIcon sx={{ fontSize: 28, color: "#60a5fa" }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color={darkMode ? "#fff" : "#0A1A2F"}>
                Filter Applications
              </Typography>
            </Stack>

            <Divider sx={{ mb: 3, borderColor: darkMode ? "#2a2a3e" : "#e0e7ff" }} />

            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Status"
                  select
                  fullWidth
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: darkMode ? "rgba(255,255,255,0.03)" : "#fafbff",
                    },
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Internship ID"
                  fullWidth
                  value={filters.internshipId}
                  onChange={(e) => setFilters({ ...filters, internshipId: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: darkMode ? "rgba(255,255,255,0.03)" : "#fafbff",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: darkMode ? "rgba(255,255,255,0.03)" : "#fafbff",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: darkMode ? "rgba(255,255,255,0.03)" : "#fafbff",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<FilterListIcon />}
                onClick={fetchApplications}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                  boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)",
                  },
                }}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<FileDownloadIcon />}
                onClick={exportCSV}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: darkMode ? "#3b82f6" : "#3b82f6",
                  color: darkMode ? "#60a5fa" : "#3b82f6",
                  "&:hover": {
                    borderColor: darkMode ? "#60a5fa" : "#2563eb",
                    background: darkMode
                      ? "rgba(59, 130, 246, 0.1)"
                      : "rgba(59, 130, 246, 0.05)",
                  },
                }}
              >
                Export CSV
              </Button>
            </Stack>
          </Paper>
        </Fade>

        {/* Applications List Header */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <AssignmentIcon sx={{ fontSize: 32, color: darkMode ? "#60a5fa" : "#3b82f6" }} />
          <Typography variant="h5" fontWeight={700} color={darkMode ? "#fff" : "#0A1A2F"}>
            All Applications ({applications.length})
          </Typography>
        </Box>

        {/* Applications List */}
        {applications.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              borderRadius: 3,
              textAlign: "center",
              background: darkMode ? "#1e1e2e" : "#ffffff",
              border: `2px dashed ${darkMode ? "#2a2a3e" : "#e0e7ff"}`,
            }}
          >
            <AssignmentIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No applications submitted yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Applications will appear here once students submit them
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {applications.map((app, index) => {
              const statusInfo = getStatusColor(app.status);
              return (
                <Fade in timeout={600 + index * 100} key={app._id}>
                  <Card
                    elevation={darkMode ? 6 : 2}
                    sx={{
                      borderRadius: 3,
                      background: darkMode
                        ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                        : "#ffffff",
                      border: `1px solid ${darkMode ? "#2a2a3e" : "#e0e7ff"}`,
                      transition: "all 0.3s ease",
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: darkMode
                          ? "0 12px 40px rgba(0,0,0,0.5)"
                          : "0 12px 32px rgba(14,30,37,0.15)",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 5,
                        background: statusInfo.color,
                        borderRadius: "3px 0 0 3px",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Header */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={2}
                        flexWrap="wrap"
                        gap={2}
                      >
                        <Box>
                          <Typography variant="h5" fontWeight={700} color={darkMode ? "#fff" : "#0A1A2F"} mb={0.5}>
                            {app.studentName || app.user?.name || "Unnamed Applicant"}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <EmailIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="body2" color="text.secondary">
                              {app.studentEmail || app.user?.email || "No email"}
                            </Typography>
                          </Stack>
                        </Box>
                        <Chip
                          icon={statusInfo.icon}
                          label={app.status}
                          sx={{
                            background: statusInfo.bg,
                            color: statusInfo.color,
                            fontWeight: 700,
                            px: 2,
                            py: 2.5,
                            textTransform: "capitalize",
                          }}
                        />
                      </Stack>

                      <Divider sx={{ my: 2, borderColor: darkMode ? "#2a2a3e" : "#e0e7ff" }} />

                      {/* Internship Info */}
                      <Grid container spacing={2} mb={2}>
                        <Grid item xs={12} md={6}>
                          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                            <WorkIcon sx={{ fontSize: 18, color: darkMode ? "#60a5fa" : "#3b82f6" }} />
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                              INTERNSHIP
                            </Typography>
                          </Stack>
                          <Typography variant="body1" fontWeight={600} color={darkMode ? "#fff" : "#0A1A2F"}>
                            {app.internship?.title || "-"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {app.internship?.role || "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                            <CalendarTodayIcon sx={{ fontSize: 18, color: darkMode ? "#a78bfa" : "#8b5cf6" }} />
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                              APPLIED ON
                            </Typography>
                          </Stack>
                          <Typography variant="body1" fontWeight={600} color={darkMode ? "#fff" : "#0A1A2F"}>
                            {new Date(app.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Links */}
                      <Box mb={2}>
                        <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                          {app.githubUrl && (
                            <Chip
                              icon={<GitHubIcon sx={{ fontSize: 16 }} />}
                              label="View GitHub"
                              component="a"
                              href={app.githubUrl}
                              target="_blank"
                              clickable
                              sx={{
                                background: darkMode
                                  ? "rgba(59, 130, 246, 0.15)"
                                  : "rgba(59, 130, 246, 0.1)",
                                color: darkMode ? "#60a5fa" : "#1e40af",
                                fontWeight: 600,
                                "&:hover": {
                                  background: darkMode
                                    ? "rgba(59, 130, 246, 0.25)"
                                    : "rgba(59, 130, 246, 0.2)",
                                },
                              }}
                            />
                          )}
                          {app.liveUrl && (
                            <Chip
                              icon={<LaunchIcon sx={{ fontSize: 16 }} />}
                              label="View Live Site"
                              component="a"
                              href={app.liveUrl}
                              target="_blank"
                              clickable
                              sx={{
                                background: darkMode
                                  ? "rgba(139, 92, 246, 0.15)"
                                  : "rgba(139, 92, 246, 0.1)",
                                color: darkMode ? "#a78bfa" : "#7c3aed",
                                fontWeight: 600,
                                "&:hover": {
                                  background: darkMode
                                    ? "rgba(139, 92, 246, 0.25)"
                                    : "rgba(139, 92, 246, 0.2)",
                                },
                              }}
                            />
                          )}
                        </Stack>
                      </Box>

                      {/* Feedback Section */}
                      <Box mb={2}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <FeedbackIcon sx={{ fontSize: 18, color: darkMode ? "#34d399" : "#10b981" }} />
                          <Typography variant="caption" fontWeight={600} color="text.secondary">
                            FEEDBACK
                          </Typography>
                        </Stack>
                        <TextField
                          placeholder="Add feedback for the applicant (optional)"
                          multiline
                          minRows={2}
                          fullWidth
                          value={feedbackInputs[app._id] ?? app.feedback ?? ""}
                          onChange={(e) => handleFeedbackChange(app._id, e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              background: darkMode ? "rgba(255,255,255,0.03)" : "#fafbff",
                            },
                          }}
                        />
                        {app.feedback && !feedbackInputs[app._id] && (
                          <Typography
                            variant="caption"
                            sx={{
                              mt: 1,
                              display: "block",
                              p: 1.5,
                              borderRadius: 1,
                              background: darkMode ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
                              color: darkMode ? "#34d399" : "#059669",
                            }}
                          >
                            Latest feedback: {app.feedback}
                          </Typography>
                        )}
                      </Box>

                      {/* Action Buttons */}
                      <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                        {app.status !== "Approved" && (
                          <Button
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleStatusChange(app._id, "approved")}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                              },
                            }}
                          >
                            Approve
                          </Button>
                        )}

                        {app.status !== "Rejected" && (
                          <Button
                            variant="contained"
                            startIcon={<CancelIcon />}
                            onClick={() => handleStatusChange(app._id, "rejected")}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                              boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                              },
                            }}
                          >
                            Reject
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default Applications;
