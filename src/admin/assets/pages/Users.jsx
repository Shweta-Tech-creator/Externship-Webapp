import React, { useState, useEffect } from 'react';
import api from "../../services/api";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Fade,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  PersonOutline as PersonIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const Users = ({ darkMode }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/all-users');

      // Handle different response formats
      let usersData = [];
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        usersData = response.data.results;
      }

      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const handleViewProfile = async (user) => {
    try {
      // Fetch detailed user profile including applications, projects, etc.
      const response = await api.get(`/admin/user-profile/${user._id || user.id}`);

      setSelectedUser({
        ...user,
        ...response.data,
        // Ensure we have all required fields
        name: user.name || response.data.name || 'Unknown',
        email: user.email || response.data.email || 'N/A',
        linkedInUrl: response.data.linkedInUrl || user.linkedInUrl || 'N/A',
        course: response.data.course || user.course || 'N/A',
        skills: response.data.skills || user.skills || [],
        mobile: response.data.mobile || user.mobile || 'N/A',
        certificates: response.data.certificates || [],
        projects: response.data.projects || [],
        applications: response.data.applications || [],
        internshipStatus: response.data.internshipStatus || 'Not Applied'
      });
      setProfileModalOpen(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Show basic user info even if detailed fetch fails
      setSelectedUser({
        ...user,
        linkedInUrl: user.linkedInUrl || 'N/A',
        course: user.course || 'N/A',
        skills: user.skills || [],
        mobile: user.mobile || 'N/A',
        certificates: user.certificates || [],
        projects: user.projects || [],
        applications: user.applications || [],
        internshipStatus: user.internshipStatus || 'Not Applied'
      });
      setProfileModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setProfileModalOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: darkMode
            ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d35 100%)'
            : 'linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: darkMode
          ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d35 100%)'
          : 'linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Fade in timeout={600}>
          <Paper
            elevation={darkMode ? 8 : 3}
            sx={{
              mb: 4,
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              background: darkMode
                ? 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              boxShadow: darkMode
                ? '0 20px 60px rgba(59, 130, 246, 0.3)'
                : '0 20px 60px rgba(59, 130, 246, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <PersonIcon sx={{ fontSize: 48, color: '#fff' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" fontWeight={900} color="#fff" mb={0.5}>
                  Logged-in Users
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Total registered users in the system: {users.length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {error && (
          <Fade in>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          </Fade>
        )}

        <Fade in timeout={800}>
          <Paper
            elevation={darkMode ? 6 : 2}
            sx={{
              borderRadius: 4,
              background: darkMode ? '#1e1e2e' : '#ffffff',
              border: `1px solid ${darkMode ? '#2a2a3e' : '#e0e7ff'}`,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 3, borderBottom: `1px solid ${darkMode ? '#2a2a3e' : '#e0e7ff'}` }}>
              <Typography variant="h5" fontWeight={700} color={darkMode ? '#fff' : '#0A1A2F'}>
                User Directory
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                All users who have registered and logged into the system
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead sx={{ background: darkMode ? '#252538' : '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: darkMode ? '#fff' : '#0A1A2F' }}>
                      S.No
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: darkMode ? '#fff' : '#0A1A2F' }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: darkMode ? '#fff' : '#0A1A2F' }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: darkMode ? '#fff' : '#0A1A2F' }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: darkMode ? '#fff' : '#0A1A2F' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <PersonIcon sx={{ fontSize: 64, color: '#94a3b8' }} />
                          <Typography variant="h6" color="#94a3b8">
                            No users found
                          </Typography>
                          <Typography variant="body2" color="#94a3b8">
                            No users have registered in the system yet
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, index) => (
                      <TableRow
                        key={user._id || index}
                        sx={{
                          '&:hover': {
                            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          },
                          borderBottom: `1px solid ${darkMode ? '#2a2a3e' : '#f1f5f9'}`,
                        }}
                      >
                        <TableCell sx={{ color: darkMode ? '#fff' : '#0A1A2F' }}>
                          {index + 1}
                        </TableCell>
                        <TableCell sx={{ color: darkMode ? '#fff' : '#0A1A2F', fontWeight: 500 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                              }}
                            >
                              {(user.name || 'User').charAt(0).toUpperCase()}
                            </Box>
                            {user.name || 'Unknown'}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                            {user.email || 'N/A'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                            label="Active"
                            size="small"
                            sx={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: darkMode ? '#34d399' : '#059669',
                              fontWeight: 600,
                              borderRadius: 1.5,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewProfile(user)}
                            sx={{
                              borderColor: darkMode ? '#8b5cf6' : '#7c3aed',
                              color: darkMode ? '#a78bfa' : '#7c3aed',
                              '&:hover': {
                                borderColor: darkMode ? '#a78bfa' : '#6d28d9',
                                backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.08)' : 'rgba(124, 58, 237, 0.08)',
                              },
                            }}
                          >
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Fade>
      </Container>

      {/* Profile Modal */}
      <Dialog
        open={profileModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: darkMode ? '#1e1e2e' : '#ffffff',
            border: `1px solid ${darkMode ? '#2a2a3e' : '#e0e7ff'}`,
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: darkMode ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' : 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 3,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Participant Profile
          </Typography>
          <IconButton onClick={handleCloseModal} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {selectedUser && (
            <Box>
              {/* Basic Info */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} color={darkMode ? '#fff' : '#0A1A2F'} mb={2}>
                  Basic Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color={darkMode ? '#fff' : '#0A1A2F'}>
                      {selectedUser.name || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color={darkMode ? '#94a3b8' : '#64748b'}>
                      {selectedUser.email || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      LinkedIn URL
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={500}
                      color={darkMode ? '#60a5fa' : '#1e40af'}
                      component="a"
                      href={selectedUser.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {selectedUser.linkedInUrl && selectedUser.linkedInUrl !== 'N/A' ? 'View LinkedIn' : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Mobile Number
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color={darkMode ? '#fff' : '#0A1A2F'}>
                      {selectedUser.mobile || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Course / Branch / Graduation Year
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color={darkMode ? '#fff' : '#0A1A2F'}>
                      {selectedUser.course || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Skills */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} color={darkMode ? '#fff' : '#0A1A2F'} mb={2}>
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Array.isArray(selectedUser.skills) && selectedUser.skills.length > 0 ? (
                    selectedUser.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        sx={{
                          background: darkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(124, 58, 237, 0.1)',
                          color: darkMode ? '#a78bfa' : '#7c3aed',
                          fontWeight: 500,
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No skills listed
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Internship Status */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} color={darkMode ? '#fff' : '#0A1A2F'} mb={2}>
                  Internship Status
                </Typography>
                <Chip
                  label={selectedUser.internshipStatus || 'Not Applied'}
                  size="medium"
                  sx={{
                    background:
                      (selectedUser.internshipStatus === 'Approved') ? 'rgba(16, 185, 129, 0.15)' :
                        (selectedUser.internshipStatus === 'Rejected') ? 'rgba(239, 68, 68, 0.15)' :
                          (selectedUser.internshipStatus === 'Applied') ? 'rgba(251, 191, 36, 0.15)' :
                            'rgba(107, 114, 128, 0.15)',
                    color:
                      (selectedUser.internshipStatus === 'Approved') ? (darkMode ? '#34d399' : '#059669') :
                        (selectedUser.internshipStatus === 'Rejected') ? (darkMode ? '#f87171' : '#dc2626') :
                          (selectedUser.internshipStatus === 'Applied') ? (darkMode ? '#fbbf24' : '#d97706') :
                            (darkMode ? '#9ca3af' : '#6b7280'),
                    fontWeight: 600,
                  }}
                />
              </Box>

              {/* Internship Applications */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} color={darkMode ? '#fff' : '#0A1A2F'} mb={2}>
                  Internship Applications ({Array.isArray(selectedUser.applications) ? selectedUser.applications.length : 0})
                </Typography>
                {Array.isArray(selectedUser.applications) && selectedUser.applications.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedUser.applications.map((app, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          borderRadius: 2,
                          border: `1px solid ${darkMode ? '#2a2a3e' : '#e0e7ff'}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600} color={darkMode ? '#fff' : '#0A1A2F'}>
                              {app.internshipTitle}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {app.company}
                            </Typography>
                          </Box>
                          <Chip
                            label={app.status}
                            size="small"
                            sx={{
                              background:
                                (app.status === 'Approved') ? 'rgba(16, 185, 129, 0.15)' :
                                  (app.status === 'Rejected') ? 'rgba(239, 68, 68, 0.15)' :
                                    'rgba(251, 191, 36, 0.15)',
                              color:
                                (app.status === 'Approved') ? (darkMode ? '#34d399' : '#059669') :
                                  (app.status === 'Rejected') ? (darkMode ? '#f87171' : '#dc2626') :
                                    (darkMode ? '#fbbf24' : '#d97706'),
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {app.githubUrl && (
                            <Typography
                              variant="body2"
                              component="a"
                              href={app.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: darkMode ? '#60a5fa' : '#1e40af', textDecoration: 'none' }}
                            >
                              GitHub →
                            </Typography>
                          )}
                          {app.liveUrl && (
                            <Typography
                              variant="body2"
                              component="a"
                              href={app.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: darkMode ? '#60a5fa' : '#1e40af', textDecoration: 'none' }}
                            >
                              Live Demo →
                            </Typography>
                          )}
                        </Box>
                        {app.feedback && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                            Feedback: {app.feedback}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No applications submitted
                  </Typography>
                )}
              </Box>

              {/* Projects */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} color={darkMode ? '#fff' : '#0A1A2F'} mb={2}>
                  Projects ({Array.isArray(selectedUser.projects) ? selectedUser.projects.length : 0})
                </Typography>
                {Array.isArray(selectedUser.projects) && selectedUser.projects.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedUser.projects.map((project, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          borderRadius: 2,
                          border: `1px solid ${darkMode ? '#2a2a3e' : '#e0e7ff'}`,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600} color={darkMode ? '#fff' : '#0A1A2F'}>
                          {project.title || project.name || 'Untitled Project'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {project.description || project.details || 'No description available'}
                        </Typography>
                        {(project.demoUrl || project.githubUrl) && (
                          <Box sx={{ mt: 1 }}>
                            {project.demoUrl && (
                              <Typography
                                variant="body2"
                                component="a"
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: darkMode ? '#60a5fa' : '#1e40af', textDecoration: 'none', mr: 2 }}
                              >
                                View Live Demo →
                              </Typography>
                            )}
                            {project.githubUrl && (
                              <Typography
                                variant="body2"
                                component="a"
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: darkMode ? '#60a5fa' : '#1e40af', textDecoration: 'none' }}
                              >
                                View GitHub →
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No projects uploaded
                  </Typography>
                )}
              </Box>

              {/* Certificates */}
              <Box>
                <Typography variant="h6" fontWeight={600} color={darkMode ? '#fff' : '#0A1A2F'} mb={2}>
                  Certificates ({Array.isArray(selectedUser.certificates) ? selectedUser.certificates.length : 0})
                </Typography>
                {Array.isArray(selectedUser.certificates) && selectedUser.certificates.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedUser.certificates.map((cert, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          borderRadius: 2,
                          border: `1px solid ${darkMode ? '#2a2a3e' : '#e0e7ff'}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} color={darkMode ? '#fff' : '#0A1A2F'}>
                            {cert.originalName || cert.name || `Certificate ${index + 1}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {cert.size ? `Size: ${(cert.size / 1024).toFixed(1)} KB` : ''}
                          </Typography>
                        </Box>
                        {cert.url && (
                          <Button
                            variant="outlined"
                            size="small"
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              borderColor: darkMode ? '#8b5cf6' : '#7c3aed',
                              color: darkMode ? '#a78bfa' : '#7c3aed',
                            }}
                          >
                            View
                          </Button>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No certificates uploaded
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: `1px solid ${darkMode ? '#2a2a3e' : '#e0e7ff'}` }}>
          <Button onClick={handleCloseModal} variant="contained" sx={{}}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
