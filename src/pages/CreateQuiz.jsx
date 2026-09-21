import saiquizLogo from "../assets/saiquiz-logo.jpeg";
import { useState } from "react";
import "./CreateQuiz.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [questions, setQuestions] = useState([]);

  const [showPreview, setShowPreview] = useState(false);
  const [quizCreated, setQuizCreated] = useState(false);
  const [quizCode, setQuizCode] = useState("");
  const [copied, setCopied] = useState(false);

  // =========================
  // QUIZ SETTINGS
  // =========================

  const [availableFromDate, setAvailableFromDate] = useState("");
  const [availableFromTime, setAvailableFromTime] = useState("");

  const [availableUntilDate, setAvailableUntilDate] = useState("");
  const [availableUntilTime, setAvailableUntilTime] = useState("");

  const [timeLimit, setTimeLimit] = useState("");

  const navigate = useNavigate();

  // =========================
  // CHATGPT PROMPT
  // =========================

  const chatGPTPrompt = `Create quiz questions for SimpleQuiz.

IMPORTANT:
You MUST follow the output format EXACTLY.
Do NOT change, simplify, rearrange, or modify the format.

Use EXACTLY this format:

Q1. What is the brain of a computer called?

A. Monitor
B. CPU
C. Keyboard
D. Mouse

Answer: B

Q2. What does CSS stand for?

A. Computer Style Sheets
B. Creative Style System
C. Cascading Style Sheets
D. Colorful Style Sheets

Answer: C

STRICT RULES:

1. Generate only quiz questions. Do NOT add any introduction, explanation, heading, conclusion, note, disclaimer, or extra text.

2. Every question MUST start exactly like:
Q1.
Q2.
Q3.
Q4.
and so on.

3. Question numbers MUST be sequential.
Do not skip numbers.
Do not repeat numbers.

4. Every question MUST contain EXACTLY FOUR options.

5. The four options MUST be written exactly as:
A.
B.
C.
D.

6. EACH option MUST be on its OWN separate line.

7. NEVER put multiple options on the same line.

8. NEVER write:
A. Option 1 B. Option 2 C. Option 3 D. Option 4

9. NEVER write options using:
1.
2.
3.
4.

10. NEVER write options using:
a)
b)
c)
d)

11. NEVER write options using:
(A)
(B)
(C)
(D)

12. NEVER use bullet points for options.

13. The correct answer MUST be written exactly as:
Answer: A
OR
Answer: B
OR
Answer: C
OR
Answer: D

14. The Answer line MUST contain only one letter: A, B, C, or D.

15. Do NOT write the correct answer as the option text.

16. Every question MUST have exactly ONE correct answer.

17. The other three options MUST be incorrect but plausible.

18. Do not create ambiguous questions where multiple options could reasonably be correct.

19. Verify the factual correctness of every question and every option before responding.

20. For programming, mathematics, aptitude, science, SQL, technical, or numerical questions, independently verify the answer before generating the final output.

21. Do not guess answers.

22. Do not invent facts.

23. Do not add explanations after the Answer line.

24. Leave ONE blank line between the question and option A.

25. Leave ONE blank line between option D and the Answer line.

26. Leave ONE blank line between the Answer line and the next question.

27. Every question must follow this exact structure:

Q1. Question text

A. Option A
B. Option B
C. Option C
D. Option D

Answer: A

28. The final response MUST contain ONLY the quiz.

29. Do NOT use Markdown headings.

30. Do NOT use code blocks.

31. Do NOT write "Here are the questions".

32. Do NOT write "Sure".

33. Do NOT write explanations.

34. Do NOT write answer explanations.

35. Do NOT write difficulty labels.

36. Do NOT write topic labels.

37. Do NOT add numbering outside the Q1., Q2., Q3. format.

FINAL VALIDATION BEFORE RESPONDING:

For EVERY question silently verify:

- Question number is correct.
- Question text exists.
- Exactly four options exist.
- Option A exists.
- Option B exists.
- Option C exists.
- Option D exists.
- Every option is on a separate line.
- Answer line exists.
- Answer is exactly A, B, C, or D.
- Exactly one option is correct.
- The answer letter matches the actual correct option.
- No duplicate options.
- No ambiguous answer.
- No extra text.

If ANY check fails, fix it BEFORE responding.

OUTPUT ONLY THE FINAL QUIZ.`;

  // =========================
  // PARSE QUESTIONS
  // =========================

  const parseQuestions = () => {
    if (!title.trim()) {
      alert("Please enter a quiz title.");
      return;
    }

    if (!content.trim()) {
      alert("Please paste your questions.");
      return;
    }

    // Remove only harmless Markdown formatting.
    // The actual quiz structure is validated strictly below.
    const cleanedContent = content
      .replace(/\*\*/g, "")
      .replace(/^#+\s*/gm, "")
      .trim();

    // =====================================================
    // SPLIT QUESTIONS
    // ONLY Q1., Q2., Q3. FORMAT IS ACCEPTED
    // =====================================================

    const blocks = cleanedContent
      .split(/(?=^Q\d+\.\s+)/gim)
      .map((block) => block.trim())
      .filter(Boolean);

    if (blocks.length === 0) {
      alert(
        "No questions detected. Please use the exact Q1., Q2., Q3. format."
      );
      return;
    }

    const parsedQuestions = [];

    // =====================================================
    // PARSE EACH QUESTION
    // =====================================================

    for (let index = 0; index < blocks.length; index++) {
      const block = blocks[index];

      const lines = block
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      // =====================================================
      // EXACT STRUCTURE CHECK
      //
      // 1. Question
      // 2. A option
      // 3. B option
      // 4. C option
      // 5. D option
      // 6. Answer
      // =====================================================

      if (lines.length !== 6) {
        alert(
          `Question ${index + 1} has an invalid format.\n\nEach question must contain exactly:\n\nQ${index + 1}. Question\n\nA. Option\nB. Option\nC. Option\nD. Option\n\nAnswer: A`
        );
        return;
      }

      // =====================================================
      // QUESTION NUMBER + QUESTION TEXT
      // =====================================================

      const questionMatch = lines[0].match(
        /^Q(\d+)\.\s+(.+)$/i
      );

      if (!questionMatch) {
        alert(
          `Question ${index + 1} must start exactly with Q${index + 1}.`
        );
        return;
      }

      const questionNumber = Number(questionMatch[1]);
      const question = questionMatch[2].trim();

      if (questionNumber !== index + 1) {
        alert(
          `Question numbering is incorrect.\n\nExpected Q${index + 1}. but found Q${questionNumber}.`
        );
        return;
      }

      if (!question) {
        alert(`Question ${index + 1} has no question text.`);
        return;
      }

      // =====================================================
      // OPTIONS
      // =====================================================

      const optionLabels = ["A", "B", "C", "D"];

      const options = [];

      for (let optionIndex = 0; optionIndex < 4; optionIndex++) {
        const expectedLetter = optionLabels[optionIndex];

        const optionRegex = new RegExp(
          `^${expectedLetter}\\.\\s+(.+)$`,
          "i"
        );

        const optionMatch = lines[optionIndex + 1].match(
          optionRegex
        );

        if (!optionMatch) {
          alert(
            `Question ${index + 1} has an invalid ${expectedLetter} option.\n\nEvery option must be written exactly like:\n${expectedLetter}. Option text`
          );
          return;
        }

        const optionText = optionMatch[1].trim();

        if (!optionText) {
          alert(
            `Question ${index + 1} has an empty ${expectedLetter} option.`
          );
          return;
        }

        options.push(optionText);
      }

      // =====================================================
      // CHECK DUPLICATE OPTIONS
      // =====================================================

      const normalizedOptions = options.map((option) =>
        option.toLowerCase().replace(/\s+/g, " ").trim()
      );

      const uniqueOptions = new Set(normalizedOptions);

      if (uniqueOptions.size !== 4) {
        alert(
          `Question ${index + 1} contains duplicate options.\n\nEvery question must have four different options.`
        );
        return;
      }

      // =====================================================
      // CORRECT ANSWER
      // =====================================================

      const answerMatch = lines[5].match(
        /^Answer:\s*([ABCD])$/i
      );

      if (!answerMatch) {
        alert(
          `Question ${index + 1} has an invalid Answer line.\n\nIt must be exactly like:\nAnswer: A\n\nor\n\nAnswer: B\n\nor\n\nAnswer: C\n\nor\n\nAnswer: D`
        );
        return;
      }

      const correctAnswer = answerMatch[1].toUpperCase();

      // =====================================================
      // SAVE QUESTION
      // =====================================================

      parsedQuestions.push({
        question,
        options,
        correctAnswer,
      });
    }

    // =====================================================
    // FINAL VALIDATION
    // =====================================================

    if (parsedQuestions.length === 0) {
      alert("No valid questions detected.");
      return;
    }

    const invalidQuestion = parsedQuestions.find(
      (question) =>
        question.options.length !== 4 ||
        !["A", "B", "C", "D"].includes(
          question.correctAnswer
        )
    );

    if (invalidQuestion) {
      alert(
        "One or more questions have an invalid structure. Please check the format."
      );
      return;
    }

    // =====================================================
    // SAVE QUESTIONS
    // =====================================================

    setQuestions(parsedQuestions);
    setShowPreview(true);
  };

  // =========================
  // CREATE QUIZ
  // =========================

  const handleCreateQuiz = async () => {
    try {
      // =========================
      // CHECK LOGIN
      // =========================

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      // =========================
      // CHECK SETTINGS
      // =========================

      if (!availableFromDate || !availableFromTime) {
        alert("Please select the quiz start date and time.");
        return;
      }

      if (!availableUntilDate || !availableUntilTime) {
        alert("Please select the quiz end date and time.");
        return;
      }

      if (!timeLimit) {
        alert("Please enter the quiz time limit.");
        return;
      }

      // =========================
      // CHECK TIME LIMIT
      // =========================

      if (Number(timeLimit) < 1) {
        alert("Time limit must be at least 1 minute.");
        return;
      }

      // =========================
      // CHECK DATE/TIME
      // =========================

      const startTime = new Date(
        `${availableFromDate}T${availableFromTime}`
      );

      const endTime = new Date(
        `${availableUntilDate}T${availableUntilTime}`
      );

      if (
        isNaN(startTime.getTime()) ||
        isNaN(endTime.getTime())
      ) {
        alert("Please select valid dates and times.");
        return;
      }

      if (endTime <= startTime) {
        alert("Quiz end time must be after start time.");
        return;
      }

      // =========================
      // FINAL QUESTION VALIDATION
      // =========================

      if (questions.length === 0) {
        alert("Please add at least one question.");
        return;
      }

      const invalidQuestion = questions.find(
        (question) =>
          !question.question.trim() ||
          question.options.length !== 4 ||
          question.options.some(
            (option) => !option.trim()
          ) ||
          !["A", "B", "C", "D"].includes(
            question.correctAnswer
          )
      );

      if (invalidQuestion) {
        alert(
          "One or more questions are invalid. Please go back and fix them."
        );
        return;
      }

      // =========================
      // GENERATE QUIZ CODE
      // =========================

      const code =
        "SQ" +
        Math.floor(1000 + Math.random() * 9000);

      // =========================
      // QUIZ DATA
      // =========================

      const quizData = {
        title: title.trim(),
        questions,
        quizCode: code,

        availableFrom: startTime.toISOString(),
        availableUntil: endTime.toISOString(),

        timeLimit: Number(timeLimit),
      };

      // =========================
      // SEND TO BACKEND
      // =========================

      await axios.post(
        "https://saiquiz-backend.onrender.com/api/quizzes",
        quizData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // =========================
      // SUCCESS
      // =========================

      setQuizCode(code);
      setQuizCreated(true);
    } catch (error) {
      console.error(
        "Error creating quiz:",
        error
      );

      if (error.response?.status === 401) {
        alert("Please login again.");
      } else if (error.response?.status === 403) {
        alert(
          "Only teachers can create quizzes."
        );
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to create quiz.");
      }
    }
  };

  // =========================
  // SUCCESS PAGE
  // =========================

  if (quizCreated) {
    // =========================
    // FORMAT DATE & TIME
    // =========================

    const formatDateTime = (date, time) => {
      return new Date(
        `${date}T${time}`
      ).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    const formattedStart = formatDateTime(
      availableFromDate,
      availableFromTime
    );

    const formattedEnd = formatDateTime(
      availableUntilDate,
      availableUntilTime
    );

    // =========================
    // MESSAGE TO SEND
    // =========================

    const quizMessage = `Students, please attend the quiz.

Quiz Name: ${title}
Quiz Code: ${quizCode}

Available From: ${formattedStart}
Available Until: ${formattedEnd}
Time Limit: ${timeLimit} minutes

Attend Quiz: https://simple-quiz-black.vercel.app/join`;

    return (
      <div className="create-page">
        <header className="create-header">
          <div className="logo">
            <img
              src={saiquizLogo}
              alt="SimpleQuiz"
              className="logo-image"
            />
          </div>

          <button
            className="back-button"
            onClick={() => navigate("/")}
          >
            ← Home
          </button>
        </header>

        <main className="create-container">
          <div className="success-page">
            {/* SUCCESS ICON */}

            <div className="success-icon">
              ✓
            </div>

            {/* TITLE */}

            <p className="success-label">
              QUIZ CREATED
            </p>

            <h1>
              Your quiz is ready! 🎉
            </h1>

            <p className="success-description">
              Copy the message below and send it
              directly to your students.
            </p>

            {/* QUIZ CODE */}

            <div className="code-card">
              <span>QUIZ CODE</span>

              <strong>{quizCode}</strong>
            </div>

            {/* MESSAGE PREVIEW */}

            <div className="message-preview">
              <div className="message-preview-header">
                <span>MESSAGE PREVIEW</span>

                <small>Preview</small>
              </div>

              <div className="message-preview-content">
                <p>
                  Students, please attend the quiz.
                </p>

                <div className="message-details">
                  <div>
                    <span>Quiz Name</span>

                    <strong>{title}</strong>
                  </div>

                  <div>
                    <span>Quiz Code</span>

                    <strong>{quizCode}</strong>
                  </div>

                  <div>
                    <span>Available From</span>

                    <strong>{formattedStart}</strong>
                  </div>

                  <div>
                    <span>Available Until</span>

                    <strong>{formattedEnd}</strong>
                  </div>

                  <div>
                    <span>Time Limit</span>

                    <strong>
                      {timeLimit} minutes
                    </strong>
                  </div>
                </div>

                <div className="message-link">
                  <span>Attend Quiz</span>

                  <strong>
                    https://simple-quiz-black.vercel.app/join
                  </strong>
                </div>
              </div>
            </div>

            {/* COPY MESSAGE */}

            <button
              className="create-final-button"
              onClick={() => {
                navigator.clipboard.writeText(
                  quizMessage
                );

                setCopied(true);

                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            >
              {copied
                ? "✓ Message Copied!"
                : "📋 Copy Message"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // INPUT PAGE
  // =========================

  if (!showPreview) {
    return (
      <div className="create-page">
        <header className="create-header">
          <div className="logo">
            <img
              src={saiquizLogo}
              alt="SimpleQuiz"
              className="logo-image"
            />
          </div>

          <button
            className="back-button"
            onClick={() => navigate("/")}
          >
            ← Back
          </button>
        </header>

        <main className="create-container">
          <div className="create-heading">
            <p>CREATE QUIZ</p>

            <h1>
              Build your quiz
              <span> in seconds.</span>
            </h1>

            <div className="create-description">
              Paste your questions all at once.
              SimpleQuiz will organize them into
              individual questions.
            </div>
          </div>

          <div className="quiz-form">
            {/* TITLE */}

            <div className="input-section">
              <label>Quiz Title</label>

              <input
                type="text"
                placeholder="Example: Java Basics Quiz"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />
            </div>

            {/* QUESTIONS */}

            <div className="input-section">
              <div className="label-row">
                <label>Questions</label>

                <span>Bulk import</span>
              </div>

              <div className="question-help">
                <strong>
                  Need help formatting your
                  questions?
                </strong>

                <p>
  Copy the prompt below, paste it into Meta AI, and then paste the formatted questions here.
</p>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      chatGPTPrompt
                    );

                    setCopied(true);

                    setTimeout(() => {
                      setCopied(false);
                    }, 2000);
                  }}
                >
                  {copied
                    ? "✓ Copied!"
                    : "Copy Meta AI Prompt"}
                </button>
              </div>

              <label className="questions-paste-label">
                Paste your formatted questions here
              </label>

              <textarea
                placeholder={`Paste your questions here...

Example:

Q1. What is Java?

A. Programming Language
B. Database
C. Browser
D. Operating System

Answer: A

Q2. What is React?

A. Library
B. Database
C. Programming Language
D. Operating System

Answer: A`}
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
              />
            </div>

            {/* QUIZ SETTINGS */}

            <div className="quiz-settings">
              <div className="settings-heading">
                <p>QUIZ SETTINGS</p>

                <span>
                  Set when students can attend
                </span>
              </div>

              {/* START TIME */}

              <div className="input-section">
                <label>Available From</label>

                <input
                  type="date"
                  value={availableFromDate}
                  onChange={(e) =>
                    setAvailableFromDate(
                      e.target.value
                    )
                  }
                />

                <select
                  value={availableFromTime}
                  onChange={(e) =>
                    setAvailableFromTime(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select time
                  </option>

                  {Array.from(
                    { length: 24 },
                    (_, hour) => {
                      const value = `${String(
                        hour
                      ).padStart(
                        2,
                        "0"
                      )}:00`;

                      const displayHour =
                        hour === 0
                          ? 12
                          : hour > 12
                          ? hour - 12
                          : hour;

                      const period =
                        hour < 12
                          ? "AM"
                          : "PM";

                      return (
                        <option
                          key={value}
                          value={value}
                        >
                          {displayHour}:00{" "}
                          {period}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* END TIME */}

              <div className="input-section">
                <label>Available Until</label>

                <input
                  type="date"
                  value={availableUntilDate}
                  onChange={(e) =>
                    setAvailableUntilDate(
                      e.target.value
                    )
                  }
                />

                <select
                  value={availableUntilTime}
                  onChange={(e) =>
                    setAvailableUntilTime(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select time
                  </option>

                  {Array.from(
                    { length: 24 },
                    (_, hour) => {
                      const value = `${String(
                        hour
                      ).padStart(
                        2,
                        "0"
                      )}:00`;

                      const displayHour =
                        hour === 0
                          ? 12
                          : hour > 12
                          ? hour - 12
                          : hour;

                      const period =
                        hour < 12
                          ? "AM"
                          : "PM";

                      return (
                        <option
                          key={value}
                          value={value}
                        >
                          {displayHour}:00{" "}
                          {period}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* TIMER */}

              <div className="input-section">
                <label>Time Limit</label>

                <div className="time-input-wrapper">
                  <input
                    type="number"
                    min="1"
                    placeholder="30"
                    value={timeLimit}
                    onChange={(e) =>
                      setTimeLimit(
                        e.target.value
                      )
                    }
                  />

                  <span>minutes</span>
                </div>
              </div>
            </div>

            {/* TIP */}

            <div className="tip-box">
              <span>💡</span>

              <div>
                <strong>Quick tip</strong>

                <p>
                  Copy an entire question set from Meta AI and paste it here.
                </p>
              </div>
            </div>

            {/* PREVIEW BUTTON */}

            <button
              className="preview-button"
              onClick={parseQuestions}
            >
              Preview Questions

              <span>→</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // PREVIEW PAGE
  // =========================

  return (
    <div className="create-page">
      <header className="create-header">
        <div className="logo">
          <img
            src={saiquizLogo}
            alt="SimpleQuiz"
            className="logo-image"
          />
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Home
        </button>
      </header>

      <main className="create-container">
        <div className="preview-page">
          <div className="preview-top">
            <div>
              <p>QUIZ PREVIEW</p>

              <h1>{title}</h1>

              <small className="question-count">
                {questions.length} questions detected
              </small>
            </div>

            <button
              className="edit-button"
              onClick={() =>
                setShowPreview(false)
              }
            >
              ← Edit
            </button>
          </div>

          {/* SETTINGS PREVIEW */}

          <div className="quiz-settings-preview">
            <div>
              <span>STARTS</span>

              <strong>
                {new Date(
                  `${availableFromDate}T${availableFromTime}`
                ).toLocaleString()}
              </strong>
            </div>

            <div>
              <span>ENDS</span>

              <strong>
                {new Date(
                  `${availableUntilDate}T${availableUntilTime}`
                ).toLocaleString()}
              </strong>
            </div>

            <div>
              <span>TIME LIMIT</span>

              <strong>
                {timeLimit} minutes
              </strong>
            </div>
          </div>

          {/* QUESTIONS */}

          {questions.map(
            (question, index) => (
              <div
                className="question-card"
                key={index}
              >
                <div className="question-number">
                  QUESTION{" "}
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </div>

                <h2>{question.question}</h2>

                <div className="options">
                  {question.options.map(
                    (
                      option,
                      optionIndex
                    ) => (
                      <div
                        key={optionIndex}
                      >
                        <span className="option-letter">
                          {String.fromCharCode(
                            65 +
                              optionIndex
                          )}
                        </span>

                        {option}
                      </div>
                    )
                  )}
                </div>

                {/* CORRECT ANSWER */}

                <div className="answer-preview">
                  ✓ Correct Answer:{" "}
                  {question.correctAnswer}
                </div>
              </div>
            )
          )}

          {/* CREATE QUIZ */}

          <button
            className="create-final-button"
            onClick={handleCreateQuiz}
          >
            Create Quiz →
          </button>
        </div>
      </main>
    </div>
  );
}

export default CreateQuiz;