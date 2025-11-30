# Quick Start Guide

## 🎯 TL;DR - How to Use Your Budget App

### First Time Setup

1. **Run `create-shortcut.bat`** (creates desktop shortcut)
2. **Double-click the desktop shortcut** (starts server)
3. **Open browser** to `http://localhost:5500`
4. **Done!** The app is now running

### On Your iPhone

1. Make sure iPhone is on **same WiFi** as PC
2. Start server on PC (double-click desktop shortcut)
3. Note the **iPhone Access URL** shown (e.g., `http://192.168.1.100:5500`)
4. Open that URL in **Safari** on iPhone
5. Tap **Share** → **Add to Home Screen**
6. App now works like a native app!

## ❓ Common Questions

### "Why can't I just open the HTML file?"

**Short answer**: PWAs need a web server for security reasons.

**Long answer**: 
- Service workers (which enable offline mode) only work over HTTP/HTTPS
- Opening files directly uses `file://` protocol, which browsers block
- The server is tiny and runs locally - it's not connecting to the internet

### "Does it work offline?"

**YES!** Once you've loaded the app with the server running:
- All data is stored on your device
- Works without internet
- Works even if you close and reopen the browser
- On iPhone: Works like a native app after adding to home screen

**BUT**: You still need to access it via `http://localhost:5500` in your browser, not by opening the HTML file.

### "Do I need to keep the server running?"

**While using the app**: Yes
**Between uses**: No - you can close it and restart when needed

The desktop shortcut makes starting the server super easy!

### "Will my data be lost?"

**NO!** Your data is stored in your browser's LocalStorage and persists:
- ✅ Across browser sessions
- ✅ After closing the browser
- ✅ After restarting your computer
- ✅ Even if you close the server

**Only lost if**:
- ❌ You clear browser data/cache
- ❌ You uninstall the browser
- ❌ You use a different browser (data is per-browser)

## 🔄 Workflow

### Daily Use (PC)
1. Double-click desktop shortcut
2. Browser opens automatically to `http://localhost:5500`
3. Use the app
4. Close browser when done (data is saved)
5. Close server window (or leave it running)

### Daily Use (iPhone - After Setup)
1. Start server on PC
2. Tap the app icon on iPhone home screen
3. Use the app (works like a native app!)
4. Data syncs automatically if on same WiFi

## 🛠️ Files You Need

- ✅ **start.bat** - Starts the server (or use desktop shortcut)
- ✅ **server.ps1** - The actual server (don't delete!)
- ✅ **index.html, app.v4.js, style.v3.css** - The app files
- ✅ **sw.js** - Makes offline mode work
- ✅ **manifest.json** - PWA configuration

**Don't delete any of these!**

## 💡 Pro Tips

1. **Bookmark `http://localhost:5500`** in your browser for quick access
2. **Pin the desktop shortcut** to taskbar for even faster access
3. **Keep server running** if you use the app frequently throughout the day
4. **Use iPhone home screen icon** for the best mobile experience
5. **Weekly routine**: Use "Start New Week" every Monday to archive and rollover budget

## 🆘 Troubleshooting

**Server won't start:**
- Run `start.bat` as Administrator
- Check if port 5500 is already in use

**Can't access from iPhone:**
- Both devices must be on same WiFi
- Check the IP address shown by the server
- Windows Firewall should auto-open (start.bat does this)

**App not updating:**
- Hard refresh: `Ctrl+Shift+R` (PC)
- Clear Safari cache (iPhone)
- Service worker auto-updates on page reload

**Data disappeared:**
- Check if you're using the same browser
- Don't clear browser cache/data
- Data is stored per-browser

---

**Need more help?** Check `README.md` for detailed information.
