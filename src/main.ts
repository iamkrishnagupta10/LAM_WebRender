import { GaussianAvatar } from './gaussianAvatar';

const div = document.getElementById('LAM_WebRender') as HTMLDivElement;
const assetPath = './asset/arkit/p2-1.zip';

if (div) {
  const gaussianAvatar = new GaussianAvatar(div, assetPath);
  gaussianAvatar.start();
}
