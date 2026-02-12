import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { enableRipple } from "@syncfusion/ej2-base";
import { ScheduleComponent, ViewsDirective, ViewDirective, ResourcesDirective, ResourceDirective, Inject, TimelineViews, TimelineMonth, Month, Week, Day, Resize, DragAndDrop, Print, ICalendarExport, ICalendarImport, ExcelExport, } from "@syncfusion/ej2-react-schedule";
import { GridComponent, ColumnsDirective, ColumnDirective, Inject as GridInject, Page, } from "@syncfusion/ej2-react-grids";
import { DialogComponent } from "@syncfusion/ej2-react-popups";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { TextBoxComponent, NumericTextBoxComponent, UploaderComponent, ColorPickerComponent, } from "@syncfusion/ej2-react-inputs";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { DatePickerComponent, TimePickerComponent } from "@syncfusion/ej2-react-calendars";
import { DropDownButtonComponent } from "@syncfusion/ej2-react-splitbuttons";
import { ListViewComponent } from "@syncfusion/ej2-react-lists";
import { FormValidator } from "@syncfusion/ej2-inputs";
import { CheckBoxComponent } from "@syncfusion/ej2-react-buttons";
import "./index.css";
import { compile } from "@syncfusion/ej2-base";
enableRipple(true);
// keep storage but do NOT auto-seed defaults
const STORAGE_KEY = "Shift-empty-first";
/** -----------------------------
 * Demo data (only loaded on Test Data click)
 * ----------------------------- */
const defaultRoles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "QA Engineer",
    "DevOps Engineer",
    "Tech Lead",
    "Engineering Manager",
];
const defaultLocations = ["All Locations", "Main Location", "Branch A"];
const defaultEmployees = [
    { Id: 1, EmployeeId: 1, Name: "Michael Anderson", Role: "Engineering Manager", HourlyRate: 35, MaxHoursDay: 8, MaxHoursWeek: 40, Color: "#c7b3ff" },
    { Id: 2, EmployeeId: 2, Name: "Daniel Carter", Role: "Tech Lead", HourlyRate: 18, MaxHoursDay: 8, MaxHoursWeek: 40, Color: "#ffd1e6" },
    { Id: 3, EmployeeId: 3, Name: "Olivia Brown", Role: "DevOps Engineer", HourlyRate: 18, MaxHoursDay: 8, MaxHoursWeek: 40, Color: "#ffd1e6" },
    { Id: 4, EmployeeId: 4, Name: "Christopher Martin", Role: "QA Engineer", HourlyRate: 28, MaxHoursDay: 10, MaxHoursWeek: 60, Color: "#f5b7b1" },
    { Id: 5, EmployeeId: 5, Name: "Amanda Clark", Role: "Software Engineer", HourlyRate: 22, MaxHoursDay: 8, MaxHoursWeek: 40, Color: "#e6d4ff" },
    { Id: 6, EmployeeId: 6, Name: "James Walker", Role: "Full Stack Developer", HourlyRate: 20, MaxHoursDay: 9, MaxHoursWeek: 45, Color: "#ffd9c7" },
    { Id: 7, EmployeeId: 7, Name: "Hannah Wilson", Role: "Backend Developer", HourlyRate: 16, MaxHoursDay: 6, MaxHoursWeek: 30, Color: "#c7f0f7" },
    { Id: 8, EmployeeId: 8, Name: "Ethan Parker", Role: "Frontend Developer", HourlyRate: 33, MaxHoursDay: 8, MaxHoursWeek: 40, Color: "#d6c8ff" },
];
function startOfWeek(date) {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // Monday
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
}
function endOfWeek(date) {
    const s = startOfWeek(date);
    const e = new Date(s);
    e.setDate(s.getDate() + 7);
    return e;
}
function updateDefaultAppointmentsToCurrentWeek(defaultAppointments) {
    const weekStart = startOfWeek(new Date()); // Monday of system current week
    const startHoursBySlot = [6, 9, 12];
    const SHIFT_HOURS = 7;
    return defaultAppointments.map((a) => {
        const idx = (a.Id ?? 1) - 1;
        const dayIdx = Math.floor(idx / 3);
        const slotIdx = idx % 3;
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + dayIdx);
        const start = new Date(dayDate);
        start.setHours(startHoursBySlot[slotIdx], 0, 0, 0);
        const end = new Date(start);
        end.setHours(end.getHours() + SHIFT_HOURS);
        return {
            ...a,
            StartTime: start.toISOString(),
            EndTime: end.toISOString(),
        };
    });
}
const Appointments = [
    { Id: 1, Subject: "Shift", StartTime: "2026-01-26T09:00:00.000Z", EndTime: "2026-01-26T17:00:00.000Z", EmployeeId: 1, Role: "Engineering Manager", BreakDuration: 30, Location: "Main Location" },
    { Id: 2, Subject: "Shift", StartTime: "2026-01-26T10:00:00.000Z", EndTime: "2026-01-26T18:00:00.000Z", EmployeeId: 2, Role: "Tech Lead", BreakDuration: 30, Location: "Main Location" },
    { Id: 3, Subject: "Shift", StartTime: "2026-01-26T09:00:00.000Z", EndTime: "2026-01-26T17:00:00.000Z", EmployeeId: 3, Role: "DevOps Engineer", BreakDuration: 30, Location: "Main Location" },
    { Id: 4, Subject: "Shift", StartTime: "2026-01-27T09:00:00.000Z", EndTime: "2026-01-27T17:30:00.000Z", EmployeeId: 4, Role: "QA Engineer", BreakDuration: 45, Location: "Main Location" },
    { Id: 5, Subject: "Shift", StartTime: "2026-01-27T10:00:00.000Z", EndTime: "2026-01-27T18:00:00.000Z", EmployeeId: 5, Role: "Tech Lead", BreakDuration: 30, Location: "Main Location" },
    { Id: 6, Subject: "Shift", StartTime: "2026-01-27T09:00:00.000Z", EndTime: "2026-01-27T18:00:00.000Z", EmployeeId: 6, Role: "Full Stack Developer", BreakDuration: 30, Location: "Main Location" },
    { Id: 7, Subject: "Shift", StartTime: "2026-01-28T09:30:00.000Z", EndTime: "2026-01-28T18:30:00.000Z", EmployeeId: 1, Role: "Engineering Manager", BreakDuration: 30, Location: "Main Location" },
    { Id: 8, Subject: "Shift", StartTime: "2026-01-28T10:00:00.000Z", EndTime: "2026-01-28T18:00:00.000Z", EmployeeId: 2, Role: "Tech Lead", BreakDuration: 30, Location: "Main Location" },
    { Id: 9, Subject: "Shift", StartTime: "2026-01-28T11:00:00.000Z", EndTime: "2026-01-28T18:00:00.000Z", EmployeeId: 7, Role: "Backend Developer", BreakDuration: 20, Location: "Main Location" },
    { Id: 10, Subject: "Shift", StartTime: "2026-01-29T09:00:00.000Z", EndTime: "2026-01-29T17:30:00.000Z", EmployeeId: 8, Role: "Frontend Developer", BreakDuration: 30, Location: "Main Location" },
    { Id: 11, Subject: "Shift", StartTime: "2026-01-29T10:00:00.000Z", EndTime: "2026-01-29T18:30:00.000Z", EmployeeId: 5, Role: "Tech Lead", BreakDuration: 30, Location: "Main Location" },
    { Id: 12, Subject: "Shift", StartTime: "2026-01-29T09:00:00.000Z", EndTime: "2026-01-29T18:00:00.000Z", EmployeeId: 6, Role: "Full Stack Developer", BreakDuration: 30, Location: "Main Location" },
    { Id: 13, Subject: "Shift", StartTime: "2026-01-30T09:00:00.000Z", EndTime: "2026-01-30T18:00:00.000Z", EmployeeId: 1, Role: "Engineering Manager", BreakDuration: 45, Location: "Main Location" },
    { Id: 14, Subject: "Shift", StartTime: "2026-01-30T10:00:00.000Z", EndTime: "2026-01-30T18:00:00.000Z", EmployeeId: 3, Role: "DevOps Engineer", BreakDuration: 30, Location: "Main Location" },
    { Id: 15, Subject: "Shift", StartTime: "2026-01-30T08:00:00.000Z", EndTime: "2026-01-30T16:00:00.000Z", EmployeeId: 5, Role: "Tech Lead", BreakDuration: 30, Location: "Main Location" },
    { Id: 16, Subject: "Shift", StartTime: "2026-01-31T10:00:00.000Z", EndTime: "2026-01-31T18:00:00.000Z", EmployeeId: 4, Role: "QA Engineer", BreakDuration: 45, Location: "Main Location" },
    { Id: 17, Subject: "Shift", StartTime: "2026-01-31T11:00:00.000Z", EndTime: "2026-01-31T19:00:00.000Z", EmployeeId: 6, Role: "Full Stack Developer", BreakDuration: 30, Location: "Main Location" },
    { Id: 18, Subject: "Shift", StartTime: "2026-01-31T13:00:00.000Z", EndTime: "2026-01-31T21:30:00.000Z", EmployeeId: 7, Role: "Backend Developer", BreakDuration: 20, Location: "Main Location" },
    { Id: 19, Subject: "Shift", StartTime: "2026-02-01T09:00:00.000Z", EndTime: "2026-02-01T17:00:00.000Z", EmployeeId: 1, Role: "Engineering Manager", BreakDuration: 30, Location: "Main Location" },
    { Id: 20, Subject: "Shift", StartTime: "2026-02-01T10:00:00.000Z", EndTime: "2026-02-01T18:00:00.000Z", EmployeeId: 8, Role: "Frontend Developer", BreakDuration: 30, Location: "Main Location" },
    { Id: 21, Subject: "Shift", StartTime: "2026-02-01T11:30:00.000Z", EndTime: "2026-02-01T17:30:00.000Z", EmployeeId: 3, Role: "DevOps Engineer", BreakDuration: 30, Location: "Main Location" },
];
const defaultAppointments = updateDefaultAppointmentsToCurrentWeek(Appointments);
const dialogTarget = ".appRoot";
/** -----------------------------
 * Helpers
 * ----------------------------- */
