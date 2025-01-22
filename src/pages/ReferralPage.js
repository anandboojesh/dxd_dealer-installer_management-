import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from "../services/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import Lottie from 'react-lottie';
import animationData from "./refer.json";

import '../styles/components/ReferralPage.css';
import { useLanguage } from '../context/LanguageContext';

const ReferralPage = () => {
  const [referralId, setReferralId] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [rewardCount, setRewardCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false); // Modal visibility state
  const [referralHistory, setReferralHistory] = useState([]);
  const [error, setError] = useState("");
  const qrCodeRef = useRef(null);
  const { language } = useLanguage(); 

  const translations = {
    en: {
      title: "Your Unique Referral Code",
      copy: "Copy referral",
      share: "Share referral",
      showQRCode: "Show QR Code",
      referralHistory: "Referral History",
      addReferral: "Add Referral",
      totalReferrals: "Total Referrals",
      noUsers: "No users have joined using your referral code.",
      scanQRCode: "Scan this QR Code",
      loading: "Loading...",
    },
    fr: {
      title: "Votre Code de Parrainage Unique",
      copy: "Copier le code de parrainage",
      share: "Partager le code de parrainage",
      showQRCode: "Afficher le code QR",
      referralHistory: "Historique de Parrainage",
      addReferral: "Ajouter un Parrainage",
      totalReferrals: "Nombre Total de Parrainages",
      noUsers: "Aucun utilisateur n'a rejoint avec votre code de parrainage.",
      scanQRCode: "Scannez ce Code QR",
      loading: "Chargement...",
    },
  };

  const t = translations[language]; // Helper for translations

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const userDoc = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setReferralId(userData.referralId || 'N/A');
      } else {
        console.error('No such document!');
      }
    } catch (error) {
      console.error('Error fetching referral ID:', error);
    }
    finally{
      setLoading(false)
    }
  };

  const fetchReferralHistory = async () => {
    setError("");
    try {
      const userId = auth.currentUser?.uid;
      // Fetch the current user document to get the 'referrals' array
      const userDoc = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const referralIds = userData.referrals || []; // Get the referral IDs

        if (referralIds.length > 0) {
          // Query the 'users' collection to fetch details of all users who joined using this referral code
          const q = query(collection(db, "users"), where("uid", "in", referralIds));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const referralUsers = querySnapshot.docs.map((doc) => doc.data());
            setReferralHistory(referralUsers);
          } else {
            setReferralHistory([]);
          }
        } else {
          setReferralHistory([]);
        }
      } else {
        setError("User data not found.");
      }
    } catch (err) {
      console.error("Error fetching referral history:", err);
      setError("Error fetching referral history. Please try again.");
    }
  };

  useEffect(() => {
    fetchReferralHistory();
  }, []);

  const copyToClipboard = () => {
    const link = `/signup?ref=${referralId}`;
    navigator.clipboard.writeText(link)
      .then(() => alert('Referral link copied to clipboard!'))
      .catch(err => console.error('Error copying referral link:', err));
  };

  const shareQRCode = async () => {
    try {
      const canvas = qrCodeRef.current.querySelector('canvas');
      const qrImage = canvas.toDataURL('image/png'); // Generate image data from the QR code canvas

      const blob = await (await fetch(qrImage)).blob(); // Convert the image data URL to a Blob
      const file = new File([blob], 'referral-qr-code.png', { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Join us using my referral code!',
          text: `Use my referral code "${referralId}" to sign up and get started!`,
          files: [file],
        });
      } else {
        alert('Sharing not supported on this device or browser.');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div className="container">
      {loading ? (
        <p>{t.loading}</p>
      ) : (
        <>
          <Lottie options={defaultOptions} height={220} width={220} />

          <h2 className="title">{t.title}</h2>

          <div className="referral-container">
            <p className="referral-text">{referralId || 'Loading...'}</p>
          </div>

          <div className="actions-container">
            <button className="action-button" onClick={copyToClipboard}>
              {t.copy}
            </button>
            <button className="action-button" onClick={shareQRCode}>{t.share}</button>
            <button
              className="action-button"
              onClick={() => setShowQRCodeModal(true)}
            >
              {t.showQRCode}
            </button>
          </div>

          

          <div className="referrals-history">
            <h3>{t.referralHistory}</h3>
            <button>{t.addReferral}</button>
            <p><strong>{t.totalReferrals}:</strong> {referralHistory.length}</p> 
            {referralHistory.length === 0 ? (
              <p>{t.noUsers}</p>
            ) : (
              <ul className="referral-history-list">
                {referralHistory.map((user, index) => (
                  <li key={index} className="referral-history-item">
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* QR Code Modal */}
          {showQRCodeModal && (
            <div className="qr-code-modal">
              <div className="modal-content">
                <button
                  className="close-button"
                  onClick={() => setShowQRCodeModal(false)}
                >
                  ×
                </button>
                <h3>Scan this QR Code</h3>
                <QRCodeCanvas
                  value={`/signup?ref=${referralId}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReferralPage;
