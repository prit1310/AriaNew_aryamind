import React, { useMemo, useState, useRef } from "react";
import {
  HomeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

function HomePage({
  mode, docTitle, setDocTitle, selectedAgent, setSelectedAgent
}) {
  const AGENTS = [
    { id: "agent1", name: "Real Estate" },
    { id: "agent2", name: "University" },
    { id: "agent3", name: "Hospital" },
  ];
  const [greeting, setGreeting] = useState("");
  const [endMessage, setEndMessage] = useState("");
  const [kbType, setKbType] = useState("");
  const [kbFile, setKbFile] = useState(null);
  const fileInputRef = useRef();

  // For test mode
  const [testAgent, setTestAgent] = useState(selectedAgent || "");
  const [testNumber, setTestNumber] = useState("");

  function handleFileChange(e) {
    setKbFile(e.target.files[0]);
  }
  function handleKbTypeChange(e) {
    setKbType(e.target.value);
    setKbFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
  function handleAgentCreate(e) {
    e.preventDefault();
    alert(
      `Agent: ${selectedAgent ? AGENTS.find(a => a.id === selectedAgent)?.name : "None"}\nGreeting: ${greeting}\nEnd Message: ${endMessage}\nKnowledge Base: ${kbType} - ${kbFile ? kbFile.name : "No file"}`
    );
  }
  function handleTestDemo(e) {
    e.preventDefault();
    alert(
      `Demo Call Initiated!\nAgent: ${testAgent ? AGENTS.find(a => a.id === testAgent)?.name : "None"}\nUser Number: ${testNumber}`
    );
  }

  // --- Build Mode ---
  if (mode === "Build") {
    return (
      <div className="flex flex-1 items-center justify-center min-h-0 md:mt-[-300px] mt-0 p-4">
        <form
          className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-lg px-2 sm:px-8 py-8 space-y-6 transition hover:shadow-xl"
          onSubmit={handleAgentCreate}
        >
          <div className="flex items-center gap-4 mb-4">
            <img
              src="/avtar.svg"
              alt="Agent"
              className="h-12 w-12 rounded-lg ring-1 ring-indigo-200 object-cover"
            />
            <div>
              <input
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                className="text-lg font-bold bg-transparent outline-none"
                placeholder="Untitled agent"
                style={{ minWidth: 0 }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Agent
            </label>
            <select
              className="w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3 text-gray-700"
              value={selectedAgent}
              onChange={e => setSelectedAgent(e.target.value)}
              required
            >
              <option value="">Choose agent</option>
              {AGENTS.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Greeting message
            </label>
            <input
              type="text"
              className="w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3 placeholder-gray-400"
              placeholder="e.g. Hello! How can I help you today?"
              value={greeting}
              onChange={e => setGreeting(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End message
            </label>
            <input
              type="text"
              className="w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3 placeholder-gray-400"
              placeholder="e.g. Thank you for chatting!"
              value={endMessage}
              onChange={e => setEndMessage(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Knowledge base
            </label>
            <select
              className="w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3 text-gray-700"
              value={kbType}
              onChange={handleKbTypeChange}
              required
            >
              <option value="">Select type</option>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
            {kbType && (
              <input
                type="file"
                accept={kbType === "pdf" ? ".pdf" : ".csv"}
                className="block w-full mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                onChange={handleFileChange}
                ref={fileInputRef}
                required
              />
            )}
            {kbFile && (
              <div className="mt-1 text-xs text-gray-600">
                Selected: {kbFile.name}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#5b3df2] text-white py-2 font-semibold text-base shadow-sm hover:bg-[#4a2edc] transition"
          >
            Create Agent
          </button>
        </form>
      </div>
    );
  }

  // --- Test Mode ---
  if (mode === "Test") {
    return (
      <div className="flex flex-1 items-center justify-center min-h-0 md:mt-[-300px] mt-0 p-4">
        <form
          className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-lg px-2 sm:px-8 py-8 space-y-6 transition hover:shadow-xl"
          onSubmit={handleTestDemo}
        >
          <div className="flex items-center gap-4 mb-4">
            <img
              src="/avtar.svg"
              alt="Agent"
              className="h-12 w-12 rounded-lg ring-1 ring-indigo-200 object-cover"
            />
            <div>
              <div className="text-lg font-bold">{docTitle}</div>
              <div className="text-xs text-gray-400">Test a demo call with your agent</div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Agent
            </label>
            <select
              className="w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3 text-gray-700"
              value={testAgent}
              onChange={e => setTestAgent(e.target.value)}
              required
            >
              <option value="">Choose agent</option>
              {AGENTS.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your phone number
            </label>
            <input
              type="tel"
              className="w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3 placeholder-gray-400"
              placeholder="e.g. +1234567890"
              value={testNumber}
              onChange={e => setTestNumber(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#5b3df2] text-white py-2 font-semibold text-base shadow-sm hover:bg-[#4a2edc] transition"
          >
            Initiate Demo Call
          </button>
        </form>
      </div>
    );
  }

  return null;
}

// Placeholder pages
function TemplatePage({ activeTab, setActiveTab }) {
  const pdfTemplatesList = [
    {
      title: "Real Estate",
      description: "For Real Estate companies",
      file: "RealEstateTemplate.pdf"
    },
    {
      title: "Education",
      description: "For Education",
      file: "EducationTemplate.pdf"
    },
  ];
  const csvTemplatesList = [
    {
      title: "Client Contact Info",
      description: "For client contact information",
      file: "Client_Contact_Info.csv"
    },
  ];

  const handleTemplatePreview = async (type, templateName, file) => {
    try {
      Swal.fire({
        title: 'Generating preview...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const res = await fetch('/api/template-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, templateName, file, mode: 'preview' }),
      });
      if (!res.ok) {
        let errorMsg = 'Preview failed';
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch { }
        Swal.fire({ icon: 'error', title: errorMsg });
        return;
      }
      const data = await res.json();
      Swal.close();
      if (data.url) {
        if (type === 'csv') {
          window.open(`/csv-viewer?url=${encodeURIComponent(data.url)}&name=${encodeURIComponent(templateName)}`, '_blank');
        } else {
          window.open(`/pdf-viewer?url=${encodeURIComponent(data.url)}&name=${encodeURIComponent(templateName)}`, '_blank');
        }
      } else {
        Swal.fire({ icon: 'error', title: 'Preview URL not found' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: err.message || 'Preview failed' });
    }
  };

  // Helper function for download
  const handleTemplateDownload = async (type, templateName, file) => {
    try {
      Swal.fire({
        title: 'Preparing download...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const res = await fetch('/api/template-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, templateName, file, mode: 'download' }),
      });
      if (!res.ok) {
        let errorMsg = 'Download failed';
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch { }
        Swal.fire({ icon: 'error', title: errorMsg });
        return;
      }
      const disposition = res.headers.get('Content-Disposition');
      let filename = file || (templateName.replace(/\s+/g, '_') + (type === 'pdf' ? '.pdf' : '.csv'));
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/"/g, '');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      Swal.fire({ icon: 'success', title: 'Download started!' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: err.message || 'Download failed' });
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center min-h-0 md:mt-[-300px] mt-0 p-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-lg px-2 sm:px-8 py-8 space-y-6 transition hover:shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Templates & Formats</h1>
        <p className="mb-4 text-gray-500 text-sm">
          Download ready-to-use templates, fill them as needed, and upload back to automate your workflow.
        </p>
        {/* Tab Navigation */}
        <div className="flex w-full bg-gray-100 rounded-lg overflow-hidden gap-2 p-1 mb-8">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`w-1/2 py-2 rounded-lg flex items-center justify-center gap-2 border transition
              ${activeTab === 'pdf'
                ? 'border-indigo-500 text-indigo-700 bg-white shadow'
                : 'border-transparent text-gray-700'
              }
              hover:border-indigo-400 hover:text-indigo-700`
            }
          >
            PDF Templates
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`w-1/2 py-2 rounded-lg flex items-center justify-center gap-2 border transition
              ${activeTab === 'csv'
                ? 'border-indigo-500 text-indigo-700 bg-white shadow'
                : 'border-transparent text-gray-700'
              }
              hover:border-indigo-400 hover:text-indigo-700`
            }
          >
            CSV Templates
          </button>
        </div>
        {/* Template Content */}
        <div className="space-y-4">
          {(activeTab === 'pdf' ? pdfTemplatesList : csvTemplatesList).map((template, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <img
                  src={activeTab === 'pdf' ? "/pdf.png" : "/csv.png"}
                  alt={activeTab === 'pdf' ? "PDF" : "CSV"}
                  className="w-12 h-12"
                />
                <div>
                  <div className="font-semibold text-gray-900">{template.title}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => handleTemplatePreview(activeTab, template.title, template.file)}
                  className="text-indigo-600 hover:underline text-xs"
                >
                  Preview
                </button>
                <button
                  onClick={() => handleTemplateDownload(activeTab, template.title, template.file)}
                  className="flex items-center text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded px-3 py-1"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  return <div className="p-8 text-lg text-gray-600">⚙️ Settings Page Content</div>;
}

export default function Dashboard() {
  const [activePage, setActivePage] = useState("home");
  const [mode, setMode] = useState("Build");
  const [docTitle, setDocTitle] = useState("Untitled agent");
  const [markdown, setMarkdown] = useState(true);
  const [editor, setEditor] = useState("Write instructions or ‘/’ for tools and more…");
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [activeTab, setActiveTab] = useState('pdf');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tokenCount = useMemo(
    () => editor.trim().split(/\s+/).filter(Boolean).length,
    [editor]
  );

  async function onInvent() {
    if (running) return;
    setRunning(true);
    setLog((l) => [
      ...l,
      "Running in " + mode + "…",
    ]);
    await new Promise((r) => setTimeout(r, 900));
    setLog((l) => [
      ...l,
      "Tokens: ~" + tokenCount,
      "Preview: " + editor.slice(0, 240) + (editor.length > 240 ? "…" : ""),
      "Done ✅",
    ]);
    setRunning(false);
  }

  function handleNav(page) {
    setActivePage(page);
    setMobileMenuOpen(false);
  }

  // Render the correct main page
  function renderMain() {
    switch (activePage) {
      case "home":
        return (
          <HomePage
            mode={mode}
            setMode={setMode}
            docTitle={docTitle}
            setDocTitle={setDocTitle}
            markdown={markdown}
            setMarkdown={setMarkdown}
            editor={editor}
            setEditor={setEditor}
            running={running}
            onInvent={onInvent}
            log={log}
            tokenCount={tokenCount}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
          />
        );
      case "template":
        return <TemplatePage
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />;
      case "settings":
        return <SettingsPage />;
      default:
        return <div className="p-8">Not found</div>;
    }
  }

  // Mode toggle (used both on mobile and desktop)
  const ModeToggle = () => (
    <div className="flex items-center gap-1 rounded-full border border-gray-200 p-1 bg-white shadow-sm">
      <button
        type="button"
        className={
          "rounded-full px-4 py-1 text-sm transition " +
          (mode === "Build"
            ? "bg-gray-900 text-white font-semibold"
            : "font-medium text-gray-600 hover:bg-gray-50")
        }
        onClick={() => setMode("Build")}
      >
        Build
      </button>
      <button
        type="button"
        className={
          "rounded-full px-4 py-1 text-sm transition " +
          (mode === "Test"
            ? "bg-gray-900 text-white font-semibold"
            : "font-medium text-gray-600 hover:bg-gray-50")
        }
        onClick={() => setMode("Test")}
      >
        Test
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 flex min-w-0 w-full overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-16 border-r border-gray-200 bg-white py-4 items-center flex-shrink-0">
        <a href="/" className="block w-8 h-8 rounded-lg mb-6 cursor-pointer transition" title="Go to Home">
          <img
            src="/icon.png"
            alt="Agent"
            className="w-8 h-8 rounded-lg"
          />
        </a>
        <div className="flex flex-col gap-4">
          <button
            className={`h-9 w-9 flex items-center justify-center rounded-lg ${activePage === "home" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 hover:bg-gray-200"}`}
            title="Home"
            onClick={() => handleNav("home")}
          >
            <HomeIcon className="h-5 w-5" />
          </button>
          <button
            className={`h-9 w-9 flex items-center justify-center rounded-lg ${activePage === "template" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 hover:bg-gray-200"}`}
            title="Template"
            onClick={() => handleNav("template")}
          >
            <DocumentTextIcon className="h-5 w-5" />
          </button>
          <button
            className={`h-9 w-9 flex items-center justify-center rounded-lg ${activePage === "settings" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 hover:bg-gray-200"}`}
            title="Settings"
            onClick={() => handleNav("settings")}
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white min-w-0 w-full">
          <div className="px-2 sm:px-8 py-3 w-full">
            {/* Mobile: top row (title left, hamburger right) */}
            <div className="md:hidden flex items-center justify-between w-full">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/avtar.svg"
                  alt="Agent"
                  className="h-8 w-8 rounded-lg ring-1 ring-indigo-200"
                />
                <input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="bg-transparent text-base font-semibold outline-none truncate w-44"
                />
              </div>
              <button
                className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile: second row -> centered toggle */}
            {activePage === "home" && (
              <div className="md:hidden mt-2 flex justify-center">
                <ModeToggle />
              </div>
            )}

            {/* Desktop: single row (left title, center toggle, right spacer) */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/avtar.svg"
                  alt="Agent"
                  className="h-8 w-8 rounded-lg ring-1 ring-indigo-200"
                />
                <input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-[200px] bg-transparent text-sm font-semibold outline-none"
                />
              </div>

              <div className="flex-1 flex justify-center ml-[-200px]">
                {activePage === "home" ? <ModeToggle /> : <div />}
              </div>

              <div className="w-8" />
            </div>
          </div>
        </header>

        {/* Mobile Drawer Menu */}
        <div className={`fixed inset-0 z-50 md:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!mobileMenuOpen}>
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className={`absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 transform transition-transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <a href="/" className="block w-8 h-8 rounded-lg mb-6 cursor-pointer transition" title="Go to Home">
                  <img
                    src="/icon.png"
                    alt="Agent"
                    className="w-8 h-8 rounded-lg"
                  />
                </a>
              </div>
              <button
                className="p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-2">
              <button
                onClick={() => handleNav("home")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activePage === "home" ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
              >
                <HomeIcon className="h-5 w-5" />
                Home
              </button>
              <button
                onClick={() => handleNav("template")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activePage === "template" ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
              >
                <DocumentTextIcon className="h-5 w-5" />
                Templates
              </button>
              <button
                onClick={() => handleNav("settings")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activePage === "settings" ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
              >
                <Cog6ToothIcon className="h-5 w-5" />
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-1 min-w-0 w-full overflow-x-hidden">
          <main className="flex-1 flex min-h-0 min-w-0 w-full">
            {renderMain()}
          </main>
        </div>
      </div>
    </div>
  );
}