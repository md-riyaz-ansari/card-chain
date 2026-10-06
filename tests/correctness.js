'use strict';

const {
    cardChainSort,
    buildChains,
    analyzeCardChain
} = require('../src/cardChainSort');


/*
 * ============================================================
 * CARDCHAIN CORRECTNESS TESTS
 * ============================================================
 *
 * This file tests the algorithm from several different angles.
 *
 * We are not only checking:
 *
 *     "Does it return a sorted array?"
 *
 * We also check:
 *
 *     - Are all elements preserved?
 *     - Are duplicates preserved?
 *     - Are the chains decreasing?
 *     - Are the chain bottoms increasing?
 *     - Does the algorithm work on random inputs?
 *     - Does it work on every permutation for small n?
 *
 */


/* ------------------------------------------------------------
 * Utility Functions
 * ------------------------------------------------------------ */

function arraysEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}


function isSorted(array) {
    for (let i = 1; i < array.length; i++) {
        if (array[i - 1] > array[i]) {
            return false;
        }
    }

    return true;
}


function sortedCopy(array) {
    return [...array].sort((a, b) => a - b);
}


function sameElements(a, b) {
    return arraysEqual(sortedCopy(a), sortedCopy(b));
}


function chainsAreDecreasing(chains) {
    for (const chain of chains) {
        for (let i = 1; i < chain.length; i++) {
            if (chain[i - 1] <= chain[i]) {
                return false;
            }
        }
    }

    return true;
}


function bottomsAreIncreasing(bottoms) {
    for (let i = 1; i < bottoms.length; i++) {
        if (bottoms[i - 1] >= bottoms[i]) {
            return false;
        }
    }

    return true;
}


/* ------------------------------------------------------------
 * Random Input
 * ------------------------------------------------------------ */

function randomArray(n) {
    const array = [];

    for (let i = 0; i < n; i++) {
        array.push(i + 1);
    }

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
            [array[j], array[i]];
    }

    return array;
}


/* ------------------------------------------------------------
 * Permutation Generator
 * ------------------------------------------------------------ */

function generatePermutations(array) {
    const result = [];

    function backtrack(start) {

        if (start === array.length) {
            result.push([...array]);
            return;
        }

        for (let i = start; i < array.length; i++) {

            [array[start], array[i]] =
                [array[i], array[start]];

            backtrack(start + 1);

            [array[start], array[i]] =
                [array[i], array[start]];
        }
    }

    backtrack(0);

    return result;
}


/* ------------------------------------------------------------
 * Basic Correctness Tests
 * ------------------------------------------------------------ */

console.log('======================================');
console.log('       CARDCHAIN CORRECTNESS TEST');
console.log('======================================');


const basicTests = [
    [],
    [1],
    [1, 2],
    [2, 1],
    [1, 2, 3, 4, 5],
    [5, 4, 3, 2, 1],
    [5, 1, 4, 2, 3],
    [8, 3, 7, 1, 6, 2, 5, 4],
    [10, 1, 9, 2, 8, 3, 7, 4, 6, 5],

    // Duplicate values
    [3, 1, 3, 2, 1],
    [5, 5, 4, 4, 3, 3],
    [1, 1, 1, 1],
    [4, 2, 4, 1, 2, 3, 4]
];


let passed = 0;
let failed = 0;


for (const input of basicTests) {

    const output = cardChainSort(input);
    const expected = sortedCopy(input);

    const correct =
        arraysEqual(output, expected) &&
        sameElements(input, output);

    if (correct) {
        passed++;
    } else {
        failed++;

        console.log('\nFAILED:');
        console.log('Input:    ', input);
        console.log('Expected: ', expected);
        console.log('Got:      ', output);
    }
}


console.log(`Basic tests passed: ${passed}`);
console.log(`Basic tests failed: ${failed}`);


/* ------------------------------------------------------------
 * Chain Invariant Tests
 * ------------------------------------------------------------ */

console.log('\n======================================');
console.log('       CHAIN INVARIANT TEST');
console.log('======================================');


let invariantPassed = 0;
let invariantFailed = 0;


for (let trial = 0; trial < 5000; trial++) {

    const n =
        Math.floor(Math.random() * 100) + 1;

    const input = randomArray(n);

    const { chains, bottoms } =
        buildChains(input);

    const validChains =
        chainsAreDecreasing(chains);

    const validBottoms =
        bottomsAreIncreasing(bottoms);

    const validElements =
        sameElements(
            input,
            chains.flat()
        );

    if (
        validChains &&
        validBottoms &&
        validElements
    ) {
        invariantPassed++;
    } else {
        invariantFailed++;

        console.log('\nFAILED INVARIANT:');
        console.log('Input:', input);
        console.log('Chains:', chains);
        console.log('Bottoms:', bottoms);
    }
}


