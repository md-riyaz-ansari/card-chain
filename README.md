# CardChain

A card game that accidentally became an algorithms experiment.

I was playing around with a deck of cards and started thinking:

> What happens if I sort the cards by placing each card underneath the first larger card?

I didn't start with a known sorting algorithm in mind. I was simply experimenting with a physical deck of cards.

After implementing the idea in JavaScript, testing it on thousands of inputs, optimizing it, and analyzing the resulting chains, I discovered something interesting:

**The number of chains produced by the process matches the Longest Increasing Subsequence (LIS) length.**

I eventually found that the core idea is closely related to the well-known **patience sorting** technique.

So this project is not claiming to be a brand-new sorting algorithm.

Instead, it documents how I independently arrived at this structure using a simple card experiment.


## The Basic Idea

Take the cards one at a time.

For each card:

1. Look at the chains from left to right.
2. Find the first chain whose bottom card is larger than the current card.
3. Place the current card underneath that chain.
4. If no chain can accept the card, create a new chain.

For example:

Input:

    [8, 3, 7, 1, 6, 2, 5, 4]

The cards form these chains:

    8 -> 3 -> 1
    7 -> 6 -> 2
    5 -> 4

Every chain is decreasing.

If we reverse the chains:

    1 -> 3 -> 8
    2 -> 6 -> 7
    4 -> 5

they become increasing sequences that can be merged to produce:

    [1, 2, 3, 4, 5, 6, 7, 8]


## A Small Example

Consider:

    [5, 1, 4, 2, 3]

The cards are placed as:

    5 -> 1
    4 -> 2
    3

The chain bottoms are:

    [1, 2, 3]

Reversing the chains gives:

    1 -> 5
    2 -> 4
    3

Merging them produces:

    [1, 2, 3, 4, 5]


## Why the Chain Bottoms Matter

The important observation I made was that the bottom cards remain ordered.

For:

    [8, 3, 7, 1, 6, 2, 5, 4]

the bottom values evolve like this:

    [8]

    [3]

    [3, 7]

    [1, 7]

    [1, 6]

    [1, 2]

    [1, 2, 5]

    [1, 2, 4]

The bottom values remain increasing.

That means I don't need to scan every card in every chain.

I only need to search the ordered list of chain bottoms.

This allowed me to replace the original linear search with binary search.


## JavaScript Implementation

The core implementation is written in JavaScript.

