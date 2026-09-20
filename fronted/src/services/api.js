/**
 * StudyMate AI – API Service Layer
 *
 * All backend communication lives here.
 * The base URL points to the FastAPI server.
 * When the backend is unavailable the functions fall back to mock data
 * so the frontend continues to work during development.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Generic fetch wrapper with error handling.
 */
async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      // Don't set Content-Type for FormData – the browser sets it with boundary
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// ─── Mock data (used when the backend is not yet available) ──────────────────

const MOCK_SUMMARY = {
  title: "Introduction to Hashing",
  overview:
    "Hashing is a fundamental computer science technique used to efficiently store and retrieve data. It maps keys of arbitrary size to fixed-size values (hash codes) using a hash function, enabling near-constant-time lookups in typical cases.",
  key_concepts: [
    "Hash Functions",
    "Hash Tables",
    "Collision",
    "Linear Probing",
    "Quadratic Probing",
    "Chaining (Separate Chaining)",
    "Load Factor",
    "Rehashing",
  ],
  sections: [
    {
      heading: "What is a Hash Function?",
      content:
        "A hash function converts an input (key) into an integer index within a fixed-size array. A good hash function distributes keys uniformly, minimises collisions, and is fast to compute.",
    },
    {
      heading: "Hash Tables",
      content:
        "A hash table is a data structure that uses a hash function to map keys to buckets or slots in an array. It supports average-case O(1) time complexity for insertion, deletion, and lookup operations.",
    },
    {
      heading: "Collisions",
      content:
        "A collision occurs when two different keys produce the same hash index. All practical hash tables must include a collision-resolution strategy. The two main families are open addressing (linear probing, quadratic probing) and separate chaining.",
    },
    {
      heading: "Linear Probing",
      content:
        "When a collision occurs, linear probing searches sequentially through the table for the next available slot. It is simple but can suffer from primary clustering, where long runs of occupied slots form and degrade performance.",
    },
    {
      heading: "Separate Chaining",
      content:
        "Each slot in the array holds a linked list (or another collection). All keys that hash to the same index are stored in that list. Chaining handles high load factors more gracefully than open addressing.",
    },
  ],
  key_takeaways: [
    "Hash tables provide O(1) average-case performance for insert, delete, and search.",
    "A good hash function minimises collisions and distributes keys evenly.",
    "Collision resolution strategies include open addressing and separate chaining.",
    "The load factor (number of entries ÷ table size) must be kept below ~0.7 for good performance.",
    "Rehashing rebuilds the table at a larger size when the load factor grows too high.",
  ],
};

const MOCK_QUIZ = [
  {
    id: 1,
    question: "What is the primary purpose of a hash function?",
    options: [
      "To encrypt sensitive data",
      "To sort data in ascending order",
      "To map keys to fixed-size indices",
      "To compress files",
    ],
    answer: 2, // 0-based index of correct option
    explanation:
      "A hash function maps keys of arbitrary size to fixed-size indices in an array, enabling fast lookups.",
  },
  {
    id: 2,
    question: "What is a collision in the context of hashing?",
    options: [
      "When a key cannot be found in the table",
      "When two different keys produce the same hash index",
      "When the table runs out of memory",
      "When a hash function returns a negative value",
    ],
    answer: 1,
    explanation:
      "A collision happens when two distinct keys are mapped to the same slot by the hash function.",
  },
  {
    id: 3,
    question: "Which collision resolution strategy uses linked lists?",
    options: [
      "Linear Probing",
      "Quadratic Probing",
      "Double Hashing",
      "Separate Chaining",
    ],
    answer: 3,
    explanation:
      "Separate chaining stores all keys that hash to the same index in a linked list at that slot.",
  },
  {
    id: 4,
    question:
      "What is the average-case time complexity for a lookup in a well-designed hash table?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    answer: 2,
    explanation:
      "With a good hash function and a reasonable load factor, lookups run in O(1) on average.",
  },
  {
    id: 5,
    question: "What does the load factor of a hash table represent?",
    options: [
      "The maximum number of elements allowed",
      "The ratio of stored entries to total table capacity",
      "The number of collisions that have occurred",
      "The speed of the hash function",
    ],
    answer: 1,
    explanation:
      "Load factor = (number of entries) ÷ (table capacity). Keeping it low (< 0.7) helps maintain O(1) performance.",
  },
];

// ─── API Functions ───────────────────────────────────────────────────────────

/**
 * Upload a PDF document to the backend for processing.
 * POST /api/upload
 *
 * @param {File} file – the PDF file selected by the user
 * @returns {Promise<{ message: string, document_id: string }>}
 */
export async function uploadDocument(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const data = await apiFetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    return { success: true, data };
  } catch (error) {
    console.warn("Backend unavailable – using mock upload response.", error);
    // Mock successful upload so the UI can continue
    return {
      success: true,
      data: { message: "Document uploaded successfully (mock)", document_id: "mock-doc-001" },
      isMock: true,
    };
  }
}

/**
 * Ask a question about the uploaded document.
 * POST /api/ask
 *
 * @param {string} question – the user's question
 * @returns {Promise<{ answer: string }>}
 */
export async function askQuestion(question) {
  try {
    const data = await apiFetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({ question }),
    });

    return { success: true, data };
  } catch (error) {
    console.warn("Backend unavailable – using mock answer.", error);
    // Provide a mock answer that references the question
    const mockAnswers = {
      default:
        "Based on your document, this topic is covered in detail in the uploaded material. The document explains the core concepts, providing definitions, examples, and practical applications to help you understand the subject thoroughly.",
      hash: "A collision in hashing occurs when two different keys are mapped to the same index by the hash function. This is resolved through strategies like linear probing (searching for the next available slot) or separate chaining (storing multiple keys in a linked list at the same index).",
      function:
        "A hash function converts an input key into an integer index within a fixed-size array. A good hash function distributes keys uniformly to minimise collisions and runs in O(1) time.",
      table:
        "A hash table is a data structure that pairs keys with values using a hash function for indexing. It provides average O(1) time for insert, delete, and lookup operations.",
    };

    const lq = question.toLowerCase();
    let answer = mockAnswers.default;
    if (lq.includes("collision") || lq.includes("hash")) answer = mockAnswers.hash;
    if (lq.includes("function")) answer = mockAnswers.function;
    if (lq.includes("table")) answer = mockAnswers.table;

    return {
      success: true,
      data: { answer },
      isMock: true,
    };
  }
}

/**
 * Request the AI-generated summary of the uploaded document.
 * POST /api/summarize
 *
 * @returns {Promise<Object>} – summary object
 */
export async function getSummary() {
  try {
    const data = await apiFetch("/api/summarize", { method: "POST" });
    return { success: true, data };
  } catch (error) {
    console.warn("Backend unavailable – using mock summary.", error);
    return { success: true, data: MOCK_SUMMARY, isMock: true };
  }
}

/**
 * Request AI-generated quiz questions for the uploaded document.
 * POST /api/quiz
 *
 * @returns {Promise<{ questions: Array }>}
 */
export async function generateQuiz() {
  try {
    const data = await apiFetch("/api/quiz", { method: "POST" });
    return { success: true, data };
  } catch (error) {
    console.warn("Backend unavailable – using mock quiz.", error);
    return { success: true, data: { questions: MOCK_QUIZ }, isMock: true };
  }
}
