import React, { useState } from 'react';

function App() {
  const [jobTitle, setJobTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(2);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);

  const handleGenerate = async () => {
    const response = await fetch('http://localhost:8000/api/questions/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_title: jobTitle, num_questions: numQuestions }),
    });
    const data = await response.json();
    setGeneratedQuestions(data.questions);
  };

  const handleFetchAll = async () => {
    const response = await fetch('http://localhost:8000/api/questions');
    const data = await response.json();
    setAllQuestions(data);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h2>Interview Question Generator</h2>

      <input
        type="text"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        placeholder="Job Title"
        style={{ marginRight: 10 }}
      />
      <input
        type="number"
        value={numQuestions}
        onChange={(e) => setNumQuestions(Number(e.target.value))}
        min="1"
        max="10"
        style={{ marginRight: 10, width: 50 }}
      />
      <button onClick={handleGenerate}>Generate</button>

      <h3>Generated Questions</h3>
      <ul>
        {generatedQuestions.map((q, idx) => (
          <li key={idx}>
            <strong>{q.type}</strong>: {q.question}
          </li>
        ))}
      </ul>

      <hr />

      <h2>All Questions in DB</h2>
      <button onClick={handleFetchAll}>Fetch All</button>
      {allQuestions.map((set, idx) => (
        <div key={idx} style={{ marginTop: 20 }}>
          <h3>{set.job_title}</h3>
          <ul>
            {set.questions.map((q, i) => (
              <li key={i}>
                <strong>{q.type}</strong>: {q.question}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;
