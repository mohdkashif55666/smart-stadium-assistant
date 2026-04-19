const firebaseConfig = {
    apiKey: "AIzaSyCe-HHNjKgvJPKxjEbK3wd0c4dBh2YBfiQ",
    authDomain: "smartstadium-ea49d.firebaseapp.com",
    projectId: "smartstadium-ea49d",
    storageBucket: "smartstadium-ea49d.firebasestorage.app",
    messagingSenderId: "1007950718228",
    appId: "1:1007950718228:web:886f56ec77f217f8f70e01"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let map;
let currentZone = null;
let currentQueueDocId = null;
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
}

const zones = {
    gate_a: { name: 'Gate A', lat: 37.7749, lng: -122.4194, crowd: 'medium', waitBase: 45 },
    concessions: { name: 'Main Concessions', lat: 37.7755, lng: -122.4189, crowd: 'high', waitBase: 60 },
    restrooms: { name: 'Restrooms East', lat: 37.7745, lng: -122.4180, crowd: 'low', waitBase: 30 }
};

function initMap() {
    const stadiumCenter = { lat: 37.7749, lng: -122.4194 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: stadiumCenter,
        mapTypeId: 'roadmap'
    });

    for (const [id, zone] of Object.entries(zones)) {
        const marker = new google.maps.Marker({
            position: { lat: zone.lat, lng: zone.lng },
            map: map,
            title: zone.name,
            icon: getMarkerIcon(zone.crowd)
        });
        marker.addListener('click', () => selectZone(id));
    }

    db.collection('crowdData').onSnapshot(snapshot => {
        snapshot.forEach(doc => {
            if (zones[doc.id]) {
                zones[doc.id].crowd = doc.data().crowdLevel;
                if (currentZone === doc.id) updateUI();
            }
        });
    });
}

function getMarkerIcon(crowdLevel) {
    let color = 'green';
    if (crowdLevel === 'medium') color = 'orange';
    if (crowdLevel === 'high') color = 'red';
    return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: color,
        fillOpacity: 0.8,
        strokeWeight: 2,
        strokeColor: 'white'
    };
}

function selectZone(zoneId) {
    currentZone = zoneId;
    document.getElementById('join-queue-btn').disabled = false;
    updateUI();
}

function updateUI() {
    const zone = zones[currentZone];
    document.getElementById('zone-name').innerText = zone.name;
    document.getElementById('crowd-level').innerText = zone.crowd.toUpperCase();
    let waitSec = zone.waitBase;
    if (zone.crowd === 'high') waitSec = 120;
    if (zone.crowd === 'medium') waitSec = 75;
    document.getElementById('wait-time').innerText = `${waitSec} seconds`;
}

document.getElementById('join-queue-btn').addEventListener('click', async () => {
    const zone = zones[currentZone];
    const queueRef = db.collection('queues').doc(currentZone);
    const queueSnap = await queueRef.get();
    let queueLength = queueSnap.exists ? queueSnap.data().length || 0 : 0;
    const position = queueLength + 1;
    const estimatedWait = position * (zone.crowd === 'high' ? 60 : 45);

    const newQueueDoc = await db.collection('queues').doc(currentZone).collection('entries').add({
        userId: userId,
        joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
        estimatedWait: estimatedWait,
        status: 'waiting'
    });
    currentQueueDocId = newQueueDoc.id;

    await queueRef.set({ length: position }, { merge: true });

    document.getElementById('queue-status').innerHTML = `✅ You are #${position} in queue. Estimated wait: ${Math.ceil(estimatedWait / 60)} min. You'll be notified when ready.`;

    const unsubscribe = db.collection('queues').doc(currentZone).collection('entries').doc(currentQueueDocId)
        .onSnapshot(doc => {
            if (doc.exists && doc.data().status === 'ready') {
                alert(`🎉 Your turn at ${zone.name}! Please proceed.`);
                unsubscribe();
                document.getElementById('queue-status').innerHTML += `<br>🔔 It's your turn!`;
            }
        });
});
