"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ArrowLeft, CalendarDays, CheckCircle2, IndianRupee, Loader2 } from "lucide-react";
import { api, ClientListItem, TeamListItem } from "@/lib/api";
import { Combobox } from "@/components/ui/combobox";
import { DateSelector } from "./add-event-form";
import { format, parse } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface EventIntakeFormProps {
  onSuccess: () => void;
  initialClientId?: string;
  eventId?: string;
}

const DEFAULT_EVENT_TYPES = [
  "Wedding",
  "Pre-Wedding",
  "Engagement",
  "Reception",
  "Birthday",
  "Anniversary",
  "Corporate",
  "Maternity",
];

export default function EventIntakeForm({ onSuccess, initialClientId, eventId }: EventIntakeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [eventDisplayId, setEventDisplayId] = useState(() => `EV-${Date.now().toString().slice(-6)}`);
  const [clientDisplayId, setClientDisplayId] = useState(() => `CL-${Date.now().toString().slice(-6)}`);

  // Lists loaded from Database
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [team, setTeam] = useState<TeamListItem[]>([]);
  const [meta, setMeta] = useState<{ cities: string[]; venues: string[]; event_types: string[] }>({
    cities: [], venues: [], event_types: []
  });

  // STEP 1: Core Details States
  const [isNewClient, setIsNewClient] = useState(false);
  const [clientId, setClientId] = useState(initialClientId || "");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientNotes, setNewClientNotes] = useState("");

  const [eventType, setEventType] = useState("");
  const [packageValue, setPackageValue] = useState<number>(0);
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [dates, setDates] = useState<Date[]>([]);
  const [eventNotes, setEventNotes] = useState("");

  // STEP 2: Artist Crew list
  const [artists, setArtists] = useState<Array<{
    userName: string;
    role: string;
    payType: string;
    days: number;
    rate: number;
    advance: number;
    total: number;
  }>>([{ userName: "", role: "Traditional Photographer", payType: "Lump Sum", days: 1, rate: 0, advance: 0, total: 0 }]);

  // STEP 3: Deliverables List
  const [deliverables, setDeliverables] = useState<Array<{
    deliverableName: string;
    userName: string;
    quantity: number;
    total: number;
    advance: number;
  }>>([{ deliverableName: "Traditional Video", userName: "", quantity: 1, total: 0, advance: 0 }]);

  // STEP 4: Installment Payments List
  const [payments, setPayments] = useState<Array<{
    type: string;
    amount: number;
    method: string;
    txnId: string;
    date: string;
  }>>([{ type: "Booking Advance", amount: 0, method: "Online", txnId: "", date: format(new Date(), "yyyy-MM-dd") }]);

  // Load clients and team from API on mount
  useEffect(() => {
    api.clients.list().then(setClients).catch(() => {});
    api.team.list().then(setTeam).catch(() => {});
    api.events.meta().then(setMeta).catch(() => {});
  }, []);

  // Load existing event data when in edit mode
  useEffect(() => {
    if (eventId) {
      api.events.get(eventId).then(data => {
        const { event, client: topClient, dates: eventDates, payments: eventPayments, artist_expenses: eventArtists, output_expenses: eventOutputs } = data;
        
        if (event) {
          setEventDisplayId(event.display_id);
          setEventType(event.event_type);
          setPackageValue(event.package_value);
          
          if (event.venue.includes(" | Notes: ")) {
            const parts = event.venue.split(" | Notes: ");
            setVenue(parts[0]);
            setEventNotes(parts[1]);
          } else if (event.venue.startsWith("Notes: ")) {
            setVenue("");
            setEventNotes(event.venue.substring(7));
          } else {
            setVenue(event.venue);
            setEventNotes("");
          }
          
          setCity(event.city || "");
        }
        
        if (topClient) {
          setClientId(topClient.id);
          setIsNewClient(false);
        }
        
        if (eventDates && eventDates.length > 0) {
          const parsedDates = eventDates.map(d => parse(d, "yyyy-MM-dd", new Date()));
          setDates(parsedDates);
        }
        
        if (eventArtists && eventArtists.length > 0) {
          setArtists(eventArtists.map(ae => ({
            userName: ae.member_name,
            role: ae.assignment_role,
            payType: ae.pay_type,
            days: ae.no_of_days,
            rate: ae.per_day_rate,
            advance: ae.advance_paid,
            total: ae.total_amount,
          })));
        }
        
        if (eventOutputs && eventOutputs.length > 0) {
          setDeliverables(eventOutputs.map(oe => ({
            deliverableName: oe.deliverable,
            userName: oe.member_name || "",
            quantity: oe.quantity,
            total: oe.total_amount,
            advance: oe.advance_paid,
          })));
        }
        
        if (eventPayments && eventPayments.length > 0) {
          setPayments(eventPayments.map(p => ({
            type: p.installment_type,
            amount: p.amount,
            method: p.payment_method,
            txnId: p.transaction_id || "",
            date: p.payment_date,
          })));
        }
      }).catch(err => {
        console.error("Failed to load event for editing:", err);
      });
    }
  }, [eventId]);

  // Sync artists total based on rates
  const handleArtistRateChange = (index: number, days: number, rate: number, totalVal: number, payType: string) => {
    setArtists(prev => prev.map((a, i) => {
      if (i !== index) return a;
      const actualTotal = payType === "Per Day" ? (days * rate) : totalVal;
      return { ...a, days, rate, total: actualTotal, payType };
    }));
  };

  // Stepper pane navigation
  const validateStep1 = () => {
    const activeClientName = isNewClient ? newClientName.trim() : clientId;
    if (!activeClientName) {
      setError("Please choose or specify a Client Name.");
      return false;
    }
    if (!eventType) {
      setError("Please choose an Event Type.");
      return false;
    }
    if (dates.length === 0) {
      setError("Please select at least one Event Date.");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    // Stage validations
    if (activeStep === 1) {
      if (!validateStep1()) return;
    }
    setError("");
    setActiveStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setActiveStep(prev => prev - 1);
  };

  // Math totals summaries
  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  const clientBalance = useMemo(() => {
    return packageValue - totalPaid;
  }, [packageValue, totalPaid]);

  const crewExpenses = useMemo(() => {
    return artists.reduce((sum, a) => sum + (a.total || 0), 0) + deliverables.reduce((sum, d) => sum + (d.total || 0), 0);
  }, [artists, deliverables]);

  // Submit Intake Ingestion
  const handleSubmit = async (shouldClose: boolean = false) => {
    if (!validateStep1()) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const clientNameSelected = isNewClient 
        ? newClientName.trim()
        : (clients.find(c => c.id === clientId)?.client_name || "");

      const datesStr = dates.map(d => format(d, "yyyy-MM-dd"));
      
      const payload = {
        clients: isNewClient ? [{
          "Display ID": clientDisplayId,
          "Client Name": clientNameSelected,
          "Phone": newClientPhone.trim() || undefined,
          "Email": newClientEmail.trim() || undefined,
          "Notes": newClientNotes.trim() || undefined
        }] : [],
        events: [{
          "Display ID": eventDisplayId,
          "Client Name": clientNameSelected,
          "Event Type": eventType,
          "Venue": venue ? venue + (eventNotes ? ` | Notes: ${eventNotes}` : "") : eventNotes ? `Notes: ${eventNotes}` : undefined,
          "City": city || undefined,
          "Package Value": packageValue,
          "Dates": datesStr.join(", ")
        }],
        artistExpenses: artists
          .filter(a => a.userName !== "")
          .map(a => ({
            "Event Display ID": eventDisplayId,
            "User Name": a.userName,
            "Role": a.role,
            "Pay Type": a.payType,
            "Days": a.days,
            "Rate": a.rate,
            "Total": a.total,
            "Advance": a.advance,
            "Start Date": datesStr[0] || undefined,
            "End Date": datesStr[datesStr.length - 1] || undefined
          })),
        outputExpenses: deliverables
          .filter(d => d.userName !== "")
          .map(d => ({
            "Event Display ID": eventDisplayId,
            "User Name": d.userName,
            "Role": "Editor",
            "Deliverable": d.deliverableName,
            "Quantity": d.quantity,
            "Total": d.total,
            "Advance": d.advance
          })),
        payments: payments
          .filter(p => p.amount > 0)
          .map(p => ({
            "Event Display ID": eventDisplayId,
            "Type": p.type,
            "Amount": p.amount,
            "Method": p.method,
            "Transaction ID": p.txnId || undefined,
            "Date": p.date || undefined
          }))
      };

      await api.bulk.uploadJson(payload);
      router.refresh();
      
      // Reload lists from DB to get the newly created clients/members
      const updatedClients = await api.clients.list().catch(() => []);
      if (updatedClients && updatedClients.length > 0) {
        setClients(updatedClients);
        // If we created a new client, link it as existing on subsequent updates
        if (isNewClient) {
          const matched = updatedClients.find(c => c.display_id === clientDisplayId);
          if (matched) {
            setClientId(matched.id);
            setIsNewClient(false);
          }
        }
      }

      if (shouldClose) {
        onSuccess();
      } else {
        setSuccessMsg("Changes saved successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      setError(err.message || "Ingestion transaction failed. Check dynamic row fields.");
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (num: number) => {
    // If navigating away from Step 1, validate first
    if (activeStep === 1 && num > 1) {
      if (!validateStep1()) return;
    }
    setError("");
    setActiveStep(num);
  };

  const stepsList = ["Event Specs", "Crew List", "Deliverables", "Payments"];

  return (
    <div className="space-y-6">
      {/* Visual Stepper Header */}
      <div className="relative flex justify-between items-center mb-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 z-0" />
        {stepsList.map((step, idx) => {
          const num = idx + 1;
          const isActive = num === activeStep;
          const isDone = num < activeStep;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleStepClick(num)}
              className="relative z-10 flex flex-col items-center flex-1 group cursor-pointer focus:outline-none"
            >
              <div 
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                  isActive 
                    ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/20" 
                    : isDone
                      ? "bg-green-600 border-green-600 text-white group-hover:bg-green-700 group-hover:border-green-700"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 group-hover:border-brand-500 group-hover:text-brand-600"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : num}
              </div>
              <span className={`hidden sm:inline-block text-[10px] mt-1.5 font-medium transition-colors ${
                isActive 
                  ? "text-brand-600 dark:text-brand-400 font-bold" 
                  : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
              }`}>
                {step}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3 text-xs bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* ================= STEP 1: SPECIFICATION ================= */}
      {activeStep === 1 && (
        <div className="space-y-4">
          {/* Client mode toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg border border-gray-200 dark:border-gray-800/80">
            <button
              type="button"
              onClick={() => setIsNewClient(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                !isNewClient ? "bg-white dark:bg-gray-900 shadow-sm text-gray-950 dark:text-white" : "text-gray-400"
              }`}
            >
              Existing Client
            </button>
            <button
              type="button"
              onClick={() => setIsNewClient(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                isNewClient ? "bg-white dark:bg-gray-900 shadow-sm text-gray-950 dark:text-white" : "text-gray-400"
              }`}
            >
              ➕ Create New Client
            </button>
          </div>

          {isNewClient ? (
            <div className="p-3 bg-gray-50/50 dark:bg-gray-900/40 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Name *</label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    placeholder="e.g. Priyesh Patel"
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-3 py-2 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Phone</label>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={e => setNewClientPhone(e.target.value)}
                    placeholder="e.g. 9827155601"
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-3 py-2 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={e => setNewClientEmail(e.target.value)}
                    placeholder="e.g. priyesh@gmail.com"
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-3 py-2 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Notes</label>
                  <input
                    type="text"
                    value={newClientNotes}
                    onChange={e => setNewClientNotes(e.target.value)}
                    placeholder="e.g. Referred by SKD Studio"
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-3 py-2 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Client *</label>
                {clientId && (
                  (() => {
                    const selectedClient = clients.find(c => c.id === clientId);
                    if (!selectedClient) return null;
                    const count = selectedClient.event_count || 0;
                    return (
                      <span className="text-[10px] font-bold bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 px-2 py-0.5 rounded-full border border-brand-100 dark:border-brand-900/50 transition-all">
                        💼 {count} booked event{count !== 1 ? "s" : ""}
                      </span>
                    );
                  })()
                )}
              </div>
              <Combobox
                value={clientId}
                onChange={setClientId}
                options={clients.map(c => ({ label: c.client_name, value: c.id }))}
                placeholder="Search active studio clients..."
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Event Type *</label>
              <Combobox
                value={eventType}
                onChange={setEventType}
                options={DEFAULT_EVENT_TYPES.concat(meta.event_types).filter((v, i, a) => a.indexOf(v) === i).map(t => ({ label: t, value: t }))}
                placeholder="Choose type..."
                freeText={true}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Package Value (₹)</label>
              <input
                type="number"
                value={packageValue || ""}
                onChange={e => setPackageValue(Number(e.target.value) || 0)}
                placeholder="e.g. 150000"
                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Event Dates *</label>
              <DateSelector dates={dates} onChange={setDates} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">City Location</label>
              <Combobox
                value={city}
                onChange={setCity}
                options={meta.cities.map(c => ({ label: c, value: c }))}
                placeholder="e.g. Raipur"
                freeText={true}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Venue Details</label>
            <Combobox
              value={venue}
              onChange={setVenue}
              options={meta.venues.map(v => ({ label: v, value: v }))}
              placeholder="e.g. VIP Club Resort"
              freeText={true}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Event Notes</label>
            <textarea
              value={eventNotes}
              onChange={e => setEventNotes(e.target.value)}
              placeholder="e.g. Early morning pheras, VIP guests attending..."
              rows={2}
              className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-3 py-2 focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* ================= STEP 2: CREW LIST ================= */}
      {activeStep === 2 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Photographer Crew Assignments</h4>
            <button
              type="button"
              onClick={() => setArtists(prev => [...prev, { userName: "", role: "Traditional Photographer", payType: "Lump Sum", days: 1, rate: 0, advance: 0, total: 0 }])}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add Crew Member
            </button>
          </div>

          <PhotographerCrewTable 
            artists={artists} 
            team={team} 
            setArtists={setArtists} 
            handleArtistRateChange={handleArtistRateChange} 
          />
        </div>
      )}

      {/* ================= STEP 3: DELIVERABLES ================= */}
      {activeStep === 3 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deliverable Packages & Editor Costs</h4>
            <button
              type="button"
              onClick={() => setDeliverables(prev => [...prev, { deliverableName: "Traditional Video", userName: "", quantity: 1, total: 0, advance: 0 }])}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add Deliverable
            </button>
          </div>

          <DeliverablesTable 
            deliverables={deliverables} 
            team={team} 
            setDeliverables={setDeliverables} 
          />
        </div>
      )}

      {/* ================= STEP 4: PAYMENTS ================= */}
      {activeStep === 4 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Installment Payments Ingestion</h4>
            <button
              type="button"
              onClick={() => setPayments(prev => [...prev, { type: "Booking Advance", amount: 0, method: "Online", txnId: "", date: format(new Date(), "yyyy-MM-dd") }])}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add Payment
            </button>
          </div>

          <PaymentsTable 
            payments={payments} 
            setPayments={setPayments} 
          />
        </div>
      )}

      {/* Dynamic Math Dashboard Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-800/80">
        <div className="space-y-0.5">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Package Value</span>
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{formatCurrency(packageValue)}</span>
        </div>
        <div className="space-y-0.5">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Payments</span>
          <span className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="space-y-0.5">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client Balance</span>
          <span className={`text-sm font-bold ${clientBalance > 0 ? "text-amber-500" : "text-green-500"}`}>
            {formatCurrency(clientBalance)}
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Est. Outgoings</span>
          <span className="text-sm font-bold text-rose-500">{formatCurrency(crewExpenses)}</span>
        </div>
      </div>

      {/* Form Bottom Control Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        {/* Left Side: Navigation (Prev / Next Stage) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={prevStep}
            disabled={activeStep === 1}
            className={`px-3.5 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${activeStep === 4 ? "w-full sm:w-auto" : "flex-1 sm:flex-none"}`}
          >
            Back
          </button>
          
          {activeStep < 4 && (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Next
            </button>
          )}
        </div>

        {/* Right Side: Save Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 dark:bg-brand-950/20 dark:border-brand-900/50 dark:text-brand-400 dark:hover:bg-brand-950/30 rounded-lg transition-colors shadow-sm disabled:opacity-50 min-w-[70px]"
          >
            {loading ? <><Loader2 className="h-3 w-3 animate-spin mr-1.5" /> Saving...</> : "Save"}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 min-w-[110px]"
          >
            {loading ? <><Loader2 className="h-3 w-3 animate-spin mr-1.5" /> Ingesting...</> : "Save & Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Artist {
  userName: string;
  role: string;
  payType: string;
  days: number;
  rate: number;
  advance: number;
  total: number;
}

const PhotographerCrewTable = React.memo(({
  artists,
  team,
  setArtists,
  handleArtistRateChange
}: {
  artists: Artist[];
  team: TeamListItem[];
  setArtists: React.Dispatch<React.SetStateAction<Artist[]>>;
  handleArtistRateChange: (index: number, days: number, rate: number, totalVal: number, payType: string) => void;
}) => {
  const showPerDayCols = artists.some(a => a.payType === "Per Day");

  return (
    <div className="-mx-4 sm:mx-0 border border-gray-200 dark:border-gray-800 rounded-none sm:rounded-xl overflow-x-auto min-h-[380px] max-h-[550px] overflow-y-auto pb-32">
      <table className="w-full text-xs text-left border-collapse min-w-max">
        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-[10px] uppercase font-bold text-gray-400">
          <tr>
            <th className="p-2.5">Name</th>
            <th className="p-2.5">Role</th>
            <th className="p-2.5">Pay Type</th>
            {showPerDayCols && <th className="p-2.5 text-center">Days</th>}
            {showPerDayCols && <th className="p-2.5 text-right">Rate</th>}
            <th className="p-2.5 text-right">Total Amount</th>
            <th className="p-2.5 text-right">Advance</th>
            <th className="p-2.5 text-right">Balance</th>
            <th className="p-2.5 w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-transparent">
          {artists.map((artist, idx) => {
            const balance = (artist.total || 0) - (artist.advance || 0);
            return (
            <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
              <td className="p-2 min-w-[160px]">
                <Combobox
                  value={artist.userName}
                  onChange={val => setArtists(prev => prev.map((a, i) => i === idx ? { ...a, userName: val } : a))}
                  options={team.map(t => ({ label: t.full_name, value: t.full_name }))}
                  placeholder="Crew Name..."
                  freeText={true}
                />
              </td>
              <td className="p-2 min-w-[180px]">
                <Combobox
                  value={artist.role}
                  onChange={val => setArtists(prev => prev.map((a, i) => i === idx ? { ...a, role: val } : a))}
                  options={[
                    { label: "Traditional Photographer", value: "Traditional Photographer" },
                    { label: "Traditional Videographer", value: "Traditional Videographer" },
                    { label: "Cinematographer", value: "Cinematographer" },
                    { label: "Candid Photographer", value: "Candid Photographer" },
                    { label: "Assistant", value: "Assistant" },
                    { label: "Director", value: "Director" },
                    { label: "Drone Pilot", value: "Drone Pilot" },
                    { label: "Editor", value: "Editor" },
                  ]}
                  placeholder="Role..."
                  freeText={true}
                />
              </td>
              <td className="p-2">
                <select
                  value={artist.payType}
                  onChange={e => handleArtistRateChange(idx, artist.days, artist.rate, artist.total, e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-1.5 w-24 focus:outline-none"
                >
                  <option value="Lump Sum">Lump Sum</option>
                  <option value="Per Day">Per Day</option>
                </select>
              </td>
              
              {showPerDayCols && (
                <td className="p-2 text-center">
                  {artist.payType === "Per Day" ? (
                    <input
                      type="number"
                      value={artist.days || ""}
                      onChange={e => handleArtistRateChange(idx, Number(e.target.value) || 1, artist.rate, artist.total, artist.payType)}
                      className="w-12 border border-gray-300 dark:border-gray-800 rounded-lg p-1.5 text-center bg-white dark:bg-[#1a1a1a]"
                    />
                  ) : <span className="text-gray-400">-</span>}
                </td>
              )}
              {showPerDayCols && (
                <td className="p-2 text-right">
                  {artist.payType === "Per Day" ? (
                    <input
                      type="number"
                      value={artist.rate || ""}
                      onChange={e => handleArtistRateChange(idx, artist.days, Number(e.target.value) || 0, artist.total, artist.payType)}
                      className="w-16 border border-gray-300 dark:border-gray-800 rounded-lg p-1.5 text-right bg-white dark:bg-[#1a1a1a]"
                    />
                  ) : <span className="text-gray-400">-</span>}
                </td>
              )}
              
              <td className="p-2 font-medium text-right">
                <input
                  type="number"
                  readOnly={artist.payType === "Per Day"}
                  value={artist.total || ""}
                  onChange={e => setArtists(prev => prev.map((a, i) => i === idx ? { ...a, total: Number(e.target.value) || 0 } : a))}
                  className="w-20 border border-gray-300 dark:border-gray-800 rounded-lg p-1.5 bg-white dark:bg-[#1a1a1a] text-right read-only:opacity-50 read-only:bg-gray-50 dark:read-only:bg-gray-900"
                />
              </td>
              <td className="p-2 text-right">
                <input
                  type="number"
                  value={artist.advance || ""}
                  onChange={e => setArtists(prev => prev.map((a, i) => i === idx ? { ...a, advance: Number(e.target.value) || 0 } : a))}
                  className="w-16 border border-gray-300 dark:border-gray-800 rounded-lg p-1.5 bg-white dark:bg-[#1a1a1a] text-right"
                />
              </td>
              <td className="p-2">
                <div className={`w-16 text-right px-1 font-bold ${balance > 0 ? "text-amber-600 dark:text-amber-400" : balance < 0 ? "text-rose-500 dark:text-rose-400" : "text-green-600 dark:text-green-400"}`}>
                  {balance}
                </div>
              </td>
              
              <td className="p-2 text-right">
                <button
                  type="button"
                  onClick={() => setArtists(prev => prev.filter((_, i) => i !== idx))}
                  className="h-6 w-6 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-colors ml-auto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
});
PhotographerCrewTable.displayName = "PhotographerCrewTable";

interface Deliverable {
  deliverableName: string;
  userName: string;
  quantity: number;
  total: number;
  advance: number;
}

const DeliverablesTable = React.memo(({
  deliverables,
  team,
  setDeliverables
}: {
  deliverables: Deliverable[];
  team: TeamListItem[];
  setDeliverables: React.Dispatch<React.SetStateAction<Deliverable[]>>;
}) => {
  return (
    <div className="-mx-4 sm:mx-0 border border-gray-200 dark:border-gray-800 rounded-none sm:rounded-xl overflow-x-auto min-h-[300px] max-h-[500px] overflow-y-auto pb-20">
      <table className="w-full text-xs text-left border-collapse min-w-[650px]">
        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-[10px] uppercase font-bold text-gray-400">
          <tr>
            <th className="p-2.5">Deliverables/Output</th>
            <th className="p-2.5">Editor</th>
            <th className="p-2.5">Qty</th>
            <th className="p-2.5">Total Cost</th>
            <th className="p-2.5">Advance</th>
            <th className="p-2.5 w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-transparent">
          {deliverables.map((del, idx) => (
            <tr key={idx}>
              <td className="p-2 min-w-[200px]">
                <Combobox
                  value={del.deliverableName}
                  onChange={val => setDeliverables(prev => prev.map((d, i) => i === idx ? { ...d, deliverableName: val } : d))}
                  options={[
                    { label: "Traditional Video", value: "Traditional Video" },
                    { label: "Cinematic Video", value: "Cinematic Video" },
                    { label: "Traditional Photos", value: "Traditional Photos" },
                    { label: "Candid Photos", value: "Candid Photos" },
                    { label: "Reels / Short Form", value: "Reels / Short Form" },
                    { label: "Premium Album Book", value: "Premium Album Book" },
                    { label: "Drone / Aerial Coverage", value: "Drone / Aerial Coverage" },
                  ]}
                  placeholder="Deliverable..."
                  freeText={true}
                />
              </td>
              <td className="p-2 min-w-[160px]">
                <Combobox
                  value={del.userName}
                  onChange={val => setDeliverables(prev => prev.map((d, i) => i === idx ? { ...d, userName: val } : d))}
                  options={team.map(t => ({ label: t.full_name, value: t.full_name }))}
                  placeholder="Editor..."
                  freeText={true}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={del.quantity}
                  onChange={e => setDeliverables(prev => prev.map((d, i) => i === idx ? { ...d, quantity: Number(e.target.value) || 1 } : d))}
                  className="w-12 border border-gray-300 dark:border-gray-800 rounded-lg p-1.5 text-center bg-white dark:bg-[#1a1a1a]"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={del.total}
                  onChange={e => setDeliverables(prev => prev.map((d, i) => i === idx ? { ...d, total: Number(e.target.value) || 0 } : d))}
                  className="w-24 border border-gray-300 dark:border-gray-800 rounded-lg p-1.5 bg-white dark:bg-[#1a1a1a]"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={del.advance}
                  onChange={e => setDeliverables(prev => prev.map((d, i) => i === idx ? { ...d, advance: Number(e.target.value) || 0 } : d))}
                  className="w-24 border border-gray-300 dark:border-gray-800 rounded-lg p-1.5 bg-white dark:bg-[#1a1a1a]"
                />
              </td>
              <td className="p-2">
                <button
                  type="button"
                  onClick={() => setDeliverables(prev => prev.filter((_, i) => i !== idx))}
                  className="h-6 w-6 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
DeliverablesTable.displayName = "DeliverablesTable";

interface Payment {
  type: string;
  amount: number;
  method: string;
  txnId: string;
  date: string;
}

const PaymentsTable = React.memo(({
  payments,
  setPayments
}: {
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
}) => {
  return (
    <div className="-mx-4 sm:mx-0 border border-gray-200 dark:border-gray-800 rounded-none sm:rounded-xl overflow-x-auto max-h-80 overflow-y-auto">
      <table className="w-full text-xs text-left border-collapse min-w-[600px]">
        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-[10px] uppercase font-bold text-gray-400">
          <tr>
            <th className="p-2.5">Type</th>
            <th className="p-2.5">Amount</th>
            <th className="p-2.5">Method</th>
            <th className="p-2.5">Transaction Ref</th>
            <th className="p-2.5">Date Paid</th>
            <th className="p-2.5 w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-transparent">
          {payments.map((p, idx) => (
            <tr key={idx}>
              <td className="p-2">
                <select
                  value={p.type}
                  onChange={e => setPayments(prev => prev.map((pay, i) => i === idx ? { ...pay, type: e.target.value } : pay))}
                  className="rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-1.5 w-40 focus:outline-none"
                >
                  <option value="Booking Advance">Booking Advance</option>
                  <option value="Installment 1">Installment 1</option>
                  <option value="Installment 2">Installment 2</option>
                  <option value="Installment 3">Installment 3</option>
                </select>
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={p.amount || ""}
                  onChange={e => setPayments(prev => prev.map((pay, i) => i === idx ? { ...pay, amount: Number(e.target.value) || 0 } : pay))}
                  className="w-24 border border-gray-300 dark:border-gray-800 rounded-lg p-1.5 bg-white dark:bg-[#1a1a1a]"
                />
              </td>
              <td className="p-2">
                <select
                  value={p.method}
                  onChange={e => setPayments(prev => prev.map((pay, i) => i === idx ? { ...pay, method: e.target.value } : pay))}
                  className="rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-1.5 w-28 focus:outline-none"
                >
                  <option value="Online">Online / UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </td>
              <td className="p-2">
                <input
                  type="text"
                  value={p.txnId}
                  onChange={e => setPayments(prev => prev.map((pay, i) => i === idx ? { ...pay, txnId: e.target.value } : pay))}
                  placeholder="e.g. TXN-9981"
                  className="w-32 border border-gray-300 dark:border-gray-800 rounded-lg p-1.5 bg-white dark:bg-[#1a1a1a]"
                />
              </td>
              <td className="p-2">
                <input
                  type="date"
                  value={p.date}
                  onChange={e => setPayments(prev => prev.map((pay, i) => i === idx ? { ...pay, date: e.target.value } : pay))}
                  className="w-28 border border-gray-300 dark:border-gray-800 rounded-lg p-1.5 bg-white dark:bg-[#1a1a1a]"
                />
              </td>
              <td className="p-2">
                <button
                  type="button"
                  onClick={() => setPayments(prev => prev.filter((_, i) => i !== idx))}
                  className="h-6 w-6 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
PaymentsTable.displayName = "PaymentsTable";