console.log(
    `Invariant tests passed: ${invariantPassed}`
);

console.log(
    `Invariant tests failed: ${invariantFailed}`
);


/* ------------------------------------------------------------
 * Random Correctness Tests
 * ------------------------------------------------------------ */

console.log('\n======================================');
console.log('       RANDOM CORRECTNESS TEST');
console.log('======================================');


let randomPassed = 0;
let randomFailed = 0;


for (let trial = 0; trial < 10000; trial++) {

    const n =
        Math.floor(Math.random() * 250) + 1;

    const input = randomArray(n);

    const output = cardChainSort(input);

    const expected = sortedCopy(input);

    if (arraysEqual(output, expected)) {
        randomPassed++;
    } else {
        randomFailed++;

        console.log('\nFAILED RANDOM TEST:');
        console.log('Input:', input);
        console.log('Expected:', expected);
        console.log('Output:', output);

        break;
    }
}


console.log(
    `Random tests passed: ${randomPassed}`
);

console.log(
    `Random tests failed: ${randomFailed}`
);


/* ------------------------------------------------------------
 * Exhaustive Permutation Tests
 *
 * Every permutation is tested for n = 1 ... 7.
 *
 * 7! = 5040 permutations.
 *
 * This gives a much stronger correctness check than
 * testing only random inputs.
 * ------------------------------------------------------------ */

console.log('\n======================================');
console.log('       EXHAUSTIVE TEST');
console.log('======================================');


let exhaustivePassed = 0;
let exhaustiveFailed = 0;


for (let n = 1; n <= 7; n++) {

    const input = [];

    for (let i = 1; i <= n; i++) {
        input.push(i);
    }

    const permutations =
        generatePermutations(input);

    let nPassed = 0;
    let nFailed = 0;

    for (const permutation of permutations) {

        const output =
            cardChainSort(permutation);

        const expected =
            sortedCopy(permutation);

        const correct =
            arraysEqual(output, expected);

        if (correct) {
            nPassed++;
            exhaustivePassed++;
        } else {
            nFailed++;
            exhaustiveFailed++;

            console.log('\nCOUNTEREXAMPLE FOUND:');
            console.log('Input:', permutation);
            console.log('Expected:', expected);
            console.log('Output:', output);

            break;
        }
    }

    console.log(
        `n=${n}: ${nPassed}/${permutations.length} passed`
    );

    if (nFailed > 0) {
        break;
    }
}


console.log(
    `Total exhaustive tests passed: ${exhaustivePassed}`
);

console.log(
    `Total exhaustive tests failed: ${exhaustiveFailed}`
);


/* ------------------------------------------------------------
 * Research Properties
 * ------------------------------------------------------------ */

console.log('\n======================================');
console.log('       RESEARCH PROPERTIES');
console.log('======================================');


/*
 * The algorithm is closely related to LIS.
 *
 * We calculate LIS independently here so that we can compare
 * the number of CardChain chains against LIS length.
 */

function lisLength(array) {

    if (array.length === 0) {
        return 0;
    }

    const tails = [];

    for (const value of array) {

        let left = 0;
        let right = tails.length;

        while (left < right) {

            const mid =
                left + ((right - left) >> 1);

            if (tails[mid] < value) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        tails[left] = value;
    }

    return tails.length;
}


let lisPassed = 0;
let lisFailed = 0;


for (let trial = 0; trial < 5000; trial++) {

    const n =
        Math.floor(Math.random() * 100) + 1;

    const input = randomArray(n);

    const analysis =
        analyzeCardChain(input);

    const lis =
        lisLength(input);

    if (analysis.numberOfChains === lis) {
        lisPassed++;
    } else {
        lisFailed++;

        console.log('\nLIS COUNTEREXAMPLE:');
        console.log('Input:', input);
        console.log(
            'CardChain chains:',
            analysis.numberOfChains
        );
        console.log('LIS:', lis);

        break;
    }
}


console.log(
    `Chain count = LIS tests passed: ${lisPassed}`
);

console.log(
    `Chain count = LIS tests failed: ${lisFailed}`
);


/* ------------------------------------------------------------
 * Final Result
 * ------------------------------------------------------------ */

console.log('\n======================================');
console.log('             FINAL RESULT');
console.log('======================================');


const totalFailed =
    failed +
    invariantFailed +
    randomFailed +
    exhaustiveFailed +
    lisFailed;


if (totalFailed === 0) {

    console.log('ALL TESTS PASSED');

} else {

    console.log(
        `TESTS FAILED: ${totalFailed}`
    );
}


console.log('\nDone.');
