import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase"; // Firebase setup
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import "../styles/components/Leaderboard.css";
import { saveAs } from "file-saver"; // Install this package for saving files
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend,ArcElement,PointElement,LineElement, // Import LineElement
} from "chart.js";
import { useLanguage } from "../context/LanguageContext";
import { gapi } from "gapi-script";

// Register chart elements
ChartJS.register(
  CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend,ArcElement,PointElement,LineElement // Register LineElement for the Line chart
);

const CLIENT_ID = "664226390519-5mva9decdm9tin40vqbbr2ne598rne4c.apps.googleusercontent.com";
const API_KEY = "AIzaSyCqnGTE4lch5-E1e4b_t_0ZJ7NIdX2jpwE";
const SPREADSHEET_ID = "1srfcG9DIZRqZEBY5lx4ezdvX3bi_IPqlKu5xWQbI6mU"; // Replace with your Spreadsheet ID
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";


const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeFilter, setTimeFilter] = useState("All Time"); // Default filter is weekly
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default year is current year
  const [selectedDealerYear, setSelectedDealerYear] = useState(new Date().getFullYear());
  const [currentUser, setCurrentUser] = useState(null); // To store the current user's details
  const [currentUserRank, setCurrentUserRank] = useState(null); // To store the current user's rank
  const [userQuotationsCount, setUserQuotationsCount] = useState(0); // To store total quotations count for current user
  const [leaderboardTimeFilter, setLeaderboardTimeFilter] = useState("weekly");
  const [dealerTimeFilter, setDealerTimeFilter] = useState("weekly");
  const [userWeeklyQuotations, setUserWeeklyQuotations] = useState(0);
  const [graphData, setGraphData] = useState(null);
  const [graphOptions, setGraphOptions] = useState(null);
  const [totalQuotationsCount, setTotalQuotationsCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null); // To store the selected user details
  const [selectedUserAllTimeQuotations, setSelectedUserAllTimeQuotations] = useState(0);
  const [selectedUserRank, setSelectedUserRank] = useState(null);


  const exportToCSV = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn(); // Sign in if not already signed in
      }
  
      // Fetch data from the Google Spreadsheet
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Sheet1!A1:Z", // Adjust range as per your data
      });
  
      const rows = response.result.values;
  
      if (!rows || rows.length === 0) {
        alert("No data found in the spreadsheet.");
        return;
      }
  
      // Convert data to CSV
      const csvContent = rows
        .map((row) => row.map((cell) => `"${cell}"`).join(",")) // Escape cells with quotes
        .join("\n");
  
      // Create a Blob and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "leaderboard.csv";
      a.click();
  
      alert("CSV exported successfully!");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert(error);
    }
  };
  

  useEffect(() => {
    const initGoogleAPI = () => {
      gapi.load("client:auth2", () => {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPE,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
        });
      });
    };
    initGoogleAPI();
  }, []);

  const updateSpreadsheet = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn(); // Sign in if not already signed in
      }

      const data = leaderboardData.map((user, index) => [
        index + 1,
        user.name,
        user.count,
        user.userId,
      ]);

      const requestBody = {
        values: [["Rank", "Name", "Quotations", "User ID"], ...data],
      };

      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "Sheet1!A1", // Adjust range based on your Sheet
        valueInputOption: "RAW",
        resource: requestBody,
      });

      alert("Spreadsheet updated successfully!");
    } catch (error) {
      console.error("Error updating spreadsheet:", error);
      alert("Failed to update spreadsheet. Check console for details.");
    }
  };

  const filterByUserDateRange = (timestamp, filter, year = null) => {
    const now = new Date();
    const recordDate = new Date(timestamp);
  
    switch (filter) {
      case "daily":
        return (
          now.getFullYear() === recordDate.getFullYear() &&
          now.getMonth() === recordDate.getMonth() &&
          now.getDate() === recordDate.getDate()
        );
      case "weekly":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
  
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
  
        return recordDate >= startOfWeek && recordDate <= endOfWeek;
      case "monthly":
        return (
          now.getFullYear() === recordDate.getFullYear() &&
          now.getMonth() === recordDate.getMonth()
        );
      case "yearly":
        return recordDate.getFullYear() === year; // Filter by selected year
      case "all-time":
        return true; // No filtering by date
      default:
        return true;
    }
  };
  

  
  
  // New Function: Generate Graph for Selected User
  const generateGraphForSelectedUser = async (userId, filter, year = null) => {
    try {
      const quotationsSnapshot = await getDocs(collection(db, "Quotation_form"));
      const filteredQuotations = quotationsSnapshot.docs.filter(
        (doc) => doc.data().userId === userId && filterByUserDateRange(doc.data().timestamp, filter, year)
      );
  
      let labels = [];
      let counts = [];
  
      if (filter === "monthly") {
        // Generate data by month
        const monthsMap = {};
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ];
  
        filteredQuotations.forEach((doc) => {
          const timestamp = new Date(doc.data().timestamp);
          const month = monthNames[timestamp.getMonth()];
          monthsMap[month] = (monthsMap[month] || 0) + 1;
        });
  
        labels = monthNames; // Ensure all months are shown
        counts = labels.map((month) => monthsMap[month] || 0);
      } else if (filter === "yearly") {
        // Generate yearly data
        const yearsMap = {};
        filteredQuotations.forEach((doc) => {
          const year = new Date(doc.data().timestamp).getFullYear();
          yearsMap[year] = (yearsMap[year] || 0) + 1;
        });
  
        labels = Object.keys(yearsMap).sort();
        counts = labels.map((year) => yearsMap[year]);
      } else if (filter === "all-time") {
        // Generate monthly data across all years
        const monthsMap = {};
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ];
  
        filteredQuotations.forEach((doc) => {
          const timestamp = new Date(doc.data().timestamp);
          const month = `${monthNames[timestamp.getMonth()]} ${timestamp.getFullYear()}`;
          monthsMap[month] = (monthsMap[month] || 0) + 1;
        });
  
        labels = Object.keys(monthsMap).sort((a, b) => new Date(a) - new Date(b));
        counts = labels.map((month) => monthsMap[month]);
      } else {
        // Default (daily, weekly)
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayCounts = Array(7).fill(0);
  
        filteredQuotations.forEach((doc) => {
          const date = new Date(doc.data().timestamp);
          const dayIndex = date.getDay();
          dayCounts[dayIndex]++;
        });
  
        labels = daysOfWeek;
        counts = dayCounts;
      }
  
      return {
        data: {
          labels,
          datasets: [
            {
              label:
                filter === "monthly"
                  ? "Quotations by Month"
                  : filter === "yearly"
                  ? "Quotations by Year"
                  : "Quotations by Day",
              data: counts,
              backgroundColor: "rgba(75, 192, 192, 0.5)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: `Quotations (${filter.charAt(0).toUpperCase() + filter.slice(1)})` },
          },
        },
      };
    } catch (err) {
      console.error("Error generating graph for selected user:", err);
      return null;
    }
  };
  
  

  useEffect(() => {
    const fetchDealerGraphData = async () => {
        try {
          const quotationsSnapshot = await getDocs(collection(db, "Quotation_form"));
          const filteredQuotations = quotationsSnapshot.docs.filter((doc) =>
            filterByDealerDateRange(doc.data().timestamp, dealerTimeFilter, selectedDealerYear) &&
            doc.data().userId === auth.currentUser?.uid // Filter by current dealer's ID
          );
      
          const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const dayCounts = Array(7).fill(0);
      
          filteredQuotations.forEach((doc) => {
            const date = new Date(doc.data().timestamp);
            const dayIndex = date.getDay();
            dayCounts[dayIndex]++;
          });
      
          setGraphData({
            labels: daysOfWeek,
            datasets: [
              {
                label: "Quotations",
                data: dayCounts,
                backgroundColor: "rgba(75, 192, 192, 0.5)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          });
      
          setGraphOptions({
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Your Quotations by Day of the Week" },
            },
          });
        } catch (err) {
          console.error("Failed to fetch dealer graph data:", err);
        }
      };
      
  
    fetchDealerGraphData();
  }, [dealerTimeFilter, selectedDealerYear]); // Depend on dealer-specific filters
  

  const filterByDealerDateRange = (timestamp, filter, dealerYear = null) => {
    const now = new Date();
    const recordDate = new Date(timestamp);
  
    switch (filter) {
      case "daily":
        return (
          now.getFullYear() === recordDate.getFullYear() &&
          now.getMonth() === recordDate.getMonth() &&
          now.getDate() === recordDate.getDate()
        );
      case "weekly":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
  
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
  
        return recordDate >= startOfWeek && recordDate <= endOfWeek;
      case "monthly":
        return (
          now.getFullYear() === recordDate.getFullYear() &&
          now.getMonth() === recordDate.getMonth()
        );
      case "yearly":
        return recordDate.getFullYear() === dealerYear;
      case "all-time":
        return true;
      default:
        return true;
    }
  };
  
  useEffect(() => {
    const fetchUserQuotations = async () => {
      try {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) return;
  
        const quotationsSnapshot = await getDocs(collection(db, "Quotation_form"));
        const userTotalQuotations = quotationsSnapshot.docs.filter(
            (doc) => doc.data().userId === currentUserId
          );

        const userQuotations = quotationsSnapshot.docs.filter(
          (doc) => doc.data().userId === currentUserId &&
          filterByDateRange(doc.data().timestamp, dealerTimeFilter)
        );
        setTotalQuotationsCount(userQuotations.length)
        setUserQuotationsCount(userTotalQuotations.length);
      } catch (err) {
        setError("Failed to fetch quotations for the current user.");
        console.error(err);
      }
    };
  
    fetchUserQuotations();
  }, [dealerTimeFilter]);
  
  

  // Helper function to filter data by date range
  const filterByDateRange = (timestamp, filter) => {
    const now = new Date();
    const recordDate = new Date(timestamp);

    switch (filter) {
      case "daily": {
        return (
          now.getFullYear() === recordDate.getFullYear() &&
          now.getMonth() === recordDate.getMonth() &&
          now.getDate() === recordDate.getDate()
        );
      }
      case "weekly": {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0); // Reset time to the start of the day

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999); // End of the day

        return recordDate >= startOfWeek && recordDate <= endOfWeek;
      }
      case "monthly": {
        return (
          now.getFullYear() === recordDate.getFullYear() &&
          now.getMonth() === recordDate.getMonth()
        );
      }
      case "yearly": {
        return recordDate.getFullYear() === selectedYear; // Filter by selected year
      }
      case "all-time": {
        return true; // No filtering by year; all records are included
      }
      default:
        return true;
    }
  };

  // Fetch leaderboard data when timeFilter or selectedYear changes
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const quotationsSnapshot = await getDocs(
          collection(db, "Quotation_form")
        );
        const userCounts = {};

        // Count the number of quotations for each user within the selected time range
        quotationsSnapshot.forEach((doc) => {
          const { userId, timestamp } = doc.data();
          if (
            userId &&
            timestamp &&
            filterByDateRange(timestamp, timeFilter)
          ) {
            userCounts[userId] = (userCounts[userId] || 0) + 1;
          }
        });

        // Fetch user names and avatars from the users collection
        const userDetails = {};
        for (const userId of Object.keys(userCounts)) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            userDetails[userId] = {
              name: userDoc.data().name || "Unknown User", // Fallback for missing name
            };
          } else {
            userDetails[userId] = {
              name: "Unknown User",
            };
          }
        }

        // Convert to an array, add user details, and sort by count
        const sortedLeaderboard = Object.entries(userCounts)
          .map(([userId, count]) => ({
            userId,
            name: userDetails[userId].name,
            avatar: userDetails[userId].avatar,
            count,
          }))
          .sort((a, b) => b.count - a.count);

        setLeaderboardData(sortedLeaderboard);
        
        // Find current user's rank
        const currentUserId = auth.currentUser?.uid;
        const rank = sortedLeaderboard.findIndex(user => user.userId === currentUserId);
        setCurrentUserRank(rank !== -1 ? rank + 1 : null); // Rank is 1-based

      } catch (err) {
        setError("Failed to fetch leaderboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [timeFilter, selectedYear, dealerTimeFilter]); // Re-fetch data when the time filter or selected year changes

  const calculateTotalQuotations = () => {
    let totalCount = 0;
  
    leaderboardData.forEach(user => {
      if (user.userId === auth.currentUser?.uid) {
        totalCount += user.count;
      }
    });
  
    return totalCount;
  };
  

  // Fetch current user details
  useEffect(() => {
    const fetchCurrentUserDetails = async () => {
      try {
        const currentUserId = auth.currentUser?.uid; // Replace with the actual logged-in user ID
        const userDoc = await getDoc(doc(db, "users", currentUserId));
        if (userDoc.exists()) {
          setCurrentUser(userDoc.data());
        } else {
          setCurrentUser({ name: "" }); // Fallback for missing user
        }
      } catch (err) {
        console.error("Error fetching current user details:", err);
      }
    };

    fetchCurrentUserDetails();
  }, []);

  // Create an array of years for the year picker dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const dealerYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleUserClick = async (user) => {
  if (currentUser && currentUser.role === "Admin") {
    setSelectedUser(user); // Set the selected user when Admin clicks

    try {
      const quotationsSnapshot = await getDocs(collection(db, "Quotation_form"));
      const allTimeQuotations = quotationsSnapshot.docs.filter(
        (doc) => doc.data().userId === user.userId
      ).length;

      const rank = leaderboardData.findIndex((item) => item.userId === user.userId) + 1;
    setSelectedUserRank(rank);

      setSelectedUserAllTimeQuotations(allTimeQuotations);
    } catch (err) {
      console.error("Error fetching all-time quotations for the selected user:", err);
    }
  } else {
    null
  }
};


  return (
    <div className="leaderboard-page">
    <div className="leaderboard-container">
    <h1 style={{textAlign:'left'}}>Leaderboard</h1>
      <h4 className="leaderboard-title">🌟 Top Performers</h4>

      <div className="leaderboard-filters">
        <button
          className={`filter-button ${timeFilter === "daily" ? "active" : ""}`}
          onClick={() => setTimeFilter("daily")}
        >
          Daily
        </button>
        <button
          className={`filter-button ${timeFilter === "weekly" ? "active" : ""}`}
          onClick={() => setTimeFilter("weekly")}
        >
          Weekly
        </button>
        <button
          className={`filter-button ${timeFilter === "monthly" ? "active" : ""}`}
          onClick={() => setTimeFilter("monthly")}
        >
          Monthly
        </button>
        <button
          className={`filter-button ${timeFilter === "yearly" ? "active" : ""}`}
          onClick={() => setTimeFilter("yearly")}
        >
          Yearly
        </button>
        <button
          className={`filter-button ${timeFilter === "all-time" ? "active" : ""}`}
          onClick={() => setTimeFilter("all-time")}
        >
          All Time
        </button>

        {currentUser && currentUser.role === "Admin" && (
            <>
              <button
                onClick={exportToCSV}
                className="export-leaderboard-csv-button"
              >
                Export CSV
              </button>
              <button
                className="update-spreadheet-button"
                onClick={updateSpreadsheet}
              >
                Update Spreadsheet
              </button>
            </>
          )}


      </div>

      {timeFilter === "yearly" && (
        <div className="year-picker">
          <label htmlFor="year">Select Year: </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="leaderboard-list">
          {leaderboardData.map((user, index) => (
            <div key={user.userId} className={`leaderboard-item rank-${index + 1}`} onClick={() => handleUserClick(user)}>
              <div style={{display:'flex', flexDirection:'column', justifyContent:'center'}}  >
                <h2>Rank</h2>
                <div className="leaderboard-rank-badge">  #{index + 1}</div>
              </div>
              <div className="leaderboard-details">
                <h2 className="leaderboard-name">{user.name}</h2>
                <p className="leaderboard-count">
                  <strong>{user.count}</strong> Quotations
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    {selectedUser && (
  <div className="user-container">
    <div className="user-card">
      <div className="user-header">
        <div className="user-rank">
          <span className="user-rank-badge">
            #{leaderboardData.findIndex(user => user.userId === selectedUser.userId) + 1}
          </span>
          <p className="user-rank-text">User Rank</p>
        </div>
        <div className="user-info">
          <h2 className="user-name">{selectedUser.name}</h2>
        </div>
      </div>
      <div className="user-stats">
        <div className="stat-item">
          <p className="stat-label">Total Quotations</p>
          <p className="stat-value">{selectedUserAllTimeQuotations}</p>
        </div>

        <div className="stat-item">
        <p className="stat-label">Weekly Quotations</p>
          <p className="stat-value">{selectedUser.count}</p>
        </div>
      </div>

      <div className="user-filters">
  {["daily", "weekly", "monthly", "yearly", "all-time"].map((filter) => (
    <button
      key={filter}
      className={`filter-button ${leaderboardTimeFilter === filter ? "active" : ""}`}
      onClick={async () => {
        setLeaderboardTimeFilter(filter);
        const graph = await generateGraphForSelectedUser(
          selectedUser.userId,
          filter,
          leaderboardTimeFilter === "yearly" ? selectedYear : null
        );
        setGraphData(graph?.data);
        setGraphOptions(graph?.options);
      }}
    >
      {filter.charAt(0).toUpperCase() + filter.slice(1)}
    </button>
  ))}

  {leaderboardTimeFilter === "yearly" && (
    <div className="year-picker">
      <label htmlFor="year">Select Year:</label>
      <select
        id="year"
        value={selectedYear}
        onChange={async (e) => {
          const year = Number(e.target.value);
          setSelectedYear(year);
          const graph = await generateGraphForSelectedUser(selectedUser.userId, "yearly", year);
          setGraphData(graph?.data);
          setGraphOptions(graph?.options);
        }}
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  )}
</div>




      <div className="user-graph">
        {graphData && graphOptions ? (
          <Bar data={graphData} options={graphOptions} />
        ) : (
          <p>Loading graph...</p>
        )}
      </div>
    </div>
  </div>
)}

    {currentUser && currentUser.role === 'Dealer' && (
        <div className="dealer-container">
  <div className="dealer-card">
    <div className="dealer-header">
      <div className="dealer-rank">
        <span className="dealer-rank-badge">#{currentUserRank || "N/A"}</span>
        <p className="dealer-rank-text">Your Rank</p>
      </div>
      <div className="dealer-info">
        <h2 className="dealer-name">{currentUser.name || "Unknown"}</h2>
        <p className="dealer-role">
          Role: <strong>{currentUser.role || "Dealer"}</strong>
        </p>
      </div>
    </div>
    <div className="dealer-stats">
      <div className="stat-item">
        <p className="stat-label">Total Quotations</p>
        <p className="stat-value">{userQuotationsCount}</p>
      </div>
      <div className="stat-item">
        <p className="stat-label">Quotations This Week</p>
        <p className="stat-value">{userWeeklyQuotations}</p>
      </div>
    </div>

    <div>
    <div className="dealer-filters">
        <button
          className={`filter-button ${
            dealerTimeFilter === "daily" ? "active" : ""
          }`}
          onClick={() => setDealerTimeFilter("daily")}
        >
          Daily
        </button>
        <button
          className={`filter-button ${
            dealerTimeFilter === "weekly" ? "active" : ""
          }`}
          onClick={() => setDealerTimeFilter("weekly")}
        >
          Weekly
        </button>
        <button
          className={`filter-button ${
            dealerTimeFilter === "monthly" ? "active" : ""
          }`}
          onClick={() => setDealerTimeFilter("monthly")}
        >
          Monthly
        </button>
        <button
          className={`filter-button ${
            dealerTimeFilter === "yearly" ? "active" : ""
          }`}
          onClick={() => setDealerTimeFilter("yearly")}
        >
          Yearly
        </button>
        <button
          className={`filter-button ${
            dealerTimeFilter === "all-time" ? "active" : ""
          }`}
          onClick={() => setDealerTimeFilter("all-time")}
        >
          All Time
        </button>

        {dealerTimeFilter === "yearly" && (
      <div className="year-picker">
        <label htmlFor="dealer-year">Select Year: </label>
        <select
          id="dealer-year"
          value={selectedDealerYear}
          onChange={(e) => setSelectedDealerYear(Number(e.target.value))}
        >
          {dealerYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    )}
      </div>

           {/* Render the graph */}
        <div className="dealer-graph">
          {graphData && graphOptions ? (
            <Bar data={graphData} options={graphOptions} />
          ) : (
            <p>Loading graph...</p>
          )}
        </div>
          </div>
  </div>
</div>

)}


    </div>
  );
};

export default Leaderboard;
