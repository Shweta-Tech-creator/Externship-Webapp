/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import api from "../../services/api";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Tooltip,
  Skeleton,
  Alert,
  Container,
  Fade,
  LinearProgress,
} from "@mui/material";
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const IconCircle = ({ children, bgcolor, gradient }) => (
  <Box
    sx={{
      width: 64,
      height: 64,
      borderRadius: '16px',
      display: 'grid',
      placeItems: 'center',
      background: gradient || bgcolor,
      color: '#fff',
      boxShadow: `0 8px 24px ${bgcolor}40`,
    }}
  >
    {children}
  </Box>
);

const Dashboard = ({ refresh, onNavigate, darkMode }) => {
  const [stats, setStats] = useState({
    totalInternships: 0,
    totalApplications: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("adminToken");

  const fetchStats = async (signal) => {
    setLoading(true);
    setError(null);
    try {
      // Signal handling with axios is different, passing signal to config
      const [internRes, appsRes, totalUsersRes] = await Promise.all([
        api.get("/internship", { signal }),
        api.get("/application", { signal }),
        api.get("/admin/total-users", { signal }),
      ]);

      const safeData = (res) => {
        if (!res) return [];
        // Axios returns data in res.data
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        if (data && Array.isArray(data.results)) return data.results;
        if (data && typeof data === "object") return Object.values(data);
        return [];
      };

      const internships = safeData(internRes);
      const applications = safeData(appsRes);

      // Handle total users response separately
      let totalUsersCount = 0;
      if (totalUsersRes) {
        try {
          const totalUsersData = totalUsersRes.data;
          if (typeof totalUsersData === "number") {
            totalUsersCount = totalUsersData;
          } else if (Array.isArray(totalUsersData)) {
            totalUsersCount = totalUsersData.length;
          } else if (totalUsersData && typeof totalUsersData === "object") {
            totalUsersCount = totalUsersData.totalUsers ?? totalUsersData.count ?? totalUsersData.total ?? (Array.isArray(totalUsersData.data) ? totalUsersData.data.length : undefined) ?? (Array.isArray(totalUsersData.results) ? totalUsersData.results.length : undefined) ?? 0;
          }
        } catch (err) {
          totalUsersCount = 0;
        }
      }

      // If admin/total-users returned nothing, derive a count from users list      // Fallback: if admin/total-users still returned nothing or was unauthorized, try fetching a public users count endpoint
      if (!totalUsersCount) {
        try {
          const countRes = await api.get("/users/count");
          if (countRes.data) {
            totalUsersCount = countRes.data.count ?? 0;
          }
        } catch (e) {
          // ignore fallback errors
          console.warn('users count fallback failed', e);
        }
      }

      setStats({
        totalInternships: internships.length,
        totalApplications: applications.length,
        pending: applications.filter(a => a.status === "Pending").length,
        approved: applications.filter(a => a.status === "Approved").length,
        rejected: applications.filter(a => a.status === "Rejected").length,
      });

      setTotalUsers(totalUsersCount);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Error loading stats:", err);
      setError("Unable to load statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchStats(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  const approvalRate = stats.totalApplications > 0
    ? Math.round((stats.approved / stats.totalApplications) * 100)
    : 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: darkMode
          ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d35 100%)'
          : 'linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%)',
        position: 'relative',
        overflow: "hidden",
        py: 4,
        '&::before': {
          content: "''",
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/bgimg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: darkMode ? 0.05 : 0.15,
          pointerEvents: 'none',
          display: { xs: 'none', md: 'block' },
        },
      }}
    >
      <Container maxWidth="xl">
        {/* Hero Header */}
        <Fade in timeout={600}>
          <Paper
            elevation={darkMode ? 8 : 3}
            sx={{
              mb: 5,
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              background: darkMode
                ? 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              boxShadow: darkMode
                ? '0 20px 60px rgba(59, 130, 246, 0.3)'
                : '0 20px 60px rgba(59, 130, 246, 0.2)',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)'}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                filter: 'blur(60px)',
              },
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <InsightsIcon sx={{ fontSize: 56, color: '#fff' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" fontWeight={900} color="#fff" mb={0.5}>
                  Admin Dashboard
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Monitor your internship program at a glance
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Fade>

        {error && (
          <Fade in>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <Grid container spacing={3}>
          {/* CARD 1 - Internship Listings */}
          <Grid item xs={12} sm={6} lg={6}>
            <Fade in timeout={800}>
              <Paper
                elevation={darkMode ? 6 : 2}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 4,
                  background: darkMode
                    ? 'linear-gradient(135deg, #1e1e2e 0%, #252538 100%)'
                    : '#ffffff',
                  border: `1px solid ${darkMode ? '#2a2a3e' : '#e0e7ff'}`,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '200px',
                    height: '200px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    opacity: 0.05,
                    borderRadius: '50%',
                    transform: 'translate(50%, -50%)',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: darkMode
                      ? '0 20px 60px rgba(0,0,0,0.5)'
                      : '0 20px 60px rgba(79, 70, 229, 0.15)',
                  },
                }}
                onClick={() => onNavigate('internships')}
              >
                <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <IconCircle
                      bgcolor="#4f46e5"
                      gradient="linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                    >
                      <WorkOutlineIcon sx={{ fontSize: 32 }} />
                    </IconCircle>
                    <Chip
                      label="Active"
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        fontWeight: 700,
                      }}
                    />
                  </Stack>

                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                      INTERNSHIP LISTINGS
                    </Typography>
                    <Typography variant="h2" fontWeight={900} color={darkMode ? '#fff' : '#0A1A2F'}>
                      {loading ? (
                        <Skeleton width={120} height={60} />
                      ) : (
                        <CountUp end={stats.totalInternships} duration={1.8} />
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Active opportunities available
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('internships');
                    }}
                    sx={{
                      alignSelf: 'flex-start',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                      },
                    }}
                  >
                    Manage Internships
                  </Button>
                </Stack>
              </Paper>
            </Fade>
          </Grid>

          {/* CARD 2 - Applications */}
          <Grid item xs={12} sm={6} lg={6}>
            <Fade in timeout={900}>
              <Paper
                elevation={darkMode ? 6 : 2}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 4,
                  background: darkMode
                    ? 'linear-gradient(135deg, #1e1e2e 0%, #252538 100%)'
                    : '#ffffff',
                  border: `1px solid ${darkMode ? '#2a2a3e' : '#e0e7ff'}`,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '200px',
                    height: '200px',
                    background: 'linear-gradient(135deg, #0ea5a4 0%, #06b6d4 100%)',
                    opacity: 0.05,
                    borderRadius: '50%',
                    transform: 'translate(50%, -50%)',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: darkMode
                      ? '0 20px 60px rgba(0,0,0,0.5)'
                      : '0 20px 60px rgba(14, 165, 164, 0.15)',
                  },
                }}
                onClick={() => onNavigate('applications')}
              >
                <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <IconCircle
                      bgcolor="#0ea5a4"
                      gradient="linear-gradient(135deg, #0ea5a4 0%, #06b6d4 100%)"
                    >
                      <DescriptionIcon sx={{ fontSize: 32 }} />
                    </IconCircle>
                    <TrendingUpIcon sx={{ fontSize: 32, color: darkMode ? '#34d399' : '#10b981', opacity: 0.5 }} />
                  </Stack>

                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                      TOTAL APPLICATIONS
                    </Typography>
                    <Typography variant="h2" fontWeight={900} color={darkMode ? '#fff' : '#0A1A2F'}>
                      {loading ? (
                        <Skeleton width={120} height={60} />
                      ) : (
                        <CountUp end={stats.totalApplications} duration={1.8} />
                      )}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" gap={1}>
                      <Tooltip title="Pending Review" arrow>
                        <Chip
                          icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />}
                          label={loading ? '–' : stats.pending}
                          size="small"
                          sx={{
                            background: 'rgba(251, 191, 36, 0.15)',
                            color: darkMode ? '#fbbf24' : '#d97706',
                            fontWeight: 700,
                            borderRadius: 1.5,
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Approved" arrow>
                        <Chip
                          icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                          label={loading ? '–' : stats.approved}
                          size="small"
                          sx={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: darkMode ? '#34d399' : '#059669',
                            fontWeight: 700,
                            borderRadius: 1.5,
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Rejected" arrow>
                        <Chip
                          icon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
                          label={loading ? '–' : stats.rejected}
                          size="small"
                          sx={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: darkMode ? '#f87171' : '#dc2626',
                            fontWeight: 700,
                            borderRadius: 1.5,
                          }}
                        />
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('applications');
                    }}
                    sx={{
                      alignSelf: 'flex-start',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #0ea5a4 0%, #06b6d4 100%)',
                      boxShadow: '0 4px 14px rgba(14, 165, 164, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0891b2 0%, #0284c7 100%)',
                      },
                    }}
                  >
                    View Applications
                  </Button>
                </Stack>
              </Paper>
            </Fade>
          </Grid>


          {/* CARD 4 - Total Participants */}
          <Grid item xs={12} sm={6} lg={6}>
            <Fade in timeout={1100}>
              <Paper
                elevation={darkMode ? 6 : 2}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 4,
                  background: darkMode
                    ? 'linear-gradient(135deg, #1e1e2e 0%, #252538 100%)'
                    : '#ffffff',
                  border: `1px solid ${darkMode ? '#2a2a3e' : '#e0e7ff'}`,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '200px',
                    height: '200px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    opacity: 0.05,
                    borderRadius: '50%',
                    transform: 'translate(50%, -50%)',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: darkMode
                      ? '0 20px 60px rgba(0,0,0,0.5)'
                      : '0 20px 60px rgba(139, 92, 246, 0.15)',
                  },
                }}
                onClick={() => onNavigate('users')}
              >
                <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <IconCircle
                      bgcolor="#8b5cf6"
                      gradient="linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)"
                    >
                      <GroupsIcon sx={{ fontSize: 32 }} />
                    </IconCircle>
                    <Chip
                      label="Users"
                      size="small"
                      sx={{
                        background: darkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                        color: darkMode ? '#a78bfa' : '#7c3aed',
                        fontWeight: 700,
                      }}
                    />
                  </Stack>

                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                      TOTAL PARTICIPANTS
                    </Typography>
                    <Typography variant="h2" fontWeight={900} color={darkMode ? '#fff' : '#0A1A2F'}>
                      {loading ? (
                        <Skeleton width={120} height={60} />
                      ) : (
                        <CountUp end={totalUsers} duration={1.8} />
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Registered users in the system
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('users');
                    }}
                    sx={{
                      alignSelf: 'flex-start',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
                      },
                    }}
                  >
                    View Participants
                  </Button>
                </Stack>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