function randomColor(seed) {
    const colors = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#f39c12", "#e74c3c", "#16a085", "#27ae60"];
    return colors[seed % colors.length];
}
function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
}
function fmtTime(d) {
    const dt = new Date(d);
    const h = dt.getHours();
    const m = dt.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = ((h + 11) % 12) + 1;
    const mm = m ? `:${String(m).padStart(2, "0")}` : "";
    return `${hh}${mm} ${ampm}`;
}
export default function App() {
    // NOTE: refs typed as any to match current usage (Syncfusion instance methods)
    const scheduleRef = useRef(null);
    const gridRef = useRef(null);
    const jsonUploaderRef = useRef(null);
    const icsUploaderRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedLocation, setSelectedLocation] = useState("All Locations");
    // EMPTY FIRST
    const [employees, setEmployees] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [locations, setLocations] = useState(["All Locations"]);
    const [nextEmployeeId, setNextEmployeeId] = useState(1);
    const [nextEventId, setNextEventId] = useState(1);
    // dialogs
    const [showEmployeesDialog, setShowEmployeesDialog] = useState(false);
    const [showEmployeeForm, setShowEmployeeForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showRolesDialog, setShowRolesDialog] = useState(false);
    const [showLocationsDialog, setShowLocationsDialog] = useState(false);
    const [showRoles, setShowRoles] = useState(false); // unused but preserved
    // Roles form local state
    const [roleNameInputValue, setRoleNameInputValue] = useState("");
    const [roleDefaultRateValue, setRoleDefaultRateValue] = useState(15);
    const [roleColorValue, setRoleColorValue] = useState("#1abc9c");
    const [showShiftDialog, setShowShiftDialog] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [cellSelection, setCellSelection] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [showSummaryDialog, setShowSummaryDialog] = useState(false);
    const [showIcsDialog, setShowIcsDialog] = useState(false);
    const [icsFile, setIcsFile] = useState(null);
    const [icsImported, setIcsImported] = useState(false);
    const [showUngroupedImported, setShowUngroupedImported] = useState(false);
    // Clear Data dialog
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [clearChoice, setClearChoice] = useState("shifts");
    // Scheduler datasource is controlled explicitly
    const [schedulerDataSource, setSchedulerDataSource] = useState([]);
    //  dialog view modes
    const [rolesView, setRolesView] = useState("list");
    const [locationsView, setLocationsView] = useState("list");
    // Validation messages (inline)
    const [roleFormError, setRoleFormError] = useState("");
    const [locationFormError, setLocationFormError] = useState("");
    // Role metadata
    const [roleMeta, setRoleMeta] = useState({});
    const [editingRoleName, setEditingRoleName] = useState(null);
    const [lastAddedRole, setLastAddedRole] = useState(null);
    // Location form + metadata
    const [locationNameInputValue, setLocationNameInputValue] = useState("");
    const [locationAddressInputValue, setLocationAddressInputValue] = useState("");
    const [locationColorValue, setLocationColorValue] = useState("#2563eb");
    const [locationMeta, setLocationMeta] = useState({});
    const [editingLocationName, setEditingLocationName] = useState(null);
    const [lastAddedLocation, setLastAddedLocation] = useState(null);
    // Export Schedule dialog state
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [exportFormat, setExportFormat] = useState("csv");
    const [exportRange, setExportRange] = useState("thisWeek");
    const [exportLocation, setExportLocation] = useState("All Locations");
    // Import Employee CSV dialog UI state
    const [showEmpImportDialog, setShowEmpImportDialog] = useState(false);
    const [empImportStep, setEmpImportStep] = useState("upload");
    const [empCsvFile, setEmpCsvFile] = useState(null);
    // Controls whether scheduler should show resources grouping
    const [dataMode, setDataMode] = useState("empty");
    // App-level non-blocking notice
    const [notice, setNotice] = useState(null);
    const [shiftFormError, setShiftFormError] = useState("");
    const notify = useCallback((message, type = "error") => {
        if (!message)
            return;
        const id = Date.now();
        setNotice({ id, message: String(message), type });
        // store timer on function object (TS-safe via cast)
        const self = notify;
        window.clearTimeout(self._t);
        self._t = window.setTimeout(() => {
            setNotice((n) => (n && n.id === id ? null : n));
        }, 4000);
    }, []);
    /** Load from localStorage (but DO NOT seed defaults) */
    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return;
        try {
            const parsed = JSON.parse(raw);
            const emps = Array.isArray(parsed.employees) ? parsed.employees : [];
            const appts = Array.isArray(parsed.appointments) ? parsed.appointments : [];
            const r = Array.isArray(parsed.roles) ? parsed.roles : [];
            const locs = Array.isArray(parsed.locations) ? parsed.locations : ["All Locations"];
            const rm = parsed.roleMeta && typeof parsed.roleMeta === "object" ? parsed.roleMeta : {};
            const lm = parsed.locationMeta && typeof parsed.locationMeta === "object" ? parsed.locationMeta : {};
            setRoleMeta(rm);
            setLocationMeta(lm);
            setEmployees(emps);
            setAppointments(appts);
            setRoles(r);
            setLocations(locs.length ? locs : ["All Locations"]);
            setNextEmployeeId((emps.reduce((m, e) => Math.max(m, e.Id ?? 0), 0) + 1));
            setNextEventId((appts.reduce((m, a) => Math.max(m, a.Id ?? 0), 0) + 1));
        }
        catch (e) {
            console.error("Failed to parse storage", e);
        }
    }, []);
    /** Auto-save */
    useEffect(() => {
        const payload = { employees, appointments, roles, locations, roleMeta, locationMeta };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        try {
            // scheduleRef.current?.refresh?.();
        }
        catch (_) { }
    }, [employees, appointments, roles, locations, roleMeta, locationMeta]);
    /** Derived */
    const hasEmployees = employees.length > 0;
    const hasAnyData = useMemo(() => {
        // NOTE: original code comment had hasLoc but returned only employees/appointments check
        return employees.length > 0 || appointments.length > 0;
    }, [employees.length, appointments.length]);
    const timeScaleConfig = useMemo(() => {
        return { enable: hasAnyData ? false : true, interval: 1440, slotCount: hasAnyData ? 6 : 0 };
    }, [hasAnyData]);
    const effectiveLocations = useMemo(() => {
        const base = locations.length ? locations : ["All Locations"];
        return base.includes("All Locations") ? base : ["All Locations", ...base];
    }, [locations]);
    const filteredAppointments = useMemo(() => {
        if (selectedLocation === "All Locations")
            return appointments;
        return appointments.filter((a) => (a.Location ?? "Main Location") === selectedLocation);
    }, [appointments, selectedLocation]);
    const scheduleData = useMemo(() => {
        return filteredAppointments.map((a) => ({
            Id: a.Id,
            Subject: a.Subject ?? "Shift",
            StartTime: new Date(a.StartTime),
            EndTime: new Date(a.EndTime),
            EmployeeId: a.EmployeeId,
            Role: a.Role ?? "",
            BreakDuration: a.BreakDuration ?? 0,
            Location: a.Location ?? "Main Location",
        }));
    }, [filteredAppointments]);
    const resourceData = useMemo(() => {
        return employees.map((e) => ({
            Text: e.Name,
            Id: e.Id,
            Color: e.Color ?? randomColor(e.Id),
            Role: e.Role,
            EmployeeId: e.Id,
        }));
    }, [employees]);
    const computeTotalHoursForEmployee = useCallback((empId) => {
        const total = filteredAppointments.reduce((sum, a) => {
            if (a.EmployeeId !== empId)
                return sum;
            const start = new Date(a.StartTime);
            const end = new Date(a.EndTime);
            const durH = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            const net = durH - ((a.BreakDuration ?? 0) / 60);
            return sum + Math.max(0, net);
        }, 0);
        return total;
    }, [filteredAppointments]);
    const summaryRows = useMemo(() => {
        const appts = filteredAppointments;
        return (employees ?? []).map((e) => {
            const shifts = appts.filter((a) => a.EmployeeId === e.Id);
            const totalHours = shifts.reduce((sum, a) => {
                const start = new Date(a.StartTime);
                const end = new Date(a.EndTime);
                const durH = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                const net = durH - ((a.BreakDuration ?? 0) / 60);
                return sum + Math.max(0, net);
            }, 0);
            const estCost = totalHours * (e.HourlyRate ?? 0);
            return {
                Id: e.Id,
                Name: e.Name,
                Role: e.Role,
                HourlyRate: e.HourlyRate ?? 0,
                Shifts: shifts.length,
                TotalHours: Number(totalHours.toFixed(2)),
                EstCost: Number(estCost.toFixed(2)),
                MaxHoursDay: e.MaxHoursDay ?? 0,
                MaxHoursWeek: e.MaxHoursWeek ?? 0,
            };
        });
    }, [employees, filteredAppointments]);
    /** Templates */
    const resourceHeaderTemplate = (props) => {
        const empId = props.Id ??
            props.id ??
            props.resourceData?.Id ??
            props.resource?.id ??
            props.resourceId;
        const emp = employees.find((e) => e.Id === empId) ?? {
            Id: empId ?? 0,
            Name: props.Text ?? "Employee",
            Role: props.Role ?? "",
        };
        const totalHours = empId ? computeTotalHoursForEmployee(empId) : 0;
        const shiftCount = empId ? filteredAppointments.filter((a) => a.EmployeeId === empId).length : 0;
        return (_jsxs("div", { className: "resourceHeader", children: [_jsx("div", { className: "resourceName", children: emp.Name }), _jsxs("div", { className: "resourceMeta", children: [shiftCount, " shifts \u2022 ", totalHours.toFixed(1), "h"] })] }));
    };
    const eventTemplate = (props) => {
        const emp = employees.find((e) => e.Id === props.EmployeeId) ?? {};
        return (_jsxs("div", { className: "shiftCard", children: [_jsxs("div", { className: "shiftTime", children: [fmtTime(props.StartTime), " - ", fmtTime(props.EndTime)] }), _jsx("div", { className: "shiftRole", children: emp.Role ?? "" })] }));
    };
    function safeNum(v, fallback = 0) {
        const n = typeof v === "number" ? v : Number(v);
        return Number.isFinite(n) ? n : fallback;
    }
    function dayStartOf(d) {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    }
    // Net hours inside a window [winStart, winEnd) with proportional break allocation.
    function netHoursWithinWindow(evStart, evEnd, breakMins, winStart, winEnd) {
        const s = evStart < winStart ? winStart : evStart;
        const e = evEnd > winEnd ? winEnd : evEnd;
        if (e <= s)
            return 0;
        const msH = 1000 * 60 * 60;
        const overlapH = (e.getTime() - s.getTime()) / msH;
        const totalH = Math.max(0, (evEnd.getTime() - evStart.getTime()) / msH);
        const breakH = safeNum(breakMins, 0) / 60;
        // Allocate break proportionally across the shift duration.
        const breakInOverlap = totalH > 0 ? breakH * (overlapH / totalH) : 0;
        return Math.max(0, overlapH - breakInOverlap);
    }
    function validateCandidate(rec, existingAppointments) {
        const start = new Date(rec.StartTime);
        const end = new Date(rec.EndTime);
        const empId = rec.EmployeeId;
        const breakMins = safeNum(rec.BreakDuration, 0);
        if (end <= start)
            return "End time must be after start time.";
        // overlap check
        for (const a of existingAppointments) {
            if (a.EmployeeId !== empId)
                continue;
            if (a.Id === rec.Id)
                continue;
            const aStart = new Date(a.StartTime);
            const aEnd = new Date(a.EndTime);
            if (overlaps(start, end, aStart, aEnd)) {
                return "Shift overlaps with another shift for the same employee.";
            }
        }
        const emp = employees.find((e) => e.Id === empId);
        if (!emp)
            return null;
        const maxWeek = safeNum(emp.MaxHoursWeek, 0);
        // daily (validate each calendar day spanned by the candidate shift)
        const maxDay = safeNum(emp.MaxHoursDay, 0);
        if (maxDay > 0) {
            // iterate from start-day to end-day inclusive
            let cursor = dayStartOf(start);
            const lastDay = dayStartOf(end);
            while (cursor <= lastDay) {
                const dStart = new Date(cursor);
                const dEnd = new Date(dStart);
                dEnd.setDate(dStart.getDate() + 1);
                // existing events that touch this day
                const eventsThisDay = existingAppointments.filter((a) => a.EmployeeId === empId &&
                    new Date(a.StartTime) < dEnd &&
                    new Date(a.EndTime) > dStart &&
                    a.Id !== rec.Id);
                let totalDayH = 0;
                for (const a of eventsThisDay) {
                    totalDayH += netHoursWithinWindow(new Date(a.StartTime), new Date(a.EndTime), safeNum(a.BreakDuration, 0), dStart, dEnd);
                }
                // add the candidate shift portion that lies in this day window
                totalDayH += netHoursWithinWindow(start, end, breakMins, dStart, dEnd);
                if (totalDayH > maxDay + 1e-6) {
                    return `Daily hours exceed ${maxDay} for ${emp.Name} on ${dStart.toDateString()}`;
                }
                cursor.setDate(cursor.getDate() + 1);
            }
        }
        // -------------------
        // WEEKLY LIMIT (windowed)
        // -------------------
        const ws = startOfWeek(start);
        const we = endOfWeek(start);
        const eventsThisWeek = existingAppointments.filter((a) => a.EmployeeId === empId &&
            new Date(a.StartTime) < we &&
            new Date(a.EndTime) > ws &&
            a.Id !== rec.Id);
        let totalWeekH = 0;
        for (const a of eventsThisWeek) {
            totalWeekH += netHoursWithinWindow(new Date(a.StartTime), new Date(a.EndTime), safeNum(a.BreakDuration, 0), ws, we);
        }
        // Candidate also windowed (fix)
        totalWeekH += netHoursWithinWindow(start, end, breakMins, ws, we);
        if (maxWeek > 0 && totalWeekH > maxWeek + 1e-6) {
            return `Weekly hours exceed ${maxWeek} for ${emp.Name}`;
        }
        return null;
    }
    /** Schedule hooks */
    function onNavigating(args) {
        if (args?.currentDate)
            setSelectedDate(new Date(args.currentDate));
    }
    function onPopupOpen(args) {
        // disable built-in editor
        if (args.type === "Editor")
            args.cancel = true;
    }
    function onCellClick(args) {
        if (!hasEmployees)
            return;
        setShiftFormError("");
        setCellSelection(args);
        if (typeof args.groupIndex === "number" && resourceData[args.groupIndex]) {
            setSelectedEmployeeId(resourceData[args.groupIndex].Id);
        }
        else {
            setSelectedEmployeeId(null);
        }
        setEditingShift(null);
        setShowShiftDialog(true);
    }
    function onEventClick(args) {
        const data = args?.event?.data ?? args?.event;
        const id = data?.Id;
        const appt = appointments.find((a) => a.Id === id) ?? null;
        if (appt) {
            setShiftFormError("");
            setEditingShift(appt);
            setSelectedEmployeeId(appt.EmployeeId);
            setCellSelection({ startTime: appt.StartTime, endTime: appt.EndTime });
            setShowShiftDialog(true);
        }
    }
    function onActionBegin(args) {
        if (args.requestType === "eventCreate" || args.requestType === "eventChange") {
            const records = args.addedRecords ?? args.changedRecords ?? [];
            for (const r of records) {
                const candidate = {
                    Id: r.Id,
                    Subject: r.Subject ?? "Shift",
                    StartTime: new Date(r.StartTime).toISOString(),
                    EndTime: new Date(r.EndTime).toISOString(),
                    EmployeeId: r.EmployeeId,
                    Role: r.Role ?? employees.find((e) => e.Id === r.EmployeeId)?.Role ?? "",
                    BreakDuration: r.BreakDuration ?? 0,
                    Location: r.Location ?? (selectedLocation === "All Locations" ? "Main Location" : selectedLocation),
                };
                // Validation currently disabled in your original file (kept as-is).
                const err = validateCandidate(candidate, appointments);
                if (err) {
                    notify(err, "error");
                    args.cancel = true;
                    return;
                }
                void candidate;
            }
        }
    }
    function onActionComplete(args) {
        if (args.requestType === "eventChanged") {
            const changed = args.changedRecords ?? [];
            setAppointments((prev) => {
                const copy = prev.slice();
                for (const r of changed) {
                    const idx = copy.findIndex((a) => a.Id === r.Id);
                    if (idx < 0)
                        continue;
                    copy[idx] = {
                        ...copy[idx],
                        StartTime: new Date(r.StartTime).toISOString(),
                        EndTime: new Date(r.EndTime).toISOString(),
                        EmployeeId: r.EmployeeId,
                        Role: r.Role ?? copy[idx].Role ?? "",
                        BreakDuration: r.BreakDuration ?? 0,
                    };
                }
                return copy;
            });
        }
        if (args.requestType === "eventRemoved") {
            const removed = args.deletedRecords ?? [];
            const ids = removed.map((r) => r.Id);
            setAppointments((prev) => prev.filter((a) => !ids.includes(a.Id)));
        }
    }
    /** UI actions */
    function loadTestData() {
        setEmployees(defaultEmployees);
        setAppointments(defaultAppointments);
        setRoles(defaultRoles);
        setLocations(defaultLocations);
        setSelectedLocation("All Locations");
        setNextEmployeeId(defaultEmployees.reduce((m, e) => Math.max(m, e.Id), 0) + 1);
        setNextEventId(defaultAppointments.reduce((m, a) => Math.max(m, a.Id), 0) + 1);
    }
    function clearAllData() {
        setEmployees([]);
        setAppointments([]);
        setRoles([]);
        setLocations(["All Locations"]);
        setSelectedLocation("All Locations");
        setNextEmployeeId(1);
        setNextEventId(1);
        setSchedulerDataSource([]);
        setDataMode("empty");
        localStorage.removeItem(STORAGE_KEY);
    }
    function clearShiftsOnly() {
        setAppointments([]);
        setNextEventId(1);
        setTimeout(() => {
            scheduleRef.current?.refreshEvents?.();
        }, 0);
    }
    function clearEverything() {
        setEmployees([]);
        setAppointments([]);
        setRoles([]);
        setLocations(["All Locations"]);
        setSelectedLocation("All Locations");
        setNextEmployeeId(1);
        setNextEventId(1);
        setSchedulerDataSource([]);
        setDataMode("empty");
        localStorage.removeItem(STORAGE_KEY);
        try {
            scheduleRef.current?.refresh?.();
        }
        catch { }
    }
    const importTemplateFn = (data) => {
        const template = '<div class="e-template-btn"><span class="e-btn-icon e-icons e-upload-1 e-icon-left impUploader"></span>${text}</div>';
        return compile(template.trim())(data);
    };
    const onImportClick = (args) => {
        scheduleRef.current?.importICalendar?.(args.event.target.files[0]);
        if (scheduleRef.current?.resources?.length === 0 || scheduleRef.current?.eventSettings?.dataSource?.length === 0) {
            loadTestData();
        }
        setIcsImported(true);
        setShowIcsDialog(false);
    };
    const createUpload = () => {
        const element = document.querySelector(".calendar-import .e-css.e-btn");
        element?.classList.add("e-primary");
    };
    function exportExcel() {
        scheduleRef.current?.exportToExcel?.();
    }
    function printSchedule() {
        try {
            scheduleRef.current?.print?.();
        }
        catch { }
    }
    function exportICS() {
        try {
            scheduleRef.current?.exportToICalendar?.();
        }
        catch {
            notify("ICS export not available.", "error");
        }
    }
    /** Options menu */
    const optionItems = [
        { text: "Import Schedule", id: "importIcs", iconCss: "e-icons e-upload-1" },
        { text: "Export Schedule", id: "exportSchedule", iconCss: "e-icons e-download" },
        { separator: true },
        { text: "Clear Data", id: "clear", iconCss: "e-icons e-trash", cssClass: "danger-item" },
    ];
    function onOptionsSelect(args) {
        const id = args?.item?.id;
        if (id === "print")
            printSchedule();
        if (id === "exportExcel")
            exportExcel();
        if (id === "exportIcs")
            exportICS();
        if (id === "importIcs")
            setShowIcsDialog(true);
        if (id === "exportSchedule") {
            setShowExportDialog(true);
            return;
        }
        if (id === "importEmployees") {
            setEmpImportStep("upload");
            setEmpCsvFile(null);
            setShowEmpImportDialog(true);
            return;
        }
        if (id === "clear") {
            setClearChoice("shifts");
            setShowClearDialog(true);
            return;
        }
    }
    const handleExportFromDialog = () => {
        try {
            if (exportFormat === "csv") {
                exportExcel();
            }
            else if (exportFormat === "ics") {
                exportICS();
            }
            else if (exportFormat === "pdf") {
                printSchedule();
            }
            setShowExportDialog(false);
        }
        catch (e) {
            notify("Export failed.", "error");
            console.error(e);
        }
    };
    /** Employee CRUD */
    function openEmployees() {
        setShowEmployeesDialog(true);
    }
    function saveEmployee(emp) {
        if (emp.Id) {
            setEmployees((prev) => prev.map((p) => (p.Id === emp.Id ? emp : p)));
        }
        else {
            const newEmp = { ...emp, Id: nextEmployeeId, Color: emp.Color ?? randomColor(nextEmployeeId) };
            setEmployees((prev) => [...prev, newEmp]);
            setNextEmployeeId((id) => id + 1);
        }
        setShowEmployeeForm(false);
    }
    function deleteEmployeeById(id) {
        setEmployees((prev) => prev.filter((e) => e.Id !== id));
        setAppointments((prev) => prev.filter((a) => a.EmployeeId !== id));
    }
    /** Roles/Locations managers */
    function addRole(name) {
        const v = String(name ?? "").trim();
        if (!v)
            return;
        setRoles((prev) => (prev.includes(v) ? prev : [...prev, v]));
    }
    function removeRole(name) {
        setRoles((prev) => prev.filter((r) => r !== name));
    }
    function addLocation(name) {
        const v = String(name ?? "").trim();
        if (!v)
            return;
        setLocations((prev) => (prev.includes(v) ? prev : [...prev, v]));
    }
    function removeLocation(name) {
        if (name === "All Locations")
            return;
        setLocations((prev) => prev.filter((l) => l !== name));
        setAppointments((prev) => prev.map((a) => (a.Location === name ? { ...a, Location: "Main Location" } : a)));
        if (selectedLocation === name)
            setSelectedLocation("All Locations");
    }
    /** Shift create/update */
    function createOrUpdateShift(payload) {
        const emp = employees.find((e) => e.Id === payload.employeeId);
        const start = payload.start;
        const end = payload.end;
        const rec = {
            Id: payload.Id ?? nextEventId,
            Subject: "Shift",
            StartTime: start.toISOString(),
            EndTime: end.toISOString(),
            EmployeeId: payload.employeeId,
            Role: payload.role ?? emp?.Role ?? "",
            BreakDuration: payload.breakDuration ?? 0,
            Location: payload.location ?? (selectedLocation === "All Locations" ? "Main Location" : selectedLocation),
            Notes: payload.Notes ?? "",
        };
        // Validation currently disabled in your original file (kept as-is).
        const err = validateCandidate(rec, appointments);
        //if (err) return notify(err, "error");
        if (err) {
            setShiftFormError(err); // set local dialog error
            return; // keep dialog open
        }
        setShiftFormError("");
        if (payload.Id) {
            setAppointments((prev) => prev.map((a) => (a.Id === payload.Id ? rec : a)));
        }
        else {
            setAppointments((prev) => [...prev, rec]);
            setNextEventId((id) => id + 1);
        }
        setShowShiftDialog(false);
    }
    function deleteShift(id) {
        if (!window.confirm("Delete this shift?"))
            return;
        setAppointments((prev) => prev.filter((a) => a.Id !== id));
        setShowShiftDialog(false);
    }
    /**  Roles/Locations dialog rendering */
    const rolesListData = useMemo(() => (roles ?? []).filter(Boolean).map((r) => ({ text: r })), [roles]);
    const onAddRoleClick = () => {
        setEditingRoleName(null);
        setRoleNameInputValue("");
        setRoleDefaultRateValue(15);
        setRoleColorValue("#10b981");
        setRoleFormError("");
        setRolesView("add");
    };
    const onCancelAddRole = () => {
        setRolesView("list");
        setEditingRoleName(null);
        setRoleFormError("");
    };
    const startEditRole = (roleName) => {
        const meta = roleMeta?.[roleName] ?? {};
        setEditingRoleName(roleName);
        setRolesView("add");
        setRoleFormError("");
        setRoleNameInputValue(roleName);
        setRoleDefaultRateValue(typeof meta.rate === "number" ? meta.rate : 15);
        setRoleColorValue(meta.color ?? "#1abc9c");
    };
    const submitRole = () => {
        const name = String(roleNameInputValue ?? "").trim();
        if (!name) {
            setRoleFormError("Role name is required.");
            return;
        }
        const rate = Number(roleDefaultRateValue ?? 0);
        const color = String(roleColorValue ?? "#1abc9c");
        const newKey = roleKey(name);
        //  Duplicate validation (ADD + EDIT)
        const exists = (roles ?? []).some((r) => {
            const rKey = roleKey(r);
            if (editingRoleName) {
                // EDIT: allow same role if it's the same record (case-insensitive safe)
                return rKey === newKey && rKey !== roleKey(editingRoleName);
            }
            // ADD: any match is duplicate
            return rKey === newKey;
        });
        if (exists) {
            setRoleFormError("A role with this name already exists.");
            return;
        }
        // EDIT
        if (editingRoleName) {
            const oldName = editingRoleName;
            if (oldName !== name) {
                setRoles((prev) => prev.map((r) => (r === oldName ? name : r)));
                setEmployees((prev) => prev.map((e) => (e.Role === oldName ? { ...e, Role: name } : e)));
                setAppointments((prev) => prev.map((a) => (a.Role === oldName ? { ...a, Role: name } : a)));
                setRoleMeta((prev) => {
                    const copy = { ...(prev ?? {}) };
                    const old = copy[oldName] ?? { rate: 15, color: "#1abc9c" };
                    delete copy[oldName];
                    copy[name] = { ...old, rate, color };
                    return copy;
                });
            }
            else {
                setRoleMeta((prev) => ({ ...(prev ?? {}), [name]: { rate, color } }));
            }
            setLastAddedRole(name);
            setEditingRoleName(null);
            setRolesView("list");
            setRoleFormError("");
            return;
        }
        // ADD
        addRole(name);
        setRoleMeta((prev) => ({ ...(prev ?? {}), [name]: { rate, color } }));
        setLastAddedRole(name);
        setRolesView("list");
        setRoleFormError("");
    };
    const deleteRoleRow = (roleName) => {
        removeRole(roleName);
        setRoleMeta((prev) => {
            const copy = { ...(prev ?? {}) };
            delete copy[roleName];
            return copy;
        });
    };
    const onAddLocationClick = () => {
        setEditingLocationName(null);
        setLocationNameInputValue("");
        setLocationAddressInputValue("");
        setLocationColorValue("#10b981");
        setLocationFormError("");
        setLocationsView("add");
    };
    const locationsListData = (locations ?? []).filter(Boolean).map((l) => ({ text: String(l) }));
    const startEditLocation = (name) => {
        if (isLockedLocation(name))
            return;
        const meta = locationMeta?.[name] ?? {};
        setEditingLocationName(name);
        setLocationsView("add");
        setLocationFormError("");
        setLocationNameInputValue(name);
        setLocationAddressInputValue(meta.address ?? "");
        setLocationColorValue(meta.color ?? "#10b981");
    };
    const normalizeName = (s) => String(s ?? "").trim();
    const keyName = (s) => normalizeName(s).toLowerCase();
    const normalizeRoleName = (s) => String(s ?? "").trim();
    const roleKey = (s) => normalizeRoleName(s).toLowerCase();
    const DEFAULT_LOCATION_NAME = "All Locations";
    const isLockedLocation = (name) => String(name ?? "").trim().toLowerCase() === DEFAULT_LOCATION_NAME.toLowerCase();
    const submitLocation = () => {
        const newNameRaw = normalizeName(locationNameInputValue);
        if (!newNameRaw) {
            setLocationFormError("Location name is required.");
            return;
        }
        const newKey = keyName(newNameRaw);
        const address = normalizeName(locationAddressInputValue);
        const color = normalizeName(locationColorValue) || "#10b981";
        if (newKey === keyName("All Locations")) {
            setLocationFormError('"All Locations" is reserved. Please choose another name.');
            return;
        }
        // EDIT MODE
        if (editingLocationName) {
            const oldName = editingLocationName;
            const oldKey = keyName(oldName);
            if (oldKey !== newKey) {
                const alreadyExists = (locations ?? []).some((l) => keyName(l) === newKey);
                if (alreadyExists) {
                    setLocationFormError("A location with this name already exists.");
                    return;
                }
                setLocations((prev) => (prev ?? []).map((l) => (l === oldName ? newNameRaw : l)));
                setAppointments((prev) => (prev ?? []).map((a) => (a.Location === oldName ? { ...a, Location: newNameRaw } : a)));
                setSelectedLocation((prev) => (prev === oldName ? newNameRaw : prev));
                setLocationMeta((prev) => {
                    const copy = { ...(prev ?? {}) };
                    const oldMeta = copy[oldName] ?? { address: "", color: "#10b981" };
                    delete copy[oldName];
                    copy[newNameRaw] = { ...oldMeta, address, color };
                    return copy;
                });
            }
            else {
                setLocationMeta((prev) => ({
                    ...(prev ?? {}),
                    [oldName]: { ...(prev?.[oldName] ?? { address: "", color: "#10b981" }), address, color },
                }));
            }
            setLastAddedLocation(newNameRaw);
            setEditingLocationName(null);
            setLocationsView("list");
            setLocationFormError("");
            return;
        }
        // ADD MODE
        const exists = (locations ?? []).some((l) => keyName(l) === newKey);
        if (exists) {
            setLocationFormError("A location with this name already exists.");
            return;
        }
        setLocations((prev) => [...(prev ?? []), newNameRaw]);
        setLocationMeta((prev) => ({ ...(prev ?? {}), [newNameRaw]: { address, color } }));
        setLastAddedLocation(newNameRaw);
        setLocationsView("list");
        setLocationFormError("");
    };
    const deleteLocationRow = (name) => {
        if (isLockedLocation(name))
            return;
        setLocations((prev) => (prev ?? []).filter((l) => l !== name));
        setLocationMeta((prev) => {
            const copy = { ...(prev ?? {}) };
            delete copy[name];
            return copy;
        });
        setSelectedLocation((prev) => (prev === name ? "All Locations" : prev));
        setAppointments((prev) => (prev ?? []).map((a) => (a.Location === name ? { ...a, Location: "All Locations" } : a)));
    };
    const roleItemTemplate = (data) => {
        const roleName = data?.text ?? "";
        const meta = roleMeta?.[roleName] ?? { rate: 15, color: "#10b981" };
        const dotColor = meta.color ?? "#10b981";
        const isNew = lastAddedRole && roleName === lastAddedRole;
        // Format like screenshot: $28.00/hr
        const rateText = `$${Number(meta.rate ?? 0).toFixed(2)}/hr`;
        return (_jsxs("div", { className: `mrRoleRow ${isNew ? "mrRoleRowNew" : ""}`, children: [_jsxs("div", { className: "mrRoleLeft", children: [_jsx("span", { className: "mrRoleDot", style: { backgroundColor: dotColor } }), _jsxs("div", { className: "mrRoleText", children: [_jsx("div", { className: "mrRoleName", title: roleName, children: roleName }), _jsx("div", { className: "mrRoleRate", title: rateText, children: rateText })] })] }), _jsxs("div", { className: "mrRoleActions", onClick: (e) => e.stopPropagation(), children: [_jsx(ButtonComponent, { cssClass: "e-flat e-icon-btn mrIconBtn", iconCss: "e-icons e-edit", title: "Edit", type: "button", onClick: (ev) => {
                                ev?.stopPropagation?.();
                                startEditRole(roleName);
                            } }), _jsx(ButtonComponent, { cssClass: "e-flat e-icon-btn mrIconBtn mrIconDanger", iconCss: "e-icons e-trash", title: "Delete", type: "button", onClick: (ev) => {
                                ev?.stopPropagation?.();
                                deleteRoleRow(roleName);
                            } })] })] }));
    };
    const renderRolesDialogBody = () => {
        if (rolesView === "add") {
            const isEdit = !!editingRoleName;
            return (_jsxs("div", { className: "mrBody", children: [_jsx("div", { className: "mrDivider" }), _jsxs("div", { className: "mrAddWrap", children: [_jsx("div", { className: "mrSectionTitle", children: isEdit ? "Edit Role" : "Add New Role" }), _jsxs("div", { className: "mrField", children: [_jsxs("label", { className: "mrLabel", children: ["Role Name ", _jsx("span", { className: "mrReq", children: "*" })] }), _jsx(TextBoxComponent, { value: roleNameInputValue, placeholder: "e.g., Manager", floatLabelType: "Never", input: (e) => {
                                            setRoleNameInputValue(e.value ?? "");
                                            if (roleFormError)
                                                setRoleFormError("");
                                        }, cssClass: "mrInput" }), roleFormError ? _jsx("div", { className: "mrError", children: roleFormError }) : null] }), _jsxs("div", { className: "mrField", children: [_jsx("label", { className: "mrLabel", children: "$ Default Hourly Rate" }), _jsx(NumericTextBoxComponent, { value: roleDefaultRateValue, min: 0, format: "n2", placeholder: "15.00", change: (e) => setRoleDefaultRateValue(e.value ?? 0), cssClass: "mrInput" }), _jsx("div", { className: "mrHelp", children: "Optional. Employee wages override this default rate." })] }), _jsxs("div", { className: "mrField", children: [_jsx("label", { className: "mrLabel", children: "Color" }), _jsx("div", { className: "mrPaletteWrap", children: _jsx(ColorPickerComponent, { value: roleColorValue, mode: "Palette", inline: false, showButtons: true, columns: 10, change: (args) => {
                                                const next = args?.currentValue?.hex ?? args?.value ?? "#10b981";
                                                setRoleColorValue(next);
                                            } }) })] })] }), _jsxs("div", { className: "mrFooterRight", children: [_jsx(ButtonComponent, { cssClass: "e-outline", type: "button", onClick: onCancelAddRole, children: "Cancel" }), _jsx(ButtonComponent, { cssClass: "e-primary", type: "button", onClick: submitRole, children: isEdit ? "Update Role" : "Add Role" })] })] }));
        }
        const isEmpty = !rolesListData?.length;
        return (_jsxs("div", { className: "mrBody", children: [_jsx("div", { className: "mrDivider" }), _jsxs("div", { className: "mrTopRow", children: [_jsx("div", { className: "mrDesc", children: "Manage job positions and their default hourly rates." }), _jsx(ButtonComponent, { cssClass: "e-primary roldbtn", iconCss: "e-icons e-plus", onClick: onAddRoleClick, children: "Add Role" })] }), _jsx("div", { className: "mrContent", children: isEmpty ? (_jsxs("div", { className: "mrEmpty", children: [_jsx("div", { className: "mrEmptyIcon", "aria-hidden": "true", children: _jsxs("svg", { width: "72", height: "72", viewBox: "0 0 64 64", fill: "none", children: [_jsx("path", { d: "M22 18v-3c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4v3", stroke: "#D1D5DB", strokeWidth: "3", strokeLinecap: "round" }), _jsx("rect", { x: "12", y: "18", width: "40", height: "34", rx: "6", stroke: "#D1D5DB", strokeWidth: "3" })] }) }), _jsx("div", { className: "mrEmptyTitle", children: "No roles added yet." }), _jsx("div", { className: "mrEmptySub", children: "Click \"Add Role\" to get started." })] })) : (_jsx("div", { className: "mrListWrap", children: _jsx(ListViewComponent, { dataSource: rolesListData, fields: { text: "text" }, template: roleItemTemplate, cssClass: "mrListView" }) })) })] }));
    };
    const locationItemTemplate = (data) => {
        const name = data?.text;
        const locked = isLockedLocation(name);
        const meta = locationMeta?.[name] ?? { address: "", color: "#10b981" };
        const dotColor = meta.color ?? "#10b981";
        const isNew = lastAddedLocation && name === lastAddedLocation;
        return (_jsxs("div", { className: `locRow ${isNew ? "locRowNew" : ""}`, children: [_jsxs("div", { className: "locLeft", children: [_jsx("span", { className: "locDot", style: { backgroundColor: dotColor } }), _jsxs("div", { className: "locText", children: [_jsx("div", { className: "locName", title: name, children: name }), meta.address ? (_jsx("div", { className: "locAddress", title: meta.address, children: meta.address })) : null] }), locked ? _jsx("span", { className: "locPill", children: "Default" }) : null] }), _jsxs("div", { className: "locActions", onClick: (e) => e.stopPropagation(), children: [_jsx(ButtonComponent
                        //cssClass="locSfIcon e-flat e-icon-btn"
                        , { 
                            //cssClass="locSfIcon e-flat e-icon-btn"
                            cssClass: `locSfIcon e-flat e-icon-btn ${locked ? "locIconLocked" : ""}`, iconCss: "e-icons e-edit", disabled: locked, title: locked ? "Default location cannot be edited" : "Edit", onClick: (ev) => {
                                ev.stopPropagation();
                                startEditLocation(name);
                            } }), _jsx(ButtonComponent, { cssClass: `locSfIcon locSfDanger e-flat e-icon-btn ${locked ? "locIconLocked" : ""}`, 
                            //cssClass="locSfIcon locSfDanger e-flat e-icon-btn"
                            iconCss: "e-icons e-trash", disabled: locked, title: locked ? "Default location cannot be deleted" : "Delete", onClick: (ev) => {
                                ev.stopPropagation();
                                deleteLocationRow(name);
                            } })] })] }));
    };
    const renderLocationsDialogBody = () => {
        const isEmpty = !locationsListData?.length;
        if (locationsView === "add") {
            const isEdit = !!editingLocationName;
            return (_jsxs("div", { className: "mlBody", children: [_jsx("div", { className: "mlDivider" }), _jsxs("div", { className: "mlAddWrap", children: [_jsx("div", { className: "mlSectionTitle", children: isEdit ? "Edit Location" : "Add New Location" }), _jsxs("div", { className: "mlField", children: [_jsxs("label", { className: "mlLabel", children: ["Location Name ", _jsx("span", { className: "mlReq", children: "*" })] }), _jsx(TextBoxComponent, { value: locationNameInputValue, placeholder: "e.g., Main Office, Downtown Store", input: (e) => {
                                            setLocationNameInputValue(e.value ?? "");
                                            if (locationFormError)
                                                setLocationFormError("");
                                        }, cssClass: "mlInput" }), locationFormError ? _jsx("div", { className: "mlError", children: locationFormError }) : null] }), _jsxs("div", { className: "mlField", children: [_jsx("label", { className: "mlLabel", children: "Address" }), _jsx(TextBoxComponent, { value: locationAddressInputValue, placeholder: "e.g., 123 Main St, City, State", input: (e) => setLocationAddressInputValue(e.value ?? ""), cssClass: "mlInput" })] }), _jsxs("div", { className: "mlField", children: [_jsx("label", { className: "mlLabel", children: "Color" }), _jsx("div", { className: "mlPaletteWrap", children: _jsx(ColorPickerComponent, { value: locationColorValue, mode: "Palette", inline: false, showButtons: true, change: (args) => {
                                                const next = args?.currentValue?.hex ?? args?.value ?? "#10b981";
                                                setLocationColorValue(next);
                                            } }) })] })] }), _jsxs("div", { className: "mlFooterRight", children: [_jsx(ButtonComponent, { cssClass: "e-outline", type: "button", onClick: () => {
                                    setLocationsView("list");
                                    setLocationFormError("");
                                    setEditingLocationName(null);
                                }, children: "Cancel" }), _jsx(ButtonComponent, { cssClass: "e-primary", type: "button", onClick: submitLocation, children: isEdit ? "Update Location" : "Add Location" })] })] }));
        }
        return (_jsxs("div", { className: "mlBody", children: [_jsx("div", { className: "mlDivider" }), _jsxs("div", { className: "mlTopRow", children: [_jsx("div", { className: "mlDesc", children: "Manage your business locations and their settings." }), _jsx(ButtonComponent, { cssClass: "e-primary locbtn", iconCss: "e-icons e-plus", type: "button", onClick: onAddLocationClick, children: "Add Location" })] }), _jsx("div", { className: "mlContent", children: isEmpty ? (_jsxs("div", { className: "mlEmpty", children: [_jsx("div", { className: "mlEmptyIcon", "aria-hidden": "true", children: _jsxs("svg", { width: "78", height: "78", viewBox: "0 0 64 64", fill: "none", children: [_jsx("path", { d: "M32 56s16-14.7 16-28c0-8.8-7.2-16-16-16S16 19.2 16 28c0 13.3 16 28 16 28Z", stroke: "#D1D5DB", strokeWidth: "3", strokeLinejoin: "round" }), _jsx("circle", { cx: "32", cy: "28", r: "6", stroke: "#D1D5DB", strokeWidth: "3" })] }) }), _jsx("div", { className: "mlEmptyTitle", children: "No locations added yet." }), _jsx("div", { className: "mlEmptySub", children: "Click \"Add Location\" to get started." })] })) : (_jsx("div", { className: "mlListWrap", children: _jsx(ListViewComponent, { dataSource: locationsListData, fields: { text: "text" }, template: locationItemTemplate, cssClass: "mlListView" }) })) })] }));
    };
    const showEmpty = employees.length === 0;
    const empCount = employees?.length ?? 0;
    const shiftCount = appointments?.length ?? 0;
    return (_jsxs("div", { className: "appRoot", children: [_jsx("style", { children: `
        .appRoot { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; background:#f7fafc; min-height:95vh; }
        .topBar { position:relative; top:0; z-index:10; background:rgba(79, 70, 229);color:#fff; border-bottom:1px solid #e6edf3; }
        .topInner { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 16px; }
        .leftBlock { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .chips { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
        .stickyPromoBar{ background:rgb(238, 243, 246) ; border-bottom:1px solid #e6edf3;}
        .board { background:#fff; border:1px solid #e6edf3; border-radius:14px; overflow:hidden; position:relative; }
        .shiftCard { padding:15px 15px; border-radius:10px; }
        .shiftTime { font-weight:500; font-size:12px; color:#111827; }
        .shiftRole { font-size:12px; color:#374151; margin-top:4px; }
        .resourceHeader { padding:8px 10px; }
        .resourceName { font-weight:500; color:#111827; }
        .resourceRole { font-size:12px; color:#6b7280; margin-top:2px; }
        .resourceMeta { font-size:12px; color:#9ca3af; margin-top:4px; }
        .emptyOverlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:5; }
        .emptyCard { width:650px; padding:18px; border-radius:16px; text-align:center; background:#fff; }
        .emptyBtns { display:flex; gap:10px; justify-content:center; margin-top:14px; flex-wrap:wrap; }
        .noticeBar{ position:sticky; top:56px; z-index:11; margin:8px 16px 0; padding:10px 12px; border-radius:12px; font-size:13px; font-weight:700; display:flex; align-items:center; gap:10px; }
        .noticeBar.info{ background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
        .noticeBar.success{ background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; }
        .noticeBar.error{ background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; }
        .labelRow { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .labelRow .e-btn { padding:0 6px; }
        .hintText{ margin-top:6px; font-size:12px; color:#6b7280; font-weight:600; }
        .formError{ margin-top:10px; padding:10px 12px; border-radius:12px; background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; font-size:13px; font-weight:700; }
      ` }), _jsx("div", { className: "topBar", children: _jsxs("div", { className: "topInner", children: [_jsx("div", { className: "leftBlock", children: _jsxs("div", { className: "chips", children: [_jsx(DropDownListComponent, { id: "location", dataSource: effectiveLocations, value: selectedLocation, change: (e) => setSelectedLocation(e.value), width: "160px", cssClass: "custom-locations-dropdown e-flaat " }), _jsxs(ButtonComponent, { cssClass: "manage-locations-btn e-flat", onClick: () => {
                                            setLocationsView("list");
                                            setLocationFormError("");
                                            setEditingLocationName(null);
                                            setShowLocationsDialog(true);
                                        }, children: [_jsx("span", { className: "e-icons e-location", children: " " }), "Locations"] }), _jsxs(ButtonComponent, { cssClass: "manage-locations-btn e-flat", onClick: openEmployees, children: [_jsx("span", { className: "e-icons e-people", children: " " }), "Employees"] }), _jsxs(ButtonComponent, { cssClass: "manage-locations-btn e-flat", onClick: () => {
                                            setRolesView("list");
                                            setRoleFormError("");
                                            setEditingRoleName(null);
                                            setShowRolesDialog(true);
                                        }, children: [_jsx("span", { className: "e-icons e-equalto" }), "Roles"] }), _jsxs(ButtonComponent, { cssClass: "manage-locations-btn e-flat", onClick: loadTestData, children: [_jsx("span", { className: "e-icons  e-rephrase" }), "Show Test Data"] }), _jsxs(ButtonComponent, { cssClass: "manage-locations-btn e-flat", onClick: () => setShowSummaryDialog(true), children: [_jsx("span", { className: "e-icons e-properties-2" }), "Summary"] }), _jsx(DropDownButtonComponent, { cssClass: "options-btn e-flat", iconCss: "e-icons e-more-vertical-2", items: optionItems, content: "Options", select: onOptionsSelect })] }) }), _jsx("div", { className: "rightBlock", children: _jsxs("a", { className: "poweredBy", href: "https://www.syncfusion.com/react-components/react-scheduler", target: "_blank", rel: "noreferrer", title: "Powered by Syncfusion Scheduler", children: [_jsx("span", { className: "poweredBy__icon", "aria-hidden": "true" }), _jsxs("span", { className: "poweredBy__text", children: [_jsx("span", { className: "poweredBy__label", children: "Powered by" }), _jsx("span", { className: "poweredBy__link", children: " Syncfusion Scheduler " })] })] }) })] }) }), notice && (_jsxs("div", { className: `noticeBar ${notice.type}`, children: [_jsx("span", { className: notice.type === "success"
                            ? "e-icons e-check"
                            : notice.type === "info"
                                ? "e-icons e-info"
                                : "e-icons e-warning" }), _jsx("div", { children: notice.message })] })), _jsx("div", { className: "container", children: _jsxs("div", { className: "board", children: [showEmpty && (_jsx("div", { className: "emptyOverlay", children: _jsxs("div", { className: "emptyCard", children: [_jsxs("div", { className: "emptyBtns", children: [_jsx(ButtonComponent, { cssClass: "add-employee-btn e-outline", onClick: () => {
                                                    setEditingEmployee(null);
                                                    setShowEmployeesDialog(true);
                                                }, children: _jsxs("span", { className: "btn-text", children: [_jsx("span", { className: "e-icons e-people" }), " ", _jsx("span", { children: "+ Add" }), " Employees"] }) }), _jsxs(ButtonComponent, { cssClass: "add-roles-btn e-outline", onClick: () => {
                                                    setRolesView("list");
                                                    setRoleFormError("");
                                                    setShowRolesDialog(true);
                                                }, children: [_jsx("span", { className: "e-icons e-equalto" }), _jsx("span", { className: "hidden sm:inline", children: "+ Add" }), " Roles"] }), _jsxs(ButtonComponent, { cssClass: "add-locations-btn e-outline", onClick: () => {
                                                    setLocationsView("list");
                                                    setLocationFormError("");
                                                    setShowLocationsDialog(true);
                                                }, children: [_jsx("span", { className: "e-icons e-location" }), " + Add Locations"] }), _jsx(ButtonComponent, { cssClass: "test-data-btn e-outline", onClick: loadTestData, children: "\u2728 Test Data" })] }), _jsx("br", {}), _jsx("div", { className: "emptyTitle", children: "No employees added yet" }), _jsx("div", { className: "emptyDesc", children: "Add employees to start scheduling" })] }) })), _jsxs(ScheduleComponent, { ref: scheduleRef, height: "calc(100vh - 135px)", selectedDate: selectedDate, currentView: "TimelineWeek", navigating: onNavigating, popupOpen: onPopupOpen, cellClick: onCellClick, eventClick: onEventClick, allowDragAndDrop: hasEmployees, allowResizing: hasEmployees, timeScale: timeScaleConfig, rowAutoHeight: true, startHour: "00:00", endHour: "24:00", workDays: [1, 2, 3, 4, 5, 6], showWeekend: false, workHours: { start: "6:00", end: "20:00 " }, firstDayOfWeek: 1, eventSettings: { dataSource: scheduleData, template: eventTemplate }, group: { resources: ["Employees"] }, resourceHeaderTemplate: resourceHeaderTemplate, actionBegin: onActionBegin, actionComplete: onActionComplete, children: [_jsx(ResourcesDirective, { children: _jsx(ResourceDirective, { field: "EmployeeId", title: "Employee", name: "Employees", dataSource: resourceData, textField: "Text", idField: "Id", colorField: "Color" }) }), _jsxs(ViewsDirective, { children: [_jsx(ViewDirective, { option: "TimelineDay" }), _jsx(ViewDirective, { option: "TimelineWeek" }), _jsx(ViewDirective, { option: "TimelineMonth" })] }), _jsx(Inject, { services: [TimelineViews, TimelineMonth, Month, Week, Day, Resize, DragAndDrop, Print, ICalendarExport, ICalendarImport, ExcelExport] })] }, `${hasAnyData ? "schedule-has-data" : "schedule-empty"}-${hasEmployees ? "with-emps" : "no-emps"}`)] }) }), _jsx(DialogComponent
            // cssClass="responsiveDlg dlgClear dlgEmployees dlgImport dlgEmployeeForm dlgRoles dlgLocations dlgShift dlgSummary dlgExport"
            , { 
                // cssClass="responsiveDlg dlgClear dlgEmployees dlgImport dlgEmployeeForm dlgRoles dlgLocations dlgShift dlgSummary dlgExport"
                id: "clearData", header: "Clear Data", visible: showClearDialog, isModal: true, showCloseIcon: true, width: "min(92vw, 550px)", height: "min(88vh, 620px)", animationSettings: { effect: "None" }, target: dialogTarget, beforeClose: () => setShowClearDialog(false), children: _jsxs("div", { style: { padding: 16 }, children: [_jsxs("div", { style: {
                                border: "1px solid #f5d0a6",
                                background: "#fff7ed",
                                borderRadius: 12,
                                padding: 14,
                                display: "flex",
                                gap: 12,
                                alignItems: "flex-start",
                                marginBottom: 14,
                            }, children: [_jsx("span", { className: "e-icons e-warning", style: { color: "#f97316", marginTop: 2 } }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 500, color: "#9a3412" }, children: "Warning: This action cannot be undone" }), _jsx("div", { style: { color: "#9a3412", fontSize: 13, marginTop: 4 }, children: "Choose what data you want to clear. All cleared data will be permanently deleted." })] })] }), _jsxs("div", { className: "cdChoices", children: [_jsxs("div", { className: "cdCard " + (clearChoice === "shifts" ? "cdCardActive" : ""), onClick: () => setClearChoice("shifts"), role: "button", tabIndex: 0, children: [_jsx("div", { className: "cdIconWrap cdIconNeutral", children: _jsx("span", { className: "e-input-group-icon e-date-icon e-icons " }) }), _jsxs("div", { className: "cdCardBody", children: [_jsx("div", { className: "cdCardTitle", children: "Clear Shifts Only" }), _jsxs("div", { className: "cdCardDesc", children: ["Remove all ", _jsx("b", { children: shiftCount }), " shifts but keep employees"] }), _jsx("div", { className: "cdCardSub", children: "Employees and their settings will remain intact" })] })] }), _jsxs("div", { className: "cdCard cdCardDanger " + (clearChoice === "everything" ? "cdCardDangerActive" : ""), onClick: () => setClearChoice("everything"), role: "button", tabIndex: 0, children: [_jsx("div", { className: "cdIconWrap cdIconDanger", children: _jsx("span", { className: "e-icons e-trash" }) }), _jsxs("div", { className: "cdCardBody", children: [_jsx("div", { className: "cdCardTitle", children: "Clear Everything" }), _jsxs("div", { className: "cdCardDesc", children: ["Remove all ", _jsx("b", { children: empCount }), " employees and ", _jsx("b", { children: shiftCount }), " shifts"] }), _jsx("div", { className: "cdCardSub", children: "Start fresh with a completely empty schedule" })] })] })] }), _jsxs("div", { style: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, padding: 30 }, children: [_jsx(ButtonComponent, { cssClass: "e-outline", onClick: () => setShowClearDialog(false), children: "Cancel" }), _jsxs(ButtonComponent, { cssClass: clearChoice === "everything" ? "cdBtnDanger" : "cdBtnWarn", onClick: () => {
                                        if (clearChoice === "everything")
                                            clearEverything();
                                        else
                                            clearShiftsOnly();
                                        setShowClearDialog(false);
                                    }, children: [_jsx("span", { className: "e-icons " +
                                                (clearChoice === "everything" ? "e-trash" : "e-input-group-icon e-date-icon e-icons"), style: { marginRight: 8 } }), clearChoice === "everything" ? "Clear Everything" : "Clear Shifts"] })] })] }) }), _jsx(DialogComponent, { visible: showEmployeesDialog, width: "min(92vw, 620px)", height: "min(88vh, 720px)", isModal: true, showCloseIcon: false, target: dialogTarget, animationSettings: { effect: "None" }, beforeClose: () => setShowEmployeesDialog(false), children: _jsx(ManageEmployeesList, { employees: employees, appointments: filteredAppointments, onAdd: () => {
                        setEditingEmployee(null);
                        setShowEmployeeForm(true);
                    }, onEdit: (emp) => {
                        setEditingEmployee(emp);
                        setShowEmployeeForm(true);
                    }, onDelete: (empId) => deleteEmployeeById(empId), onClose: () => setShowEmployeesDialog(false) }) }), _jsx(DialogComponent, { visible: showIcsDialog, id: "importdialog", header: "Import Schedule", isModal: true, showCloseIcon: true, width: "min(92vw, 620px)", height: "min(88vh, 550px)", animationSettings: { effect: "None" }, target: dialogTarget, beforeClose: () => {
                    setShowIcsDialog(false);
                    setIcsFile(null);
                    try {
                        icsUploaderRef.current?.clearAll?.();
                    }
                    catch { }
                }, children: _jsxs("div", { className: "impWrap", children: [_jsx("div", { className: "impHeader" }), _jsx("div", { className: "impDivider" }), _jsx("div", { className: "impUploadBox", children: _jsxs("div", { className: "impDropZone", children: [_jsx("div", { className: "impCloudIcon", children: _jsx("span", { className: "e-icons e-upload-1 impCloudIcon" }) }), _jsx("div", { className: "impMainText", children: "Upload your ICS file only." }), _jsx(UploaderComponent, { id: "fileUpload", type: "file", allowedExtensions: ".ics", cssClass: "calendar-import", buttons: { browse: 'Choose File' }, multiple: false, showFileList: false, selected: onImportClick, created: createUpload })] }) })] }) }), _jsx(DialogComponent, { visible: showEmployeeForm, width: "min(92vw, 620px)", height: "min(88vh, 720px)", id: "empform", animationSettings: { effect: "None" }, isModal: true, showCloseIcon: false, target: dialogTarget, beforeClose: () => { setShowEmployeeForm(false); setEditingEmployee(null); }, children: _jsx(EmployeeForm, { initial: editingEmployee, open: showEmployeeForm, roles: roles, employees: employees, onOpenRoles: () => setShowRolesDialog(true), onCancel: () => setShowEmployeeForm(false), onSave: (emp) => saveEmployee(emp), onDelete: (id) => deleteEmployeeById(id) }) }), _jsx(DialogComponent, { id: "roledialog", visible: showRolesDialog, header: "Manage Roles", width: "min(92vw, 490px)", height: "min(88vh, 450px)", showCloseIcon: true, animationSettings: { effect: "None" }, isModal: true, target: dialogTarget, cssClass: "mrDialog", beforeClose: () => {
                    setShowRolesDialog(false);
                    setRolesView("list");
                    setRoleFormError("");
                    setEditingRoleName(null);
                }, children: renderRolesDialogBody() }), _jsx(DialogComponent, { id: "locationdialog", visible: showLocationsDialog, header: "Manage Locations", width: "min(92vw, 490px)", height: "min(88vh, 430px)", isModal: true, showCloseIcon: true, target: dialogTarget, animationSettings: { effect: "None" }, cssClass: "mlDialog", beforeClose: () => {
                    setShowLocationsDialog(false);
                    setLocationsView("list");
                    setLocationFormError("");
                    setEditingLocationName(null);
                }, children: renderLocationsDialogBody() }), _jsx(DialogComponent, { header: editingShift ? "Edit Shift" : "Create Shift", visible: showShiftDialog, width: "min(92vw, 920px)", height: "min(88vh, 720px)", 
                // height="110vh"
                isModal: true, showCloseIcon: true, target: dialogTarget, animationSettings: { effect: "None" }, id: "shiftdialog", beforeClose: () => { setShowShiftDialog(false); setShiftFormError(""); }, children: _jsx(ShiftDialog, { employees: employees, roles: roles, locations: locations, selectedLocation: selectedLocation, selectedEmployeeId: selectedEmployeeId, cell: cellSelection, initialEvent: editingShift, formError: shiftFormError, onClearError: () => setShiftFormError(""), onCancel: () => {
                        setShowShiftDialog(false);
                        setShiftFormError(""); // clear on cancel
                    }, onSubmit: createOrUpdateShift, onDelete: (id) => deleteShift(id) }) }), _jsx(DialogComponent, { header: `Summary (${selectedLocation})`, visible: showSummaryDialog, height: "min(88vh, 720px)", animationSettings: { effect: "None" }, isModal: true, showCloseIcon: true, target: dialogTarget, beforeClose: () => setShowSummaryDialog(false), children: _jsx("div", { style: { padding: 10 }, children: _jsxs(GridComponent, { dataSource: summaryRows, children: [_jsxs(ColumnsDirective, { children: [_jsx(ColumnDirective, { field: "Id", headerText: "ID", width: "80", textAlign: "Right" }), _jsx(ColumnDirective, { field: "Name", headerText: "Employee", width: "200" }), _jsx(ColumnDirective, { field: "Role", headerText: "Role", width: "140" }), _jsx(ColumnDirective, { field: "Shifts", headerText: "Shifts", width: "100", textAlign: "Right" }), _jsx(ColumnDirective, { field: "TotalHours", headerText: "Total Hours", width: "130", textAlign: "Right" }), _jsx(ColumnDirective, { field: "HourlyRate", headerText: "Hourly Rate", width: "130", textAlign: "Right" }), _jsx(ColumnDirective, { field: "EstCost", headerText: "Est. Cost", width: "130", textAlign: "Right" }), _jsx(ColumnDirective, { field: "MaxHoursDay", headerText: "Max/Day", width: "120", textAlign: "Right" }), _jsx(ColumnDirective, { field: "MaxHoursWeek", headerText: "Max/Week", width: "120", textAlign: "Right" })] }), _jsx(GridInject, { services: [Page] })] }) }) }), _jsx(DialogComponent, { visible: showExportDialog, id: "Exportdialog", header: "Export Schedule", isModal: true, animationSettings: { effect: "None" }, showCloseIcon: true, width: "min(92vw, 620px)", height: "min(88vh, 450px)", target: dialogTarget, beforeClose: () => setShowExportDialog(false), children: _jsxs("div", { className: "exportDlgBody", children: [_jsx("div", { className: "exportSectionTitle", children: "Export Format" }), _jsxs("div", { className: "exportFormatGrid", children: [_jsxs(ButtonComponent, { type: "button", cssClass: "exportFormatCard " + (exportFormat === "csv" ? "active" : ""), onClick: () => setExportFormat("csv"), children: [_jsx("span", { className: "e-icons e-export exportCardIcon" }), _jsx("div", { className: "exportCardLabel", children: "CSV (Excel)" })] }), _jsxs(ButtonComponent, { type: "button", cssClass: "exportFormatCard " + (exportFormat === "pdf" ? "active" : ""), onClick: () => setExportFormat("pdf"), children: [_jsx("span", { className: "e-icons e-export-pdf exportCardIcon" }), _jsx("div", { className: "exportCardLabel", children: "PDF" })] }), _jsxs(ButtonComponent, { type: "button", cssClass: "exportFormatCard " + (exportFormat === "ics" ? "active" : ""), onClick: () => setExportFormat("ics"), children: [_jsx("span", { className: "e-icons e-download exportCardIcon" }), _jsx("div", { className: "exportCardLabel", children: "ICS" })] })] }), _jsxs("div", { className: "exportDlgFooter", children: [_jsx(ButtonComponent, { cssClass: "e-outline", type: "button", onClick: () => setShowExportDialog(false), children: "Cancel" }), _jsxs(ButtonComponent, { cssClass: "e-primary", type: "button", onClick: handleExportFromDialog, children: [_jsx("span", { className: "e-icons e-download", style: { marginRight: 8 } }), exportFormat === "csv" ? "Export CSV" : exportFormat === "ics" ? "Export ICS" : "Export PDF"] })] })] }) }), _jsx(StickySchedulerFooterPromo, {})] }));
}
function initials(name) {
    const parts = String(name ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length)
        return "??";
    const a = parts[0]?.[0] ?? "";
    const b = parts.length > 1 ? (parts[1]?.[0] ?? "") : (parts[0]?.[1] ?? "");
    return (a + b).toUpperCase();
}
function ManageEmployeesList({ employees, appointments, onAdd, onEdit, onDelete, onClose }) {
    const total = employees?.length ?? 0;
    const shiftsCount = (empId) => (appointments ?? []).filter((a) => a.EmployeeId === empId).length;
    const maxWeekText = (e) => (e?.MaxHoursWeek ? `Max: ${e.MaxHoursWeek}h/week` : "Max: —");
    return (_jsxs("div", { className: "empModal", children: [_jsxs("div", { className: "empModalHeader", children: [_jsx("div", { className: "empModalTitle", children: "Manage Employees" }), _jsx(ButtonComponent, { className: "e-dlg-closeicon-btn e-control e-btn e-lib e-flat e-icon-btn", iconCss: "e-icons e-close", type: "button", onClick: onClose })] }), _jsx("div", { className: "empModalDivider" }), _jsxs("div", { className: "empTopRow", children: [_jsxs("div", { className: "empCount", children: [_jsx("span", { className: "e-icons e-user empCountIcon" }), _jsxs("span", { children: [total, " employees"] })] }), _jsx(ButtonComponent, { cssClass: "e-primary", type: "button", onClick: onAdd, children: "+ Add Employee" })] }), total === 0 ? (_jsxs("div", { className: "empEmptyWrap", children: [_jsx("div", { className: "empEmptyIcon", children: _jsxs("svg", { width: "76", height: "76", viewBox: "0 0 64 64", fill: "none", "aria-hidden": "true", children: [_jsx("path", { d: "M32 31c6.2 0 11.2-5 11.2-11.2S38.2 8.6 32 8.6 20.8 13.6 20.8 19.8 25.8 31 32 31Z", stroke: "#D1D5DB", strokeWidth: "3" }), _jsx("path", { d: "M12 55c2.6-10 11-16 20-16s17.4 6 20 16", stroke: "#D1D5DB", strokeWidth: "3", strokeLinecap: "round" }), _jsx("path", { d: "M50 30c3.7 0 6.7-3 6.7-6.7S53.7 16.6 50 16.6", stroke: "#D1D5DB", strokeWidth: "3", strokeLinecap: "round" }), _jsx("path", { d: "M46.2 38c4.8.9 8.6 3.6 10.8 8", stroke: "#D1D5DB", strokeWidth: "3", strokeLinecap: "round" })] }) }), _jsx("div", { className: "empEmptyTitle", children: "No employees yet" }), _jsx("div", { className: "empEmptyText", children: "Get started by adding your first employee to begin scheduling shifts." }), _jsx(ButtonComponent, { cssClass: "e-primary empEmptyCta", onClick: onAdd, children: "+ Add Your First Employee" })] })) : (_jsx("div", { className: "empList", children: (employees ?? []).map((e) => (_jsxs("div", { className: "empRow", children: [_jsxs("div", { className: "empLeft", children: [_jsx("div", { className: "empAvatar", style: { background: e.Color ?? "#e5e7eb" }, title: e.Name, children: initials(e.Name) }), _jsxs("div", { children: [_jsx("div", { className: "empName", children: e.Name }), _jsxs("div", { className: "empMeta", children: [maxWeekText(e), " \u2022 ", shiftsCount(e.Id), " shifts"] })] })] }), _jsxs("div", { className: "empActions", children: [_jsx(ButtonComponent, { cssClass: "e-flat empIconBtn", onClick: () => onEdit(e), title: "Edit", children: _jsx("span", { className: "e-icons e-edit" }) }), _jsx(ButtonComponent, { cssClass: "e-flat empIconBtn empSfDanger", iconCss: "e-icons e-trash", onClick: () => {
                                        if (window.confirm("Delete employee and all their shifts?"))
                                            onDelete(e.Id);
                                    }, title: "Delete" })] })] }, e.Id))) }))] }));
}
const DEFAULT_COLOR = "#10b981";
const normalizeEmpName = (s) => String(s ?? "").trim().toLowerCase();
function EmployeeForm({ initial, open, roles, employees, onSave, onDelete, onCancel, onOpenRoles }) {
    const isEdit = !!initial?.Id;
    const [name, setName] = useState(initial?.Name ?? "");
    const [hourly, setHourly] = useState(initial?.HourlyRate ?? 15);
    const [maxWeek, setMaxWeek] = useState(initial?.MaxHoursWeek ?? 40);
    const [minRest, setMinRest] = useState(initial?.MinHoursBetweenShifts ?? 8);
    const [assignedRoles, setAssignedRoles] = useState(initial?.AssignedRoles ?? (initial?.Role ? [initial.Role] : []));
    const [color, setColor] = useState(initial?.Color ?? DEFAULT_COLOR);
    const [formError, setFormError] = useState("");
    const [nameError, setNameError] = useState("");
    const formRef = useRef(null);
    const fvRef = useRef(null);
    const roleOptions = useMemo(() => (roles ?? []).filter(Boolean), [roles]);
    useEffect(() => {
        if (!open)
            return;
        setName(initial?.Name ?? "");
        setHourly(initial?.HourlyRate ?? 15);
        setMaxWeek(initial?.MaxHoursWeek ?? 40);
        setMinRest(initial?.MinHoursBetweenShifts ?? 8);
        setColor(initial?.Color ?? DEFAULT_COLOR);
        const initRoles = initial?.AssignedRoles ?? (initial?.Role ? [initial.Role] : []);
        setAssignedRoles(initRoles);
        setFormError("");
        setNameError(""); // clear name exists error each time dialog opens
    }, [open, initial]);
    useEffect(() => {
        if (!formRef.current)
            return;
        const t = window.setTimeout(() => {
            try {
                fvRef.current?.destroy?.();
            }
            catch { }
            fvRef.current = new FormValidator(formRef.current, {
                rules: {
                    Name: { required: [true, "Name is required"] },
                    HourlyRate: { min: [0, "Hourly Wage must be 0 or more"] },
                    MaxHoursWeek: { min: [0, "Max Hours/Week must be 0 or more"], max: [48, "Max 48 hours/week"] },
                    MinRest: { min: [0, "Min hours must be 0 or more"], max: [24, "Please enter a valid value"] },
                },
            });
        }, 0);
        return () => {
            window.clearTimeout(t);
            try {
                fvRef.current?.destroy?.();
            }
            catch { }
        };
    }, []);
    const toggleRole = (r) => {
        setAssignedRoles((prev) => {
            const has = prev.includes(r);
            return has ? prev.filter((x) => x !== r) : [...prev, r];
        });
    };
    const submit = () => {
        setFormError("");
        setNameError(""); // clear old error
        const trimmed = String(name ?? "").trim();
        // required check (extra safety)
        if (!trimmed) {
            setNameError("Name is required");
            setFormError("Please fix the highlighted fields.");
            return;
        }
        // Duplicate check ONLY on submit
        const newKey = normalizeEmpName(trimmed);
        const currentId = initial?.Id ?? 0;
        const duplicate = (employees ?? []).some((e) => normalizeEmpName(e.Name) === newKey && e.Id !== currentId);
        if (duplicate) {
            setNameError("Employee name already exists.");
            setFormError("Please fix the highlighted fields.");
            return;
        }
        // existing validator rules
        const ok = fvRef.current ? fvRef.current.validate() : true;
        if (!ok) {
            setFormError("Please fix the highlighted fields.");
            return;
        }
        const roleSingle = assignedRoles[0] ?? "";
        onSave({
            Id: initial?.Id ?? 0,
            Name: trimmed,
            Role: roleSingle,
            AssignedRoles: assignedRoles,
            HourlyRate: Number(hourly ?? 0),
            MaxHoursWeek: Number(maxWeek ?? 0),
            MinHoursBetweenShifts: Number(minRest ?? 0),
            Color: String(color ?? DEFAULT_COLOR).trim(),
        });
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "empAddHeader", children: [_jsx("div", { className: "empAddTitle", children: isEdit ? "Edit Employee" : "Add Employee" }), _jsx(ButtonComponent, { cssClass: "e-dlg-closeicon-btn e-control e-btn e-lib e-flat e-icon-btn", type: "button", onClick: onCancel, children: _jsx("span", { className: "e-icons e-close" }) })] }), _jsxs("form", { ref: formRef, className: "empAddForm", onSubmit: (e) => e.preventDefault(), noValidate: true, children: [_jsx("div", { className: "empAddDivider" }), formError ? _jsx("div", { className: "empFormError", children: formError }) : null, _jsxs("div", { className: "empAddBody", children: [_jsxs("div", { className: "empFieldBlock", children: [_jsx("label", { className: "empLabel", children: "Name *" }), _jsx(TextBoxComponent, { id: "Name", name: "Name", value: name, placeholder: "Enter employee name", input: (e) => setName(e.value ?? "") }), nameError ? _jsx("div", { className: "mrError", children: nameError }) : null] }), _jsxs("div", { className: "empFieldBlock", children: [_jsx("label", { className: "empLabel", children: "Color" }), _jsx("div", { className: "empColorRow", children: _jsx(ColorPickerComponent, { id: "EmpColor", value: color ?? DEFAULT_COLOR, mode: "Palette", inline: false, showButtons: true, columns: 12, change: (args) => {
                                                const next = args?.currentValue?.hex ?? args?.value ?? DEFAULT_COLOR;
                                                setColor(next);
                                            } }) }), _jsx("div", { className: "empHint", children: "Color will be auto-generated if not selected" })] }), _jsxs("div", { className: "empFieldBlock", children: [_jsx("div", { className: "empLabelRow", children: _jsx("label", { className: "empLabel", children: "Assigned Roles" }) }), _jsx("div", { className: "empRoleBox", children: roleOptions.length === 0 ? (_jsx("div", { className: "empHint", children: "No roles available" })) : (roleOptions.map((r) => (_jsxs("div", { className: "empRoleItem", children: [_jsx(CheckBoxComponent, { checked: assignedRoles.includes(r), change: () => toggleRole(r), label: r }), _jsx("span", { className: "empRoleDot" })] }, r)))) }), _jsx("div", { className: "empHint", children: "Select the roles this employee can work" })] }), _jsxs("div", { className: "empFieldBlock", children: [_jsx("label", { className: "empLabel", children: "Hourly Wage" }), _jsx(NumericTextBoxComponent, { id: "HourlyRate", name: "HourlyRate", value: hourly, format: "n2", min: 0, placeholder: "15.00", change: (e) => setHourly(e.value) }), _jsx("div", { className: "empHint", children: "Used for labor cost calculations" })] }), _jsxs("div", { className: "empFieldBlock", children: [_jsx("label", { className: "empLabel", children: "Max Hours/Week" }), _jsx(NumericTextBoxComponent, { id: "MaxHoursWeek", name: "MaxHoursWeek", value: maxWeek, min: 0, max: 48, placeholder: "40", change: (e) => setMaxWeek(e.value) })] }), _jsxs("div", { className: "empFieldBlock", children: [_jsx("label", { className: "empLabel", children: "Min Hours Between Shifts" }), _jsx(NumericTextBoxComponent, { id: "MinRest", name: "MinRest", value: minRest, min: 0, max: 24, placeholder: "8", change: (e) => setMinRest(e.value) }), _jsx("div", { className: "empHint", children: "Minimum rest time between shifts" })] })] })] }), _jsxs("div", { className: "empAddFooter", children: [_jsx(ButtonComponent, { cssClass: "e-primary", onClick: submit, children: isEdit ? "Save" : "Add Employee" }), _jsx(ButtonComponent, { cssClass: "e-outline", type: "button", onClick: onCancel, children: "Cancel" })] })] }));
}
function ShiftDialog({ employees, roles, locations, selectedLocation, selectedEmployeeId, cell, initialEvent, formError, onClearError, onCancel, onSubmit, onDelete, }) {
    const hasEmployees = (employees ?? []).length > 0;
    const [employeeId, setEmployeeId] = useState(() => employees?.[0]?.Id ?? 0);
    const [location, setLocation] = useState(() => {
        if (selectedLocation && selectedLocation !== "All Locations")
            return selectedLocation;
        const first = (locations ?? []).find((l) => l && l !== "All Locations");
        return first ?? "";
    });
    const [role, setRole] = useState("");
    const [date, setDate] = useState(cell?.startTime ? new Date(cell.startTime) : new Date());
    const [startTime, setStartTime] = useState(cell?.startTime ? new Date(cell.startTime) : new Date());
    const [endTime, setEndTime] = useState(cell?.endTime ? new Date(cell.endTime) : new Date(Date.now() + 1000 * 60 * 60 * 8));
    const [breakDuration, setBreakDuration] = useState(30);
    const [notes, setNotes] = useState(initialEvent?.Notes ?? "");
    useEffect(() => {
        if (!hasEmployees)
            return;
        const init = selectedEmployeeId ?? employees[0].Id;
        setEmployeeId(init);
        const emp = employees.find((e) => e.Id === init);
        const empRole = emp?.Role;
        if ((roles ?? []).length) {
            const valid = !!empRole && (roles ?? []).includes(empRole);
            setRole(valid ? empRole : (roles?.[0] ?? ""));
        }
        else {
            setRole(empRole ?? "");
        }
    }, [hasEmployees, employees, selectedEmployeeId, roles]);
    useEffect(() => {
        // Only apply in "Create Shift" mode
        if (initialEvent)
            return;
        // If user filtered to a specific location, default to it
        if (selectedLocation && selectedLocation !== "All Locations") {
            setLocation(selectedLocation);
            return;
        }
        // If "All Locations" selected, default to first real location (non-All)
        const first = (locations ?? []).find((l) => l && l !== "All Locations");
        setLocation(first ?? "");
    }, [selectedLocation, initialEvent, locations]);
    useEffect(() => {
        if (initialEvent) {
            const sd = new Date(initialEvent.StartTime);
            const ed = new Date(initialEvent.EndTime);
            setDate(sd);
            setStartTime(sd);
            setEndTime(ed);
            setEmployeeId(initialEvent.EmployeeId);
            setRole(initialEvent.Role ?? "");
            setBreakDuration(initialEvent.BreakDuration ?? 0);
            setLocation(initialEvent.Location ?? "Main Location");
            setNotes(initialEvent.Notes ?? "");
            return;
        }
        if (cell?.startTime) {
            const d = new Date(cell.startTime);
            setDate(d);
            const s = new Date(d);
            s.setHours(8, 0, 0, 0);
            const e = new Date(d);
            e.setHours(16, 0, 0, 0);
            setStartTime(s);
            setEndTime(e);
        }
    }, [cell, initialEvent]);
    function combineDateAndTime(d, t) {
        const res = new Date(d);
        res.setHours(t.getHours(), t.getMinutes(), 0, 0);
        return res;
    }
    function getMeridian(dt) {
        const h = dt?.getHours?.() ?? 0;
        return h >= 12 ? "PM" : "AM";
    }
    function setClock(dt, hour12, minute = 0) {
        const x = new Date(dt);
        const mer = getMeridian(x);
        let h = hour12 % 12;
        if (mer === "PM")
            h += 12;
        x.setHours(h, minute, 0, 0);
        return x;
    }
    const employeeData = (employees ?? []).map((e) => ({
        text: String(e?.Name ?? "").trim() || `Employee ${e?.Id ?? ""}`,
        value: e.Id,
    }));
    const roleData = (roles ?? []).filter(Boolean).map((r) => ({ text: r, value: r }));
    const locationData = (locations ?? [])
        .filter((l) => l && l !== "All Locations")
        .map((l) => ({ text: l, value: l }));
    const roleEnabled = roleData.length > 0;
    const locationEnabled = locationData.length > 0;
    const emp = employees.find((e) => e.Id === employeeId);
    const maxWeek = emp?.MaxHoursWeek ?? 0;
    const minRest = emp?.MinHoursBetweenShifts ?? 0;
    const calcHours = () => {
        const s = combineDateAndTime(date, startTime);
        const e = combineDateAndTime(date, endTime);
        const dur = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
        return Math.max(0, dur - (breakDuration ?? 0) / 60);
    };
    const calcCost = () => {
        if (!emp)
            return 0;
        return calcHours() * (emp.HourlyRate ?? 0);
    };
    const timeChips = [
        { label: "9:00", h: 9, m: 0 },
        { label: "12:00", h: 12, m: 0 },
        { label: "1:00", h: 1, m: 0 },
        { label: "5:00", h: 5, m: 0 },
        { label: "6:00", h: 6, m: 0 },
    ];
    const canSubmit = hasEmployees &&
        employeeId &&
        date &&
        startTime &&
        endTime &&
        combineDateAndTime(date, endTime) > combineDateAndTime(date, startTime);
    const handleSubmit = () => {
        if (!canSubmit)
            return;
        const start = combineDateAndTime(date, startTime);
        const end = combineDateAndTime(date, endTime);
        onSubmit({
            Id: initialEvent?.Id,
            employeeId,
            location,
            role,
            start,
            end,
            breakDuration,
            Notes: String(notes ?? ""),
        });
    };
    return (_jsx("div", { className: "sfShiftForm", children: !hasEmployees ? (_jsxs("div", { className: "shiftNoEmp", children: [_jsx("div", { className: "shiftNoEmpTitle", children: "No employees available" }), _jsx("div", { className: "shiftNoEmpSub", children: "Please add an employee first to create shifts." }), _jsx("div", { style: { marginTop: 12 }, children: _jsx(ButtonComponent, { cssClass: "e-dlg-closeicon-btn e-control e-btn e-lib e-flat e-icon-btn", type: "button", onClick: onCancel, children: "Close" }) })] })) : (_jsxs(_Fragment, { children: [formError ? (_jsx("div", { className: "formError", role: "alert", children: formError })) : null, _jsxs("div", { className: "shiftFormWrap", children: [_jsxs("div", { className: "shiftGrid3", children: [_jsxs("div", { className: "sfField", children: [_jsx("label", { children: "Employee *" }), _jsx(DropDownListComponent, { cssClass: "e-outline", dataSource: employeeData, fields: { text: "text", value: "value" }, value: employeeId, change: (e) => {
                                                onClearError?.(); //clear error on change
                                                setEmployeeId(e.value);
                                                const chosen = employees.find((x) => x.Id === e.value);
                                                if (chosen && chosen.Role)
                                                    setRole(chosen.Role);
                                            } })] }), _jsxs("div", { className: "sfField", children: [_jsx("label", { children: "Location" }), _jsx(DropDownListComponent, { cssClass: "e-outline", dataSource: locationData, fields: { text: "text", value: "value" }, value: locationEnabled ? location : null, enabled: locationEnabled, placeholder: locationEnabled ? "Select location" : "No locations available", change: (e) => {
                                                onClearError?.(); // ✅
                                                setLocation(e.value);
                                            } }), !locationEnabled ? (_jsx("div", { className: "hintText", children: "Add locations from the Locations dialog to enable this field." })) : null] }), _jsxs("div", { className: "sfField", children: [_jsx("label", { children: "Role" }), _jsx(DropDownListComponent, { cssClass: "e-outline", dataSource: roleData, fields: { text: "text", value: "value" }, value: roleEnabled ? role : null, enabled: roleEnabled, placeholder: roleEnabled ? "Select role" : "No roles available", change: (e) => {
                                                onClearError?.(); // ✅
                                                setRole(e.value);
                                            } }), !roleEnabled ? _jsx("div", { className: "hintText", children: "Add roles from the Roles dialog to enable this field." }) : null] })] }), _jsx("div", { className: "shiftGrid1", children: _jsxs("div", { className: "sfField", children: [_jsx("label", { children: "Date *" }), _jsx(DatePickerComponent, { cssClass: "e-outline", value: date, change: (e) => {
                                            onClearError?.(); // ✅
                                            setDate(e.value);
                                        } })] }) }), _jsxs("div", { className: "shiftGrid2", children: [_jsxs("div", { className: "sfField", children: [_jsx("label", { children: "Start Time *" }), _jsx("div", { className: "timeRow", children: _jsx(TimePickerComponent, { cssClass: "e-outline", value: startTime, width: 70, format: "h:mm", step: 15, change: (e) => {
                                                    onClearError?.(); // ✅
                                                    setStartTime(e.value);
                                                } }) }), _jsx("div", { className: "timeChips", children: timeChips.map((t) => (_jsx(ButtonComponent, { cssClass: "timeChipBtn", type: "button", onClick: () => {
                                                    onClearError?.(); // ✅
                                                    setStartTime((prev) => setClock(prev, t.h, t.m));
                                                }, children: t.label }, t.label))) })] }), _jsxs("div", { className: "sfField", children: [_jsx("label", { children: "End Time *" }), _jsx("div", { className: "timeRow", children: _jsx(TimePickerComponent, { cssClass: "e-outline", value: endTime, format: "h:mm", step: 15, change: (e) => {
                                                    onClearError?.(); // ✅
                                                    setEndTime(e.value);
                                                } }) }), _jsx("div", { className: "timeChips", children: timeChips.map((t) => (_jsx(ButtonComponent, { cssClass: "timeChipBtn", type: "button", onClick: () => {
                                                    onClearError?.(); // ✅
                                                    setEndTime((prev) => setClock(prev, t.h, t.m));
                                                }, children: t.label }, t.label))) })] })] }), _jsxs("div", { className: "shiftGrid2", children: [_jsxs("div", { className: "sfField", children: [_jsx("label", { children: "Break Duration (minutes)" }), _jsx(NumericTextBoxComponent, { cssClass: "e-outline", value: breakDuration, min: 0, change: (e) => {
                                                onClearError?.(); // ✅
                                                setBreakDuration(e.value);
                                            } })] }), _jsx("div", { className: "summaryCard", children: _jsxs("div", { className: "summaryTop", children: [_jsx("span", { className: "e-icons e-clock summaryIcon" }), _jsxs("div", { className: "summaryText", children: [_jsxs("div", { className: "summaryHours", children: [calcHours().toFixed(1), " hours"] }), _jsxs("div", { className: "summaryCost", children: ["$", calcCost().toFixed(2), " estimated cost"] })] })] }) })] }), _jsx("div", { className: "shiftGrid1", children: _jsxs("div", { className: "sfField", children: [_jsx("label", { children: "Notes" }), _jsx(TextBoxComponent, { cssClass: "e-outline", value: notes, placeholder: "e.g., Opening manager", multiline: true, htmlAttributes: { rows: "2" }, input: (e) => {
                                            onClearError?.(); // ✅
                                            setNotes(e.value ?? "");
                                        } })] }) }), _jsxs("div", { className: "constraintsBox", children: [_jsxs("div", { className: "constraintsTitle", children: [_jsx("span", { className: "e-icons e-circle-info" }), _jsx("span", { children: "Employee Constraints:" })] }), _jsxs("div", { className: "constraintsBody", children: [_jsxs("div", { children: ["Max hours per week: ", maxWeek, "h"] }), _jsxs("div", { children: ["Min hours between shifts: ", minRest, "h"] })] })] }), _jsxs("div", { className: "shiftFooter", children: [initialEvent?.Id ? (_jsxs(ButtonComponent, { cssClass: "e-danger", type: "button", onClick: () => onDelete?.(initialEvent.Id), children: [_jsx("span", { className: "e-icons e-trash", style: { marginRight: 6 } }), "Delete"] })) : (_jsx("div", {})), _jsx(ButtonComponent, { cssClass: "e-primary", type: "button", disabled: !canSubmit, onClick: handleSubmit, children: initialEvent ? "Update Shift" : "Create Shift" }), _jsx(ButtonComponent, { cssClass: "e-cancel", type: "button", onClick: onCancel, children: "Cancel" })] })] })] })) }));
}
function StickySchedulerFooterPromo() {
    return (_jsx("div", { className: "stickyPromoBar", children: _jsxs("div", { className: "stickyPromoInner", children: [_jsxs("div", { className: "promoText", children: [_jsxs("div", { className: "promoLine1", children: ["Want shift scheduling in your app? ", _jsx("strong", { className: "promoStrong", children: "Try our Scheduler Component" }), " \u2014 plan shifts, manage resources, and export calendars!"] }), _jsx("div", { className: "promoLine2" })] }), _jsxs("div", { className: "promoActions", children: [_jsx(ButtonComponent, { cssClass: "e-primary", onClick: () => window.open("https://www.syncfusion.com/react-components/react-scheduler", "_blank", "noopener"), children: "Start Free Trial" }), _jsx(ButtonComponent, { cssClass: "e-flat", onClick: () => window.open("https://www.syncfusion.com/request-demo", "_blank", "noopener"), children: "Request Demo" })] })] }) }));
}
