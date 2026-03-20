// HBS Gallery Bridge — connects tool iframes to the studio gallery modal

function openGallery(fieldId, section) {
  window.parent.postMessage({ type: 'openGallery', fieldId, section }, '*');
}

window.addEventListener('message', async (event) => {
  if (event.data?.type !== 'imageSelected') return;
  const { fieldId, url } = event.data;
  const input = document.getElementById(fieldId);
  if (!input) return;

  // Fetch the image and simulate a real file input change
  const resp = await fetch(url);
  const blob = await resp.blob();
  const filename = url.split('/').pop() || 'image.png';
  const file = new File([blob], filename, { type: blob.type });

  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
