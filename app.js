diff --git a/app.js b/app.js
new file mode 100644
index 0000000000000000000000000000000000000000..0e40bb5b42e42be2f36ab197b28c97d83012fc20
--- /dev/null
+++ b/app.js
@@ -0,0 +1,406 @@
+const providerSelect = document.getElementById('providerSelect');
+const driveUrlInput = document.getElementById('driveUrlInput');
+const usernameInput = document.getElementById('usernameInput');
+const passwordInput = document.getElementById('passwordInput');
+const connectForm = document.getElementById('connectForm');
+const connectFeedback = document.getElementById('connectFeedback');
+const statusText = document.getElementById('statusText');
+
+const directoryTree = document.getElementById('directoryTree');
+const queueList = document.getElementById('queueList');
+const playlistList = document.getElementById('playlistList');
+
+const nowPlaying = document.getElementById('nowPlaying');
+const nowSource = document.getElementById('nowSource');
+const audioPlayer = document.getElementById('audioPlayer');
+const videoPlayer = document.getElementById('videoPlayer');
+
+const playBtn = document.getElementById('playBtn');
+const pauseBtn = document.getElementById('pauseBtn');
+const nextBtn = document.getElementById('nextBtn');
+
+const newPlaylistBtn = document.getElementById('newPlaylistBtn');
+const savePlaylistBtn = document.getElementById('savePlaylistBtn');
+const makeDirectoryPlaylistBtn = document.getElementById('makeDirectoryPlaylistBtn');
+const clearQueueBtn = document.getElementById('clearQueueBtn');
+
+const state = {
+  connectedDrive: null,
+  treeData: null,
+  queue: [],
+  playlists: JSON.parse(localStorage.getItem('minamp-playlists') || '[]'),
+  activeDirectoryPath: null,
+  currentIndex: -1,
+};
+
+const sampleDriveData = {
+  name: 'Root',
+  type: 'directory',
+  children: [
+    {
+      name: 'Albums',
+      type: 'directory',
+      children: [
+        {
+          name: 'Synthwave Nights',
+          type: 'directory',
+          children: [
+            {
+              name: 'Neon Escape.mp3',
+              type: 'audio',
+              url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg',
+            },
+            {
+              name: 'Skyline Drive.flac',
+              type: 'audio',
+              url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg',
+            },
+          ],
+        },
+      ],
+    },
+    {
+      name: 'Concert Videos',
+      type: 'directory',
+      children: [
+        {
+          name: 'Live Session.mp4',
+          type: 'video',
+          url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
+        },
+      ],
+    },
+  ],
+};
+
+function setFeedback(message, isSuccess = false) {
+  connectFeedback.textContent = message;
+  connectFeedback.classList.toggle('success', isSuccess);
+}
+
+function isValidNode(node) {
+  if (!node || typeof node !== 'object') {
+    return false;
+  }
+
+  if (node.type === 'directory') {
+    return Array.isArray(node.children);
+  }
+
+  if (node.type === 'audio' || node.type === 'video') {
+    return typeof node.url === 'string';
+  }
+
+  return false;
+}
+
+function renderTree(node, parentPath = '') {
+  const wrap = document.createElement('ul');
+
+  if (!node.children || node.children.length === 0) {
+    wrap.innerHTML = '<li class="empty">No folders/files found</li>';
+    return wrap;
+  }
+
+  node.children.forEach((child) => {
+    const item = document.createElement('li');
+    const path = `${parentPath}/${child.name}`;
+
+    if (child.type === 'directory') {
+      const folderTitle = document.createElement('strong');
+      folderTitle.textContent = `📁 ${child.name}`;
+      folderTitle.style.cursor = 'pointer';
+      folderTitle.addEventListener('click', () => {
+        state.activeDirectoryPath = path;
+      });
+      item.append(folderTitle);
+
+      const addDirectoryBtn = document.createElement('button');
+      addDirectoryBtn.textContent = 'Queue folder';
+      addDirectoryBtn.addEventListener('click', () => {
+        const mediaItems = flattenDirectoryMedia(child, path);
+        if (mediaItems.length === 0) {
+          window.alert('No media files in this folder.');
+          return;
+        }
+
+        state.queue.push(...mediaItems);
+        renderQueue();
+      });
+      item.append(addDirectoryBtn);
+      item.append(renderTree(child, path));
+    }
+
+    if (child.type === 'audio' || child.type === 'video') {
+      const fileLabel = document.createElement('span');
+      fileLabel.textContent = `${child.type === 'audio' ? '🎵' : '🎬'} ${child.name}`;
+      item.append(fileLabel);
+
+      const addBtn = document.createElement('button');
+      addBtn.textContent = 'Queue';
+      addBtn.addEventListener('click', () => {
+        state.queue.push({ ...child, path });
+        renderQueue();
+      });
+      item.append(addBtn);
+    }
+
+    wrap.append(item);
+  });
+
+  return wrap;
+}
+
+function flattenDirectoryMedia(directoryNode, pathPrefix) {
+  const items = [];
+
+  directoryNode.children.forEach((child) => {
+    const path = `${pathPrefix}/${child.name}`;
+    if (child.type === 'directory') {
+      items.push(...flattenDirectoryMedia(child, path));
+    }
+
+    if (child.type === 'audio' || child.type === 'video') {
+      items.push({ ...child, path });
+    }
+  });
+
+  return items;
+}
+
+function renderQueue() {
+  queueList.innerHTML = '';
+  if (state.queue.length === 0) {
+    queueList.innerHTML = '<li class="empty">Queue is empty</li>';
+    return;
+  }
+
+  state.queue.forEach((track, index) => {
+    const li = document.createElement('li');
+    li.innerHTML = `<span>${track.name}</span><small>${track.path}</small>`;
+    li.addEventListener('dblclick', () => playIndex(index));
+    queueList.append(li);
+  });
+}
+
+function playIndex(index) {
+  const track = state.queue[index];
+  if (!track) {
+    return;
+  }
+
+  state.currentIndex = index;
+  nowPlaying.textContent = track.name;
+  nowSource.textContent = track.path;
+
+  if (track.type === 'video') {
+    audioPlayer.pause();
+    audioPlayer.hidden = true;
+    videoPlayer.hidden = false;
+    videoPlayer.src = track.url;
+    videoPlayer.play();
+    return;
+  }
+
+  videoPlayer.pause();
+  videoPlayer.hidden = true;
+  audioPlayer.hidden = false;
+  audioPlayer.src = track.url;
+  audioPlayer.play();
+}
+
+function playCurrent() {
+  if (state.currentIndex < 0 && state.queue.length > 0) {
+    playIndex(0);
+    return;
+  }
+
+  if (!audioPlayer.hidden) {
+    audioPlayer.play();
+  }
+
+  if (!videoPlayer.hidden) {
+    videoPlayer.play();
+  }
+}
+
+function pauseCurrent() {
+  audioPlayer.pause();
+  videoPlayer.pause();
+}
+
+function playNext() {
+  if (state.queue.length === 0) {
+    return;
+  }
+
+  const nextIndex = (state.currentIndex + 1) % state.queue.length;
+  playIndex(nextIndex);
+}
+
+function renderPlaylists() {
+  playlistList.innerHTML = '';
+
+  if (state.playlists.length === 0) {
+    playlistList.innerHTML = '<li class="empty">No saved playlists</li>';
+    return;
+  }
+
+  state.playlists.forEach((playlist) => {
+    const li = document.createElement('li');
+    const loadButton = document.createElement('button');
+    li.innerHTML = `<span>${playlist.name}</span><small>${playlist.items.length} items</small>`;
+    loadButton.textContent = 'Load';
+    loadButton.addEventListener('click', () => {
+      state.queue = [...playlist.items];
+      state.currentIndex = -1;
+      renderQueue();
+    });
+    li.append(loadButton);
+    playlistList.append(li);
+  });
+}
+
+async function loadTreeFromUrl(driveUrl) {
+  const response = await fetch(driveUrl);
+  if (!response.ok) {
+    throw new Error(`Request failed (${response.status})`);
+  }
+
+  const payload = await response.json();
+  if (!isValidNode(payload)) {
+    throw new Error('URL JSON is not a valid drive tree object');
+  }
+
+  return payload;
+}
+
+connectForm.addEventListener('submit', async (event) => {
+  event.preventDefault();
+
+  const provider = providerSelect.value;
+  const driveUrl = driveUrlInput.value.trim();
+  const username = usernameInput.value.trim();
+  const password = passwordInput.value.trim();
+
+  if (!provider || !driveUrl || !username) {
+    setFeedback('Please fill provider, drive URL, and username.');
+    return;
+  }
+
+  statusText.textContent = 'Connecting...';
+  setFeedback('Connecting to drive URL...');
+
+  let treeData = sampleDriveData;
+
+  try {
+    treeData = await loadTreeFromUrl(driveUrl);
+    setFeedback('Connected successfully using drive URL manifest.', true);
+  } catch (error) {
+    setFeedback(
+      `Could not read URL manifest (${error.message}). Loaded demo media tree so the app remains usable.`,
+    );
+  }
+
+  state.connectedDrive = {
+    provider,
+    driveUrl,
+    username,
+    hasPassword: password.length > 0,
+  };
+  state.treeData = treeData;
+  state.activeDirectoryPath = null;
+
+  statusText.textContent = `Connected: ${provider.toUpperCase()} | ${username}`;
+
+  directoryTree.innerHTML = '';
+  directoryTree.append(renderTree(state.treeData));
+});
+
+newPlaylistBtn.addEventListener('click', () => {
+  const name = window.prompt('Name your playlist');
+  if (!name) {
+    return;
+  }
+
+  state.playlists.push({ name, items: [] });
+  localStorage.setItem('minamp-playlists', JSON.stringify(state.playlists));
+  renderPlaylists();
+});
+
+savePlaylistBtn.addEventListener('click', () => {
+  if (state.queue.length === 0) {
+    window.alert('Queue is empty. Add media before saving.');
+    return;
+  }
+
+  const name = window.prompt('Save queue as playlist name');
+  if (!name) {
+    return;
+  }
+
+  state.playlists.push({ name, items: [...state.queue] });
+  localStorage.setItem('minamp-playlists', JSON.stringify(state.playlists));
+  renderPlaylists();
+});
+
+makeDirectoryPlaylistBtn.addEventListener('click', () => {
+  if (!state.treeData) {
+    window.alert('Connect to a drive first.');
+    return;
+  }
+
+  if (!state.activeDirectoryPath) {
+    window.alert('Select a directory first in the explorer tree.');
+    return;
+  }
+
+  const folderName = state.activeDirectoryPath.split('/').filter(Boolean).pop();
+  const foundDirectory = findDirectory(state.treeData, folderName);
+  if (!foundDirectory) {
+    window.alert('Directory not found in current cloud tree.');
+    return;
+  }
+
+  const items = flattenDirectoryMedia(foundDirectory, state.activeDirectoryPath);
+  state.playlists.push({ name: `${folderName} (directory)`, items });
+  localStorage.setItem('minamp-playlists', JSON.stringify(state.playlists));
+  renderPlaylists();
+});
+
+function findDirectory(node, targetName) {
+  if (node.type === 'directory' && node.name === targetName) {
+    return node;
+  }
+
+  if (!node.children) {
+    return null;
+  }
+
+  for (const child of node.children) {
+    if (child.type === 'directory') {
+      const match = findDirectory(child, targetName);
+      if (match) {
+        return match;
+      }
+    }
+  }
+
+  return null;
+}
+
+clearQueueBtn.addEventListener('click', () => {
+  state.queue = [];
+  state.currentIndex = -1;
+  renderQueue();
+});
+
+playBtn.addEventListener('click', playCurrent);
+pauseBtn.addEventListener('click', pauseCurrent);
+nextBtn.addEventListener('click', playNext);
+
+audioPlayer.addEventListener('ended', playNext);
+videoPlayer.addEventListener('ended', playNext);
+
+renderQueue();
+renderPlaylists();
