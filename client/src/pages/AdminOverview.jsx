// import React from "react";
// import TopData from "../components/overview/TopData";
// import ActiveUsers from "../components/overview/ActiveUsers";
// import RevenueExpenses from "../components/overview/RevenueExpences";
// import ScooterStatus from "../components/overview/ScooterStatus";
// import Map from "../components/overview/Map";
// import TimeFrame from "../components/common/TimeFrame";

// const AdminOverview = () => {
//   return (
//     <div>
//       <div className="flex mb-4">
//         <div>
//           <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
//         </div>
//         <div className="absolute right-[27px]">
//           <TimeFrame />
//         </div>
//       </div>
//       <TopData />
//       <div className="flex gap-2 mt-4">
//         <div className="flex-1 border border-gray-500 rounded-lg">
//           <ActiveUsers />
//         </div>
//         <div className="flex-1 border border-gray-500 rounded-lg">
//           <RevenueExpenses />
//         </div>
//       </div>

//       <div className="flex gap-2 mt-4">
//         <div className="flex-1 border border-gray-500 rounded-lg p-3">
//           <ScooterStatus />
//         </div>
//         <div className="flex-1 border border-gray-500 rounded-lg p-3">
//           <Map />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminOverview;



// import React, { useState, useEffect } from 'react';

// import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// // Material UI imports
// import {
//   Box,
//   Card,
//   CardContent,
//   CardHeader,
//   Container,
//   Grid,
//   Typography,
//   Button,
//   ButtonGroup,
//   Alert,
//   CircularProgress,
//   Divider,
//   Paper,
//   Stack,
//   useTheme
// } from '@mui/material';

// // Material UI icons
// import {
//   People as PeopleIcon,
//   ElectricScooter as ScooterIcon,
//   DirectionsBike as RideIcon,
//   AttachMoney as MoneyIcon,
//   Star as StarIcon,
//   Warning as WarningIcon,
//   Build as BuildIcon,
//   Timelapse as TimelapseIcon,
//   Message as MessageIcon
// } from '@mui/icons-material';
// import axiosInstance from '../utils/axiosInstance';

// const AdminDashboard = () => {
//   const theme = useTheme();
  
//   // State for all dashboard data
//   const [dashboardData, setDashboardData] = useState({
//     stats: {
//       totalUsers: 0,
//       totalScooters: 0,
//       totalRentals: 0,
//       totalRevenue: 0,
//       activeRentals: 0,
//       pendingUsers: 0,
//       scootersInMaintenance: 0,
//       pendingTransactions: 0
//     },
//     revenueData: [],
//     scooterStatusData: [],
//     rentalData: [],
//     userActivityData: []
//   });
  
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month', 'year'
  
//   // Calculate date range based on selected time range
//   const getDateRange = () => {
//     const endDate = new Date();
//     let startDate;
    
//     switch(timeRange) {
//       case 'day':
//         startDate = subDays(endDate, 1);
//         break;
//       case 'week':
//         startDate = startOfWeek(endDate);
//         break;
//       case 'month':
//         startDate = startOfMonth(endDate);
//         break;
//       case 'year':
//         startDate = startOfYear(endDate);
//         break;
//       default:
//         startDate = subDays(endDate, 7);
//     }
    
//     return {
//       startDate: format(startDate, 'yyyy-MM-dd'),
//       endDate: format(endDate, 'yyyy-MM-dd')
//     };
//   };
  
//   // Fetch dashboard data from backend
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       setLoading(true);
//       setError(null);
      
//       try {
//         const { startDate, endDate } = getDateRange();
        
//         // Fetch all required data in parallel
//         const [
//           statsResponse,
//           revenueResponse,
//           scooterStatusResponse, 
//           rentalResponse,
//           userActivityResponse
//         ] = await Promise.all([
//           axiosInstance.get('/admin/dashboard/stats'),
//           axiosInstance.get(`/admin/dashboard/revenue/summary?startDate=${startDate}&endDate=${endDate}`),
//           axiosInstance.get('/admin/dashboard/scooter/status-summary'),
//           axiosInstance.get(`/admin/dashboard/rental/summary?startDate=${startDate}&endDate=${endDate}`),
//           axiosInstance.get(`/admin/dashboard/user/activity?startDate=${startDate}&endDate=${endDate}`)
//         ]);
        
