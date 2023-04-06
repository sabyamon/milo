import { signal, render, html, useEffect, useState } from '../../deps/htm-preact.js';
//TODO -  export Fragment from html-preact.js ans use it
import { getConfig, loadStyle, loadScript } from '../../utils/utils.js';

const { codeRoot } = getConfig();
loadStyle(`${codeRoot}/deps/caas.css`);
loadScript(`${codeRoot}/deps/logipar.js`);

const QUESTIONS_EP_NAME = 'questions.json';
const STRINGS_EP_NAME = 'strings.json';
const RESULTS_EP_NAME = 'results.json';

const metrics = {
  questionList: {},
  stringQuestionList: {},
  currentQuestion: null,
  currentAnswer: null,
};

let currentSelections = [],
  next = [],
  rootElement,
  questionsData = {},
  stringsData = {},
  resultsData = {},
  flow = [];

export const userJourney = signal(metrics); // Tracks the user's journey through the quiz flow.

// const defaultBg = 'https://cc-prod.scene7.com/is/image/CCProdAuthor/DSK-Q1%20BKGD%202X?$pjpeg$&jpegSize=300&wid=1920';
const defaultBg = '';

function DecorateBlockBackground({ background = defaultBg }) {
  return html `<div data-valign="middle">
    <picture>
      <source type="image/webp" srcset="${background}" media="(min-width: 400px)">
      <source type="image/webp" srcset="${background}">
      <source type="image/png" srcset="${background}"  media="(min-width: 400px)">
      <img loading="eager" alt="" type="image/png" src="${background}"  width="750" height="375">
    </picture>
  </div>`;
}

const DecorateBlockForeground = ({ heading, subhead, btnText, optionsData }) => {
  useEffect(() => {
    console.log("called me")
  }, [])
  return html `<div class="foreground container">
    <div data-valign="middle" class="text" daa-lh="${heading}">
      <h2 id="heading-xl-marquee-standard-medium-left" class="heading-XL">
      ${heading}
      </h2>
      <p class="detail-L">${subhead}</p>
    </div>
    
  </div>`;
};

const OptionCard = ({ text, title, coverImage, cardIcon, options}) => {
  const cardIconHtml = html `<div class="consonant-OneHalfCard-image">
    <img src="${cardIcon}" alt="Video" class="icon">
  </div>`;

  const coverImageHtml = html `
    <div class="consonant-OneHalfCard-cover" 
      style="background-image: url('${coverImage}') !important;">
    </div>`;

  return html `<div class="card half-card border consonant-Card consonant-OneHalfCard quiz-option" 
                    data-card-name="${options}">
      ${cardIcon && cardIconHtml}
      ${coverImage && coverImageHtml}
      <div class="consonant-OneHalfCard-inner">
        <div data-valign="middle">  
          <h3 id="lorem-ipsum-dolor-sit-amet-3" class="consonant-OneHalfCard-title">${title}</h3>
          <p class="consonant-OneHalfCard-text">${text}</p>
        </div>
      </div>
    </div>`;
}

const CreateOptions = ({options}) => {
  debugger
  const dcardIcon = "https://cc-prod.scene7.com/is/image/CCProdAuthor/DSK-Q2-Illustration%20BKGD%202X?$pjpeg$&jpegSize=300&wid=1920";
  const dcoverImage ="https://www.adobe.com/content/dam/cc/Images/app-recommender/multi-select/quiz-question-card-thumbnails/q2-illustration/1-PS-PaintDraw.png";
  const dtext = "Paint, draw, or doodle like on paper";
  const doptions = "raster";
  // optionsData
  return html `
    <div>
      ${options.data.map((option, index) => (
        html `<div key=${index}>
          <${OptionCard} 
            text=${option.text}
            title=${option.title} 
            cardIcon=${option.cardIcon} 
            coverImage=${option.coverImage}
            options=${option.options} />
        </div>`
      ))}
    </div>
  `;
}

 const GetQuizOption = ( { btnText, options} ) => {
  return html `
    <div class="milo-card-wrapper consonant-Wrapper consonant-Wrapper--1200MaxWidth">
      <div class="consonant-Wrapper-inner">
        <div class="consonant-Wrapper-collection">
          <div class="consonant-CardsGrid consonant-CardsGrid--5up consonant-CardsGrid--with4xGutter quiz-options-container">
            <${CreateOptions} options=${options} />
            </div>
          </div>
          <div class="quiz-button-container">
            <button disabled="true" 
              aria-label="Next" 
              data-quiz-button="" 
              class="spectrum-Button spectrum-Button--outline spectrum-Button--sizeXL quiz-btn" 
              daa-ll="Filters|cc:app-reco|Q#1/Photo">
                <span class="quiz-Button-label">${btnText}</span>
            </button>
          </div>
        </div>
      </div>`;
};

const getStringValue = (propName) => {
  const currQ = userJourney.value.currentQuestion.questions;
  const stringQuestionList = userJourney.value.stringQuestionList;
  const qInContext = stringQuestionList[currQ];
  return qInContext[propName];
}

const createOptionsDataArr = () => {
  const currQ = userJourney.value.currentQuestion.questions;
  const optionsData = userJourney.value.rawDataStrings[currQ];
  return optionsData;
}

const App = () => {
  // debugger;
  return html `<div class="quiz-container">
      <div class="background">
        <${DecorateBlockBackground} background=${getStringValue('background')} />
      </div>
      <${DecorateBlockForeground} 
        heading=${getStringValue('heading')} 
        subhead=${getStringValue('sub-head')} 
        btnText=${getStringValue('btn')}/>
        <${GetQuizOption} btnText=${getStringValue('btn')} options=${createOptionsDataArr()} />
  </div>`
}

