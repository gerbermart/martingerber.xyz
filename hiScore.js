import firebase from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js';
import 'https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore-compat.js';

const firebaseConfig = {
  apiKey: "AIzaSyApr_r_rEFmo_CxRmM3UapGW56eUybOsyc",
  authDomain: "hiddenvariables-393304.firebaseapp.com",
  projectId: "hiddenvariables-393304",
  storageBucket: "hiddenvariables-393304.appspot.com",
  messagingSenderId: "189667231661",
  appId: "1:189667231661:web:c702a1f213dfa6a3dcc324"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Grab HTML elements
const scoreForm = document.getElementById('score-form');
const nameInput = document.getElementById('name-input');
const scoreInput = document.getElementById('score-input');
const walletInput = document.getElementById('wallet-input');
const topScoresList = document.getElementById('top-scores');

// Add new score
scoreForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await db.collection('scores').add({
    name: nameInput.value,
    score: parseInt(scoreInput.value),
    wallet: walletInput.value,
  });
  nameInput.value = '';
  scoreInput.value = '';
  walletInput.value = '';
});

// Get and display top scores
function getTopScores() {
  db.collection('scores').orderBy('score', 'desc').limit(10)
    .get()
    .then((querySnapshot) => {
      topScoresList.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const scoreData = doc.data();
        topScoresList.innerHTML += `<li>${scoreData.name} - ${scoreData.score}</li>`;
      });
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
}

getTopScores();
