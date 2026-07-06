-- Update Two Sum
UPDATE problems SET 
  statement_md = '## Problem Statement

Given an array of integers `nums` and an integer `target`, return the **indices** of the two numbers such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

## Explanation

For example, given `nums = [2, 7, 11, 15]` and `target = 9`:
- `nums[0] + nums[1] = 2 + 7 = 9`, so the answer is `[0, 1]`.

**Hint:** A brute-force solution checks every pair in O(n^2). Can you do it in **O(n)** using a hash map?',
  input_format = 'The first line contains two space-separated integers `n` (the size of the array) and `target`.

The second line contains `n` space-separated integers -- the elements of the array `nums`.',
  output_format = 'Print two space-separated integers -- the 0-indexed positions of the two numbers that add up to `target`.

If multiple valid answers exist, print any one of them.',
  constraints_text = '2 <= n <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Exactly one valid answer exists.'
WHERE slug = 'two-sum';

-- Update Reverse Linked List
UPDATE problems SET 
  statement_md = '## Problem Statement

Given the head of a singly linked list, **reverse the list** and return the reversed list.

You must solve this problem **iteratively** (without recursion).

## Explanation

For example, given the list `1 -> 2 -> 3 -> 4 -> 5`:
- After reversing: `5 -> 4 -> 3 -> 2 -> 1`

The idea is to iterate through the list and reverse each node''s `next` pointer one at a time.

**Hint:** Maintain three pointers: `prev`, `curr`, and `next`. At each step, point `curr.next` to `prev`, then advance all three pointers forward.',
  input_format = 'The first line contains a single integer `n` -- the number of nodes in the linked list.

The second line contains `n` space-separated integers representing the values of each node in order.',
  output_format = 'Print the values of the reversed linked list, separated by spaces.',
  constraints_text = '0 <= n <= 5000
-5000 <= Node.val <= 5000'
WHERE slug = 'reverse-linked-list';

-- Update Longest Substring
UPDATE problems SET 
  statement_md = '## Problem Statement

Given a string `s`, find the length of the **longest substring** without repeating characters.

A **substring** is a contiguous non-empty sequence of characters within a string.

## Examples

- `s = "abcabcbb"` -> The answer is `3` (the substring `"abc"`).
- `s = "bbbbb"` -> The answer is `1` (the substring `"b"`).
- `s = "pwwkew"` -> The answer is `3` (the substring `"wke"`).

**Note:** `"pwke"` is a subsequence, not a substring.

**Hint:** Use a **sliding window** approach with two pointers `left` and `right`. Expand `right` to include new characters, and shrink `left` when a duplicate is found. Use a `Set` or hash map to track characters in the current window.',
  input_format = 'A single line containing the string `s`.',
  output_format = 'Print a single integer -- the length of the longest substring without repeating characters.',
  constraints_text = '0 <= s.length <= 5 * 10^4
s consists of English letters, digits, symbols, and spaces.'
WHERE slug = 'longest-substring';

-- Update Merge Intervals
UPDATE problems SET 
  statement_md = '## Problem Statement

Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, **merge all overlapping intervals** and return an array of the non-overlapping intervals that cover all the intervals in the input.

Two intervals `[a, b]` and `[c, d]` overlap if `a <= d` and `c <= b`.

## Examples

**Example 1:**
- Input: `[[1,3],[2,6],[8,10],[15,18]]`
- Output: `[[1,6],[8,10],[15,18]]`
- Explanation: Intervals `[1,3]` and `[2,6]` overlap, so they merge into `[1,6]`.

**Example 2:**
- Input: `[[1,4],[4,5]]`
- Output: `[[1,5]]`
- Explanation: Intervals `[1,4]` and `[4,5]` are considered overlapping (they share the boundary point 4).

**Hint:** Sort the intervals by their start time, then iterate and merge consecutive overlapping intervals.',
  input_format = 'The first line contains `n` -- the number of intervals.

The next `n` lines each contain two space-separated integers `start` and `end` representing one interval.',
  output_format = 'Print the merged intervals, one per line. Each line should contain two space-separated integers: the start and end of the merged interval.',
  constraints_text = '1 <= n <= 10^4
0 <= start_i <= end_i <= 10^4'
WHERE slug = 'merge-intervals';

-- Update LRU Cache
UPDATE problems SET 
  statement_md = '## Problem Statement

Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the `LRUCache` class:
- **`LRUCache(int capacity)`** -- Initialize the LRU cache with a positive size `capacity`.
- **`int get(int key)`** -- Return the value of the `key` if it exists, otherwise return `-1`.
- **`void put(int key, int value)`** -- Update the value of the `key` if it exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the `capacity`, **evict the least recently used key**.

Both `get` and `put` must run in **O(1)** average time complexity.

## Explanation

