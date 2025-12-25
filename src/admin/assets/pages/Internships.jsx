import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  Stack,
  IconButton,
  Chip,
  useTheme,
  Drawer,
  Container,
  Fade,
  Divider,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CodeIcon from "@mui/icons-material/Code";
import BuildIcon from "@mui/icons-material/Build";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import api from "../../services/api";

const Internships = ({ onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [internships, setInternships] = useState([]);
  const [newInternship, setNewInternship] = useState({
    title: "",
    duration: "",
    techStack: "",
    role: "",
    tools: "",
    benefits: "",
    project: "", // project to assign to students
    experience: "", // years of experience required
    paid: "paid", // default
    workMode: "Remote", // Remote / Full-time / On-site
  });

  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem("adminToken");

  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const fetchInternships = async () => {
    try {
      const { data } = await api.get("/internship");
      setInternships(data);
      if (onChange) onChange();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId
      ? `/api/internship/${editingId}`
      : "/api/internship";

    const method = editingId ? "PUT" : "POST";

    try {
      const payload = {
        title: newInternship.title,
        duration: newInternship.duration,
        role: newInternship.role,
        techStack: newInternship.techStack
          ? newInternship.techStack.split(",").map((t) => t.trim())
          : [],
        tools: newInternship.tools
          ? newInternship.tools.split(",").map((t) => t.trim())
          : [],
        benefits: newInternship.benefits
          ? newInternship.benefits.split(",").map((t) => t.trim())
          : [],
        project: newInternship.project,
        experience: newInternship.experience
          ? Number(newInternship.experience)
          : 0,
        // map dropdowns to backend fields
        paid: newInternship.paid === "paid",
        workMode: newInternship.workMode,
      };

      if (editingId) {
        await api.put(`/internship/${editingId}`, payload);
      } else {
        await api.post("/internship", payload);
      }

      showToast(editingId ? "Internship updated!" : "Internship created!", "success");

      setNewInternship({
        title: "",
        duration: "",
        techStack: "",
        role: "",
        tools: "",
        benefits: "",
        project: "",
        experience: "",
        paid: "paid",
        workMode: "Remote",
      });
      setEditingId(null);
      fetchInternships();
      if (onChange) onChange();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this internship?")) return;

    try {
      await api.delete(`/internship/${id}`);

      showToast("Internship deleted", "success");
      fetchInternships();
      if (onChange) onChange();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleEdit = (intern) => {
    setEditingId(intern._id);
    setNewInternship({
      title: intern.title,
      duration: intern.duration,
      techStack: intern.techStack.join(", "),
      role: intern.role,
      tools: intern.tools.join(", "),
      benefits: intern.benefits ? intern.benefits.join(", ") : "",
      project: intern.project || "",
      experience: typeof intern.experience === "number" ? String(intern.experience) : "",
      paid: intern.paid ? "paid" : "unpaid",
      workMode: intern.workMode || "Remote",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const [selectedInternship, setSelectedInternship] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCardClick = (intern) => {
    setSelectedInternship(intern);
    setDrawerOpen(true);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: isDark
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
                background: isDark
                  ? "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)"
                  : "linear-gradient(135deg, #0A1A2F 0%, #1e40af 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Manage Internships
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage internship opportunities for your organization
            </Typography>
          </Box>
        </Fade>

        {/* Form Card with Enhanced Design */}
        <Fade in timeout={800}>
          <Paper
            elevation={isDark ? 8 : 3}
            sx={{
              mb: 6,
              p: 4,
              borderRadius: 4,
              background: isDark
                ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                : "#ffffff",
              border: `1px solid ${isDark ? "#2a2a3e" : "#e0e7ff"}`,
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.4)"
                : "0 8px 24px rgba(14,30,37,0.08)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: isDark
                    ? "rgba(96, 165, 250, 0.1)"
                    : "rgba(59, 130, 246, 0.1)",
                }}
              >
                <AddIcon sx={{ fontSize: 28, color: "#60a5fa" }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color={isDark ? "#fff" : "#0A1A2F"}>
                {editingId ? "Edit Internship" : "Create New Internship"}
              </Typography>
            </Stack>

            <Divider sx={{ mb: 3, borderColor: isDark ? "#2a2a3e" : "#e0e7ff" }} />

            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
              <TextField
                label="Internship Title"
                value={newInternship.title}
                onChange={(e) =>
                  setNewInternship({ ...newInternship, title: e.target.value })
                }
                fullWidth
                required
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: isDark ? "rgba(255,255,255,0.03)" : "#fafbff",
                  },
                }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Duration"
                  value={newInternship.duration}
                  onChange={(e) =>
                    setNewInternship({ ...newInternship, duration: e.target.value })
                  }
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDark ? "rgba(255,255,255,0.03)" : "#fafbff",
                    },
                  }}
                />

                <TextField
                  label="Role"
                  value={newInternship.role}
                  onChange={(e) =>
                    setNewInternship({ ...newInternship, role: e.target.value })
                  }
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDark ? "rgba(255,255,255,0.03)" : "#fafbff",
                    },
                  }}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  label="Experience (years)"
                  value={newInternship.experience}
                  onChange={(e) =>
                    setNewInternship({ ...newInternship, experience: e.target.value })
                  }
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDark ? "rgba(255,255,255,0.03)" : "#fafbff",
                    },
                  }}
                >
                  <MenuItem value="0">0 years (fresher)</MenuItem>
                  <MenuItem value="1">1 year</MenuItem>
                  <MenuItem value="2">2 years</MenuItem>
                  <MenuItem value="3">3 years</MenuItem>
                  <MenuItem value="4">4 years</MenuItem>
                  <MenuItem value="5">5+ years</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Stipend Type"
                  value={newInternship.paid}
                  onChange={(e) =>
                    setNewInternship({ ...newInternship, paid: e.target.value })
                  }
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDark ? "rgba(255,255,255,0.03)" : "#fafbff",
                    },
                  }}
                >
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Work Mode"
                  value={newInternship.workMode}
                  onChange={(e) =>
                    setNewInternship({ ...newInternship, workMode: e.target.value })
                  }
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDark ? "rgba(255,255,255,0.03)" : "#fafbff",
                    },
                  }}
                >
                  <MenuItem value="Remote">Remote</MenuItem>
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="On-site">On-site</MenuItem>
                </TextField>
              </Stack>

              <TextField
                label="Tech Stack (comma separated)"
                value={newInternship.techStack}
                onChange={(e) =>
                  setNewInternship({ ...newInternship, techStack: e.target.value })
                }
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: isDark ? "rgba(255,255,255,0.03)" : "#fafbff",
                  },
                }}
              />

              <TextField
                label="Tools (comma separated)"
                value={newInternship.tools}
                onChange={(e) =>
                  setNewInternship({ ...newInternship, tools: e.target.value })
                }
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: isDark ? "rgba(255,255,255,0.03)" : "#fafbff",
                  },
                }}
              />

              <TextField
                label="Benefits (comma separated)"
                value={newInternship.benefits}
                onChange={(e) =>
                  setNewInternship({ ...newInternship, benefits: e.target.value })
                }
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: isDark ? "rgba(255,255,255,0.03)" : "#fafbff",
                  },
                }}
              />

              <TextField
                label="Project to assign (e.g. project description or repo link)"
                value={newInternship.project}
                onChange={(e) =>
                  setNewInternship({ ...newInternship, project: e.target.value })
                }
                variant="outlined"
                fullWidth
                multiline
                minRows={3}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: isDark ? "rgba(255,255,255,0.03)" : "#fafbff",
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={editingId ? <EditIcon /> : <AddIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                  boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)",
                    boxShadow: "0 6px 20px rgba(59, 130, 246, 0.5)",
                  },
                }}
              >
                {editingId ? "Update Internship" : "Create Internship"}
              </Button>
            </Stack>
          </Paper>
        </Fade>

        {/* List Section Header */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <WorkOutlineIcon sx={{ fontSize: 32, color: isDark ? "#60a5fa" : "#3b82f6" }} />
          <Typography variant="h5" fontWeight={700} color={isDark ? "#fff" : "#0A1A2F"}>
            Active Internships ({internships.length})
          </Typography>
        </Box>

        {/* Internship Cards */}
        {internships.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              borderRadius: 3,
              textAlign: "center",
              background: isDark ? "#1e1e2e" : "#ffffff",
              border: `2px dashed ${isDark ? "#2a2a3e" : "#e0e7ff"}`,
            }}
          >
            <WorkOutlineIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No internships posted yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create your first internship opportunity above
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {internships.map((intern, index) => (
              <Fade in timeout={600 + index * 100} key={intern._id}>
                <Card
                  elevation={isDark ? 6 : 2}
                  sx={{
                    borderRadius: 3,
                    background: isDark
                      ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                      : "#ffffff",
                    border: `1px solid ${isDark ? "#2a2a3e" : "#e0e7ff"}`,
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "visible",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: isDark
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
                      background: "linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)",
                      borderRadius: "3px 0 0 3px",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <Typography variant="h5" fontWeight={700} color={isDark ? "#fff" : "#0A1A2F"}>
                            {intern.title}
                          </Typography>
                          <Chip
                            label="Active"
                            size="small"
                            sx={{
                              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              color: "#fff",
                              fontWeight: 600,
                            }}
                          />
                        </Stack>

                        <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                          <Chip
                            icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                            label={intern.duration}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: isDark ? "#3b82f6" : "#3b82f6",
                              color: isDark ? "#60a5fa" : "#3b82f6",
                            }}
                          />
                          <Chip
                            icon={<WorkOutlineIcon sx={{ fontSize: 16 }} />}
                            label={intern.role}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: isDark ? "#8b5cf6" : "#8b5cf6",
                              color: isDark ? "#a78bfa" : "#8b5cf6",
                            }}
                          />
                        </Stack>

                        <Box mb={2}>
                          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                            <CodeIcon sx={{ fontSize: 18, color: isDark ? "#60a5fa" : "#3b82f6" }} />
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                              TECH STACK
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {intern.techStack.map((t, i) => (
                              <Chip
                                key={i}
                                label={t}
                                size="small"
                                sx={{
                                  background: isDark
                                    ? "rgba(59, 130, 246, 0.15)"
                                    : "rgba(59, 130, 246, 0.1)",
                                  color: isDark ? "#60a5fa" : "#1e40af",
                                  fontWeight: 600,
                                  borderRadius: 1.5,
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>

                        <Button
                          size="medium"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(intern);
                          }}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            borderColor: isDark ? "#3b82f6" : "#3b82f6",
                            color: isDark ? "#60a5fa" : "#3b82f6",
                            "&:hover": {
                              background: isDark
                                ? "rgba(59, 130, 246, 0.1)"
                                : "rgba(59, 130, 246, 0.05)",
                              borderColor: isDark ? "#60a5fa" : "#2563eb",
                            },
                          }}
                        >
                          View Full Details
                        </Button>
                      </Box>

                      <Stack direction={{ xs: "row", md: "column" }} spacing={1} justifyContent="flex-start">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(intern);
                          }}
                          sx={{
                            background: isDark
                              ? "rgba(59, 130, 246, 0.1)"
                              : "rgba(59, 130, 246, 0.08)",
                            "&:hover": {
                              background: isDark
                                ? "rgba(59, 130, 246, 0.2)"
                                : "rgba(59, 130, 246, 0.15)",
                            },
                          }}
                        >
                          <EditIcon sx={{ color: isDark ? "#60a5fa" : "#3b82f6" }} />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(intern._id);
                          }}
                          sx={{
                            background: "rgba(239, 68, 68, 0.1)",
                            "&:hover": {
                              background: "rgba(239, 68, 68, 0.2)",
                            },
                          }}
                        >
                          <DeleteIcon sx={{ color: "#ef4444" }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Stack>
        )}
      </Container>

      {/* Enhanced Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 480 },
            background: isDark
              ? "linear-gradient(135deg, #0a0e27 0%, #1a1d35 100%)"
              : "#ffffff",
            boxShadow: isDark
              ? "-8px 0 32px rgba(0,0,0,0.5)"
              : "-8px 0 32px rgba(14,30,37,0.1)",
          },
        }}
      >
        {selectedInternship && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Box
              sx={{
                p: 3,
                background: isDark
                  ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                  : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                borderBottom: `1px solid ${isDark ? "#2a2a3e" : "#e2e8f0"}`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h5" fontWeight={700} color={isDark ? "#fff" : "#0A1A2F"}>
                    {selectedInternship.title}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip
                      icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                      label={selectedInternship.duration}
                      size="small"
                      sx={{ background: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)" }}
                    />
                    <Chip
                      icon={<WorkOutlineIcon sx={{ fontSize: 14 }} />}
                      label={selectedInternship.role}
                      size="small"
                      sx={{ background: isDark ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.1)" }}
                    />
                  </Stack>
                </Box>
                <IconButton onClick={() => setDrawerOpen(false)} size="small">
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
              {/* Project Assigned */}
              {selectedInternship.project && (
                <Box mb={3}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Project Assigned to Students
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedInternship.project}
                  </Typography>
                </Box>
              )}

              {/* Tech Stack */}
              <Box mb={3}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <CodeIcon sx={{ color: isDark ? "#60a5fa" : "#3b82f6" }} />
                  <Typography variant="h6" fontWeight={700}>Tech Stack</Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {selectedInternship.techStack.map((t, i) => (
                    <Chip
                      key={i}
                      label={t}
                      sx={{
                        background: isDark
                          ? "rgba(59, 130, 246, 0.15)"
                          : "rgba(59, 130, 246, 0.1)",
                        color: isDark ? "#60a5fa" : "#1e40af",
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Tools */}
              {selectedInternship.tools?.length > 0 && (
                <Box mb={3}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <BuildIcon sx={{ color: isDark ? "#a78bfa" : "#8b5cf6" }} />
                    <Typography variant="h6" fontWeight={700}>Tools</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {selectedInternship.tools.map((tool, i) => (
                      <Chip
                        key={i}
                        label={tool}
                        sx={{
                          background: isDark
                            ? "rgba(139, 92, 246, 0.15)"
                            : "rgba(139, 92, 246, 0.1)",
                          color: isDark ? "#a78bfa" : "#7c3aed",
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Benefits */}
              {selectedInternship.benefits?.length > 0 && (
                <Box mb={3}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <CardGiftcardIcon sx={{ color: isDark ? "#34d399" : "#10b981" }} />
                    <Typography variant="h6" fontWeight={700}>Benefits</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {selectedInternship.benefits.map((b, idx) => (
                      <Chip
                        key={idx}
                        label={b}
                        sx={{
                          background: isDark
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(16, 185, 129, 0.1)",
                          color: isDark ? "#34d399" : "#059669",
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Metadata */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                  border: `1px solid ${isDark ? "#2a2a3e" : "#e2e8f0"}`,
                }}
              >
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      POSTED
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(selectedInternship.createdAt || Date.now()).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      EXPERIENCE
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {typeof selectedInternship.experience === 'number' ? `${selectedInternship.experience} yrs` : '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      WORK MODE
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedInternship.workMode || 'Not specified'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      STIPEND TYPE
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedInternship.paid ? 'Paid' : 'Unpaid'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      APPLICANTS
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedInternship.applicants ? selectedInternship.applicants.length : 0}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* Footer Actions */}
            <Box
              sx={{
                p: 3,
                borderTop: `1px solid ${isDark ? "#2a2a3e" : "#e2e8f0"}`,
                background: isDark
                  ? "linear-gradient(135deg, #1e1e2e 0%, #252538 100%)"
                  : "#ffffff",
              }}
            >
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  onClick={async () => {
                    const details = `Title: ${selectedInternship.title}\nRole: ${selectedInternship.role}\nDuration: ${selectedInternship.duration}\nTech: ${selectedInternship.techStack.join(", ")}`;
                    try {
                      await navigator.clipboard.writeText(details);
                      showToast("Details copied to clipboard", "success");
                    } catch {
                      showToast("Copy failed", "error");
                    }
                  }}
                >
                  Copy Details
                </Button>
              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Internships;
