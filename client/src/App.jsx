// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
//   Outlet,
// } from "react-router-dom";
// import { AuthProvider } from "./Context/AuthContext";
// import { ProtectedRoute, AdminRoute, VerifiedUserRoute } from "./components/routes/ProtectedRoutes";
// import Sidebar from "./components/common/Sidebar";
// import Navbar from "./components/common/Navbar";
// import Login from "./pages/Login";
// import AdminOverview from "./pages/AdminOverview";
// import ScooterManagement from "./pages/ScooterManagement";
// import UserManagement from "./pages/UserManagement";
// import RentalManagement from "./pages/RentalManagement";
// import Settings from "./pages/Settings";
// import HostVerification from "./pages/HostVerification";
// import Register from "./pages/Register";
// import BookingHistory from "./pages/BookingHistory";
// import PendingUsersPage from "./pages/PendingUsersPage";
// import PendingVerificationPage from "./pages/PendingVerificationPage";
// import TransactionPage from "./pages/TransactionPage";
// import RevenuePage from "./pages/RevenuePage";
// import AvailableVehicles from "./pages/AvailableVehicles";
// import NewBooking from "./pages/NewBooking";
// import UserNavbar from "./components/common/userNavbar";
// import AdminRegistration from "./pages/AdminRegistration";

// // Layout for admin dashboard pages with sidebar and navbar
// const AdminDashboardLayout = () => {
//   return (
//     <div className="flex">
//       <Sidebar />
//       <div className="flex-1">
//         <Navbar />
//         <div className="p-4">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };

// // Layout for auth pages (no sidebar/navbar)
// const AuthLayout = () => {
//   return (
//     <div className="w-full">
//       <Outlet />
//     </div>
//   );
// };

// // Layout for public pages (only navbar, no sidebar)
// const PublicLayout = () => {
//   return (
//     <div className="w-full">
//       <UserNavbar />
//       <div className="p-4">
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// // Layout for user pages (only navbar, no sidebar)
// const UserLayout = () => {
//   return (
//     <div className="w-full">
//       <Navbar />
//       <div className="p-4">
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           {/* Public Routes */}
//           <Route element={<AuthLayout />}>
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//           </Route>
          
//           {/* Public Vehicle Listing */}
//           <Route element={<PublicLayout />}>
//             <Route path="/available-vehicles" element={<AvailableVehicles />} />
//           </Route>
          
//           {/* User Pending Verification Page */}
//           <Route path="/pending-verification" element={<PendingVerificationPage />} />
          
//           {/* Protected Routes for Any Authenticated User */}
//           <Route element={<ProtectedRoute />}>
//             <Route element={<UserLayout />}>
//               <Route path="/settings" element={<Settings />} />
//             </Route>
//           </Route>
          
//           {/* Protected Routes for Verified Users */}
//           <Route element={<VerifiedUserRoute />}>
//             <Route element={<UserLayout />}>
//               <Route path="/booking" element={<BookingHistory />} />
//               <Route path="/booking/new" element={<NewBooking />} />
//               {/* Add other routes that require a verified user */}
//             </Route>
//           </Route>
          
//           {/* Admin-Only Routes */}
//           <Route element={<AdminRoute />}>
//             <Route element={<AdminDashboardLayout />}>
//               <Route path="/admin" element={<AdminOverview />} />
//               <Route path="/scooter" element={<ScooterManagement />} />
//               <Route path="/pending" element={<PendingUsersPage />} />
//               <Route path="/adminRegister" element={<AdminRegistration />} />
//               <Route path="/users" element={<UserManagement />} />
//               <Route path="/rental" element={<RentalManagement />} />
//               <Route path="/transaction" element={<TransactionPage />} />
//               <Route path="/revenue" element={<RevenuePage />} />
//               <Route path="/host-verification" element={<HostVerification />} />
//               <Route path="/pending" element={<PendingUsersPage />} />
//             </Route>
//           </Route>
          
