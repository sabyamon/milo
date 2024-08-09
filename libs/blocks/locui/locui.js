import { html, render } from '../../deps/htm-preact.js';
import Localization from './loc/view.js';

export default function init(el) {
  console.log('Checking origin local debugging');
  render(html`<${Localization} />`, el);
}
