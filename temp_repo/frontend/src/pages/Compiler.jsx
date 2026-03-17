import React, { useState } from 'react';
import api from '../api';

export default function Compiler() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRunCode = async () => {
    if (!code.trim()) return alert('Please enter some code to run.');
    setLoading(true);
    setOutput('Running...');
    try {
      const res = await api.runCode({ code, language, stdin });
      if (res.error) {
        setOutput(`Error:\n${res.error}\n\nOutput:\n${res.output || ''}`);
      } else {
        setOutput(
          `Output:\n${res.output}\n\n--- Stats ---\nTime: ${res.cpuTime}s\nMemory: ${res.memory} KB`
        );
      }
    } catch (err) {
      console.error(err);
      setOutput(`Execution failed: ${err.message || 'API Error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-6 min-h-[80vh]">
      {/* LEFT PANEL: Code Editor & Settings */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="card p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Code Playground
          </h1>
          <select
            className="bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="cpp">C++ (GCC 11)</option>
            <option value="c">C (GCC 11)</option>
            <option value="java">Java (JDK 17)</option>
            <option value="python">Python 3</option>
            <option value="javascript">Node.js</option>
          </select>
        </div>

        <div className="card p-4 flex-1 flex flex-col min-h-[400px]">
          <textarea
            className="flex-1 w-full bg-[#1e1e1e] text-gray-300 font-mono text-sm p-4 rounded-lg focus:outline-none resize-none border border-gray-800"
            placeholder={`// Write your ${language} code here...`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />
        </div>
      </div>

      {/* RIGHT PANEL: I/O and Actions */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="card p-4">
          <label className="block text-sm font-semibold muted mb-2">Custom Input (stdin)</label>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 text-gray-300 font-mono text-sm p-3 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px]"
            placeholder="Enter input for your program..."
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            spellCheck="false"
          />
        </div>

        <button
          onClick={handleRunCode}
          disabled={loading}
          className={`w-full py-4 text-lg font-bold rounded-xl shadow-lg transition-all ${
            loading
              ? 'bg-blue-800 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25 cursor-pointer'
          }`}
        >
          {loading ? 'Executing...' : 'Run Code ▶'}
        </button>

        <div className="card p-4 flex-1 flex flex-col min-h-[250px]">
          <label className="block text-sm font-semibold muted mb-2">Execution Output</label>
          <pre className="flex-1 w-full bg-black/50 border border-gray-800 text-green-400 font-mono text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {output || 'Output will appear here...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
