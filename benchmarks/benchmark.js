'use strict';

/*
 * ============================================================
 * CARDCHAIN BENCHMARK
 * ============================================================
 *
 * Compares:
 *
 *   - CardChain
 *   - Insertion Sort
 *   - Merge Sort
 *   - Quick Sort
 *   - Native JavaScript sort
 *
 * Metrics:
 *
 *   - Execution time
 *   - Number of comparisons
 *   - Number of CardChain chains
 *   - Longest chain
 *
 * IMPORTANT:
 *
 * Benchmark numbers depend on:
 *
 *   - CPU
 *   - Node.js version
 *   - JavaScript engine
 *   - Operating system
 *   - Background processes
 *
 * Therefore these numbers should be treated as experimental
 * measurements, not universal performance claims.
 *
 * ============================================================
 */

const {
    cardChainSort,
    analyzeCardChain
} = require('../src/cardChainSort');


/* ------------------------------------------------------------
 * Configuration
 * ------------------------------------------------------------ */

const SIZES = [10, 25, 50, 100, 250, 500];

const TRIALS = {
    10: 5000,
    25: 3000,
    50: 1000,
    100: 300,
    250: 100,
    500: 30
};


/* ------------------------------------------------------------
 * Comparison Counter
 * ------------------------------------------------------------ */

function createCounter() {
    return {
        comparisons: 0
    };
}


function compare(counter, a, b) {
    counter.comparisons++;
    return a - b;
}


/* ------------------------------------------------------------
 * Input Generators
 * ------------------------------------------------------------ */

function randomArray(n) {

    const array = [];

    for (let i = 1; i <= n; i++) {
        array.push(i);
    }

    for (let i = array.length - 1; i > 0; i--) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
            [array[j], array[i]];
    }

    return array;
}


function sortedArray(n) {

    const array = [];

    for (let i = 1; i <= n; i++) {
        array.push(i);
    }

    return array;
}


function reverseArray(n) {

    const array = [];

    for (let i = n; i >= 1; i--) {
        array.push(i);
    }

    return array;
}


function nearlySortedArray(n) {

    const array = sortedArray(n);

    const swaps =
        Math.max(1, Math.floor(n * 0.02));

    for (let i = 0; i < swaps; i++) {

        const a =
            Math.floor(Math.random() * n);

        const b =
            Math.floor(Math.random() * n);

        [array[a], array[b]] =
            [array[b], array[a]];
    }

    return array;
}


/* ------------------------------------------------------------
 * Insertion Sort
 * ------------------------------------------------------------ */

function insertionSort(input) {

    const array = [...input];

    const counter = createCounter();

    for (let i = 1; i < array.length; i++) {

        const key = array[i];

        let j = i - 1;

        while (
            j >= 0 &&
            compare(counter, array[j], key) > 0
        ) {
            array[j + 1] = array[j];
            j--;
        }

        array[j + 1] = key;
    }

    return {
        result: array,
        comparisons: counter.comparisons
    };
}


/* ------------------------------------------------------------
 * Merge Sort
 * ------------------------------------------------------------ */

function mergeSort(input) {

    const counter = createCounter();

    function merge(left, right) {

        const result = [];

        let i = 0;
        let j = 0;

        while (
            i < left.length &&
            j < right.length
        ) {

            if (
                compare(
                    counter,
                    left[i],
                    right[j]
                ) <= 0
            ) {
                result.push(left[i]);
                i++;
            } else {
                result.push(right[j]);
                j++;
            }
        }

        while (i < left.length) {
            result.push(left[i++]);
        }

        while (j < right.length) {
            result.push(right[j++]);
        }

        return result;
    }


    function sort(array) {

        if (array.length <= 1) {
            return array;
        }

        const middle =
            Math.floor(array.length / 2);

        const left =
            sort(array.slice(0, middle));

        const right =
            sort(array.slice(middle));

        return merge(left, right);
    }


    return {
        result: sort([...input]),
        comparisons: counter.comparisons
    };
}