//         // Combine all data
//         setDashboardData({
//           stats: statsResponse.data,
//           revenueData: revenueResponse.data,
//           scooterStatusData: scooterStatusResponse.data.map(item => ({
//             name: item.status,
//             value: item.count
//           })),
//           rentalData: rentalResponse.data,
//           userActivityData: userActivityResponse.data
//         });
//       } catch (err) {
//         console.error('Error fetching dashboard data:', err);
//         setError('Failed to load dashboard data. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchDashboardData();
//   }, [timeRange]);
  
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
//   // Format currency
//   const formatCurrency = (amount) => {
//     return `₹${amount.toLocaleString()}`;
//   };
  
//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//         <Typography variant="h6" sx={{ ml: 2 }}>
//           Loading dashboard data...
//         </Typography>
//       </Box>
//     );
//   }
  
//   return (
//     <Container maxWidth="xl" sx={{ mt: 3, mb: 8 }}>
//       <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
//         Admin Dashboard
//       </Typography>
      
//       {/* Time Range Selector */}
//       <Box sx={{ mb: 4 }}>
//         <ButtonGroup variant="outlined" aria-label="time range selector">
//           <Button 
//             onClick={() => setTimeRange('day')}
//             variant={timeRange === 'day' ? 'contained' : 'outlined'}
//           >
//             Today
//           </Button>
//           <Button 
//             onClick={() => setTimeRange('week')}
//             variant={timeRange === 'week' ? 'contained' : 'outlined'}
//           >
//             This Week
//           </Button>
//           <Button 
//             onClick={() => setTimeRange('month')}
//             variant={timeRange === 'month' ? 'contained' : 'outlined'}
//           >
//             This Month
//           </Button>
//           <Button 
//             onClick={() => setTimeRange('year')}
//             variant={timeRange === 'year' ? 'contained' : 'outlined'}
//           >
//             This Year
//           </Button>
//         </ButtonGroup>
//       </Box>
      
//       {/* Stats Overview Cards */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Stack direction="row" justifyContent="space-between" alignItems="center">
//                 <Box>
//                   <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
//                     Total Revenue
//                   </Typography>
//                   <Typography variant="h4" component="div" fontWeight="bold">
//                     {formatCurrency(dashboardData.stats.totalRevenue)}
//                   </Typography>
//                   <Typography variant="caption" color="success.main">
//                     +12% from last month
//                   </Typography>
//                 </Box>
//                 <MoneyIcon color="primary" fontSize="large" />
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>
        
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Stack direction="row" justifyContent="space-between" alignItems="center">
//                 <Box>
//                   <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
//                     Total Users
//                   </Typography>
//                   <Typography variant="h4" component="div" fontWeight="bold">
//                     {dashboardData.stats.totalUsers}
//                   </Typography>
//                   <Typography variant="caption" color="success.main">
//                     +8% from last month
//                   </Typography>
//                 </Box>
//                 <PeopleIcon color="primary" fontSize="large" />
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>
        
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Stack direction="row" justifyContent="space-between" alignItems="center">
//                 <Box>
//                   <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
//                     Total Scooters
//                   </Typography>
//                   <Typography variant="h4" component="div" fontWeight="bold">
//                     {dashboardData.stats.totalScooters}
//                   </Typography>
//                   <Typography variant="caption" color="success.main">
//                     +5% from last month
//                   </Typography>
//                 </Box>
//                 <ScooterIcon color="primary" fontSize="large" />
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>
        
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Stack direction="row" justifyContent="space-between" alignItems="center">
//                 <Box>
//                   <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
//                     Total Rentals
//                   </Typography>
//                   <Typography variant="h4" component="div" fontWeight="bold">
//                     {dashboardData.stats.totalRentals}
//                   </Typography>
//                   <Typography variant="caption" color="success.main">
//                     +15% from last month
//                   </Typography>
//                 </Box>
//                 <RideIcon color="primary" fontSize="large" />
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
      
//       {/* Attention Required Section */}
//       <Typography variant="h5" component="h2" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
//         Attention Required
//       </Typography>
      
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} md={3}>
//           <Paper 
//             elevation={1} 
//             sx={{ 
//               p: 2, 
//               bgcolor: 'warning.light', 
//               borderRadius: 2,
//               display: 'flex',
//               flexDirection: 'column'
//             }}
//           >
//             <Stack direction="row" justifyContent="space-between" alignItems="center">
//               <Typography variant="subtitle2" fontWeight="medium">
//                 Active Rentals
//               </Typography>
//               <RideIcon color="warning" />
//             </Stack>
//             <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1 }}>
//               {dashboardData.stats.activeRentals}
//             </Typography>
//             <Typography variant="caption" color="text.secondary">
//               Currently on the road
//             </Typography>
//           </Paper>
//         </Grid>
        
