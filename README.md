## ✨ Implemented Features

### 1. 🗂️ Restaurant History Log with Page Navigation

A new history tracking feature was added that allows users to save and view previously selected restaurants. After spinning the wheel, users can choose to log their final selection by clicking a **"Select This Restaurant"** button. Only selected restaurants are added to the history for clarity and intentional logging.

Users can access a dedicated **History Page** within the popup UI by clicking the **"History"** button. This view lists the last 5 selected restaurants along with timestamps, offering a simple way to track past decisions.

**Highlights:**
- Dedicated History page view within the popup.
- "Select" button ensures only intentional choices are saved.
- Persistent data storage using `localStorage`.

---

### 2. ⏳ Progress Indicator (Animated Loading Bar)

An animated **progress bar** has been integrated at the top of the popup interface to improve user feedback during restaurant data fetching. When the user opens the extension or updates settings, the progress bar animates from 0% to 100% as the API call progresses.

This progress indicator provides a responsive feel, communicates that data is being fetched in the background, and disappears smoothly once the process is complete or if an error occurs.

**Highlights:**
- Thin, elegant loading bar displayed during API calls.
- Smooth animation with `setInterval` logic.
- Handles completion and error states gracefully.