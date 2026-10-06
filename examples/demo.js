'use strict';

/*
 * ============================================================
 * CARDCHAIN DEMO
 * ============================================================
 *
 * This demonstrates the original idea behind CardChain Sort.
 *
 * We process the cards one at a time and place each card into
 * the first suitable decreasing chain.
 *
 * Example:
 *
 *     8
 *     3
 *
 *     7
 *
 *     1
 *
 * becomes:
 *
 *     Chain 1: 8 -> 3 -> 1
 *     Chain 2: 7
 *
 * The chains are then reversed and merged to produce the
 * final sorted result.
 *
 * Run:
 *
 *     npm run demo
 *
 * ============================================================
 */

const {
    cardChainSort,
    buildChains,
    analyzeCardChain
} = require('../src/cardChainSort');


/* ------------------------------------------------------------
 * Display Helpers
 * ------------------------------------------------------------ */

function printLine() {
    console.log('-'.repeat(60));
}


function printChains(chains) {

    chains.forEach((chain, index) => {

        console.log(
            `Chain ${index + 1}: ` +
            chain.join(' -> ')
        );
    });
}


/* ------------------------------------------------------------
 * Demonstration
 * ------------------------------------------------------------ */

console.log('');
console.log('======================================');
console.log('         CARDCHAIN DEMO');
console.log('======================================');


/*
 * This is the example that started much of the experimentation.
 */
const input = [
    8, 3, 7, 1,
    6, 2, 5, 4
];


console.log('');
console.log('Input:');
console.log(input.join('  '));


printLine();


/* ------------------------------------------------------------
 * Build Chains
 * ------------------------------------------------------------ */

const { chains, bottoms } =
    buildChains(input);


console.log('');
console.log('CHAINS CREATED');
console.log('');

printChains(chains);


console.log('');
console.log('Bottom cards:');
console.log(bottoms.join('  '));


/* ------------------------------------------------------------
 * Analysis
 * ------------------------------------------------------------ */

const analysis =
    analyzeCardChain(input);


console.log('');
console.log('ANALYSIS');
console.log('');

console.log(
    `Number of chains: ${analysis.numberOfChains}`
);

console.log(
    `Longest chain: ${analysis.longestChain}`
);

console.log(
    `Average chain length: ` +
    `${analysis.averageChainLength.toFixed(2)}`
);


/* ------------------------------------------------------------
 * Sort
 * ------------------------------------------------------------ */

const sorted =
    cardChainSort(input);


printLine();


console.log('');
console.log('FINAL RESULT');
console.log('');

console.log(
    sorted.join('  ')
);


/* ------------------------------------------------------------
 * Compare With Native JavaScript
 * ------------------------------------------------------------ */

const native =
    [...input].sort((a, b) => a - b);


console.log('');
console.log('Native JavaScript result:');
console.log(native.join('  '));


console.log('');
console.log(
    'Results match:',
    JSON.stringify(sorted) ===
    JSON.stringify(native)
);


/* ------------------------------------------------------------
 * More Examples
 * ------------------------------------------------------------ */

console.log('');
console.log('======================================');
console.log('          MORE EXAMPLES');
console.log('======================================');


const examples = [

    {
        name: 'Original 5-card example',
        input: [5, 1, 4, 2, 3]
    },

    {
        name: 'Already sorted',
        input: [1, 2, 3, 4, 5]
    },

    {
        name: 'Reverse sorted',
        input: [5, 4, 3, 2, 1]
    },

    {
        name: 'Alternating high / low',
        input: [10, 1, 9, 2, 8, 3, 7, 4, 6, 5]
    },

    {
        name: 'Random example',
        input: [9, 2, 7, 4, 1, 8, 3, 6, 5]
    }
];


for (const example of examples) {

    const result =
        cardChainSort(example.input);

    const info =
        analyzeCardChain(example.input);


    console.log('');
    console.log(example.name);

    console.log(
        'Input :',
        example.input.join(', ')
    );

    console.log(
        'Chains:',
        info.numberOfChains
    );

    console.log(
        'Output:',
        result.join(', ')
    );
}


/* ------------------------------------------------------------
 * Step-by-Step Demonstration
 * ------------------------------------------------------------
 *
 * This section shows how the chains evolve as each card
 * is inserted.
 */

console.log('');
console.log('======================================');
console.log('       STEP-BY-STEP INSERTION');
console.log('======================================');


const stepInput = [
    8, 3, 7, 1,
    6, 2, 5, 4
];


const stepChains = [];
const stepBottoms = [];


for (const card of stepInput) {

    /*
     * Find the first chain whose bottom is greater than
     * the current card.
     */
    let position = 0;

    while (
        position < stepBottoms.length &&
        stepBottoms[position] <= card
    ) {
        position++;
    }


    /*
     * No chain found.
     * Create a new one.
     */
    if (position === stepChains.length) {

        stepChains.push([card]);
        stepBottoms.push(card);

    }

    /*
     * Existing chain.
     */
    else {

        stepChains[position].push(card);
        stepBottoms[position] = card;
    }


    console.log('');
    console.log(`Insert ${card}`);

    printChains(stepChains);

    console.log(
        'Bottoms:',
        stepBottoms.join('  ')
    );
}


/* ------------------------------------------------------------
 * Final
 * ------------------------------------------------------------ */

console.log('');
console.log('======================================');
console.log('              DONE');
console.log('======================================');
console.log('');