//           {/* Redirect root to available vehicles page */}
//           <Route
//             path="/"
//             element={<Navigate to="/available-vehicles" replace />}
//           />
          
//           {/* Redirect to available vehicles for undefined routes */}
//           <Route path="*" element={<Navigate to="/available-vehicles" replace />} />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;








import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { SocketProvider } from "./Context/SocketContext";
import { ProtectedRoute, AdminRoute, VerifiedUserRoute } from "./components/routes/ProtectedRoutes";
import Sidebar from "./components/common/Sidebar";
import Navbar from "./components/common/Navbar";
import Login from "./pages/Login";
import AdminOverview from "./pages/AdminOverview";
import ScooterManagement from "./pages/ScooterManagement";
import UserManagement from "./pages/UserManagement";
import RentalManagement from "./pages/RentalManagement";
import Settings from "./pages/Settings";
import HostVerification from "./pages/HostVerification";
import Register from "./pages/Register";
import BookingHistory from "./pages/BookingHistory";
import PendingUsersPage from "./pages/PendingUsersPage";
import PendingVerificationPage from "./pages/PendingVerificationPage";
import TransactionPage from "./pages/TransactionPage";
import RevenuePage from "./pages/RevenuePage";
import AvailableVehicles from "./pages/AvailableVehicles";
import NewBooking from "./pages/NewBooking";
import UserNavbar from "./components/common/userNavbar";
import AdminRegistration from "./pages/AdminRegistration";
import Chat from "./pages/Chat"; // Import the Chat page component
import LandingPage from "./pages/LandingPage";
import MyBookings from "./pages/MyBookings";

// Layout for admin dashboard pages with sidebar and navbar
const AdminDashboardLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

// Layout for auth pages (no sidebar/navbar)
const AuthLayout = () => {
  return (
    <div className="w-full">
      <Outlet />
    </div>
  );
};

// Layout for public pages (only navbar, no sidebar)
const PublicLayout = () => {
  return (
    <div className="w-full">
      <UserNavbar />
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
};

// Layout for user pages (only navbar, no sidebar)
const UserLayout = () => {
  return (
    <div className="w-full">
      <UserNavbar/>
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
          <Route path="/" element={<LandingPage />} />
            {/* Public Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            
            {/* Public Vehicle Listing */}
            <Route element={<PublicLayout />}>
              <Route path="/available-vehicles" element={<AvailableVehicles />} />
            </Route>
            
            {/* User Pending Verification Page */}
            <Route path="/pending-verification" element={<PendingVerificationPage />} />
            
            {/* Protected Routes for Any Authenticated User */}
            <Route element={<ProtectedRoute />}>
              <Route element={<UserLayout />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            
            {/* Protected Routes for Verified Users */}
            <Route element={<VerifiedUserRoute />}>
              <Route element={<UserLayout />}>
                <Route path="/chat" element={<Chat />} />
             
                <Route path="/myBookings" element={<MyBookings />} />
                <Route path="/booking/new" element={<NewBooking />} />
                {/* Add other routes that require a verified user */}
              </Route>
            </Route>
            
            {/* Admin-Only Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminDashboardLayout />}>
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/scooter" element={<ScooterManagement />} />
                <Route path="/pending" element={<PendingUsersPage />} />
                <Route path="/adminRegister" element={<AdminRegistration />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/booking" element={<BookingHistory />} />
                <Route path="/rental" element={<RentalManagement />} />
                <Route path="/transaction" element={<TransactionPage />} />
                <Route path="/revenue" element={<RevenuePage />} />
                <Route path="/host-verification" element={<HostVerification />} />
                <Route path="/chats" element={<Chat />} />
              </Route>
            </Route>
            
            {/* Redirect root to available vehicles page */}
            <Route
              path="/"
              element={<Navigate to="/available-vehicles" replace />}
            />
            
            {/* Redirect to available vehicles for undefined routes */}
            <Route path="*" element={<Navigate to="/available-vehicles" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;