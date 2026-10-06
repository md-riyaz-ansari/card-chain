# CardChain — Discovery Notes

## How This Started

This project started with a simple experiment using a deck of playing cards.

I was using the 13 cards from the red heart suit:

**A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K**

I shuffled the cards and started trying to sort them manually.

Instead of immediately putting every card into one sorted row, I started placing a smaller card underneath a larger card.

That created chains.

At first, I was not thinking about algorithms, Big-O notation, LIS, or patience sorting.

I was simply experimenting with cards on a table.

That eventually turned into this project.

---

## The First Example

The first input I experimented with was:

    A, 2, 4, 8, 3, 5, J, 6, 7, K, Q, 10, 9

I processed one card at a time.

The first card is placed directly:

    A

Then `2` is bigger than `A`, so it goes beside it:

    A   2

Then `4` is bigger than both:

    A   2   4

Then:

    A   2   4   8

When `3` arrives, it is bigger than `A` and `2`, but smaller than `4`.

So instead of creating another top-level card, I put it underneath `4`:

    A   2   4
            |
            3

Then `5` is smaller than `8`, so:

    A   2   4   8
            |   |
            3   5

As more cards arrived, more chains were created.

Eventually the structure looked like:

    A
    2
    4 -> 3
    8 -> 5
    J -> 6
       -> 7
    K -> Q -> 10 -> 9

When the chains were rearranged and merged, the result was:

    A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K

That was the moment I started asking:

> Is this actually a sorting algorithm?

---

## Turning the Idea Into an Algorithm

The next step was to turn the manual process into a set of rules.

For every incoming value:

1. Take the next value from the input.
2. Look at the bottom value of each existing chain.
3. Find the first chain whose bottom value is greater than the new value.
4. Put the new value underneath that chain.
5. If no suitable chain exists, create a new chain.
6. Continue until every value has been processed.
7. Reverse the chains.
8. Merge the chains to produce the final sorted result.

For example:

    Input:
    8, 3, 7, 1, 6, 2, 5, 4

The chains become:

    Chain 1: 8 -> 3 -> 1
    Chain 2: 7 -> 6 -> 2
    Chain 3: 5 -> 4

The chains are decreasing.

Their bottom values are:

    1, 2, 4

Those bottom values remain ordered.

That observation became very important later.

---

## The First Implementation

My first implementation followed the physical card process quite closely.

For each new value, I searched through the chains and compared it with the cards already placed.

The algorithm was correct for the inputs I tested, but the implementation was doing too many comparisons.

Some of my early benchmark results looked roughly like this:

| Input Size | CardChain Early Version |
|-----------:|------------------------:|
| 10         | ~134 comparisons        |
| 25         | ~2,755 comparisons      |
| 50         | ~26,000 comparisons     |
| 100        | ~250,000 comparisons    |

The growth was clearly too high.

At this point I realized that the idea itself might be interesting, but the implementation needed a major improvement.

---

## The Important Observation

I noticed that I did not actually need to search through every card inside every chain.

I only needed to know the bottom value of each chain.

For example:

    Chain 1: 8 -> 3 -> 1
    Chain 2: 7 -> 6 -> 2
    Chain 3: 5 -> 4

The bottom values are:

    1, 2, 4

The bottom values are ordered.

So instead of searching through the whole chain structure, I could search through the bottom values.

This led to the next version of the algorithm.

---

## Using Binary Search

Because the chain bottoms are ordered, I could use binary search to find the correct chain.

Conceptually:

    Find the first bottom value > current value

If the current value is `6` and the bottoms are:

    1, 2, 4, 8

then `8` is the first bottom greater than `6`.

Therefore `6` belongs in that chain.

This reduced the amount of work needed to decide where a new value should go.

This was one of the biggest improvements I made during the experiment.

---

## Version Evolution

I went through several versions while experimenting.

The versions were not planned from the beginning.

I created them as I discovered problems and found ways to improve the implementation.

The general progression was:

| Version | Main Idea |
|--------:|-----------|
| V1 | Direct implementation of the physical card process |
| V2 | Improved handling of chains |
| V3 | More efficient chain processing |
| V4 | Ordered chains and efficient merging |
| V5 | Further optimization of chain construction |
| V6 | Analysis of different input patterns |
| V7 | Investigation of the relationship between chain count and LIS |
| V8 | Formal invariants and step-by-step analysis |

I eventually stopped treating every version as a separate algorithm.

