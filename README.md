# Weekly Budget Tracker - PWA

A Progressive Web App for tracking your weekly expenses and budget.

## 🚀 How to Use

### Important: Why You Need the Server

**PWAs (Progressive Web Apps) require a web server to function.** You cannot simply open `index.html` directly in your browser because:

- Service workers (which enable offline functionality) only work over HTTP/HTTPS
- Opening files directly uses the `file://` protocol, which browsers block for security
- The server is lightweight and runs locally on your PC

### Starting the App

#### On Windows PC:

1. **Double-click `start.bat`** in this folder
2. The server will start and show you two URLs:
   - **Local Access**: `http://localhost:5500` (for your PC)
   - **iPhone Access**: `http://YOUR-IP:5500` (for your phone)
3. Open the URL in your browser

#### On iPhone:

1. Make sure your iPhone is on the **same WiFi network** as your PC
2. Start the server on your PC (see above)
3. Open Safari on your iPhone
4. Go to the **iPhone Access** URL shown in the server window
5. Tap the **Share button** (square with arrow)
6. Tap **"Add to Home Screen"**
7. The app will now appear as an icon on your home screen!

### Offline Usage

Once you've loaded the app with the server running:

✅ **The app WILL work offline** - all your data is stored locally
✅ **You can close the browser and reopen it** - data persists
✅ **On iPhone**: Once installed to home screen, it works like a native app

⚠️ **However**: You still need to access it through the browser at `http://localhost:5500`, not by opening the HTML file directly.

### Stopping the Server

- Press `Ctrl+C` in the PowerShell window
- Or simply close the window

## 📱 Features

- Set weekly budget goals
- Track expenses and income
- View remaining budget in real-time
- Categorize transactions (Food, Transport, Shopping, etc.)
- View transaction history
- Budget rollover (positive or negative) to next week
- Works offline after initial load
- Beautiful, modern UI

## 🔧 Technical Details

- **Port**: 5500
- **Data Storage**: Browser LocalStorage (persists across sessions)
- **Offline Support**: Service Worker caching
- **Version**: v4.1

## 📝 Files

- `index.html` - Main app page
- `app.v4.js` - Application logic
- `style.v3.css` - Styling
- `sw.js` - Service worker for offline support
- `manifest.json` - PWA configuration
- `server.ps1` - Local web server
- `start.bat` - Easy server launcher

## ❓ Troubleshooting

**App doesn't load:**
- Make sure the server is running
- Check that you're using `http://localhost:5500`, not opening the file directly
- Try clearing browser cache and reloading

**Can't access from iPhone:**
- Ensure both devices are on the same WiFi
- Check Windows Firewall isn't blocking port 5500
- The `start.bat` script automatically opens the firewall port

**Changes not appearing:**
- The service worker caches files for offline use
- Hard refresh: `Ctrl+Shift+R` (PC) or clear Safari cache (iPhone)
- The app auto-updates when you reload the page

## 💡 Tips

- Keep the server running while using the app
- Add to iPhone home screen for best experience
- Your data is stored locally and never leaves your device
- Use "Start New Week" to archive current week and begin fresh
