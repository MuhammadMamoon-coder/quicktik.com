document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('tiktok-url');
  const downloadBtn = document.getElementById('download-btn');

  downloadBtn.addEventListener('click', async () => {
      const userLink = urlInput.value.trim();

      if (!userLink) {
          alert("Please paste a TikTok link first!");
          return;
      }

      // Change button to loading state
      downloadBtn.innerText = "Finding Video...";
      downloadBtn.disabled = true;

      try {
          // STEP 1: Get the direct MP4 link from a free API
          const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(userLink)}`;
          const apiResponse = await fetch(apiUrl);
          const apiData = await apiResponse.json();

          if (apiData.code === 0) {
              const videoUrl = apiData.data.play; // Direct MP4 URL
              downloadBtn.innerText = "Auto-Saving...";

              // STEP 2: Fetch the file as a BLOB to bypass the "open in new tab" behavior
              const fileResponse = await fetch(videoUrl);
              const fileBlob = await fileResponse.blob();

              // STEP 3: Create a "Hidden Link" and force the download attribute
              const blobUrl = window.URL.createObjectURL(fileBlob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = blobUrl;
              
              // Force filename with .mp4 extension
              a.download = `tiktok_video_${Date.now()}.mp4`;
              
              document.body.appendChild(a);
              a.click(); // This triggers the actual "Save As" window/action
              
              // Cleanup
              document.body.removeChild(a);
              window.URL.revokeObjectURL(blobUrl);

              downloadBtn.innerText = "Downloaded!";
          } else {
              alert("Error: " + apiData.msg);
          }
      } catch (error) {
          console.error("Auto-save failed:", error);
          alert("Auto-save blocked by browser security. Try right-clicking the video if it opens in a new tab.");
      } finally {
          setTimeout(() => {
              downloadBtn.innerText = "Download";
              downloadBtn.disabled = false;
          }, 3000);
      }
  });
});
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('mp3-url');
    const getBtn = document.getElementById('get-mp3-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const resultBox = document.getElementById('result-box');
    const saveBtn = document.getElementById('save-to-device');
    const loader = document.getElementById('loader');

    let audioDownloadUrl = "";

    // 1. Paste Function
    pasteBtn.addEventListener('click', async () => {
        const text = await navigator.clipboard.readText();
        input.value = text;
    });

    // 2. Fetch MP3 Data
    getBtn.addEventListener('click', async () => {
        const url = input.value.trim();
        if(!url) return alert("Please paste a link!");

        // Reset & Show loading
        resultBox.style.display = "none";
        loader.style.display = "block";
        getBtn.disabled = true;

        try {
            const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const json = await response.json();

            if(json.code === 0) {
                audioDownloadUrl = json.data.music;
                document.getElementById('song-title').innerText = json.data.music_info.title;
                document.getElementById('song-author').innerText = json.data.music_info.author;
                
                loader.style.display = "none";
                resultBox.style.display = "flex";
            } else {
                alert("Could not find music for this link.");
                loader.style.display = "none";
            }
        } catch (e) {
            alert("Connection error. Try again.");
            loader.style.display = "none";
        } finally {
            getBtn.disabled = false;
        }
    });

    // 3. Force Auto-Save to Device
    saveBtn.addEventListener('click', async () => {
        if(!audioDownloadUrl) return;
        saveBtn.innerText = "Saving...";

        try {
            const res = await fetch(audioDownloadUrl);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `tiktok_audio_${Date.now()}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
            saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
        } catch (err) {
            window.open(audioDownloadUrl, '_blank');
        } finally {
            setTimeout(() => saveBtn.innerHTML = '<i class="fa-solid fa-download"></i> Save to Device', 2000);
        }
    });
});