The versions were useful for development, but the final repository should focus on the clean implementation and the important discoveries.

---

## Testing Different Inputs

I did not want to test only one example.

I tested different types of inputs.

### Already Sorted

    [1, 2, 3, 4, 5]

### Reverse Sorted

    [5, 4, 3, 2, 1]

### Random Input

    [8, 3, 7, 1, 6, 2, 5, 4]

### Nearly Sorted

    [1, 2, 3, 5, 4, 6, 7, 9, 8, 10]

### Alternating High / Low

    [10, 1, 9, 2, 8, 3, 7, 4, 6, 5]

### Another Example

    [5, 1, 4, 2, 3]

For the last example, the chains become:

    Chain 1: 5 -> 1
    Chain 2: 4 -> 2
    Chain 3: 3

The final sorted result is:

    [1, 2, 3, 4, 5]

---

## Correctness Testing

I created automated tests in JavaScript.

The tests checked things such as:

- The output is actually sorted.
- No values are lost.
- No values are duplicated accidentally.
- Different input patterns work.
- Random permutations work.
- Small exhaustive permutations work.

For small input sizes, I generated every possible permutation.

For example:

| n | Permutations |
|--:|-------------:|
| 3 | 6 |
| 4 | 24 |
| 5 | 120 |
| 6 | 720 |
| 7 | 5,040 |

All tested permutations passed the correctness checks.

This gave me much more confidence than testing a few manually selected examples.

---

## The LIS Discovery

One of the most interesting things happened during the analysis of the chains.

I noticed that the number of chains seemed to be equal to the length of the **Longest Increasing Subsequence**, commonly called LIS.

For example:

    Input:
    [8, 3, 7, 1, 6, 2, 5, 4]

The chains are:

    Chain 1: 8 -> 3 -> 1
    Chain 2: 7 -> 6 -> 2
    Chain 3: 5 -> 4

Number of chains:

    3

The LIS length is also:

    3

I then tested this relationship exhaustively for small permutations.

The results continued to match.

This was a very interesting moment because it meant the structure I had discovered was connected to a known mathematical property of permutations.

---

## The Connection to Patience Sorting

After seeing the LIS relationship, I researched existing algorithms.

I discovered that the structure was closely related to **patience sorting**.

Patience sorting also creates piles while processing elements one at a time.

There is also a well-known relationship between patience sorting and the Longest Increasing Subsequence problem.

This explained why my chain count kept matching the LIS length.

This changed how I describe the project.

I would not claim:

> I invented a completely new sorting algorithm.

That would be too strong.

A more accurate description is:

> I independently discovered a card-based chain sorting process that is closely related to patience sorting and LIS techniques.

I think this is actually more interesting.

The experiment showed me that it is possible to independently arrive at an idea that already exists in computer science, without initially knowing the established name for it.

---

## Performance Comparison

I also compared the algorithm with several classical sorting algorithms.

The main algorithms I tested were:

- CardChain
- Insertion Sort
- Selection Sort
- Bubble Sort
- Merge Sort
- Quick Sort
- Heap Sort
- Native JavaScript `Array.sort()`

One representative benchmark looked roughly like this:

| n | CardChain | Insertion | Merge | Quick | Native JS |
|--:|----------:|----------:|------:|------:|----------:|
| 10 | ~36 | ~30 | ~23 | ~42 | ~2 |
| 25 | ~150 | ~171 | ~87 | ~150 | ~1 |
| 50 | ~420 | ~660 | ~222 | ~370 | ~1 |
| 100 | ~1,160 | ~2,600 | ~543 | ~880 | ~1 |
| 250 | ~4,300 | ~15,400 | ~1,680 | ~2,600 | ~1 |

These are results from my own experiments and should not be treated as universal performance numbers.

Actual performance depends on:

- JavaScript engine
- Node.js version
- Computer hardware
- Implementation details
- Input distribution
- Benchmark methodology

The benchmarks were mainly useful for understanding how the algorithm behaves and where it spends its work.

---

## What the Experiments Showed

The experiments showed something important.

The original implementation was not competitive with established sorting algorithms.

The later implementation was much better, but it still should not be presented as a replacement for highly optimized production sorting algorithms.

For example, native JavaScript sorting is extremely optimized.

So the goal of this project is not:

> "CardChain is faster than every existing sorting algorithm."

The goal is:

> "Can a simple physical card arrangement lead to an interesting algorithmic structure?"

For me, the answer was yes.

---

## The Main Invariant

