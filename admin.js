const firebaseConfig = {
    apiKey: "",
    authDomain: "smartstadium-ea49d.firebaseapp.com",
    projectId: "smartstadium-ea49d",
    storageBucket: "smartstadium-ea49d.firebasestorage.app",
    messagingSenderId: "1007950718228",
    appId: "1:1007950718228:web:886f56ec77f217f8f70e01"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let adminMap;

function initAdminMap() {
    adminMap = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 17
    });
    const zones = {
        gate_a: { name: 'Gate A', lat: 37.7749, lng: -122.4194 },
        concessions: { name: 'Concessions', lat: 37.7755, lng: -122.4189 },
        restrooms: { name: 'Restrooms', lat: 37.7745, lng: -122.4180 }
    };
    for (const [id, z] of Object.entries(zones)) {
        new google.maps.Marker({ position: { lat: z.lat, lng: z.lng }, map: adminMap, title: z.name });
    }
}

document.getElementById('update-crowd').addEventListener('click', async () => {
    const zone = document.getElementById('zone-select').value;
    const crowdLevel = document.getElementById('crowd-select').value;
    await db.collection('crowdData').doc(zone).set({ crowdLevel, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    alert(`Crowd level for ${zone} updated to ${crowdLevel}`);
});

document.getElementById('call-next').addEventListener('click', async () => {
    const zone = document.getElementById('queue-zone').value;
    const entriesRef = db.collection('queues').doc(zone).collection('entries').orderBy('joinedAt').limit(1);
    const snapshot = await entriesRef.get();
    if (snapshot.empty) {
        alert('No one in queue');
        return;
    }
    const firstEntry = snapshot.docs[0];
    await firstEntry.ref.update({ status: 'ready', calledAt: firebase.firestore.FieldValue.serverTimestamp() });
    alert(`Called next person in ${zone} queue`);
    const remaining = (await db.collection('queues').doc(zone).collection('entries').where('status', '==', 'waiting').get()).size;
    await db.collection('queues').doc(zone).set({ length: remaining }, { merge: true });
    loadQueues();
});

function loadQueues() {
    const zone = document.getElementById('queue-zone').value;
    db.collection('queues').doc(zone).collection('entries').where('status', '==', 'waiting').orderBy('joinedAt').onSnapshot(snap => {
        const listDiv = document.getElementById('queue-list');
        listDiv.innerHTML = `<strong>Waiting (${snap.size}):</strong><br>` + (snap.empty ? 'None' : snap.docs.map(doc => doc.data().userId).join(', '));
    });
}
document.getElementById('queue-zone').addEventListener('change', loadQueues);
loadQueues();