//         <Grid item xs={12} sm={6} md={3}>
//           <Paper 
//             elevation={1} 
//             sx={{ 
//               p: 2, 
//               bgcolor: 'info.light', 
//               borderRadius: 2,
//               display: 'flex',
//               flexDirection: 'column'
//             }}
//           >
//             <Stack direction="row" justifyContent="space-between" alignItems="center">
//               <Typography variant="subtitle2" fontWeight="medium">
//                 Pending Users
//               </Typography>
//               <PeopleIcon color="info" />
//             </Stack>
//             <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1 }}>
//               {dashboardData.stats.pendingUsers}
//             </Typography>
//             <Typography variant="caption" color="text.secondary">
//               Awaiting verification
//             </Typography>
//           </Paper>
//         </Grid>
        
//         <Grid item xs={12} sm={6} md={3}>
//           <Paper 
//             elevation={1} 
//             sx={{ 
//               p: 2, 
//               bgcolor: 'secondary.light', 
//               borderRadius: 2,
//               display: 'flex',
//               flexDirection: 'column'
//             }}
//           >
//             <Stack direction="row" justifyContent="space-between" alignItems="center">
//               <Typography variant="subtitle2" fontWeight="medium">
//                 Scooters in Maintenance
//               </Typography>
//               <BuildIcon color="secondary" />
//             </Stack>
//             <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1 }}>
//               {dashboardData.stats.scootersInMaintenance}
//             </Typography>
//             <Typography variant="caption" color="text.secondary">
//               Undergoing repairs
//             </Typography>
//           </Paper>
//         </Grid>
        
//         <Grid item xs={12} sm={6} md={3}>
//           <Paper 
//             elevation={1} 
//             sx={{ 
//               p: 2, 
//               bgcolor: 'error.light', 
//               borderRadius: 2,
//               display: 'flex',
//               flexDirection: 'column'
//             }}
//           >
//             <Stack direction="row" justifyContent="space-between" alignItems="center">
//               <Typography variant="subtitle2" fontWeight="medium">
//                 Pending Transactions
//               </Typography>
//               <TimelapseIcon color="error" />
//             </Stack>
//             <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1 }}>
//               {dashboardData.stats.pendingTransactions}
//             </Typography>
//             <Typography variant="caption" color="text.secondary">
//               Need to be processed
//             </Typography>
//           </Paper>
//         </Grid>
//       </Grid>
      
//       {/* Charts */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {/* Revenue Chart */}
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardHeader 
//               title="Revenue Overview" 
//               subheader="Revenue vs Expenses" 
//             />
//             <Divider />
//             <CardContent sx={{ height: 350 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={dashboardData.revenueData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="date" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => [`₹${value}`, value === 'revenue' ? 'Revenue' : 'Expenses']} />
//                   <Legend />
//                   <Line type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} strokeWidth={2} />
//                   <Line type="monotone" dataKey="expenses" stroke={theme.palette.error.main} strokeWidth={2} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Grid>
        
//         {/* Scooter Status Chart */}
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardHeader 
//               title="Scooter Status" 
//               subheader="Current status of all scooters" 
//             />
//             <Divider />
//             <CardContent sx={{ height: 350 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={dashboardData.scooterStatusData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={60}
//                     outerRadius={100}
//                     fill="#8884d8"
//                     paddingAngle={2}
//                     dataKey="value"
//                     label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                   >
//                     {dashboardData.scooterStatusData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip formatter={(value, name) => [value, name]} />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
      
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {/* Rental Overview */}
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardHeader 
//               title="Rental Overview" 
//               subheader="Completed vs Cancelled rentals" 
//             />
//             <Divider />
//             <CardContent sx={{ height: 350 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={dashboardData.rentalData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="date" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="completed" fill={theme.palette.success.main} name="Completed" />
//                   <Bar dataKey="cancelled" fill={theme.palette.error.main} name="Cancelled" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Grid>
        
//         {/* User Activity */}
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardHeader 
//               title="User Activity" 
//               subheader="New and active users" 
//             />
//             <Divider />
//             <CardContent sx={{ height: 350 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={dashboardData.userActivityData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="date" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line type="monotone" dataKey="newUsers" stroke={theme.palette.primary.main} strokeWidth={2} name="New Users" />
//                   <Line type="monotone" dataKey="activeUsers" stroke={theme.palette.warning.main} strokeWidth={2} name="Active Users" />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
      
