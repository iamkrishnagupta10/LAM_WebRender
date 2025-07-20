import { GaussianAvatar } from './gaussianAvatar';

console.log('Starting LAM WebRender...');

const div = document.getElementById('LAM_WebRender') as HTMLDivElement;
const assetPath = '/asset/arkit/p2-1.zip'; // Updated to use public directory

console.log('Found div element:', div);
console.log('Asset path:', assetPath);

function hideLoadingIndicator() {
  const indicator = document.getElementById('loadingIndicator');
  if (indicator) {
    indicator.style.display = 'none';
    console.log('Loading indicator hidden');
  }
}

if (div) {
  try {
    console.log('Creating GaussianAvatar...');
    const gaussianAvatar = new GaussianAvatar(div, assetPath);
    console.log('Starting avatar rendering...');
    gaussianAvatar.start();
    console.log('Avatar started successfully!');
    
    // Hide loading indicator after a short delay to let renderer initialize
    setTimeout(hideLoadingIndicator, 3000);
    
  } catch (error) {
    console.error('Error creating or starting avatar:', error);
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      indicator.innerHTML = `
        <div style="color: red;">Error Loading Avatar</div>
        <div style="font-size: 12px;">${errorMessage}</div>
        <div style="font-size: 10px; margin-top: 10px;">Check browser console for details</div>
      `;
    }
  }
} else {
  console.error('Could not find LAM_WebRender div element!');
}
