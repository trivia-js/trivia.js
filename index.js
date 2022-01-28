#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import fetch from 'node-fetch';
import { decode } from 'html-entities';

let playerName;
let questionsData;
let categoryValue;
let questionsDifficulty;
let currentQuestion = 0;
let correctQuestions = 0;
let questions = 0;

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function fetchQuestions(value, difficulty, amount) {
    amount = amount || 10;
    if (value === '') {
        if (difficulty === '') {
            const response = await fetch('https://opentdb.com/api.php?amount=' + amount);
            questionsData = await response.json();
        } else {
            const response = await fetch('https://opentdb.com/api.php?amount=' + amount + '&difficulty=' + difficulty);
            questionsData = await response.json();
        }
    } else {
        if (difficulty === '') {
            const response = await fetch('https://opentdb.com/api.php?amount=' + amount + '&category=' + value);
            questionsData = await response.json();
        } else {
            const response = await fetch('https://opentdb.com/api.php?amount=' + amount + '&category=' + value + '&difficulty=' + difficulty);
            questionsData = await response.json();
        }
    }
}

function getValue(category) {
    switch (category) {
        case 'Any Category':
            return '';
        case 'General Knowledge':
            return '9';
        case 'Entertainment: Books':
            return '10';
        case 'Entertainment: Film':
            return '11';
        case 'Entertainment: Music':
            return '12';
        case 'Entertainment: Musicals & Theatres':
            return '13';
        case 'Entertainment: Television':
            return '14';
        case 'Entertainment: Video Games':
            return '15';
        case 'Entertainment: Board Games':
            return '16';
        case 'Science & Nature':
            return '17';
        case 'Science: Computers':
            return '18';
        case 'Science: Mathematics':
            return '19';
        case 'Mythology':
            return '20';
        case 'Sports':
            return '21';
        case 'Geography':
            return '22';
        case 'History':
            return '23';
        case 'Politics':
            return '24';
        case 'Art':
            return '25';
        case 'Celebrities':
            return '26';
        case 'Animals':
            return '27';
        case 'Vehicles':
            return '28';
        case 'Entertainment: Comics':
            return '29';
        case 'Science: Gadgets':
            return '30';
        case 'Entertainment: Japanese Anime & Manga':
            return '31';
        case 'Entertainment: Cartoon & Animations':
            return '32';
    }
}

async function verifyAnswer(answer) {
    const spinner = createSpinner('Checking answer...').start();
    await sleep();
    if (answer === decode(questionsData['results'][currentQuestion]['correct_answer'])) {
        spinner.success({ text: 'Nice work. Your answer is correct\n--------------------------------\n' });
        correctQuestions++;
    } else {
        spinner.error({ text: 'Wrong answer. The correct answer was ' + questionsData['results'][currentQuestion]['correct_answer'] + '\n--------------------------------\n' });
    }
    currentQuestion++;
    console.log(chalk.yellow('Score: ' + correctQuestions + '/' + questions + '\n\n\n'));
}

async function start() {
    const title = chalkAnimation.rainbow('Command Line Trivia\n');
    await sleep();
    title.stop();
}

async function prompt() {
    const answers = await inquirer.prompt({
        name: 'playerName',
        type: 'input',
        message: 'What is your name?',
        default() {
            return 'player';
        }
    });
    playerName = answers.playerName;
}

async function handleCategory(category) {
    const spinner = createSpinner('').start();
    spinner.success(`You selected ${category}`);
    categoryValue = getValue(category);
}

async function getCategory() {
    const answers = await inquirer.prompt({
        name: 'category',
        type: 'list',
        message: `Hello ${playerName}, please select a category:`,
        choices: [
            'Any Category',
            'General Knowledge',
            'Entertainment: Books',
            'Entertainment: Comics',
            'Entertainment: Cartoon & Animations',
            'Entertainment: Film',
            'Entertainment: Music',
            'Entertainment: Musicals & Theatres',
            'Entertainment: Television',
            'Entertainment: Video Games',
            'Entertainment: Board Games',
            'Entertainment: Japanese Anime & Manga',
            'Science & Nature',
            'Science: Computers',
            'Science: Mathematics',
            'Science: Gadgets',
            'Mythology',
            'Sports',
            'Geography',
            'History',
            'Politics',
            'Art',
            'Celebrities',
            'Animals',
            'Vehicles'
        ]
    });
    return handleCategory(answers.category);
}

async function getDiffuculty() {
    const answers = await inquirer.prompt({
        name: 'difficulty',
        type: 'list',
        message: 'Difficulty:',
        choices: ['Any Difficulty', 'Easy', 'Medium', 'Hard']
    });
    if (answers.difficulty === 'Any Difficulty') {
        questionsDifficulty = '';
    } else {
        questionsDifficulty = answers.difficulty.toLowerCase();
    }
}

async function initTrivia() {
    const spinner = createSpinner('Fetching questions...\n').start();
    await fetchQuestions(categoryValue, questionsDifficulty, 10);
    spinner.success('');
    question();
}

async function resetQuestions() {
    await fetchQuestions(categoryValue, questionsDifficulty, 10);
    currentQuestion = 0;
}

async function question() {
    questions++;
    console.log(chalk.green('Question ' + questions + ' ->'));
    let choices = questionsData['results'][currentQuestion]['incorrect_answers'];
    choices.push(questionsData['results'][currentQuestion]['correct_answer']);
    for (let i = 0; i < choices.length; i++) {
        choices[i] = decode(choices[i]);
    }
    choices.sort();
    const answers = await inquirer.prompt({
        name: 'question',
        type: 'list',
        message: chalk.blue('Category: ') + chalk.red(questionsData['results'][currentQuestion]['category']) + '\n' + chalk.yellow(decode(questionsData['results'][currentQuestion]['question'])),
        choices: choices
    });
    await verifyAnswer(answers.question);
    if (currentQuestion === 9) {
        await resetQuestions();
    }
    question();
}

console.clear();
await start();
await prompt();
await getCategory();
await getDiffuculty();
await initTrivia();
