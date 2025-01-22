import React, { useState, useRef, useEffect } from "react";
import "../styles/components/ProductPage.css";
import { FaTrash } from "react-icons/fa";
import products from "./Products.json";
import { db, auth } from "../services/firebase";
import { addDoc, collection, getFirestore, setDoc, doc, getDoc } from "firebase/firestore"; // Firebase Firestore import
import { useNavigate } from 'react-router-dom';

import fenetrePvcStandard from "../assets/fenetre-pvc-standard.jpg"; // Fenêtre PVC Standard
import FenêtreAluminiumTiltTurn from "../assets/Fenêtre Aluminium Tilt & Turn.jpg"; // Fenêtre Aluminium Tilt & Turn
import AcousticGlassCoulissantAluminium from "../assets/CoulissantAluminium.jpg"; // Coulissant Aluminium (Sliding Window)
import GalandageAluminium from "../assets/CoulissantAluminium.jpg"; // Galandage Aluminium (Pocket Sliding Window)
import FenêtreBois from "../assets/fenetre-pvc-standard.jpg"; // Fenêtre Bois (Traditional Wooden Window)
import VoletRoulantPVC from "../assets/Fenêtre Aluminium Tilt & Turn.jpg"; // Volet Roulant PVC (Rolling Shutter)
import VoletRoulantAluminium from "../assets/CoulissantAluminium.jpg"; // Volet Roulant Aluminium (Rolling Shutter)
import VoletBattantBois from "../assets/CoulissantAluminium.jpg"; // Volet Battant Bois (Hinged Wooden Shutter)
import VoletBattantAluminium from "../assets/fenetre-pvc-standard.jpg"; // Volet Battant Aluminium (Hinged Aluminium Shutter)
import VoletPersiennesAluminium from "../assets/Fenêtre Aluminium Tilt & Turn.jpg"; // Volet Persiennes Aluminium (Louvered Shutter)
import PortesEntréeMonoblocAluminium from "../assets/CoulissantAluminium.jpg"; // Portes d'Entrée Monobloc Aluminium
import PortesEntréeParcloseesAluminium from "../assets/CoulissantAluminium.jpg"; // Portes d'Entrée Parclosees Aluminium
import PortesEntréeVitréesAluminium from "../assets/fenetre-pvc-standard.jpg"; // Portes d'Entrée Vitrées Aluminium
import PortesEntréeAcier from "../assets/Fenêtre Aluminium Tilt & Turn.jpg"; // Portes d'Entrée Acier
import PortesEntréeParcloseesPVC from "../assets/CoulissantAluminium.jpg"; // Portes d'Entrée Parclosees PVC
import StoreBanne from "../assets/CoulissantAluminium.jpg"; // Store Banne (Retractable Awning)
import StoreIntérieur from "../assets/fenetre-pvc-standard.jpg"; // Store Intérieur (Interior Shade)
import PergolaAluminium from "../assets/Fenêtre Aluminium Tilt & Turn.jpg"; // Pergola Aluminium
import PergolaBioclimatique from "../assets/CoulissantAluminium.jpg"; // Pergola Bioclimatique
import StoreVertical from "../assets/CoulissantAluminium.jpg"; // Store Vertical (Vertical Shade for Pergola)
import VérandaAluminium from "../assets/fenetre-pvc-standard.jpg"; // Véranda Aluminium
import VérandaPVC from "../assets/Fenêtre Aluminium Tilt & Turn.jpg"; // Véranda PVC
import VérandaBois from "../assets/CoulissantAluminium.jpg"; // Véranda Bois
import VérandaBioclimatique from "../assets/CoulissantAluminium.jpg"; // Véranda Bioclimatique
import PortailAluminium from "../assets/fenetre-pvc-standard.jpg"; // Portail Aluminium
import PortailPVC from "../assets/Fenêtre Aluminium Tilt & Turn.jpg"; // Portail PVC
import ClôturesAluminium from "../assets/CoulissantAluminium.jpg"; // Clôtures Aluminium
import ClôturesPVC from "../assets/CoulissantAluminium.jpg"; // Clôtures PVC
import PorteGarageSectionnelle from "../assets/fenetre-pvc-standard.jpg"; // Porte de Garage Sectionnelle
import PorteGarageEnroulable from "../assets/Fenêtre Aluminium Tilt & Turn.jpg"; // Porte de Garage Enroulable
import PorteGarageLatérale from "../assets/CoulissantAluminium.jpg"; // Porte de Garage Latérale
import PorteGarageBasculante from "../assets/CoulissantAluminium.jpg"; // Porte de Garage Basculante
import Motorisation from "../assets/fenetre-pvc-standard.jpg"; // Motorisation (Gate Motors)
import GardeCorpsAluminium from "../assets/Fenêtre Aluminium Tilt & Turn.jpg"; // Garde Corps Aluminium (Aluminium Railings)
import { useLanguage } from "../context/LanguageContext";
import { gapi } from "gapi-script";


  const productImages = {
    1: fenetrePvcStandard,
    2: FenêtreAluminiumTiltTurn,
    3: AcousticGlassCoulissantAluminium,
    4: GalandageAluminium,
    5: FenêtreBois,
    6: VoletRoulantPVC,
    7: VoletRoulantAluminium,
    8: VoletBattantBois,
    9: VoletBattantAluminium,
    10: VoletPersiennesAluminium,
    11: PortesEntréeMonoblocAluminium,
    12: PortesEntréeParcloseesAluminium,
    13: PortesEntréeVitréesAluminium,
    14: PortesEntréeAcier,
    15: PortesEntréeParcloseesPVC,
    16: StoreBanne,
    17: StoreIntérieur,
    18: PergolaAluminium,
    19: PergolaBioclimatique,
    20: StoreVertical,
    21: VérandaAluminium,
    22: VérandaPVC,
    23: VérandaBois,
    24: VérandaBioclimatique,
    25: PortailAluminium,
    26: PortailPVC,
    27: ClôturesAluminium,
    28: ClôturesPVC,
    29: PorteGarageSectionnelle,
    30: PorteGarageEnroulable,
    31: PorteGarageLatérale,
    32: PorteGarageBasculante,
    33: Motorisation,
    34: GardeCorpsAluminium
  };

