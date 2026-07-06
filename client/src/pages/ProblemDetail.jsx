import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { problemsAPI } from '../api/problems';
import { submissionsAPI } from '../api/submissions';
import { useAuth } from '../context/AuthContext';
import DifficultyBadge from '../components/common/DifficultyBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

/* ── Language Config ─────────────────────────────── */
const LANGUAGES = [
  {
    value: 'cpp',
    label: 'C++ 17',
    monacoId: 'cpp',
    icon: '⚡',
    template: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your solution here

    return 0;
}
`,
  },
  {
    value: 'java',
    label: 'Java 21',
    monacoId: 'java',
    icon: '☕',
    template: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Write your solution here

        sc.close();
    }
}
`,
  },
  {
    value: 'python',
    label: 'Python 3',
    monacoId: 'python',
    icon: '🐍',
    template: `import sys
input = sys.stdin.readline

def solve():
    # Write your solution here
    pass

solve()
`,
  },
];

/* ── Demo problems so the page works without a backend ── */
const DEMO_PROBLEMS = {
  'two-sum': {
    id: 1,
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'easy',
    time_limit_ms: 2000,
    memory_limit_kb: 262144,
    statement_md:
      '## Problem Statement\n\nGiven an array of integers `nums` and an integer `target`, return the **indices** of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n## Explanation\n\nFor example, given `nums = [2, 7, 11, 15]` and `target = 9`:\n- `nums[0] + nums[1] = 2 + 7 = 9`, so the answer is `[0, 1]`.\n\n**Hint:** A brute-force solution checks every pair in O(n²). Can you do it in **O(n)** using a hash map?',
    input_format:
      'The first line contains two space-separated integers `n` (the size of the array) and `target`.\n\nThe second line contains `n` space-separated integers — the elements of the array `nums`.',
    output_format: 'Print two space-separated integers — the 0-indexed positions of the two numbers that add up to `target`.\n\nIf multiple valid answers exist, print any one of them.',
    constraints_text: '2 ≤ n ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9\n-10^9 ≤ target ≤ 10^9\nExactly one valid answer exists.',
    sample_input: '4 9\n2 7 11 15',
    sample_output: '0 1',
  },
  'reverse-linked-list': {
    id: 2,
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'easy',
    time_limit_ms: 2000,
    memory_limit_kb: 262144,
    statement_md:
      '## Problem Statement\n\nGiven the head of a singly linked list, **reverse the list** and return the reversed list.\n\nYou must solve this problem **iteratively** (without recursion).\n\n## Explanation\n\nFor example, given the list `1 → 2 → 3 → 4 → 5`:\n- After reversing: `5 → 4 → 3 → 2 → 1`\n\nThe idea is to iterate through the list and reverse each node\'s `next` pointer one at a time.\n\n**Hint:** Maintain three pointers: `prev`, `curr`, and `next`. At each step, point `curr.next` to `prev`, then advance all three pointers forward.',
    input_format: 'The first line contains a single integer `n` — the number of nodes in the linked list.\n\nThe second line contains `n` space-separated integers representing the values of each node in order.',
    output_format: 'Print the values of the reversed linked list, separated by spaces.',
    constraints_text: '0 ≤ n ≤ 5000\n-5000 ≤ Node.val ≤ 5000',
    sample_input: '5\n1 2 3 4 5',
    sample_output: '5 4 3 2 1',
  },
  'longest-substring': {
    id: 3,
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring',
    difficulty: 'medium',
    time_limit_ms: 2000,
    memory_limit_kb: 262144,
    statement_md:
      '## Problem Statement\n\nGiven a string `s`, find the length of the **longest substring** without repeating characters.\n\nA **substring** is a contiguous non-empty sequence of characters within a string.\n\n## Examples\n\n- `s = "abcabcbb"` → The answer is `3` (the substring `"abc"`).\n- `s = "bbbbb"` → The answer is `1` (the substring `"b"`).\n- `s = "pwwkew"` → The answer is `3` (the substring `"wke"`).\n\n**Note:** `"pwke"` is a subsequence, not a substring.\n\n**Hint:** Use a **sliding window** approach with two pointers `left` and `right`. Expand `right` to include new characters, and shrink `left` when a duplicate is found. Use a `Set` or hash map to track characters in the current window.',
    input_format: 'A single line containing the string `s`.',
    output_format: 'Print a single integer — the length of the longest substring without repeating characters.',
    constraints_text: '0 ≤ s.length ≤ 5 × 10^4\ns consists of English letters, digits, symbols, and spaces.',
    sample_input: 'abcabcbb',
    sample_output: '3',
  },
  'merge-intervals': {
    id: 4,
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    difficulty: 'medium',
    time_limit_ms: 2000,
    memory_limit_kb: 262144,
    statement_md:
      '## Problem Statement\n\nGiven an array of `intervals` where `intervals[i] = [start_i, end_i]`, **merge all overlapping intervals** and return an array of the non-overlapping intervals that cover all the intervals in the input.\n\nTwo intervals `[a, b]` and `[c, d]` overlap if `a ≤ d` and `c ≤ b`.\n\n## Examples\n\n**Example 1:**\n- Input: `[[1,3],[2,6],[8,10],[15,18]]`\n- Output: `[[1,6],[8,10],[15,18]]`\n- Explanation: Intervals `[1,3]` and `[2,6]` overlap, so they merge into `[1,6]`.\n\n**Example 2:**\n- Input: `[[1,4],[4,5]]`\n- Output: `[[1,5]]`\n- Explanation: Intervals `[1,4]` and `[4,5]` are considered overlapping (they share the boundary point 4).\n\n**Hint:** Sort the intervals by their start time, then iterate and merge consecutive overlapping intervals.',
    input_format: 'The first line contains `n` — the number of intervals.\n\nThe next `n` lines each contain two space-separated integers `start` and `end` representing one interval.',
    output_format: 'Print the merged intervals, one per line. Each line should contain two space-separated integers: the start and end of the merged interval.',
    constraints_text: '1 ≤ n ≤ 10^4\n0 ≤ start_i ≤ end_i ≤ 10^4',
    sample_input: '4\n1 3\n2 6\n8 10\n15 18',
    sample_output: '1 6\n8 10\n15 18',
  },
  'lru-cache': {
    id: 5,
    title: 'LRU Cache',
    slug: 'lru-cache',
    difficulty: 'hard',
    time_limit_ms: 3000,
    memory_limit_kb: 262144,
    statement_md:
      '## Problem Statement\n\nDesign a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.\n\nImplement the `LRUCache` class:\n- **`LRUCache(int capacity)`** — Initialize the LRU cache with a positive size `capacity`.\n- **`int get(int key)`** — Return the value of the `key` if it exists, otherwise return `-1`.\n- **`void put(int key, int value)`** — Update the value of the `key` if it exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the `capacity`, **evict the least recently used key**.\n\nBoth `get` and `put` must run in **O(1)** average time complexity.\n\n## Explanation\n\n```\nLRUCache cache = new LRUCache(2);  // capacity = 2\ncache.put(1, 1);                    // cache: {1=1}\ncache.put(2, 2);                    // cache: {1=1, 2=2}\ncache.get(1);                       // returns 1, cache: {2=2, 1=1}\ncache.put(3, 3);                    // evicts key 2, cache: {1=1, 3=3}\ncache.get(2);                       // returns -1 (not found)\ncache.get(3);                       // returns 3\n```\n\n**Hint:** Use a **hash map** combined with a **doubly linked list**. The hash map provides O(1) lookup, and the linked list maintains the access order.',
    input_format: 'The first line contains two integers: `capacity` and `q` (the number of operations).\n\nThe next `q` lines each contain an operation:\n- `PUT key value` — Insert or update a key-value pair\n- `GET key` — Retrieve the value for a key',
    output_format: 'For each `GET` operation, print the returned value on a new line. Print `-1` if the key does not exist in the cache.',
    constraints_text: '1 ≤ capacity ≤ 3000\n0 ≤ key ≤ 10^4\n0 ≤ value ≤ 10^5\nAt most 2 × 10^5 total calls to get and put.',
    sample_input: '2 6\nPUT 1 1\nPUT 2 2\nGET 1\nPUT 3 3\nGET 2\nGET 3',
    sample_output: '1\n-1\n3',
  },
  'binary-tree-max-path': {
    id: 6,
    title: 'Binary Tree Maximum Path Sum',
    slug: 'binary-tree-max-path',
    difficulty: 'hard',
    time_limit_ms: 2000,
    memory_limit_kb: 262144,
    statement_md:
      '## Problem Statement\n\nA **path** in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence **at most once**. Note that the path does **not** need to pass through the root.\n\nThe **path sum** of a path is the sum of the node values in the path.\n\nGiven the `root` of a binary tree, return the **maximum path sum** of any non-empty path.\n\n## Examples\n\n**Example 1:**\n- Tree: `[1, 2, 3]` (root=1, left=2, right=3)\n- Output: `6`\n- Explanation: The optimal path is `2 → 1 → 3` with sum `2 + 1 + 3 = 6`.\n\n**Example 2:**\n- Tree: `[-10, 9, 20, null, null, 15, 7]`\n- Output: `42`\n- Explanation: The optimal path is `15 → 20 → 7` with sum `15 + 20 + 7 = 42`.\n\n**Hint:** Use DFS. At each node, compute the maximum "single-path" sum (going down one side). Update a global maximum considering the "split path" (left + node + right). Return only the single-path to the parent.',
    input_format: 'A single line of space-separated integers representing the binary tree in **level-order** (BFS order).\n\nUse `-1001` to represent null nodes.',
    output_format: 'Print a single integer — the maximum path sum.',
    constraints_text: 'The number of nodes is in the range [1, 3 × 10^4].\n-1000 ≤ Node.val ≤ 1000',
    sample_input: '1 2 3',
    sample_output: '6',
  },
  'valid-parentheses': {
    id: 7,
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'easy',
    time_limit_ms: 1000,
    memory_limit_kb: 262144,
    statement_md:
      '## Problem Statement\n\nGiven a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is **valid**.\n\nAn input string is valid if:\n1. Open brackets must be closed by the **same type** of brackets.\n2. Open brackets must be closed in the **correct order**.\n3. Every close bracket has a corresponding open bracket of the same type.\n\n## Examples\n\n| Input | Output | Explanation |\n|-------|--------|-------------|\n| `()[]{}` | `true` | All brackets are correctly matched |\n| `(]` | `false` | `(` is closed by `]` which is wrong |\n| `([)]` | `false` | Brackets interleave incorrectly |\n| `{[]}` | `true` | Nested brackets are valid |\n\n**Hint:** Use a **stack**. Push opening brackets onto the stack. When you encounter a closing bracket, check if the top of the stack is the matching opening bracket. If the stack is empty at the end, the string is valid.',
    input_format: 'A single line containing the string `s`, consisting only of the characters `()[]{}` .',
    output_format: 'Print `true` if the string has valid parentheses, `false` otherwise.',
    constraints_text: '1 ≤ s.length ≤ 10^4\ns consists of parentheses only: ()[]{}',
    sample_input: '()[]{}',
    sample_output: 'true',
  },
  'coin-change': {
    id: 8,
    title: 'Coin Change',
    slug: 'coin-change',
    difficulty: 'medium',
    time_limit_ms: 2000,
    memory_limit_kb: 262144,
    statement_md:
      '## Problem Statement\n\nYou are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the **fewest number of coins** that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.\n\nYou may assume that you have an **infinite number** of each kind of coin.\n\n## Examples\n\n**Example 1:**\n- `coins = [1, 2, 5]`, `amount = 11`\n- Output: `3`\n- Explanation: `11 = 5 + 5 + 1` → 3 coins\n\n**Example 2:**\n- `coins = [2]`, `amount = 3`\n- Output: `-1`\n- Explanation: You cannot make 3 from only coins of value 2.\n\n**Example 3:**\n- `coins = [1]`, `amount = 0`\n- Output: `0`\n- Explanation: 0 amount requires 0 coins.\n\n**Hint:** Use **dynamic programming**. Create an array `dp` where `dp[i]` is the minimum coins needed to make amount `i`. Initialize `dp[0] = 0` and all others to infinity. For each amount from 1 to target, try every coin denomination.',
    input_format: 'The first line contains two integers: `n` (the number of coin types) and `amount` (the target amount).\n\nThe second line contains `n` space-separated integers — the coin denominations.',
    output_format: 'Print a single integer — the minimum number of coins needed, or `-1` if it is impossible.',
    constraints_text: '1 ≤ coins.length ≤ 12\n1 ≤ coins[i] ≤ 2^31 - 1\n0 ≤ amount ≤ 10^4',
    sample_input: '3 11\n1 2 5',
    sample_output: '3',
  },
};

