import React, { useState } from "react";
import { Box, Paper, TextField, Button, Typography, Alert } from "@mui/material";
import api from "../../services/api";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!email.trim() || !password.trim()) {
        setError("Please enter email and password");
        return;
      }

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
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || "Invalid credentials");
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
          Admin Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
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
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
