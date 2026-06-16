"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  RefreshCw,
  LogOut,
  ChevronRight,
  Globe,
  Monitor,
  Clock,
  Compass,
  Check,
} from "lucide-react";

interface TrackerCampaign {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
  logsCount: number;
}

interface LocationLog {
  _id: string;
  trackerId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  ip: string;
  userAgent: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [trackers, setTrackers] = useState<TrackerCampaign[]>([]);
  const [selectedTrackerId, setSelectedTrackerId] = useState<string | null>(null);
  const [selectedTracker, setSelectedTracker] = useState<TrackerCampaign | null>(null);
  const [logs, setLogs] = useState<LocationLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<LocationLog | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    fetchTrackers();
  }, []);

  useEffect(() => {
    if (selectedTrackerId) {
      fetchTrackerDetails(selectedTrackerId);
    } else {
      setSelectedTracker(null);
      setLogs([]);
    }
    setSelectedLog(null);
  }, [selectedTrackerId]);

  const getOSMEmbedUrl = (lat: number, lon: number) => {
    const delta = 0.005;
    const minLon = lon - delta;
    const minLat = lat - delta / 2;
    const maxLon = lon + delta;
    const maxLat = lat + delta / 2;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lon}`;
  };

  const fetchTrackers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/trackers");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await response.json();
      setTrackers(data.trackers || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackerDetails = async (id: string) => {
    setLogsLoading(true);
    try {
      const response = await fetch(`/api/admin/trackers/${id}`);
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await response.json();
      setSelectedTracker(data.tracker);
      setLogs(data.locations || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewTitle("");
        await fetchTrackers();
        // Auto select the new campaign
        setSelectedTrackerId(data.tracker._id);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign and all its captured location logs?")) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/trackers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (selectedTrackerId === id) {
          setSelectedTrackerId(null);
        }
        await fetchTrackers();
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const copyToClipboard = (slug: string) => {
    const url = `${origin}/track/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  };

  const formatDevice = (ua: string) => {
    if (!ua) return "Unknown";
    if (ua.includes("Android")) return "Android Phone";
    if (ua.includes("iPhone")) return "iPhone";
    if (ua.includes("Windows")) return "Windows PC";
    if (ua.includes("Macintosh")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    return "Mobile/Tablet";
  };

  const formatBrowser = (ua: string) => {
    if (!ua) return "";
    if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg")) return "Edge";
    return "";
  };

  return (
    <main className="min-h-screen bg-[#07070a] text-neutral-200 flex flex-col font-sans">
      {/* Background glow */}
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-purple-950/10 blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-neutral-900 bg-neutral-950/50 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-md shadow-purple-500/10">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
              GeoTracker
            </h1>
            <p className="text-xs text-neutral-500">Tracking campaigns & logs</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all text-xs"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Log Out</span>
        </button>
      </header>

      {/* Main dashboard content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Create Campaign & Campaign list */}
        <section className="w-full md:w-[380px] border-r border-neutral-900 flex flex-col overflow-y-auto bg-neutral-950/20">
          {/* Create Campaign Card */}
          <div className="p-5 border-b border-neutral-900">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-3">
              New Campaign
            </h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. Amazon Scratch Card Campaign"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={actionLoading}
                className="w-full rounded-xl bg-neutral-950/80 border border-neutral-800 px-4 py-2.5 text-sm outline-none text-white focus:border-purple-600/50 placeholder-neutral-600 transition-all"
              />
              <button
                type="submit"
                disabled={actionLoading || !newTitle.trim()}
                className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <Plus className="h-4 w-4" />
                <span>Create Link</span>
              </button>
            </form>
          </div>

          {/* Campaigns List */}
          <div className="flex-1 p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                Campaigns
              </h2>
              <button
                onClick={fetchTrackers}
                className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                title="Refresh Campaigns"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-20 rounded-2xl bg-neutral-900/30 animate-pulse border border-neutral-900" />
                ))}
              </div>
            ) : trackers.length === 0 ? (
              <div className="text-center py-8 rounded-2xl border border-dashed border-neutral-800 p-4">
                <p className="text-sm text-neutral-600">No campaigns created yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {trackers.map((campaign) => (
                  <div
                    key={campaign._id}
                    onClick={() => setSelectedTrackerId(campaign._id)}
                    className={`group relative rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                      selectedTrackerId === campaign._id
                        ? "bg-purple-950/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.05)]"
                        : "bg-neutral-900/20 border-neutral-900 hover:bg-neutral-900/40 hover:border-neutral-800"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 pr-6">
                        <h3 className="font-semibold text-sm text-neutral-100 group-hover:text-white transition-colors truncate max-w-[200px]">
                          {campaign.title}
                        </h3>
                        <p className="text-xs text-neutral-600">
                          {new Date(campaign.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          campaign.logsCount > 0
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-neutral-900 text-neutral-500 border border-neutral-800"
                        }`}
                      >
                        {campaign.logsCount} logs
                      </span>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(campaign.slug);
                        }}
                        className="flex items-center space-x-1 text-xs text-neutral-400 hover:text-white transition-colors"
                      >
                        {copiedSlug === campaign.slug ? (
                          <>
                            <Check className="h-3 w-3 text-green-500" />
                            <span className="text-green-500 font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(campaign._id);
                        }}
                        className="p-1 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-950/20 transition-all"
                        title="Delete Campaign"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Active Campaign Details & Locations */}
        <section className="flex-1 overflow-y-auto bg-neutral-950/10 flex flex-col p-6">
          {selectedTracker ? (
            <div className="flex-1 flex flex-col space-y-6">
              {/* Campaign Header & Shareable Link */}
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      Active Campaign
                    </span>
                    <h2 className="text-xl font-bold text-white">{selectedTracker.title}</h2>
                    <p className="text-xs text-neutral-500">
                      Created on {new Date(selectedTracker.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      onClick={() => fetchTrackerDetails(selectedTracker._id)}
                      className="p-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all"
                      title="Reload Log Data"
                    >
                      <RefreshCw className={`h-4.5 w-4.5 ${logsLoading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedTracker._id)}
                      className="p-2.5 rounded-xl border border-red-950/30 hover:border-red-900/50 bg-red-950/10 hover:bg-red-950/30 text-red-400 hover:text-red-300 transition-all flex items-center space-x-1.5"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                      <span className="text-xs font-semibold">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Share Link Container */}
                <div className="mt-5 p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="w-full overflow-hidden">
                    <span className="text-xs text-neutral-600 block mb-1">Target Tracking URL</span>
                    <code className="text-xs text-purple-400 truncate block bg-neutral-900 p-2 rounded-lg border border-neutral-800 font-mono">
                      {origin}/track/{selectedTracker.slug}
                    </code>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => copyToClipboard(selectedTracker.slug)}
                      className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-md shadow-purple-500/10 transition-all"
                    >
                      {copiedSlug === selectedTracker.slug ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`/track/${selectedTracker.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all"
                      title="Open Link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Logs Layout (Table + Map Panel if selected) */}
              <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-0">
                {/* Logs Table */}
                <div className="flex-1 rounded-3xl border border-neutral-800 bg-neutral-900/20 flex flex-col overflow-hidden">
                  <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-neutral-100 flex items-center space-x-2">
                      <span>Captured Locations</span>
                      <span className="bg-neutral-800 text-neutral-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-neutral-700">
                        {logs.length}
                      </span>
                    </h3>
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    {logsLoading ? (
                      <div className="flex flex-col items-center justify-center h-64 space-y-2">
                        <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-xs text-neutral-500">Loading location logs...</span>
                      </div>
                    ) : logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                        <div className="h-12 w-12 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 mb-3 text-neutral-600">
                          <Compass className="h-6 w-6" />
                        </div>
                        <h4 className="font-bold text-sm text-neutral-400">No data logged yet</h4>
                        <p className="text-xs text-neutral-600 mt-1 max-w-[280px]">
                          Share the Amazon Scratch Card URL with users. When they scratch, their locations will show up here.
                        </p>
                      </div>
                    ) : (
                      <table className="w-full border-collapse text-left text-sm text-neutral-400">
                        <thead className="bg-neutral-950/40 text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-900">
                          <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Coordinates</th>
                            <th className="px-6 py-4">Accuracy</th>
                            <th className="px-6 py-4">IP Address</th>
                            <th className="px-6 py-4">Device / OS</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900 bg-transparent">
                          {logs.map((log) => (
                            <tr
                              key={log._id}
                              onClick={() => setSelectedLog(log)}
                              className={`cursor-pointer transition-colors ${
                                selectedLog?._id === log._id
                                  ? "bg-purple-950/30 hover:bg-purple-950/40 border-l-2 border-purple-500"
                                  : "hover:bg-neutral-900/30"
                              }`}
                            >
                              {/* Timestamp */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2 text-neutral-300">
                                  <Clock className="h-3.5 w-3.5 text-neutral-600" />
                                  <span>
                                    {new Date(log.timestamp).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </td>

                              {/* Coordinates */}
                              <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                                <span className="text-purple-400 font-medium">
                                  {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                                </span>
                              </td>

                              {/* Accuracy */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                                    log.accuracy <= 25
                                      ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                                      : log.accuracy <= 100
                                      ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                                      : "bg-red-500/10 text-red-400 ring-red-500/20"
                                  }`}
                                >
                                  ±{log.accuracy.toFixed(0)}m
                                </span>
                              </td>

                              {/* IP Address */}
                              <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-neutral-400">
                                <div className="flex items-center space-x-1.5">
                                  <Globe className="h-3.5 w-3.5 text-neutral-600" />
                                  <span>{log.ip}</span>
                                </div>
                              </td>

                              {/* Device/Browser */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="text-neutral-300 flex items-center gap-1">
                                    <Monitor className="h-3.5 w-3.5 text-neutral-600" />
                                    {formatDevice(log.userAgent)}
                                  </span>
                                  <span className="text-[10px] text-neutral-600 pl-4.5">
                                    {formatBrowser(log.userAgent)}
                                  </span>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setSelectedLog(log)}
                                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                      selectedLog?._id === log._id
                                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/15"
                                        : "bg-purple-500/5 border border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                                    }`}
                                  >
                                    <span>Map Preview</span>
                                  </button>
                                  <a
                                    href={`https://www.openstreetmap.org/?mlat=${log.latitude}&mlon=${log.longitude}#map=17/${log.latitude}/${log.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center p-2 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all"
                                    title="Open in OpenStreetMap"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Embedded OpenStreetMap Panel */}
                {selectedLog && (
                  <div className="w-full xl:w-[420px] rounded-3xl border border-neutral-800 bg-neutral-900/40 p-5 flex flex-col space-y-4 shrink-0 backdrop-blur-xl animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                        <Compass className="h-4.5 w-4.5 text-purple-400" />
                        <span>OSM Location Preview</span>
                      </h3>
                      <button
                        onClick={() => setSelectedLog(null)}
                        className="text-neutral-500 hover:text-neutral-300 text-xs px-2.5 py-1 rounded-lg hover:bg-neutral-800 transition-all"
                      >
                        Close
                      </button>
                    </div>

                    {/* OpenStreetMap iframe */}
                    <div className="w-full h-[240px] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        src={getOSMEmbedUrl(selectedLog.latitude, selectedLog.longitude)}
                        className="opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </div>

                    {/* Log data breakdown */}
                    <div className="space-y-3 text-xs bg-neutral-950/40 p-4 rounded-2xl border border-neutral-800/80">
                      <div className="flex justify-between border-b border-neutral-900/60 pb-2">
                        <span className="text-neutral-500">Timestamp</span>
                        <span className="text-neutral-300 font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-900/60 pb-2">
                        <span className="text-neutral-500">Coordinates</span>
                        <span className="text-purple-400 font-mono font-semibold">
                          {selectedLog.latitude.toFixed(6)}, {selectedLog.longitude.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-900/60 pb-2">
                        <span className="text-neutral-500">Accuracy Radius</span>
                        <span className="text-neutral-300 font-medium">±{selectedLog.accuracy.toFixed(0)}m</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-900/60 pb-2">
                        <span className="text-neutral-300 font-mono font-medium">{selectedLog.ip}</span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-neutral-500">User Agent</span>
                        <span className="text-[10px] text-neutral-400 break-all bg-neutral-900 p-2 rounded-lg border border-neutral-900/60 leading-normal">
                          {selectedLog.userAgent}
                        </span>
                      </div>
                    </div>

                    {/* Navigation Actions */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${selectedLog.latitude}&mlon=${selectedLog.longitude}#map=17/${selectedLog.latitude}/${selectedLog.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-1.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white transition-all"
                      >
                        <span>OpenStreetMap</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedLog.latitude},${selectedLog.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-1.5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 py-2.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-all"
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="h-20 w-20 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 mb-5 shadow-inner">
                <Compass className="h-10 w-10 animate-pulse text-purple-500/50" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Campaign Console</h2>
              <p className="text-sm text-neutral-500 max-w-sm">
                Create a new campaign or select an existing tracking campaign from the sidebar to copy tracking URLs and review captured coordinates.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