/* ------------------------------------------------------------
 * Quick Sort
 * ------------------------------------------------------------ */

function quickSort(input) {

    const counter = createCounter();

    const array = [...input];


    function partition(low, high) {

        const pivot = array[high];

        let i = low - 1;

        for (let j = low; j < high; j++) {

            if (
                compare(
                    counter,
                    array[j],
                    pivot
                ) < 0
            ) {
                i++;

                [array[i], array[j]] =
                    [array[j], array[i]];
            }
        }

        [array[i + 1], array[high]] =
            [array[high], array[i + 1]];

        return i + 1;
    }


    function sort(low, high) {

        if (low >= high) {
            return;
        }

        const pivot =
            partition(low, high);

        sort(low, pivot - 1);
        sort(pivot + 1, high);
    }


    sort(0, array.length - 1);


    return {
        result: array,
        comparisons: counter.comparisons
    };
}


/* ------------------------------------------------------------
 * Native JavaScript Sort
 * ------------------------------------------------------------ */

function nativeSort(input) {

    const array = [...input];

    const start = performance.now();

    array.sort((a, b) => a - b);

    const time =
        performance.now() - start;

    return {
        result: array,
        comparisons: null,
        time
    };
}


/* ------------------------------------------------------------
 * CardChain Wrapper
 * ------------------------------------------------------------ */

function runCardChain(input) {

    const start = performance.now();

    const result =
        cardChainSort(input);

    const time =
        performance.now() - start;

    const analysis =
        analyzeCardChain(input);

    return {
        result,
        time,
        comparisons: null,
        chains: analysis.numberOfChains,
        longestChain: analysis.longestChain
    };
}


/* ------------------------------------------------------------
 * Warm Up
 *
 * Give V8 a chance to optimize the functions before the
 * actual benchmark starts.
 * ------------------------------------------------------------ */

function warmUp() {

    for (let i = 0; i < 1000; i++) {

        const input = randomArray(50);

        cardChainSort(input);
        insertionSort(input);
        mergeSort(input);
        quickSort(input);

        input.sort((a, b) => a - b);
    }
}


/* ------------------------------------------------------------
 * Benchmark One Algorithm
 * ------------------------------------------------------------ */

function benchmarkAlgorithm(
    algorithm,
    inputs
) {

    let totalTime = 0;
    let totalComparisons = 0;

    let totalChains = 0;
    let totalLongestChain = 0;

    for (const input of inputs) {

        const start = performance.now();

        const result =
            algorithm(input);

        const elapsed =
            performance.now() - start;

        totalTime += elapsed;

        if (
            result.comparisons !== null &&
            result.comparisons !== undefined
        ) {
            totalComparisons +=
                result.comparisons;
        }

        if (result.chains !== undefined) {
            totalChains += result.chains;
        }

        if (result.longestChain !== undefined) {
            totalLongestChain +=
                result.longestChain;
        }

        /*
         * Safety check.
         */
        const expected =
            [...input].sort((a, b) => a - b);

        for (let i = 0; i < expected.length; i++) {

            if (result.result[i] !== expected[i]) {
                throw new Error(
                    `${algorithm.name} produced incorrect output`
                );
            }
        }
    }


    return {
        time: totalTime,

        avgComparisons:
            totalComparisons / inputs.length,

        avgChains:
            totalChains / inputs.length,

        avgLongestChain:
            totalLongestChain / inputs.length
    };
}


/* ------------------------------------------------------------
 * Generate Inputs
 * ------------------------------------------------------------ */

function generateInputs(n, trials) {

    const inputs = [];

    for (let i = 0; i < trials; i++) {
        inputs.push(randomArray(n));
    }

    return inputs;
}


/* ------------------------------------------------------------
 * Print Result
 * ------------------------------------------------------------ */

