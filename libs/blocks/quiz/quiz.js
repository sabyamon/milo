import { html, signal, useEffect } from "../../deps/htm-preact.js";
import { createTag } from '../../utils/utils.js';
// import quizcontainer from './quizcontainer.js'

const data = signal({});

export default function init(el) {
  // console.log('hello world');
  // const app = html` <${quizcontainer} /> `;
  // render(app, el);
  const link = el.querySelector(':scope > div > div > a');
  console.log(link.text) // This is the url for the questions.
  fetchData(el, link)
  return html`
    <div>Hello Quiz</div>
  `;
}

const decorateBlockBg = (block, node) => {
  
  const { children } = node;
  console.log('decorating block')

  node.classList.add('background');

  const backgroundElemTpl = `<div data-valign="middle">
  <picture>
    <source type="image/webp" srcset="./media_1b2111891fc6836011dc3d527c6999c59e792ed70.png?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 400px)">
    <source type="image/webp" srcset="./media_1b2111891fc6836011dc3d527c6999c59e792ed70.png?width=750&amp;format=webply&amp;optimize=medium">
    <source type="image/png" srcset="./media_1b2111891fc6836011dc3d527c6999c59e792ed70.png?width=2000&amp;format=png&amp;optimize=medium" media="(min-width: 400px)">
    <img loading="eager" alt="" type="image/png" src="./media_1b2111891fc6836011dc3d527c6999c59e792ed70.png?width=750&amp;format=png&amp;optimize=medium" width="750" height="375">
  </picture>
</div>`

node.innerHTML = backgroundElemTpl



  // if (!node.querySelector(':scope img') && !node.querySelector(':scope video')) {
  //   block.style.background = node.textContent;
  //   node.remove();
  // }
};


// Get initial quiz data
async function fetchData(el, link) {
  const resp = await fetch(link.text.toLowerCase());

  if (!resp.ok) return {};

  const json = await resp.json();
  console.log(json)
  collectQuestions(el, json);
  return json;
}

// Gather all questions
const collectQuestions = (el, response) => {
  console.log('collecting questions');
  console.log(response.questions);
  el.classList.add('marquee')
  const children = el.querySelectorAll(':scope > div');
  console.log(children)
  if (children.length > 0) {
    children[0].classList.add('background');
    decorateBlockBg(el, children[0]);
  }
}






