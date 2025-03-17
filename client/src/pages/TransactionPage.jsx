import React, { useState, useEffect } from 'react';

import { format } from 'date-fns';

// Components
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
  Badge,
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
} from '@mui/material';

// Icons
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import axiosInstance from '../utils/axiosInstance';

const TransactionPage = () => {
  // State
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Metrics
  const [metrics, setMetrics] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    totalPending: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    startDate: '',
    endDate: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });
      
      const response = await axiosInstance.get('/transactions', { params });
      
      setTransactions(response.data.transactions);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      });
      setMetrics(response.data.metrics);
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({
      ...prev,
      page: 1 // Reset to first page when applying filters
    }));
    fetchTransactions();
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      type: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    fetchTransactions();
    setShowFilters(false);
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Open edit dialog
  const openEditDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTransaction(null);
  };

  // Update transaction status
  const updateTransactionStatus = async () => {
    try {
      setLoading(true);
      
      await axiosInstance.patch(`/transactions/${selectedTransaction.id}/status`, {
        status: newStatus
      });
      
      // Update the transaction in the local state
      setTransactions(prev => 
        prev.map(t => 
          t.id === selectedTransaction.id 
            ? { ...t, status: newStatus } 
            : t
        )
      );
      
      handleCloseDialog();
      fetchTransactions(); // Refresh to get updated metrics
      
    } catch (err) {
      console.error('Error updating transaction status:', err);
      setError('Failed to update transaction status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export transactions data
  const exportTransactions = async () => {
    try {
      const params = { ...filters, format: 'csv' };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });
      
      const response = await axiosInstance.get('/transactions/export', { 
        params,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      console.error('Error exporting transactions:', err);
      setError('Failed to export transactions. Please try again.');
    }
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [pagination.page]); // Refetch when page changes

  return (
    <div className="transaction-page">
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Earnings
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(metrics.totalEarnings)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h5" component="div">
                {metrics.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Amount
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(metrics.totalPending)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
        
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={exportTransactions}
        >
          Export Data
        </Button>
      </Box>

      {showFilters && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
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
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  label="Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="RIDE_PAYMENT">Ride Payment</MenuItem>
                  <MenuItem value="BONUS">Bonus</MenuItem>
                  <MenuItem value="FINE">Fine</MenuItem>
                  <MenuItem value="REFUND">Refund</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={3}>
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
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Transactions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rider Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && pagination.page === 1 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.user.name}</TableCell>
                  <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>
                    {transaction.type === 'RIDE_PAYMENT' && 'Ride Payment'}
                    {transaction.type === 'BONUS' && 'Bonus'}
                    {transaction.type === 'FINE' && 'Fine'}
                    {transaction.type === 'REFUND' && 'Refund'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.status} 
                      color={getStatusColor(transaction.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => openEditDialog(transaction)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination 
          count={pagination.totalPages} 
          page={pagination.page}
          onChange={handlePageChange}
          color="primary"
          disabled={loading}
        />
      </Box>

      {/* Edit Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Update Transaction Status</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ minWidth: 400, pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography><strong>ID:</strong> {selectedTransaction.id}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Rider:</strong> {selectedTransaction.user.name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Amount:</strong> {formatCurrency(selectedTransaction.amount)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Type:</strong> {selectedTransaction.type}</Typography>
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
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="FAILED">Failed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={updateTransactionStatus} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TransactionPage;