/* ── Custom Monaco Theme ─────────────────────────── */
function defineArenaTheme(monaco) {
  monaco.editor.defineTheme('codearena', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '636b83', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'c792ea' },
      { token: 'string', foreground: 'c3e88d' },
      { token: 'number', foreground: 'f78c6c' },
      { token: 'type', foreground: 'ffcb6b' },
      { token: 'function', foreground: '82aaff' },
      { token: 'variable', foreground: 'e8eaf6' },
      { token: 'operator', foreground: '89ddff' },
      { token: 'delimiter', foreground: '89ddff' },
      { token: 'annotation', foreground: 'ff5370' },
    ],
    colors: {
      'editor.background': '#0d0d14',
      'editor.foreground': '#e8eaf6',
      'editor.lineHighlightBackground': '#1a1a28',
      'editor.selectionBackground': '#7c6aef33',
      'editor.inactiveSelectionBackground': '#7c6aef1a',
      'editorCursor.foreground': '#7c6aef',
      'editorLineNumber.foreground': '#3a3a52',
      'editorLineNumber.activeForeground': '#7c6aef',
      'editorIndentGuide.background': '#1e1e30',
      'editorIndentGuide.activeBackground': '#2a2a3e',
      'editor.selectionHighlightBackground': '#7c6aef1a',
      'editorBracketMatch.background': '#7c6aef22',
      'editorBracketMatch.border': '#7c6aef55',
      'scrollbarSlider.background': '#2a2a3e80',
      'scrollbarSlider.hoverBackground': '#3a3a52',
      'scrollbarSlider.activeBackground': '#7c6aef55',
      'editorWidget.background': '#12121a',
      'editorWidget.border': '#2a2a3e',
      'editorSuggestWidget.background': '#12121a',
      'editorSuggestWidget.border': '#2a2a3e',
      'editorSuggestWidget.selectedBackground': '#1e1e30',
      'editorOverviewRuler.border': '#00000000',
      'minimap.background': '#0d0d14',
    },
  });
}

