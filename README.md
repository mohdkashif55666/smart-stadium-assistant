# Smart Stadium Assistant

## Vertical
Large‑scale sporting venue – improves physical event experience by reducing crowd congestion, waiting times, and enabling real‑time coordination.

## Approach & Logic
- Real‑time crowd heatmap via Google Maps + Firebase Firestore (staff updates levels → users see colored markers).
- Digital queue system – users join a queue for concessions/gates/restrooms, get estimated wait time, and receive a real‑time notification (via Firestore listener) when it's their turn.
- Staff dashboard allows venue operators to update crowd levels and call next person in queue.
- No authentication required for attendees (anonymous ID stored locally).

## How It Works
1. Attendee opens `index.html` → sees stadium map with color‑coded zones (green = low, orange = medium, red = high).
2. Clicks a zone → views crowd level and estimated wait time → clicks "Join Digital Queue".
3. Staff opens `admin.html` → updates crowd levels or calls next person from any queue.
4. When staff calls next, the attendee's page instantly shows an alert and queue status updates.

## Assumptions
- Users have smartphones with internet access.
- Venue has WiFi/4G coverage.
- Staff has access to the dashboard (laptop/tablet).
- Crowd levels are updated manually by staff (real sensors can be integrated later).
- Google Maps API key is provided and Maps JavaScript API is enabled.

## Google Services Used
- **Firebase Firestore** – real‑time database for crowd levels and queues.
- **Google Maps JavaScript API** – interactive venue map with markers.

## Setup Instructions
1. Replace `YOUR_API_KEY` in `index.html` and `admin.html` with a valid Google Maps API key.
2. Create a Firebase project and enable Firestore (test mode).
3. Copy the Firebase config into `app.js` and `admin.js`.
4. Serve files via any local server (e.g., `npx http-server`) or open directly (CORS may affect some features).
5. Open `index.html` for attendee view, `admin.html` for staff.

## Repository Size
< 1 MB (no images, no node_modules).