```
LRUCache cache = new LRUCache(2);  // capacity = 2
cache.put(1, 1);                    // cache: {1=1}
cache.put(2, 2);                    // cache: {1=1, 2=2}
cache.get(1);                       // returns 1, cache: {2=2, 1=1}
cache.put(3, 3);                    // evicts key 2, cache: {1=1, 3=3}
cache.get(2);                       // returns -1 (not found)
cache.get(3);                       // returns 3
```

**Hint:** Use a **hash map** combined with a **doubly linked list**. The hash map provides O(1) lookup, and the linked list maintains the access order.',
  input_format = 'The first line contains two integers: `capacity` and `q` (the number of operations).

The next `q` lines each contain an operation:
- `PUT key value` -- Insert or update a key-value pair
- `GET key` -- Retrieve the value for a key',
  output_format = 'For each `GET` operation, print the returned value on a new line. Print `-1` if the key does not exist in the cache.',
  constraints_text = '1 <= capacity <= 3000
0 <= key <= 10^4
0 <= value <= 10^5
At most 2 * 10^5 total calls to get and put.'
WHERE slug = 'lru-cache';

-- Update Binary Tree Maximum Path Sum
UPDATE problems SET 
  statement_md = '## Problem Statement

A **path** in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence **at most once**. Note that the path does **not** need to pass through the root.

The **path sum** of a path is the sum of the node values in the path.

Given the `root` of a binary tree, return the **maximum path sum** of any non-empty path.

## Examples

**Example 1:**
- Tree: `[1, 2, 3]` (root=1, left=2, right=3)
- Output: `6`
- Explanation: The optimal path is `2 -> 1 -> 3` with sum `2 + 1 + 3 = 6`.

**Example 2:**
- Tree: `[-10, 9, 20, null, null, 15, 7]`
- Output: `42`
- Explanation: The optimal path is `15 -> 20 -> 7` with sum `15 + 20 + 7 = 42`.

**Hint:** Use DFS. At each node, compute the maximum "single-path" sum (going down one side). Update a global maximum considering the "split path" (left + node + right). Return only the single-path to the parent.',
  input_format = 'A single line of space-separated integers representing the binary tree in **level-order** (BFS order).

Use `-1001` to represent null nodes.',
  output_format = 'Print a single integer -- the maximum path sum.',
  constraints_text = 'The number of nodes is in the range [1, 3 * 10^4].
-1000 <= Node.val <= 1000'
WHERE slug = 'binary-tree-max-path';

-- Update Valid Parentheses
UPDATE problems SET 
  statement_md = '## Problem Statement

Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is **valid**.

An input string is valid if:
1. Open brackets must be closed by the **same type** of brackets.
2. Open brackets must be closed in the **correct order**.
3. Every close bracket has a corresponding open bracket of the same type.

## Examples

| Input | Output | Explanation |
|-------|--------|-------------|
| `()[]{}` | `true` | All brackets are correctly matched |
| `(]` | `false` | `(` is closed by `]` which is wrong |
| `([)]` | `false` | Brackets interleave incorrectly |
| `{[]}` | `true` | Nested brackets are valid |

**Hint:** Use a **stack**. Push opening brackets onto the stack. When you encounter a closing bracket, check if the top of the stack is the matching opening bracket. If the stack is empty at the end, the string is valid.',
  input_format = 'A single line containing the string `s`, consisting only of the characters `()[]{}` .',
  output_format = 'Print `true` if the string has valid parentheses, `false` otherwise.',
  constraints_text = '1 <= s.length <= 10^4
s consists of parentheses only: ()[]{}'
WHERE slug = 'valid-parentheses';

-- Update Coin Change
UPDATE problems SET 
  statement_md = '## Problem Statement

You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.

Return the **fewest number of coins** that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.

You may assume that you have an **infinite number** of each kind of coin.

## Examples

**Example 1:**
- `coins = [1, 2, 5]`, `amount = 11`
- Output: `3`
- Explanation: `11 = 5 + 5 + 1` -> 3 coins

**Example 2:**
- `coins = [2]`, `amount = 3`
- Output: `-1`
- Explanation: You cannot make 3 from only coins of value 2.

**Example 3:**
- `coins = [1]`, `amount = 0`
- Output: `0`
- Explanation: 0 amount requires 0 coins.

**Hint:** Use **dynamic programming**. Create an array `dp` where `dp[i]` is the minimum coins needed to make amount `i`. Initialize `dp[0] = 0` and all others to infinity. For each amount from 1 to target, try every coin denomination.',
  input_format = 'The first line contains two integers: `n` (the number of coin types) and `amount` (the target amount).

The second line contains `n` space-separated integers -- the coin denominations.',
  output_format = 'Print a single integer -- the minimum number of coins needed, or `-1` if it is impossible.',
  constraints_text = '1 <= coins.length <= 12
1 <= coins[i] <= 2^31 - 1
0 <= amount <= 10^4'
WHERE slug = 'coin-change';
