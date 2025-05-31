/**
 * @license
 * Copyright 2020 Neil Fraser
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Repeat game.
 * @author root@neil.fraser.name (Neil Fraser)
 */
'use strict';

var currentAudio = null;
var pattern = [];
var index = 0;

var modes = {
  START: -1,
  COMPUTER: 0,
  HUMAN: 1,
  STOPPED: 2
};
var mode = modes.START;

var LEVELS;
var levelCircles = [];

var winTune = [4, 3, 2, 1, 2, 3, 4];

function init() {
  fixLinks();

  var m = document.cookie.match(/difficulty=([012])/);
  var difficultyIndex = m ? m[1] : 0;
  LEVELS = [8, 16, 32][difficultyIndex];
  document.getElementById('difficulty').selectedIndex = difficultyIndex;
  registerOptions('difficulty');

  for (var i = 1; i <= 4; i++) {
    var button = document.getElementById('b' + i);
    button.addEventListener('mousedown', buttonStart.bind(button, i));
    button.addEventListener('mouseup', buttonStop.bind(button, i));
    button.addEventListener('mouseout', buttonStop.bind(button, i));
  }

  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);
  document.addEventListener('keypress', keyPress);

  document.getElementById('start').addEventListener('click', startGame);
  showStart();
  initTimeline();
}
window.addEventListener('load', init);

function initTimeline() {
  var svg = document.getElementById('timeline');
  var svgNS = svg.namespaceURI;
  for (var i = 0; i < LEVELS; i++) {
    var x = (90 / (LEVELS - 1) * i) + 5;
    var circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', x + '%');
    circle.setAttribute('cy', 10);
    circle.setAttribute('r', 5);
    circle.setAttribute('class', 'notDone');
    svg.appendChild(circle);
    levelCircles[i] = circle;
  }
  document.getElementById('levelMax').textContent = LEVELS;
}

function showStart() {
  document.body.className = '';
  var startButton = document.getElementById('start');
  startButton.style.display = '';
  var table = document.getElementById('controls');
  table.classList.add('disabled');
  mode = modes.START;
}

function startGame() {
  var startButton = document.getElementById('start');
  startButton.style.display = 'none';
  var table = document.getElementById('controls');
  table.classList.remove('disabled');
  pattern.length = 0;
  for (var circle, i = 0; (circle = levelCircles[i]); i++) {
    circle.setAttribute('class', 'notDone');
    circle.setAttribute('r', 5);
  }
  startComputer();
}

function startComputer() {
  mode = modes.COMPUTER;
  index = 0;
  document.getElementById('level').textContent = pattern.length;
  if (pattern.length) {
    levelCircles[pattern.length - 1].setAttribute('class', 'done');
    levelCircles[pattern.length - 1].setAttribute('r', 5);
  }

  // 🎉 1. seviye geçildiyse popup göster
  if (pattern.length === 1) {
    showPasswordModal();
  }

  if (pattern.length === LEVELS) {
    mode = modes.STOPPED;
    index = 0;
    setTimeout(playWinTune, 1000);
    return;
  }
  levelCircles[pattern.length].setAttribute('class', 'now');
  levelCircles[pattern.length].setAttribute('r', 7);
  pattern.push(Math.floor(Math.random() * 4) + 1);
  setTimeout(playStep, 1000);
}

function playWinTune() {
  var note = winTune[index];
  if (note === undefined) {
    setTimeout(showStart, 500);
    return;
  }
  noteStart(note);
  setTimeout(noteStop.bind(this, note), 200);
  index++;
  setTimeout(playWinTune, 250);
}

function playStep() {
  var note = pattern[index];
  if (note === undefined) {
    startHuman();
    return;
  }
  noteStart(note);
  setTimeout(noteStop.bind(this, note), 500);
  index++;
  setTimeout(playStep, 750);
}

function startHuman() {
  mode = modes.HUMAN;
  index = 0;
}

function fail() {
  document.body.className = 'shake';
  document.getElementById('crash').play();
  mode = modes.STOPPED;
  setTimeout(showStart, 1000);
}

function keyPress(e) {
  if (mode === modes.START && (e.key === 'Enter' || e.key === ' ')) {
    startGame();
    e.preventDefault();
  }
}

function keyDown(e) {
  if (e.repeat) return;
  switch (e.key) {
    case 'ArrowUp':
      buttonStart(1);
      break;
    case 'ArrowLeft':
      buttonStart(2);
      break;
    case 'ArrowDown':
      buttonStart(3);
      break;
    case 'ArrowRight':
      buttonStart(4);
      break;
    default:
      return;
  }
  e.preventDefault();
}

function keyUp(e) {
  switch (e.key) {
    case 'ArrowUp':
      buttonStop(1);
      break;
    case 'ArrowLeft':
      buttonStop(2);
      break;
    case 'ArrowDown':
      buttonStop(3);
      break;
    case 'ArrowRight':
      buttonStop(4);
      break;
    default:
      return;
  }
  e.preventDefault();
}

function buttonStart(i) {
  if (mode !== modes.HUMAN) return;
  var expectedNote = pattern[index];
  index++;
  if (expectedNote == i) {
    noteStart(i);
  } else {
    fail();
  }
}

function buttonStop(i) {
  if (mode !== modes.HUMAN) return;
  noteStop(i);
  if (index === pattern.length) {
    mode = modes.COMPUTER;
    startComputer();
  }
}

function noteStart(i) {
  if (currentAudio) {
    currentAudio.pause();
  }
  var button = document.getElementById('b' + i);
  button.classList.add('highlight');
  currentAudio = document.getElementById('a' + i);
  currentAudio.load();
  currentAudio.play();
}

function noteStop(i) {
  var button = document.getElementById('b' + i);
  button.classList.remove('highlight');
}

// 🎯 Şifre popup fonksiyonları:
function showPasswordModal() {
  const modal = document.getElementById('passwordModal');
  if (modal) modal.style.display = 'flex';
}

function closePasswordModal() {
  const modal = document.getElementById('passwordModal');
  if (modal) modal.style.display = 'none';
}
