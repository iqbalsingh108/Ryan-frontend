"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";
import { useFormik } from "formik";
import TextField from "@mui/material/TextField";
import * as Yup from "yup";
import MovieTable from "./components/MovieTable";
import axios from "axios";
import { postAPI } from "./utils/API";

export default function Home() {
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Movie name is required")
      .min(2, "Movie name must be at least 2 characters")
      .max(100, "Movie name must be at most 100 characters"),
    duration: Yup.string()
      .required("Duration is required")
      .matches(/^[0-9]+[hmHM]$/, "Invalid format. Use Xh or Xm format")
      .test(
        "valid-duration",
        "Invalid duration. Must be between 1-720 minutes or 0.1-12 hours",
        (value) => {
          const numericValue = parseFloat(value);
          if (value.toLowerCase().includes("h")) {
            // Convert hours to minutes
            return numericValue >= 0.1 && numericValue <= 12 * 60; // 12 hours in minutes
          } else if (value.toLowerCase().includes("m")) {
            return numericValue >= 1 && numericValue <= 720;
          }
          return false;
        }
      ),
    rating: Yup.number()
      .required("Rating is required")
      .min(0, "Rating must be at least 0")
      .max(10, "Rating must be at most 10"),
  });

  const [open, setOpen] = React.useState(false);
  const formOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      duration: "",
      rating: "",
    },
    validationSchema,
    onSubmit: (values) => {
      handleAddMovie(values);
      handleClose();
    },
  });

  const handleAddMovie = async (values) => {
    const response = await postAPI({
      url: "/addmovies",
      body: values,
    });
  };

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <h1>Movies</h1>
        <Button variant="outlined" onClick={formOpen}>
          Add Movies
        </Button>
      </div>
      <MovieTable />
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>ADD MOVIE</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To add a movie, please provide the following details:
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="Movie Name"
              type="text"
              fullWidth
              variant="standard"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              autoFocus
              margin="dense"
              id="duration"
              name="duration"
              label="Duration"
              type="text"
              fullWidth
              variant="standard"
              value={formik.values.duration}
              onChange={formik.handleChange}
              error={formik.touched.duration && Boolean(formik.errors.duration)}
              helperText={formik.touched.duration && formik.errors.duration}
            />
            <TextField
              autoFocus
              margin="dense"
              id="rating"
              name="rating"
              label="Rating"
              type="number"
              fullWidth
              variant="standard"
              value={formik.values.rating}
              onChange={formik.handleChange}
              error={formik.touched.rating && Boolean(formik.errors.rating)}
              helperText={formik.touched.rating && formik.errors.rating}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Submit</Button>
          </DialogActions>
        </form>
      </Dialog>
    </main>
  );
}
