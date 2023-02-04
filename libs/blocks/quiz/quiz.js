import { html, render } from '../../deps/htm-preact.js';
import quizcontainer from './quizcontainer.js'

export default function init(el) {
  console.log('hello world');
  const app = html` <${quizcontainer} /> `;
  render(app, el);
}
