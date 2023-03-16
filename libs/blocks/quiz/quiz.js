import { signal } from '../../deps/htm-preact.js';
import { getConfig, loadStyle } from '../../utils/utils.js';

const { codeRoot } = getConfig();
loadStyle(`${codeRoot}/deps/caas.css`);

const QUESTIONS_EP_NAME = 'questions.json';
const STRINGS_EP_NAME = 'strings.json';
const RESULTS_EP_NAME = 'results.json';

const metrics = {
  prevQuestion: null,
  prevAnswer: null,
  currentQuestion: null,
  currentAnswer: null,
  nextQuestion: null,
  nextAnswer: null,
};

let currentSelections = [], next = [], rootElement, questionsData = {}, stringsData = {}, resultsData = {}, flow = [];

export const userJourney = signal(metrics); // Tracks the user's journey through the quiz flow.

export default function init(el) {
  rootElement = el;
  const link = el.querySelector(':scope > div > div > a');
  window.milo = window.milo || {};
  window.milo.quizConfigPath = link.text.toLowerCase();
  getAllData();
}

async function getAllData() {
  try {
    Promise.all([getQuestions(), getStrings(), getResult()]).then(function (
      values
    ) {
      collectQuestions();
      //collectStrings()
    });
  } catch (ex) {
    console.log('Error while fetching data : ', ex);
  }
}

async function getQuestions() {
  const response = await fetch(window.milo.quizConfigPath + QUESTIONS_EP_NAME);
  const qData = await response.json();
  window.milo = window.milo || {};
  window.milo.questions = qData;
  questionsData = qData;
  return qData;
}

async function getStrings() {
  const response = await fetch(window.milo.quizConfigPath + STRINGS_EP_NAME);
  const sData = await response.json();
  window.milo = window.milo || {};
  window.milo.strings = sData;
  stringsData = sData;
  return sData;
}

async function getResult() {
  const response = await fetch(window.milo.quizConfigPath + RESULTS_EP_NAME);
  const rData = await response.json();
  window.milo = window.milo || {};
  window.milo.results = rData;
  resultsData = rData;
  return rData;
}

const collectStrings = () => {
  const object = stringsData.questions.data.find(
    (o) => o.q === userJourney.value.currentQuestion.questions
  );

  userJourney.value.currentQuestion.heading = object['heading'];
  userJourney.value.currentQuestion.subhead = object['sub-head'];
  userJourney.value.currentQuestion.btnText = object['btn'];
  userJourney.value.currentQuestion.background = object['background'];
};

// Gather all questions
const collectQuestions = (questionIdentifier) => {
  // If there is no questions, the data is malformed.
  if (questionIdentifier !== undefined) {
    questionsData.questions.data.forEach((q) => {
      if (q.questions === questionIdentifier.trim()) {
        userJourney.value.currentQuestion = q;
      }
    });
  } else {
    userJourney.value.currentQuestion = questionsData.questions.data[0];
  }

  // Find the parent element  `quiz` and treat that as the source of truth.
  // TODO: need better identifier of this element.

  rootElement.classList.add('quiz-container');
  collectStrings();

  const children = rootElement.querySelectorAll(':scope > div');
  if (children.length > 0) {
    children[0].classList.add('background');
    decorateBlockBackground(children[0]);
  }
  decorateBlockForeground();
};

const decorateBlockBackground = (node) => {
  const backgroundElemTpl = `<div data-valign="middle">
  <picture>
    <source type="image/webp" srcset="${userJourney.value.currentQuestion.background}" media="(min-width: 400px)">
    <source type="image/webp" srcset="${userJourney.value.currentQuestion.background}">
    <source type="image/png" srcset="${userJourney.value.currentQuestion.background}"  media="(min-width: 400px)">
    <img loading="eager" alt="" type="image/png" src="${userJourney.value.currentQuestion.background}"  width="750" height="375">
  </picture>
</div>`;

  node.innerHTML = backgroundElemTpl; // Adding the background image for the quiz block.
};

const decorateBlockForeground = () => {
  const foregroundElemTpl = `<div class="foreground container">
  <div data-valign="middle" class="text" daa-lh="${userJourney.value.currentQuestion.heading}">
    <h2 id="heading-xl-marquee-standard-medium-left" class="heading-XL">
    ${userJourney.value.currentQuestion.heading}
    </h2>
    <p class="detail-L">${userJourney.value.currentQuestion.subhead}</p>
  </div>
</div>`;
  rootElement.insertAdjacentHTML('beforeend', foregroundElemTpl); // Adding foreground elements.
  findAndInsertOptions();
};

const findAndInsertOptions = () => {
  const currQuestion = userJourney.value.currentQuestion.questions;
  rootElement.insertAdjacentHTML(
    'beforeend',
    getQuizOption(window.milo.strings[currQuestion].data)
  ); // Adding quiz options.

  const quizOptionElems = document.querySelectorAll(
    '.quiz-options-container > div'
  );

  Array.from(quizOptionElems).forEach(function (element) {
    element.addEventListener('click', (event) => handleOptionSelection(event));
  });

  const nextBtn = document.querySelectorAll('.quiz-btn')[0];
  nextBtn.addEventListener('click', (event) => handleNext(event));
};