let getConfigPath = function() {};

export default async function init(el) {
  rootElement = el;
  getConfigPath = initConfigPath(rootElement);
  await getAllData(); // Waiting for all the data to load and then calling the App.

  render(html `<${App} />`, rootElement);
}

const initConfigPath = (roolElm) => (filepath) => {
  const link = roolElm.querySelector('.quiz > div > div > a');
  const quizConfigPath = link.text.toLowerCase();

  return `${quizConfigPath}${filepath}`;
}

async function fetchContentOfFile(path) {
  const response = await fetch(getConfigPath(path));
  return await response.json();
}



async function getAllData() {
  try {
    return Promise.all([fetchContentOfFile(QUESTIONS_EP_NAME), fetchContentOfFile(STRINGS_EP_NAME)]).then(function (
      [questions, datastrings]
    ) {
      console.log(questions, datastrings);
      questions.questions.data.forEach((question) => {
        userJourney.value.questionList[question.questions] = question;
      });

      datastrings.questions.data.forEach((question) => {
        userJourney.value.stringQuestionList[question.q] = question;
      });

      userJourney.value.rawDataStrings = datastrings;
      userJourney.value.currentQuestion = questions.questions.data[0];    
      
    });
  } catch (ex) {
    console.log('Error while fetching data : ', ex);
  }
}

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
    
  }


  collectStrings();


};


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
    if (
      currentSelections.length ===
      parseInt(userJourney.value.currentQuestion['max-selections'])
    ) {
      const allCards = document.querySelectorAll('.quiz-option');
      allCards.forEach((card) => {
        if (!card.classList.contains('selected')) {
          card.classList.add('disabled');
        }
      });
    }
  }

  const quizNextBtn = document.querySelectorAll('.quiz-btn')[0];
  if (
    currentSelections.length >=
    parseInt(userJourney.value.currentQuestion['min-selections'])
  ) {
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
    questionId: userJourney.value.currentQuestion.questions,
    questionTitle: userJourney.value.currentQuestion.heading,
    answers: currentSelections,
  };

  flow.push(currentState);
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
  console.log('flow observed till now :: ', flow);
  let res = parseResultData(flow);

  console.log('finally res object is:', res);
  let redirectUrl =
    'https://main--milo--adobecom.hlx.page/drafts/sabya/quiz-2/photoshop-results' +
    '?products=' +
    res.primary +
    '&' +
    buildQueryParam();

  // window.location.href = redirectUrl;
};

const buildQueryParam = () => {
  return flow.reduce(function (str, el, i) {
    return str + (i > 0 ? '&' : '') + el.questionId + '=' + el.answers;
  }, '');
};

const parseResultData = (answers) => {
  console.log('result data :: ', window.milo.results);
  const results = window.milo.results.result.data.reduce(
    (resultObj, resultMap) => {
      let hasMatch = false;
      const resultRow = Object.entries(resultMap);
      for (let i = 0; i < resultRow.length; i++) {
        const key = resultRow[i][0];
        const val = resultRow[i][1];
        if (key.startsWith('q-') && val) {
          const answer = answers.find((a) => a.questionId === key);
          if (answer && answer.answers.includes(val)) {
            hasMatch = true;
          } else {
            // q-question value did not match any answers, entire row does not match
            return resultObj;
          }
        }
      }
      if (hasMatch) {
        resultObj.primary = resultObj.primary.concat(
          resultMap['result-primary'].split(',')
        );
        resultObj.secondary = resultObj.secondary.concat(
          resultMap['result-secondary'].split(',')
        );
      }

      return resultObj;
    },
    {
      primary: [],
      secondary: [],
    }
  );

  results.primary = [...new Set(results.primary.filter(Boolean))];
  results.secondary = [...new Set(results.secondary.filter(Boolean))];

  // Find result destination page.

  const matchedResults = findMatchForSelections(
    window.milo.results['result-destination'].data,
    results
  );
  console.log('matched results from Sanu bhai is:', matchedResults);

  return results;
};

const getRecomandationResults = (selectedDestination, deafult) =>
  selectedDestination.length ? selectedDestination : deafult;

// needs refactoring - can split to smaller functions
const findMatchForSelections = (results, selections) => {
  const recommendations = [];
  const matchResults = [];
  const defaultResult = [];

  results.forEach((destination) => {
    if (destination.result.indexOf('&') == -1) {
      matchResults.push(destination.result);
    }
    if (destination.result == 'default') {
      defaultResult.push(destination);
    }
  });

  // direct match ac and express in results destination. Applying and condition
  const isProductsMatched = selections.primary.every((product) =>
    matchResults.includes(product)
  );

  if (isProductsMatched) {
    // lr, ai
    selections.primary.forEach((product) => {
      results.forEach((destination) => {
        if (destination.result == product) {
          recommendations.push(destination);
        }
      });
    });

    return getRecomandationResults(recommendations, defaultResult);
  }

  const userSelectionLen = selections.primary.length; // 1 - lr

  if (userSelectionLen <= 1) {
    return defaultResult;
  }

  const compundResults = results.find((destination) => {
    if (destination.result.indexOf('&') != -1 && destination.result.split('&').length === userSelectionLen) {
      return destination;
    }
  });

  const productList = compundResults.result.split('&');
  const isCompoundProductsMatched = selections.primary.every((product, index) => {
    return productList[index].includes(product);
  });

  if (isCompoundProductsMatched) {
    recommendations.push(compundResults);

    return recommendations;
  }
};

