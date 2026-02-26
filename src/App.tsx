import React, { useEffect, useMemo, useRef, useState, useCallback, JSX } from "react";
import { enableRipple } from "@syncfusion/ej2-base";
import {
  ScheduleComponent, ViewsDirective, ViewDirective, ResourcesDirective, ResourceDirective, Inject, TimelineViews,
  TimelineMonth,
  Month,
  Week,
  Day,
  Resize,
  DragAndDrop,
  Print,
  ICalendarExport,
  ICalendarImport,
  ExcelExport,
  ExportOptions,
  ExportFieldInfo,
} from "@syncfusion/ej2-react-schedule";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject as GridInject,
  Page,
} from "@syncfusion/ej2-react-grids";
import { DialogComponent } from "@syncfusion/ej2-react-popups";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import {
  TextBoxComponent,
  NumericTextBoxComponent,
  UploaderComponent,
  ColorPickerComponent,
} from "@syncfusion/ej2-react-inputs";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { DatePickerComponent, TimePickerComponent } from "@syncfusion/ej2-react-calendars";
import { DropDownButtonComponent } from "@syncfusion/ej2-react-splitbuttons";
import { ListViewComponent } from "@syncfusion/ej2-react-lists";
import { FormValidator } from "@syncfusion/ej2-inputs";
import { CheckBoxComponent } from "@syncfusion/ej2-react-buttons";
import "./index.css";
import { compile } from "@syncfusion/ej2-base";

// enableRipple(true);

// keep storage but do NOT auto-seed defaults
const STORAGE_KEY = "Shift-empty-first";


type RoleName = string;
type LocationName = string;

interface Employee {
  Id: number;
  EmployeeId?: number;
  Name: string;
  Role: string;
  AssignedRoles?: string[];
  HourlyRate?: number;
  MaxHoursDay?: number;
  MaxHoursWeek?: number;
  MinHoursBetweenShifts?: number;
  Color?: string;
}

interface Appointment {
  Id: number;
  Subject?: string;
  StartTime: string; // ISO
  EndTime: string; // ISO
  EmployeeId: number;
  Role?: string;
  BreakDuration?: number;
  Location?: string;
  Notes?: string;
}

interface RoleMetaEntry {
  rate: number;
  color: string;
}
type RoleMeta = Record<string, RoleMetaEntry>;

interface LocationMetaEntry {
  address: string;
  color: string;
}
type LocationMeta = Record<string, LocationMetaEntry>;

type NoticeType = "error" | "info" | "success";
interface Notice {
  id: number;
  message: string;
  type: NoticeType;
}

interface SummaryRow {
  Id: number;
  Name: string;
  Role: string;
  HourlyRate: number;
  Shifts: number;
  TotalHours: number;
  EstCost: number;
  MaxHoursDay: number;
  MaxHoursWeek: number;
}

interface ManageEmployeesListProps {
  employees: Employee[];
  appointments: Appointment[];
  onAdd: () => void;
  onEdit: (emp: Employee) => void;
  onDelete: (empId: number) => void;
  onClose: () => void;
}

interface EmployeeFormProps {
  initial: Employee | null;
  open: boolean;
  roles: RoleName[];
  employees: Employee[];
  onSave: (emp: Employee) => void;
  onDelete: (id: number) => void;
  onCancel: () => void;
  onOpenRoles?: () => void;
}

interface ShiftDialogPayload {
  Id?: number;
  employeeId: number;
  location: string;
  role: string;
  start: Date;
  end: Date;
  breakDuration: number;
  Notes: string;
}

interface ShiftDialogProps {
  employees: Employee[];
  roles: RoleName[];
  locations: LocationName[];
  selectedLocation: LocationName;
  selectedEmployeeId: number | null;
  cell: any; // Syncfusion cell click args
  initialEvent: Appointment | null;
  formError?: string;
  onClearError?: () => void
  onCancel: () => void;
  onSubmit: (payload: ShiftDialogPayload) => void;
  onDelete: (id: number) => void;
}

/** -----------------------------
 * Demo data (only loaded on Test Data click)
 * ----------------------------- */
const defaultRoles: RoleName[] = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "QA Engineer",
  "DevOps Engineer",
  "Tech Lead",
  "Engineering Manager",
];
const defaultLocations: LocationName[] = ["All Locations", "Main Location", "Branch A"];

const defaultEmployees: Employee[] = [
  { Id: 1, EmployeeId: 1, Name: "Michael Anderson", Role: "Engineering Manager", HourlyRate: 35, MaxHoursDay: 8, MaxHoursWeek: 40, Color: "#c7b3ff" },
  { Id: 2, EmployeeId: 2, Name: "Daniel Carter", Role: "Tech Lead", HourlyRate: 18, MaxHoursDay: 8, MaxHoursWeek: 40, Color: "#ffd1e6" },
  { Id: 3, EmployeeId: 3, Name: "Olivia Brown", Role: "DevOps Engineer", HourlyRate: 18, MaxHoursDay: 8, MaxHoursWeek: 40, Color: "#ffd1e6" },
  { Id: 4, EmployeeId: 4, Name: "Christopher Martin", Role: "QA Engineer", HourlyRate: 28, MaxHoursDay: 10, MaxHoursWeek: 60, Color: "#f5b7b1" },
  { Id: 5, EmployeeId: 5, Name: "Amanda Clark", Role: "Software Engineer", HourlyRate: 22, MaxHoursDay: 8, MaxHoursWeek: 40, Color: "#e6d4ff" },
  { Id: 6, EmployeeId: 6, Name: "James Walker", Role: "Full Stack Developer", HourlyRate: 20, MaxHoursDay: 9, MaxHoursWeek: 45, Color: "#ffd9c7" },
  { Id: 7, EmployeeId: 7, Name: "Hannah Wilson", Role: "Backend Developer", HourlyRate: 16, MaxHoursDay: 6, MaxHoursWeek: 30, Color: "#c7f0f7" },
  { Id: 8, EmployeeId: 8, Name: "Ethan Parker", Role: "Frontend Developer", HourlyRate: 33, MaxHoursDay: 8, MaxHoursWeek: 40, Color: "#d6c8ff" },
];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function endOfWeek(date: Date): Date {
  const s = startOfWeek(date);
  const e = new Date(s);
  e.setDate(s.getDate() + 7);
  return e;
}

