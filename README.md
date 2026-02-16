diff --git a/README.md b/README.md
new file mode 100644
index 0000000000000000000000000000000000000000..f0820b43e46fed26505b2b8c810eb4539bd29e9c
--- /dev/null
+++ b/README.md
@@ -0,0 +1,31 @@
+# MinAmp Cloud Player
+
+A Winamp-inspired media player prototype that mixes iTunes-style library browsing with cloud drive access workflows.
+
+## Features in this prototype
+
+- Winamp-style dark desktop interface with a cloud explorer panel.
+- Cloud connection form for Google Drive, MEGA, and Proton Drive (simulated connection workflow).
+- Optional password field to represent protected drives/folders.
+- Explorer tree with root and subdirectories, including media selection.
+- Queue audio and video files individually or add an entire directory recursively.
+- Save current queue as playlists in `localStorage`.
+- Create a playlist directly from the selected directory.
+- Audio/video playback controls (play, pause, next).
+
+## Run
+
+Because this is a static app, you can run it with any local web server. Example:
+
+```bash
+python3 -m http.server 4173
+```
+
+Then open `http://localhost:4173`.
+
+## Next steps for production
+
+- Replace simulated cloud data with OAuth + API integrations for each provider.
+- Add secure credentials handling and encrypted token storage.
+- Add transcoding/streaming compatibility checks by file type.
+- Add a desktop shell (Tauri/Electron) for deeper OS integration.
