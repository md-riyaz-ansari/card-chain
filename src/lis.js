'use strict';

/*
 * ============================================================
 * LONGEST INCREASING SUBSEQUENCE
 * ============================================================
 *
 * This implementation uses the classic O(n log n) approach.
 *
 * It does NOT return the actual subsequence.
 * It only returns its length.
 *
 * Example:
 *
 *   Input:
 *   [8, 3, 7, 1, 6, 2, 5, 4]
 *
 *   LIS length:
 *   3
 *
 *   One possible LIS:
 *   [3, 6, 7]  (depending on reconstruction)
 *
 * This file is kept separate from CardChain so that the
 * comparison is independent.
 */


/**
 * Calculate the length of the Longest Increasing Subsequence.
 *
 * Time complexity:  O(n log n)
 * Space complexity: O(n)
 *
 * @param {number[]} input
 * @returns {number}
 */
function lisLength(input) {

    if (!Array.isArray(input)) {
        throw new TypeError('Input must be an array.');
    }

    if (input.length === 0) {
        return 0;
    }


    /*
     * tails[i] stores the smallest possible tail value
     * of an increasing subsequence of length i + 1.
     *
     * Example:
     *
     * tails = [3, 6, 7]
     *
     * means:
     *
     * length 1 -> smallest tail is 3
     * length 2 -> smallest tail is 6
     * length 3 -> smallest tail is 7
     */
    const tails = [];


    for (const value of input) {

        /*
         * Binary search for the first position where
         * tails[position] >= value.
         */
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


        /*
         * Replace the existing tail.
         *
         * Or extend the subsequence if left === tails.length.
         */
        tails[left] = value;
    }


    return tails.length;
}


/**
 * A slower O(n²) LIS implementation.
 *
 * This is included mainly for testing.
 *
 * It is useful because we can compare the optimized
 * implementation against a simple implementation and make
 * sure both produce the same result.
 */
function lisLengthSlow(input) {

    if (!Array.isArray(input)) {
        throw new TypeError('Input must be an array.');
    }

    if (input.length === 0) {
        return 0;
    }


    const dp =
        new Array(input.length).fill(1);


    let best = 1;


    for (let i = 0; i < input.length; i++) {

        for (let j = 0; j < i; j++) {

            if (input[j] < input[i]) {

                dp[i] =
                    Math.max(
                        dp[i],
                        dp[j] + 1
                    );
            }
        }


        best =
            Math.max(
                best,
                dp[i]
            );
    }


    return best;
}


/**
 * Return the actual LIS.
 *
 * This is useful for demonstrations and research.
 *
 * Time complexity: O(n log n)
 */
function findLIS(input) {

    if (!Array.isArray(input)) {
        throw new TypeError('Input must be an array.');
    }

    if (input.length === 0) {
        return [];
    }


    const tails = [];
    const tailIndices = [];

    const previous =
        new Array(input.length).fill(-1);


    for (let i = 0; i < input.length; i++) {

        const value = input[i];

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


        if (left > 0) {

            previous[i] =
                tailIndices[left - 1];
        }


        tails[left] = value;
        tailIndices[left] = i;
    }


    /*
     * Reconstruct the LIS.
     */
    const result =
        new Array(tails.length);


    let index =
        tailIndices[tails.length - 1];


    for (
        let i = tails.length - 1;
        i >= 0;
        i--
    ) {

        result[i] = input[index];

        index = previous[index];
    }


    return result;
}


/*
 * Export functions for Node.js.
 */
if (
    typeof module !== 'undefined' &&
    module.exports
) {

    module.exports = {
        lisLength,
        lisLengthSlow,
        findLIS
    };
}


/*
 * ------------------------------------------------------------
 * Demo
 * ------------------------------------------------------------
 *
 * Run:
 *
 *   node src/lis.js
 *
 * ------------------------------------------------------------
 */

if (
    typeof require !== 'undefined' &&
    require.main === module
) {

    const examples = [
        [8, 3, 7, 1, 6, 2, 5, 4],
        [5, 1, 4, 2, 3],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
        [1, 10, 2, 9, 3, 8, 4, 7, 5, 6]
    ];


    console.log('');
    console.log('======================================');
    console.log('       LIS DEMONSTRATION');
    console.log('======================================');


    for (const input of examples) {

        const fast =
            lisLength(input);

        const slow =
            lisLengthSlow(input);

        const sequence =
            findLIS(input);


        console.log('');
        console.log('Input:', input);

        console.log(
            'LIS length:',
            fast
        );

        console.log(
            'LIS:',
            sequence
        );

        console.log(
            'Slow implementation:',
            slow
        );

        console.log(
            'Implementations agree:',
            fast === slow
        );
    }


    console.log('');
    console.log('Done.');
}
