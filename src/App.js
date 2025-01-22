import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigation } from "react-router-dom";
import Login from "./pages/login.js";
import Signup from "./pages/signup.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import DealerDashboard from "./pages/DealerDashboard.js";
import InstallerDashboard from "./pages/InstallerDashboard.js";
import NotificationsPage from "./pages/NotificationsPage.js";
import ReferralPage from "./pages/ReferralPage.js";
import { useEffect, useState } from "react";
import { auth, db } from "./services/firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { FaLanguage } from "react-icons/fa";
import './App.css';
import ProductPage from "./pages/ProductPage.js";
import ProductDetailsPage from "./pages/ProductDetails.js";
import OrdersPage from "./pages/Orders.js";
import QuotationManagement from "./pages/Quotations.js";
import RewardsPage from "./pages/RewardPage.js";
import ProjectPage from "./pages/ProjectPage.js";
import AssignmentPage from "./pages/Assignment.js";
import ProjectStatusPage from "./pages/ProjectStatusPage.js";
import ProjectRequestPage from "./pages/projectRequest.js";
import UserManagementPage from "./pages/UserManagementPage.js";
import UserManagementPage1 from "./pages/UserManagementPage1.js";
import OrderDetails from "./pages/OrderDetailPage.js";
import OrderManagement from "./pages/OrderManagement.js";
import { LanguageProvider, useLanguage } from "./context/LanguageContext.js";
import ForgotPassword from "./pages/ForgotPasswordPage.js";
import Leaderboard from "./pages/Leaderboard.js";


const Navbar = ({userRole, handleLogout}) => {
  const location = useLocation(); // Get the current location
  const isActive = (path) => location.pathname === path;
  const [unreadCount, setUnreadCount] = useState(0);
  const { language, setLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const selectLanguage = (lang) => {
    setLanguage(lang);
    setDropdownOpen(false);
  };

  useEffect(() => {
    if (userRole) {
      const notificationsQuery = query(
        collection(db, "Notification"),
        where("userId", "==", auth.currentUser?.uid),
        where("read", "==", "false")
      );
  
      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        setUnreadCount(snapshot.size); // Count unread notifications
      });
  
      return () => unsubscribe(); // Cleanup on unmount
    }
  }, [userRole]);


  const translations = {
    "en": {
    "dashboard": "Dashboard",
    "quotations": "Quotations",
    "projectRequests": "Project Requests",
    "products": "Products",
    "manageQuotations": "Manage Quotations",
    "referral": "Referral",
    "rewards": "Rewards",
    "projects": "Projects",
    "status": "Status",
    "login": "Login",
    "signup": "Signup",
    "logout": "Log Out",
  },
  "fr": {
    "dashboard": "Tableau de bord",
    "quotations": "Devis",
    "projectRequests": "Demandes de projet",
    "products": "Produits",
    "manageQuotations": "Gérer les devis",
    "referral": "Parrainage",
    "rewards": "Récompenses",
    "projects": "Projets",
    "status": "Statut",
    "login": "Connexion",
    "signup": "S'inscrire",
    "logout": "Déconnexion",
  },
  }

  const t = translations[language];

  return(
    <nav className="navbar">
      <ul className="nav-list">
        {userRole === "Admin" && (
          <>
            <li className={`navbar-item ${isActive("/admin-dashboard") ? "active" : ""}`}><Link to="/admin-dashboard">{t.dashboard}</Link></li>
            <li className={`navbar-item ${isActive("/leaderboard") ? "active" : ""}`}><Link to="/leaderboard">Leaderboard</Link></li>
            <li className={`navbar-item ${isActive("/Quotation-management") ? "active" : ""}`}><Link to="/Quotation-management">{t.quotations}</Link></li>
            <li className={`navbar-item ${isActive("/project-request") ? "active" : ""}`}><Link to="/project-request">{t.projectRequests}</Link></li>
            <li className={`navbar-item ${isActive("/products") ? "active" : ""}`}><Link to="/products">{t.products}</Link></li>
         
          </>
        )}

        {userRole === "Dealer" && (
          <>
            <li className={`navbar-item ${isActive("/dealer-dashboard") ? "active" : ""}`}><Link to="/dealer-dashboard">{t.dashboard}</Link></li>
            <li className={`navbar-item ${isActive("/manage-order") ? "active" : ""}`}><Link to="/manage-order">{t.manageQuotations}</Link></li>
            <li className={`navbar-item ${isActive("/leaderboard") ? "active" : ""}`}><Link to="/leaderboard">Leaderboard</Link></li>
            <li className={`navbar-item ${isActive("/referral") ? "active" : ""}`}><Link to="/referral">{t.referral}</Link></li>
            <li className={`navbar-item ${isActive("/reward") ? "active" : ""}`}><Link to="/reward">{t.rewards}</Link></li>
            <li className={`navbar-item ${isActive("/products") ? "active" : ""}`}><Link to="/products">{t.products}</Link></li>
   
          </>
        )}

        {userRole === "Installer" && (
          <>
          <li className={`navbar-item ${isActive("/installer-dashboard") ? "active" : ""}`}><Link to="/installer-dashboard">{t.dashboard}</Link></li>
          <li className={`navbar-item ${isActive("/project") ? "active" : ""}`}><Link to="/project">{t.projects}</Link></li>
          <li className={`navbar-item ${isActive("/status") ? "active" : ""}`}><Link to="/status">{t.status}</Link></li>
          </>
        )}

      {(userRole === "Admin" || userRole === "Dealer" || userRole === "Installer") && (
          <li className="navbar-item">
            <Link to="/notifications">
              <span className="notification-icon">🔔</span>
              {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
            </Link>
          </li>
        )}

        {!userRole && (
          <>
            <li className={`navbar-item ${isActive("/login") ? "active" : ""}`}><Link to="/login">{t.login}</Link></li>
            <li className={`navbar-item ${isActive("/signup") ? "active" : ""}`}><Link to="/signup">{t.signup}</Link></li>
          </>
        )}

      </ul>

      <div className="navbar-right">
        <div className="language-dropdown">
        <FaLanguage
            className="language-icon"
            onClick={toggleDropdown}
            role="button"
            size={30}
          />
          {dropdownOpen && (
            <ul className="dropdown-menu">
              <li onClick={() => selectLanguage("en")}>
                {language === "en" ? <strong>English</strong> : "English"}
              </li>
              <li onClick={() => selectLanguage("fr")}>
                {language === "fr" ? <strong>Français</strong> : "Français"}
              </li>
            </ul>
          )}
        </div>

      {(userRole === "Admin" || userRole === "Dealer" || userRole === "Installer") && (
        <button className="logout-button" onClick={handleLogout}>
          {t.logout}
        </button>
      )}
      </div>
    </nav>
  )

}


