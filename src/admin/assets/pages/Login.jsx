import React, { useState } from "react";
import { Box, Paper, TextField, Button, Typography, Alert, Link } from "@mui/material";
import api from "../../services/api";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Basic validation before calling API
      if (isRegister) {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setError("Please enter name, email and password");
          return;
        }
      } else {
        if (!email.trim() || !password.trim()) {
          setError("Please enter email and password");
          return;
        }
      }

      if (isRegister) {
        const payload = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
        };
        const { data } = await api.post("/admin/register", payload);
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem(
          "adminInfo",
          JSON.stringify({ _id: data._id, name: data.name, email: data.email })
        );
        onLogin();
        return;
      } else {
        const payload = {
          email: email.trim().toLowerCase(),
          password: password.trim(),
        };
        const { data } = await api.post("/admin/login", payload);
        // Backend returns {_id, name, email, token}
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem(
          "adminInfo",
          JSON.stringify({ _id: data._id, name: data.name, email: data.email })
        );
        onLogin();
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      const fallback = isRegister ? "Registration failed" : "Invalid credentials";
      setError(serverMsg || fallback);
      console.error("Auth error:", err);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #cddfecff, #6b9beeff)",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 5,
          borderRadius: 4,
          width: 500,
          textAlign: "center",
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: "#1a237e" }}>
          {isRegister ? "Admin Register" : "Admin Login"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>

        {isRegister && (
          <TextField
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        )}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            py: 1.5,
            backgroundColor: "#1a237e",
            fontWeight: 600,
            ":hover": { backgroundColor: "#151f6a" },
          }}
        >
          {isRegister ? "Register" : "Login"}
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <Link
            component="button"
            type="button"
            onClick={() => {
              setError("");
              setIsRegister(!isRegister);
            }}
            sx={{ fontWeight: 600 }}
          >
            {isRegister ? "Login" : "Register"}
          </Link>
        </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
