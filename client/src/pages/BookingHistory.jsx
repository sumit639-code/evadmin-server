import React, { useState, useEffect } from "react";
import {
  format,
  parseISO,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";


// MUI Components
import {
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Grid,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  CircularProgress,
  Divider,
  Tooltip,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
} from "@mui/material";

// Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ElectricScooterIcon from "@mui/icons-material/ElectricScooter";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DirectionsIcon from "@mui/icons-material/Directions";
import PersonIcon from "@mui/icons-material/Person";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import axiosInstance from "../utils/axiosInstance";

const BookingHistoryPage = () => {
  // State
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [viewMode, setViewMode] = useState(0); // 0 = List, 1 = Stats
  const [viewDetails, setViewDetails] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalBookings: 0,
    statusCounts: { COMPLETED: 0, IN_PROGRESS: 0, CANCELLED: 0 },
    topScooters: [],
    averageDurationHours: 0,
    completedCount: 0,
    cancellationRate: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    scooterId: "",
    userId: "",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "") {
          delete params[key];
        }
      });

      const response = await axiosInstance.get("/bookings", { params });

      // Safely set data with null checks
      if (response.data && response.data.bookings) {
        setBookings(response.data.bookings);
      } else {
        setBookings([]);
      }

      if (response.data && response.data.pagination) {
        setPagination({
          ...pagination,
          total: response.data.pagination.total || 0,
          totalPages: response.data.pagination.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
      // Set default empty values on error
      setBookings([]);
      setPagination({
        ...pagination,
        total: 0,
        totalPages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch booking statistics
  const fetchBookingStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };

      const response = await axiosInstance.get("/bookings/stats", { params });

      if (response.data) {
        setStats({
          totalBookings: response.data.totalBookings || 0,
          statusCounts: response.data.statusCounts || {
            COMPLETED: 0,
            IN_PROGRESS: 0,
            CANCELLED: 0,
          },
          topScooters: response.data.topScooters || [],
          averageDurationHours: response.data.averageDurationHours || 0,
          completedCount: response.data.completedCount || 0,
          cancellationRate: response.data.cancellationRate || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching booking stats:", err);
      setError("Failed to load booking statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination((prev) => ({
      ...prev,
      page: 1, // Reset to first page when applying filters
    }));

    if (viewMode === 0) {
      fetchBookings();
    } else {
      fetchBookingStats();
    }

    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
      scooterId: "",
      userId: "",
    });

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    if (viewMode === 0) {
      fetchBookings();
    } else {
      fetchBookingStats();
    }

    setShowFilters(false);
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Open edit dialog
  const openEditDialog = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setOpenDialog(true);
  };

  // Open view details dialog
  const openViewDialog = (booking) => {
    setSelectedBooking(booking);
    setViewDetails(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
  };

  // Close view details dialog
  const handleCloseViewDialog = () => {
    setViewDetails(false);
    setSelectedBooking(null);
  };

  // Update booking status
  const updateBookingStatus = async () => {
    if (!selectedBooking || !selectedBooking.id) {
      setError("Booking not found. Please try again.");
      handleCloseDialog();
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.put(`/bookings/${selectedBooking.id}/status`, {
        status: newStatus,
      });

      // Update the booking in the local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id ? { ...b, status: newStatus } : b
        )
      );

      handleCloseDialog();
      fetchBookings(); // Refresh to get updated data
    } catch (err) {
      console.error("Error updating booking status:", err);
      setError("Failed to update booking status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Export bookings data
  const exportBookings = async (format = "csv") => {
    try {
      const params = { ...filters, format };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "") {
          delete params[key];
        }
      });

      const response = await axiosInstance.get("/bookings/export", {
        params,
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const dateStr = format(new Date(), "yyyy-MM-dd");
      link.setAttribute("download", `bookings-${dateStr}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error exporting bookings:", err);
      setError("Failed to export bookings. Please try again.");
    }
  };

  // Handle view mode change
  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  // Get status chip color
  const getStatusColor = (status) => {
    if (!status) return "default";

    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "primary";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    // Ensure amount is a number and not undefined/null
    const safeAmount = typeof amount === "number" ? amount : 0;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(safeAmount);
  };

  // Format duration in a readable format
  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";

    try {
      const start =
        typeof startTime === "string"
          ? parseISO(startTime)
          : new Date(startTime);
      const end =
        typeof endTime === "string" ? parseISO(endTime) : new Date(endTime);

      const hours = differenceInHours(end, start);
      const minutes = differenceInMinutes(end, start) % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    } catch (error) {
      console.error("Error formatting duration:", error);
      return "N/A";
    }
  };

  // Calculate total revenue from transactions
  const calculateTotalRevenue = (transactions) => {
    if (
      !transactions ||
      !Array.isArray(transactions) ||
      transactions.length === 0
    ) {
      return 0;
    }

    return transactions.reduce((total, t) => {
      // Only count completed transactions
      if (t.type === "RIDE_PAYMENT" && t.status === "COMPLETED") {
        return total + (t.amount || 0);
      }
      return total;
    }, 0);
  };

  // Add an error boundary wrapper to catch issues
  useEffect(() => {
    // Add error event listener for uncaught errors
    const handleError = (event) => {
      console.error("Global error caught:", event.error);
      setError("An unexpected error occurred. Please try refreshing the page.");
      setLoading(false);
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    if (viewMode === 0) {
      fetchBookings();
    } else {
      fetchBookingStats();
    }
  }, [viewMode, pagination.page]); // Refetch when view mode or page changes

  return (
    <div className="booking-history-page">
      <Typography variant="h4" gutterBottom>
        Booking History
      </Typography>

      {/* Tabs for switching between List and Stats views */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          aria-label="booking history view mode"
        >
          <Tab label="Booking List" />
          <Tab label="Statistics" />
        </Tabs>
      </Box>

      {/* Filters and Actions */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>

        {/* <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => exportBookings("csv")}
        >
          Export Data
        </Button> */}
      </Box>

      {/* Filter Section */}
      {showFilters && (
        <Box sx={{ mb: 3, p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={viewMode === 0 ? 2 : 3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={viewMode === 0 ? 3 : 3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={viewMode === 0 ? 3 : 3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            {viewMode === 0 && (
              <>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Scooter ID"
                    name="scooterId"
                    value={filters.scooterId}
                    onChange={handleFilterChange}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="User ID"
                    name="userId"
                    value={filters.userId}
                    onChange={handleFilterChange}
                  />
                </Grid>
              </>
            )}
          </Grid>
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button variant="outlined" onClick={resetFilters}>
              Reset
            </Button>
            <Button variant="contained" onClick={applyFilters}>
              Apply Filters
            </Button>
          </Box>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* View: Booking List */}
      {viewMode === 0 && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Bookings
                  </Typography>
                  <Typography variant="h5" component="div">
                    {pagination.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Completed Rides
                  </Typography>
                  <Typography variant="h5" component="div" color="success.main">
                    {bookings.filter((b) => b.status === "COMPLETED").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Rides
                  </Typography>
                  <Typography variant="h5" component="div" color="primary.main">
                    {bookings.filter((b) => b.status === "IN_PROGRESS").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Cancelled Rides
                  </Typography>
                  <Typography variant="h5" component="div" color="error.main">
                    {bookings.filter((b) => b.status === "CANCELLED").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Bookings Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Scooter</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : !bookings || bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking?.id || `row-${Math.random()}`}>
                      <TableCell>
                        {booking?.id?.substring(0, 8) || "N/A"}
                      </TableCell>
                      <TableCell>
                        {booking?.user?.name || "Unknown"}
                        <Typography
                          variant="caption"
                          display="block"
                          color="textSecondary"
                        >
                          {booking?.user?.email || "No email"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {booking?.scooter?.model || "Unknown"}
                        <Typography
                          variant="caption"
                          display="block"
                          color="textSecondary"
                        >
                          ID: {booking?.scooter?.scooterId || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {booking?.startTime
                          ? format(
                              new Date(booking.startTime),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {booking?.endTime
                          ? format(
                              new Date(booking.endTime),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "In Progress"}
                      </TableCell>
                      <TableCell>
                        {booking?.startTime && booking?.endTime
                          ? formatDuration(booking.startTime, booking.endTime)
                          : booking?.duration || "N/A"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          calculateTotalRevenue(booking?.transactions)
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking?.status || "Unknown"}
                          color={getStatusColor(booking?.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            color="primary"
                            onClick={() => openViewDialog(booking)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Status">
                          <IconButton
                            color="secondary"
                            onClick={() => openEditDialog(booking)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              disabled={loading}
            />
          </Box>
        </>
      )}

      {/* View: Statistics */}
      {viewMode === 1 && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Bookings
                  </Typography>
                  <Typography variant="h5" component="div">
                    {stats.totalBookings}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Avg. Duration
                  </Typography>
                  <Typography variant="h5" component="div">
                    {stats.averageDurationHours.toFixed(1)} hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Typography variant="h5" component="div" color="success.main">
                    {stats.totalBookings > 0
                      ? `${(
                          (stats.completedCount / stats.totalBookings) *
                          100
                        ).toFixed(1)}%`
                      : "0%"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Cancellation Rate
                  </Typography>
                  <Typography variant="h5" component="div" color="error.main">
                    {stats.cancellationRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Stats Details */}
          <Grid container spacing={3}>
            {/* Booking Status Breakdown */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Booking Status Breakdown
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Status</TableCell>
                          <TableCell>Count</TableCell>
                          <TableCell>Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                              Completed
                            </Box>
                          </TableCell>
                          <TableCell>{stats.statusCounts.COMPLETED}</TableCell>
                          <TableCell>
                            {stats.totalBookings > 0
                              ? `${(
                                  (stats.statusCounts.COMPLETED /
                                    stats.totalBookings) *
                                  100
                                ).toFixed(1)}%`
                              : "0%"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                              In Progress
                            </Box>
                          </TableCell>
                          <TableCell>
                            {stats.statusCounts.IN_PROGRESS}
                          </TableCell>
                          <TableCell>
                            {stats.totalBookings > 0
                              ? `${(
                                  (stats.statusCounts.IN_PROGRESS /
                                    stats.totalBookings) *
                                  100
                                ).toFixed(1)}%`
                              : "0%"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <CancelIcon color="error" sx={{ mr: 1 }} />
                              Cancelled
                            </Box>
                          </TableCell>
                          <TableCell>{stats.statusCounts.CANCELLED}</TableCell>
                          <TableCell>
                            {stats.totalBookings > 0
                              ? `${(
                                  (stats.statusCounts.CANCELLED /
                                    stats.totalBookings) *
                                  100
                                ).toFixed(1)}%`
                              : "0%"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Scooters */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Most Popular Scooters
                  </Typography>
                  {stats.topScooters.length === 0 ? (
                    <Typography color="textSecondary">
                      No scooter data available
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Scooter ID</TableCell>
                            <TableCell>Model</TableCell>
                            <TableCell>Total Bookings</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.topScooters.map((scooter) => (
                            <TableRow key={scooter.id}>
                              <TableCell>{scooter.scooterId}</TableCell>
                              <TableCell>{scooter.model}</TableCell>
                              <TableCell>{scooter.bookingCount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Edit Booking Status Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Update Booking Status</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ minWidth: 400, pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>
                    <strong>ID:</strong> {selectedBooking.id || "Unknown"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>User:</strong>{" "}
                    {selectedBooking.user?.name || "Unknown"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>Scooter:</strong>{" "}
                    {selectedBooking.scooter?.model || "Unknown"} (
                    {selectedBooking.scooter?.scooterId || "N/A"})
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>Start Time:</strong>{" "}
                    {selectedBooking.startTime
                      ? format(
                          new Date(selectedBooking.startTime),
                          "dd/MM/yyyy HH:mm"
                        )
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="COMPLETED">Completed</MenuItem>
                      <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={updateBookingStatus}
            variant="contained"
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Booking Details Dialog */}
      <Dialog
        open={viewDetails}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Booking Details
          <IconButton
            aria-label="close"
            onClick={handleCloseViewDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "gray",
            }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedBooking && (
            <Grid container spacing={3}>
              {/* Booking Info */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <ReceiptIcon sx={{ mr: 1 }} /> Booking Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Booking ID
                      </Typography>
                      <Typography variant="body1">
                        {selectedBooking.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={selectedBooking.status || "Unknown"}
                        color={getStatusColor(selectedBooking.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Start Time
                      </Typography>
                      <Typography variant="body1">
                        {selectedBooking.startTime
                          ? format(
                              new Date(selectedBooking.startTime),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        End Time
                      </Typography>
                      <Typography variant="body1">
                        {selectedBooking.endTime
                          ? format(
                              new Date(selectedBooking.endTime),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "In Progress"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body1">
                        {selectedBooking.startTime && selectedBooking.endTime
                          ? formatDuration(
                              selectedBooking.startTime,
                              selectedBooking.endTime
                            )
                          : selectedBooking.duration || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Created At
                      </Typography>
                      <Typography variant="body1">
                        {selectedBooking.createdAt
                          ? format(
                              new Date(selectedBooking.createdAt),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* User Info */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: "100%" }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <PersonIcon sx={{ mr: 1 }} /> User Information
                  </Typography>
                  {selectedBooking.user ? (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {selectedBooking.user.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {selectedBooking.user.email}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {selectedBooking.user.phone}
                      </Typography>
                    </>
                  ) : (
                    <Typography color="text.secondary">
                      User information not available
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {/* Scooter Info */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: "100%" }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <ElectricScooterIcon sx={{ mr: 1 }} /> Scooter Information
                  </Typography>
                  {selectedBooking.scooter ? (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Scooter ID
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {selectedBooking.scooter.scooterId}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Model
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {selectedBooking.scooter.model}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Pricing
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedBooking.scooter.pricePerHour)} /
                        hour
                        {selectedBooking.scooter.pricePerDay && (
                          <span>
                            {" "}
                            or{" "}
                            {formatCurrency(
                              selectedBooking.scooter.pricePerDay
                            )}{" "}
                            / day
                          </span>
                        )}
                      </Typography>
                    </>
                  ) : (
                    <Typography color="text.secondary">
                      Scooter information not available
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {/* Payment Info */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <LocalAtmIcon sx={{ mr: 1 }} /> Payment Information
                  </Typography>
                  {selectedBooking.transactions &&
                  selectedBooking.transactions.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Transaction ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedBooking.transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                {transaction.id.substring(0, 8)}
                              </TableCell>
                              <TableCell>
                                {transaction.date
                                  ? format(
                                      new Date(transaction.date),
                                      "dd/MM/yyyy HH:mm"
                                    )
                                  : "N/A"}
                              </TableCell>
                              <TableCell>{transaction.type}</TableCell>
                              <TableCell>
                                {formatCurrency(transaction.amount)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={transaction.status || "Unknown"}
                                  color={getStatusColor(transaction.status)}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableHead>
                          <TableRow>
                            <TableCell colSpan={3} align="right">
                              <Typography variant="subtitle2">Total</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {formatCurrency(
                                  calculateTotalRevenue(
                                    selectedBooking.transactions
                                  )
                                )}
                              </Typography>
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableHead>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary">
                      No payment information available
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              handleCloseViewDialog();
              openEditDialog(selectedBooking);
            }}
            startIcon={<EditIcon />}
          >
            Edit Status
          </Button>
          <Button variant="contained" onClick={handleCloseViewDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BookingHistoryPage;
