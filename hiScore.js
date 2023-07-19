import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyApr_r_rEFmo_CxRmM3UapGW56eUybOsyc",
  authDomain: "hiddenvariables-393304.firebaseapp.com",
  projectId: "hiddenvariables-393304",
  storageBucket: "hiddenvariables-393304.appspot.com",
  messagingSenderId: "189667231661",
  appId: "1:189667231661:web:c702a1f213dfa6a3dcc324"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

// Grab HTML elements
const scoreForm = document.getElementById('score-form');
const nameInput = document.getElementById('name-input');
const scoreInput = document.getElementById('score-input');
const walletInput = document.getElementById('wallet-input');
const topScoresList = document.getElementById('top-scores');

// Add new score
scoreForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addDoc(collection(db, 'scores'), {
    name: nameInput.value,
    score: parseInt(scoreInput.value),
    wallet: walletInput.value,
  });
  nameInput.value = '';
  scoreInput.value = '';
  walletInput.value = '';
});

// Get and display top scores
async function getTopScores() {
  const scoresQuery = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(10));
  const scoresSnapshot = await getDocs(scoresQuery);
  topScoresList.innerHTML = '';
  scoresSnapshot.forEach((doc) => {
    const scoreData = doc.data();
    topScoresList.innerHTML += `<li>${scoreData.name} - ${scoreData.score}</li>`;
  });
}

getTopScores();