const handleOptionSelection = (event) => {
  const clickedElem = event.target;
  const clickedCard = clickedElem.closest('.quiz-option');
  const clickedCardName = clickedCard.dataset.cardName;

  // Add selected attribute to the cards that are selected.

  if (clickedCard.classList.contains('selected')) {
    clickedCard.classList.remove('selected');
    currentSelections = currentSelections.filter(
      (item) => item !== clickedCardName
    ); // Remove the item from the current selections

    const allCards = document.querySelectorAll('.quiz-option');
    allCards.forEach((card) => {
      if (card.classList.contains('disabled')) {
        card.classList.remove('disabled');
      }
    });
  } else {
    currentSelections.push(clickedCardName); // Add selections data to an array
    clickedCard.classList.add('selected');
    if (currentSelections.length === parseInt(userJourney.value.currentQuestion['max-selections'])) {
      const allCards = document.querySelectorAll('.quiz-option');
      allCards.forEach((card) => {
        if (!card.classList.contains('selected')) {
          card.classList.add('disabled');
        }
      });
    }
  }

  const quizNextBtn = document.querySelectorAll('.quiz-btn')[0];
  if (currentSelections.length >= parseInt(userJourney.value.currentQuestion['min-selections'])) {
    quizNextBtn.removeAttribute('disabled');
  } else {
    quizNextBtn.setAttribute('disabled', 'true');
  }
};

/**
 * Handles the behavior of the next button.
 */
const handleNext = () => {
  // Reset maxSelections
  // Reset minSelections
  // Reset currentSelections
  // find the next paths by popping elements from currentSelections.
  // Lets create the next array.

  // console.log(
  //   'current selections while creating the next array:',
  //   currentSelections
  // );

  currentSelections.forEach((selection) => {
    // for each elem in current selection, find its coresponding next element and push it to the next array.
    const currQuestion = userJourney.value.currentQuestion.questions;
    const nextItems = questionsData[currQuestion].data;
    nextItems.forEach((nextItem) => {
      if (nextItem.options === selection) {
        // console.log('matched nextItem.options', nextItem)
        // console.log('with selection', selection)
        const nextArr = nextItem.next;
        const arr = nextArr.split(',');
        arr.forEach((elem) => {
          // console.log('Element we are trying to add now', elem);
          // console.log('how does the next array look? ', next);
          // console.log('Does array include the elem?', next.includes(elem));
          if (!next.includes(elem)) {
            if (elem === 'RESET') {
              // if we encounter `RESET`, reset the next array and add new elements.
              next = [];
            }
            if (elem !== 'RESET') {
              // Add next element when its not `RESET`. TODO: combine these two logics.
              // console.log('Added to next array: ', elem);
              next.push(elem);
            }
          }
          // console.log('next array after each try to add', next);
        });
      }
    });

    //     currentSelections = []; // It was here.. It was getting reset when two options were chosen.
  });
  

  // Add all the questions and answers selected here
  const currentState = {
    questionId : userJourney.value.currentQuestion.questions,
    questionTitle : userJourney.value.currentQuestion.heading,
    answers : currentSelections
  }

  flow.push(currentState)
  popElementAndExecuteFlow(next);

};

const popElementAndExecuteFlow = (next) => {
  currentSelections = [];
  let shifted = next.shift();

  if (shifted === 'RESULT') {
    next.push('RESULT');
    shifted = next.shift();
  }

  // console.log('calling flow for :: ', shifted);
  // rootElement.innerHTML = ''; // values were not updating. Hence cleared out the data. TODO: Need to check again
  rootElement.querySelectorAll('.foreground')[0].remove();
  rootElement.querySelectorAll('.milo-card-wrapper')[0].remove();

  if (shifted === 'RESULT') {
    handleResultFlow();
  } else {
    collectQuestions(shifted);
  }
};

/**
 * Handling the result flow from here. Will need to make sure we capture all the data so that we can come back.
 *
 */
const handleResultFlow = () => {
  console.log('We are at the end of the flow! Route to result page');
  console.log('flow observed till now :: ', flow)
  // window.location.href = 'https://www.adobe.com';
};

const createOption = (optionsData) => {
  let domElem = '';
  for (let index in optionsData) {
    const cardData = optionsData[index];
    const coverImage = cardData.cover;
    const cardIcon = cardData.image;
    domElem =
      domElem +
        `<div class="card half-card border consonant-Card consonant-OneHalfCard quiz-option" data-card-name="${cardData.options}">
          ${cardIcon ? `<div class="consonant-OneHalfCard-image"><img src="${cardIcon}" alt="Video" class="icon"></div>` : ''}
          ${coverImage ? `<div class="consonant-OneHalfCard-img" style="background-image: url('${coverImage}');"></div>` : ''}
          <div class="consonant-OneHalfCard-inner">
            <div data-valign="middle">  
              <h3 id="lorem-ipsum-dolor-sit-amet-3" class="consonant-OneHalfCard-title">${
                cardData.title
              }</h3>
              <p class="consonant-OneHalfCard-text">${cardData.text}</p>
            </div>
          </div>
        </div>`;
  }

  return domElem;
};

export const getQuizOption = (currentQuestionOptions) => {
  let option = '';
  option = createOption(currentQuestionOptions);
  return `
    <div class="milo-card-wrapper consonant-Wrapper consonant-Wrapper--1200MaxWidth">
      <div class="consonant-Wrapper-inner">
        <div class="consonant-Wrapper-collection">
          <div class="consonant-CardsGrid consonant-CardsGrid--5up consonant-CardsGrid--with4xGutter quiz-options-container">
            ${option}
            </div>
          </div>
          <div class="quiz-button-container">
            <button disabled="true" aria-label="Next" data-quiz-button="" class="spectrum-Button spectrum-Button--outline spectrum-Button--sizeXL quiz-btn" daa-ll="Filters|cc:app-reco|Q#1/Photo">
              <span class="quiz-Button-label">${userJourney.value.currentQuestion.btnText}</span>
            </button>
          </div>
        </div>
      </div>`;
};