/* ── Component ───────────────────────────────────── */
export default function ProblemDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const editorRef = useRef(null);

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [editorReady, setEditorReady] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.value === language) || LANGUAGES[0];

  /* ── Fetch problem ── */
  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    problemsAPI
      .getBySlug(slug)
      .then((res) => {
        const p = res.data.data?.problem;
        if (p) {
          setProblem(p);
        } else {
          // API returned but no problem — try demo fallback
          const demo = DEMO_PROBLEMS[slug];
          if (demo) {
            setProblem(demo);
          } else {
            setNotFound(true);
          }
        }
      })
      .catch(() => {
        // Backend unreachable — try demo fallback
        const demo = DEMO_PROBLEMS[slug];
        if (demo) {
          setProblem(demo);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  /* ── Load saved code or template ── */
  useEffect(() => {
    const saved = localStorage.getItem(`code_${slug}_${language}`);
    setCode(saved || currentLang.template);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  /* ── Auto-save code ── */
  useEffect(() => {
    if (code && code !== currentLang.template) {
      localStorage.setItem(`code_${slug}_${language}`, code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    // Auto-save current code before switching
    if (code && code !== currentLang.template) {
      localStorage.setItem(`code_${slug}_${language}`, code);
    }
    setLanguage(newLang);
    const nextLang = LANGUAGES.find((l) => l.value === newLang) || LANGUAGES[0];
    const saved = localStorage.getItem(`code_${slug}_${newLang}`);
    setCode(saved || nextLang.template);
  };

  /* ── Monaco setup ── */
  const handleEditorWillMount = (monaco) => {
    defineArenaTheme(monaco);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setEditorReady(true);

    // Keybinding: Ctrl+Enter to submit
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleSubmit();
    });

    editor.focus();
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  /* ── Reset code ── */
  const handleReset = () => {
    setCode(currentLang.template);
    localStorage.removeItem(`code_${slug}_${language}`);
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!user) {
      setSubmitResult({ type: 'error', message: 'Please login to submit.' });
      return;
    }
    const currentCode = editorRef.current?.getValue() || code;
    if (!currentCode.trim()) {
      setSubmitResult({ type: 'error', message: 'Please write some code first.' });
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await submissionsAPI.submit({
        problemId: problem.id,
        language,
        sourceCode: currentCode,
      });
      setSubmitResult({
        type: 'success',
        message: `Submitted! ID: ${res.data.data?.submissionId || 'pending'}`,
      });
    } catch (err) {
      setSubmitResult({
        type: 'error',
        message: err.response?.data?.message || 'Submission failed.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (notFound) {
    return (
      <div className="fade-in">
        <div className="empty-state" style={{ padding: '4rem 2rem' }}>
          <div className="empty-icon">🔍</div>
          <h3>Problem not found</h3>
          <p>The problem "{slug}" doesn't exist or hasn't been published yet.</p>
          <Link to="/problems" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            ← Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  if (!problem) return null;

  const p = problem;

  return (
    <div className="fade-in">
      <div className="problem-detail">
        {/* ── Left: Problem Statement ── */}
        <div className="card problem-statement">
          <h2>{p.title}</h2>

          <div className="problem-meta">
            <DifficultyBadge difficulty={p.difficulty} />
            <span className="meta-item">⏱ {p.time_limit_ms}ms</span>
            <span className="meta-item">💾 {Math.round(p.memory_limit_kb / 1024)}MB</span>
          </div>

          <div className="problem-section">
            <h3>Description</h3>
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {p.statement_md}
              </ReactMarkdown>
            </div>
          </div>

          {p.input_format && (
            <div className="problem-section">
              <h3>Input Format</h3>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {p.input_format}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {p.output_format && (
            <div className="problem-section">
              <h3>Output Format</h3>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {p.output_format}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {p.constraints_text && (
            <div className="problem-section">
              <h3>Constraints</h3>
              <pre>{p.constraints_text}</pre>
            </div>
          )}

          {(p.sample_input || p.sample_output) && (
            <div className="problem-section">
              <h3>Example</h3>
              {p.sample_input && (
                <>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Input:</p>
                  <pre>{p.sample_input}</pre>
                </>
              )}
              {p.sample_output && (
                <>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.75rem 0 0.25rem' }}>Output:</p>
                  <pre>{p.sample_output}</pre>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Monaco Editor ── */}
        <div className="editor-panel">
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Editor Toolbar */}
            <div className="monaco-toolbar">
              <div className="monaco-toolbar-left">
                <select
                  className="language-select"
                  value={language}
                  onChange={handleLanguageChange}
                  id="language-selector"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.icon} {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="monaco-toolbar-right">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleReset}
                  title="Reset to template"
                >
                  ↺ Reset
                </button>
                <span className="editor-shortcut" title="Submit shortcut">
                  Ctrl+Enter
                </span>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="monaco-wrapper">
              {!editorReady && (
                <div className="monaco-loading">
                  <div className="spinner"></div>
                  <span>Loading editor...</span>
                </div>
              )}
              <Editor
                height="500px"
                language={currentLang.monacoId}
                value={code}
                theme="codearena"
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                onChange={handleEditorChange}
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'line',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  tabSize: 4,
                  insertSpaces: true,
                  automaticLayout: true,
                  bracketPairColorization: { enabled: true },
                  guides: {
                    indentation: true,
                    bracketPairs: true,
                  },
                  suggest: {
                    showKeywords: true,
                    showSnippets: true,
                  },
                  quickSuggestions: true,
                  wordWrap: 'off',
                  overviewRulerLanes: 0,
                  hideCursorInOverviewRuler: true,
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                }}
              />
            </div>

            {/* Bottom Bar */}
            <div className="monaco-bottombar">
              {submitResult && (
                <div
                  className={`alert ${submitResult.type === 'error' ? 'alert-error' : 'alert-success'}`}
                  style={{ margin: '0', flex: 1 }}
                >
                  {submitResult.message}
                </div>
              )}

              <div className="editor-actions" style={{ marginTop: 0 }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                  id="submit-btn"
                >
                  {submitting ? '⏳ Judging...' : '🚀 Submit Solution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
