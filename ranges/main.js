// Configuration
//const TAR_URL = "https://sandbox.zenodo.org/records/387505/files/zenodo_indexed_files.tar?download=1";      // change to your TAR file URL
//const TAR_URL = "simple_proxy.php?url=" 
//                + encodeURIComponent("https://sandbox.zenodo.org/records/387505/files/zenodo_indexed_files.tar?download=1");
const TAR_URL = "https://raw.githubusercontent.com/lacenas/lacenas.github.io/main/ranges/zenodo_indexed_files.tar";      // change to your TAR file URL
console.log(TAR_URL);
//const INDEX_URL = "index.json";          // change to your index.json URL
const INDEX_URL = "https://raw.githubusercontent.com/lacenas/lacenas.github.io/main/ranges/tar_index.json";          // change to your index.json URL



let index = [];

async function loadIndex() {
  try {
    const res = await fetch(INDEX_URL);
    if (!res.ok) throw new Error(`Failed to fetch index: ${res.status}`);
    index = await res.json();
    renderFileList();
  } catch (err) {
    console.error(err);
  }
}

function renderFileList() {
  const container = document.getElementById("file-list");
  container.innerHTML = "";
  index.forEach(file => {
    const btn = document.createElement("button");
    btn.textContent = file.path;
    btn.onclick = () => fetchFile(file);
    container.appendChild(btn);
  });
}

async function fetchFile(file) {
  try {
    const headers = { "Range": `bytes=${file.offset}-${file.offset + file.length - 1}` };
    const res = await fetch(TAR_URL, { headers });
    if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);

    // Create blob with correct MIME type
    const buffer = await res.arrayBuffer();
    const blob = new Blob([buffer], { type: file.mime });

    displayBlob(blob, file.mime);
  } catch (err) {
    console.error(err);
  }
}

function displayBlob(blob, mime) {
  const container = document.getElementById("file-preview");
  container.innerHTML = "";

  if (mime.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(blob);
    img.style.maxWidth = "80%";
    container.appendChild(img);

  } else if (mime.startsWith("audio/")) {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = URL.createObjectURL(blob);
    container.appendChild(audio);

  } else if (mime.startsWith("video/")) {
    const video = document.createElement("video");
    video.controls = true;
    video.style.maxWidth = "80%";
    video.src = URL.createObjectURL(blob);
    container.appendChild(video);

  } else if (mime === "application/pdf") {
    const iframe = document.createElement("iframe");
    iframe.src = URL.createObjectURL(blob);
    iframe.style.width = "80%";
    iframe.style.height = "600px";
    container.appendChild(iframe);

  } else {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "file";
    link.textContent = `Download file (${mime})`;
    container.appendChild(link);
  }
}

window.addEventListener("DOMContentLoaded", loadIndex);
