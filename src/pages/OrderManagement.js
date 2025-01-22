import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc,updateDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import "../styles/components/OrdersManagement.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false); // For loading state
  const [error, setError] = useState(null); // For error state
  const [isModalOpen, setIsModalOpen] = useState(false);
const [editingOrder, setEditingOrder] = useState(null);
const [clientDetails, setClientDetails] = useState({
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  clientAddress: '',
  city: '',
  postalCode: '',
  additionalRequirements: '',
});

const { language } = useLanguage(); // Language state

  // Translation for English and French
  const translations = {
    en: {
      title: "Order Management",
      searchPlaceholder: "Search orders...",
      statusLabel: "Status",
      approveButton: "Approve",
      rejectButton: "Reject",
      tableHeaders: {
        orderNumber: "Order ID",
        date: "Date",
        items: "Items",
        category: "Category",
        estimatedPrice: "Est Price",
        paymentStatus: "Paid",
        clientDetails: "Client Details",
        address: "Address",
        city: "City",
        status: "Status",
        installer: "Installer",
        installerDetails: "Installer Details",
        workStatus: "Work Status",
        action: "Action",
      },
      buttons: {
        newProduct: "+ New Product",
        sortByDate: "Sort by Date",
        saveChanges: "Save Changes",
        close: "Close",
        download: "Download",
        editOrder: "Edit Order",
        delete: "Delete",
      },
      filterOptions: {
        allStatus: "All Status",
        approved: "Approved",
        pending: "Pending",
        rejected: "Rejected",
      },
    },
    fr: {
      title: "Gestion des Commandes",
      searchPlaceholder: "Rechercher des commandes...",
      statusLabel: "Statut",
      approveButton: "Approuver",
      rejectButton: "Rejeter",
      tableHeaders: {
        orderNumber: "Numéro de commande",
        date: "Date",
        items: "Articles",
        category: "Catégorie",
        estimatedPrice: "Prix estimé",
        paymentStatus: "Payé",
        clientDetails: "Détails du client",
        address: "Adresse",
        city: "Ville",
        status: "Statut",
        installer: "Installateur",
        installerDetails: "Détails de l'installateur",
        workStatus: "Statut du travail",
        action: "Action",
      },
      buttons: {
        newProduct: "+ Nouveau Produit",
        sortByDate: "Trier par Date",
        saveChanges: "Sauvegarder les Modifications",
        close: "Fermer",
        download: "Télécharger",
        editOrder: "Modifier la Commande",
        delete: "Supprimer",
      },
      filterOptions: {
        allStatus: "Tous les Statuts",
        approved: "Approuvé",
        pending: "En Attente",
        rejected: "Rejeté",
      },
    },
  };

  const t = translations[language]; // Helper for translations


const navigate = useNavigate();

useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true); // Set loading to true
      setError(null); // Clear previous errors
  
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const q = query(collection(db, "Quotation_form"), where("userId", "==", userId));
          const querySnapshot = await getDocs(q);
          const ordersData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(ordersData);
          setFilteredOrders(ordersData); // Initialize filteredOrders
        } catch (err) {
          setError("Failed to load orders. Please try again later."); // Set error message
          console.error("Error fetching orders:", err);
        } finally {
          setLoading(false); // Set loading to false after fetching is complete
        }
      }
    };
  
    fetchOrders();
  }, []);
  

  const handlenewproduct = () => {
        navigate("/products")
  }

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setClientDetails({
      clientName: order.clientName || '',
      clientPhone: order.clientPhone || '',
      clientEmail: order.clientEmail || '',
      clientAddress: order.clientAddress || '',
      city: order.city || '',
      postalCode: order.postalCode || '',
      additionalRequirements: order.product?.additionalRequirements || '',
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (editingOrder) {
      try {
        // Update the order in Firestore
        const orderRef = doc(db, "Quotation_form", editingOrder.id);
        await updateDoc(orderRef, {
          clientName: clientDetails.clientName || null,
          clientPhone: clientDetails.clientPhone || null,
          clientEmail: clientDetails.clientEmail || null,
          clientAddress: clientDetails.clientAddress || null,
          city: clientDetails.city || null,
          postalCode: clientDetails.postalCode || null,
          "product.additionalRequirements": clientDetails.additionalRequirements || null,
        });
  
        // Update the local state to reflect changes immediately
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === editingOrder.id
              ? {
                  ...order,
                  clientName: clientDetails.clientName,
                  clientPhone: clientDetails.clientPhone,
                  clientEmail: clientDetails.clientEmail,
                  clientAddress: clientDetails.clientAddress,
                  city: clientDetails.city,
                  postalCode: clientDetails.postalCode,
                  product: {
                    ...order.product,
                    additionalRequirements: clientDetails.additionalRequirements,
                  },
                }
              : order
          )
        );
  
        // Update filtered orders
        setFilteredOrders((prevFilteredOrders) =>
          prevFilteredOrders.map((order) =>
            order.id === editingOrder.id
              ? {
                  ...order,
                  clientName: clientDetails.clientName,
                  clientPhone: clientDetails.clientPhone,
                  clientEmail: clientDetails.clientEmail,
                  clientAddress: clientDetails.clientAddress,
                  city: clientDetails.city,
                  postalCode: clientDetails.postalCode,
                  product: {
                    ...order.product,
                    additionalRequirements: clientDetails.additionalRequirements,
                  },
                }
              : order
          )
        );
  
        // Close the modal
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error updating order:", error);
      }
    }
  };
  

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  
  
  

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
  
    const filtered = orders.filter((order) =>
      (order.product?.productName?.toLowerCase() || "").includes(searchValue) || // Search in product name
      (order.clientName?.toLowerCase() || "").includes(searchValue) || // Search in client name
      (order.orderNumber?.toString().toLowerCase() || "").includes(searchValue) // Convert orderNumber to string before search
    );
  
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };
  
  
  

  // Filter Logic
  const handleFilter = (status) => {
    setFilterStatus(status);
    const filtered = status === "All" ? orders : orders.filter((order) => order.status === status);
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  // Sort Logic
  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sortedOrders = [...filteredOrders].sort((a, b) => {
      if (a[field] < b[field]) return order === "asc" ? -1 : 1;
      if (a[field] > b[field]) return order === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredOrders(sortedOrders);
  };

  const handleDownload = (order) => {
    // Create a file content
    const orderDetails = `
      Order ID: ${order.orderNumber || "N/A"}
      Date: ${order.timestamp ? new Date(order.timestamp).toLocaleString() : "N/A"}
      Product Name: ${order.product?.productName || "N/A"}
      Category: ${order.product?.category || "N/A"}
      Estimated Price: ₹${order.estimatePrice || "0.00"}
      Payment Status: ${order.paymentStatus || "Not Paid"}
      Client Name: ${order.clientName || "N/A"}
      Client Phone: ${order.clientPhone || "N/A"}
      Client Email: ${order.clientEmail || "N/A"}
      Address: ${order.clientAddress || "N/A"}
      City: ${order.city || "N/A"}${order.postalCode ? `, ${order.postalCode}` : ""}
      Features: ${
        order.product?.features
          ? JSON.stringify(order.product.features, null, 2)
          : "No features listed"
      }
      Additional Requirements: ${order.product?.additionalRequirements || "None"}
      Status: ${order.status || "Unknown"}
    `;
  
    // Create a Blob and download it as a file
    const blob = new Blob([orderDetails], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Order_${order.orderNumber || "Details"}.txt`;
    link.click();
  };
  

  return (
    <div className="order-management">        
      <div className="order-management-header">
        <h1>{t.title}</h1>
        <button className="new-product-btn" onClick={handlenewproduct}>{t.buttons.newProduct}</button>
      </div>
      <div className="search-filter">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          className="search-input"
          value={searchTerm}
          onChange={handleSearch}
        />
        <div className="filter-sort">
          <select onChange={(e) => handleFilter(e.target.value)} value={filterStatus}>
          <option value="All">{t.filterOptions.allStatus}</option>
          <option value="Approved">{t.filterOptions.approved}</option>
          <option value="Pending">{t.filterOptions.pending}</option>
          <option value="Rejected">{t.filterOptions.rejected}</option>
          </select>
          <button onClick={() => handleSort("timestamp")}>{t.buttons.sortByDate}</button>
        </div>
      </div>
      <table className="orders-table">
        <thead>
          <tr>
          <th>#</th>
      <th>{t.tableHeaders.orderNumber}</th>
      <th>{t.tableHeaders.date}</th>
      <th>{t.tableHeaders.items}</th>
      <th>{t.tableHeaders.category}</th>
      <th>{t.tableHeaders.estimatedPrice}</th>
      <th>{t.tableHeaders.paymentStatus}</th>
      <th>{t.tableHeaders.clientDetails}</th>
      <th>{t.tableHeaders.address}</th>
      <th>{t.tableHeaders.city}</th>
      <th>{t.tableHeaders.status}</th>
      <th>{t.tableHeaders.installer}</th>
      <th>{t.tableHeaders.installerDetails}</th>
      <th>{t.tableHeaders.workStatus}</th>
      <th>{t.tableHeaders.action}</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order, index) => (
            <tr key={order.id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{order.orderNumber || "N/A"}</td>
              <td>{order.timestamp ? new Date(order.timestamp).toLocaleDateString() : "N/A"}</td>
              <td>{order.product?.productName || "-"}</td>
              <td>{order.product?.category || "N/A"}</td>
              <td>₹{order.estimatePrice || "0.00"}</td>
              <td>{order.paymentStatus || "Not Paid"}</td>
              <td>
                <p>
                  <strong>Name:</strong> {order.clientName || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {order.clientPhone || "N/A"}
                </p>
                <p>
                  <strong>Mail:</strong> {order.clientEmail || "N/A"}
                </p>
              </td>
              <td>{order.clientAddress || "N/A"}</td>
              <td>
                {order.city
                  ? `${order.city}${order.postalCode ? `, ${order.postalCode}` : ""}`
                  : "Address Not Available"}
              </td>
              <td className={`status ${order.status ? order.status.toLowerCase() : ""}`}>
                {order.status || "Unknown"}
              </td>
              <td>{order.Installer|| "Not assigned yet."}</td>
              <td><p><strong>Name:</strong>{order.assignedInstallerName||'N/A'}</p>{""}
              <p><strong>ID: </strong>{order.assignedTo||'N/A'}</p></td>
              <td>{order.workStatus|| 'Not started yet.'}</td>
              <td>
              <div className="action-menu">
                    <button onClick={() => handleDownload(order)}>{t.buttons.download}</button>
                    <button onClick={() => handleEditOrder(order)}>{t.buttons.editOrder}</button>
                    <button>{t.buttons.delete}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
  <div className="modal-overlay">
    <div className="edit-order-modal">
      <h2>Edit Order</h2>
      <form className="edit-order-form">
        <div className="form-group">
          <label htmlFor="clientName">Client Name</label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={clientDetails.clientName}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="clientPhone">Client Phone</label>
          <input
            type="text"
            id="clientPhone"
            name="clientPhone"
            value={clientDetails.clientPhone}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="clientEmail">Client Email</label>
          <input
            type="email"
            id="clientEmail"
            name="clientEmail"
            value={clientDetails.clientEmail}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="clientAddress">Client Address</label>
          <input
            type="text"
            id="clientAddress"
            name="clientAddress"
            value={clientDetails.clientAddress}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={clientDetails.city}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="postalCode">Postal Code</label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={clientDetails.postalCode}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="additionalRequirements">Additional Requirements</label>
          <textarea
            id="additionalRequirements"
            name="additionalRequirements"
            value={clientDetails.additionalRequirements}
            onChange={handleInputChange}
          />
        </div>
        <div className="modal-actions">
          <button type="button" onClick={handleSaveChanges}>Save Changes</button>
          <button type="button" onClick={handleCloseModal}>{t.buttons.close}</button>
        </div>
      </form>
    </div>
  </div>
)}

      <div className="pagination">
        {[...Array(Math.ceil(filteredOrders.length / itemsPerPage)).keys()].map((num) => (
          <button
            key={num}
            onClick={() => handlePageChange(num + 1)}
            className={currentPage === num + 1 ? "active" : ""}
          >
            {num + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;