function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.reload(); // Or use navigation to redirect to the login page
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            console.error("No user document found!");
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );

  const getDashboardRoute = () => {
    switch (userRole) {
      case "Admin":
        return "/admin-dashboard";
      case "Dealer":
        return "/dealer-dashboard";
      case "Installer":
        return "/installer-dashboard";
      default:
        return "/login";
    }
  };

  return (
    <LanguageProvider>
    <Router>
      <Navbar userRole={userRole} handleLogout={handleLogout} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={userRole ? <Navigate to={getDashboardRoute()} /> : <Login />} />
        <Route path="/signup" element={userRole ? <Navigate to={getDashboardRoute()} /> : <Signup />} />
        <Route path="/forgot-password" element ={userRole? <Navigate to={getDashboardRoute()}/>: <ForgotPassword/>}/>

        {/* Role-Based Routes */}
        {userRole === "Admin" && (
          <>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/Quotation-management" element={<QuotationManagement/>}/>
            <Route path="/project-request" element={<ProjectRequestPage/>} />
            <Route path="/products" element={<ProductPage/>} />
            <Route path="/product-details/:productId" element={<ProductDetailsPage />} />
            <Route path="/manage" element={<UserManagementPage/>}/>
            <Route path="/manage1" element={<UserManagementPage1/>}/>
            <Route path="leaderboard" element={<Leaderboard/>}/>
          </>
        )}
        {userRole === "Dealer" && (
          <>
            <Route path="/dealer-dashboard" element={<DealerDashboard />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/referral" element={<ReferralPage/>}/>
            <Route path="/Products" element={<ProductPage/>}/>
            <Route path="/product-details/:productId" element={<ProductDetailsPage />} />
            <Route path="/Orders" element={<OrdersPage/>}/>
            <Route path="/reward" element={<RewardsPage/>}/>
            <Route path="/order/:orderId" element={<OrderDetails />} />
            <Route path="/manage-order" element = {<OrderManagement/>}/>
            <Route path="leaderboard" element={<Leaderboard/>}/>
          </>
        )}
        {userRole === "Installer" && (
          <>
            <Route path="/installer-dashboard" element={<InstallerDashboard />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/project" element={<ProjectPage/>} />
            <Route path="/assignment" element={<AssignmentPage/>}/>
            <Route path="/status" element={<ProjectStatusPage/>}/>
            
          </>
        )}

        {/* Redirect Routes */}
        <Route path="/" element={<Navigate to={getDashboardRoute()} />} />
        <Route path="*" element={<Navigate to={getDashboardRoute()} />} />
      </Routes>
    </Router>
    </LanguageProvider>
  );
}

export default App;