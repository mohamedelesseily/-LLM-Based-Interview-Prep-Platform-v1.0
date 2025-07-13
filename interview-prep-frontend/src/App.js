import React, { useState } from 'react';

function App() {
  const [jobTitle, setJobTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(2);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [jobTitleToDelete, setJobTitleToDelete] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [showJson, setShowJson] = useState(false);
  const [stats, setStats] = useState(null);


const handleGenerate = async () => {
  if (!jobTitle.trim()) {
    alert("Please enter a job title before generating questions.");
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/api/questions/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_title: jobTitle, num_questions: numQuestions }),
    });

    const data = await response.json();
    setGeneratedQuestions(data.questions);
  } catch (error) {
    console.error('Error generating questions:', error);
  }
};

const handleFetchAll = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/questions');
    const data = await response.json();

    if (data.length === 0) {
      window.alert("⚠️ No questions found in the database.");
      setShowJson(false);  // 👈 hide JSON box if empty
    } else {
      setAllQuestions(data);
      setShowJson(true);   // 👈 show JSON box when data exists
    }

  } catch (err) {
    window.alert(`❌ Failed to fetch questions: ${err.message}`);
    setShowJson(false);
  }
};



const handleDeleteByJobTitle = async () => {
  if (!jobTitleToDelete.trim()) {
    window.alert("Please enter a job title before deleting questions.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8000/api/questions/${encodeURIComponent(jobTitleToDelete)}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      const errorData = await response.json();
      window.alert(`❌ Error: ${errorData.detail}`);
      return;
    }

    const data = await response.json();
    window.alert(`✅ ${data.message}`);
    
    // 👇 Refresh the list of questions after deletion
    handleFetchAll();
    
  } catch (err) {
    window.alert(`❌ Failed to delete: ${err.message}`);
  }
};


const handleFetchStats = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/stats');
    const data = await response.json();
    setStats(data);
  } catch (err) {
    window.alert(`❌ Failed to fetch stats: ${err.message}`);
  }
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

    {generatedQuestions.length > 0 && (
      <>
        <h3>Generated Questions</h3>
        <ul>
          {generatedQuestions.map((q, idx) => (
            <li key={idx}>
              <strong>{q.type}</strong>: {q.question}
            </li>
          ))}
        </ul>
      </>
    )}

    <hr />

    <h2>All Questions in DB</h2>
    <button onClick={handleFetchAll}>Fetch All</button>

    {showJson && (
      <pre
        style={{
          backgroundColor: "#f5f5f5",
          padding: "15px",
          borderRadius: "5px",
          fontFamily: "monospace",
          fontSize: "14px",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          marginTop: "15px"
        }}
      >
        {JSON.stringify(allQuestions, null, 2)}
      </pre>
    )}

    <hr />

    <h2>Delete Questions by Job Title</h2>
    <input
      type="text"
      value={jobTitleToDelete}
      onChange={(e) => setJobTitleToDelete(e.target.value)}
      placeholder="Job Title to Delete"
      style={{ marginRight: 10 }}
    />
    <button onClick={handleDeleteByJobTitle}>Delete</button>
    {deleteMessage && (
      <p style={{ color: deleteMessage.startsWith("✅") ? "green" : "red", marginTop: 10 }}>
        {deleteMessage}
      </p>
    )}

    <hr />

    <h2>Database Stats</h2>
    <button onClick={handleFetchStats}>Fetch Stats</button>

    {stats && (
      <div style={{ marginTop: 20 }}>
        <p><strong>Total Questions:</strong> {stats.total_questions}</p>

        <h4>Questions by Job Title</h4>
        <ul>
          {Object.entries(stats.by_job_title).map(([title, count]) => (
            <li key={title}>
              <strong>{title}</strong>: {count}
            </li>
          ))}
        </ul>

        <h4>Questions by Type</h4>
        <ul>
          {Object.entries(stats.by_type).map(([type, count]) => (
            <li key={type}>
              <strong>{type}</strong>: {count}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

}

export default App;