//       {/* Quick Actions Section */}
//       <Typography variant="h5" component="h2" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
//         Quick Actions
//       </Typography>
      
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={4}>
//           <Button
//             variant="contained"
//             color="primary"
//             fullWidth
//             size="large"
//             startIcon={<PeopleIcon />}
//             onClick={() => window.location.href = '/admin/users?status=PENDING'}
//             sx={{ py: 1.5 }}
//           >
//             Verify Pending Users
//           </Button>
//         </Grid>
//         <Grid item xs={12} sm={4}>
//           <Button
//             variant="contained"
//             color="success"
//             fullWidth
//             size="large"
//             startIcon={<MoneyIcon />}
//             onClick={() => window.location.href = '/admin/transactions?status=PENDING'}
//             sx={{ py: 1.5 }}
//           >
//             Process Transactions
//           </Button>
//         </Grid>
//         <Grid item xs={12} sm={4}>
//           <Button
//             variant="contained"
//             color="secondary"
//             fullWidth
//             size="large"
//             startIcon={<MessageIcon />}
//             onClick={() => window.location.href = '/admin/chats?adminApproved=false'}
//             sx={{ py: 1.5 }}
//           >
//             Review Chat Reports
//           </Button>
//         </Grid>
//       </Grid>
      
//       {/* Error Display */}
//       {error && (
//         <Alert 
//           severity="error" 
//           action={
//             <Button color="inherit" size="small" onClick={() => window.location.reload()}>
//               RELOAD
//             </Button>
//           }
//           sx={{ mt: 3 }}
//         >
//           {error}
//         </Alert>
//       )}
//     </Container>
//   );
// };

// export default AdminDashboard;






















import React, { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Material UI imports
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Typography,
  Button,
  ButtonGroup,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
  Avatar,
  LinearProgress,
  IconButton
} from '@mui/material';

