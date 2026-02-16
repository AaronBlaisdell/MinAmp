diff --git a/README.md b/README.md
new file mode 100644
index 0000000000000000000000000000000000000000..f6b4095cda5cd77a77888143f7a54911dc1deb86
--- /dev/null
+++ b/README.md
@@ -0,0 +1,52 @@
+# MinAmp Cloud Player
+
+A Winamp-inspired cloud media player prototype with URL-based drive connection, explorer navigation, queue playback, and playlist management.
+
+## What changed
+
+- More Winamp-like visual shell (retro purple/blue frame, header controls, compact panes).
+- Connection now **requires drive URL + username** (and optional password).
+- Connect action now always gives visible feedback:
+  - If URL returns valid JSON drive tree, it loads that tree.
+  - If URL fails, the app shows an error and loads demo content so the UI remains usable.
+
+## Expected drive URL JSON format
+
+Provide a URL that returns JSON with this structure:
+
+```json
+{
+  "name": "Root",
+  "type": "directory",
+  "children": [
+    {
+      "name": "Albums",
+      "type": "directory",
+      "children": [
+        {
+          "name": "Track 1.mp3",
+          "type": "audio",
+          "url": "https://example.com/media/track1.mp3"
+        }
+      ]
+    },
+    {
+      "name": "Video 1.mp4",
+      "type": "video",
+      "url": "https://example.com/media/video1.mp4"
+    }
+  ]
+}
+```
+
+## Run
+
+```bash
+python3 -m http.server 4173
+```
+
+Then open `http://localhost:4173`.
+
+## Notes
+
+This is still a prototype. Real Google Drive/MEGA/Proton integration requires provider OAuth/token APIs and secure credential handling.
