import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import {
  HomeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  Bars3Icon,
  XMarkIcon,
  Squares2X2Icon,
  CreditCardIcon,
  DocumentChartBarIcon,
  PhoneIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import BillingHistory from "@/components/BillingHistory";

function HomePage({
  mode, docTitle, setDocTitle, selectedAgent, setSelectedAgent
}) {
  const AGENTS = [
    { id: "agent1", name: "Real Estate" },
    { id: "agent2", name: "University" },
    { id: "agent3", name: "Hospital" },
  ];
  const { data: session } = useSession();
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
  const handleAgentCreate = async (e) => {
    e.preventDefault();
  
    // Validate form fields
    if (!docTitle || !selectedAgent || !greeting || !endMessage || !kbType || !kbFile) {
      Swal.fire({ icon: "error", title: "Please fill in all required fields" });
      return;
    }
    if (!session || !session.user?.email) {
      Swal.fire({ icon: "error", title: "You must be logged in to upload." });
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("file", kbFile, kbFile.name);
      formData.append("fileType", kbType);
      formData.append("category", selectedAgent);
      formData.append("greetingMessage", greeting);
      formData.append("endMessage", endMessage);
      formData.append("docTitle", docTitle);
  
      // Debug: log FormData keys
      for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }
  
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
  
      Swal.fire({ icon: "success", title: "Agent created and file uploaded successfully!" });
      // Optionally reset form here
      setGreeting("");
      setEndMessage("");
      setKbType("");
      setKbFile(null);
      setSelectedAgent("");
      setDocTitle("Untitled agent");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      Swal.fire({ icon: "error", title: err.message || "Upload failed" });
    }
  };
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

function SettingsPage({
  activeSection,
  setActiveSection,
  profileData = {},
  profileLoading = false,
  profileError = "",
  isEditing = false,
  isGoogleUser = false,
  updatingProfile = false,
  editFormData = {},
  handleEditToggle = () => { },
  handleEditFormChange = () => { },
  handleProfileUpdate = () => { },
  updateError = "",
  passwordError = "",
  passwordForm = {},
  handlePasswordFormChange = () => { },
  handlePasswordChange = () => { },
  changingPassword = false,
  showPasswords = {},
  togglePasswordVisibility = () => { },
  dbUserId = "",
  BillingHistory = () => <div>Billing history goes here</div>,
}) {
  // Sidebar items
  const sidebarItems = [
    { key: "profile", label: "Profile", icon: UserIcon },
    { key: "billing", label: "Billing History", icon: CreditCardIcon },
    { key: "security", label: "Security", icon: ShieldCheckIcon },
    { key: "settings", label: "Settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="flex flex-col sm:flex-row w-full max-w-4xl mx-auto bg-transparent my-8 mt-24">
      {/* Sidebar */}
      <aside className="sm:w-56 w-full sm:h-auto border sm:border border-blue-100 bg-blue-50 rounded-t-2xl sm:rounded-2xl flex sm:flex-col flex-row p-2 sm:p-4">
        {sidebarItems.map(item => (
          <button
            key={item.key}
            onClick={() => setActiveSection(item.key)}
            className={`
        flex flex-nowrap items-center gap-3 w-full px-4 py-2 sm:py-3 text-left transition font-medium
        rounded-lg
        ${activeSection === item.key
                ? "bg-white text-blue-700 shadow-sm"
                : "text-blue-700 hover:bg-blue-100"
              }
      `}
            style={{
              boxShadow: activeSection === item.key ? "0 2px 8px 0 rgba(0,0,0,0.04)" : undefined,
              border: "none"
            }}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10">
        {activeSection === "profile" && (
          <div>
            <h1 className="text-2xl font-bold text-blue-700 mb-1">Profile</h1>
            <p className="text-gray-500 text-sm mb-6">Customize your account details.</p>
            {/* Profile form */}
            {profileError && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-md text-red-600">
                {profileError}
              </div>
            )}
            {updateError && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-md text-red-600">
                {updateError}
              </div>
            )}
            {profileLoading ? (
              <div className="space-y-6">
                <div className="animate-pulse h-4 bg-blue-100 rounded w-24 mb-2"></div>
                <div className="animate-pulse h-10 bg-blue-100 rounded"></div>
              </div>
            ) : (
              <form className="space-y-6">
                <div>
                  <label className="block text-blue-700 text-sm mb-1">Full Name</label>
                  <input
                    type="text"
                    className={`w-full bg-blue-50 border border-blue-100 rounded-md px-4 py-2 text-blue-900 focus:outline-none focus:border-blue-400 ${isGoogleUser ? 'cursor-not-allowed opacity-60 bg-gray-100' : ''}`}
                    placeholder="John Doe"
                    value={isEditing ? editFormData.name : (profileData.name || '')}
                    onChange={(e) => isEditing && handleEditFormChange('name', e.target.value)}
                    readOnly={!isEditing || isGoogleUser}
                  />
                </div>
                <div>
                  <label className="block text-blue-700 text-sm mb-1">Email Address</label>
                  <input
                    type="email"
                    className={`w-full bg-blue-50 border border-blue-100 rounded-md px-4 py-2 text-blue-900 focus:outline-none focus:border-blue-400 ${isGoogleUser ? 'cursor-not-allowed opacity-60 bg-gray-100' : ''}`}
                    placeholder="johndoe@example.com"
                    value={isEditing ? editFormData.email : (profileData.email || '')}
                    onChange={(e) => isEditing && handleEditFormChange('email', e.target.value)}
                    readOnly={!isEditing || isGoogleUser}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    disabled={updatingProfile}
                    className="px-4 py-2 border border-blue-600 text-blue-700 rounded-md hover:bg-blue-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleProfileUpdate}
                      disabled={updatingProfile}
                      className="px-4 py-2 border border-blue-600 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {activeSection === "billing" && (
          <div>
            <h1 className="text-2xl font-bold text-blue-700 mb-1">Billing History</h1>
            <p className="text-gray-500 text-sm mb-6">View your past invoices and payments.</p>
            {dbUserId ? (
              <BillingHistory userId={dbUserId} />
            ) : (
              <p className="text-blue-700">Loading user data...</p>
            )}
          </div>
        )}

        {activeSection === "security" && (
          <div>
            <h1 className="text-2xl font-bold text-blue-700 mb-1">Security</h1>
            <p className="text-gray-500 text-sm mb-6">Change your password and manage security settings.</p>
            {passwordError && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-md text-red-600">
                {passwordError}
              </div>
            )}
            <form className="space-y-6" onSubmit={e => { e.preventDefault(); handlePasswordChange(); }}>
              <div>
                <label className="block text-blue-700 text-sm mb-1">Current Password</label>
                <input
                  type={showPasswords.current ? "text" : "password"}
                  className="w-full bg-blue-50 border border-blue-100 rounded-md px-4 py-2 text-blue-900 focus:outline-none focus:border-blue-400"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                  placeholder="******"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={changingPassword || !passwordForm.currentPassword}
                className="px-4 py-2 border border-blue-600 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword ? 'Sending OTP...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {activeSection === "settings" && (
          <div>
            <h1 className="text-2xl font-bold text-blue-700 mb-1">Settings</h1>
            <p className="text-gray-500 text-sm mb-6">Other account settings.</p>
            {/* Add more settings here */}
          </div>
        )}
      </main>
    </div>
  );
}

function ActivitylogsPage({
  activitySearch, setActivitySearch,
  activityPage, setActivityPage,
  activityTotalPages,
  activitySortOpen, setActivitySortOpen,
  paginatedActivityLogs,
  callSortOpen, setCallSortOpen,
  activitySortLabel, sortOptions,
  handleDownloadActivityLogs
}) {
  const activitySortRef = useRef(null);

  return (
    <div className="flex flex-1 items-center justify-center md:mt-[-100px] mt-0 min-h-0 p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-2xl md:max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-lg px-2 sm:px-6 py-6 sm:py-8 space-y-6 mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex items-center gap-2">
            <DocumentChartBarIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Activity Logs</h2>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            Track every action taken inside your workspace — from uploads and downloads to account changes and file processing.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          {/* Search Bar */}
          <div className="relative w-full">
            <input
              type="text"
              value={activitySearch}
              onChange={e => setActivitySearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Search logs..."
            />
            <span className="absolute left-3 top-2.5 text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
          </div>
          {/* Sort Dropdown */}
          <div className="flex flex-row gap-2">
            <div className="relative flex-1" ref={activitySortRef}>
              <button
                className="w-full flex items-center justify-between border border-blue-100 text-blue-700 bg-white px-3 py-2 rounded-lg text-xs font-medium hover:border-blue-400 transition-colors"
                onClick={() => {
                  setActivitySortOpen((open) => !open);
                  setCallSortOpen(false);
                }}
                type="button"
              >
                {activitySortLabel}
                <svg
                  className={`w-4 h-4 ml-2 text-blue-400 transition-transform ${activitySortOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activitySortOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-blue-100 rounded-lg shadow-lg z-50">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      className={`block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 ${activitySortLabel === option ? "bg-blue-50" : ""}`}
                      onClick={() => {
                        setActivitySortLabel(option);
                        setActivitySortOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Download Button */}
            <button
              className="flex-1 flex items-center justify-center text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-200 rounded-lg px-2 py-2 transition"
              onClick={handleDownloadActivityLogs}
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Download
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white w-full">
          <table className="w-full min-w-[350px] divide-y divide-blue-100 text-xs sm:text-sm">
            <thead className="bg-blue-50 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-blue-500 uppercase">No</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-blue-500 uppercase">Activity</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-blue-500 uppercase">Time</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-blue-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {paginatedActivityLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-blue-400 py-6">
                    No activity log
                  </td>
                </tr>
              ) : (
                paginatedActivityLogs.map((log) => (
                  <tr key={log.no} className="hover:bg-blue-50">
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-mono">{log.no}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">{log.activity}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">{log.timestamp}</td>
                    <td
                      className={`px-2 py-2 whitespace-nowrap text-xs font-medium ${log.completed ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {log.completed ? '✔ Completed' : '✘ Cancelled'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-3 gap-2">
          <button
            className="px-2 py-1 rounded border border-blue-200 text-blue-700 disabled:opacity-50"
            onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
            disabled={activityPage === 1}
          >
            Previous
          </button>
          {[...Array(activityTotalPages)].map((_, idx) => (
            <button
              key={idx}
              className={`px-2 py-1 rounded border ${activityPage === idx + 1 ? 'border-blue-600 text-blue-700 bg-blue-100' : 'border-blue-200 text-blue-700'}`}
              onClick={() => setActivityPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="px-2 py-1 rounded border border-blue-200 text-blue-700 disabled:opacity-50"
            onClick={() => setActivityPage((p) => Math.min(activityTotalPages, p + 1))}
            disabled={activityPage === activityTotalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function CallLogsPage({
  callSearch, setCallSearch,
  callPage, setCallPage,
  callTotalPages,
  callSortOpen, setCallSortOpen,
  paginatedCallLogGroups,
  activitySortOpen, setActivitySortOpen,
  callSortLabel, setCallSortLabel,
  sortOptions,
  handleDownloadCallLogs,
  handleOpenTranscriptModal,
  callLogsLoading,
  callLogsError,
  callItemsPerPage,
}) {
  const callSortRef = useRef(null);

  return (
    <div className="flex flex-1 items-center justify-center md:mt-[-100px] mt-0 min-h-0 p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-2xl md:max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-lg px-2 sm:px-6 py-6 sm:py-8 space-y-6 mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex items-center gap-2">
            <DocumentChartBarIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Call Logs</h2>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            A full view of AI-powered outbound calls made using your uploaded CSVs or campaigns. Monitor performance, transcript access, and call status.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          {/* Search Bar */}
          <div className="relative w-full">
            <input
              type="text"
              value={callSearch}
              onChange={e => setCallSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Search logs..."
            />
            <span className="absolute left-3 top-2.5 text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
          </div>
          {/* Sort Dropdown and Download */}
          <div className="flex flex-row gap-2">
            <div className="relative flex-1" ref={callSortRef}>
              <button
                className="w-full flex items-center justify-between border border-blue-100 text-blue-700 bg-white px-3 py-2 rounded-lg text-xs font-medium hover:border-blue-400 transition-colors"
                onClick={() => {
                  setCallSortOpen((open) => !open);
                  setActivitySortOpen(false);
                }}
                type="button"
              >
                {callSortLabel}
                <svg
                  className={`w-4 h-4 ml-2 text-blue-400 transition-transform ${callSortOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {callSortOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-blue-100 rounded-lg shadow-lg z-50">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      className={`block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 ${callSortLabel === option ? "bg-blue-50" : ""}`}
                      onClick={() => {
                        setCallSortLabel(option);
                        setCallSortOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="flex-1 flex items-center justify-center text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-200 rounded-lg px-2 py-2 transition"
              onClick={handleDownloadCallLogs}
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Download
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white w-full">
          <table className="w-full min-w-[500px] divide-y divide-blue-100 text-xs sm:text-sm">
            <thead className="bg-blue-50 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-blue-500 uppercase">No</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-blue-500 uppercase">Agent</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-blue-500 uppercase">Recipient</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-blue-500 uppercase">Timestamp</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-blue-500 uppercase">Status</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-blue-500 uppercase">Duration</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-blue-500 uppercase">Transcript</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold text-blue-500 uppercase">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {callLogsLoading ? (
                <tr><td colSpan={8} className="text-center text-blue-400 py-6">Loading...</td></tr>
              ) : callLogsError ? (
                <tr><td colSpan={8} className="text-center text-red-400 py-6">{callLogsError}</td></tr>
              ) : paginatedCallLogGroups.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-blue-400 py-6">No call log</td></tr>
              ) : (
                paginatedCallLogGroups.map((group, groupIdx) => {
                  const firstLog = group.logs[0];
                  const lastLog = group.logs[group.logs.length - 1];
                  const recipient = firstLog?.toNumber || '-';
                  const formattedStart = firstLog?.timestamp && new Date(firstLog.timestamp).toString() !== 'Invalid Date' ? new Date(firstLog.timestamp).toLocaleString() : '-';
                  const formattedEnd = lastLog?.timestamp && new Date(lastLog.timestamp).toString() !== 'Invalid Date' ? new Date(lastLog.timestamp).toLocaleString() : '-';
                  let durationDisplay = '-';
                  if (typeof firstLog?.duration === 'number') {
                    const min = Math.floor(firstLog.duration / 60);
                    const sec = firstLog.duration % 60;
                    durationDisplay = `${min > 0 ? min + 'm ' : ''}${sec}s`;
                  }
                  return (
                    <tr key={group.callSid || groupIdx} className="hover:bg-blue-50">
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-mono">{(callPage - 1) * callItemsPerPage + groupIdx + 1}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">{firstLog?.agent || '-'}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">{recipient}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">{formattedStart} - {formattedEnd}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">✔ Completed</td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">{durationDisplay}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">
                        <button
                          className="text-blue-600 underline hover:text-blue-800 transition"
                          onClick={() => handleOpenTranscriptModal(group)}
                          type="button"
                        >
                          View Transcript
                        </button>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">
                        <button
                          className="flex items-center gap-1 text-blue-700 hover:text-blue-900 text-xs font-normal px-0 py-0 bg-transparent shadow-none"
                          onClick={() => handleDownloadCallLogs(group)}
                          type="button"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          Download
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-3 gap-2">
          <button
            className="px-2 py-1 rounded border border-blue-200 text-blue-700 disabled:opacity-50"
            onClick={() => setCallPage((p) => Math.max(1, p - 1))}
            disabled={callPage === 1}
          >
            Previous
          </button>
          {[...Array(callTotalPages)].map((_, idx) => (
            <button
              key={idx}
              className={`px-2 py-1 rounded border ${callPage === idx + 1 ? 'border-blue-600 text-blue-700 bg-blue-100' : 'border-blue-200 text-blue-700'}`}
              onClick={() => setCallPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="px-2 py-1 rounded border border-blue-200 text-blue-700 disabled:opacity-50"
            onClick={() => setCallPage((p) => Math.min(callTotalPages, p + 1))}
            disabled={callPage === callTotalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function UpgradeplanPage({
  planError, setPlanError, currentPlan, setCurrentPlan,
  upgradeError, isActivePlan, setUpgradeError,
  loadingPlan, setLoadingPlan, billing, setBilling,
  upgrading, setUpgrading, plans, session, sessionStatus,
  fetchCurrentPlan
}) {
  return (
    <div className="flex flex-1 items-center justify-center min-h-0 p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-lg px-2 sm:px-8 py-8 space-y-8 mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CreditCardIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">Upgrade Plan</h2>
          </div>
          <p className="text-center text-gray-500 text-base sm:text-lg">
            Three different subscriptions to match your company's needs.
          </p>
        </div>

        {/* Plan error/loading */}
        {planError && <div className="text-center text-red-500 mb-2">{planError}</div>}
        {upgradeError && <div className="text-center text-red-500 mb-2">{upgradeError}</div>}
        {loadingPlan && <div className="text-center text-blue-500 mb-2">Loading your plan...</div>}
        {currentPlan && currentPlan.expiresAt && !planError && (
          <div className="text-center text-xs text-gray-400 mb-2">
            Plan expires on: {new Date(currentPlan.expiresAt).toLocaleDateString()}
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex w-full max-w-xs mx-auto bg-blue-50 rounded-lg overflow-hidden gap-2 p-1 mb-8">
          <button
            onClick={() => setBilling('monthly')}
            className={`w-1/2 py-2 rounded-lg flex items-center justify-center gap-2 border transition font-semibold
              ${billing === 'monthly'
                ? 'border-blue-600 bg-blue-600 text-white shadow'
                : 'border-transparent text-blue-700 bg-white'
              }
              hover:border-blue-400 hover:text-blue-800`}
            disabled={upgrading}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annually')}
            className={`w-1/2 py-2 rounded-lg flex items-center justify-center gap-2 border transition font-semibold
              ${billing === 'annually'
                ? 'border-blue-600 bg-blue-600 text-white shadow'
                : 'border-transparent text-blue-700 bg-white'
              }
              hover:border-blue-400 hover:text-blue-800`}
            disabled={upgrading}
          >
            Annually <span className="hidden sm:inline">(-20%)</span>
          </button>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const planOrder = { 'Basic': 1, 'Professional': 2, 'Advanced Plan': 3 };
            const active = isActivePlan(plan);
            const isDowngrade = currentPlan && planOrder[plan.name] < planOrder[currentPlan.name];
            // Expiry logic for upgrade
            const getNewExpiry = () => {
              let expiresAt;
              const now = new Date();
              if (currentPlan && currentPlan.expiresAt && new Date(currentPlan.expiresAt) > now) {
                expiresAt = new Date(currentPlan.expiresAt);
              } else {
                expiresAt = now;
              }
              if (billing === 'monthly') {
                expiresAt.setMonth(expiresAt.getMonth() + 1);
              } else {
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
              }
              return expiresAt;
            };
            // Button click handler
            const onUpgradeClick = async () => {
              if (sessionStatus === "unauthenticated" || !session) {
                router.push('/auth');
                return;
              }
              if (active) {
                Swal.fire({ icon: 'info', title: 'You are already on this plan.' });
                return;
              }
              if (isDowngrade) {
                const result = await Swal.fire({
                  icon: 'warning',
                  title: 'Are you sure?',
                  text: 'You are about to downgrade your plan. Some features may be lost.',
                  showCancelButton: true,
                  confirmButtonText: 'Yes, downgrade',
                  cancelButtonText: 'Cancel'
                });
                if (!result.isConfirmed) return;
              }
              setUpgrading(true);
              setUpgradeError(null);
              try {
                const expiresAt = getNewExpiry();
                const res = await fetch('/api/upgrade-plan', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: plan.name,
                    type: plan.name,
                    billing,
                    price: billing === 'monthly' ? plan.monthly : plan.annually,
                    expiresAt: expiresAt.toISOString(),
                  }),
                  credentials: 'include',
                });
                if (!res.ok) throw new Error('Failed to upgrade');
                // Always re-fetch the plan after upgrade to ensure latest data
                await fetchCurrentPlan();
                setUpgradeError(null);
                setPlanError(null);
                Swal.fire({ icon: 'success', title: 'Plan updated successfully!' });
              } catch (err) {
                setUpgradeError('Failed to update plan. Please try again.');
                Swal.fire({ icon: 'error', title: 'Failed to update plan.' });
              }
              setUpgrading(false);
            };
            return (
              <div
                key={index}
                className={`flex flex-col justify-between border rounded-xl p-6 bg-blue-50 shadow-sm
                  ${active ? 'border-blue-600 ring-2 ring-blue-200' : 'border-blue-100 hover:border-blue-400'}
                  transition`}
              >
                {plan.popular && (
                  <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full absolute top-4 right-4 shadow">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold text-blue-900 mb-1">
                    ${billing === 'monthly' ? plan.monthly : plan.annually}
                    <span className="text-base font-normal text-blue-500 ml-1">
                      /{billing === 'monthly' ? 'month' : 'year'}
                    </span>
                  </p>
                  <p className="text-blue-700 font-normal mb-4 text-sm">{plan.description}</p>
                  <ul className="text-blue-700 text-sm list-disc pl-5 mb-6 space-y-1">
                    {plan.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <button
                  className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition
                    ${active
                      ? 'bg-blue-200 text-blue-700 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  disabled={active || upgrading}
                  onClick={onUpgradeClick}
                >
                  {active ? (
                    <>
                      <svg className="w-5 h-5 mr-1 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Current Plan
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="w-5 h-5" />
                      {plan.button}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OverviewPage({
  displayName,
  currentPlan,
  metricsError,
  planLimits,
  storageLimits,
  metrics,
  metricsLoading,
  paginatedActivityLogs,
  paginatedCallLogGroups,
  callLogsLoading,
  callLogsError,
  activitySortOpen,
  setActivitySortOpen,
  callSortOpen,
  setCallSortOpen,
  activitySortLabel,
  setActivitySortLabel,
  callSortLabel,
  setCallSortLabel,
  sortOptions,
  activeSection,
  setActiveSection,
  handleDownloadActivityLogs,
  handleDownloadCallLogs,
  handleOpenTranscriptModal,
  callPage,
  callItemsPerPage,
  handleNav,
}) {
  const activitySortRef = useRef();
  const callSortRef = useRef();

  return (
    <div className="flex flex-1 items-center justify-center min-h-0 p-2 sm:p-4 mt-14">
      <div className="w-full max-w-sm sm:max-w-2xl md:max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-lg px-2 sm:px-6 py-4 sm:py-8 space-y-8 transition hover:shadow-xl mx-auto">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-xl mb-6 bg-blue-600">
          <div className="relative z-10 p-4 sm:p-8 flex flex-col gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 truncate drop-shadow">
              Welcome {displayName}!
            </h1>
            <p className="text-blue-100 text-[14px] sm:text-[16px] mb-2" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
              You're currently on the{" "}
              <span className="font-bold text-white underline underline-offset-2">
                {currentPlan?.name ? currentPlan.name.toUpperCase() : "NO"}
              </span>{" "}
              plan — explore your usage insights and manage your files easily.
            </p>
            <button
              onClick={() => handleNav("upgradeplan")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-[15px] uppercase font-semibold text-white bg-blue-700 hover:bg-blue-800 border border-blue-200 px-4 py-2 rounded-[8px] transition shadow"
            >
              <CreditCardIcon className="w-5 h-5" />
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Metrics Section */}
        <div>
          <h2 className="text-lg sm:text-2xl text-blue-900 font-semibold mb-4">Metrics</h2>
          {metricsError && (
            <div className="text-red-400">{metricsError}</div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
            {(() => {
              const plan = currentPlan?.name;
              const limits = planLimits[plan] || {};
              const storageLimit = storageLimits[plan] || 0;
              const usedMB = metrics.totalUploadedFileSize / (1024 * 1024);
              const totalMB = storageLimit / (1024 * 1024);
              return [
                { label: "PDF Uploads", value: metrics.pdfUploadCount, total: limits.pdfUpload || "-" },
                { label: "PDF Downloads", value: metrics.pdfDownloadCount, total: limits.pdfDownload || "-" },
                { label: "CSV Uploads", value: metrics.csvUploadCount, total: limits.csvUpload || "-" },
                { label: "CSV Downloads", value: metrics.csvDownloadCount, total: limits.csvDownload || "-" },
                { label: "Storage Used", value: `${usedMB.toFixed(2)}`, total: storageLimit ? `${totalMB.toFixed(0)} MB` : "-" },
              ];
            })().map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm min-h-[90px] w-full"
              >
                <h3 className="text-[15px] font-medium text-blue-700 mb-1">{item.label}</h3>
                <p className="text-xl font-bold text-blue-900">
                  {metricsLoading ? (
                    <span className="opacity-50 animate-pulse">...</span>
                  ) : (
                    item.value
                  )}
                  <span className="text-base font-normal opacity-70 ml-1">/{item.total}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Logs Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-4 w-full gap-2">
            <div className="text-lg sm:text-xl text-blue-900 font-semibold whitespace-nowrap truncate">Activity Logs</div>
            <div className="flex flex-row items-center gap-2 sm:gap-3 ml-auto">
              <div className="relative" ref={activitySortRef}>
                <button
                  className="flex items-center border border-blue-200 text-blue-700 bg-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:border-blue-400 transition-colors h-[39px] min-w-[90px] justify-center"
                  onClick={() => {
                    setActivitySortOpen((open) => !open);
                    setCallSortOpen(false);
                  }}
                  type="button"
                >
                  {activitySortLabel}
                  <svg
                    className={`w-4 h-4 ml-2 text-blue-400 transition-transform ${activitySortOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activitySortOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-blue-100 rounded-lg shadow-lg z-50">
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        className={`block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 ${activitySortLabel === option ? "bg-blue-50" : ""}`}
                        onClick={() => {
                          setActivitySortLabel(option);
                          setActivitySortOpen(false);
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="flex items-center text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-200 rounded-lg px-2 sm:px-3 py-1.5 w-[39px] sm:w-auto h-[39px] justify-center transition"
                onClick={handleDownloadActivityLogs}
              >
                <span className="hidden sm:inline">Download Logs</span>
                <ArrowDownTrayIcon className="w-4 h-4 sm:ml-2" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white w-full">
            <table className="w-full min-w-[400px] divide-y divide-blue-100 text-xs sm:text-sm">
              <thead className="bg-blue-50 sticky top-0 z-10">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-blue-500 uppercase">No</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-blue-500 uppercase">Activity Type</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-blue-500 uppercase">Timestamp</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-blue-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {paginatedActivityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-blue-400 py-6">
                      No activity log
                    </td>
                  </tr>
                ) : (
                  paginatedActivityLogs.map((log) => (
                    <tr key={log.no} className="hover:bg-blue-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm font-mono">{log.no}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm">{log.activity}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm">{log.timestamp}</td>
                      <td
                        className={`px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm font-medium ${log.completed ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {log.completed ? '✔ Completed' : '✘ Cancelled'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right">
            <button
              className="text-sm text-blue-600 hover:text-blue-900 underline"
              onClick={() => handleNav("activitylogs")}
            >
              view all
            </button>
          </div>
        </div>

        {/* Call Logs Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-4 w-full gap-2">
            <div className="text-lg sm:text-xl text-blue-900 font-semibold whitespace-nowrap truncate">Call Logs</div>
            <div className="flex flex-row items-center gap-2 sm:gap-3 ml-auto">
              <div className="relative" ref={callSortRef}>
                <button
                  className="flex items-center border border-blue-200 text-blue-700 bg-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:border-blue-400 transition-colors h-[39px] min-w-[90px] justify-center"
                  onClick={() => {
                    setCallSortOpen((open) => !open);
                    setActivitySortOpen(false);
                  }}
                  type="button"
                >
                  {callSortLabel}
                  <svg
                    className={`w-4 h-4 ml-2 text-blue-400 transition-transform ${callSortOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {callSortOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-blue-100 rounded-lg shadow-lg z-50">
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        className={`block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 ${callSortLabel === option ? "bg-blue-50" : ""}`}
                        onClick={() => {
                          setCallSortLabel(option);
                          setCallSortOpen(false);
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="flex items-center text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-200 rounded-lg px-2 sm:px-3 py-1.5 w-[39px] sm:w-auto h-[39px] justify-center transition"
                onClick={handleDownloadCallLogs}
              >
                <span className="hidden sm:inline">Download Logs</span>
                <ArrowDownTrayIcon className="w-4 h-4 sm:ml-2" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white w-full">
            <table className="w-full min-w-[500px] divide-y divide-blue-100 text-xs sm:text-sm">
              <thead className="bg-blue-50 sticky top-0 z-10">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-blue-500 uppercase">No</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-blue-500 uppercase">Agent</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-blue-500 uppercase">Recipient</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-blue-500 uppercase">Timestamp</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-blue-500 uppercase">Status</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-blue-500 uppercase">Duration</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-blue-500 uppercase">Transcript</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-blue-500 uppercase">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {callLogsLoading ? (
                  <tr><td colSpan={8} className="text-center text-blue-400 py-6">Loading...</td></tr>
                ) : callLogsError ? (
                  <tr><td colSpan={8} className="text-center text-red-400 py-6">{callLogsError}</td></tr>
                ) : paginatedCallLogGroups.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-blue-400 py-6">No call log</td></tr>
                ) : (
                  paginatedCallLogGroups.map((group, groupIdx) => {
                    const firstLog = group.logs[0];
                    const lastLog = group.logs[group.logs.length - 1];
                    const recipient = firstLog?.toNumber || '-';
                    const formattedStart = firstLog?.timestamp && new Date(firstLog.timestamp).toString() !== 'Invalid Date' ? new Date(firstLog.timestamp).toLocaleString() : '-';
                    const formattedEnd = lastLog?.timestamp && new Date(lastLog.timestamp).toString() !== 'Invalid Date' ? new Date(lastLog.timestamp).toLocaleString() : '-';
                    let durationDisplay = '-';
                    if (typeof firstLog?.duration === 'number') {
                      const min = Math.floor(firstLog.duration / 60);
                      const sec = firstLog.duration % 60;
                      durationDisplay = `${min > 0 ? min + 'm ' : ''}${sec}s`;
                    }
                    return (
                      <tr key={group.callSid || groupIdx} className="hover:bg-blue-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-[16px] font-mono">{(callPage - 1) * callItemsPerPage + groupIdx + 1}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm">{firstLog?.agent || '-'}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm">{recipient}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm">{formattedStart} - {formattedEnd}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm">✔ Completed</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm">{durationDisplay}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm">
                          <button
                            className="text-blue-600 underline hover:text-blue-800 transition"
                            onClick={() => handleOpenTranscriptModal(group)}
                            type="button"
                          >
                            View Transcript
                          </button>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm">
                          <button
                            className="flex items-center gap-1 text-blue-700 hover:text-blue-900 text-sm font-normal px-0 py-0 bg-transparent shadow-none"
                            onClick={() => handleDownloadCallLogs(group)}
                            type="button"
                            title="Download"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Download
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right">
            <button
              className="text-sm text-blue-600 hover:text-blue-900 underline"
              onClick={() => handleNav("calllogs")}
            >
              view all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
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
  const [activeSection, setActiveSection] = useState("profile");

  // Overview page state
  const [activitySortOpen, setActivitySortOpen] = useState(false);
  const [callSortOpen, setCallSortOpen] = useState(false);
  const [activitySortLabel, setActivitySortLabel] = useState("Newest");
  const [callSortLabel, setCallSortLabel] = useState("Newest");
  const sortOptions = ["Newest", "Oldest"];

  //upgrade plan state
  const [planError, setPlanError] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [upgradeError, setUpgradeError] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [billing, setBilling] = useState('monthly');
  const [upgrading, setUpgrading] = useState(false);

  if (sessionStatus === 'unauthenticated') {
    router.replace('/auth');
    return null;
  }

  const plans = [
    {
      name: 'Basic',
      monthly: 199,
      annually: 1900,
      description: 'For businesses looking to start with AI and automations.',
      features: [
        'Upload up to 10 PDFs per month',
        'Download up to 10 PDFs per month',
        'Upload up to 5 CSV files per month',
        'Basic support',
        '1GB storage',
      ],
      button: 'Choose this plan',
    },
    {
      name: 'Professional',
      monthly: 499,
      annually: 4790,
      description:
        'For businesses looking to outperform their competition with AI and automations.',
      features: [
        'Upload up to 50 PDFs per month',
        'Download up to 50 PDFs per month',
        'Upload up to 25 CSV files per month',
        'Priority support',
        '5GB storage',
        'Advanced analytics',
      ],
      button: 'Choose this plan',
      popular: true,
    },
    {
      name: 'Advanced Plan',
      monthly: 799,
      annually: 7690,
      description:
        'For organizations aiming to harness AI and automation for market dominance.',
      features: [
        'Download up to 100 PDFs per month',
        'Upload up to 100 PDFs per month',
        'Upload up to 50 CSV files per month',
        '10GB cloud storage',
        'Basic analytics tools',
        'Access 24/7 standard support',
      ],
      button: 'Choose this plan',
    },
  ];

  const isActivePlan = (plan) => {
    if (!currentPlan) return false;
    return (
      plan.name.trim().toLowerCase() === currentPlan.name.trim().toLowerCase() &&
      billing === currentPlan.billing
    );
  };

  //activity logs state
  const [activitySearch, setActivitySearch] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const [activityLogsData, setActivityLogsData] = useState([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState(true);
  const [activityLogsError, setActivityLogsError] = useState(null);
  const activityItemsPerPage = 10;

  function mapActivityType(type, detail) {
    switch (type) {
      case 'download_pdf': return 'Downloaded PDF';
      case 'download_csv': return 'Downloaded CSV';
      case 'upload_pdf': return 'Uploaded PDF';
      case 'upload_csv': return 'Uploaded CSV';
      case 'login': return 'Log In';
      case 'update_profile': return 'Updated Profile Information';
      default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  useEffect(() => {
    if (!session || !session.user?.email) return;
    setActivityLogsLoading(true);
    setActivityLogsError(null);
    fetch('/api/activity-logs', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        // Map logs to display format
        const logs = (data.logs || []).map((log, idx) => ({
          no: (idx + 1).toString().padStart(2, '0'),
          activity: mapActivityType(log.type, log.detail),
          timestamp: new Date(log.createdAt).toLocaleString(), // for display
          rawTimestamp: log.createdAt, // for sorting
          status: log.status === 'completed' ? 'Completed' : 'Cancelled',
          completed: log.status === 'completed',
        }));
        setActivityLogsData(logs);
      })
      .catch(err => {
        setActivityLogsError(err.message);
      })
      .finally(() => setActivityLogsLoading(false));
  }, [session]);

  function getSortedLogs(data, sortLabel) {
    if (sortLabel === 'Newest first') {
      return [...data].sort((a, b) => new Date(b.rawTimestamp) - new Date(a.rawTimestamp));
    }
    if (sortLabel === 'Oldest first') {
      return [...data].sort((a, b) => new Date(a.rawTimestamp) - new Date(b.rawTimestamp));
    }
    if (sortLabel === 'Status') {
      return [...data].sort((a, b) => {
        // Completed before Cancelled
        if ((a.completed || a.status === 'Completed') && !(b.completed || b.status === 'Completed')) return -1;
        if (!(a.completed || a.status === 'Completed') && (b.completed || b.status === 'Completed')) return 1;
        return 0;
      });
    }
    return data;
  }
  const filteredActivityLogs = getSortedLogs(
    activityLogsData.filter(log =>
      log.activity.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.timestamp.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.status.toLowerCase().includes(activitySearch.toLowerCase())
    ),
    activitySortLabel
  );
  const activityTotalPages = Math.ceil(filteredActivityLogs.length / activityItemsPerPage);
  const paginatedActivityLogs = filteredActivityLogs.slice((activityPage - 1) * activityItemsPerPage, activityPage * activityItemsPerPage);

  //call logs state
  const [callSearch, setCallSearch] = useState('');
  const [callPage, setCallPage] = useState(1);
  const callItemsPerPage = 10;
  const [callLogsRaw, setCallLogsRaw] = useState([]);
  const [callLogsLoading, setCallLogsLoading] = useState(true);
  const [callLogsError, setCallLogsError] = useState(null);

  useEffect(() => {
    if (!session || !session.user?.email) return;
    setCallLogsLoading(true);
    setCallLogsError(null);

    // First ensure user has username, then get logs
    fetch('/api/ensure-username', {
      method: 'POST',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(usernameData => {
        if (usernameData.error) throw new Error(usernameData.error);
        // Now fetch user logs (which will trigger sync)
        return fetch('/api/user-logs', { credentials: 'include' });
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setCallLogsRaw(data.data?.callLogs || []);
      })
      .catch(err => {
        setCallLogsError(err.message);
      })
      .finally(() => setCallLogsLoading(false));
  }, [session, callLogsRaw.length]);

  function groupCallLogsByCallSid(logs) {
    if (!Array.isArray(logs)) return [];
    // Sort logs by timestamp first to show latest calls first, then by callSid
    const sorted = [...logs].sort((a, b) => {
      const timeA = new Date(a.timestamp);
      const timeB = new Date(b.timestamp);
      if (timeA.getTime() !== timeB.getTime()) {
        return timeB - timeA; // Sort by timestamp in descending order (latest first)
      }
      // If timestamps are equal, sort by callSid
      return (a.callSid || '').localeCompare(b.callSid || '');
    });

    const groups = [];
    let currentGroup = null;
    sorted.forEach(log => {
      if (!currentGroup || currentGroup.callSid !== log.callSid) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = {
          toNumber: log.toNumber,
          callSid: log.callSid,
          logs: [log],
        };
      } else {
        currentGroup.logs.push(log);
      }
    });
    if (currentGroup) groups.push(currentGroup);
    return groups;
  }

  const filteredCallLogGroups = (() => {
    let groups = groupCallLogsByCallSid(callLogsRaw);
    // Filter by search
    if (callSearch) {
      groups = groups.filter(group =>
        (group.toNumber || '').toLowerCase().includes(callSearch.toLowerCase()) ||
        group.logs.some(log =>
          (log.timestamp || '').toLowerCase().includes(callSearch.toLowerCase()) ||
          (log.userSaid || '').toLowerCase().includes(callSearch.toLowerCase()) ||
          (log.botResponse || '').toLowerCase().includes(callSearch.toLowerCase())
        )
      );
    }
    // Sort call groups (Newest first/Oldest first) - but logs within each group remain chronological
    if (callSortLabel === 'Newest first') {
      groups = groups.sort((a, b) => {
        // Use the last log timestamp for "newest first" sorting
        const lastLogA = a.logs[a.logs.length - 1]?.timestamp;
        const lastLogB = b.logs[b.logs.length - 1]?.timestamp;
        return new Date(lastLogB) - new Date(lastLogA);
      });
    } else if (callSortLabel === 'Oldest first') {
      groups = groups.sort((a, b) => {
        // Use the first log timestamp for "oldest first" sorting
        const firstLogA = a.logs[0]?.timestamp;
        const firstLogB = b.logs[0]?.timestamp;
        return new Date(firstLogA) - new Date(firstLogB);
      });
    }
    return groups;
  })();
  const callTotalPages = Math.ceil(filteredCallLogGroups.length / callItemsPerPage);
  const paginatedCallLogGroups = filteredCallLogGroups.slice((callPage - 1) * callItemsPerPage, callPage * callItemsPerPage);

  //setting page state
  const [isEditing, setIsEditing] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [dbUserId, setDbUserId] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleOtpVerify = async () => {
    if (!otpValue) {
      setOtpError('Please enter the OTP');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setOtpError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setOtpError('New password must be at least 8 characters long');
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(passwordForm.newPassword)) {
      setOtpError('Password must contain at least 1 letter, 1 number, and 1 symbol');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await fetch('/api/verify-change-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpValue, newPassword: passwordForm.newPassword }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      setShowOtpModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswords({ current: false, new: false, confirm: false });
      setOtpValue('');
      Swal.fire({ icon: 'success', title: 'Password Changed!', text: 'Your password has been updated successfully.', timer: 2000, showConfirmButton: false });
    } catch (err) {
      setOtpError(err.message || 'Failed to change password');
      Swal.fire({ icon: 'error', title: 'Password Change Failed', text: err.message || 'Failed to change password. Please try again.' });
    }
    setOtpLoading(false);
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: ''
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Handle password form changes
  const handlePasswordFormChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear password error when user starts typing
    if (passwordError) {
      setPasswordError(null);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // Only validate current password here, not new password yet
    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    setChangingPassword(true);
    setPasswordError(null);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      setShowOtpModal(true);
      Swal.fire({ icon: 'success', title: 'OTP sent!', text: 'Check your email for the OTP.', timer: 2000, showConfirmButton: false });
    } catch (err) {
      setPasswordError(err.message || 'Failed to send OTP');
      Swal.fire({ icon: 'error', title: 'Failed to send OTP', text: err.message || 'Failed to send OTP. Please try again.' });
    }
    setChangingPassword(false);
  };

  useEffect(() => {
    if (!session?.user?.email) return;

    (async () => {
      try {
        const res = await fetch(`/api/get-db-user-id?email=${session.user.email}`);
        const data = await res.json();
        if (res.ok) {
          setDbUserId(data.id);
        } else {
          console.error("Failed to get user ID:", data.error);
        }
      } catch (err) {
        console.error("Error fetching user ID:", err);
      }
    })();
  }, [session]);

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      setEditFormData({
        name: profileData.name || '',
        email: profileData.email || '',
      });
      setUpdateError(null);
    }
    setIsEditing(!isEditing);
  };

  // Handle form input changes
  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    setUpdatingProfile(true);
    setUpdateError(null);

    try {
      const res = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update local state with new data
      setProfileData(data.user);
      setIsEditing(false);
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile has been updated successfully.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateError(err.message || 'Failed to update profile');
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.message || 'Failed to update profile. Please try again.'
      });
    }

    setUpdatingProfile(false);
  };

  //data for user
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    if (!session.user?.email) {
      setProfileLoading(false);
      setProfileError('You must be logged in to view your profile.');
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetch('/api/user-profile', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const data = await res.json();
      setProfileData(data.user);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setProfileError('Could not load your profile. Please try again later.');
    }
    setProfileLoading(false);
  }, [session?.user?.email]);

  // Fetch profile data when session is ready
  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (sessionStatus === 'authenticated') {
      fetchProfileData();
    }
  }, [sessionStatus, fetchProfileData]);
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const displayName = profileData?.name || profileData?.email || "User";
  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const userInitials = getInitials(displayName);

  // Detect if user is Google login
  const isGoogleUser = session?.user?.image && session?.user?.email?.endsWith('@gmail.com');

  // Helper to convert name to camel case (capitalize each word)
  const toCamelCase = (str) =>
    str
      ? str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      : '';
  const displayNameCamel = toCamelCase(displayName);
  const storageLimits = {
    Basic: 1 * 1024 * 1024 * 1024, // 1GB
    Professional: 5 * 1024 * 1024 * 1024, // 5GB
    'Advanced Plan': 10 * 1024 * 1024 * 1024, // 10GB
  };

  // Upload/download limits by plan
  const planLimits = {
    Basic: { pdfUpload: 10, pdfDownload: 10, csvUpload: 5, csvDownload: 10 },
    Professional: { pdfUpload: 50, pdfDownload: 50, csvUpload: 25, csvDownload: 20 },
    'Advanced Plan': { pdfUpload: 100, pdfDownload: 100, csvUpload: 50, csvDownload: 30 },
  };
  const [metrics, setMetrics] = useState({
    pdfUploadCount: 0,
    pdfDownloadCount: 0,
    csvUploadCount: 0,
    csvDownloadCount: 0,
    totalUploadedFileSize: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  // Fetch current plan (refactored for reuse)
  const fetchCurrentPlan = useCallback(async () => {
    setLoadingPlan(true);
    setUpgradeError(null);
    setPlanError(null);
    try {
      console.log('Fetching user plan, session:', session);
      const res = await fetch('/api/user-plan', { credentials: 'include' });
      console.log('User plan response status:', res.status);
      if (res.status === 401) throw new Error('unauthorized');
      if (res.status === 404) throw new Error('notfound');
      const data = await res.json();
      console.log('User plan data:', data);
      setCurrentPlan(data.subscriptionPlan);
    } catch (err) {
      console.error('Error fetching user plan:', err);
      setCurrentPlan(null);
      if (err.message === 'notfound') setPlanError('User not found.');
    }
    setLoadingPlan(false);
  }, [session]);

  useEffect(() => {
    if (sessionStatus === 'loading') return; // Wait for session
    if (!session) {
      setLoadingPlan(false);
      setPlanError('You must be logged in to view your plan.');
      return;
    }
    fetchCurrentPlan();
  }, [session, sessionStatus, fetchCurrentPlan]);

  // Fetch metrics when session is ready
  useEffect(() => {
    if (!session || !session.user?.email) {
      console.log('No session or email, skipping metrics fetch');
      return;
    }
    console.log('Fetching metrics for session:', session.user.email);
    setMetricsLoading(true);
    setMetricsError(null);
    fetch('/api/user-usage', {
      credentials: 'include'
    })
      .then(res => {
        console.log('Metrics response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Metrics data:', data);
        if (data.error) throw new Error(data.error);
        setMetrics({
          pdfUploadCount: data.templateUsage?.pdfUploadCount || 0,
          pdfDownloadCount: data.templateUsage?.pdfDownloadCount || 0,
          csvUploadCount: data.templateUsage?.csvUploadCount || 0,
          csvDownloadCount: data.templateUsage?.csvDownloadCount || 0,
          totalUploadedFileSize: data.totalUploadedFileSize || 0,
        });
      })
      .catch(err => {
        console.error('Error fetching metrics:', err);
        setMetricsError(err.message);
      })
      .finally(() => setMetricsLoading(false));
  }, [session]);

  // Dummy handlers for download/transcript
  function handleDownloadActivityLogs() {
    alert("Download Activity Logs");
  }
  function handleDownloadCallLogs() {
    alert("Download Call Logs");
  }
  function handleOpenTranscriptModal(group) {
    alert("Open transcript for " + (group.callSid || ""));
  }

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
      case "overview":
        return (
          <OverviewPage
            displayName={displayName}
            currentPlan={currentPlan}
            metricsError={metricsError}
            planLimits={planLimits}
            storageLimits={storageLimits}
            metrics={metrics}
            metricsLoading={metricsLoading}
            paginatedActivityLogs={paginatedActivityLogs}
            paginatedCallLogGroups={paginatedCallLogGroups}
            callLogsLoading={callLogsLoading}
            callLogsError={callLogsError}
            activitySortOpen={activitySortOpen}
            setActivitySortOpen={setActivitySortOpen}
            callSortOpen={callSortOpen}
            setCallSortOpen={setCallSortOpen}
            activitySortLabel={activitySortLabel}
            setActivitySortLabel={setActivitySortLabel}
            callSortLabel={callSortLabel}
            setCallSortLabel={setCallSortLabel}
            sortOptions={sortOptions}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            handleDownloadActivityLogs={handleDownloadActivityLogs}
            handleDownloadCallLogs={handleDownloadCallLogs}
            handleOpenTranscriptModal={handleOpenTranscriptModal}
            callPage={callPage}
            callItemsPerPage={callItemsPerPage}
            handleNav={handleNav}
          />
        );
      case "upgradeplan":
        return <UpgradeplanPage
          planError={planError}
          setPlanError={setPlanError}
          currentPlan={currentPlan}
          setCurrentPlan={setCurrentPlan}
          upgradeError={upgradeError}
          setUpgradeError={setUpgradeError}
          loadingPlan={loadingPlan}
          setLoadingPlan={setLoadingPlan}
          billing={billing}
          setBilling={setBilling}
          upgrading={upgrading}
          setUpgrading={setUpgrading}
          plans={plans}
          isActivePlan={isActivePlan}
          session={session}
          sessionStatus={sessionStatus}
          fetchCurrentPlan={fetchCurrentPlan}
        />;
      case "activitylogs":
        return <ActivitylogsPage
          activitySearch={activitySearch}
          setActivitySearch={setActivitySearch}
          activitySortOpen={activitySortOpen}
          setActivitySortOpen={setActivitySortOpen}
          callSortOpen={callSortOpen}
          setCallSortOpen={setCallSortOpen}
          activitySortLabel={activitySortLabel}
          sortOptions={sortOptions}
          handleDownloadActivityLogs={handleDownloadActivityLogs}
          paginatedActivityLogs={paginatedActivityLogs}
          activityTotalPages={activityTotalPages}
          activityPage={activityPage}
          setActivityPage={setActivityPage}
        />;
      case "calllogs":
        return <CallLogsPage
          callSearch={callSearch}
          setCallSearch={setCallSearch}
          callSortOpen={callSortOpen}
          setCallSortOpen={setCallSortOpen}
          activitySortOpen={activitySortOpen}
          setActivitySortOpen={setActivitySortOpen}
          callSortLabel={callSortLabel}
          setCallSortLabel={setCallSortLabel}
          sortOptions={sortOptions}
          handleDownloadCallLogs={handleDownloadCallLogs}
          handleOpenTranscriptModal={handleOpenTranscriptModal}
          paginatedCallLogGroups={paginatedCallLogGroups}
          callLogsLoading={callLogsLoading}
          callLogsError={callLogsError}
          callPage={callPage}
          setCallPage={setCallPage}
          callTotalPages={callTotalPages}
          callItemsPerPage={callItemsPerPage}
        />;
      case "settings":
        return <SettingsPage
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          profileData={profileData}
          profileLoading={profileLoading}
          profileError={profileError}
          isEditing={isEditing}
          isGoogleUser={isGoogleUser}
          updatingProfile={updatingProfile}
          editFormData={editFormData}
          handleEditToggle={handleEditToggle}
          handleEditFormChange={handleEditFormChange}
          handleProfileUpdate={handleProfileUpdate}
          updateError={updateError}
          passwordError={passwordError}
          passwordForm={passwordForm}
          handlePasswordFormChange={handlePasswordFormChange}
          handlePasswordChange={handlePasswordChange}
          changingPassword={changingPassword}
          showPasswords={showPasswords}
          togglePasswordVisibility={togglePasswordVisibility}
          dbUserId={dbUserId}
          BillingHistory={BillingHistory}
        />;
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
      <aside className="hidden md:fixed md:top-0 md:left-0 md:h-full md:w-16 md:flex md:flex-col border-r border-gray-200 bg-white py-4 items-center flex-shrink-0 z-30">
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
            className={`h-9 w-9 flex items-center justify-center rounded-lg ${activePage === "overview" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 hover:bg-gray-200"}`}
            title="Overview"
            onClick={() => handleNav("overview")}
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
          <button
            className={`h-9 w-9 flex items-center justify-center rounded-lg ${activePage === "upgradeplan" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 hover:bg-gray-200"}`}
            title="UpgradePlan"
            onClick={() => handleNav("upgradeplan")}
          >
            <CreditCardIcon className="h-5 w-5" />
          </button>
          <button
            className={`h-9 w-9 flex items-center justify-center rounded-lg ${activePage === "activitylogs" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 hover:bg-gray-200"}`}
            title="ActivityLogs"
            onClick={() => handleNav("activitylogs")}
          >
            <DocumentChartBarIcon className="h-5 w-5" />
          </button>
          <button
            className={`h-9 w-9 flex items-center justify-center rounded-lg ${activePage === "calllogs" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 hover:bg-gray-200"}`}
            title="CallLogs"
            onClick={() => handleNav("calllogs")}
          >
            <PhoneIcon className="h-5 w-5" />
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
      <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden md:ml-16">
        {/* Header */}
        <header
          className={`
    fixed top-0 left-0 right-0 z-40 border-b border-gray-200 bg-white min-w-0 w-full
    md:ml-16
  `}
          style={{ width: "100%", left: "0", right: "0" }}
        >
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
                onClick={() => handleNav("overview")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activePage === "settings" ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
              >
                <Squares2X2Icon className="h-5 w-5" />
                Overview
              </button>
              <button
                onClick={() => handleNav("upgradeplan")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activePage === "upgradeplan" ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
              >
                <CreditCardIcon className="h-5 w-5" />
                UpgradePlan
              </button>
              <button
                onClick={() => handleNav("activitylogs")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activePage === "activitylogs" ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
              >
                <DocumentChartBarIcon className="h-5 w-5" />
                ActivityLogs
              </button>
              <button
                onClick={() => handleNav("calllogs")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activePage === "calllogs" ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
              >
                <PhoneIcon className="h-5 w-5" />
                CallLogs
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

        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white border border-blue-100 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative flex flex-col">
              <button
                className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-2xl"
                onClick={() => setShowOtpModal(false)}
                aria-label="Close"
                type="button"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-blue-700 mb-4">Verify OTP</h2>
              <form onSubmit={e => { e.preventDefault(); handleOtpVerify(); }} className="space-y-4">
                <div>
                  <label className="block text-blue-700 text-sm mb-1">Enter OTP sent to your email</label>
                  <input
                    type="text"
                    className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-900 focus:outline-none focus:border-blue-400 placeholder-blue-400"
                    value={otpValue}
                    onChange={e => setOtpValue(e.target.value)}
                    placeholder="Enter OTP"
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-700 text-sm mb-1">Enter your new password</label>
                  <input
                    type="password"
                    className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-900 focus:outline-none focus:border-blue-400 placeholder-blue-400"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                    placeholder="New Password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-700 text-sm mb-1">Confirm your new password</label>
                  <input
                    type="password"
                    className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-900 focus:outline-none focus:border-blue-400 placeholder-blue-400"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Confirm New Password"
                    required
                  />
                </div>
                {otpError && <div className="text-red-500 text-sm">{otpError}</div>}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition text-base mt-2"
                  disabled={otpLoading}
                >
                  {otpLoading ? 'Verifying...' : 'Verify & Change Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}