function printResult(name, result) {

    const time =
        result.time.toFixed(3);

    const comparisons =
        Number.isFinite(result.avgComparisons)
            ? result.avgComparisons.toFixed(1)
            : '-';

    const chains =
        Number.isFinite(result.avgChains)
            ? result.avgChains.toFixed(2)
            : '-';

    const longest =
        Number.isFinite(result.avgLongestChain)
            ? result.avgLongestChain.toFixed(2)
            : '-';

    console.log(
        `${name.padEnd(16)} ` +
        `${time.padStart(10)} ms ` +
        `${comparisons.padStart(18)} ` +
        `${chains.padStart(12)} ` +
        `${longest.padStart(14)}`
    );
}


/* ------------------------------------------------------------
 * Main Benchmark
 * ------------------------------------------------------------ */

console.log('');
console.log('======================================');
console.log('       CARDCHAIN BENCHMARK');
console.log('======================================');

console.log('');
console.log('Warming up JavaScript engine...');

warmUp();

console.log('Warm-up complete.');


for (const n of SIZES) {

    const trials =
        TRIALS[n];

    console.log('');
    console.log(
        `========== n=${n}, trials=${trials} ==========`
    );

    const inputs =
        generateInputs(n, trials);


    console.log('');
    console.log(
        'Algorithm'.padEnd(16) +
        ' Time(ms)'.padStart(12) +
        ' Avg Comparisons'.padStart(20) +
        ' Avg Chains'.padStart(14) +
        ' Avg Longest'.padStart(16)
    );

    console.log(
        '-'.repeat(78)
    );


    const card =
        benchmarkAlgorithm(
            runCardChain,
            inputs
        );

    const insertion =
        benchmarkAlgorithm(
            insertionSort,
            inputs
        );

    const merge =
        benchmarkAlgorithm(
            mergeSort,
            inputs
        );

    const quick =
        benchmarkAlgorithm(
            quickSort,
            inputs
        );


    printResult(
        'CardChain',
        card
    );

    printResult(
        'Insertion',
        insertion
    );

    printResult(
        'Merge',
        merge
    );

    printResult(
        'Quick',
        quick
    );


    /*
     * Native sort is measured separately because JavaScript's
     * engine controls its implementation.
     */

    let nativeTime = 0;

    for (const input of inputs) {

        const result =
            nativeSort(input);

        nativeTime += result.time;
    }


    console.log(
        'Native JS'.padEnd(16) +
        nativeTime.toFixed(3).padStart(12) +
        ' -'.padStart(20) +
        ' -'.padStart(14) +
        ' -'.padStart(16)
    );


    console.log('');
    console.log(
        `CardChain chains: ${card.avgChains.toFixed(2)}`
    );

    console.log(
        `CardChain longest chain: ` +
        `${card.avgLongestChain.toFixed(2)}`
    );
}


/* ------------------------------------------------------------
 * Input Pattern Experiment
 * ------------------------------------------------------------ */

console.log('');
console.log('======================================');
console.log('       INPUT PATTERN ANALYSIS');
console.log('======================================');


const patternSize = 100;

const patterns = [
    {
        name: 'SORTED',
        create: () =>
            sortedArray(patternSize)
    },

    {
        name: 'REVERSE',
        create: () =>
            reverseArray(patternSize)
    },

    {
        name: 'RANDOM',
        create: () =>
            randomArray(patternSize)
    },

    {
        name: 'NEARLY SORTED',
        create: () =>
            nearlySortedArray(patternSize)
    }
];


for (const pattern of patterns) {

    const input =
        pattern.create();

    const start =
        performance.now();

    const result =
        cardChainSort(input);

    const time =
        performance.now() - start;

    const analysis =
        analyzeCardChain(input);

    console.log('');
    console.log(pattern.name);

    console.log(
        `Time: ${time.toFixed(4)} ms`
    );

    console.log(
        `Chains: ${analysis.numberOfChains}`
    );

    console.log(
        `Longest chain: ${analysis.longestChain}`
    );

    console.log(
        `Average chain length: ` +
        `${analysis.averageChainLength.toFixed(2)}`
    );
}


/* ------------------------------------------------------------
 * Final Message
 * ------------------------------------------------------------ */

console.log('');
console.log('======================================');
console.log('              DONE');
console.log('======================================');
