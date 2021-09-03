//Variables
const container = document.getElementById('container')
const triesCounter = document.getElementById('tries')
const pointsCounter = document.getElementById('points')
const comboCounter = document.getElementById('combo')
const scoreboard = document.getElementById('scoreboard')
const form = document.getElementById('form')
const modal = document.getElementById('modal')
const modalWin = document.getElementById('modal-win')
const restart = document.getElementById('restart')

let cards = 24
let firstPick;
let tries = cards
let cardsCount = 0
let points = 0
let combo = 1
let mode = 10
let time = 5000
let ultimate = false
const ls = localStorage
let rankingData = JSON.parse(ls.getItem('rankingData'))




// ranking functions
const drawRanking = (rankingData) => {
  scoreboard.innerHTML = ''
  const fragment = document.createDocumentFragment()
  const dataField = document.createElement('div')
  dataField.classList.add('scoreboard__text')
  for (position of rankingData) {
    const data = dataField.cloneNode()
    if (position.new) {
      data.classList.add('blink')
      position.new = false
    }
    data.innerHTML = `<span class="scoreboard__name">${position.name}</span>   <span class="scoreboard__points">${position.points} points</span>   <span>${position.level}</span>`
    fragment.appendChild(data)
  }
  scoreboard.appendChild(fragment)
  ls.setItem("rankingData", JSON.stringify(rankingData))
}

const createRanking = () => {
  if (!rankingData) {
    ls.setItem('rankingData', JSON.stringify([
      { name: 'Ash', points: 400, level: 'HARD' },
      { name: 'Misty', points: 350, level: 'HARD' },
      { name: 'Brock', points: 300, level: 'HARD' },
      { name: 'Tracey', points: 250, level: 'NORMAL' },
      { name: 'Aura', points: 200, level: 'NORMAL' },
      { name: 'Max', points: 150, level: 'NORMAL' },
      { name: 'Jessie', points: 100, level: 'EASY' },
      { name: 'James', points: 90, level: 'EASY' },
      { name: 'Magikarp', points: 10, level: 'EASY' },
    ]))
    rankingData = JSON.parse(ls.getItem('rankingData'))
  }
}

const savePoints = (points) => {
  rankingData[rankingData.length - 1].points = points
  rankingData.sort((a, b) => (b.points - a.points))
  if (rankingData.length > 10) {
    rankingData = rankingData.slice(0, 10)
  }
  drawRanking(rankingData)
}




// win functions
const winConditions = () => {
  tries--;
  triesCounter.innerHTML = `${tries}`.padStart(2, "0")
  triesCounter.classList.add('update')
  setTimeout(() => {
    triesCounter.classList.remove('update')
  }, 500)
  pointsCounter.innerHTML = `${points}`.padStart(3, "0")
  if (cardsCount == cards) {
    if (rankingData[rankingData.length - 1].level == "HARD" && ultimate == false) {
      unlockUltimate()
    } else {
      modalWin.firstElementChild.innerText = 'YOU WIN!'
    }
    savePoints(points)
    setTimeout(() => modalWin.classList.toggle('modal-win--show'), 1000)
  }
  if (tries == 0 && cardsCount != cards) {
    modalWin.firstElementChild.innerText = 'YOU LOSE!'
    rankingData.pop()
    setTimeout(() => modalWin.classList.toggle('modal-win--show'), 1000)
  }
}

const unlockUltimate = () => {
  form.children[1].children[1].lastElementChild.removeAttribute('hidden')
  modalWin.firstElementChild.innerHTML = `YOU WIN!<br><span>ULTIMATE DIFFICULTY MODE UNLOCKED!</span>`
  ultimate = true
}




// cards functions
const checkSecond = (secondpick) => {
  if (cardsCount % 2 != 0) {
    secondpick.classList.add('card--turn')
    if (firstPick.getAttribute("id") === secondpick.getAttribute("id")) {
      cardsCount++
      points += mode * combo
      combo++
      comboCounter.innerHTML = `Combo ${mode}<span>x${combo}</span>`
      comboCounter.firstElementChild.classList.add('multiplier')
      setTimeout(() => {
        triesCounter.classList.remove('multiplier')
      }, 500)
      firstPick = undefined
    } else {
      cardsCount--
      combo = 1
      comboCounter.innerHTML = `Combo ${mode}<span>x${combo}</span>`
      setTimeout(() => {
        firstPick.classList.remove("card--turn")
        secondpick.classList.remove('card--turn')
        firstPick = undefined
      }, 1000)
    }
    winConditions()
  }
}

const checkFirst = (pick) => {
  if (pick.classList.contains("card")) {
    if (firstPick == undefined) {
      pick.classList.add('card--turn')
      firstPick = pick
      cardsCount++;
    } else {
      checkSecond(pick)
    }
  }
}

const shufflePositions = () => {
  let pairs = []
  for (let index = 0; index < cards / 2; index++) {
    let position = Math.floor(Math.random() * 151) + 1
    while (pairs.includes(position)) {
      position = Math.floor(Math.random() * 151)
    }
    pairs.push(position)
  }
  return [...pairs, ...pairs].sort(() => Math.random() - 0.5)
}

const createCards = (positions) => {
  container.innerHTML = ''
  const fragment = document.createDocumentFragment()
  for (number of positions) {
    const card = document.createElement('div')
    card.classList.add('card')
    card.id = number
    const back = document.createElement('div')
    back.classList.add('card-back')
    card.appendChild(back)
    const front = document.createElement('div')
    front.classList.add('card-front')
    const img = document.createElement('img')
    img.classList.add('card__image')
    img.setAttribute('src', `./assets/images/png/${number}.png`);
    img.setAttribute('alt', 'pokemon');
    front.appendChild(img)
    card.appendChild(front)
    fragment.appendChild(card)
  }
  container.appendChild(fragment)
}

const turnCards = () => {
  const allCards = document.querySelectorAll('.card')
  for (card of allCards) {
    card.classList.toggle('card--turn')
  }
}




// form functions
const selectLevel = (level) => {
  switch (level) {
    case 'easy':
      tries = 25
      mode = 5
      time = 6000
      break
    case 'normal':
      tries = 22
      mode = 10
      time = 5000
      break
    case 'hard':
      tries = 20
      mode = 15
      time = 4000
      break
    case 'ultimate':
      tries = 18
      mode = 20
      time = 3000
    default:
      break
  }
}

const savePlayer = (name, level) => {
  if (name == '') name = 'unknown'
  const player = { name, points: 0, level: level.toUpperCase(), new: true }
  rankingData.push(player)
}


const startGame = () => {
  const randomPositions = shufflePositions()
  createCards(randomPositions)
  createRanking()
  modal.classList.toggle('modal--close')
}




//Init Game
window.addEventListener("load", () => {
  startGame()
})

//PLayer form submit
form.addEventListener("submit", (e) => {
  e.preventDefault()
  savePlayer(e.target.player.value, e.target.level.value)
  selectLevel(e.target.level.value)
  triesCounter.innerHTML = `${tries}`
  pointsCounter.innerHTML = '000'
  comboCounter.innerHTML = `Combo ${mode}<span>x${combo}</span>`
  modal.classList.toggle('modal--close')
  turnCards()
  setTimeout(() => turnCards(), time)
})

//Pairing Cards
container.addEventListener("click", (e) => {
  if (tries !== 0) {
    checkFirst(e.target.parentElement)
  }
})

//Restart Game
restart.addEventListener('click', () => {
  modalWin.classList.toggle('modal-win--show')
  startGame()
  tries = cards
  cardsCount = 0
  points = 0
  combo = 1
  scoreboard.innerHTML = ''
})