const ProductPage = () => {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [cart, setCart] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [orderNo, setOrderNo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [additionalReq, setAdditionalReq] = useState('');
  const [productscount, setProductscount] = useState([]);
  const [addreqFile, setAddreqFile] = useState("");
  const [addreqLink, setAddreqLink] = useState("")
  const itemsPerPage = 6; // Number of products per page

  
const initGoogleDrive = () => {
  gapi.load("client:auth2", async () => {
    try {
      await gapi.client.init({
        apiKey: "AIzaSyCqnGTE4lch5-E1e4b_t_0ZJ7NIdX2jpwE",
        clientId: "664226390519-b7j6cibgtosdbtei8hdossfm0gkioode.apps.googleusercontent.com",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        scope: "https://www.googleapis.com/auth/drive.file",
      });
      console.log("Google API initialized successfully.");
    } catch (error) {
      console.error("Error initializing Google API:", error);
    }
  });
};


useEffect(() => {
  initGoogleDrive();
}, []);

const uploadFileToGoogleDrive = async (file) => {
  const FOLDER_ID = "11Dxp4wBOQ6agkp47CL55ybAgLINKQqQL";

  try {
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn();
    }

    const token = authInstance.currentUser.get().getAuthResponse().access_token;

    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [FOLDER_ID],
    };

    const formData = new FormData();
    formData.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    formData.append("file", file);

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: new Headers({ Authorization: `Bearer ${token}` }),
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    console.log("File uploaded successfully:", data);
    return data.id;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};



  const { language } = useLanguage(); 

  const translations = {
    en: {
      catalog: "Product Catalog",
      search: "Search products...",
      addToQuotation: "Add to Quotation",
      allCategories: "All Categories",
      quotationSummary: "Quotation Summary",
      noProducts: "No products in quotation.",
      proceed: "Proceed",
      previous: "Previous",
      next: "Next",
      uploadAdditionalDetails: "Upload Additional Details:",
    },
    fr: {
      catalog: "Catalogue de Produits",
      search: "Rechercher des produits...",
      addToQuotation: "Ajouter au Devis",
      allCategories: "Toutes les Catégories",
      quotationSummary: "Résumé de Devis",
      noProducts: "Aucun produit dans le devis.",
      proceed: "Procéder",
      previous: "Précédent",
      next: "Suivant",
      uploadAdditionalDetails: "Téléchargez des détails supplémentaires :",
    },
  };

  const t = translations[language]
 
  const navigate = useNavigate()

  const quotationRef = useRef(null); // Create a reference for the Quotation Summary section

  const categories = Array.from(new Set(products.map((product) => product.category)));

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(query)
      )
    );
    setCurrentPage(1); // Reset to the first page on search
  };

  

  const filterByCategory = (category) => {
    setFilteredProducts(
      category === "All"
        ? products
        : products.filter((product) => product.category === category)
    );
    setCurrentPage(1); // Reset to the first page on filter change
  };

  const addToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
    setTimeout(() => {
      // Scroll to the Quotation Summary section
      quotationRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((product) => product.id !== productId));
    setFormData((prevData) => {
      const newData = { ...prevData };
      delete newData[productId];
      return newData;
    });
  };

  const handleSubmitProductForm = async (productId) => {
    const productFeatures = formData[productId] || {};
    // Prepare data for Firebase
    
  
    try {

      let fileURL = null;
      let fileName = null;
      let fileDownload = null;
  
      if (addreqFile) {
        const fileId = await uploadFileToGoogleDrive(addreqFile);
        fileURL = `https://drive.google.com/file/d/${fileId}/view`;
        fileDownload = `https://drive.usercontent.google.com/u/0/uc?id=${fileId}&export=download`;
        fileName = addreqFile.name; // Extract the file name
      }

      const dataToSubmit = {
        clientName: clientName || "Unknown", // Ensure the clientName is always a string
        clientPhone: clientPhone,
        clientEmail: clientEmail,
        city: clientCity,
        postalCode: postalCode,
        fileURL,
        fileName,
        fileDownload,
        
        product: {
          productName: cart.find((item) => item.id === productId)?.name || "Unknown",
          category: cart.find((item) => item.id === productId)?.category || "Unknown",
          height: height,
          width: width,
          features: productFeatures,
          additionalRequirements: additionalReq|| "",
        },
        userId: auth.currentUser?.uid || "Anonymous",
        orderNumber: Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date().toISOString(),
        status:"Pending"
      };

      // Fetch username from the users collection
    let username = "Anonymous";
    if (auth.currentUser?.uid) {
      const userDoc = await getDoc(doc(collection(db, "users"), auth.currentUser.uid));
      username = userDoc.exists() ? userDoc.data().name || "Anonymous" : "Anonymous";
    }

      // Save to Firebase
      const quotationRef = collection(db, "Quotation_form");
      await setDoc(doc(quotationRef, String(dataToSubmit.orderNumber)), dataToSubmit);

      const productName = cart.find((item) => item.id === productId)?.name || "Unknown"; // Retrieve product name
      await addDoc(collection(db, "Notification"), {
        message: `Your Quotation #${dataToSubmit.orderNumber} for ${productName} has been submitted to admin for review.`,
        createdAt: new Date(),
        userId: dataToSubmit.userId, // Ensure userId is referenced properly
        orderNumber: dataToSubmit.orderNumber, // Store order number for reference
        read: "false",
        type:"alert"
      });

      const adminId = "4RdT9OAyUZVK7q5cy16yy71tVMl2";

      await addDoc(collection(db, "Notification"), {
        message: `A Quotation request for ${productName} with order number #${dataToSubmit.orderNumber} has beesn submitted by "${username}", and is now under review. Please review the request and take appropriate action.`,
        createdAt: new Date(),
        userId: adminId, // Ensure userId is referenced properly
        orderNumber: dataToSubmit.orderNumber, // Store order number for reference
        read: "false",
        type:"alert"
      });


  
      alert(`Quotation submitted successfully! Order Number: ${dataToSubmit.orderNumber}`);
    } catch (error) {
      console.error("Error submitting quotation:", error);
      alert(error);
      return;
    }
  
    // Remove the submitted product from the cart
    setCart((prevCart) =>
      prevCart.filter((product) => product.id !== productId)
    );
  
    // Remove form data for the submitted product
    setFormData((prevData) => {
      const newData = { ...prevData };
      delete newData[productId];
      return newData;
    });
  
    // Close popup if no more active products remain
    if (cart.length === 1) {
      setShowPopup(false);
    }
  };
  

 
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  return (
    <div className="product-page">
      <h1>{t.catalog}</h1>

      {/* Search and Filter Section */}
      <div className="search-filter">
        <input
          type="text"
          placeholder={t.search}
          onChange={handleSearch}
        />
        <select onChange={(e) => filterByCategory(e.target.value)}>
          <option value="All">{t.allCategories}</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Product List */}
      <div className="product-list">
        {displayedProducts.map((product) => (
          <div key={product.id} className="product-card-grid">
             <div 
        className="product-card-grid-info"
        onClick={() => navigate(`/product-details/${product.id}`)} // Navigate to product details
      >
        <img
          src={productImages[product.imageId]}
          alt={product.name}
          className="product-image"
        />
        <h3>{product.name}</h3>
        <p>{product.category}</p>
      </div>
            <button onClick={() => addToCart(product)}>{t.addToQuotation}</button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          className={currentPage === 1 ? "disabled" : ""}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {t.previous}
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={currentPage === index + 1 ? "active" : ""}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className={currentPage === totalPages ? "disabled" : ""}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {t.next}
        </button>
      </div>

      {/* Cart Section */}
      <div className="cart" ref={quotationRef}>
        <h2>{t.quotationSummary}</h2>
        {cart.length > 0 ? (
          <>
            <ul>
              {cart.map((item) => (
                <li key={item.id} className="cart-item">
                  {item.name}
                  <FaTrash
                    className="delete-icon"
                    onClick={() => removeFromCart(item.id)}
                  />
                </li>
              ))}
            </ul>
            <button
              className="submit-button1"
              onClick={() => setShowPopup(true)}
              style={{ backgroundColor: "orange", fontWeight: "bold" }}
            >
             {t.proceed}
            </button>
          </>
        ) : (
          <p>{t.noProducts}</p>
        )}
      </div>

      {/* Quotation Form Popup */}
      {showPopup && (
  <>
    {/* Overlay to cover the background */}
    <div className="quotation-form-overlay"></div>

    {/* Modal Content */}
    <div className="quotation-form-popup">
      <div className="quotation-form-popup-content">
        <h2>Quotation Form</h2>

        {/* Tabs for Switching Between Products */}
        <div className="quotation-form-tabs">
          {cart.map((product, index) => (
            <button
              key={product.id}
              className={`quotation-form-tab-button ${activeTab === index ? "quotation-form-active-tab" : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {product.name}
            </button>
          ))}
        </div>

        {/* Client Details Section */}
        <div className="quotation-form-client-section">
          <h3>Client Details</h3>
          <div className="quotation-form-group">
            <label>Client Name:</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="quotation-form-group">
            <label>Client Email:</label>
            <input
              type="email"
              required
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="quotation-form-group">
            <label>Client Phone:</label>
            <input
              type="tel"
              required
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
          <div className="quotation-form-group">
            <label>City:</label>
            <input
              type="text"
              required
              value={clientCity}
              onChange={(e) => setClientCity(e.target.value)}
              placeholder="Enter your city"
            />
          </div>
          <div className="quotation-form-group">
            <label>Postal Code:</label>
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Enter postal code"
            />
          </div>
        </div>

        {/* Product Details Section */}
        <div className="quotation-form-product-section">
          <h3>Product Details & Features</h3>
          {cart.length > 0 && (
            <div className="quotation-form-product-details">
              <div className="quotation-form-group">
                <label>Selected Product:</label>
                <input type="text" value={cart[activeTab]?.name} readOnly />
              </div>
              <div className="quotation-form-group">
                <label>Height (ft):</label>
                <input
                  type="number"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Enter height"
                />
              </div>
              <div className="quotation-form-group">
                <label>Width (ft):</label>
                <input
                  type="number"
                  required
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="Enter width"
                />
              </div>
              {/* Features Section */}
              {Object.entries(cart[activeTab]?.features || {}).map(
                ([featureKey, featureValues]) => {
                  if (featureKey === "dimensions") return null;
                  return (
                    <>
                    <div key={featureKey} className="quotation-form-group">
                      <label>{featureKey.replace(/([A-Z])/g, " $1")}:</label>
                      {/* Handle single or multiple options */}
            {Array.isArray(featureValues) && featureValues.length === 1 ? (
        <input type="text" value={featureValues[0]} readOnly />
      ) : Array.isArray(featureValues) ? (
         featureKey === "accessories" || featureKey === "additionalFeatures" || featureKey === "additionalItems" ? (
          <div className="quotation-form-checkbox-group">
            {featureValues.map((option) => (
              <label key={option}>
                <input
                  type="checkbox"
                  value={option}
                  checked={formData[cart[activeTab]?.id]?.[featureKey]?.includes(option) || false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData((prevData) => {
                      const currentSelection = prevData[cart[activeTab]?.id]?.[featureKey] || [];
                      const newSelection = checked
                        ? [...currentSelection, option]
                        : currentSelection.filter((item) => item !== option);

                      return {
                        ...prevData,
                        [cart[activeTab]?.id]: {
                          ...prevData[cart[activeTab]?.id],
                          [featureKey]: newSelection,
                        },
                      };
                    });
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        ) : (
          <select
            value={formData[cart[activeTab]?.id]?.[featureKey] || ""}
            onChange={(e) =>
              setFormData((prevData) => ({
                ...prevData,
                [cart[activeTab]?.id]: {
                  ...prevData[cart[activeTab]?.id],
                  [featureKey]: e.target.value,
                },
              }))
            }
          >
            <option value="">Select an option</option>
            {featureValues.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      ) : (
        <input type="text" value={String(featureValues)} readOnly />
      )}
          </div>
          </>
        );
      })}

              <div className="quotation-form-group">
                <label>Additional Requirements:</label>
                <textarea
                  value={additionalReq}
                  onChange={(e) => setAdditionalReq(e.target.value)}
                  placeholder="Add any additional requests here"
                />
              </div>
              <div className="quotation-form-group">
              <label>upload Additional Details</label>
              <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.docx"
                  onChange={(e) => setAddreqFile(e.target.files[0])}
                />
            </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="quotation-form-actions">
          <button className="quotation-form-close-button" onClick={() => setShowPopup(false)}>
            Close
          </button>
          <button
            className="quotation-form-submit-button"
            onClick={() => handleSubmitProductForm(cart[activeTab]?.id)}
          >
            Submit Quotation
          </button>
        </div>
      </div>
    </div>
  </>
)}


    
    </div>
  );
};

export default ProductPage;
