'use strict';

/*
 * CardChain Sort
 *
 * The idea:
 * 1. Process cards one at a time.
 * 2. Find the first chain whose bottom card is greater than
 *    the current card.
 * 3. Place the card at the bottom of that chain.
 * 4. If no such chain exists, create a new chain.
 * 5. Reverse each decreasing chain.
 * 6. Merge the chains into the final sorted result.
 *
 * The chain bottoms are kept in increasing order, which allows
 * binary search during chain construction.
 *
 * This implementation is closely related to the idea behind
 * patience sorting and the O(n log n) LIS technique.
 */

/**
 * Find the first position containing a value greater than target.
 *
 * Example:
 *
 * bottoms = [1, 4, 7, 10]
 * target  = 5
 *
 * Result = 3
 *
 * because 7 is the first value greater than 5.
 */
function firstGreater(bottoms, target) {
    let left = 0;
    let right = bottoms.length;

    while (left < right) {
        const mid = left + ((right - left) >> 1);

        if (bottoms[mid] > target) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }

    return left;
}


/**
 * Merge multiple sorted arrays.
 *
 * Each chain is reversed before reaching this function,
 * therefore every chain is increasing.
 *
 * A simple k-way merge is used here.
 */
function mergeChains(chains) {
    const result = [];

    const positions = new Array(chains.length).fill(0);

    while (true) {
        let bestChain = -1;
        let bestValue = Infinity;

        for (let i = 0; i < chains.length; i++) {
            const position = positions[i];

            if (position >= chains[i].length) {
                continue;
            }

            const value = chains[i][position];

            if (value < bestValue) {
                bestValue = value;
                bestChain = i;
            }
        }

        if (bestChain === -1) {
            break;
        }

        result.push(bestValue);
        positions[bestChain]++;
    }

    return result;
}


/**
 * CardChain Sort
 *
 * @param {number[]} input
 * @returns {number[]}
 */
function cardChainSort(input) {
    if (!Array.isArray(input)) {
        throw new TypeError('Input must be an array.');
    }

    if (input.length <= 1) {
        return [...input];
    }

    /*
     * chains[i]
     *
     * Stores a decreasing chain.
     *
     * Example:
     *
     * [
     *   [8, 3, 1],
     *   [7, 6, 2],
     *   [5, 4]
     * ]
     */
    const chains = [];

    /*
     * bottoms[i]
     *
     * The bottom value of chains[i].
     *
     * The important invariant is:
     *
     * bottoms[0] < bottoms[1] < bottoms[2] ...
     *
     * for unique values.
     */
    const bottoms = [];

    /*
     * Process cards one at a time.
     */
    for (const card of input) {

        /*
         * Find the first chain whose bottom is greater
         * than the current card.
         */
        const index = firstGreater(bottoms, card);

        /*
         * No suitable chain exists.
         *
         * Create a new chain.
         */
        if (index === chains.length) {
            chains.push([card]);
            bottoms.push(card);
        }

        /*
         * A suitable chain exists.
         *
         * Put the card underneath that chain.
         */
        else {
            chains[index].push(card);
            bottoms[index] = card;
        }
    }

    /*
     * Every chain is currently decreasing.
     *
     * Reverse them so that each chain becomes increasing.
     */
    const sortedChains = chains.map(chain => {
        return [...chain].reverse();
    });

    /*
     * Merge the sorted chains.
     */
    return mergeChains(sortedChains);
}


/**
 * Build the chains without performing the final merge.
 *
 * This is useful for research, visualization and debugging.
 */
function buildChains(input) {
    if (!Array.isArray(input)) {
        throw new TypeError('Input must be an array.');
    }

    const chains = [];
    const bottoms = [];

    for (const card of input) {
        const index = firstGreater(bottoms, card);

        if (index === chains.length) {
            chains.push([card]);
            bottoms.push(card);
        } else {
            chains[index].push(card);
            bottoms[index] = card;
        }
    }

    return {
        chains,
        bottoms
    };
}


/**
 * Return information about the chain decomposition.
 *
 * This is mainly useful for experiments.
 */
function analyzeCardChain(input) {
    const { chains, bottoms } = buildChains(input);

    const lengths = chains.map(chain => chain.length);

    const longestChain =
        lengths.length === 0
            ? 0
            : Math.max(...lengths);

    const averageChainLength =
        lengths.length === 0
            ? 0
            : input.length / chains.length;

    return {
        input: [...input],

        chains: chains.map(chain => [...chain]),

        bottoms: [...bottoms],

        numberOfChains: chains.length,

        chainLengths: lengths,

        longestChain,

        averageChainLength
    };
}


/*
 * Export functions for Node.js.
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        cardChainSort,
        buildChains,
        analyzeCardChain,
        firstGreater,
        mergeChains
    };
}


/*
 * Simple example when this file is executed directly.
 *
 * Run:
 *
 * node src/cardChainSort.js
 */
if (typeof require !== 'undefined' &&
    require.main === module) {

    const input = [
        8, 3, 7, 1,
        6, 2, 5, 4
    ];

    console.log('Input:');
    console.log(input);

    const analysis = analyzeCardChain(input);

    console.log('\nChains:');

    analysis.chains.forEach((chain, index) => {
        console.log(
            `Chain ${index + 1}: ${chain.join(' -> ')}`
        );
    });

    console.log('\nBottoms:');
    console.log(analysis.bottoms);

    console.log('\nNumber of chains:');
    console.log(analysis.numberOfChains);

    console.log('\nSorted:');
    console.log(cardChainSort(input));
}
