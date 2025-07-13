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
  // const [technicalQ, setTechnicalQ] = useState('');
  // const [behavioralQ, setBehavioralQ] = useState('');
  const [injectJobTitle, setInjectJobTitle] = useState('');
  const [techQuestion, setTechQuestion] = useState('');
  const [behavQuestion, setBehavQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteByIdMessage, setDeleteByIdMessage] = useState('');
  const [hasSaved, setHasSaved] = useState(false);


const handleGenerate = async () => {
  if (!jobTitle.trim()) {
    alert("Please enter a job title before generating questions.");
    return;
  }
  setIsLoading(true);
  setHasSaved(false);  // ✔️ Reset so new questions can be saved
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
  } finally {
    setIsLoading(false); // stop loading
  }
};

const handleSaveGeneratedQuestions = async () => {
   if (hasSaved) {
    window.alert("✅ Already saved this set. Please generate new questions to save again.");
    return;
  }

  try {
    const payload = {
      job_title: jobTitle,
      questions: generatedQuestions,
    };

    const response = await fetch('http://localhost:8000/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      window.alert(`❌ Failed to save: ${errorData.detail}`);
      return;
    }

    const data = await response.json();
    window.alert(`✅ ${data.questions.length} question(s) saved successfully!`);
 setHasSaved(true); // ✅ Prevent resaving the same generation
    // Immediately refresh DB view
    handleFetchAll();
  } catch (err) {
    window.alert(`❌ Save failed: ${err.message}`);
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


const handleDeleteById = async () => {
if (!String(deleteId).trim()) {
    alert("Please enter a question ID to delete.");
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/question/${deleteId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      window.alert(`❌ ${error.detail}`);
      return;
    }

    const data = await response.json();
    window.alert(`✅ ${data.message}`);
    handleFetchAll();
  } catch (err) {
    window.alert(`❌ ${err.message}`);
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

const handleInjectOneEach = async () => {
  if (!injectJobTitle.trim() || !techQuestion.trim() || !behavQuestion.trim()) {
    alert("Please fill all fields.");
    return;
  }

  const payload = {
    job_title: injectJobTitle,
    questions: [
      { type: 'technical', question: techQuestion },
      { type: 'behavioral', question: behavQuestion },
    ],
  };

  try {
    const response = await fetch('http://localhost:8000/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    alert("✅ Questions injected successfully!");
    setInjectJobTitle('');
    setTechQuestion('');
    setBehavQuestion('');
    // handleFetchAll();  // refresh view
  } catch (err) {
    alert(`❌ Failed to inject: ${err.message}`);
  }
};




return (
  <div style={{ padding: 20, fontFamily: 'Arial' }}>
    <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
  📌LLM-Based Interview Prep Platform v1.0
</h1>
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
    {isLoading && (
  <div style={{ marginTop: 10, color: '#555' }}>
    ⏳ Generating questions...
  </div>
)}

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
<button onClick={handleSaveGeneratedQuestions} disabled={hasSaved}>
  {hasSaved ? "✅ Saved" : "💾 Save to Database"}
</button>

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

<h2>Delete Question by ID</h2>

<input
  type="number"
  value={deleteId}
  onChange={(e) => setDeleteId(Number(e.target.value))}
  placeholder="Question ID"
  style={{ marginRight: 10 }}
/>
<button onClick={handleDeleteById}>Delete by ID</button>
{deleteByIdMessage && (
  <p style={{ color: deleteByIdMessage.startsWith("✅") ? "green" : "red", marginTop: 10 }}>
    {deleteByIdMessage}
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

  <hr />

<h2>Inject One Technical & One Behavioral Question</h2>

<input
  type="text"
  value={injectJobTitle}
  onChange={(e) => setInjectJobTitle(e.target.value)}
  placeholder="Job Title"
  style={{ marginBottom: 10, display: 'block', width: 300 }}
/>

<input
  type="text"
  value={techQuestion}
  onChange={(e) => setTechQuestion(e.target.value)}
  placeholder="Technical Question"
  style={{ marginBottom: 10, display: 'block', width: 500 }}
/>

<input
  type="text"
  value={behavQuestion}
  onChange={(e) => setBehavQuestion(e.target.value)}
  placeholder="Behavioral Question"
  style={{ marginBottom: 10, display: 'block', width: 500 }}
/>

<button onClick={handleInjectOneEach}>Inject Questions</button>






</div>
);

}

export default App;