// Material UI icons
import {
  People as PeopleIcon,
  ElectricScooter as ScooterIcon,
  DirectionsBike as RideIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  Timelapse as TimelapseIcon,
  Message as MessageIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  FilterAlt as FilterIcon,
  KeyboardArrowDown as ArrowDownIcon,
  NotificationsActive as NotificationIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for all dashboard data
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalScooters: 0,
      totalRentals: 0,
      totalRevenue: 0,
      activeRentals: 0,
      pendingUsers: 0,
      scootersInMaintenance: 0,
      pendingTransactions: 0
    },
    revenueData: [],
    scooterStatusData: [],
    rentalData: [],
    userActivityData: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month', 'year'
  
  // Calculate date range based on selected time range
  const getDateRange = () => {
    const endDate = new Date();
    let startDate;
    
    switch(timeRange) {
      case 'day':
        startDate = subDays(endDate, 1);
        break;
      case 'week':
        startDate = startOfWeek(endDate);
        break;
      case 'month':
        startDate = startOfMonth(endDate);
        break;
      case 'year':
        startDate = startOfYear(endDate);
        break;
      default:
        startDate = subDays(endDate, 7);
    }
    
    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
  };
  
  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { startDate, endDate } = getDateRange();
      
      // Fetch all required data in parallel
      const [
        statsResponse,
        revenueResponse,
        scooterStatusResponse, 
        rentalResponse,
        userActivityResponse
      ] = await Promise.all([
        axiosInstance.get('/admin/dashboard/stats'),
        axiosInstance.get(`/admin/dashboard/revenue/summary?startDate=${startDate}&endDate=${endDate}`),
        axiosInstance.get('/admin/dashboard/scooter/status-summary'),
        axiosInstance.get(`/admin/dashboard/rental/summary?startDate=${startDate}&endDate=${endDate}`),
        axiosInstance.get(`/admin/dashboard/user/activity?startDate=${startDate}&endDate=${endDate}`)
      ]);
      
      // Combine all data
      setDashboardData({
        stats: statsResponse.data,
        revenueData: revenueResponse.data,
        scooterStatusData: scooterStatusResponse.data.map(item => ({
          name: item.status,
          value: item.count
        })),
        rentalData: rentalResponse.data,
        userActivityData: userActivityResponse.data
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);
  
  // Enhanced color palette
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ];
  
  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };
  
  // Calculate percentage change for stats
  const getPercentChange = (value, previousValue) => {
    if (!previousValue) return 0;
    return ((value - previousValue) / previousValue) * 100;
  };
  
  // Custom tooltip styles for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={`tooltip-item-${index}`}
              variant="body2"
              sx={{ 
                color: entry.color,
                fontWeight: 'medium',
                mt: 0.5
              }}
            >
              {`${entry.name}: ${entry.value}`}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 'medium' }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ bgcolor: alpha(theme.palette.primary.light, 0.05), minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ pt: 3, pb: 8 }}>
        {/* Dashboard Header */}
        <Box 
          sx={{ 
            mb: 4, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48,
                boxShadow: 2
              }}
            >
              <DashboardIcon />
            </Avatar>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight="bold"
                color="primary.dark"
              >
                Admin Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>
          </Stack>
          
          {/* Notification and Refresh Buttons */}
          <Stack direction="row" spacing={2}>
            <IconButton 
              sx={{ 
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                borderRadius: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.warning.main, 0.2),
                }
              }}
            >
              <NotificationIcon color="warning" />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardData}
              sx={{ 
                borderRadius: 2,
                mt: { xs: 2, md: 0 },
                boxShadow: 1
              }}
            >
              Refresh Data
            </Button>
          </Stack>
        </Box>
        
        {/* Time Range Selector */}
        <Paper 
          elevation={2} 
          sx={{ 
            mb: 4, 
            p: 1.5, 
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.9)
          }}
        >
          <FilterIcon color="primary" sx={{ mx: 1.5 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2 }}>
            Time Range:
          </Typography>
          <ButtonGroup variant="outlined" aria-label="time range selector">
            <Button 
              onClick={() => setTimeRange('day')}
              variant={timeRange === 'day' ? 'contained' : 'outlined'}
              sx={{ borderRadius: '4px 0 0 4px' }}
            >
              Today
            </Button>
            <Button 
              onClick={() => setTimeRange('week')}
              variant={timeRange === 'week' ? 'contained' : 'outlined'}
            >
              This Week
            </Button>
            <Button 
              onClick={() => setTimeRange('month')}
              variant={timeRange === 'month' ? 'contained' : 'outlined'}
            >
              This Month
            </Button>
            <Button 
              onClick={() => setTimeRange('year')}
              variant={timeRange === 'year' ? 'contained' : 'outlined'}
              sx={{ borderRadius: '0 4px 4px 0' }}
            >
              This Year
            </Button>
          </ButtonGroup>
        </Paper>
        
        {/* Stats Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
                      Total Revenue
                    </Typography>
                    <Typography 
                      variant="h4" 
                      component="div" 
                      fontWeight="bold"
                      color="primary.dark"
                      sx={{ my: 1 }}
                    >
                      {formatCurrency(dashboardData.stats.totalRevenue)}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
                      <Typography variant="caption" color="success.main" fontWeight="medium">
                        +12% from last month
                      </Typography>
                    </Stack>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      p: 1.5,
                      color: theme.palette.primary.main
                    }}
                  >
                    <MoneyIcon fontSize="large" />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
                      Total Users
                    </Typography>
                    <Typography 
                      variant="h4" 
                      component="div" 
                      fontWeight="bold"
                      color="primary.dark"
                      sx={{ my: 1 }}
                    >
                      {dashboardData.stats.totalUsers.toLocaleString()}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
                      <Typography variant="caption" color="success.main" fontWeight="medium">
                        +8% from last month
                      </Typography>
                    </Stack>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      p: 1.5,
                      color: theme.palette.info.main
                    }}
                  >
                    <PeopleIcon fontSize="large" />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
                      Total Scooters
                    </Typography>
                    <Typography 
                      variant="h4" 
                      component="div" 
                      fontWeight="bold"
                      color="primary.dark"
                      sx={{ my: 1 }}
                    >
                      {dashboardData.stats.totalScooters.toLocaleString()}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
                      <Typography variant="caption" color="success.main" fontWeight="medium">
                        +5% from last month
                      </Typography>
                    </Stack>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      p: 1.5,
                      color: theme.palette.success.main
                    }}
                  >
                    <ScooterIcon fontSize="large" />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
                      Total Rentals
                    </Typography>
                    <Typography 
                      variant="h4" 
                      component="div" 
                      fontWeight="bold"
                      color="primary.dark"
                      sx={{ my: 1 }}
                    >
                      {dashboardData.stats.totalRentals.toLocaleString()}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
                      <Typography variant="caption" color="success.main" fontWeight="medium">
                        +15% from last month
                      </Typography>
                    </Stack>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      p: 1.5,
                      color: theme.palette.warning.main
                    }}
                  >
                    <RideIcon fontSize="large" />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Attention Required Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            fontWeight="bold" 
            sx={{ 
              mb: 3,
              px: 1,
              py: 0.5,
              borderLeft: `4px solid ${theme.palette.warning.main}`,
              color: 'text.primary'
            }}
          >
            Attention Required
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.5)} 0%, ${alpha(theme.palette.warning.main, 0.2)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    Active Rentals
                  </Typography>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.warning.main, 0.2),
                      color: theme.palette.warning.dark
                    }}
                  >
                    <RideIcon />
                  </Avatar>
                </Stack>
                <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1.5, color: 'text.primary' }}>
                  {dashboardData.stats.activeRentals}
                </Typography>
                <Box sx={{ width: '100%', mt: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(dashboardData.stats.activeRentals / dashboardData.stats.totalScooters) * 100} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.warning.main, 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.warning.main
                      }
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Currently on the road
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.5)} 0%, ${alpha(theme.palette.info.main, 0.2)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    Pending Users
                  </Typography>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.info.main, 0.2),
                      color: theme.palette.info.dark
                    }}
                  >
                    <PeopleIcon />
                  </Avatar>
                </Stack>
                <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1.5, color: 'text.primary' }}>
                  {dashboardData.stats.pendingUsers}
                </Typography>
                <Box sx={{ width: '100%', mt: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(dashboardData.stats.pendingUsers / dashboardData.stats.totalUsers) * 100} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.info.main, 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.info.main
                      }
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Awaiting verification
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.5)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    Scooters in Maintenance
                  </Typography>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.secondary.main, 0.2),
                      color: theme.palette.secondary.dark
                    }}
                  >
                    <BuildIcon />
                  </Avatar>
                </Stack>
                <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1.5, color: 'text.primary' }}>
                  {dashboardData.stats.scootersInMaintenance}
                </Typography>
                <Box sx={{ width: '100%', mt: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(dashboardData.stats.scootersInMaintenance / dashboardData.stats.totalScooters) * 100} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.secondary.main
                      }
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Undergoing repairs
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.5)} 0%, ${alpha(theme.palette.error.main, 0.2)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    Pending Transactions
                  </Typography>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.error.main, 0.2),
                      color: theme.palette.error.dark
                    }}
                  >
                    <TimelapseIcon />
                  </Avatar>
                </Stack>
                <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1.5, color: 'text.primary' }}>
                  {dashboardData.stats.pendingTransactions}
                </Typography>
                <Box sx={{ width: '100%', mt: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.error.main, 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.error.main
                      }
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Need to be processed
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        {/* Charts */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            fontWeight="bold" 
            sx={{ 
              mb: 3,
              px: 1,
              py: 0.5,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              color: 'text.primary'
            }}
          >
            Performance Analytics
          </Typography>
          
          <Grid container spacing={3}>
            {/* Revenue Chart */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <CardHeader 
                  title={
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      Revenue Overview
                    </Typography>
                  }
                  subheader={
                    <Typography variant="caption" color="text.secondary">
                      Revenue vs Expenses
                    </Typography>
                  }
                  action={
                    <IconButton>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}
                />
                <CardContent sx={{ height: 350, p: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        tickLine={{ stroke: theme.palette.divider }}
                        axisLine={{ stroke: theme.palette.divider }}
                      />
                      <YAxis 
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        tickLine={{ stroke: theme.palette.divider }}
                        axisLine={{ stroke: theme.palette.divider }}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip 
                        content={<CustomTooltip />} 
                        formatter={(value) => [`₹${value}`, '']}
                      />
                      <Legend 
                        wrapperStyle={{ 
                          paddingTop: 20,
                          fontSize: 12
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        name="Revenue"
                        stroke={theme.palette.primary.main} 
                        strokeWidth={3}
                        dot={{ 
                          fill: theme.palette.primary.main,
                          stroke: theme.palette.primary.dark,
                          strokeWidth: 1,
                          r: 4
                        }}
                        activeDot={{ 
                          fill: theme.palette.primary.light,
                          stroke: theme.palette.primary.main,
                          strokeWidth: 2,
                          r: 6
                        }}
                        fill="url(#colorRevenue)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        name="Expenses"
                        stroke={theme.palette.error.main} 
                        strokeWidth={3}
                        dot={{ 
                          fill: theme.palette.error.main,
                          stroke: theme.palette.error.dark,
                          strokeWidth: 1,
                          r: 4
                        }}
                        activeDot={{ 
                          fill: theme.palette.error.light,
                          stroke: theme.palette.error.main,
                          strokeWidth: 2,
                          r: 6
                        }}
                        fill="url(#colorExpenses)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Scooter Status Chart */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <CardHeader 
                  title={
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      Scooter Status
                    </Typography>
                  }
                  subheader={
                    <Typography variant="caption" color="text.secondary">
                      Current status of all scooters
                    </Typography>
                  }
                  action={
                    <IconButton>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}
                />
                <CardContent sx={{ height: 350, p: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.scooterStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: theme.palette.divider, strokeWidth: 1 }}
                      >
                        {dashboardData.scooterStatusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            stroke={theme.palette.background.paper}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={<CustomTooltip />} 
                        formatter={(value, name) => [value, name]}
                      />
                      <Legend 
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ 
                          paddingTop: 20,
                          fontSize: 12
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            fontWeight="bold" 
            sx={{ 
              mb: 3,
              px: 1,
              py: 0.5,
              borderLeft: `4px solid ${theme.palette.success.main}`,
              color: 'text.primary'
            }}
          >
            User & Rental Insights
          </Typography>
          
          <Grid container spacing={3}>
            {/* Rental Overview */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.1)}`
                }}
              >
                <CardHeader 
                  title={
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      Rental Overview
                    </Typography>
                  }
                  subheader={
                    <Typography variant="caption" color="text.secondary">
                      Completed vs Cancelled rentals
                    </Typography>
                  }
                  action={
                    <IconButton>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.03),
                    borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                  }}
                />
                <CardContent sx={{ height: 350, p: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.rentalData}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        tickLine={{ stroke: theme.palette.divider }}
                        axisLine={{ stroke: theme.palette.divider }}
                      />
                      <YAxis 
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        tickLine={{ stroke: theme.palette.divider }}
                        axisLine={{ stroke: theme.palette.divider }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ 
                          paddingTop: 20,
                          fontSize: 12
                        }}
                      />
                      <Bar 
                        dataKey="completed" 
                        name="Completed" 
                        fill="url(#colorCompleted)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="cancelled" 
                        name="Cancelled" 
                        fill="url(#colorCancelled)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            {/* User Activity */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.info.main, 0.1)}`
                }}
              >
                <CardHeader 
                  title={
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      User Activity
                    </Typography>
                  }
                  subheader={
                    <Typography variant="caption" color="text.secondary">
                      New and active users
                    </Typography>
                  }
                  action={
                    <IconButton>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.03),
                    borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                  }}
                />
                <CardContent sx={{ height: 350, p: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.userActivityData}>
                      <defs>
                        <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        tickLine={{ stroke: theme.palette.divider }}
                        axisLine={{ stroke: theme.palette.divider }}
                      />
                      <YAxis 
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        tickLine={{ stroke: theme.palette.divider }}
                        axisLine={{ stroke: theme.palette.divider }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ 
                          paddingTop: 20,
                          fontSize: 12
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="newUsers" 
                        name="New Users" 
                        stroke={theme.palette.primary.main} 
                        strokeWidth={3}
                        dot={{ 
                          fill: theme.palette.primary.main,
                          stroke: theme.palette.primary.dark,
                          strokeWidth: 1,
                          r: 4
                        }}
                        activeDot={{ 
                          fill: theme.palette.primary.light,
                          stroke: theme.palette.primary.main,
                          strokeWidth: 2,
                          r: 6
                        }}
                        fill="url(#colorNewUsers)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="activeUsers" 
                        name="Active Users" 
                        stroke={theme.palette.warning.main} 
                        strokeWidth={3}
                        dot={{ 
                          fill: theme.palette.warning.main,
                          stroke: theme.palette.warning.dark,
                          strokeWidth: 1,
                          r: 4
                        }}
                        activeDot={{ 
                          fill: theme.palette.warning.light,
                          stroke: theme.palette.warning.main,
                          strokeWidth: 2,
                          r: 6
                        }}
                        fill="url(#colorActiveUsers)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      
        {/* Quick Actions Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            fontWeight="bold" 
            sx={{ 
              mb: 3,
              px: 1,
              py: 0.5,
              borderLeft: `4px solid ${theme.palette.secondary.main}`,
              color: 'text.primary'
            }}
          >
            Quick Actions
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<PeopleIcon />}
                onClick={() => window.location.href = '/admin/users?status=PENDING'}
                sx={{ 
                  py: 2,
                  borderRadius: 2,
                  boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.3)}`
                  }
                }}
              >
                Verify Pending Users
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                startIcon={<MoneyIcon />}
                onClick={() => window.location.href = '/admin/transactions?status=PENDING'}
                sx={{ 
                  py: 2,
                  borderRadius: 2,
                  boxShadow: `0 4px 10px ${alpha(theme.palette.success.main, 0.2)}`,
                  transition: 'all 0.3s',
                  background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 6px 15px ${alpha(theme.palette.success.main, 0.3)}`
                  }
                }}
              >
                Process Transactions
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                startIcon={<MessageIcon />}
                onClick={() => window.location.href = '/admin/chats?adminApproved=false'}
                sx={{ 
                  py: 2,
                  borderRadius: 2,
                  boxShadow: `0 4px 10px ${alpha(theme.palette.secondary.main, 0.2)}`,
                  transition: 'all 0.3s',
                  background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 6px 15px ${alpha(theme.palette.secondary.main, 0.3)}`
                  }
                }}
              >
                Review Chat Reports
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        {/* Recently Added Users */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            fontWeight="bold" 
            sx={{ 
              mb: 3,
              px: 1,
              py: 0.5,
              borderLeft: `4px solid ${theme.palette.info.main}`,
              color: 'text.primary'
            }}
          >
            Recently Added Users
          </Typography>
          
          <Card 
            elevation={3}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: `0 4px 20px ${alpha(theme.palette.info.main, 0.1)}`
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: alpha(theme.palette.info.main, 0.03),
                borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                p: 2
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                New User Registrations
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                endIcon={<ArrowDownIcon />}
                sx={{ borderRadius: 2 }}
              >
                View All
              </Button>
            </Box>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {/* User Card 1 */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        width: 50, 
                        height: 50,
                        mr: 2
                      }}
                    >
                      RA
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Rahul Sharma
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Joined 2 hours ago
                      </Typography>
                      <Typography variant="caption" color="primary">
                        Verification Pending
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                {/* User Card 2 */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.success.main,
                        width: 50, 
                        height: 50,
                        mr: 2
                      }}
                    >
                      AP
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Anika Patel
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Joined 5 hours ago
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        Verified
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                {/* User Card 3 */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.warning.main,
                        width: 50, 
                        height: 50,
                        mr: 2
                      }}
                    >
                      SK
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Sanjay Kumar
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Joined 8 hours ago
                      </Typography>
                      <Typography variant="caption" color="warning.main">
                        ID Verification Required
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mt: 3 
                }}
              >
                <Button 
                  variant="text" 
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Load More
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
        
        {/* System Health Status */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            fontWeight="bold" 
            sx={{ 
              mb: 3,
              px: 1,
              py: 0.5,
              borderLeft: `4px solid ${theme.palette.error.main}`,
              color: 'text.primary'
            }}
          >
            System Health Status
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: '100%'
                }}
              >
                <CardHeader 
                  title={
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      Server Status
                    </Typography>
                  }
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.03),
                    borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                  }}
                />
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="medium">
                          API Server
                        </Typography>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          Online
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={92} 
                        sx={{ 
                          mt: 1,
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.success.main, 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.success.main
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Load: 92% | Response time: 125ms
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="medium">
                          Payment Gateway
                        </Typography>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          Online
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={78} 
                        sx={{ 
                          mt: 1,
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.success.main, 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.success.main
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Load: 78% | Response time: 210ms
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="medium">
                          SMS Gateway
                        </Typography>
                        <Typography variant="body2" color="warning.main" fontWeight="bold">
                          Degraded
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={45} 
                        sx={{ 
                          mt: 1,
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.warning.main, 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.warning.main
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Load: 45% | Response time: 450ms
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="medium">
                          Database Server
                        </Typography>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          Online
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={65} 
                        sx={{ 
                          mt: 1,
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.success.main, 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.success.main
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Load: 65% | Response time: 85ms
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: '100%'
                }}
              >
                <CardHeader 
                  title={
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      System Notifications
                    </Typography>
                  }
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.03),
                    borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                  }}
                />
                <CardContent>
                  <Stack spacing={2}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <BuildIcon color="success" />
                        <Typography variant="body2" fontWeight="medium">
                          System update completed successfully
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Today, 09:45 AM
                      </Typography>
                    </Paper>
                    
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <WarningIcon color="warning" />
                        <Typography variant="body2" fontWeight="medium">
                          SMS gateway experiencing delays
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Today, 10:30 AM
                      </Typography>
                    </Paper>
                    
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PeopleIcon color="info" />
                        <Typography variant="body2" fontWeight="medium">
                          10 new user registrations in the last hour
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Today, 11:15 AM
                      </Typography>
                    </Paper>
                    
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TimelapseIcon color="error" />
                        <Typography variant="body2" fontWeight="medium">
                          5 payment transactions need manual review
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Today, 12:05 PM
                      </Typography>
                    </Paper>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      
        {/* Error Display */}
        {error && (
          <Alert 
            severity="error" 
            variant="filled"
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => window.location.reload()}
                sx={{ fontWeight: 'bold' }}
                >
                  RELOAD
                </Button>
              }
              sx={{ 
                mt: 3,
                borderRadius: 2,
                boxShadow: 3,
                '& .MuiAlert-icon': {
                  fontSize: 24
                }
              }}
            >
              {error}
            </Alert>
          )}
          
          {/* Footer */}
          <Box 
            sx={{ 
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Scooter Rental Admin Dashboard. All rights reserved.
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
              Version 2.5.0 | Last updated: {format(new Date(), 'MMMM d, yyyy')}
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  };
  
  export default AdminDashboard;