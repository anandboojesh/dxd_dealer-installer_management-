import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import products from "./Products.json";
import "../styles/components/ProductDetailsPage.css";
import { db, auth } from "../services/firebase";
import { setDoc, doc, collection } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { gapi } from "gapi-script";
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




const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
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

  // Form States
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [additionalReq, setAdditionalReq] = useState("");
  const [addreqFile, setAddreqFile] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState({});
  const { language } = useLanguage(); 

  const translations = {
    en: {
      productDetails: "Product Details",
      requestQuote: "Request a Quote",
      specifications: "Specifications",
      dimensions: "Dimensions",
      height: "Height",
      width: "Width",
      clientDetails: "Client Details",
      clientName: "Client Name",
      clientEmail: "Client Email",
      clientPhone: "Client Phone",
      city: "City",
      postalCode: "Postal Code",
      productDetailsHeader: "Product Details",
      selectedProduct: "Selected Product",
      additionalRequirements: "Additional Requirements",
      selectedGlazing: "Selected Glazing",
      selectedColor: "Selected Color",
      selectGlazingOption: "Select Glazing Option:",
      selectColor: "Select Color:",
      none: "None",
      back:"back",
      uploadAdditionalDetails: "Upload Additional Details:",
      upload: "Upload", 
      submitQuotation: "Submit Quotation",
      quotationform:"quotation form"
    },
    fr: {
      productDetails: "Détails du produit",
      requestQuote: "Demander un devis",
      specifications: "Spécifications",
      dimensions: "Dimensions",
      height: "Hauteur",
      width: "Largeur",
      clientDetails: "Détails du client",
      clientName: "Nom du client",
      clientEmail: "Email du client",
      clientPhone: "Téléphone du client",
      city: "Ville",
      postalCode: "Code postal",
      productDetailsHeader: "Détails du produit",
      selectedProduct: "Produit sélectionné",
      additionalRequirements: "Exigences supplémentaires",
      selectedGlazing: "Vitrage sélectionné",
      selectedColor: "Couleur sélectionnée",
      selectGlazingOption: "Sélectionner une option de vitrage:",
      selectColor: "Sélectionner la couleur:",
      uploadAdditionalDetails: "Téléchargez des détails supplémentaires :", 
      upload: "Télécharger", 
      submitQuotation: "Soumettre le devis",
      none: "Aucun",
      back:"dos",
      quotationform:"formulaire de devis"
    },
  };

  const t = translations[language]; // Helper for translations

  // File Upload States
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);

  // Option Selector State
  const [selectedGlazing, setSelectedGlazing] = useState(null);

  const img1 = require("../assets/double-glazing.png");
  const img2 = require("../assets/frosted-glazing.webp");
  const img3 = require("../assets/triple-glazing.jpg");
  const img4 = require("../assets/AcousticGlass.jpg");

  const glazingOptions = [
    { id: "double", name: "Double Glazing", img: img1 },
    { id: "triple", name: "Triple Glazing", img: img3 },
    { id: "frosted", name: "Frosted Glass", img: img2 },
    { id: "acoustic", name: "Acoustic Glass", img: img4 },
    { id: "tempered", name: "Tempered Glass", img: img3 },
    { id: "tinted", name: "Tinted Glass", img: img2 },
    { id: "solar", name: "Solar Reflective Glass", img: img1 },
    { id: "laminated", name: "Laminated Glass", img: img1 },
    { id: "triple-glaze", name: "Triple Glazed Glass", img: img3 },
    { id: "clear", name: "Clear Glass", img: img2 },
    { id: "decorative", name: "Decorative Patterns", img: img1 },
    { id: "single", name: "Single Glazed", img: img3 },
    { id: "insulated", name: "Insulated Glass", img: img2 },
    { id: "patterned", name: "Patterned Glass", img: img1 },
    { id: "uv-protected", name: "UV-Protected Glass", img: img3 },
    { id: "uv-filtered", name: "UV-Filtered Glass", img: img2 },
  ];

  const updatedFeatures = {
    ...selectedFeatures,
    glassType: selectedGlazing ||null,
};

  const CLIENT_ID = "743175460976-g2iv8inaqrpj10g4elt0kmh3cjgmqfnv.apps.googleusercontent.com";
  const API_KEY = "AIzaSyBdz9koMR5SPYZ5LUrUEgdy2NY55ADtTVE";
  const SCOPES = "https://www.googleapis.com/auth/drive.file";


 
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
 
 

  
  
  

  const product = products.find((p) => p.id === parseInt(productId, 10));

  if (!product) {
    return <p className="error-message">Product not found</p>;
  };

  const handleFeatureChange = (featureKey, value) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [featureKey]: value,
    }));
  };

  const handleColorSelection = (color) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      color: color,
    }));
  };

  const handleFeatureCheckboxChange = (featureKey, option, isChecked) => {
    setSelectedFeatures((prevFeatures) => {
      const currentOptions = prevFeatures[featureKey] || [];
      if (isChecked) {
        // Add the selected option
        return {
          ...prevFeatures,
          [featureKey]: [...currentOptions, option],
        };
      } else {
        // Remove the unselected option
        return {
          ...prevFeatures,
          [featureKey]: currentOptions.filter((item) => item !== option),
        };
      }
    });
  };
  


  const handleSubmitQuotation = async () => {
    const orderNumber = Math.floor(100000 + Math.random() * 900000); // Random Order Number

   

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

      const quotationData = {
        clientName,
        clientPhone,
        clientEmail,
        city: clientCity,
        postalCode,
        fileURL,
        fileName,
        fileDownload,
        product: {
          productName: product.name,
          height,
          width,
          features: updatedFeatures,
          additionalRequirements: additionalReq || "",
          glazingOption: selectedGlazing,
          uploadedFileURL: fileURL || null,
        },
        features: updatedFeatures,
        userId: auth.currentUser?.uid || "Anonymous",
        orderNumber,
        timestamp: new Date().toISOString(),
      };



      const quotationRef = collection(db, "Quotation_form");
      await setDoc(doc(quotationRef, String(orderNumber)), quotationData);

      alert(`Quotation submitted successfully! Order Number: ${orderNumber}`);

      // Reset form fields
      setClientName("");
      setClientPhone("");
      setClientEmail("");
      setClientCity("");
      setPostalCode("");
      setHeight("");
      setWidth("");
      setAdditionalReq("");
      setSelectedGlazing(null);
      setSelectedFeatures({});
      setFile(null);
      setFileURL(null);

      // Close the popup
      setShowPopup(false);
    } catch (error) {
      console.error("Error submitting quotation:", error);
      alert("Failed to submit quotation. Please try again.");
    }
  };

  return (
    <div className="product-detail-page">
      <header className="header">
        <button className="back-button121" onClick={() => navigate(-1)}>
          &larr; {t.back}
        </button>
        <h2>{t.productDetails}</h2>
      </header>
      <div className="product-detail-container">
        <div className="product-image-container">
          <img src={productImages[product.imageId]} alt={product.name} className="product-image" />
        </div>
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-category">Category: {product.category}</p>

          {product.features?.glassType && (
  <div className="glazing-options">
    <h3>{t.selectGlazingOption}:</h3>
    <div className="options-container">
      {glazingOptions
        .filter((option) => product.features.glassType.includes(option.name))  // Filter based on the glassType
        .map((option) => (
          <div
            key={option.id}
            className={`option ${selectedGlazing === option.id ? "selected" : ""}`}
            onClick={() => setSelectedGlazing(option.id)}
          >
            <img src={option.img} alt={option.name} />
            <p>{option.name}</p>
          </div>
        ))}
    </div>
  </div>
)}


{product.features?.colorOptions && (
            <div className="color-selection">
              <h3>{t.selectColor}:</h3>
              <div className="color-options">
                {product.features.colorOptions.map((color) => (
                  <div
                    key={color}
                    className={`color-circle ${
                      selectedFeatures.color === color ? "selected" : ""
                    }`}
                    style={{
                      backgroundColor: color.toLowerCase(),
                    }}
                    onClick={() => handleColorSelection(color)}
                  ></div>
                ))}
              </div>
            </div>
          )}

<div>
                  <h4>{t.dimensions}:</h4>
                  <div>
                    <label>{t.height}:</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>{t.width}:</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                    />
                  </div>
                </div>


{product.features && Object.keys(product.features).length > 0 && (
            <div className="product-features">
              <h3>{t.specifications}:</h3>
              <ul>
              {Object.entries(product.features).map(([featureKey, featureValue]) => {
  // Skip certain feature keys
  if (featureKey === "dimensions") return null;
  if (featureKey === "colorOptions") return null;
  if (featureKey === "glassType") return null;

  // Handle array-based features with checkboxes for specific keys
  if (
    featureKey === "accessories" ||
    featureKey === "additionalFeatures" ||
    featureKey === "additionalItems"
  ) {
    return (
      <div key={featureKey}>
        <strong>{featureKey.replace(/([A-Z])/g, " $1")}:</strong>
        <div>
          {featureValue.map((option) => (
            <label key={option} style={{ display: "block", marginBottom: "5px" }}>
              <input
              className="custom-checkbox"
                type="checkbox"
                value={option}
                checked={selectedFeatures[featureKey]?.includes(option) || false}
                onChange={(e) =>
                  handleFeatureCheckboxChange(featureKey, option, e.target.checked)
                }
              />
              {option}
            </label>
          ))}
        </div>
      </div>
    );
  }

  // Handle other array-based features with dropdowns
  if (Array.isArray(featureValue)) {
    return (
      <div key={featureKey}>
        <strong>{featureKey.replace(/([A-Z])/g, " $1")}:</strong>
        <select
          value={selectedFeatures[featureKey] || ""}
          onChange={(e) => handleFeatureChange(featureKey, e.target.value)}
        >
          <option value="">Select {featureKey}</option>
          {featureValue.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
})}

               
              </ul>
            </div>
          )}



          <button
            className="add-to-cart-button"
            onClick={() => setShowPopup(true)}
          >
            {t.requestQuote}
          </button>
        </div>
      </div>

      {/* Quotation Form Popup */}
      {showPopup && (
        <div className="quotation-popup">
          <div className="quotation-popup-content">
            <h2>{t.quotationform}</h2>
            <div className="quotation-form-section">
              <h3>{t.clientDetails}</h3>
              <label className="quotation-label">
                {t.clientName}:
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="quotation-input"
                  
                />
              </label>
              <label className="quotation-label">
              {t.clientEmail}:
                <input
                className="quotation-input"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
              </label>
              <label className="quotation-label">
              {t.clientPhone}:
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required
                  className="quotation-input"
                />
              </label>
              <label>
              {t.city}:
                <input
                  value={clientCity}
                  onChange={(e) => setClientCity(e.target.value)}
                  required
                  className="quotation-input"
                />
              </label>
              <label>
              {t.postalCode}:
                <input
                  type="number"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="quotation-form-section">
              <h3>{t.productDetails}</h3>
              <label>
              {t.selectedProduct}:
              </label>
              <input  value={product.name} readOnly />
              <label>
              {t.height} (ft):
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </label>
              <label>
              {t.width} (ft):
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  required
                />
              </label>
              <label>
              {t.selectedGlazing}:
              <input
                  value={
                    glazingOptions.find((option) => option.id === selectedGlazing)?.name ||
                    "None"
                  }
                  readOnly
                />
              </label>
              <label>
                {t.selectColor}
                  <input
                    value={selectedFeatures.color || "None"}
                    readOnly
                  />
                </label>
                <label>
                  {t.dimensions}:
                    <input
                      value={`${height || "N/A"} (H) x ${width || "N/A"} (W)`}
                      readOnly
                    />
                  </label>
              <label>
              {t.additionalRequirements}:
                
              </label>
              <textarea
                  value={additionalReq}
                  onChange={(e) => setAdditionalReq(e.target.value)}
                  className="quotation-form-textarea"
                  style={{width:'100%',  padding: '12px', borderRadius:'15px'}}
                />
            </div>
  
 
  {Object.entries(selectedFeatures)
    .filter(([key]) => !["color", "dimensions"].includes(key))
    .map(([key, value]) => (
      <label key={key}>
        {key.replace(/([A-Z])/g, " $1")}:
        <input type="text" value={value} readOnly />
      </label>
      ))}

            <div className="quotation-form-section">
              <h3>{t.uploadAdditionalDetails}</h3>
              <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.docx"
                  onChange={(e) => setAddreqFile(e.target.files[0])}
                />
            </div>
            <div className="quotation-form-actions">
              <button
                className="quotation-close-button"
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
              <button
                className="quotation-submit-button"
                onClick={handleSubmitQuotation}
              >
                {t.submitQuotation}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
