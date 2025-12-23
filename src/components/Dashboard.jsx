import React, { useEffect, useState, useCallback } from "react";
import "./Dashboard.css";
import { getMyProfile, upsertMyProfile, uploadAvatar, deleteResume } from "../api/profile";
import { listProjects, createProject, deleteProject, listCertificates, uploadCertificate, deleteCertificate, listProjectFiles, uploadProjectFile, deleteProjectFile } from "../api/uploads";
import { fetchMe, updatePassword } from "../api/auth";
import { api } from "../api/client";

// Base for admin/backend APIs. Default to "/api" 
const adminApiBase = import.meta.env.VITE_ADMIN_API_URL || "/api";

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [view, setView] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [projectFiles, setProjectFiles] = useState([]);
  const [newProject, setNewProject] = useState({ title: "", description: "", githubUrl: "", demoUrl: "" });
  const [projectForm, setProjectForm] = useState({ name: "", details: "", liveLink: "" });
  const [certFile, setCertFile] = useState(null);
  const [submittingUpload, setSubmittingUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [certSuccess, setCertSuccess] = useState(false);
  const [projSuccess, setProjSuccess] = useState(false);

  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [filters, setFilters] = useState({
    workMode: new Set(),
    duration: new Set(),
    languages: new Set(),
    experience: new Set(),
    q: "",
  });
  const [favorites, setFavorites] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('favInternshipIds') || '[]')); } catch { return new Set(); }
  });
  const [ratings, setRatings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('internshipRatings') || '{}'); } catch { return {}; }
  });
  const [appliedInternshipId, setAppliedInternshipId] = useState("");
  const [myApplications, setMyApplications] = useState([]);
  const [assessment, setAssessment] = useState({ github: "", live: "" });
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [toast, setToast] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileMessage, setShowProfileMessage] = useState(false);

  // Test notification function
  const triggerNotification = (title, message) => {
    if (window.showNotification) {
      window.showNotification(title, message)
    }
  }

  const userScopedKey = useCallback((baseKey) => {
    const id = currentUser?.id || currentUser?._id;
    return id ? `${baseKey}:${id}` : baseKey;
  }, [currentUser]);

  async function submitApplicationToAdmin({ internshipId, githubUrl, liveUrl }) {
    const studentId = currentUser?.id || currentUser?._id;
    if (!studentId) {
      throw new Error("Please log in again before applying.");
    }

    const payload = {
      internshipId,
      studentId,
      studentName: profile?.fullName || currentUser?.name || "",
      studentEmail: profile?.email || currentUser?.email || "",
      githubUrl,
      liveUrl,
      status: 'submitted',
      appliedAt: new Date().toISOString()
    };

    const data = await api(`/api/application`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  }

  async function handleSubmitUploads(e) {
    if (e) e.preventDefault();
    try {
      setSubmittingUpload(true);
      setError("");

      const promises = [];

      // 1. Handle Project if title is provided
      if (newProject.title.trim()) {
        promises.push(createProject({
          title: newProject.title,
          description: newProject.description,
          githubUrl: newProject.githubUrl,
          demoUrl: newProject.demoUrl
        }));
      }

      // 2. Handle Certificate if file is selected
      if (certFile) {
        promises.push(uploadCertificate(certFile));
      }

      if (promises.length === 0) {
        setError("Please provide project details or a certificate file.");
        return;
      }

      await Promise.all(promises);

      // Refresh data
      const [projData, certData] = await Promise.all([
        listProjects(),
        listCertificates()
      ]);

      setProjects(projData || []);
      setCertificates(certData || []);

      // Reset form and close modal
      setNewProject({ title: "", description: "", githubUrl: "", demoUrl: "" });
      setCertFile(null);
      setShowUploadModal(false);
      setMessage("Uploaded successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err?.message || "Failed to upload");
    } finally {
      setSubmittingUpload(false);
    }
  }

  // Helpers and derived data for Internship filters
  function toggleSet(src, value) {
    const next = new Set(src);
    if (next.has(value)) next.delete(value); else next.add(value);
    return next;
  }

  const durationBuckets = [
    { key: "1-3", label: "1–3 months", min: 1, max: 3 },
    { key: "4-6", label: "4–6 months", min: 4, max: 6 },
    { key: "7-12", label: "7–12 months", min: 7, max: 12 },
    { key: "13-18", label: "13–18 months", min: 13, max: 18 },
    { key: "19-24", label: "19–24 months", min: 19, max: 24 },
  ];

  const experienceBuckets = [
    { key: "0", label: "None", min: 0, max: 0 },
    { key: "1", label: "1 year", min: 1, max: 1 },
    { key: "2-3", label: "2–3 years", min: 2, max: 3 },
    { key: "4-5", label: "4–5 years", min: 4, max: 5 },
    { key: "5+", label: "5+ years", min: 5, max: 50 },
  ];

  const allLanguages = Array.from(new Set(internships.flatMap(i => i.languages))).sort();
  const filteredInternships = internships.filter((i) => {
    if (filters.q && !(i.title + i.company + i.tags.join(" ")).toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.workMode.size && !filters.workMode.has(i.workMode)) return false;
    if (filters.duration.size) {
      const ok = Array.from(filters.duration).some((key) => {
        const b = durationBuckets.find(x => x.key === key);
        if (!b) return false;
        return i.durationMin <= b.max && i.durationMax >= b.min;
      });
      if (!ok) return false;
    }
    if (filters.languages.size && !i.languages.some(l => filters.languages.has(l))) return false;
    if (filters.experience.size) {
      const ok = Array.from(filters.experience).some((key) => {
        const b = experienceBuckets.find(x => x.key === key);
        if (!b) return false;
        return i.experience >= b.min && i.experience <= b.max;
      });
      if (!ok) return false;
    }
    return true;
  });

  function handleApply(internship) {
    if (!currentUser) {
      setToast('Please sign in again before applying.');
      setTimeout(() => setToast(""), 2500);
      return;
    }

    // Check if already applied to any internship
    if (myApplications.length > 0) {
      setToast('You have already applied to an internship. Only one application is allowed at a time.');
      setTimeout(() => setToast(""), 3000);
      return;
    }

    setAppliedInternshipId(internship.id);
    try {
      localStorage.setItem(userScopedKey('appliedInternshipId'), internship.id);
    } catch { }

    setSelectedInternship(null);
    setAssessment({ github: '', live: '' });
    setView('assignments');
    setToast('Continue in the assignment section to share your links.');
    setTimeout(() => setToast(""), 2500);
  }

  function handleRate(i, stars) {
    const next = { ...(ratings || {}), [i.id]: stars };
    setRatings(next);
    try { localStorage.setItem('internshipRatings', JSON.stringify(next)); } catch { }
  }

  function toggleFavorite(i) {
    setFavorites(prev => {
      const next = new Set(prev);
      const isAdding = !next.has(i.id);
      if (isAdding) next.add(i.id); else next.delete(i.id);

      // Save to localStorage for immediate UI updates
      try { localStorage.setItem('favInternshipIds', JSON.stringify(Array.from(next))); } catch { }

      // Also save to backend for persistence
      const studentId = currentUser?.id || currentUser?._id;
      if (studentId) {
        api(`/api/student/${studentId}/favorites`, {
          method: 'POST',
          body: JSON.stringify({ internshipId: i.id, action: isAdding ? 'add' : 'remove' })
        }).catch(err => console.error('Failed to sync favorites to backend:', err));
      }

      return next;
    });
  }

  const fetchMyApplications = useCallback(async (studentIdParam) => {
    const studentId = studentIdParam || currentUser?.id || currentUser?._id;
    if (!studentId) return;
    try {
      const data = await api(`/api/application/student/${studentId}`);
      // Ensure we only keep the most recent application if multiple exist
      const uniqueApps = [];
      const seen = new Set();
      (Array.isArray(data) ? data : []).forEach(app => {
        if (app.internship?._id && !seen.has(app.internship._id)) {
          seen.add(app.internship._id);
          uniqueApps.push(app);
        }
      });
      setMyApplications(uniqueApps);
    } catch (err) {
      console.error('Failed to fetch applications', err);
      setMyApplications([]); // Ensure empty state on error
    }
  }, [currentUser]);

  const fetchMyFavorites = useCallback(async (studentIdParam) => {
    const studentId = studentIdParam || currentUser?.id || currentUser?._id;
    if (!studentId) return;
    try {
      const data = await api(`/api/student/${studentId}/favorites`);
      const favoriteIds = Array.isArray(data) ? data.map(fav => fav.internshipId || fav.internship?._id) : [];
      setFavorites(new Set(favoriteIds));
      // Update localStorage with backend data
      try { localStorage.setItem('favInternshipIds', JSON.stringify(favoriteIds)); } catch { }
    } catch (err) {
      console.error('Failed to fetch favorites from backend, using localStorage:', err);
      // Fallback to localStorage if backend fails
      try {
        const stored = JSON.parse(localStorage.getItem('favInternshipIds') || '[]');
        setFavorites(new Set(stored));
      } catch {
        setFavorites(new Set());
      }
    }
  }, [currentUser]);

  useEffect(() => {
    let mounted = true;

    // Safety Force Loading Off after 5 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Dashboard: Safety timeout triggered. forcing loading=false');
        setLoading(false);
      }
    }, 5000);

    (async () => {
      try {
        console.log('Dashboard: Mounting and fetching profile...'); // Debug Log
        setLoading(true);

        // Always fetch fresh profile data from server for the current user
        // This prevents showing another user's cached profile data
        const data = await getMyProfile();
        console.log('Dashboard: Profile data fetched:', data); // Debug Log
        let nextProfile = data || {};

        let me = null;
        try {
          me = await fetchMe();
          if (me?.user && mounted) {
            setCurrentUser(me.user);

            // Verify the profile belongs to the current user
            // Clear cached profile if it belongs to a different user
            const cached = localStorage.getItem('profile');
            if (cached) {
              const localProfile = JSON.parse(cached);
              if (localProfile.email && localProfile.email !== me.user.email) {
                console.log('Different user detected, clearing cached profile');
                localStorage.removeItem('profile');
              }
            }
          }
        } catch (err) {
          console.error('Dashboard: fetchMe failed (silent catch):', err);
        }

        // Fallback to auth.me for name/email if profile is blank
        if ((!nextProfile?.email || !nextProfile?.fullName) && me?.user) {
          nextProfile = {
            ...nextProfile,
            email: nextProfile.email || me.user.email || nextProfile.email,
            fullName: nextProfile.fullName || me.user.name || nextProfile.fullName,
          };
        }

        if (mounted && nextProfile) {
          setProfile(nextProfile);
          try { localStorage.setItem('profile', JSON.stringify(nextProfile)); } catch { }
        }

        // Check if profile is incomplete and show message
        if (mounted && nextProfile) {
          const isIncomplete = !nextProfile.fullName || !nextProfile.email || !nextProfile.skills?.length;
          setShowProfileMessage(isIncomplete);
        }
        // Load lists
        try {
          const [certs, pfiles, projs] = await Promise.all([
            listCertificates().catch(() => []),
            listProjectFiles().catch(() => []),
            listProjects().catch(() => []),
          ]);
          if (mounted) {
            setCertificates(Array.isArray(certs) ? certs : []);
            setProjectFiles(Array.isArray(pfiles) ? pfiles : []);
            setProjects(Array.isArray(projs) ? projs : []);
            console.log('Loaded projects:', projs);
            console.log('Loaded project files:', pfiles);
          }
        } catch { }
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load profile");
        console.error('Dashboard: Top-level error loading profile:', e);
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('Dashboard: Finished loading. Loading = false');
        }
      }
    })();
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // so newly published admin internships appear here.
        const data = await api(`/api/internship/public`);

        if (!Array.isArray(data)) return;

        const mapped = data.map((raw) => {
          const durationStr = raw.duration || "";
          const months = parseInt(durationStr, 10) || 0;

          return {
            id: raw._id || String(raw.id || ""),
            title: raw.title || raw.role || "Internship",
            company: raw.company || "Admin Internship",
            workMode: raw.workMode || "Remote",
            durationLabel: durationStr || "Duration not specified",
            durationMin: months || 0,
            durationMax: months || 0,
            experience: typeof raw.experience === "number" ? raw.experience : 0,
            paid: Boolean(raw.paid),
            open: true,
            languages: Array.isArray(raw.techStack) ? raw.techStack : [],
            stack: Array.isArray(raw.techStack) ? raw.techStack : [],
            tools: Array.isArray(raw.tools) ? raw.tools : [],
            tags: Array.isArray(raw.benefits) ? raw.benefits : [],
            requiresAssessment: false,
            description: raw.description || raw.title || "",
            project: raw.project || "",
            stipend: raw.stipend || "",
            // openings removed from UI; keep here only if needed elsewhere
            openings: typeof raw.openings === "number" ? raw.openings : undefined,
            location: raw.location || "",
            internshipType: raw.internshipType || "",
            // deadline removed from UI; keep value if needed for logic
            deadline: raw.deadline || "",
            skillsRequired: Array.isArray(raw.skillsRequired) ? raw.skillsRequired : [],
          };
        }).filter(internship => {
          // Only filter out grey FSD and Java Developer internships
          const title = internship.title.toLowerCase();
          return !(title.includes('grey') &&
            (title.includes('full stack developer') ||
              title.includes('fsd') ||
              title.includes('java developer')));
        });

        if (!cancelled) setInternships(mapped);
      } catch (e) {
        if (cancelled) return;
        // Fallback: keep existing internships (if any) on error
        console.error("Failed to fetch internships", e?.message || e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setAppliedInternshipId("");
      return;
    }
    try {
      const stored = localStorage.getItem(userScopedKey('appliedInternshipId')) || "";
      setAppliedInternshipId(stored);
    } catch {
      setAppliedInternshipId("");
    }
  }, [currentUser, userScopedKey]);

  useEffect(() => {
    try { localStorage.setItem('favInternshipIds', JSON.stringify(Array.from(favorites))); } catch { }
  }, [favorites]);

  useEffect(() => {
    try { localStorage.setItem('internshipRatings', JSON.stringify(ratings)); } catch { }
  }, [ratings]);

  useEffect(() => {
    const studentId = currentUser?.id || currentUser?._id;
    if (studentId) fetchMyApplications(studentId);
  }, [currentUser, fetchMyApplications, myApplications]);

  useEffect(() => {
    const studentId = currentUser?.id || currentUser?._id;
    if (studentId) fetchMyFavorites(studentId);
  }, [currentUser, fetchMyFavorites]);

  useEffect(() => {
    if (view !== 'assignments') return;
    const studentId = currentUser?.id || currentUser?._id;
    if (studentId) fetchMyApplications(studentId);
  }, [view, currentUser, fetchMyApplications]);

  useEffect(() => {
    if (currentUser && myApplications.length === 0) {
      // Clear any stored application state for this user
      try {
        localStorage.removeItem(userScopedKey('appliedInternshipId'));
      } catch { }
    }
  }, [currentUser, myApplications.length, userScopedKey]);

  // Scroll reveal for cards (rerun on view change so new sections reveal)
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.dashboard-container .reveal-on-scroll'));

    // Failsafe: Force reveal after 500ms in case Observer fails or doesn't fire
    const fallbackTimer = setTimeout(() => {
      nodes.forEach(el => el.classList.add('revealed'));
      console.log('Dashboard: Forced reveal of elements');
    }, 500);

    if (!('IntersectionObserver' in window) || nodes.length === 0) {
      nodes.forEach((el) => el.classList.add('revealed'));
      return () => clearTimeout(fallbackTimer);
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    nodes.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [view, loading]); // Depend on loading so it runs after content renders

  const assignments = { pending: 0, submitted: 0, approved: 0, disapproved: 0 };

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!profile) return;
    setMessage("");
    try {
      setSaving(true);
      console.log('Saving profile:', profile);

      const updated = await upsertMyProfile({
        fullName: profile.fullName,
        email: profile.email,
        linkedInUrl: profile.linkedInUrl,
        courseBranchGradYear: profile.courseBranchGradYear,
        skills: Array.isArray(profile.skills) ? profile.skills : (profile.skills || ""),
        mobile: profile.mobile,
      });

      console.log('Server response:', updated);

      // Force success message
      const successMsg = "Profile saved successfully!";
      setMessage(successMsg);
      console.log('SUCCESS: Message set to:', successMsg);

      // Update local state
      const merged = { ...(profile || {}), ...updated }
      setProfile(merged)

      // Save to localStorage
      try {
        localStorage.setItem('profile', JSON.stringify(merged));
        console.log('Profile saved to localStorage:', merged);
      } catch (err) {
        console.error('Failed to save profile to localStorage:', err);
      }

      // Clear message after delay
      setTimeout(() => {
        console.log('Clearing message after 3 seconds');
        setMessage("");
      }, 3000);

    } catch (err) {
      console.error('Profile save error:', err);
      const errorMsg = err?.message || "Failed to save profile";
      setMessage(errorMsg);
      console.log('ERROR: Message set to:', errorMsg);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  }

  async function handleAvatarChange(file) {
    try {
      setError("");
      if (!file) return;
      // Optimistic preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      const res = await uploadAvatar(file);
      if (res?.avatarUrl) {
        setAvatarPreview(res.avatarUrl);
        setProfile(prev => {
          const next = { ...(prev || {}), avatarUrl: res.avatarUrl };
          try { localStorage.setItem('profile', JSON.stringify(next)); } catch { }
          return next;
        });
        setMessage("Avatar updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) {
      setError(e?.message || "Failed to upload avatar");
    }
  }

  async function handleDeleteCertificate(id) {
    try {
      await deleteCertificate(id);
      setCertificates((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      setError(err?.message || "Failed to delete file");
    }
  }

  async function handleDeleteProject(id) {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      setError(err?.message || "Failed to delete project");
    }
  }

  async function handleDeleteProjectFile(id) {
    try {
      await deleteProjectFile(id);
      setProjectFiles((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      setError(err?.message || "Failed to delete project file");
    }
  }

  function handleQuickPickCertificate() {
    const input = document.getElementById('quick-cert-input');
    if (input) input.click();
  }

  function onQuickCertChosen(e) {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    (async () => {
      try {
        setSubmittingUpload(true);
        const created = await uploadCertificate(file);
        setCertificates(prev => [created, ...prev]);
        setCertSuccess(true);
        setTimeout(() => setCertSuccess(false), 2000);
      } catch (err) {
        setError(err?.message || 'Failed to upload certificate');
      } finally {
        setSubmittingUpload(false);
        try { e.target.value = '' } catch { }
      }
    })();
  }

  function handleQuickPickProject() {
    setShowProjectModal(true);
  }

  function handleProjectSubmit(e) {
    e.preventDefault();
    (async () => {
      try {
        setSubmittingUpload(true);
        const projectData = {
          title: projectForm.name,
          description: projectForm.details,
          demoUrl: projectForm.liveLink,
          githubUrl: projectForm.liveLink
        };
        console.log('Creating project with data:', projectData);
        const created = await createProject(projectData);
        console.log('Project created:', created);
        setProjects(prev => {
          const updated = [created, ...prev];
          console.log('Projects updated:', updated);
          return updated;
        });
        setProjectForm({ name: "", details: "", liveLink: "" });
        setShowProjectModal(false);
        setMessage("Project added successfully!");
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        setError(err?.message || 'Failed to add project');
      } finally {
        setSubmittingUpload(false);
      }
    })();
  }

  function onQuickProjectChosen(e) {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    (async () => {
      try {
        setSubmittingUpload(true);
        const created = await uploadProjectFile(file);
        setProjectFiles(prev => [created, ...prev]);
        setProjSuccess(true);
        setTimeout(() => setProjSuccess(false), 2000);
      } catch (err) {
        setError(err?.message || 'Failed to upload project file');
      } finally {
        setSubmittingUpload(false);
        try { e.target.value = '' } catch { }
      }
    })();
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      const name = (file.name || '').toLowerCase();
      const isZip = name.endsWith('.zip') || (file.type || '') === 'application/zip';
      const isPdfOrImage = /\.pdf$|\.png$|\.jpe?g$|\.webp$/i.test(name) || (file.type || '').startsWith('image/') || (file.type || '') === 'application/pdf';
      (async () => {
        try {
          setSubmittingUpload(true);
          if (isZip) {
            const created = await uploadProjectFile(file);
            setProjectFiles(prev => [created, ...prev]);
            setProjSuccess(true);
            setTimeout(() => setProjSuccess(false), 2000);
          } else if (isPdfOrImage) {
            const created = await uploadCertificate(file);
            setCertificates(prev => [created, ...prev]);
            setCertSuccess(true);
            setTimeout(() => setCertSuccess(false), 2000);
          } else {
            setError('Unsupported file type');
          }
        } catch (err) {
          setError(err?.message || 'Failed to upload');
        } finally {
          setSubmittingUpload(false);
        }
      })();
    }
  }

  function handleLogout() {
    try { localStorage.removeItem('token') } catch { }
    try { localStorage.removeItem('profile') } catch { }
    window.location.href = '/'
  }


  return (
    <div className="dashboard-container">
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1200,
          background: '#0a1931', color: '#fff', borderRadius: 10,
          padding: '10px 14px', boxShadow: '0 10px 24px rgba(12,30,60,0.25)',
          border: '1px solid rgba(255,255,255,0.12)'
        }} role="status" aria-live="polite">{toast}</div>
      )}
      {message && (
        <div style={{
          position: 'fixed', top: 140, right: 20, zIndex: 1198,
          background: '#16a34a', color: '#fff', borderRadius: 10,
          padding: '12px 16px', boxShadow: '0 10px 24px rgba(12,30,60,0.25)',
          border: '1px solid rgba(255,255,255,0.2)', maxWidth: '300px'
        }} role="status" aria-live="polite">
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Success!</div>
          <div style={{ fontSize: '14px' }}>{message}</div>
          <button
            onClick={() => setMessage("")}
            style={{
              background: 'transparent', border: 'none', color: '#fff',
              cursor: 'pointer', fontSize: '12px', marginTop: '8px',
              textDecoration: 'underline'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      {showProfileMessage && (
        <div style={{
          position: 'fixed',
          top: 80, right: 20, zIndex: 1199,
          background: '#F4C542', color: '#0A0F24', borderRadius: 10,
          padding: '12px 16px', boxShadow: '0 10px 24px rgba(12,30,60,0.25)',
          border: '1px solid rgba(255,255,255,0.2)', maxWidth: '300px'
        }} role="status" aria-live="polite">
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Complete Your Profile</div>
          <div style={{ fontSize: '14px' }}>Please add your profile information to increase your chances of landing internships.</div>
          <button
            onClick={() => setShowProfileMessage(false)}
            style={{
              background: 'transparent', border: 'none', color: '#0A0F24',
              cursor: 'pointer', fontSize: '12px', marginTop: '8px',
              textDecoration: 'underline'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Welcome banner and Quick Stats (Dashboard) */}
      {view === 'profile' && (
        <>
          <section className="welcome-banner">
            <div className="welcome-text">
              <h1>Welcome{profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''} 👋</h1>
              <p className="subline">Here’s a quick overview of your progress and next steps.</p>
            </div>
          </section>

          <section className="quick-stats">
            <div className="stat-card reveal-on-scroll">
              <div className="stat-value">{myApplications.length}</div>
              <div className="stat-label">Internships Applied</div>
            </div>
            <div className="stat-card reveal-on-scroll">
              <div className="stat-value">{myApplications.filter(app => app.status === 'submitted').length}</div>
              <div className="stat-label">Assignments Submitted</div>
            </div>
            <div className="stat-card reveal-on-scroll">
              <div className="stat-value">{favorites.size}</div>
              <div className="stat-label">Saved Opportunities</div>
            </div>
          </section>
        </>
      )}
      <button
        className={`nav-toggle-btn ${menuOpen ? "hidden-btn" : ""}`}
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>
      <nav className={`collapsible-nav ${menuOpen ? "open" : ""}`}>
        <button className="close-nav-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
          ✕
        </button>
        <ul>
          <li>
            <button className={view === 'profile' ? 'active' : ''} onClick={() => { setView('profile'); setMenuOpen(false); }}>Profile</button>
          </li>
          <li>
            <button className={view === 'internship' ? 'active' : ''} onClick={() => { setView('internship'); setMenuOpen(false); }}>Internship Opportunity</button>
          </li>
          <li>
            <button className={view === 'assignments' ? 'active' : ''} onClick={() => { setView('assignments'); setMenuOpen(false); }}>Assignment</button>
          </li>
          <li>
            <button className={view === 'settings' ? 'active' : ''} onClick={() => { setView('settings'); setMenuOpen(false); }}>Settings</button>
          </li>
        </ul>
      </nav>

      {loading && <p>Loading profile…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && view === 'profile' && (
        <section id="profile" className="profile-card reveal-on-scroll" style={{ opacity: 1, transform: 'none', visibility: 'visible' }}>
          <div className="avatar-uploader">
            <label htmlFor="avatar-input" className="avatar-wrap" title="Upload profile picture">
              <img
                src={avatarPreview || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3J2UCequmFe2vNOn1ouwrpMBDDHsk_WioMw&s"}
                alt="User Avatar"
                className="profile-avatar"
              />
              <span className="avatar-edit">✎</span>
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
              disabled={!isEditing} // 👈 avatar disabled unless editing
            />

          </div>
          <div className="profile-info">
            <h2>Profile</h2>
            <form className="profile-form" onSubmit={handleSaveProfile}>
              <div className="form-row">
                <label>Full Name</label>
                <input
                  value={profile?.fullName || ''}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Your full name"
                  required
                  readOnly={!isEditing} // 👈 locked when not editing
                />
              </div>

              <div className="form-row">
                <label>Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  readOnly={!isEditing} // 👈 locked when not editing
                />
              </div>

              <div className="form-row">
                <label>LinkedIn URL</label>
                <input
                  value={profile?.linkedInUrl || ''}
                  onChange={(e) => setProfile({ ...profile, linkedInUrl: e.target.value })}
                  placeholder="https://www.linkedin.com/in/username"
                  readOnly={!isEditing} // 👈 locked when not editing
                />
              </div>

              <div className="form-row">
                <label>Course / Branch / Graduation year</label>
                <input
                  value={profile?.courseBranchGradYear || ''}
                  onChange={(e) => setProfile({ ...profile, courseBranchGradYear: e.target.value })}
                  placeholder="e.g. B.Tech CSE, 2025"
                  readOnly={!isEditing} // 👈 locked when not editing
                />
              </div>

              <div className="form-row">
                <label>Skills</label>
                <input
                  value={Array.isArray(profile?.skills) ? profile.skills.join(', ') : (profile?.skills || '')}
                  onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  placeholder="Add multiple skills, separated by commas"
                  readOnly={!isEditing} // 👈 locked when not editing
                />
              </div>

              <div className="form-row">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  value={profile?.mobile || ''}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  readOnly={!isEditing} // 👈 locked when not editing
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    if (isEditing) {
                      // Save the profile when done editing
                      const formEvent = new Event('submit', { cancelable: true });
                      handleSaveProfile(formEvent);
                    } else {
                      setIsEditing(true); // allow editing
                    }
                  }}
                >
                  {isEditing ? "Done" : "Edit"}
                </button>
              </div>


            </form>
          </div>
        </section>
      )}

      {!loading && view === 'profile' && (
        <section className="upload-cta-light reveal-on-scroll revealed">
          <div className="cta-left">
            <img
              src="https://i.pinimg.com/1200x/51/29/7a/51297a362b8ba3cd94e90bcc6b07d3bf.jpg"
              alt="Achievements illustration"
              className="cta-illustration"
            />
          </div>
          <div className="cta-right">
            <h3 className="cta-title">Ready to Shine? Upload Your Projects & Certificates</h3>
            <p className="cta-text">Upload your certificates and project links to increase your chances of landing your dream internship. Showcase your achievements and let your work speak for itself!</p>
            <input id="quick-cert-input" type="file" accept="application/pdf,image/*" style={{ display: 'none' }} onChange={onQuickCertChosen} />
            <input id="quick-project-input" type="file" accept="application/pdf,image/*,.zip" style={{ display: 'none' }} onChange={onQuickProjectChosen} />
            <div className="cta-actions">
              <button className="cta-btn" onClick={handleQuickPickCertificate}>Upload Certificate</button>
              {certSuccess && <span className="form-hint" style={{ color: '#16a34a', fontWeight: 700 }}>✅ Uploaded successfully!</span>}
              <button className="btn-secondary" onClick={handleQuickPickProject}>Add Project Details</button>
              {projSuccess && <span className="form-hint" style={{ color: '#16a34a', fontWeight: 700 }}>✅ Uploaded successfully!</span>}
            </div>
            <div
              className={`dropzone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="dz-inner">
                <span className="dz-title">Drag & Drop certificate here</span>
                <span className="dz-sub">PDF or Image files up to 15MB</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {!loading && view === 'profile' && (
        <section className="uploads-pair reveal-on-scroll revealed">
          <div className="uploads-panel">
            <h3 className="uploads-title">Your Certificates</h3>
            <div className="grid certs-grid">
              {certificates.map((c) => {
                const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const url = (c.filePath || '').startsWith('http') ? c.filePath : `${base}${c.filePath}`;
                const isImg = (c.mimeType || '').startsWith('image/');
                return (
                  <div key={c.id} className="card">
                    <div className="thumb">
                      {isImg ? (
                        <img src={url} alt={c.originalName} />
                      ) : (
                        <div className="pdf-thumb">PDF</div>
                      )}
                    </div>
                    <div className="meta">
                      <a href={url} target="_blank" rel="noreferrer" className="name">{c.originalName}</a>
                    </div>
                  </div>
                );
              })}
              {certificates.length === 0 && <p className="muted">No certificates yet.</p>}
            </div>
          </div>
          <div className="uploads-panel">
            <h3 className="uploads-title">Your Projects</h3>
            <div className="grid certs-grid">
              {projects.map((project) => (
                <div key={project.id} className="card" style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.borderColor = '#F4C542';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0A0F24 0%, #1e293b 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}>
                      <span style={{ color: '#F4C542' }}>🚀</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#0A0F24',
                        lineHeight: '1.3'
                      }}>{project.title}</h4>
                      {project.description && (
                        <p style={{
                          margin: '0',
                          fontSize: '14px',
                          color: '#64748b',
                          lineHeight: '1.5'
                        }}>{project.description}</p>
                      )}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#0A0F24',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.color = '#F4C542';
                        e.target.style.gap = '8px';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.color = '#0A0F24';
                        e.target.style.gap = '6px';
                      }}
                    >
                      <span>View Project</span>
                      <span style={{ fontSize: '16px' }}>→</span>
                    </a>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
                    }} />
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '2px dashed #cbd5e1'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px'
                  }}>🚀</div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#0A0F24'
                  }}>No projects yet</h3>
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    color: '#64748b'
                  }}>Add your first project to showcase your work</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Add Project / Upload Certificate</h3>
            <form onSubmit={handleSubmitUploads} className="modal-form">
              <div className="form-row">
                <label>Project Title</label>
                <input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="e.g. Portfolio Website" />
              </div>
              <div className="form-row">
                <label>Description</label>
                <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Short summary" rows={3} />
              </div>
              <div className="two-col">
                <div className="form-row">
                  <label>GitHub Link</label>
                  <input value={newProject.githubUrl} onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })} placeholder="https://github.com/..." />
                </div>
                <div className="form-row">
                  <label>Live Demo</label>
                  <input value={newProject.demoUrl} onChange={(e) => setNewProject({ ...newProject, demoUrl: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="form-row">
                <label>Certificate (PDF/Image)</label>
                <input type="file" accept="application/pdf,image/*" onChange={(e) => setCertFile(e.target.files?.[0] || null)} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="cta-btn" disabled={submittingUpload}>{submittingUpload ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="modal-backdrop" onClick={() => setShowProjectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title" style={{ color: '#0A0F24', fontWeight: '800', marginBottom: '16px' }}>Add Project Details</h3>
            <form onSubmit={handleProjectSubmit} className="modal-form">
              <div className="form-row" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#0A0F24', fontWeight: '600', fontSize: '14px' }}>Project Name</label>
                <input
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="e.g. Portfolio Website"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    background: '#ffffff',
                    color: '#0A0F24',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#F4C542'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div className="form-row" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#0A0F24', fontWeight: '600', fontSize: '14px' }}>Project Details</label>
                <textarea
                  value={projectForm.details}
                  onChange={(e) => setProjectForm({ ...projectForm, details: e.target.value })}
                  placeholder="Describe your project, technologies used, etc."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    background: '#ffffff',
                    color: '#0A0F24',
                    resize: 'vertical',
                    minHeight: '120px',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#F4C542'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div className="form-row" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#0A0F24', fontWeight: '600', fontSize: '14px' }}>Live Link</label>
                <input
                  value={projectForm.liveLink}
                  onChange={(e) => setProjectForm({ ...projectForm, liveLink: e.target.value })}
                  placeholder="https://your-project-demo.com"
                  type="url"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    background: '#ffffff',
                    color: '#0A0F24',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#F4C542'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowProjectModal(false)}
                  style={{
                    border: '1px solid #c7d7ea',
                    background: '#f5f9ff',
                    color: '#0a1931',
                    borderRadius: '999px',
                    padding: '10px 16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#e9f2ff'}
                  onMouseOut={(e) => e.target.style.background = '#f5f9ff'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cta-btn"
                  disabled={submittingUpload}
                  style={{
                    appearance: 'none',
                    border: '0',
                    outline: 'none',
                    cursor: submittingUpload ? 'not-allowed' : 'pointer',
                    padding: '12px 22px',
                    borderRadius: '999px',
                    background: submittingUpload ? '#94a3b8' : 'linear-gradient(135deg, #ffffff, #00bfff)',
                    color: '#0a1931',
                    fontWeight: '800',
                    boxShadow: submittingUpload ? 'none' : '0 8px 22px rgba(0,191,255,0.35), 0 6px 16px rgba(255,255,255,0.2)',
                    transition: 'transform .2s ease, box-shadow .2s ease, filter .2s ease',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => {
                    if (!submittingUpload) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 28px rgba(0,191,255,0.45), 0 8px 20px rgba(255,255,255,0.25)';
                      e.target.style.filter = 'saturate(1.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!submittingUpload) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 8px 22px rgba(0,191,255,0.35), 0 6px 16px rgba(255,255,255,0.2)';
                      e.target.style.filter = 'saturate(1)';
                    }
                  }}
                >
                  {submittingUpload ? 'Adding...' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {view === 'internship' && (
        <section id="internshipopp" className="internship-page">
          <div className="internship-hero">
            <div className="hero-bubbles" aria-hidden="true">
              <span className="bubble" />
              <span className="bubble" />
              <span className="bubble" />
              <span className="bubble" />
              <span className="bubble" />
              <span className="bubble" />
              <span className="bubble" />
              <span className="bubble" />
            </div>
            <div className="hero-left reveal-on-scroll">
              <h1 className="hero-title">Your Career Starts Here – Explore 100+ Internships</h1>
              <p className="hero-sub">Get access to real-world, expert‑verified opportunities across top companies and startups. Build hands‑on experience, grow with mentor feedback, and craft a portfolio that opens doors to your next step.</p>
              <div className="hero-actions">
                <button className="apply-btn large">Browse Internships</button>
              </div>
            </div>
            <div className="hero-right" aria-hidden="true">
              <div className="hero-collage reveal-on-scroll">
                <div className="collage-left">
                  <img
                    src="https://i.pinimg.com/736x/d4/0b/a8/d40ba87b44f1a7ff7e62a4eac8e5397c.jpg"
                    alt="Student working on laptop"
                    className="collage-img tall"
                  />
                </div>
                <div className="collage-right">
                  <img
                    src="https://i.pinimg.com/736x/b7/a4/19/b7a419e80c2d246daea0757b885ecd79.jpg"
                    alt="Team collaboration"
                    className="collage-img"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="search-row">
            <div className="search-input-wrap">
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                className="search-input-full"
                placeholder="Search roles, companies, or keywords"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                aria-label="Search internships"
              />
            </div>
            <div className="filters-inline">
              <select
                value={Array.from(filters.workMode)[0] || ''}
                onChange={(e) => setFilters({ ...filters, workMode: e.target.value ? new Set([e.target.value]) : new Set() })}
                aria-label="Filter by work mode"
              >
                <option value="">Work Mode</option>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
              <select
                value={Array.from(filters.duration)[0] || ''}
                onChange={(e) => setFilters({ ...filters, duration: e.target.value ? new Set([e.target.value]) : new Set() })}
                aria-label="Filter by duration"
              >
                <option value="">Duration</option>
                {durationBuckets.map(b => (<option key={b.key} value={b.key}>{b.label}</option>))}
              </select>
              <select
                value={Array.from(filters.experience)[0] || ''}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value ? new Set([e.target.value]) : new Set() })}
                aria-label="Filter by experience"
              >
                <option value="">Experience</option>
                {experienceBuckets.map(b => (<option key={b.key} value={b.key}>{b.label}</option>))}
              </select>
            </div>
          </div>

          <div className="internships-grid">
            {filteredInternships.map((i) => (
              <div key={i.id} className="intern-card">
                <div className="card-top">
                  <div className="titles">
                    <div className="role">{i.title}</div>
                    <div className="company">
                      {i.company === "Admin Internship" ? "" : i.company}
                    </div>
                  </div>
                  <button className="fav-btn" onClick={() => toggleFavorite(i)} aria-label="Favorite">
                    {favorites.has(i.id) ? '❤️' : '♡'}
                  </button>
                </div>
                {/* Meta line: duration • work mode • experience */}
                <div className="meta-row">
                  <span className="pill">{i.durationLabel}</span>
                  <span className="pill">{i.workMode}</span>
                  {i.experience > 0 && (
                    <span className="pill">{i.experience}+ years exp</span>
                  )}
                </div>

                <div className="card-body">
                  {/* Tech Stack and Tools & Technologies directly under meta */}
                  {(Array.isArray(i.stack) && i.stack.length > 0) || (Array.isArray(i.tools) && i.tools.length > 0) ? (
                    <div className="tech-tools-container">
                      {/* Tech Stack */}
                      {Array.isArray(i.stack) && i.stack.length > 0 && (
                        <div className="tech-section">
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                            💻 Tech Stack:
                          </div>
                          <div className="chips">
                            {i.stack.slice(0, 3).map((s) => (
                              <span key={s} className="chip primary">{s}</span>
                            ))}
                            {i.stack.length > 3 && (
                              <span className="chip primary">+{i.stack.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tools & Technologies */}
                      {Array.isArray(i.tools) && i.tools.length > 0 && (
                        <div className="tools-section">
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                            🛠️ Tools & Technologies:
                          </div>
                          <div className="chips">
                            {i.tools.slice(0, 3).map((t) => (
                              <span key={t} className="chip" style={{ background: '#e0e7ff', color: '#3730a3' }}>{t}</span>
                            ))}
                            {i.tools.length > 3 && (
                              <span className="chip" style={{ background: '#e0e7ff', color: '#3730a3' }}>+{i.tools.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Stipend / location / type row, kept compact below tech/tools */}
                  <div className="card-info">
                    {i.stipend && (<span className="pill warn">💰 {i.stipend}</span>)}
                    {i.location && (<span className="pill">📍 {i.location}</span>)}
                    {i.internshipType && (<span className="pill">🏢 {i.internshipType}</span>)}
                  </div>

                  {/* Skills Required (optional, at bottom to avoid empty look) */}
                  {Array.isArray(i.skillsRequired) && i.skillsRequired.length > 0 && (
                    <div className="skills-section" style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        🎯 Skills Required:
                      </div>
                      <div className="chips">
                        {i.skillsRequired.slice(0, 4).map((s) => (
                          <span key={s} className="chip">{s}</span>
                        ))}
                        {i.skillsRequired.length > 4 && (
                          <span className="chip">+{i.skillsRequired.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="card-foot">
                  <button className="btn-link" onClick={() => setSelectedInternship(i)}>View details</button>
                  <button
                    className={`apply-btn large block ${myApplications.length > 0 ? 'disabled' : ''}`}
                    onClick={() => setSelectedInternship(i)}
                    disabled={myApplications.length > 0}
                  >
                    {myApplications.length > 0 ? 'Already Applied' : 'Apply Now'}
                  </button>
                </div>
              </div>
            ))}
            {filteredInternships.length === 0 && (
              <p className="muted">No internships match the filters.</p>
            )}
          </div>

          {/* value-section removed as requested */}

          {selectedInternship && (
            <div className="detail-backdrop" onClick={() => setSelectedInternship(null)}>
              <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                <div className="detail-head">
                  <div>
                    <div className="role">{selectedInternship.title}</div>
                    <div className="company">{selectedInternship.company}</div>
                  </div>
                  <button className="close-detail" onClick={() => setSelectedInternship(null)}>✕</button>
                </div>
                <div className="detail-meta">
                  <span className="pill">{selectedInternship.workMode}</span>
                  <span className="pill">{selectedInternship.durationLabel}</span>
                </div>
                <div className="detail-body">
                  <div className="section">
                    <div className="section-title">Project Assigned to You</div>
                    <p className="muted">
                      {selectedInternship.project || selectedInternship.description}
                    </p>
                  </div>
                  <div className="section">
                    <div className="section-title">Tech stack</div>
                    <div className="chips">{selectedInternship.stack.map(s => (<span key={s} className="chip primary">{s}</span>))}</div>
                  </div>
                  <div className="section">
                    <div className="section-title">Tools & technologies</div>
                    <div className="chips">{selectedInternship.tools.map(t => (<span key={t} className="chip">{t}</span>))}</div>
                  </div>
                  <div className="section two-col">
                    <div>
                      <div className="section-title">Duration</div>
                      <div className="pill" style={{ display: 'inline-block' }}>{selectedInternship.durationLabel}</div>
                    </div>
                  </div>
                  <div className="section">
                    <div className="section-title">Rules & Regulations</div>
                    <ul className="benefits">
                      <li>All work must be original and completed by you only.</li>
                      <li>Respect submission deadlines and update your links if they change.</li>
                      <li>Maintain professional communication with mentors and admins.</li>
                      <li>Follow the project brief carefully before submitting your work.</li>
                    </ul>
                  </div>
                  {selectedInternship.requiresAssessment && (
                    <div className="section">
                      <div className="section-title">Technical assessment</div>
                      <div className="form-row">
                        <label>GitHub repository link</label>
                        <input
                          value={assessment.github}
                          onChange={(e) => setAssessment({ ...assessment, github: e.target.value })}
                          placeholder="https://github.com/username/repo"
                        />
                      </div>
                      <div className="form-row">
                        <label>Live project URL (optional)</label>
                        <input
                          value={assessment.live}
                          onChange={(e) => setAssessment({ ...assessment, live: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="detail-foot">
                  <button className="btn-secondary" onClick={() => setSelectedInternship(null)}>Close</button>
                  <button
                    className="apply-btn large"
                    style={{ minWidth: 150 }}
                    onClick={() => handleApply(selectedInternship)}
                  >
                    {appliedInternshipId === selectedInternship.id ? 'Applied' : (submittingApplication ? 'Submitting…' : 'Apply now')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {view === 'assignments' && (() => {
        // derive assignment state from localStorage (frontend only)
        const appId = appliedInternshipId;
        const current = internships.find(x => x.id === appId);
        const rawApp = myApplications.find((a) => a.internship?._id?.toString() === appId || a.internship === appId) || null;
        const status = rawApp?.status?.toLowerCase() || 'pending';
        const counts = myApplications.reduce((acc, a) => {
          const key = (a.status || 'pending').toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        return (
          <section id="assignments" className="assignment-status reveal-on-scroll">
            <h2>Assignment</h2>
            <div className="status-grid">
              <div className="status-card"><h3>{counts.pending || 0}</h3><p>To Submit</p></div>
              <div className="status-card"><h3>{counts.submitted || 0}</h3><p>Waiting for Approval</p></div>
              <div className="status-card"><h3>{counts.approved || 0}</h3><p>Approved</p></div>
              <div className="status-card"><h3>{counts.rejected || 0}</h3><p>Rejected</p></div>
            </div>

            {current ? (
              <div className="assignment-panel">
                <div className="assignment-head">
                  <div className="role">{current.title}</div>
                  <div className="company">{current.company}</div>
                  {status === 'approved' && (
                    <div className="waiting-approval">
                      <div className="pill primary" style={{ background: '#16a34a33', color: '#15803d' }}>Approved</div>
                      <p className="muted" style={{ marginTop: 8 }}>Great job! Your application has been approved.</p>
                      {rawApp?.feedback && (
                        <div className="notes-box" style={{ marginTop: 12 }}>
                          <div className="notes-head">Admin feedback</div>
                          <p className="muted">{rawApp.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {status === 'rejected' && (
                    <div className="waiting-approval">
                      <div className="pill primary" style={{ background: '#fee2e2', color: '#b91c1c' }}>Rejected</div>
                      <p className="muted" style={{ marginTop: 8 }}>This application was rejected. Review the feedback and try again.</p>
                      {rawApp?.feedback && (
                        <div className="notes-box" style={{ marginTop: 12 }}>
                          <div className="notes-head">Admin feedback</div>
                          <p className="muted">{rawApp.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {status === 'submitted' && (
                    <div className="waiting-approval">
                      <div className="pill primary">Under Review by Admin</div>
                      <p className="muted" style={{ marginTop: 8 }}>
                        Your application is currently under review. We'll notify you once we've processed your submission.
                      </p>
                      {rawApp?.feedback && (
                        <div className="notes-box" style={{ marginTop: 12 }}>
                          <div className="notes-head">Admin Feedback</div>
                          <p className="muted">{rawApp.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="assignment-overview">
                  <h3>Project Overview</h3>
                  <p className="muted">Build a functional demo aligned with the role. Implement core features, responsive UI, and clean code. Include clear documentation with README instructions, and provide a live deployment link. Use sensible state management, form validation where appropriate, and keep visual consistency.</p>
                  <ul className="benefits">
                    <li>Functional demo with core features</li>
                    <li>Responsive UI and accessible components</li>
                    <li>Documentation + README + deployment link</li>
                    <li>State management and form validation</li>
                  </ul>
                </div>

                {status === 'pending' && (
                  <form className="assignment-form" onSubmit={async (e) => {
                    e.preventDefault();
                    const gh = e.currentTarget.github?.value.trim() || '';
                    const lv = e.currentTarget.live?.value.trim() || '';
                    if (!gh || !lv) return;
                    try {
                      setSubmittingApplication(true);
                      await submitApplicationToAdmin({ internshipId: appId, githubUrl: gh, liveUrl: lv });
                      fetchMyApplications(currentUser?.id || currentUser?._id);
                      setView('profile');
                      setTimeout(() => setView('assignments'), 0);
                      setToast('Links submitted. Waiting for admin approval.');
                      setTimeout(() => setToast(""), 2500);
                    } catch (err) {
                      setToast(err?.message || 'Failed to submit application.');
                      setTimeout(() => setToast(""), 2500);
                    } finally {
                      setSubmittingApplication(false);
                    }
                  }}>
                    <div className="form-row">
                      <label>GitHub repository link</label>
                      <input name="github" placeholder="https://github.com/username/repo" required />
                    </div>
                    <div className="form-row">
                      <label>Live deployment URL</label>
                      <input name="live" placeholder="https://your-app.vercel.app" required />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="apply-btn large" disabled={submittingApplication}>
                        {submittingApplication ? 'Submitting…' : 'Submit Links'}
                      </button>
                    </div>
                  </form>
                )}

                {status === 'submitted' && (
                  <>
                    <div className="waiting-approval">
                      <div className="pill primary">Under Review by Admin</div>
                      <p className="muted" style={{ marginTop: 8 }}>
                        Your application is currently under review. We'll notify you once we've processed your submission.
                      </p>
                      {rawApp?.feedback && (
                        <div className="notes-box">
                          <div className="notes-head">Notes / Feedback</div>
                          <p className="muted">{rawApp.feedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="notes-box">
                      <div className="notes-head">Notes / Feedback</div>
                      <p className="muted">{rawApp?.feedback || 'No feedback from admin yet.'}</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="muted" style={{ marginTop: 12 }}>No active assignment. Apply to an internship to get started.</p>
            )}
          </section>
        );
      })()}

      {view === 'settings' && (
        <section id="settings" className="assignment-status reveal-on-scroll" style={{ marginTop: 24 }}>
          <h2>Settings</h2>
          <div className="settings-wrap">
            <div className="settings-grid">
              {/* Profile Info */}
              <div className="settings-card">
                <h3>Profile Information</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const next = {
                    ...(profile || {}),
                    fullName: form.fullName.value,
                    email: form.email.value,
                    mobile: form.mobile.value,
                  };
                  setProfile(next);
                  try { localStorage.setItem('profile', JSON.stringify(next)); } catch { }
                  setToast('Profile updated'); setTimeout(() => setToast(''), 1800);
                }} className="settings-form">
                  <div className="form-row">
                    <label>Name</label>
                    <input name="fullName" defaultValue={profile?.fullName || ''} placeholder="Your name" required />
                  </div>
                  <div className="form-row">
                    <label>Email</label>
                    <input type="email" name="email" defaultValue={profile?.email || ''} placeholder="you@example.com" required />
                  </div>
                  <div className="form-row">
                    <label>Phone</label>
                    <input type="tel" name="mobile" defaultValue={profile?.mobile || ''} placeholder="e.g. 9876543210" />
                  </div>
                  <div className="settings-actions"><button className="btn-secondary" type="submit">Save</button></div>
                </form>
              </div>

              {/* Academic Details */}
              <div className="settings-card compact">
                <h3>Academic Details</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const next = {
                    ...(profile || {}),
                    courseBranchGradYear: form.academic.value,
                    linkedInUrl: form.linkedin?.value || '',
                    githubUrl: form.github?.value || '',
                  };
                  setProfile(next);
                  try { localStorage.setItem('profile', JSON.stringify(next)); } catch { }
                  setToast('Academic details saved'); setTimeout(() => setToast(''), 1800);
                }} className="settings-form">
                  <div className="form-row">
                    <label>Course / Branch / Graduation Year</label>
                    <input name="academic" defaultValue={profile?.courseBranchGradYear || ''} placeholder="e.g. B.Tech CSE, 2025" />
                  </div>
                  <div className="form-row">
                    <label>LinkedIn Profile</label>
                    <input name="linkedin" defaultValue={profile?.linkedInUrl || ''} placeholder="https://www.linkedin.com/in/username" />
                  </div>
                  <div className="form-row">
                    <label>GitHub Link</label>
                    <input name="github" defaultValue={profile?.githubUrl || ''} placeholder="https://github.com/username" />
                  </div>
                  <div className="settings-actions"><button className="btn-secondary" type="submit">Save</button></div>
                </form>
              </div>

              {/* Documents Manager */}
              <div className="settings-card compact small">
                <h3>Documents</h3>
                <p className="muted">View and manage your uploaded certificates and projects.</p>
                <div className="settings-form">
                  <div className="form-row">
                    <label>Resume</label>
                    {/* Hidden resume input is always present to allow Upload or Replace */}
                    <input id="settings-resume-input" type="file" accept="application/pdf,.docx" style={{ display: 'none' }} onChange={async (e) => {
                      const file = e.target.files?.[0] || null;
                      if (!file) return;
                      try {
                        setSubmittingUpload(true);
                        const updated = await upsertMyProfile({ resumeFile: file });
                        if (updated && typeof updated === 'object') {
                          const merged = { ...(profile || {}), ...updated };
                          setProfile(merged);
                          try { localStorage.setItem('profile', JSON.stringify(merged)); } catch { }
                          setToast('Resume updated'); setTimeout(() => setToast(''), 1400);
                        }
                      } catch (err) {
                        setError(err?.message || 'Failed to upload resume');
                      } finally {
                        setSubmittingUpload(false);
                        try { e.target.value = '' } catch { }
                      }
                    }} />
                    {!profile?.resumePath ? (
                      <div className="doc-actions">
                        <button className="btn-secondary" type="button" onClick={() => document.getElementById('settings-resume-input')?.click()}>Upload Resume</button>
                      </div>
                    ) : (
                      <ul className="doc-list">
                        <li className="doc-item">
                          <a href={(profile.resumePath || '').startsWith('http') ? profile.resumePath : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${profile.resumePath}`} target="_blank" rel="noreferrer" className="name">View Resume</a>
                          <div className="doc-actions">
                            <button className="btn-secondary" type="button" onClick={() => document.getElementById('settings-resume-input')?.click()}>Replace</button>
                            <button className="small-danger" type="button" onClick={async () => {
                              try {
                                await deleteResume();
                                setProfile(prev => { const next = { ...(prev || {}) }; delete next.resumePath; try { localStorage.setItem('profile', JSON.stringify(next)); } catch { }; return next; });
                                setToast('Resume deleted'); setTimeout(() => setToast(''), 1200);
                              } catch (err) {
                                setError(err?.message || 'Failed to delete resume');
                              }
                            }}>Delete</button>
                          </div>
                        </li>
                      </ul>
                    )}
                  </div>
                  <div className="form-row">
                    <label>Certificates</label>
                    {certificates.length === 0 ? (
                      <p className="muted">No certificates uploaded.</p>
                    ) : (
                      <ul className="doc-list">
                        {certificates.map((c) => {
                          const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                          const url = (c.filePath || '').startsWith('http') ? c.filePath : `${base}${c.filePath}`;
                          return (
                            <li key={c.id} className="doc-item">
                              <a href={url} target="_blank" rel="noreferrer" className="name">{c.originalName}</a>
                              <button className="small-danger" onClick={() => handleDeleteCertificate(c.id)}>Delete</button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  <div className="form-row">
                    <label>Projects / Files</label>

                    {/* Display deployment links from Add Project Details */}
                    {projects.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Deployment Links:</p>
                        <ul className="doc-list">
                          {projects.map((project) => (
                            <li key={project.id} className="doc-item">
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <div>
                                  <div style={{ fontWeight: '600', color: '#0a1931', marginBottom: '4px' }}>{project.title}</div>
                                  {project.description && (
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>{project.description}</div>
                                  )}
                                  <a
                                    href={project.demoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="name"
                                    style={{ color: '#00bfff', textDecoration: 'none' }}
                                  >
                                    🚀 View Deployed Project
                                  </a>
                                </div>
                                <button className="small-danger" onClick={() => handleDeleteProject(project.id)}>Delete</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Display uploaded files */}
                    {projectFiles.length > 0 && (
                      <div>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Uploaded Files:</p>
                        <ul className="doc-list">
                          {projectFiles.map((f) => {
                            const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                            const url = (f.filePath || '').startsWith('http') ? f.filePath : `${base}${f.filePath}`;
                            return (
                              <li key={f.id} className="doc-item">
                                <a href={url} target="_blank" rel="noreferrer" className="name">{f.originalName}</a>
                                <button className="small-danger" onClick={() => handleDeleteProjectFile(f.id)}>Delete</button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Show message if no projects or files */}
                    {projects.length === 0 && projectFiles.length === 0 && (
                      <p className="muted">No projects or files uploaded.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="settings-card compact">
                <h3>Security</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const current = form.current?.value || '';
                  const next = form.next?.value || '';
                  const confirm = form.confirm?.value || '';
                  if (!current || !next) { setError('Please fill all password fields'); return; }
                  if (next !== confirm) { setError('New password and confirm do not match'); return; }
                  try {
                    setError('');
                    await updatePassword({ currentPassword: current, newPassword: next });
                    setToast('Your password has been updated successfully.'); setTimeout(() => setToast(''), 1000);
                    try { form.reset(); } catch { }
                  } catch (err) {
                    setError(err?.message || 'Failed to update password');
                  }
                }} className="settings-form">
                  <div className="form-row"><label>Current Password</label><input type="password" name="current" placeholder="••••••••" required /></div>
                  <div className="form-row"><label>New Password</label><input type="password" name="next" placeholder="New password" required /></div>
                  <div className="form-row"><label>Confirm Password</label><input type="password" name="confirm" placeholder="Confirm" required /></div>
                  <div className="settings-actions"><button className="btn-secondary" type="submit">Change Password</button></div>
                </form>
                {/* Device list removed as requested */}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
