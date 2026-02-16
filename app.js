diff --git a/app.js b/app.js
new file mode 100644
index 0000000000000000000000000000000000000000..5e93ad933978b3a2c17e1f10d4b128b0e234878a
--- /dev/null
+++ b/app.js
@@ -0,0 +1,343 @@
+const providerSelect = document.getElementById('providerSelect');
+const accountInput = document.getElementById('accountInput');
+const passwordInput = document.getElementById('passwordInput');
+const connectForm = document.getElementById('connectForm');
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
+    {
+      name: 'Playlists',
+      type: 'directory',
+      children: [
+        {
+          name: 'Morning Focus.m3u',
+          type: 'audio',
+          url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg',
+        },
+      ],
+    },
+  ],
+};
+
+function renderTree(node, parentPath = '') {
+  const wrap = document.createElement('ul');
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
+        folderTitle.classList.toggle('selected');
+      });
+      item.append(folderTitle);
+
+      const addDirectoryBtn = document.createElement('button');
+      addDirectoryBtn.textContent = 'Add folder media';
+      addDirectoryBtn.addEventListener('click', () => {
+        const mediaItems = flattenDirectoryMedia(child, path);
+        state.queue.push(...mediaItems);
+        renderQueue();
+      });
+      item.append(addDirectoryBtn);
+
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
+  const nextIndex = (state.currentIndex + 1) % state.queue.length;
+  playIndex(nextIndex);
+}
+
+function renderPlaylists() {
+  playlistList.innerHTML = '';
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
+      renderQueue();
+    });
+    li.append(loadButton);
+    playlistList.append(li);
+  });
+}
+
+connectForm.addEventListener('submit', (event) => {
+  event.preventDefault();
+
+  const provider = providerSelect.value;
+  const account = accountInput.value.trim();
+  const isProtected = passwordInput.value.trim().length > 0;
+
+  if (!provider || !account) {
+    return;
+  }
+
+  state.connectedDrive = {
+    provider,
+    account,
+    protected: isProtected,
+  };
+
+  statusText.textContent = `Connected: ${provider.toUpperCase()} (${isProtected ? 'password-protected' : 'standard access'})`;
+
+  directoryTree.innerHTML = '';
+  directoryTree.append(renderTree(sampleDriveData));
+});
+
+newPlaylistBtn.addEventListener('click', () => {
+  const name = window.prompt('Name your playlist');
+  if (!name) {
+    return;
+  }
+
+  state.playlists.push({ name, items: [] });
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
+  if (!state.activeDirectoryPath) {
+    window.alert('Select a directory first in the explorer tree.');
+    return;
+  }
+
+  const folderName = state.activeDirectoryPath.split('/').filter(Boolean).pop();
+  const foundDirectory = findDirectory(sampleDriveData, folderName);
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
