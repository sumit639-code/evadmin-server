import React, { useState, useEffect } from 'react';

import { format, subDays, subMonths } from 'date-fns';

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
  Grid,
  Box,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Pagination,
  CircularProgress,
  Divider,
} from '@mui/material';

// Charts
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
 } from 'recharts';

// Icons
import DownloadIcon from '@mui/icons-material/Download';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TodayIcon from '@mui/icons-material/Today';
import WeekendIcon from '@mui/icons-material/Weekend';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import axiosInstance from '../utils/axiosInstance';

const RevenuePage = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [periodFilter, setPeriodFilter] = useState('week');
  const [chartView, setChartView] = useState('timeline');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [overviewData, setOverviewData] = useState({
    summary: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
    },
    dailyStats: [],
    revenueByType: {}
  });
  
  const [detailedData, setDetailedData] = useState({
    transactions: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    },
    summary: {
      byType: {},
      grandTotal: 0
    }
  });
  
  // Filters for detailed view
  const [detailedFilters, setDetailedFilters] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    type: ''
  });
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Fetch overview data
  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/revenue/overview', { 
        params: { period: periodFilter } 
      });
      
      setOverviewData(response.data);
    } catch (err) {
      console.error('Error fetching revenue overview:', err);
      setError('Failed to load revenue overview. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch detailed data
  const fetchDetailedData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...detailedFilters,
        page,
        limit: detailedData.pagination.limit
      };
      
      const response = await axiosInstance.get('/revenue/detailed', { params });
      
      setDetailedData({
        transactions: response.data.transactions,
        pagination: {
          ...response.data.pagination,
          page
        },
        summary: response.data.summary
      });
    } catch (err) {
      console.error('Error fetching detailed revenue:', err);
      setError('Failed to load revenue details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle period filter change
  const handlePeriodChange = (period) => {
    setPeriodFilter(period);
  };
  
  // Handle chart view change
  const handleChartViewChange = (view) => {
    setChartView(view);
  };
  
  // Handle detailed filters change
  const handleDetailedFilterChange = (e) => {
    const { name, value } = e.target;
    setDetailedFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply detailed filters
  const applyDetailedFilters = () => {
    fetchDetailedData(1); // Reset to first page
  };
  
  // Handle page change
  const handlePageChange = (event, newPage) => {
    fetchDetailedData(newPage);
  };
  
  // Export revenue data
  const exportRevenueData = async (format = 'csv') => {
    try {
      const params = { 
        ...detailedFilters,
        format 
      };
      
      const response = await axiosInstance.get('/revenue/export', { 
        params,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Use a date formatting library or native Date methods
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // Format: yyyy-MM-dd
      
      link.setAttribute('download', `revenue-data-${dateStr}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      console.error('Error exporting revenue data:', err);
      setError('Failed to export revenue data. Please try again.');
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
  
  // Format percentage change
  const formatPercentChange = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  // Prepare chart data
  const prepareTimelineData = () => {
    if (!overviewData.dailyStats || overviewData.dailyStats.length === 0) {
      return [];
    }
    
    return overviewData.dailyStats.map(stat => ({
      date: format(new Date(stat.date), 'dd/MM'),
      Revenue: stat.totalRevenue,
      Expenses: stat.expenses,
      Profit: stat.totalRevenue - stat.expenses
    }));
  };
  
  const prepareRevenueByTypeData = () => {
    if (!overviewData.revenueByType) {
      return [];
    }
    
    return Object.entries(overviewData.revenueByType).map(([type, amount]) => ({
      name: type === 'RIDE_PAYMENT' ? 'Ride Payments' : 
            type === 'BONUS' ? 'Bonuses' :
            type === 'FINE' ? 'Fines' :
            type === 'REFUND' ? 'Refunds' : type,
      value: amount
    }));
  };
  
  // Initial fetch
  useEffect(() => {
    if (activeTab === 0) {
      fetchOverviewData();
    } else {
      fetchDetailedData();
    }
  }, [activeTab, periodFilter]);
  
  return (
    <div className="revenue-page">
      <Typography variant="h4" gutterBottom>
        Revenue & Analytics
      </Typography>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Revenue Overview" />
          <Tab label="Detailed Transactions" />
        </Tabs>
      </Box>
      
      {/* Tab 1: Revenue Overview */}
      {activeTab === 0 && (
        <>
          {/* Period Filter Buttons */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Button 
                variant={periodFilter === 'day' ? 'contained' : 'outlined'} 
                startIcon={<TodayIcon />}
                onClick={() => handlePeriodChange('day')}
                sx={{ mr: 1 }}
              >
                Today
              </Button>
              <Button 
                variant={periodFilter === 'week' ? 'contained' : 'outlined'} 
                startIcon={<WeekendIcon />}
                onClick={() => handlePeriodChange('week')}
                sx={{ mr: 1 }}
              >
                This Week
              </Button>
              <Button 
                variant={periodFilter === 'month' ? 'contained' : 'outlined'} 
                startIcon={<CalendarViewMonthIcon />}
                onClick={() => handlePeriodChange('month')}
                sx={{ mr: 1 }}
              >
                This Month
              </Button>
              <Button 
                variant={periodFilter === 'year' ? 'contained' : 'outlined'} 
                startIcon={<DateRangeIcon />}
                onClick={() => handlePeriodChange('year')}
              >
                This Year
              </Button>
            </Box>
            
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={() => exportRevenueData()}
            >
              Export Data
            </Button>
          </Box>
          
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatCurrency(overviewData.summary.totalRevenue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatCurrency(overviewData.summary.totalExpenses)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Net Profit
                  </Typography>
                  <Typography variant="h5" component="div" color={overviewData.summary.netProfit >= 0 ? 'success.main' : 'error.main'}>
                    {formatCurrency(overviewData.summary.netProfit)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Chart View Buttons */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Chart View:
            </Typography>
            <Button 
              variant={chartView === 'timeline' ? 'contained' : 'outlined'} 
              size="small"
              startIcon={<TimelineIcon />}
              onClick={() => handleChartViewChange('timeline')}
              sx={{ mr: 1 }}
            >
              Timeline
            </Button>
            <Button 
              variant={chartView === 'breakdown' ? 'contained' : 'outlined'} 
              size="small"
              startIcon={<PieChartIcon />}
              onClick={() => handleChartViewChange('breakdown')}
            >
              Revenue Breakdown
            </Button>
          </Box>
          
          {/* Charts */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <>
                  {chartView === 'timeline' ? (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Revenue Timeline
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                          data={prepareTimelineData()}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                          <Line type="monotone" dataKey="Revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="Expenses" stroke="#ff7300" />
                          <Line type="monotone" dataKey="Profit" stroke="#82ca9d" />
                        </LineChart>
                      </ResponsiveContainer>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Revenue by Transaction Type
                      </Typography>
                      <Grid container>
                        <Grid item xs={12} md={6}>
                          <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                              <Pie
                                data={prepareRevenueByTypeData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {prepareRevenueByTypeData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ pt: 4 }}>
                            <Typography variant="h6" gutterBottom>
                              Breakdown
                            </Typography>
                            <TableContainer component={Paper} sx={{ maxHeight: 340 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Transaction Type</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell align="right">Percentage</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {prepareRevenueByTypeData().map((entry, index) => (
                                    <TableRow key={entry.name}>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <div style={{ 
                                            width: 12, 
                                            height: 12, 
                                            backgroundColor: COLORS[index % COLORS.length],
                                            marginRight: 8,
                                            borderRadius: '50%'
                                          }} />
                                          {entry.name}
                                        </Box>
                                      </TableCell>
                                      <TableCell align="right">{formatCurrency(entry.value)}</TableCell>
                                      <TableCell align="right">
                                        {(entry.value / overviewData.summary.totalRevenue * 100).toFixed(1)}%
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Key Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      New Users
                    </Typography>
                    <Typography variant="h5">
                      {overviewData.dailyStats.reduce((sum, stat) => sum + stat.newUsers, 0)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Active Users
                    </Typography>
                    <Typography variant="h5">
                      {overviewData.dailyStats.reduce((sum, stat) => sum + stat.activeUsers, 0)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Completed Rides
                    </Typography>
                    <Typography variant="h5">
                      {overviewData.dailyStats.reduce((sum, stat) => sum + stat.completedRides, 0)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Average Revenue Per Ride
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(
                        overviewData.summary.totalRevenue / 
                        Math.max(1, overviewData.dailyStats.reduce((sum, stat) => sum + stat.completedRides, 0))
                      )}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Tab 2: Detailed Revenue */}
      {activeTab === 1 && (
        <>
          {/* Filter Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    name="startDate"
                    value={detailedFilters.startDate}
                    onChange={handleDetailedFilterChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    name="endDate"
                    value={detailedFilters.endDate}
                    onChange={handleDetailedFilterChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Transaction Type</InputLabel>
                    <Select
                      name="type"
                      value={detailedFilters.type}
                      onChange={handleDetailedFilterChange}
                      label="Transaction Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="RIDE_PAYMENT">Ride Payments</MenuItem>
                      <MenuItem value="BONUS">Bonuses</MenuItem>
                      <MenuItem value="FINE">Fines</MenuItem>
                      <MenuItem value="REFUND">Refunds</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="contained" 
                  onClick={applyDetailedFilters}
                >
                  Apply Filters
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                  onClick={() => exportRevenueData()}
                >
                  Export Filtered Data
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue (filtered)
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatCurrency(detailedData.summary.grandTotal)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Transaction Count
                  </Typography>
                  <Typography variant="h5" component="div">
                    {detailedData.pagination.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Average Transaction Value
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatCurrency(
                      detailedData.pagination.total > 0
                        ? detailedData.summary.grandTotal / detailedData.pagination.total
                        : 0
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Transactions Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Rental Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : detailedData.transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  detailedData.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell>{transaction.user.name}</TableCell>
                      <TableCell>
                        {transaction.type === 'RIDE_PAYMENT' && 'Ride Payment'}
                        {transaction.type === 'BONUS' && 'Bonus'}
                        {transaction.type === 'FINE' && 'Fine'}
                        {transaction.type === 'REFUND' && 'Refund'}
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.status} 
                          color={
                            transaction.status === 'COMPLETED' ? 'success' :
                            transaction.status === 'PENDING' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {transaction.rental ? (
                          <>
                            <Typography variant="caption" display="block">
                              Scooter: {transaction.rental.scooter?.model || 'N/A'} 
                              {transaction.rental.scooter?.scooterId ? ` (${transaction.rental.scooter.scooterId})` : ''}
                            </Typography>
                            {transaction.rental.startTime && (
                              <Typography variant="caption" display="block">
                                Started: {format(new Date(transaction.rental.startTime), 'dd/MM HH:mm')}
                              </Typography>
                            )}
                            {transaction.rental.endTime && (
                              <Typography variant="caption" display="block">
                                Ended: {format(new Date(transaction.rental.endTime), 'dd/MM HH:mm')}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="caption">No rental data</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination 
              count={detailedData.pagination.totalPages} 
              page={detailedData.pagination.page}
              onChange={handlePageChange}
              color="primary"
              disabled={loading}
            />
          </Box>
        </>
      )}
    </div>
  );
};

export default RevenuePage;