const BASE_API_URL = "https://jservice.io/";
const totalCat = 6;
const totalClues = 5;

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]





/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const response = await axios.get(`${BASE_API_URL}/api/categories?count=100`);
    let catIds = response.data.map(catId => catId.id);
    
    return _.sampleSize(catIds, totalCat);
}



/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const response = await axios.get(`${BASE_API_URL}/api/category?id=${catId}`);
    let cat = response.data;
    let allClues = cat.clues;
    let randomClues = _.sampleSize(allClues, totalClues);
    let clues = randomClues.map(clue => ({
        question : clue.question,
        answer : clue.answer,
        showing: null
    }));

    return {title: cat.title , clues}
}






/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    const tableHead = document.querySelector('#jeopardy thead');
    const tablebody = document.querySelector('#jeopardy tbody');
    tableHead.innerHTML="";
    tablebody.innerHTML="";
    const headTr = document.createElement('tr');
    for(let catIdx =0; catIdx< totalCat; catIdx++){
        let th = document.createElement('th');
        th.setAttribute('id', catIdx)
        th.innerText = categories[catIdx].title;
        headTr.append(th);
        
    }
    tableHead.append(headTr);

    for(let cludeIdx=0; cludeIdx < totalClues; cludeIdx++){
        const bodyTr = document.createElement('tr');
        for(let catIdx = 0; catIdx< totalCat; catIdx++){
            let td = document.createElement('td');
            td.setAttribute('id', `${cludeIdx}-${catIdx}`)
            td.innerText = "?";
            bodyTr.append(td);
        }
        tablebody.append(bodyTr);    
    }
    

}



/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(e) {
    
    let targetTag = e.target.tagName;
    
    if(targetTag === "TD"){
        let id = e.target.id;
        let [cludeIdx, catIdx] = id.split('-');
        let clue = categories[catIdx].clues[cludeIdx];
        let show
        if(!clue.showing){
            show = clue.question;
            clue.showing = "question"
            
        } else if(clue.showing === "question"){
            show = clue.answer;
            clue.showing = "answer"
        }
        e.target.innerText = show
        
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    loader.style.display = 'block'
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    loader.style.display = 'none'
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView()
    let catIds = await getCategoryIds();
    
    categories = [];
    for(let catId of catIds){
        categories.push(await getCategory(catId));
        
    }
    
    fillTable()
    hideLoadingView()
}

/** On click of start / restart button, set up game. */
const loader = document.querySelector('#loader')
const restartBtn = document.querySelector('#restart')
restartBtn.addEventListener('click', setupAndStart)

/** On page load, add event handler for clicking clues */

// TODO


document.addEventListener('DOMContentLoaded', function(){
    
    const table = document.querySelector('#jeopardy');
    table.addEventListener('click', handleClick);
})