function updateDefaultAppointmentsToCurrentWeek(defaultAppointments: Appointment[]): Appointment[] {
  const weekStart = startOfWeek(new Date()); // Monday of system current week
  const startHoursBySlot = [6, 9, 12];
  const SHIFT_HOURS = 7;

  return defaultAppointments.map((a) => {
    const idx = ((a.Id ?? 1) as number) - 1;
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

const Appointments: Appointment[] = [
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

const defaultAppointments: Appointment[] = updateDefaultAppointmentsToCurrentWeek(Appointments);
const dialogTarget = ".appRoot";


function randomColor(seed: number): string {
  const colors = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#f39c12", "#e74c3c", "#16a085", "#27ae60"];
  return colors[seed % colors.length];
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function fmtTime(d: Date | string): string {
  const dt = new Date(d);
  const h = dt.getHours();
  const m = dt.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  const mm = m ? `:${String(m).padStart(2, "0")}` : "";
  return `${hh}${mm} ${ampm}`;
}

export default function App(): JSX.Element {
  const scheduleRef = useRef<any>(null);
  const gridRef = useRef<any>(null);
  const jsonUploaderRef = useRef<any>(null);
  const icsUploaderRef = useRef<any>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLocation, setSelectedLocation] = useState<LocationName>("All Locations");

  // EMPTY FIRST
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [roles, setRoles] = useState<RoleName[]>([]);
  const [locations, setLocations] = useState<LocationName[]>(["All Locations"]);
  const [nextEmployeeId, setNextEmployeeId] = useState<number>(1);
  const [nextEventId, setNextEventId] = useState<number>(1);

  // dialogs
  const [showEmployeesDialog, setShowEmployeesDialog] = useState<boolean>(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [showRolesDialog, setShowRolesDialog] = useState<boolean>(false);
  const [showLocationsDialog, setShowLocationsDialog] = useState<boolean>(false);
  const [showRoles, setShowRoles] = useState<boolean>(false); // unused but preserved


  const [roleNameInputValue, setRoleNameInputValue] = useState<string>("");
  const [roleDefaultRateValue, setRoleDefaultRateValue] = useState<number>(15);
  const [roleColorValue, setRoleColorValue] = useState<string>("#1abc9c");

  const [showShiftDialog, setShowShiftDialog] = useState<boolean>(false);
  const [editingShift, setEditingShift] = useState<Appointment | null>(null);
  const [cellSelection, setCellSelection] = useState<any>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  const [showSummaryDialog, setShowSummaryDialog] = useState<boolean>(false);
  const [showIcsDialog, setShowIcsDialog] = useState<boolean>(false);
  const [icsFile, setIcsFile] = useState<File | null>(null);
  const [icsImported, setIcsImported] = useState<boolean>(false);
  const [showUngroupedImported, setShowUngroupedImported] = useState<boolean>(false);
  const [showClearDialog, setShowClearDialog] = useState<boolean>(false);
  const [clearChoice, setClearChoice] = useState<"shifts" | "everything">("shifts");
  const [schedulerDataSource, setSchedulerDataSource] = useState<any[]>([]);


  const [rolesView, setRolesView] = useState<"list" | "add">("list");
  const [locationsView, setLocationsView] = useState<"list" | "add">("list");


  const [roleFormError, setRoleFormError] = useState<string>("");
  const [locationFormError, setLocationFormError] = useState<string>("");


  const [roleMeta, setRoleMeta] = useState<RoleMeta>({});
  const [editingRoleName, setEditingRoleName] = useState<string | null>(null);
  const [lastAddedRole, setLastAddedRole] = useState<string | null>(null);

  const [locationNameInputValue, setLocationNameInputValue] = useState<string>("");
  const [locationAddressInputValue, setLocationAddressInputValue] = useState<string>("");
  const [locationColorValue, setLocationColorValue] = useState<string>("#2563eb");
  const [locationMeta, setLocationMeta] = useState<LocationMeta>({});
  const [editingLocationName, setEditingLocationName] = useState<string | null>(null);
  const [lastAddedLocation, setLastAddedLocation] = useState<string | null>(null);


  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | "json" | "ics">("csv");
  const [exportRange, setExportRange] = useState<"thisWeek" | "nextWeek" | "thisMonth" | "custom">("thisWeek");
  const [exportLocation, setExportLocation] = useState<LocationName>("All Locations");
  const [showEmpImportDialog, setShowEmpImportDialog] = useState<boolean>(false);
  const [empImportStep, setEmpImportStep] = useState<"instructions" | "upload" | "preview">("upload");
  const [empCsvFile, setEmpCsvFile] = useState<File | null>(null);
  const [dataMode, setDataMode] = useState<"app" | "ics" | "empty">("empty");

  const [notice, setNotice] = useState<Notice | null>(null);
  const [shiftFormError, setShiftFormError] = useState<string>("");

  const notify = useCallback((message: unknown, type: NoticeType = "error") => {
    if (!message) return;
    const id = Date.now();
    setNotice({ id, message: String(message), type });
    const self = notify as any;
    window.clearTimeout(self._t);
    self._t = window.setTimeout(() => {
      setNotice((n) => (n && n.id === id ? null : n));
    }, 4000);
  }, []);

  /** Load from localStorage */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed: any = JSON.parse(raw);
      const emps: Employee[] = Array.isArray(parsed.employees) ? parsed.employees : [];
      const appts: Appointment[] = Array.isArray(parsed.appointments) ? parsed.appointments : [];
      const r: RoleName[] = Array.isArray(parsed.roles) ? parsed.roles : [];
      const locs: LocationName[] = Array.isArray(parsed.locations) ? parsed.locations : ["All Locations"];
      const rm: RoleMeta = parsed.roleMeta && typeof parsed.roleMeta === "object" ? parsed.roleMeta : {};
      const lm: LocationMeta = parsed.locationMeta && typeof parsed.locationMeta === "object" ? parsed.locationMeta : {};

      setRoleMeta(rm);
      setLocationMeta(lm);
      setEmployees(emps);
      setAppointments(appts);
      setRoles(r);
      setLocations(locs.length ? locs : ["All Locations"]);

      setNextEmployeeId((emps.reduce((m, e) => Math.max(m, e.Id ?? 0), 0) + 1) as number);
      setNextEventId((appts.reduce((m, a) => Math.max(m, a.Id ?? 0), 0) + 1) as number);
    } catch (e) {
      console.error("Failed to parse storage", e);
    }
  }, []);

  /** Auto-save */
  useEffect(() => {
    const payload = { employees, appointments, roles, locations, roleMeta, locationMeta };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    try {
      // scheduleRef.current?.refresh?.();
    } catch (_) { }
  }, [employees, appointments, roles, locations, roleMeta, locationMeta]);


  const hasEmployees = employees.length > 0;

  const hasAnyData = useMemo(() => {
    return employees.length > 0 || appointments.length > 0;
  }, [employees.length, appointments.length]);

  const timeScaleConfig = useMemo(() => {
    return { enable: hasAnyData ? false : true, interval: 1440, slotCount: hasAnyData ? 6 : 0 };
  }, [hasAnyData]);

  const effectiveLocations = useMemo<LocationName[]>(() => {
    const base = locations.length ? locations : ["All Locations"];
    return base.includes("All Locations") ? base : (["All Locations", ...base] as LocationName[]);
  }, [locations]);

  const filteredAppointments = useMemo<Appointment[]>(() => {
    if (selectedLocation === "All Locations") return appointments;
    return appointments.filter((a) => (a.Location ?? "Main Location") === selectedLocation);
  }, [appointments, selectedLocation]);

  const scheduleData = useMemo<any[]>(() => {
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

  const resourceData = useMemo<any[]>(() => {
    return employees.map((e) => ({
      Text: e.Name,
      Id: e.Id,
      Color: e.Color ?? randomColor(e.Id),
      Role: e.Role,
      EmployeeId: e.Id,
    }));
  }, [employees]);

  const computeTotalHoursForEmployee = useCallback(
    (empId: number): number => {
      const total = filteredAppointments.reduce((sum, a) => {
        if (a.EmployeeId !== empId) return sum;
        const start = new Date(a.StartTime);
        const end = new Date(a.EndTime);
        const durH = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const net = durH - ((a.BreakDuration ?? 0) / 60);
        return sum + Math.max(0, net);
      }, 0);
      return total;
    },
    [filteredAppointments]
  );

  const summaryRows = useMemo<SummaryRow[]>(() => {
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

  const resourceHeaderTemplate = useCallback((props: any) => {
    const empId =
      props.Id ??
      props.id ??
      props.resourceData?.Id ??
      props.resource?.id ??
      props.resourceId;

    const emp =
      employees.find((e) => e.Id === empId) ??
      ({ Id: empId ?? 0, Name: props.Text ?? "Employee", Role: props.Role ?? "" } as Employee);

    const totalHours = empId ? computeTotalHoursForEmployee(empId) : 0;
    const shiftCount = empId ? filteredAppointments.filter((a) => a.EmployeeId === empId).length : 0;

    return (
      <div className="resourceHeader">
        <div className="resourceName">{emp.Name}</div>
        <div className="resourceMeta">
          {shiftCount} shifts • {totalHours.toFixed(1)}h
        </div>
      </div>
    );
  }, [employees, computeTotalHoursForEmployee, filteredAppointments]);

  const eventTemplate = useCallback((props: any) => {
    const emp = employees.find((e) => e.Id === props.EmployeeId) ?? ({} as Employee);
    return (
      <div className="shiftCard">
        <div className="shiftTime">{fmtTime(props.StartTime)} - {fmtTime(props.EndTime)}</div>
        <div className="shiftRole">{emp.Role ?? ""}</div>
      </div>
    );
  }, [employees]);

  const eventSettings = useMemo(() => ({
    dataSource: scheduleData,
    template: eventTemplate as any,
  }), [scheduleData, eventTemplate]);

  const groupOptions = useMemo(() => ({ resources: ["Employees"] }), []);

  function safeNum(v: any, fallback = 0): number {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function dayStartOf(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }


  function netHoursWithinWindow(
    evStart: Date,
    evEnd: Date,
    breakMins: number,
    winStart: Date,
    winEnd: Date
  ): number {
    const s = evStart < winStart ? winStart : evStart;
    const e = evEnd > winEnd ? winEnd : evEnd;
    if (e <= s) return 0;
    const msH = 1000 * 60 * 60;
    const overlapH = (e.getTime() - s.getTime()) / msH;
    const totalH = Math.max(0, (evEnd.getTime() - evStart.getTime()) / msH);
    const breakH = safeNum(breakMins, 0) / 60;
    const breakInOverlap = totalH > 0 ? breakH * (overlapH / totalH) : 0;
    return Math.max(0, overlapH - breakInOverlap);
  }

  // For daily validation: total hours including break time
  function totalHoursWithinWindow(
    evStart: Date,
    evEnd: Date,
    winStart: Date,
    winEnd: Date
  ): number {
    const s = evStart < winStart ? winStart : evStart;
    const e = evEnd > winEnd ? winEnd : evEnd;
    if (e <= s) return 0;
    const msH = 1000 * 60 * 60;
    return (e.getTime() - s.getTime()) / msH;
  }


  function validateCandidate(rec: Appointment, existingAppointments: Appointment[]): string | null {
    debugger
    const start = new Date(rec.StartTime);
    const end = new Date(rec.EndTime);
    const empId = rec.EmployeeId;
    const breakMins = safeNum(rec.BreakDuration, 0);

    if (end <= start) return "End time must be after start time.";

    // overlap check
    for (const a of existingAppointments) {
      if (a.EmployeeId !== empId) continue;
      if (a.Id === rec.Id) continue;
      const aStart = new Date(a.StartTime);
      const aEnd = new Date(a.EndTime);
      if (overlaps(start, end, aStart, aEnd)) {
        return "Shift overlaps with another shift for the same employee.";
      }
    }

    const emp = employees.find((e) => e.Id === empId);
    if (!emp) return null;


    const maxWeek = safeNum(emp.MaxHoursWeek, 0);

    // daily (validate each calendar day spanned by the candidate shift)
    // Max hours per day INCLUDES break time
    const maxDay = 8;

    console.log('DEBUG: Daily Validation Start', {
      empName: emp.Name,
      maxDay,
      startTime: start.toISOString(),
      endTime: end.toISOString()
    });

    if (maxDay > 0) {
      // Get the date range the shift spans
      const startDay = dayStartOf(start);
      const endDay = dayStartOf(end);

      // Check if shift crosses midnight
      const sameDay = startDay.getTime() === endDay.getTime();

      console.log('DEBUG: Day comparison', {
        startDay: startDay.toISOString(),
        endDay: endDay.toISOString(),
        sameDay
      });

      // If same day, check that day only
      // If different days, check both days
      const daysToCheck = sameDay ? [startDay] : [startDay, endDay];

      for (const dayToCheck of daysToCheck) {
        const dStart = new Date(dayToCheck);
        const dEnd = new Date(dStart);
        dEnd.setDate(dStart.getDate() + 1);

        // existing events that touch this day
        const eventsThisDay = existingAppointments.filter(
          (a) =>
            a.EmployeeId === empId &&
            new Date(a.StartTime) < dEnd &&
            new Date(a.EndTime) > dStart &&
            a.Id !== rec.Id
        );

        console.log('DEBUG: Events this day', {
          dayWindow: `${dStart.toISOString()} to ${dEnd.toISOString()}`,
          eventsCount: eventsThisDay.length,
          events: eventsThisDay.map(a => ({
            start: new Date(a.StartTime).toISOString(),
            end: new Date(a.EndTime).toISOString()
          }))
        });

        let totalDayH = 0;

        // Calculate total hours INCLUDING breaks for existing shifts
        for (const a of eventsThisDay) {
          const hours = totalHoursWithinWindow(
            new Date(a.StartTime),
            new Date(a.EndTime),
            dStart,
            dEnd
          );
          console.log('DEBUG: Existing shift hours', { hours });
          totalDayH += hours;
        }

        // add the candidate shift portion INCLUDING break time
        const candidateHours = totalHoursWithinWindow(start, end, dStart, dEnd);
        console.log('DEBUG: Candidate shift hours', { candidateHours });
        totalDayH += candidateHours;

        console.log('DEBUG: Total day hours check', {
          totalDayH,
          maxDay,
          exceeds: totalDayH > maxDay
        });

        if (totalDayH > maxDay + 1e-6) {
          return `Daily hours exceed ${maxDay}h for ${emp.Name} on ${dStart.toLocaleDateString()}`;
        }
      }
    }


    const ws = startOfWeek(start);
    const we = endOfWeek(start);

    const eventsThisWeek = existingAppointments.filter(
      (a) =>
        a.EmployeeId === empId &&
        new Date(a.StartTime) < we &&
        new Date(a.EndTime) > ws &&
        a.Id !== rec.Id
    );

    let totalWeekH = 0;
    for (const a of eventsThisWeek) {
      totalWeekH += netHoursWithinWindow(
        new Date(a.StartTime),
        new Date(a.EndTime),
        safeNum(a.BreakDuration, 0),
        ws,
        we
      );
    }


    totalWeekH += netHoursWithinWindow(start, end, breakMins, ws, we);

    if (maxWeek > 0 && totalWeekH > maxWeek + 1e-6) {
      return `Weekly hours exceed ${maxWeek} for ${emp.Name}`;
    }

    return null;
  }

  function onNavigating(args: any) {
    if (args?.currentDate) setSelectedDate(new Date(args.currentDate));
  }

  function onPopupOpen(args: any) {
    if (args.type === "Editor") args.cancel = true;
  }

  function onCellClick(args: any) {
    if (!hasEmployees) return;
    setShiftFormError("");
    setCellSelection(args);

    if (typeof args.groupIndex === "number" && resourceData[args.groupIndex]) {
      setSelectedEmployeeId(resourceData[args.groupIndex].Id);
    } else {
      setSelectedEmployeeId(null);
    }

    setEditingShift(null);
    setShowShiftDialog(true);
  }

  function onEventClick(args: any) {
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

  function onActionBegin(args: any) {
    if (args.requestType === "eventCreate" || args.requestType === "eventChange") {
      const records = args.addedRecords ?? args.changedRecords ?? [];
      for (const r of records) {
        const candidate: Appointment = {
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
        if (err) { notify(err, "error"); args.cancel = true; return; }
        void candidate;
      }
    }
  }

  function onActionComplete(args: any) {
    if (args.requestType === "eventChanged") {
      const changed = args.changedRecords ?? [];
      setAppointments((prev) => {
        const copy = prev.slice();
        for (const r of changed) {
          const idx = copy.findIndex((a) => a.Id === r.Id);
          if (idx < 0) continue;
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
      const ids = removed.map((r: any) => r.Id);
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
    } catch { }
  }


  const importTemplateFn = (data: any) => {
    const template =
      '<div class="e-template-btn"><span class="e-btn-icon e-icons e-upload-1 e-icon-left impUploader"></span>${text}</div>';
    return compile(template.trim())(data);
  };

  const onImportClick = (args: any) => {
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

    const exportFields: ExportFieldInfo[] = [
      { name: 'EmployeeId', text: 'Employee Id' },
      // { name: 'Name', text: 'Name' },
      { name: 'StartTime', text: 'Start Date' },
      { name: 'EndTime', text: 'End Date' },
      { name: 'BreakDuration', text: 'Break Duration' },
      { name: 'Location', text: 'Location' },
      { name: 'Role', text: 'Role' }

    ];
    const exportValues: ExportOptions = { fieldsInfo: exportFields };

    scheduleRef.current?.exportToExcel?.(exportValues);
  }

  function printSchedule() {
    try {
      scheduleRef.current?.print?.();
    } catch { }
  }

  function exportICS() {
    try {
      scheduleRef.current?.exportToICalendar?.();
    } catch {
      notify("ICS export not available.", "error");
    }
  }

  /** Options menu */
  const optionItems: any[] = [
    { text: "Import Schedule", id: "importIcs", iconCss: "e-icons e-upload-1" },
    { text: "Export Schedule", id: "exportSchedule", iconCss: "e-icons e-download" },
    { separator: true },
    { text: "Clear Data", id: "clear", iconCss: "e-icons e-trash", cssClass: "danger-item" },
  ];

  function onOptionsSelect(args: any) {
    const id = args?.item?.id;
    if (id === "print") printSchedule();
    if (id === "exportExcel") exportExcel();
    if (id === "exportIcs") exportICS();
    if (id === "importIcs") setShowIcsDialog(true);

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
      } else if (exportFormat === "ics") {
        exportICS();
      } else if (exportFormat === "pdf") {
        printSchedule();
      }
      setShowExportDialog(false);
    } catch (e) {
      notify("Export failed.", "error");
      console.error(e);
    }
  };

  /** Employee CRUD */
  function openEmployees() {
    setShowEmployeesDialog(true);
  }

  function saveEmployee(emp: Employee) {
    if (emp.Id) {
      setEmployees((prev) => prev.map((p) => (p.Id === emp.Id ? emp : p)));
    } else {
      const newEmp: Employee = { ...emp, Id: nextEmployeeId, Color: emp.Color ?? randomColor(nextEmployeeId) };
      setEmployees((prev) => [...prev, newEmp]);
      setNextEmployeeId((id) => id + 1);
    }
    setShowEmployeeForm(false);
  }

  function deleteEmployeeById(id: number) {
    setEmployees((prev) => prev.filter((e) => e.Id !== id));
    setAppointments((prev) => prev.filter((a) => a.EmployeeId !== id));
  }

  /** Roles/Locations managers */
  function addRole(name: string) {
    const v = String(name ?? "").trim();
    if (!v) return;
    setRoles((prev) => (prev.includes(v) ? prev : [...prev, v]));
  }

  function removeRole(name: string) {
    setRoles((prev) => prev.filter((r) => r !== name));
  }

  function addLocation(name: string) {
    const v = String(name ?? "").trim();
    if (!v) return;
    setLocations((prev) => (prev.includes(v) ? prev : [...prev, v]));
  }

  function removeLocation(name: string) {
    if (name === "All Locations") return;
    setLocations((prev) => prev.filter((l) => l !== name));
    setAppointments((prev) => prev.map((a) => (a.Location === name ? { ...a, Location: "Main Location" } : a)));
    if (selectedLocation === name) setSelectedLocation("All Locations");
  }

  /** Shift create/update */
  function createOrUpdateShift(payload: ShiftDialogPayload) {
    const emp = employees.find((e) => e.Id === payload.employeeId);
    const start = payload.start;
    const end = payload.end;

    const rec: Appointment = {
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
      setShiftFormError(err);      // set local dialog error
      return;                      // keep dialog open
    }

    setShiftFormError("");


    if (payload.Id) {
      setAppointments((prev) => prev.map((a) => (a.Id === payload.Id ? rec : a)));
    } else {
      setAppointments((prev) => [...prev, rec]);
      setNextEventId((id) => id + 1);
    }

    setShowShiftDialog(false);
  }

  function deleteShift(id: number) {
    // if (!window.confirm("Delete this shift?")) return;
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

  const startEditRole = (roleName: string) => {
    const meta = roleMeta?.[roleName] ?? ({} as Partial<RoleMetaEntry>);
    setEditingRoleName(roleName);
    setRolesView("add");
    setRoleFormError("");
    setRoleNameInputValue(roleName);
    setRoleDefaultRateValue(typeof meta.rate === "number" ? meta.rate : 15);
    setRoleColorValue((meta.color as string) ?? "#1abc9c");
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
      } else {
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

  const deleteRoleRow = (roleName: string) => {
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

  const startEditLocation = (name: string) => {
    if (isLockedLocation(name)) return;
    const meta = locationMeta?.[name] ?? ({} as Partial<LocationMetaEntry>);
    setEditingLocationName(name);
    setLocationsView("add");
    setLocationFormError("");
    setLocationNameInputValue(name);
    setLocationAddressInputValue((meta.address as string) ?? "");
    setLocationColorValue((meta.color as string) ?? "#10b981");
  };

  const normalizeName = (s: unknown) => String(s ?? "").trim();
  const keyName = (s: unknown) => normalizeName(s).toLowerCase();


  const normalizeRoleName = (s: unknown) => String(s ?? "").trim();
  const roleKey = (s: unknown) => normalizeRoleName(s).toLowerCase();


  const DEFAULT_LOCATION_NAME = "All Locations";
  const isLockedLocation = (name: unknown) =>
    String(name ?? "").trim().toLowerCase() === DEFAULT_LOCATION_NAME.toLowerCase();


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

        setAppointments((prev) =>
          (prev ?? []).map((a) => (a.Location === oldName ? { ...a, Location: newNameRaw } : a))
        );

        setSelectedLocation((prev) => (prev === oldName ? newNameRaw : prev));

        setLocationMeta((prev) => {
          const copy = { ...(prev ?? {}) };
          const oldMeta = copy[oldName] ?? { address: "", color: "#10b981" };
          delete copy[oldName];
          copy[newNameRaw] = { ...oldMeta, address, color };
          return copy;
        });
      } else {
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

  const deleteLocationRow = (name: string) => {
    if (isLockedLocation(name)) return;

    setLocations((prev) => (prev ?? []).filter((l) => l !== name));
    setLocationMeta((prev) => {
      const copy = { ...(prev ?? {}) };
      delete copy[name];
      return copy;
    });

    setSelectedLocation((prev) => (prev === name ? "All Locations" : prev));
    setAppointments((prev) => (prev ?? []).map((a) => (a.Location === name ? { ...a, Location: "All Locations" } : a)));
  };


  const roleItemTemplate = (data: any) => {

    const roleName = data?.text ?? "";
    const meta = roleMeta?.[roleName] ?? { rate: 15, color: "#10b981" };
    const dotColor = meta.color ?? "#10b981";
    const isNew = lastAddedRole && roleName === lastAddedRole;

    // Format like screenshot: $28.00/hr
    const rateText = `$${Number(meta.rate ?? 0).toFixed(2)}/hr`;
    const initialsText = initials(roleName);



    return (
      <div className={`empRow ${isNew ? "mrRoleRowNew" : ""}`}>
        <div className="empLeft">
          <div className="empAvatar" style={{ background: dotColor }} title={roleName}>
            {initialsText}
          </div>
          <div>
            <div className="empName" title={roleName}>{roleName}</div>
            <div className="empMeta">{rateText}</div>
          </div>
        </div>

        {/* Stop select when clicking icons */}
        <div className="empActions" onClick={(e) => e.stopPropagation()}>
          <ButtonComponent
            cssClass="e-flat empIconBtn"
            title="Edit"
            type="button"
            onClick={(ev: any) => {
              ev?.stopPropagation?.();
              startEditRole(roleName);
            }}
          >
            <span className="e-btn-icon e-icons e-edit" />
          </ButtonComponent>
          <ButtonComponent
            cssClass="e-flat empIconBtn empSfDanger"
            iconCss="e-icons e-trash"
            title="Delete"
            type="button"
            onClick={(ev: any) => {
              ev?.stopPropagation?.();
              deleteRoleRow(roleName);
            }}
          />
        </div>
      </div>
    );
  };
  const renderRolesDialogBody = () => {
    if (rolesView === "add") {
      const isEdit = !!editingRoleName;
      return (
        <div className="mrBody">

          <div className="mrDivider" />
          <div className="mrAddWrap">
            <div className="mrField">
              <label className="mrLabel">
                Role Name <span className="mrReq">*</span>
              </label>
              <TextBoxComponent
                value={roleNameInputValue}
                placeholder="e.g., Manager"
                floatLabelType="Never"
                input={(e: any) => {
                  setRoleNameInputValue(e.value ?? "");
                  if (roleFormError) setRoleFormError("");
                }}
                cssClass="mrInput"
              />
              {roleFormError ? <div className="mrError">{roleFormError}</div> : null}
            </div>

            <div className="mrField">
              <label className="mrLabel">$ Default Hourly Rate</label>
              <NumericTextBoxComponent
                value={roleDefaultRateValue}
                min={0}
                max={20}
                step={0.01}
                format="n2"
                placeholder="15.00"
                change={(e: any) => setRoleDefaultRateValue(e.value ?? 0)}
                cssClass="mrInput"
              />
              <div className="mrHelp">Optional. Employee wages override this default rate.</div>
            </div>

            <div className="mrField">
              <label className="mrLabel">Color</label>
              <div className="mrPaletteWrap">
                <ColorPickerComponent
                  value={roleColorValue}
                  mode="Palette"
                  inline={false}
                  showButtons={true}
                  columns={10}
                  change={(args: any) => {
                    const next = args?.currentValue?.hex ?? args?.value ?? "#10b981";
                    setRoleColorValue(next);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mrFooterRight">
            <ButtonComponent cssClass="e-primary add-role-btn" type="button" onClick={submitRole}>
              {isEdit ? "Update Role" : "Add Role"}
            </ButtonComponent>
            <ButtonComponent cssClass="e-outline" type="button" onClick={onCancelAddRole}>
              Cancel
            </ButtonComponent>
          </div>
        </div>
      );
    }

    const isEmpty = !rolesListData?.length;

    return (
      <div className="mrBody">

        <div className="mrDivider" />
        <div className="mrTopRow">
          <div className="mrDesc">Manage job positions and their default hourly rates.</div>
          <ButtonComponent cssClass="e-primary add-role-btn" iconCss="e-icons e-plus" onClick={onAddRoleClick}>
            Add Role
          </ButtonComponent>
        </div>
        <div className="mrContent">
          {isEmpty ? (
            <div className="mrEmpty">
              <div className="mrEmptyIcon" aria-hidden="true">
                <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
                  <path
                    d="M22 18v-3c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4v3"
                    stroke="#D1D5DB"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <rect x="12" y="18" width="40" height="34" rx="6" stroke="#D1D5DB" strokeWidth="3" />
                </svg>
              </div>
              <div className="mrEmptyTitle">No roles added yet.</div>
              <div className="mrEmptySub">Click "Add Role" to get started.</div>
            </div>
          ) : (
            <div className="mrListWrap">
              <ListViewComponent
                dataSource={rolesListData}
                fields={{ text: "text" }}
                template={roleItemTemplate}
                cssClass="mrListView"
              />
            </div>
          )}
        </div>
      </div>
    );
  };


  const locationItemTemplate = (data: any) => {
    const name: string = data?.text;
    const locked = isLockedLocation(name);
    const meta = locationMeta?.[name] ?? { address: "", color: "#10b981" };
    const dotColor = meta.color ?? "#10b981";
    const isNew = lastAddedLocation && name === lastAddedLocation;
    const location_name = initials(name);

    return (
      <div className={`empRow ${isNew ? "locRowNew" : ""}`}>
        <div className="empLeft">
          <div className="empAvatar" style={{ backgroundColor: dotColor }} title={name} >
            {location_name}
          </div>
          <div >
            <div className="empName" title={name}>{name}</div>
            {meta.address ? (
              <div className="empMeta" title={meta.address}>
                {meta.address}
              </div>
            ) : null}
          </div>

          {locked ? <span className="locPill">Default</span> : null}
        </div>

        <div className="empActions" onClick={(e) => e.stopPropagation()}>
          <ButtonComponent

            cssClass={`e-flat empIconBtn ${locked ? "locIconLocked" : ""}`}
            iconCss="e-btn-icon e-icons e-edit"
            disabled={locked}
            title={locked ? "Default location cannot be edited" : "Edit"}
            onClick={(ev: any) => {
              ev.stopPropagation();
              startEditLocation(name);
            }}
          />
          <ButtonComponent
            cssClass={` e-flat empSfDanger e-btn ${locked ? "locIconLocked" : ""}`}

            iconCss="e-icons e-trash"
            disabled={locked}
            title={locked ? "Default location cannot be deleted" : "Delete"}
            onClick={(ev: any) => {
              ev.stopPropagation();
              deleteLocationRow(name);
            }}
          />
        </div>
      </div>
    );
  };
  const renderLocationsDialogBody = () => {
    const isEmpty = !locationsListData?.length;

    if (locationsView === "add") {
      const isEdit = !!editingLocationName;

      return (
        <div className="mlBody">

          <div className="mlDivider" />

          <div className="mlAddWrap">
            <div className="mlField">
              <label className="mlLabel">
                Location Name <span className="mlReq">*</span>
              </label>
              <TextBoxComponent
                value={locationNameInputValue}
                placeholder="e.g., Main Office, Downtown Store"
                input={(e: any) => {
                  setLocationNameInputValue(e.value ?? "");
                  if (locationFormError) setLocationFormError("");
                }}
                cssClass="mlInput"
              />
              {locationFormError ? <div className="mlError">{locationFormError}</div> : null}
            </div>

            <div className="mlField">
              <label className="mlLabel">Address</label>
              <TextBoxComponent
                value={locationAddressInputValue}
                placeholder="e.g., 123 Main St, City, State"
                input={(e: any) => setLocationAddressInputValue(e.value ?? "")}
                cssClass="mlInput"
              />
            </div>

            <div className="mlField">
              <label className="mlLabel">Color</label>
              <div className="mlPaletteWrap">
                <ColorPickerComponent
                  value={locationColorValue}
                  mode="Palette"
                  inline={false}
                  showButtons={true}

                  change={(args: any) => {
                    const next = args?.currentValue?.hex ?? args?.value ?? "#10b981";
                    setLocationColorValue(next);
                  }}
                />
              </div>
            </div>


          </div>
          <div className="mlFooterRight">
            <ButtonComponent cssClass="e-primary add-location-btn" type="button" onClick={submitLocation}>
              {isEdit ? "Update Location" : "Add Location"}
            </ButtonComponent>
            <ButtonComponent
              cssClass="e-outline"
              type="button"
              onClick={() => {
                setLocationsView("list");
                setLocationFormError("");
                setEditingLocationName(null);
              }}
            >
              Cancel
            </ButtonComponent>
          </div>
        </div>
      );
    }

    return (
      <div className="mlBody">

        <div className="mlDivider" />

        <div className="mlTopRow">
          <div className="mlDesc">Manage your business locations and their settings.</div>
          <ButtonComponent cssClass="e-primary add-location-btn" iconCss="e-icons e-plus" type="button" onClick={onAddLocationClick}>
            Add Location
          </ButtonComponent>
        </div>

        <div className="mlContent">
          {isEmpty ? (
            <div className="mlEmpty">
              <div className="mlEmptyIcon" aria-hidden="true">
                <svg width="78" height="78" viewBox="0 0 64 64" fill="none">
                  <path
                    d="M32 56s16-14.7 16-28c0-8.8-7.2-16-16-16S16 19.2 16 28c0 13.3 16 28 16 28Z"
                    stroke="#D1D5DB"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <circle cx="32" cy="28" r="6" stroke="#D1D5DB" strokeWidth="3" />
                </svg>
              </div>
              <div className="mlEmptyTitle">No locations added yet.</div>
              <div className="mlEmptySub">Click "Add Location" to get started.</div>
            </div>
          ) : (
            <div className="mlListWrap">
              <ListViewComponent
                dataSource={locationsListData}
                fields={{ text: "text" }}
                template={locationItemTemplate}
                cssClass="mlListView"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const showEmpty = employees.length === 0;
  const empCount = employees?.length ?? 0;
  const shiftCount = appointments?.length ?? 0;

  return (
    <div className="appRoot">
      <style>{`
        .appRoot { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; background:#f7fafc; min-height:95vh; }
        .topInner { display:flex; align-items:center; position:relative; top:0; z-index:10; background:#046AE5;color:#fff;justify-content:space-between; gap:12px; padding:15px 16px; }
        .leftBlock { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .chips { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
        .board { background:#fff; border:1px solid #e6edf3; border-radius:14px; overflow:hidden; position:relative; }
        .shiftCard { padding: 3px 11px 11px 11px; border-radius:10px;  text-overflow: ellipsis;}
        .shiftTime { font-weight:500; font-size:12px; color:#111827; text-overflow: ellipsis; }
        .shiftRole { font-size:12px; color:#374151; margin-top:4px; text-overflow: ellipsis; }
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
      `}</style>
      <div className="topInner">
        <div className="leftBlock">
          <div className="chips">
            <DropDownListComponent
              id="location"
              dataSource={effectiveLocations}
              value={selectedLocation}
              change={(e: any) => setSelectedLocation(e.value as LocationName)}
              width="130px"
              cssClass="custom-locations-dropdown e-flaat "
            />

            <ButtonComponent
              cssClass="manage-locations-btn e-flat"
              onClick={() => {
                setLocationsView("list");
                setLocationFormError("");
                setEditingLocationName(null);
                setShowLocationsDialog(true);
              }}
            >
              <span className="e-icons e-location"> </span>
              Locations
            </ButtonComponent>

            <ButtonComponent cssClass="manage-locations-btn e-flat" onClick={openEmployees}>
              <span className="e-icons e-people"> </span>
              Employees
            </ButtonComponent>

            <ButtonComponent
              cssClass="manage-locations-btn e-flat"
              onClick={() => {
                setRolesView("list");
                setRoleFormError("");
                setEditingRoleName(null);
                setShowRolesDialog(true);
              }}
            >
              <span className="e-icons e-equalto"></span>
              Roles
            </ButtonComponent>

            <ButtonComponent cssClass="manage-locations-btn e-flat" onClick={loadTestData}>
              <span className="e-icons  e-file-new"></span>
              Load Example Data
            </ButtonComponent>

            <ButtonComponent cssClass="manage-locations-btn e-flat" onClick={() => setShowSummaryDialog(true)}>
              <span className="e-icons e-properties-2"></span>
              Summary
            </ButtonComponent>

            <DropDownButtonComponent
              cssClass="options-btn e-flat"
              iconCss="e-icons e-more-vertical-2"
              items={optionItems}
              content="Options"
              select={onOptionsSelect}
            >

            </DropDownButtonComponent>

          </div>
        </div>

        <div className="rightBlock">
          <div className="help-pane-content">
            <img
              className="syncfusion-logo"
              src="https://static.syncfusion.com/wp-content/free-tools/document-editor-online-app/online-docx-editor/icons/Syncfusion-Logo.svg"
              alt="Syncfusion"
            />
            <span className="help-text">Powered by&nbsp;</span>
            <a
              className="free-tools-sample-explore-btn"
              href="https://www.syncfusion.com/react-components/react-scheduler"
              target="_blank"
              rel="noreferrer"
            >
              Syncfusion Scheduler
            </a>
          </div>
        </div>
      </div>


      {notice && (
        <div className={`noticeBar ${notice.type}`}>
          <span
            className={
              notice.type === "success"
                ? "e-icons e-check"
                : notice.type === "info"
                  ? "e-icons e-info"
                  : "e-icons e-warning"
            }
          />
          <div>{notice.message}</div>
        </div>
      )}

      <div className="container">
        <div className="board">
          {showEmpty && (
            <div className="emptyOverlay">
              <div className="emptyCard">
                <div className="emptyBtns">
                  <ButtonComponent
                    cssClass="add-employee-btn e-outline"
                    onClick={() => {
                      setEditingEmployee(null);
                      setShowEmployeesDialog(true);
                    }}
                  >
                    <span className="btn-text">
                      <span className="e-icons e-people" /> <span>Add</span> Employees
                    </span>
                  </ButtonComponent>

                  <ButtonComponent
                    cssClass="add-roles-btn e-outline"
                    onClick={() => {
                      setRolesView("list");
                      setRoleFormError("");
                      setShowRolesDialog(true);
                    }}
                  >
                    <span className="e-icons e-equalto"></span>
                    <span className="hidden sm:inline">Add</span> Roles
                  </ButtonComponent>

                  <ButtonComponent
                    cssClass="add-locations-btn e-outline"
                    onClick={() => {
                      setLocationsView("list");
                      setLocationFormError("");
                      setShowLocationsDialog(true);
                    }}
                  >
                    <span className="e-icons e-location"></span> Add Locations
                  </ButtonComponent>

                  <ButtonComponent cssClass="test-data-btn e-outline" onClick={loadTestData}>
                    <span className="e-icons e-file-new"></span>Example Data
                  </ButtonComponent>
                </div>

                <br />
                <div className="emptyTitle">No employees added yet</div>
                <div className="emptyDesc">Add employees to start scheduling</div>
              </div>
            </div>
          )}

          <ScheduleComponent
            key={`${hasAnyData ? "schedule-has-data" : "schedule-empty"}-${hasEmployees ? "with-emps" : "no-emps"}`}
            ref={scheduleRef}
            className="scheduledate"
            height={"calc(100vh - 135px)"}
            selectedDate={selectedDate}
            currentView={"TimelineWeek"}
            navigating={onNavigating}
            popupOpen={onPopupOpen}
            cellClick={onCellClick}
            eventClick={onEventClick}
            allowDragAndDrop={hasEmployees}
            allowResizing={hasEmployees}
            timeScale={timeScaleConfig as any}
            rowAutoHeight={true}
            startHour="00:00"
            endHour="24:00"
            workDays={[0, 1, 2, 3, 4, 5, 6]}
            workHours={{ start: "6:00", end: "20:00 " }}
            firstDayOfWeek={0}
            eventSettings={eventSettings as any}
            group={groupOptions as any}
            resourceHeaderTemplate={resourceHeaderTemplate as any}
            actionBegin={onActionBegin}
            actionComplete={onActionComplete}
          >
            <ResourcesDirective>
              <ResourceDirective
                field="EmployeeId"
                title="Employee"
                name="Employees"
                dataSource={resourceData}
                textField="Text"
                idField="Id"
                colorField="Color"
              />
            </ResourcesDirective>

            <ViewsDirective>
              <ViewDirective option="TimelineDay" />
              <ViewDirective option="TimelineWeek" />
              <ViewDirective option="TimelineMonth" />
            </ViewsDirective>

            <Inject services={[TimelineViews, TimelineMonth, Month, Week, Day, Resize, DragAndDrop, Print, ICalendarExport, ICalendarImport, ExcelExport]} />
          </ScheduleComponent>
        </div>
      </div>

      {/* Clear Data dialog */}
      <DialogComponent
        id="clearData"
        header="Clear Data"
        visible={showClearDialog}
        isModal={true}
        showCloseIcon={true}
        width="min(92vw, 550px)"
        height="min(88vh, 480px)"
        //height="min(88vh, 620px)"
        animationSettings={{ effect: "None" }}
        target={dialogTarget}
        beforeClose={() => setShowClearDialog(false)}
      >
        <div className="clear-dialog-layout">

          {/* Scrollable content area */}
          <div className="clear-dialog-scrollable">
            {/* Warning banner */}
            <div
              style={{
                border: "1px solid #f5d0a6",
                background: "#fff7ed",
                borderRadius: 12,
                padding: 14,
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div className="cdIconWarning">
                <span className="e-icons e-warning" style={{ color: "#f97316", marginTop: 2 }} />
              </div>
              <div>
                <div style={{ fontWeight: 500, color: "#9a3412" }}>
                  Warning: This action cannot be undone
                </div>
                <div style={{ color: "#9a3412", fontSize: 13, marginTop: 4 }}>
                  Choose what data you want to clear. All cleared data will be permanently deleted.
                </div>
              </div>
            </div>

            {/* Choice cards */}
            <div className="cdChoices">
              <div
                className={"cdCard " + (clearChoice === "shifts" ? "cdCardActive" : "")}
                onClick={() => setClearChoice("shifts")}
                role="button"
                tabIndex={0}
              >
                <div className="cdIconWrap cdIconNeutral">
                  <span className="e-input-group-icon e-date-icon e-icons" />
                </div>
                <div className="cdCardBody">
                  <div className="cdCardTitle">Clear Shifts Only</div>
                  <div className="cdCardDesc">
                    Remove all <b>{shiftCount}</b> shifts but keep employees
                  </div>
                  <div className="cdCardSub">Employees and their settings will remain intact</div>
                </div>
              </div>

              <div
                className={"cdCard cdCardDanger " + (clearChoice === "everything" ? "cdCardDangerActive" : "")}
                onClick={() => setClearChoice("everything")}
                role="button"
                tabIndex={0}
              >
                <div className="cdIconWrap cdIconDanger">
                  <span className="e-icons e-trash" />
                </div>
                <div className="cdCardBody">
                  <div className="cdCardTitle">Clear Everything</div>
                  <div className="cdCardDesc">
                    Remove all <b>{empCount}</b> employees and <b>{shiftCount}</b> shifts
                  </div>
                  <div className="cdCardSub">Start fresh with a completely empty schedule</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky / Fixed Footer */}
          <div className="clear-dialog-footer">
            <ButtonComponent
              cssClass={clearChoice === "everything" ? "cdBtnDanger" : "cdBtnWarn"}
              onClick={() => {
                if (clearChoice === "everything") clearEverything();
                else clearShiftsOnly();
                setShowClearDialog(false);
              }}
            >
              <span
                className={
                  "e-icons " +
                  (clearChoice === "everything" ? "e-trash" : "e-input-group-icon e-date-icon e-icons")
                }
                style={{ marginRight: 8 }}
              />
              {clearChoice === "everything" ? "Clear Everything" : "Clear Shifts"}
            </ButtonComponent>

            <ButtonComponent cssClass="e-outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </ButtonComponent>
          </div>
        </div>
      </DialogComponent>

      {/* Employees dialog */}
      <DialogComponent
        id="employeeDialog"
        visible={showEmployeesDialog}
        width="440px"
        height="545px"
        overflow-y="auto"
        isModal={true}
        header="Manage Employees"
        showCloseIcon={true}
        target={dialogTarget}
        animationSettings={{ effect: "None" }}
        beforeClose={() => setShowEmployeesDialog(false)}
      >
        <ManageEmployeesList
          employees={employees}
          appointments={filteredAppointments}
          onAdd={() => {
            setEditingEmployee(null);
            setShowEmployeeForm(true);
          }}
          onEdit={(emp) => {
            setEditingEmployee(emp);
            setShowEmployeeForm(true);
          }}
          onDelete={(empId) => deleteEmployeeById(empId)}
          onClose={() => setShowEmployeesDialog(false)}
        />
      </DialogComponent>

      {/* ICS import */}
      <DialogComponent
        visible={showIcsDialog}
        id="importdialog"
        header="Import Schedule"
        isModal={true}
        showCloseIcon={true}
        width="min(92vw, 620px)"
        animationSettings={{ effect: "None" }}
        target={dialogTarget}
        beforeClose={() => {
          setShowIcsDialog(false);
          setIcsFile(null);
          try {
            icsUploaderRef.current?.clearAll?.();
          } catch { }
        }}
      >
        <div className="impWrap">
          <div className="impUploadBox">
            <div className="impDropZone">
              <div className="impCloudIcon">
                <span className="e-icons e-upload-1 impCloudIcon" />
              </div>
              <div className="impMainText">Upload your ICS file only.</div>


              <UploaderComponent
                id="fileUpload"
                type="file"
                allowedExtensions=".ics"
                cssClass="calendar-import"
                buttons={{ browse: 'Choose File' }}
                multiple={false}
                showFileList={false}
                selected={onImportClick}
                created={createUpload}
              />
            </div>
          </div>
        </div>
      </DialogComponent>

      {/* Employee form */}
      <DialogComponent
        visible={showEmployeeForm}
        width="536px"
        height="588px"
        overflow-y="auto"
        id="empform"
        animationSettings={{ effect: "None" }}
        isModal={true}
        showCloseIcon={true}
        header={editingEmployee?.Id ? "Edit Employee" : "Add Employee"}
        target={dialogTarget}
        beforeClose={() => { setShowEmployeeForm(false); setEditingEmployee(null); }}
      >
        <EmployeeForm
          initial={editingEmployee}
          open={showEmployeeForm}
          roles={roles}
          employees={employees}
          onOpenRoles={() => setShowRolesDialog(true)}
          onCancel={() => setShowEmployeeForm(false)}
          onSave={(emp) => saveEmployee(emp)}
          onDelete={(id) => deleteEmployeeById(id)}
        />
      </DialogComponent>

      {/* Roles */}
      <DialogComponent
        id="roledialog"
        visible={showRolesDialog}
        header="Manage Roles"
        width="410px"
        height="385px"
        // height removed per user request
        showCloseIcon={true}
        animationSettings={{ effect: "None" }}
        isModal={true}
        target={dialogTarget}
        cssClass="mrDialog"
        open={() => {
          const focusEmployee = () => {
            const input = document.querySelector<HTMLInputElement>('#roledialog input.e-input');
            if (input) {
              input.focus();
              input.select?.();
            } else {
              document.getElementById('roledialog')?.focus?.();
            }
          };

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(focusEmployee, 100);
            });
          });
        }}
        beforeClose={() => {
          setShowRolesDialog(false);
          setRolesView("list");
          setRoleFormError("");
          setEditingRoleName(null);
        }}
      >
        {renderRolesDialogBody()}
      </DialogComponent>

      {/* Locations */}
      <DialogComponent
        id="locationdialog"
        visible={showLocationsDialog}
        header="Manage Locations"
        width="434px"
        height="399px"
        isModal={true}
        showCloseIcon={true}
        target={dialogTarget}
        animationSettings={{ effect: "None" }}
        cssClass="mlDialog"
        beforeClose={() => {
          setShowLocationsDialog(false);
          setLocationsView("list");
          setLocationFormError("");
          setEditingLocationName(null);
        }}
      >
        {renderLocationsDialogBody()}
      </DialogComponent>

      {/* Shift create/edit */}
      <DialogComponent
        header={editingShift ? "Edit Shift" : "Create Shift"}
        visible={showShiftDialog}
        width="min(92vw, 920px)"
        height="min(90vh, 600px)"
        isModal={true}
        showCloseIcon={true}
        target={dialogTarget}
        animationSettings={{ effect: "None" }}
        id="shiftdialog"
        open={() => {
          const focusEmployee = () => {
            const input = document.querySelector<HTMLInputElement>('#shiftdialog input.e-input');
            if (input) {
              input.focus();
              input.select?.();
            } else {
              document.getElementById('shiftdialog')?.focus?.();
            }
          };

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(focusEmployee, 100);
            });
          });
        }}
        beforeClose={() => { setShowShiftDialog(false); setShiftFormError(""); }}
      >
        <ShiftDialog
          employees={employees}
          roles={roles}
          locations={locations}
          selectedLocation={selectedLocation}
          selectedEmployeeId={selectedEmployeeId}
          cell={cellSelection}
          initialEvent={editingShift}
          formError={shiftFormError}
          onClearError={() => setShiftFormError("")}
          onCancel={() => {
            setShowShiftDialog(false);
            setShiftFormError("");                    // clear on cancel
          }}
          onSubmit={createOrUpdateShift}
          onDelete={(id) => deleteShift(id)}
        />
      </DialogComponent>

      {/* Summary dialog */}
      <DialogComponent
        id="summaryDialog"
        header={`Summary (${selectedLocation})`}
        visible={showSummaryDialog}
        className="summery-dialog"
        height="min(88vh, 720px)"
        animationSettings={{ effect: "None" }}
        isModal={true}
        showCloseIcon={true}
        target={dialogTarget}
        beforeClose={() => setShowSummaryDialog(false)}
      >
        <div style={{ padding: "10px", borderTop: "1px solid #e5e7eb" }}>
          <GridComponent id="summaryGrid" dataSource={summaryRows} clipMode={"EllipsisWithTooltip"}
            emptyRecordTemplate={() => (
              <div className="emptyRecordTemplate">
                <div style={{ fontSize: '14px', color: '#111827' }}>
                  No data available for the selected locations right now.
                </div>
              </div>
            )}
            height={"270px"}>
            <ColumnsDirective>
              <ColumnDirective field="Name" headerText="Employee" width="150" />
              <ColumnDirective field="Role" headerText="Role" width="170" />
              <ColumnDirective field="Shifts" headerText="Shifts" width="60" textAlign="Right" />
              <ColumnDirective field="TotalHours" headerText="Total Hours" width="100" textAlign="Right" />
              <ColumnDirective field="HourlyRate" headerText="Hourly Rate" width="100" textAlign="Right" />
              <ColumnDirective field="EstCost" headerText="Est. Cost" width="110" textAlign="Right" />
              <ColumnDirective field="MaxHoursDay" headerText="Max/Day" width="110" textAlign="Right" />
              <ColumnDirective field="MaxHoursWeek" headerText="Max/Week" width="110" textAlign="Right" />
            </ColumnsDirective>
            <GridInject services={[Page]} />
          </GridComponent>
        </div>
      </DialogComponent>

      {/* export dialog */}
      <DialogComponent
        visible={showExportDialog}
        id="Exportdialog"
        header="Export Schedule"
        isModal={true}
        animationSettings={{ effect: "None" }}
        showCloseIcon={true}
        width="min(92vw, 620px)"
        //height="min(88vh, 410px)"
        target={dialogTarget}
        beforeClose={() => setShowExportDialog(false)}
      >
        <div className="exportDlgBody">
          <div className="exportFormatGrid">
            <ButtonComponent
              type="button"
              cssClass={"exportFormatCard " + (exportFormat === "csv" ? "active" : "")}
              onClick={() => setExportFormat("csv")}
            >
              <span className="e-icons e-export exportCardIcon" />
              <div className="exportCardLabel">Excel</div>
            </ButtonComponent>

            <ButtonComponent
              type="button"
              cssClass={"exportFormatCard " + (exportFormat === "pdf" ? "active" : "")}
              onClick={() => setExportFormat("pdf")}
            >
              <span className="e-icons e-export-pdf exportCardIcon" />
              <div className="exportCardLabel">PDF</div>
            </ButtonComponent>

            <ButtonComponent
              type="button"
              cssClass={"exportFormatCard " + (exportFormat === "ics" ? "active" : "")}
              onClick={() => setExportFormat("ics")}
            >
              <span className="e-icons e-download exportCardIcon" />
              <div className="exportCardLabel">ICS</div>
            </ButtonComponent>
          </div>



          <div className="exportDlgFooter">
            <ButtonComponent cssClass="e-primary e-export-btn" type="button" onClick={handleExportFromDialog}>
              <span className="e-icons e-download" style={{ marginRight: 8 }} />
              {exportFormat === "csv" ? "Export Excel" : exportFormat === "ics" ? "Export ICS" : "Export PDF"}
            </ButtonComponent>
            <ButtonComponent cssClass="e-outline" type="button" onClick={() => setShowExportDialog(false)}>
              Cancel
            </ButtonComponent>
          </div>
        </div>
      </DialogComponent>

      <StickySchedulerFooterPromo />
    </div>
  );
}

function initials(name: string): string {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "??";
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? (parts[1]?.[0] ?? "") : (parts[0]?.[1] ?? "");
  return (a + b).toUpperCase();
}

function ManageEmployeesList({ employees, appointments, onAdd, onEdit, onDelete, onClose }: ManageEmployeesListProps): JSX.Element {
  const total = employees?.length ?? 0;

  const shiftsCount = (empId: number) => (appointments ?? []).filter((a) => a.EmployeeId === empId).length;
  const maxWeekText = (e: Employee) => (e?.MaxHoursWeek ? `Max: ${e.MaxHoursWeek}h/week` : "Max: —");

  return (
    <div className="empModal">
      <div className="empTopRow">
        <div className="empCount">
          <span className="e-icons e-user empCountIcon" />
          <span>{total} employees</span>
        </div>
        <ButtonComponent cssClass="e-primary add-emp-btn" type="button" onClick={onAdd}>
          + Add Employee
        </ButtonComponent>
      </div>

      {total === 0 ? (
        <div className="empEmptyWrap">
          <div className="empEmptyIcon">
            <svg width="76" height="76" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <path
                d="M32 31c6.2 0 11.2-5 11.2-11.2S38.2 8.6 32 8.6 20.8 13.6 20.8 19.8 25.8 31 32 31Z"
                stroke="#D1D5DB"
                strokeWidth="3"
              />
              <path d="M12 55c2.6-10 11-16 20-16s17.4 6 20 16" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
              <path d="M50 30c3.7 0 6.7-3 6.7-6.7S53.7 16.6 50 16.6" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
              <path d="M46.2 38c4.8.9 8.6 3.6 10.8 8" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div className="empEmptyTitle">No employees yet</div>
          <div className="empEmptyText">Get started by adding your first employee to begin scheduling shifts.</div>
          <ButtonComponent cssClass="e-primary empEmptyCta" onClick={onAdd}>
            + Add Your First Employee
          </ButtonComponent>
        </div>
      ) : (
        <div className="empList">
          {(employees ?? []).map((e) => (
            <div className="empRow" key={e.Id}>
              <div className="empLeft">
                <div className="empAvatar" style={{ background: e.Color ?? "#e5e7eb" }} title={e.Name}>
                  {initials(e.Name)}
                </div>
                <div>
                  <div className="empName">{e.Name}</div>
                  <div className="empMeta">
                    {maxWeekText(e)} • {shiftsCount(e.Id)} shifts
                  </div>
                </div>
              </div>

              <div className="empActions">
                <ButtonComponent cssClass="e-flat empIconBtn" onClick={() => onEdit(e)} title="Edit">
                  <span className="e-btn-icon e-icons e-edit" />
                </ButtonComponent>
                <ButtonComponent
                  cssClass="e-flat empIconBtn empSfDanger"
                  iconCss="e-icons e-trash"
                  onClick={() => {
                    // if (window.confirm("Delete employee and all their shifts?")) 
                    onDelete(e.Id);
                  }}
                  title="Delete"
                >

                </ButtonComponent>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const DEFAULT_COLOR = "#10b981";
const normalizeEmpName = (s: unknown) => String(s ?? "").trim().toLowerCase();
function EmployeeForm({ initial, open, roles, employees, onSave, onDelete, onCancel, onOpenRoles }: EmployeeFormProps): JSX.Element {
  const isEdit = !!initial?.Id;

  const [name, setName] = useState<string>(initial?.Name ?? "");
  const [hourly, setHourly] = useState<number>(initial?.HourlyRate ?? 15);
  const [maxWeek, setMaxWeek] = useState<number>(initial?.MaxHoursWeek ?? 40);
  const [maxDay, setMaxDay] = useState<number>(initial?.MaxHoursDay ?? 8);
  const [minRest, setMinRest] = useState<number>(initial?.MinHoursBetweenShifts ?? 8);

  const [assignedRoles, setAssignedRoles] = useState<string[]>(
    initial?.AssignedRoles ?? (initial?.Role ? [initial.Role] : [])
  );

  const [color, setColor] = useState<string>(initial?.Color ?? DEFAULT_COLOR);
  const [formError, setFormError] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");

  const formRef = useRef<HTMLFormElement | null>(null);
  const fvRef = useRef<FormValidator | null>(null);

  const roleOptions = useMemo(() => (roles ?? []).filter(Boolean), [roles]);


  useEffect(() => {
    if (!open) return;

    setName(initial?.Name ?? "");
    setHourly(initial?.HourlyRate ?? 15);
    setMaxWeek(initial?.MaxHoursWeek ?? 40);
    setMaxDay(initial?.MaxHoursDay ?? 8);
    setMinRest(initial?.MinHoursBetweenShifts ?? 8);
    setColor(initial?.Color ?? DEFAULT_COLOR);

    const initRoles = initial?.AssignedRoles ?? (initial?.Role ? [initial.Role] : []);
    setAssignedRoles(initRoles);

    setFormError("");
    setNameError(""); // clear name exists error each time dialog opens
  }, [open, initial]);




  useEffect(() => {
    if (!formRef.current) return;
    const t = window.setTimeout(() => {
      try {
        fvRef.current?.destroy?.();
      } catch { }
      fvRef.current = new FormValidator(formRef.current as any, {
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
      } catch { }
    };
  }, []);

  const toggleRole = (r: string) => {
    setAssignedRoles((prev) => {
      const has = prev.includes(r);
      return has ? prev.filter((x) => x !== r) : [...prev, r];
    });
  };

  const submit = () => {
    setFormError("");
    setNameError(""); // clear old error

    const trimmed = String(name ?? "").trim();

    // // required check (extra safety)
    // if (!trimmed) {
    //   setNameError("Name is required");
    //   setFormError("Please fix the highlighted fields.");
    //   return;
    // }

    // Duplicate check ONLY on submit
    const newKey = normalizeEmpName(trimmed);
    const currentId = initial?.Id ?? 0;

    const duplicate = (employees ?? []).some(
      (e) => normalizeEmpName(e.Name) === newKey && e.Id !== currentId
    );

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

  return (
    <div>

      <form ref={formRef} className="empAddForm" onSubmit={(e) => e.preventDefault()} noValidate>


        <div className="empAddDivider" />

        {formError ? <div className="empFormError">{formError}</div> : null}

        <div className="empAddBody">
          <div className="empFieldBlock">
            <label className="empLabel">Name <span className="mrReq">*</span></label>
            <TextBoxComponent id="Name" name="Name" value={name} placeholder="Enter employee name " input={(e: any) => setName(e.value ?? "")} />
            {nameError ? <div className="mrError">{nameError}</div> : null}
          </div>

          <div className="empFieldBlock">
            <label className="empLabel">Color</label>
            <div className="empColorRow">
              <ColorPickerComponent
                id="EmpColor"
                value={color ?? DEFAULT_COLOR}
                mode="Palette"
                inline={false}
                showButtons={true}
                columns={12}
                change={(args: any) => {
                  const next = args?.currentValue?.hex ?? args?.value ?? DEFAULT_COLOR;
                  setColor(next);
                }}
              />
            </div>
            <div className="empHint">Color will be auto-generated if not selected</div>
          </div>

          <div className="empFieldBlock">
            <div className="empLabelRow">
              <label className="empLabel">Assigned Roles</label>
            </div>

            <div className="empRoleBox">
              {roleOptions.length === 0 ? (
                <div className="">No roles available</div>
              ) : (
                roleOptions.map((r) => (
                  <div key={r} className="empRoleItem">
                    <CheckBoxComponent checked={assignedRoles.includes(r)} change={() => toggleRole(r)} label={r} />
                    <span className="empRoleDot" />
                  </div>
                ))
              )}
            </div>

            <div className="empHint">Select the roles this employee can work</div>
          </div>

          <div className="empFieldBlock">
            <label className="empLabel">Hourly Wage</label>
            <NumericTextBoxComponent
              id="HourlyRate"
              name="HourlyRate"
              value={hourly}
              min={0}
              max={15}
              step={0.01}
              format="n2"
              placeholder="15.00"
              change={(e: any) => setHourly(e.value)}
            />
            <div className="empHint">Used for labor cost calculations</div>
          </div>

          <div className="empFieldBlock">
            <label className="empLabel">Max Hours/Week</label>
            <NumericTextBoxComponent
              id="MaxHoursWeek"
              name="MaxHoursWeek"
              value={maxWeek}
              format="n0"          // ← change from n2 to n0 = 0 decimal places
              decimals={0}
              min={0}
              max={48}
              placeholder="40"
              change={(e: any) => setMaxWeek(e.value)}
            />
          </div>

          <div className="empFieldBlock">
            <label className="empLabel">Min Hours Between Shifts</label>
            <NumericTextBoxComponent
              id="MinRest"
              name="MinRest"
              value={minRest}
              min={0}
              format="n0"          // ← change from n2 to n0 = 0 decimal places
              decimals={0}
              max={24}
              placeholder="8"
              change={(e: any) => setMinRest(e.value)}
            />
            <div className="empHint">Minimum rest time between shifts</div>
          </div>
        </div>


      </form>
      <div className="empAddFooter">
        <ButtonComponent cssClass="e-primary add-employee" onClick={submit}>
          {isEdit ? "Save" : "Add Employee"}
        </ButtonComponent>
        <ButtonComponent cssClass="e-outline" type="button" onClick={onCancel}>
          Cancel
        </ButtonComponent>
      </div>
    </div>
  );
}

function ShiftDialog({
  employees,
  roles,
  locations,
  selectedLocation,
  selectedEmployeeId,
  cell,
  initialEvent,
  formError,
  onClearError,
  onCancel,
  onSubmit,
  onDelete,
}: ShiftDialogProps): JSX.Element {
  const hasEmployees = (employees ?? []).length > 0;

  const [employeeId, setEmployeeId] = useState<number>(() => employees?.[0]?.Id ?? 0);
  const [location, setLocation] = useState<string>(() => {
    if (selectedLocation && selectedLocation !== "All Locations") return selectedLocation;
    const first = (locations ?? []).find((l) => l && l !== "All Locations");
    return first ?? "";
  });
  const [role, setRole] = useState<string>("");
  const [date, setDate] = useState<Date>(cell?.startTime ? new Date(cell.startTime) : new Date());
  const [startTime, setStartTime] = useState<Date>(cell?.startTime ? new Date(cell.startTime) : new Date());
  const [endTime, setEndTime] = useState<Date>(
    cell?.endTime ? new Date(cell.endTime) : new Date(Date.now() + 1000 * 60 * 60 * 8)
  );
  const [breakDuration, setBreakDuration] = useState<number>(30);
  const [notes, setNotes] = useState<string>(initialEvent?.Notes ?? "");

  useEffect(() => {
    if (!hasEmployees) return;
    const init = selectedEmployeeId ?? employees[0].Id;
    setEmployeeId(init);
    const emp = employees.find((e) => e.Id === init);
    const empRole = emp?.Role;
    if ((roles ?? []).length) {
      const valid = !!empRole && (roles ?? []).includes(empRole);
      setRole(valid ? empRole! : (roles?.[0] ?? ""));
    } else {
      setRole(empRole ?? "");
    }
  }, [hasEmployees, employees, selectedEmployeeId, roles]);


  useEffect(() => {
    // Only apply in "Create Shift" mode
    if (initialEvent) return;

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

  function combineDateAndTime(d: Date, t: Date): Date {
    const res = new Date(d);
    res.setHours(t.getHours(), t.getMinutes(), 0, 0);
    return res;
  }

  function getMeridian(dt: Date): "AM" | "PM" {
    const h = dt?.getHours?.() ?? 0;
    return h >= 12 ? "PM" : "AM";
  }

  function setClock(dt: Date, hour12: number, minute = 0): Date {
    const x = new Date(dt);
    const mer = getMeridian(x);
    let h = hour12 % 12;
    if (mer === "PM") h += 12;
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
    if (!emp) return 0;
    return calcHours() * (emp.HourlyRate ?? 0);
  };

  const timeChips = [
    { label: "9:00", h: 9, m: 0 },
    { label: "12:00", h: 12, m: 0 },
    { label: "1:00", h: 1, m: 0 },
    { label: "5:00", h: 5, m: 0 },
    { label: "6:00", h: 6, m: 0 },
  ];

  const canSubmit =
    hasEmployees &&
    employeeId &&
    date &&
    startTime &&
    endTime &&
    combineDateAndTime(date, endTime) > combineDateAndTime(date, startTime);

  const handleSubmit = () => {
    if (!canSubmit) return;
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
  return (
    <div className="sfShiftForm">
      {!hasEmployees ? (
        <div className="shiftNoEmp">
          <div className="shiftNoEmpTitle">No employees available</div>
          <div className="shiftNoEmpSub">Please add an employee first to create shifts.</div>
          <div style={{ marginTop: 12 }}>
            <ButtonComponent cssClass="e-dlg-closeicon-btn e-control e-btn e-lib e-flat e-icon-btn" type="button" onClick={onCancel}>
              Close
            </ButtonComponent>
          </div>
        </div>
      ) : (
        <>

          <div className="shift-dialog-scrollable">
            {/*ERROR SHOWS AT TOP OF SCROLLABLE AREA */}
            {formError ? (
              <div className="formError" role="alert">
                {formError}
              </div>
            ) : null}
            <div className="shiftFormWrap">
              {/*FORM CONTENT */}
              <div className="shiftGrid3">
                <div className="sfField">
                  <label>Employee</label>
                  <DropDownListComponent
                    cssClass="e-outline"
                    dataSource={employeeData}
                    fields={{ text: "text", value: "value" }}
                    value={employeeId}
                    change={(e: any) => {
                      onClearError?.(); //clear error on change
                      setEmployeeId(e.value);
                      const chosen = employees.find((x) => x.Id === e.value);
                      if (chosen && chosen.Role) setRole(chosen.Role);
                    }}
                  />
                </div>

                <div className="sfField">
                  <label>Location</label>
                  <DropDownListComponent
                    cssClass="e-outline"
                    dataSource={locationData}
                    fields={{ text: "text", value: "value" }}
                    value={locationEnabled ? location : null}
                    enabled={locationEnabled}
                    placeholder={locationEnabled ? "Select location" : "No locations available"}
                    change={(e: any) => {
                      onClearError?.(); // 
                      setLocation(e.value);
                    }}
                  />
                  {!locationEnabled ? (
                    <div className="hintText">Add locations from the Locations dialog to enable this field.</div>
                  ) : null}
                </div>

                <div className="sfField">
                  <label>Role</label>
                  <DropDownListComponent
                    cssClass="e-outline"
                    dataSource={roleData}
                    fields={{ text: "text", value: "value" }}
                    value={roleEnabled ? role : null}
                    enabled={roleEnabled}
                    placeholder={roleEnabled ? "Select role" : "No roles available"}
                    change={(e: any) => {
                      onClearError?.(); // 
                      setRole(e.value);
                    }}
                  />
                  {!roleEnabled ? <div className="hintText">Add roles from the Roles dialog to enable this field.</div> : null}
                </div>
              </div>

              <div className="shiftGrid3">
                <div className="sfField">
                  <label>Date</label>
                  <DatePickerComponent
                    cssClass="e-outline"
                    id="editDate"
                    value={date}
                    change={(e: any) => {
                      onClearError?.();
                      setDate(e.value);
                    }}
                  />
                </div>
                <div className="sfField">
                  <label>Start Time</label>
                  <div className="timeRow">
                    <TimePickerComponent
                      cssClass="e-outline"
                      value={startTime}
                      width={"100%"}
                      format="h:mm"
                      step={15}
                      change={(e: any) => {
                        onClearError?.(); // 
                        setStartTime(e.value);
                      }}
                    />
                  </div>
                  {/* <div className="timeChips">
                {timeChips.map((t) => (
                  <ButtonComponent
                    key={t.label}
                    cssClass="timeChipBtn"
                    type="button"
                    onClick={() => {
                      onClearError?.(); // 
                      setStartTime((prev) => setClock(prev, t.h, t.m));
                    }}
                  >
                    {t.label}
                  </ButtonComponent>
                ))}
              </div> */}
                </div>

                <div className="sfField">
                  <label>End Time </label>
                  <div className="timeRow">
                    <TimePickerComponent
                      cssClass="e-outline"
                      value={endTime}
                      format="h:mm"
                      step={15}
                      change={(e: any) => {
                        onClearError?.(); // 
                        setEndTime(e.value);
                      }}
                    />
                  </div>
                  {/* <div className="timeChips">
                {timeChips.map((t) => (
                  <ButtonComponent
                    key={t.label}
                    cssClass="timeChipBtn"
                    type="button"
                    onClick={() => {
                      onClearError?.(); // 
                      setEndTime((prev) => setClock(prev, t.h, t.m));
                    }}
                  >
                    {t.label}
                  </ButtonComponent>
                ))}
              </div> */}
                </div>
              </div>


              <div className="shiftGrid2">
                <div className="sfField">
                  <label>Break Duration (minutes)</label>
                  <NumericTextBoxComponent
                    cssClass="e-outline"
                    value={breakDuration}
                    min={0}
                    format="n0"
                    change={(e: any) => {
                      onClearError?.(); // 
                      setBreakDuration(e.value);
                    }}
                  />
                </div>

                <div className="summaryCard">
                  <div className="summaryTop">
                    <span className="e-icons e-clock summaryIcon" />
                    <div className="summaryText">
                      <div className="summaryHours">{calcHours().toFixed(1)} hours</div>
                      <div className="summaryCost">${calcCost().toFixed(2)} estimated cost</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shiftGrid1">
                <div className="sfField">
                  <label>Notes</label>
                  <TextBoxComponent
                    cssClass="e-outline"
                    value={notes}
                    placeholder="e.g., Opening manager"
                    multiline={true}
                    htmlAttributes={{ rows: "2" }}
                    input={(e: any) => {
                      onClearError?.(); // 
                      setNotes(e.value ?? "");
                    }}
                  />
                </div>
              </div>

              <div className="constraintsBox">
                <div className="constraintsTitle">
                  <span className="e-icons e-circle-info" />
                  <span>Employee Constraints:</span>
                </div>
                <div className="constraintsBody">
                  <div>Max hours per week: {maxWeek}h</div>
                  <div>Min hours between shifts: {minRest}h</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer is outside scrollable area */}
          <div className="shiftFooter">
            {/* {initialEvent?.Id ? (
            <ButtonComponent cssClass="e-danger" className="del-btn" type="button" onClick={() => onDelete?.(initialEvent.Id)}>
              <span className="e-icons e-trash" style={{ marginRight: 6 }} />
              Delete
            </ButtonComponent>
          ) : (
            <div />
          )} */}

            <ButtonComponent className="crt-btn" cssClass="e-primary" type="button" disabled={!canSubmit} onClick={handleSubmit}>
              {initialEvent ? "Update Shift" : "Create Shift"}
            </ButtonComponent>

            <ButtonComponent className="can-btn" cssClass="e-cancel" type="button" onClick={onCancel}>
              Cancel
            </ButtonComponent>
          </div>
        </>
      )}
    </div>
  );

}

function StickySchedulerFooterPromo(): JSX.Element {
  return (
    <div className="stickyPromoBar">
      <div className="stickyPromoInner">
        <div className="promoText">
          <div className="promoLine1">Want shift scheduling in your app? <strong className="promoStrong">Try our Scheduler Component</strong> — plan shifts, manage resources, and export calendars!
          </div>
          <div className="promoLine2">
          </div>
        </div>

        <div className="promoActions">
          <ButtonComponent
            cssClass="e-primary"
            className="trail-button"
            iconPosition="right"
            iconCss="e-icons e-arrow-right"
            onClick={() => window.open("https://www.syncfusion.com/react-components/react-scheduler", "_blank", "noopener")}
          >
            Start Free Trial
          </ButtonComponent>

          <ButtonComponent
            className="trail-button-demo"
            cssClass="e-flat"
            onClick={() => window.open("https://www.syncfusion.com/request-demo", "_blank", "noopener")}
          >
            Request Demo
          </ButtonComponent>
        </div>
      </div>
    </div>
  );
}
