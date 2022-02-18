const newToyBtnEl = document.querySelector('button#new-toy-btn');
const newtoyFormEl = document.querySelector('div.container');
const toyCollectionEl = document.querySelector('div#toy-collection');
const addToyFormEl = document.querySelector('form.add-toy-form');
const toyURL = 'http://localhost:4000/toys';
const state = { displayToyForm: false, toys: [] };

async function getData(url) {
    const getResponse = await fetch(url);
    const response = await getResponse.json();

    if (getResponse.ok && getResponse.status === 200) return response;

    let err = new Error();
    err = {
        ...err,
        ...{
            message: response.message || 'Failed GET request',
            status: response.status
        }
    };
    throw err;
}

async function sendData(url, method, data) {
    const postResponse = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(data)
    });
    const response = await postResponse.json();

    if (postResponse.ok) return response;

    let err = new Error();
    err = {
        ...err,
        ...{
            message: response.message || 'Failed POST request',
            status: response.status
        }
    };
    throw err;
}

function toggleToyForm() {
    state.displayToyForm = !state.displayToyForm;
    state.displayToyForm ? (newtoyFormEl.style.display = 'block') : (newtoyFormEl.style.display = 'none');
}

function createToyElement(toy) {
    const toyEl = document.createElement('div');
    toyEl.id = toy.id;
    toyEl.className = 'card';
    toyEl.innerHTML = `
      <h2>${toy.name}</h2>
      <img class='toy-avatar' src=${toy.image} />
      <p>${toy.likes} ${toy.likes === 1 || toy.likes === -1 ? 'Like' : 'Likes'}</p>
      <button class='like-btn'>Like <3</button>
        `;
    toyEl.addEventListener('click', likeToy);
    return toyEl;
}

function renderToyCollection() {
    state.toys.forEach(toy => {
        toyCollectionEl.appendChild(createToyElement(toy));
    });
}

async function loadAllToys() {
    try {
        const allToys = await getData(toyURL);
        state.toys = allToys;
        renderToyCollection();
    } catch (err) {
        console.debug('error getting toys', err);
    }
}

async function createToy(e) {
    e.preventDefault();
    const toy = { name: e.target.name.value, image: e.target.image.value, likes: 0 };
    try {
        const createdToy = await sendData(toyURL, 'POST', toy);
        state.toys.push(createdToy);
        e.target.reset();
        toggleToyForm();
        renderToyCollection();
    } catch (err) {
        console.debug('failed to add new toy', err);
    }
}
async function likeToy(e) {
    const elID = parseInt(e.target.parentNode.id, 10);
    const toyIdx = state.toys.findIndex(t => elID === t.id);
    const toy = { ...state.toys[toyIdx] };
    toy.likes++;
    try {
        const updatedToy = await sendData(`${toyURL}/${toy.id}`, 'PATCH', toy);
        state.toys[toyIdx] = updatedToy;
        const updatedToyEl = createToyElement(updatedToy);
        e.target.parentNode.replaceWith(updatedToyEl);
    } catch (err) {
        console.debug('failed to like the toy', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    newToyBtnEl.addEventListener('click', toggleToyForm);
    addToyFormEl.addEventListener('submit', createToy);
    loadAllToys();
});