One of the most useful observations from the later versions was the chain-bottom invariant.

Suppose the chains are:

    Chain 1: 8 -> 3 -> 1
    Chain 2: 7 -> 6 -> 2
    Chain 3: 5 -> 4

The bottoms are:

    1, 2, 4

They are increasing.

When a new card is inserted, the algorithm preserves this ordered-bottom structure.

That means the next insertion can use the bottoms as a search structure.

This is what makes binary search possible.

---

## What I Learned From This

The biggest lesson from this project was not the final sorting code.

It was the process of turning an observation into something testable.

The process was roughly:

    Playing with cards
            |
            v
    Notice a pattern
            |
            v
    Create a manual procedure
            |
            v
    Turn it into an algorithm
            |
            v
    Implement it in JavaScript
            |
            v
    Test correctness
            |
            v
    Measure performance
            |
            v
    Find invariants
            |
            v
    Discover the LIS connection
            |
            v
    Research existing algorithms
            |
            v
    Improve the implementation

That process was more valuable to me than simply getting a sorted array.

---

## What I Would Not Claim

I would not claim that this project proves I invented a new fundamental sorting algorithm.

The underlying structure has strong connections to existing ideas, especially patience sorting and LIS algorithms.

I would also not claim that CardChain is faster than established sorting algorithms.

The benchmark results do not support that claim.

Instead, I would describe CardChain as:

> An experimental sorting approach inspired by manually arranging playing cards into decreasing chains, later found to be closely related to patience sorting and Longest Increasing Subsequence techniques.

That is a claim I can actually support with the experiments.

---

## Why I Still Think the Project Is Worth Sharing

Even though the underlying ideas are related to existing algorithms, I still think the project is worth putting on GitHub.

The interesting part is the discovery process.

I started with a physical problem:

    "How can I sort these cards differently?"

I did not start with:

    "I am going to implement patience sorting."

The algorithmic structure emerged from experimentation.

Then I tested it.

Then I optimized it.

Then I researched it.

Then I discovered that computer science already had names and theory for parts of what I had found.

That was a useful learning experience.

---

## Possible Uses

I would not position CardChain as a general-purpose replacement for JavaScript's built-in sorting.

There are better-established algorithms for that.

However, the chain structure could be useful for:

- Teaching sorting concepts
- Visualizing how sorting can be performed using piles or chains
- Demonstrating LIS-related ideas
- Studying permutation structure
- Algorithm experimentation
- Exploring adaptive sorting techniques
- Visual simulations of card-based sorting
- Educational demonstrations of invariants and binary search

The visualization aspect is probably one of the strongest parts of the idea.

It is easy to understand when represented physically with cards.

---

## The Interesting Part

For me, the most interesting part is this transformation:

    Playing cards
          |
          v
    "Put smaller cards underneath"
          |
          v
    Decreasing chains
          |
          v
    Ordered chain bottoms
          |
          v
    Binary search
          |
          v
    Efficient implementation
          |
          v
    LIS relationship
          |
          v
    Patience sorting connection

I started with a deck of cards and ended up learning about concepts that I had not originally been thinking about.

That is the main reason I decided to document the project.

---

## Current Repository Structure

The final repository is intentionally simpler than the development process.

    card-chain/
    |
    +-- README.md
    +-- DISCOVERY.md
    +-- package.json
    +-- LICENSE
    |
    +-- src/
    |   +-- cardChainSort.js
    |   +-- lis.js
    |
    +-- tests/
    |   +-- correctness.js
    |
    +-- benchmarks/
    |   +-- benchmark.js
    |
    +-- examples/
        +-- demo.js

The V1, V2, V3, etc. versions were useful while developing the idea.

I don't think every experimental version needs to remain in the main implementation.

The important evolution is documented here.

---

## Final Thought

This project started with me playing around with a deck of cards.

I wasn't initially trying to invent a sorting algorithm.

I was just curious whether I could arrange the cards using a different process.

That curiosity eventually led me through:

    Cards
      |
      v
    Chains
      |
      v
    Invariants
      |
      v
    Binary Search
      |
      v
    Testing
      |
      v
    Performance Analysis
      |
      v
    LIS
      |
      v
    Patience Sorting

I think the most valuable part of CardChain is not claiming that the algorithm is completely new.

It is the fact that a simple experiment with playing cards led me to rediscover and investigate ideas that already exist in algorithms and computer science.

Sometimes you can discover something independently before you know what it is called.

That was the real discovery for me.
