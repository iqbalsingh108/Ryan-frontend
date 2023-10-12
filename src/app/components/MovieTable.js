import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { CSVLink } from "react-csv";
import { saveAs } from "file-saver";

import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import { Pagination } from "@mui/material";
import { deleteAPI, getAPI, putAPI } from "../utils/API";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useFormik } from "formik";
import * as Yup from "yup";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function createData(name, duration, rating) {
  return { name, duration, rating };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
];

const tempData = [
  { name: "Frozen yoghurt", duration: 159, rating: 6.0 },
  { name: "Ice cream sandwich", duration: 159, rating: 6.0 },
  { name: "Eclair", duration: 190, rating: 6.0 },
  { name: "Cupcake", duration: 250, rating: 6.0 },
];

export default function MovieTable() {
  const [searchText, setSearchText] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [movies, setMovies] = React.useState(rows);
  const [pageNo, setPageNo] = React.useState(1); // Adjust this to your initial page number
  const itemsPerPage = 1; // Number of items to display per page

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
  // const [detail, setDetail] = React.useState();

  const formOpen = (row) => {
    setOpen(true);
    formik.setValues({
      id: row.id || "",
      name: row.name || "",
      duration: row.duration || "",
      rating: row.rating || "",
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      id: "",
      name: "",
      duration: "",
      rating: "",
    },
    validationSchema,
    onSubmit: (values) => {
      handleEditMovie(values);
      handleClose();
    },
  });

  const handleEditMovie = async (values) => {
    const response = await putAPI({
      url: `/updatemovie/${values.id}`,
      body: values,
    });
    getDetails();
  };

  const onDelete = async (values) => {
    const response = await deleteAPI({
      url: `/delete/${values.id}`,
    });
    getDetails();
  };

  const newData = movies.map((item) => {
    return { ...item };
  });
  const headers = [
    { label: "Movie Name", key: "name" },
    { label: "Duration (hours)", key: "duration" },
    { label: "Rating", key: "rating" },
  ];

  const prepareTextData = () => {
    const textData = movies.map((movie) => {
      return `Name: ${movie.name}\nDuration: ${movie.duration}\nRating: ${movie.rating}\n\n`;
    });
    const text = textData.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    saveAs(blob, "movie-list.txt");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearchSubmit = () => {
    // Perform the search here
    const query = searchText.toLowerCase();
    const filteredMovies = movies.filter((item) => {
      return item.name.toLowerCase().includes(query);
    });
    setMovies(filteredMovies);
  };

  const handleSearchChange = (event) => {
    const { value } = event.target;
    setSearchText(value);
    handleSearchSubmit();
  };


  const handlePagination = (event, value) => {
    setPageNo(value);
  };

  const getDetails = async () => {
    const response = await getAPI({ url: "/allmovies" });
    setMovies(response.data);
  };

  React.useEffect(() => {
    getDetails();
  }, []);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleMenuOpen}>
        Download Movie List
      </Button>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              prepareTextData();
            }}
          >
            Text
          </MenuItem>
          <CSVLink
            className="expt-btn"
            filename={`movies.csv`}
            headers={headers}
            data={newData}
          >
            <Button variant="primary" className="btn3" type="submit">
              CSV
            </Button>
          </CSVLink>
        </Menu>
        <TextField
          variant="outlined"
          label="Search Movies"
          value={searchText}
          onChange={handleSearchChange}
          fullWidth
          InputProps={{
            endAdornment: (
              <SearchIcon
                style={{
                  cursor: "pointer",
                }}
                onClick={handleSearchSubmit}
              />
            ),
          }}
        />
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Movie Name</StyledTableCell>
              <StyledTableCell align="right">Duration (hours)</StyledTableCell>
              <StyledTableCell align="right">
                Rating&nbsp;(out of 10)
              </StyledTableCell>
              <StyledTableCell align="right">Action</StyledTableCell>
              <StyledTableCell align="right">Delete</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movies?.map((row) => (
              <StyledTableRow key={row.name}>
                <StyledTableCell component="th" scope="row">
                  {row.name}
                </StyledTableCell>
                <StyledTableCell align="right">{row.duration}</StyledTableCell>
                <StyledTableCell align="right">{row.rating}</StyledTableCell>
                <StyledTableCell align="right" onClick={() => formOpen(row)}>
                  Edit
                </StyledTableCell>
                <StyledTableCell align="right" onClick={() => onDelete(row)}>
                  Delete
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={Math.ceil(movies.length / itemsPerPage)}
        page={pageNo}
        onChange={handlePagination}
        className="pagination_section"
      />

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
    </>
  );
}