Example of the core idea:

    function cardChainSort(input) {
        const chains = [];
        const bottoms = [];

        for (const value of input) {
            const index = firstGreater(bottoms, value);

            if (index === chains.length) {
                chains.push([value]);
                bottoms.push(value);
            } else {
                chains[index].push(value);
                bottoms[index] = value;
            }
        }

        const runs = chains.map(chain => [...chain].reverse());

        return mergeRuns(runs);
    }

    function firstGreater(values, target) {
        let left = 0;
        let right = values.length;

        while (left < right) {
            const mid = (left + right) >> 1;

            if (values[mid] > target) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        return left;
    }

The actual implementation is available in the `src` directory.


# The Discovery

This project started as a physical card experiment.

I didn't know about patience sorting when I started.

My initial thought was basically:

> "Can I sort these cards by putting smaller cards underneath larger cards?"

That simple idea turned into several iterations.


## V1 - The Original Approach

The first implementation followed the physical card process directly.

For every card, I scanned the chains until I found a suitable position.

It worked, but the number of comparisons grew very quickly.

Some of my early benchmark results were approximately:

| Input Size | Average Comparisons |
|-----------:|--------------------:|
| 10         | 134                 |
| 25         | 2,755               |
| 50         | 27,000              |
| 100        | 250,000             |
| 250        | 4,700,000           |

The algorithm was clearly doing too much work.


## V2 - V3 - Finding the Structure

I started looking at the chain bottoms instead of the entire chains.

I noticed that the bottoms were ordered.

That led to the question:

> Can I use binary search instead?

This made a huge difference.

Instead of searching through every chain linearly, the algorithm could find the correct chain using binary search.


## V4 - Separating Construction and Merging

I then separated the process into two phases.

### Phase 1

Build the decreasing chains.

### Phase 2

Merge the chains into the final sorted array.

This made it easier to understand where the work was happening.

One benchmark showed roughly:

| Operation           | Percentage of Work |
|---------------------|-------------------:|
| Chain construction  | 54% - 72%          |
| Chain merging       | 28% - 46%          |

The exact percentage changes depending on the input.


## V5 - More Experiments

I experimented with different ways of maintaining the chains.

One thing I learned here was:

> Fewer comparisons does not necessarily mean faster execution.

In JavaScript, execution time also depends on things like:

- Array operations
- Memory allocation
- Object creation
- Garbage collection
- JIT optimization
- Implementation details

So I started measuring both:

- Number of comparisons
- Actual execution time


## V6 - Input Pattern Analysis

I then started testing different types of inputs.

### Already Sorted

    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

### Reverse Sorted

    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

### Random

    [8, 3, 7, 1, 6, 2, 5, 4]

### Alternating Low / High

    [1, 10, 2, 9, 3, 8, 4, 7, 5, 6]

### Nearly Sorted

    [1, 2, 3, 5, 4, 6, 7, 9, 8, 10]

I also started measuring:

- Number of chains
- Chain lengths
- Longest chain
- Number of inversions
- LIS length
- LDS length
- Number of comparisons

This is where the behavior became much more interesting.


# The LIS Connection

At this point I started testing a specific idea:

    Number of Chains == LIS Length

LIS means:

**Longest Increasing Subsequence**

For example:

    [8, 3, 7, 1, 6, 2, 5, 4]

has an LIS length of `3`.

The chains produced by my algorithm were:

    8 -> 3 -> 1
    7 -> 6 -> 2
    5 -> 4

There are also `3` chains.

So:

    Number of Chains = 3
    LIS Length       = 3

I wanted to know whether this was just a coincidence.


# Exhaustive Testing

I generated every permutation for small values of `n`.

The results were:

| n | Permutations Tested | Chain Count = LIS |
|--:|---------------------:|------------------:|
| 3 | 6                    | 6 / 6             |
| 4 | 24                   | 24 / 24           |
| 5 | 120                  | 120 / 120         |
| 6 | 720                  | 720 / 720         |

I also checked:

- Every element is preserved
- Every chain is decreasing
- The chain decomposition is minimum
- Chain count equals LIS length

No counterexample was found in these exhaustive tests.

I then continued testing larger random permutations.


# V8 - Checking the Algorithm Step by Step

Instead of only checking the final result, I started checking the algorithm after every card.

For:

    [8, 3, 7, 1, 6, 2, 5, 4]

the chain bottoms were:

    [8]
    [3]
    [3, 7]
    [1, 7]
    [1, 6]
    [1, 2]
    [1, 2, 5]
    [1, 2, 4]

At every step, the number of chains matched the LIS length of the current prefix in the tests I ran.

That was a strong indication that I was looking at a known mathematical structure.


# The Patience Sorting Connection

Eventually I discovered that the mechanism is closely related to **patience sorting**.

The important operation is essentially:

    Find the first pile/chain whose bottom is greater than x.

That is also the key idea behind the common `O(n log n)` technique for finding LIS length.

So the conclusion of the project is:

> I did not invent patience sorting.

Instead, I independently arrived at a similar greedy process using physical cards and then discovered the connection afterward.

For me, that was actually more interesting than simply implementing an algorithm from a textbook.


# Performance

I compared CardChain with several classical sorting algorithms.

One representative benchmark looked like this:

| n   | CardChain | Insertion | Merge | Quick | Native JS |
|----:|----------:|----------:|------:|------:|----------:|
| 10  | 2.31 ms   | 7.53 ms   | 12.07 ms | 10.99 ms | 2.52 ms |
| 25  | 3.69 ms   | 0.51 ms   | 6.05 ms  | 6.27 ms  | 1.66 ms |
| 50  | 1.26 ms   | 0.44 ms   | 1.74 ms  | 0.80 ms  | 1.19 ms |
| 100 | 0.53 ms   | 0.27 ms   | 0.85 ms  | 0.38 ms  | 0.64 ms |
| 250 | 0.39 ms   | 0.25 ms   | 0.37 ms  | 0.24 ms  | 0.36 ms |

These numbers should **not** be interpreted as saying CardChain is faster than these algorithms in general.

JavaScript benchmarks are affected by:

- CPU
- JavaScript engine
- JIT compilation
- Garbage collection
- Input distribution
- Number of trials
- Implementation details

The benchmark is mainly useful for understanding how the algorithm behaves.


# Comparison of the Ideas

| Algorithm       | Main Idea                              | Typical Complexity |
|----------------|----------------------------------------|-------------------:|
| Insertion Sort | Insert each item into sorted prefix    | O(n²)              |
| Selection Sort | Repeatedly select minimum              | O(n²)              |
| Bubble Sort    | Repeatedly swap adjacent items         | O(n²)              |
| Merge Sort     | Divide and merge                       | O(n log n)         |
| Quick Sort     | Partition around pivots                | O(n log n) average |
| Heap Sort      | Maintain a heap                        | O(n log n)         |
| CardChain      | Build chains and merge them            | O(n log n)*        |

`*` The optimized implementation can achieve O(n log n) under the appropriate chain construction and merging implementation.

CardChain is therefore not intended to replace the standard general-purpose sorting algorithms.

The more interesting connection is to **LIS and chain decomposition**.


# Where Could This Be Useful?

I don't think the main value of this idea is replacing JavaScript's built-in sorting function.

The more interesting applications are problems where we care about the structure of a sequence.


## Longest Increasing Subsequence

The chain structure naturally exposes the information needed to determine LIS length.


## Sequence Analysis

Instead of immediately throwing away the structure of the input by sorting it, the algorithm produces a decomposition into chains.

That can be useful when studying how a sequence is organized.


## Scheduling Problems

Some scheduling and ordering problems can be represented as partitioning objects into ordered groups.

Similar greedy chain-decomposition ideas can appear there.


## Algorithm Visualization

This is probably my favorite application.

The physical card representation makes an abstract algorithm much easier to understand.

Instead of starting with:

    binary search
    tails array
    dynamic programming

you can start with:

    Cards
      ↓
    Chains
      ↓
    Chain bottoms
      ↓
    Binary search
      ↓
    LIS structure


# What I Learned

The biggest lesson from this project wasn't actually sorting.

It was the process of experimenting.

I started with a simple physical card idea.

Then I kept asking:

- Why does this work?
- Why are the bottoms ordered?
- Can I reduce the comparisons?
- What happens with different input patterns?
- How many chains are produced?
- Is the number of chains related to something known?
- Can I find a counterexample?

That led me into:

- Greedy algorithms
- Binary search
- Sorting
- LIS
- Chain decomposition
- Complexity analysis
- Benchmarking
- Exhaustive testing
- Algorithm invariants


# What This Project Is NOT

This is important.

I am **not claiming** that I invented a new sorting algorithm.

The underlying idea is closely related to existing work on patience sorting and LIS.

The contribution of this project is the exploration:

    Physical card experiment
            ↓
    Initial algorithm
            ↓
    Performance problems
            ↓
    Optimization
            ↓
    Chain invariant
            ↓
    LIS experiments
            ↓
    Exhaustive testing
            ↓
    Patience sorting connection

The interesting part was discovering the structure independently.


# Future Work

There are still several things I would like to investigate.


## 1. Formal Proof

The experiments strongly support the relationship between chain count and LIS length.

A proper mathematical proof would make the result much stronger.


## 2. Duplicate Values

Most of my experiments use permutations where every value is unique.

The behavior with duplicate values needs a clearly defined comparison rule.

For example, using:

    >

versus:

    >=

changes the resulting subsequence problem.


## 3. Better Chain Merging

The current implementation uses a straightforward merge.

A heap-based k-way merge could be investigated for inputs producing many chains.


## 4. Visualization

A browser-based visualization would be a natural next step.

I would like to show:

    Input card
        ↓
    Find chain
        ↓
    Place card
        ↓
    Update bottoms
        ↓
    Show chains
        ↓
    Merge
        ↓
    Sorted result


# Project Structure

    card-chain/
    │
    ├── README.md
    ├── LICENSE
    ├── package.json
    │
    ├── src/
    │   ├── cardChainSort.js
    │   └── lis.js
    │
    ├── examples/
    │   └── demo.js
    │
    ├── benchmarks/
    │   └── benchmark.js
    │
    ├── tests/
    │   └── correctness.js
    │
    └── research/
        └── DISCOVERY.md


# Running the Project

Clone the repository:

    git clone https://github.com/YOUR_USERNAME/card-chain.git
    cd card-chain

Install dependencies:

    npm install

Run the example:

    npm run demo

Run correctness tests:

    npm test

Run the benchmark:

    npm run benchmark


# Testing

The tests check that:

- The output is sorted
- No elements are lost
- No elements are duplicated
- Random permutations are handled correctly
- Small edge cases work correctly

The project also includes exhaustive tests for small permutations and randomized tests for larger inputs.


# Benchmarking

The benchmark compares CardChain against:

- Insertion Sort
- Merge Sort
- Quick Sort
- JavaScript's native `Array.sort()`

The benchmark is intended for experimentation rather than claiming universal performance superiority.


# Final Thoughts

I started this project thinking I might have discovered a new sorting algorithm.

I didn't.

What I actually found was something I think is more valuable:

**I independently discovered a process that led me to an existing algorithmic idea.**

A simple deck of cards eventually led me to LIS, greedy algorithms, binary search, chain decomposition, and patience sorting.

That is what this project is about.


## Author

Built as an independent algorithm exploration using JavaScript.

If you find an interesting counterexample, optimization, proof, or connection, feel free to open an issue or pull request.
