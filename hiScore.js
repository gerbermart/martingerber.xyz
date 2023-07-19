// Firebase initialization
const firebaseConfig = {
    apiKey: "AIzaSyApr_r_rEFmo_CxRmM3UapGW56eUybOsyc",
    authDomain: "hiddenvariables-393304.firebaseapp.com",
    projectId: "hiddenvariables-393304",
    storageBucket: "hiddenvariables-393304.appspot.com",
    messagingSenderId: "189667231661",
    appId: "1:189667231661:web:3292e7668c2f42ccdcc324"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let db = firebase.firestore();

// Submit form
const form = document.querySelector('#score-form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let name = document.querySelector('#name-input').value;
    let score = document.querySelector('#score-input').value;
    let wallet = document.querySelector('#wallet-input').value;
    
    let data = {
        name: name,
        score: parseInt(score),
        wallet_address: wallet || null
    };

    db.collection('hiddenvariables-393304').doc('ru7FP2itWlTlSzrgA1Qv').set(data)
        .then(() => {
            console.log("Document successfully written!");
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
});

// Get top scores
db.collection('hiddenvariables-393304').doc('ru7FP2itWlTlSzrgA1Qv').get()
    .then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            displayScores(doc.data());
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    })
    .catch((error) => {
        console.log("Error getting document:", error);
    });

function displayScores(scores) {
    let scoreList = document.querySelector('#top-scores');
    scoreList.innerHTML = '';
    scores.sort((a,b) => b.score - a.score).slice(0,10).forEach(score => {
        let li = document.createElement('li');
        li.textContent = `${score.name}: ${score.score}`;
        scoreList.appendChild(li);
    });
}
