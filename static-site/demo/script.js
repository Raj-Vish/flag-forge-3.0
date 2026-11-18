/* =========================================================
   ABC UNIVERSITY — BROKEN ACCESS CONTROL TEACHING LAB
   Everything below runs client-side. It intentionally
   re-creates the vulnerability described in the brief:
   the "server" trusts a client-supplied role value
   (URL parameter, cookie, or unsigned JWT claim) instead
   of checking the authenticated session.
   ========================================================= */

// ---------- Fake "server-side" data ----------
const USERS = {
  student1: {
    password: "Password123",
    role: "student",
    name: "Rahul Verma",
    id: 101,
  },
  // teacher1: {
  //   password: "Password123",
  //   role: "faculty",
  //   name: "Ms. Anjali Rao",
  //   id: 12,
  // },
  // admin: {
  //   password: "SuperSecret123",
  //   role: "admin",
  //   name: "Administrator",
  //   id: 1,
  // },
};

const STUDENTS = [
  {
    id: 101,
    name: "Rahul Verma",
    math: 98,
    science: 92,
    english: 88,
    attendance: "87%",
    semester: 5,
    cgpa: 8.7,
    phone: "98200-11201",
    parent: "R. K. Verma",
    address: "12 MG Road, Thane",
    fees: "₹1,10,000",
    scholarship: "None",
  },
  {
    id: 102,
    name: "Priya Nair",
    math: 95,
    science: 99,
    english: 91,
    attendance: "93%",
    semester: 5,
    cgpa: 9.1,
    phone: "98200-11202",
    parent: "S. Nair",
    address: "4 Lake View, Thane",
    fees: "₹95,000",
    scholarship: "Merit — 20%",
  },
  {
    id: 103,
    name: "Amit Shah",
    math: 71,
    science: 80,
    english: 76,
    attendance: "78%",
    semester: 3,
    cgpa: 7.2,
    phone: "98200-11203",
    parent: "D. Shah",
    address: "9 Station Rd, Thane",
    fees: "₹1,10,000",
    scholarship: "None",
  },
  {
    id: 104,
    name: "Karan Mehta",
    math: 88,
    science: 85,
    english: 90,
    attendance: "91%",
    semester: 5,
    cgpa: 8.5,
    phone: "98200-11204",
    parent: "V. Mehta",
    address: "21 Hill Colony, Thane",
    fees: "₹1,20,000",
    scholarship: "Sports — 10%",
  },
];

const FACULTY = [
  {
    id: 12,
    name: "Ms. Anjali Rao",
    dept: "Mathematics",
    salary: "₹86,000/mo",
    pan: "ABCDE1234F",
    bank: "HDFC Bank",
    account: "0091 XXXX 4471",
  },
  {
    id: 13,
    name: "Mr. Devan Iyer",
    dept: "Physics",
    salary: "₹91,500/mo",
    pan: "PQRSX9988K",
    bank: "ICICI Bank",
    account: "0342 XXXX 9012",
  },
];

let AUDIT = [
  { t: "09:02", ev: "admin login success" },
  { t: "09:14", ev: "teacher1 login success" },
  { t: "10:31", ev: "admin changed password policy" },
  { t: "11:02", ev: "student deleted: id 118 (test account)" },
];
let ANNOUNCEMENTS = [
  {
    who: "Administrator",
    text: "Semester 5 timetable published on the notice board.",
  },
];
let CREATED_USERS = [];

// ---------- App state ----------
const state = {
  user: null, // the authenticated account {username, actualRole, name}
  mode: "param", // 'param' | 'cookie' | 'jwt'
  urlRole: "student", // value carried in the ?role= parameter
  cookieRole: "student",
  jwtPayload: { id: 0, username: "", role: "student" },
  page: "overview",
  selectedId: null,
  loginSelected: "student1",
  loginMode: "param",
  logs: [],
};

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(() => t.classList.remove("show"), 2200);
}

// The single line that recreates the whole vulnerability:
// the effective role is read from client-controlled data,
// never from the authenticated session.
function getEffectiveRole() {
  if (!state.user) return null;
  if (state.mode === "param") return state.urlRole;
  if (state.mode === "cookie") return state.cookieRole;
  if (state.mode === "jwt") return state.jwtPayload.role;
}

function log(method, url, note, vuln) {
  state.logs.unshift({ method, url, note, vuln, id: Math.random() });
  if (state.logs.length > 30) state.logs.pop();
  renderConsole();
}

function b64(obj) {
  try {
    return btoa(JSON.stringify(obj));
  } catch (e) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  }
}

// ---------- Routing helpers ----------
function goto(page, id) {
  state.page = page;
  state.selectedId = id ?? null;
  render();
}

function currentAddr() {
  if (state.mode === "param") {
    let p = "dashboard.php?role=" + state.urlRole;
    if (state.page !== "overview") p += "&view=" + state.page;
    if (state.selectedId) p += "&id=" + state.selectedId;
    return p;
  }
  if (state.mode === "cookie") {
    let p = "dashboard.php";
    if (state.page !== "overview") p += "?view=" + state.page;
    if (state.selectedId)
      p += (p.includes("?") ? "&" : "?") + "id=" + state.selectedId;
    return p;
  }
  let p = "dashboard.php";
  if (state.page !== "overview") p += "?view=" + state.page;
  if (state.selectedId)
    p += (p.includes("?") ? "&" : "?") + "id=" + state.selectedId;
  return p;
}

function applyAddrEdit(val) {
  // Parse role= out of the pretend URL and update state — this is the
  // "attacker" changing the request. Mirrors typing a new URL in the bar.
  const m = val.match(/role=([a-zA-Z]+)/);
  if (m) {
    state.urlRole = m[1].toLowerCase();
    log(
      "GET",
      val,
      'Client changed role parameter to "' + state.urlRole + '"',
      true,
    );
  } else {
    log("GET", val, "Navigated", false);
  }
  render();
}

// ============================================================
// RENDER: LOGIN
// ============================================================
function renderLogin() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <div class="lesson-header">
          <div class="eyebrow">Broken Access Control Lab</div>
          <h1>ABC University Portal</h1>
          <p>Sign in as any demo account, then explore. The dashboard trusts a value the browser sends — not the session that authenticated you.</p>
        </div>

        <div class="demo-users" id="demoUsers">
          ${Object.entries(USERS)
            .map(
              ([u, d]) => `
            <div class="demo-user ${state.loginSelected === u ? "selected" : ""}" data-u="${u}">
              <div><div class="u">${u}</div><div class="r">${d.name}</div></div>
              <div class="r">role: ${d.role}</div>
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="field">
          <label>Password</label>
          <input id="pwInput" value="${USERS[state.loginSelected].password}" />
        </div>

        <div class="field">
          <label>Vulnerability variant to demonstrate</label>
          <div class="mode-select" id="modeSelect">
            <div class="mode-opt ${state.loginMode === "param" ? "selected" : ""}" data-m="param"><span class="name">URL param</span><span class="hint">?role=</span></div>
          </div>
        </div>

        <button class="btn btn-primary" style="width:100%; padding:10px;" id="loginBtn">Log in</button>
        <p style="font-size:11px;color:#8a8368;text-align:center;margin-top:14px;">All three accounts use the same lab so you can compare how student, faculty and admin views differ before you touch anything.</p>
      </div>
    </div>
  `;
  document.querySelectorAll(".demo-user").forEach((el) => {
    el.onclick = () => {
      state.loginSelected = el.dataset.u;
      render();
    };
  });
  document.querySelectorAll(".mode-opt").forEach((el) => {
    el.onclick = () => {
      state.loginMode = el.dataset.m;
      render();
    };
  });
  document.getElementById("loginBtn").onclick = doLogin;
}

function doLogin() {
  const pw = document.getElementById("pwInput").value;
  const u = USERS[state.loginSelected];
  if (pw !== u.password) {
    toast("Incorrect password.");
    return;
  }
  state.user = {
    username: state.loginSelected,
    actualRole: u.role,
    name: u.name,
    id: u.id,
  };
  state.mode = state.loginMode;
  state.urlRole = u.role;
  state.cookieRole = u.role;
  state.jwtPayload = { id: u.id, username: state.loginSelected, role: u.role };
  state.page = "overview";
  state.selectedId = null;
  state.logs = [];
  log(
    "POST",
    "/login",
    "Authenticated as " +
      state.loginSelected +
      " (session role: " +
      u.role +
      ")",
    false,
  );
  render();
}

function logout() {
  state.user = null;
  state.logs = [];
  render();
}

// ============================================================
// RENDER: DASHBOARD SHELL
// ============================================================
const MODULES = [
  {
    id: "students",
    title: "Manage Students",
    desc: "Browse every student record by ID.",
    chip: "IDOR",
    roles: ["admin"],
  },
  {
    id: "fees",
    title: "Fee & Family Details",
    desc: "Address, phone, parent name, scholarship.",
    chip: "PII exposure",
    roles: ["admin"],
  },
  {
    id: "salary",
    title: "Faculty Salaries",
    desc: "Pay, PAN and bank account by ID.",
    chip: "PII exposure",
    roles: ["admin"],
  },
  {
    id: "export",
    title: "Export Student Data",
    desc: "Download every record as CSV.",
    chip: "Mass data leak",
    roles: ["admin"],
  },
  {
    id: "audit",
    title: "Audit Logs",
    desc: "Logins, password changes, deletions.",
    chip: "Sensitive ops data",
    roles: ["admin"],
  },
  {
    id: "roles",
    title: "Role Management",
    desc: "Change any account's role — including your own.",
    chip: "Privilege escalation",
    roles: ["admin"],
  },
  {
    id: "createuser",
    title: "Create User",
    desc: "Create a brand-new account with any role.",
    chip: "Privilege escalation",
    roles: ["admin"],
  },
  {
    id: "announce",
    title: "Announcements",
    desc: "Post to the whole university.",
    chip: "Integrity",
    roles: ["admin"],
  },
  {
    id: "papers",
    title: "Exam Papers",
    desc: "Midterm, Final and the answer key.",
    chip: "Confidential leak",
    roles: ["admin"],
  },
  {
    id: "backup",
    title: "Server Backup",
    desc: "Full database.sql export.",
    chip: "Total compromise",
    roles: ["admin"],
  },
];

function renderShell() {
  const role = getEffectiveRole();
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="chrome">
      <div class="dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div>
      <div class="addr">
        <span class="scheme">http://</span>
        <input id="addrInput" value="lab.local/${currentAddr()}" />
        <button class="go" id="goBtn">Go</button>
      </div>
      <div class="mode-pill">${state.mode === "param" ? "URL param mode" : state.mode === "cookie" ? "Cookie mode" : "JWT mode"}</div>
      <button class="btn" id="logoutBtn" style="font-size:10.5px;">Log out</button>
    </div>
    <div class="split">
      <div class="paper-pane">
        <div class="letterhead">
          <div class="seal">AU</div>
          <div>
            <h1>ABC University</h1>
            <div class="sub">STUDENT MANAGEMENT PORTAL</div>
          </div>
          <div class="role-badge">
            signed in as <b>${state.user.username}</b><br/>
            session role: ${state.user.actualRole} &nbsp;|&nbsp; page thinks you're: <b style="color:${role === "admin" ? "#ffb4a8" : "#fff"}">${role}</b>
          </div>
        </div>
        <div class="content" id="content"></div>
      </div>
      <div class="console-pane">
        <div class="console-head"><span>Attacker console</span><span class="live">● live requests</span></div>
        <div class="console-log" id="consoleLog"></div>
        <div class="console-foot" id="modeControls"></div>
      </div>
    </div>
  `;
  document.getElementById("logoutBtn").onclick = logout;
  document.getElementById("goBtn").onclick = () =>
    applyAddrEdit(document.getElementById("addrInput").value);
  document.getElementById("addrInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyAddrEdit(e.target.value);
  });
  renderModeControls();
  renderContent();
  renderConsole();
}

function renderModeControls() {
  const el = document.getElementById("modeControls");
  if (state.mode === "cookie") {
    el.innerHTML = `
      <div style="margin-bottom:6px; color:var(--console-dim);">devtools &rsaquo; Application &rsaquo; Cookies</div>
      <div style="display:flex; gap:6px; align-items:center;">
        <span style="color:var(--console-accent2);">role=</span>
        <input id="cookieInput" value="${state.cookieRole}" style="background:#161b22;border:1px solid var(--console-line);color:var(--console-text);font-family:var(--mono);font-size:11px;padding:3px 6px;border-radius:4px;width:90px;" />
        <button class="btn" id="cookieSet" style="font-size:10px;">set</button>
      </div>`;
    document.getElementById("cookieSet").onclick = () => {
      state.cookieRole =
        document.getElementById("cookieInput").value.trim().toLowerCase() ||
        "student";
      log(
        "COOKIE",
        "document.cookie",
        'Cookie "role" set to "' + state.cookieRole + '"',
        true,
      );
      renderShell();
    };
  } else if (state.mode === "jwt") {
    const tok = b64({ alg: "none" }) + "." + b64(state.jwtPayload) + ".";
    el.innerHTML = `
      <div style="margin-bottom:6px; color:var(--console-dim);">Authorization: Bearer &lt;token&gt;</div>
      <div class="jwt-box" style="margin-bottom:6px;">${tok}</div>
      <div style="display:flex; gap:6px; align-items:center;">
        <span style="color:var(--console-accent2);">role:</span>
        <input id="jwtRole" value="${state.jwtPayload.role}" style="background:#161b22;border:1px solid var(--console-line);color:var(--console-text);font-family:var(--mono);font-size:11px;padding:3px 6px;border-radius:4px;width:80px;" />
        <button class="btn" id="jwtSet" style="font-size:10px;">re-sign (fake)</button>
      </div>
      <div style="color:var(--console-dim); margin-top:4px;">alg:"none" — no signature is ever verified server-side.</div>`;
    document.getElementById("jwtSet").onclick = () => {
      state.jwtPayload.role =
        document.getElementById("jwtRole").value.trim().toLowerCase() ||
        "student";
      log(
        "JWT",
        "payload.role",
        'Token payload edited to role="' +
          state.jwtPayload.role +
          '" — signature not re-checked',
        true,
      );
      renderShell();
    };
  } else {
    el.innerHTML = `<div style="color:var(--console-dim);">Edit the address bar above — try changing <span style="color:var(--console-accent2);">role=student</span> to <span style="color:var(--console-accent2);">role=admin</span>.</div>`;
  }
}

function renderConsole() {
  const el = document.getElementById("consoleLog");
  if (!el) return;
  el.innerHTML =
    state.logs
      .map(
        (l) => `
    <div class="log-entry">
      <div class="req"><span class="method">${l.method}</span> ${l.url}</div>
      <div style="color:var(--console-dim); margin-top:2px;">${l.note}</div>
      <span class="verdict ${l.vuln ? "vuln" : "ok"}">${l.vuln ? "⚠ authorization not enforced" : "✓ logged"}</span>
    </div>
  `,
      )
      .join("") ||
    '<div style="color:var(--console-dim);">No requests yet.</div>';
}

// ============================================================
// RENDER: CONTENT PAGES
// ============================================================
function renderContent() {
  const role = getEffectiveRole();
  const el = document.getElementById("content");
  const isAdminView = role === "admin";

  const crumb =
    state.page === "overview"
      ? ""
      : `<div class="breadcrumbs"><button onclick="goto('overview')">← overview</button></div>`;

  let body = "";
  if (state.page === "overview") {
    body = renderOverview(role);
  } else if (!isAdminView) {
    body = `<div class="callout">This section requires the admin view, and your session role is <b>${state.user.actualRole}</b>. (If you're seeing this, the lab is behaving correctly — try tampering with the ${state.mode} to reach it anyway.)</div>`;
  } else {
    switch (state.page) {
      case "students":
        body = renderStudentsList();
        break;
      case "studentDetail":
        body = renderStudentDetail(state.selectedId);
        break;
      case "editMarks":
        body = renderEditMarks(state.selectedId);
        break;
      case "fees":
        body = renderFees();
        break;
      case "feeDetail":
        body = renderFeeDetail(state.selectedId);
        break;
      case "salary":
        body = renderSalary();
        break;
      case "export":
        body = renderExport();
        break;
      case "audit":
        body = renderAudit();
        break;
      case "roles":
        body = renderRoles();
        break;
      case "createuser":
        body = renderCreateUser();
        break;
      case "announce":
        body = renderAnnounce();
        break;
      case "papers":
        body = renderPapers();
        break;
      case "backup":
        body = renderBackup();
        break;
      default:
        body = renderOverview(role);
    }
  }
  el.innerHTML = crumb + body;
  attachContentHandlers();
}

function renderOverview(role) {
  if (role === "admin") {
    log(
      "GET",
      currentAddr(),
      'Rendered admin_dashboard.php — checked only the "role" value above, never the session',
      true,
    );
    return `
      <h2>Welcome, Administrator</h2>
      <p class="tagline">Full portal control. Every module below trusts the same tampered value.</p>
      <div class="stat-grid">
        <div class="stat"><div class="num">1,200</div><div class="lbl">Total students</div></div>
        <div class="stat"><div class="num">86</div><div class="lbl">Faculty</div></div>
        <div class="stat"><div class="num">143</div><div class="lbl">Pending fees</div></div>
        <div class="stat"><div class="num" style="color:var(--safe);">Healthy</div><div class="lbl">Server status</div></div>
      </div>
      <div class="callout"><b>How you got here:</b> the ${state.mode === "param" ? "URL parameter" : state.mode === "cookie" ? "cookie" : "JWT claim"} says "admin". The server never compared that to your actual session (<b>${state.user.actualRole}</b>). This is Broken Access Control (OWASP A01).</div>
      <div class="module-grid">
        ${MODULES.map(
          (m) => `
          <div class="module-card" onclick="goto('${m.id}')">
            <div class="m-title">${m.title}</div>
            <div class="m-desc">${m.desc}</div>
            <span class="m-chip">${m.chip}</span>
          </div>
        `,
        ).join("")}
      </div>
    `;
  }
  if (role === "faculty") {
    log("GET", currentAddr(), "Rendered faculty_dashboard.php", false);
    return `
      <h2>Welcome, ${state.user.name}</h2>
      <p class="tagline">Faculty view — your classes at a glance.</p>
      <div class="stat-grid">
        <div class="stat"><div class="num">4</div><div class="lbl">Classes taught</div></div>
        <div class="stat"><div class="num">112</div><div class="lbl">Students</div></div>
        <div class="stat"><div class="num">3</div><div class="lbl">Pending grades</div></div>
        <div class="stat"><div class="num">86%</div><div class="lbl">Avg. attendance</div></div>
      </div>
      <div class="callout safe"><b>Nothing broken here — yet.</b> Try switching the demo account at the top to <code>student1</code>, then tamper with the ${state.mode} to reach the admin modules.</div>
    `;
  }
  log("GET", currentAddr(), "Rendered student_dashboard.php", false);
  return `
    <h2>Welcome, ${state.user.name}</h2>
    <p class="tagline">Student view — current role: student</p>
    <div class="stat-grid">
      <div class="stat"><div class="num">87%</div><div class="lbl">Attendance</div></div>
      <div class="stat"><div class="num">5</div><div class="lbl">Semester</div></div>
      <div class="stat"><div class="num">8.7</div><div class="lbl">CGPA</div></div>
      <div class="stat"><div class="num">—</div><div class="lbl">Pending fees</div></div>
    </div>
    <div class="card-panel">
      <b>View Marks</b> · <b>View Profile</b>
      <p style="font-size:12.5px;color:#8a8368;">Looks perfectly normal — that's the point. Nothing on this page hints that the backend never checks who you really are.</p>
    </div>
    <div class="callout">Try it: edit the address bar above and change <code>role=student</code> to <code>role=admin</code>${state.mode !== "param" ? " (or switch to URL-param mode at login)" : ""}, then press Go.</div>
  `;
}

function renderStudentsList() {
  log(
    "GET",
    "student.php (list)",
    "Returned all 1,200 student rows to a request only checking role=admin",
    true,
  );
  return `
    <h2>Manage Students</h2>
    <p class="tagline">Click a row, or edit the address bar's <code>id=</code> value directly — no per-record ownership check exists.</p>
    <table>
      <tr><th>ID</th><th>Name</th><th>Semester</th><th>CGPA</th><th></th></tr>
      ${STUDENTS.map(
        (
          s,
        ) => `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.semester}</td><td>${s.cgpa}</td>
      <td><button class="btn" data-view="${s.id}">View</button> <button class="btn" data-edit="${s.id}">Edit marks</button> <button class="btn btn-danger" data-del="${s.id}">Delete</button></td></tr>`,
      ).join("")}
    </table>
    <div class="callout"><b>IDOR:</b> <code>student.php?id=101</code> → <code>id=102</code> returns a different student with no ownership check at all.</div>
  `;
}

function renderStudentDetail(id) {
  const s = STUDENTS.find((x) => x.id === Number(id)) || STUDENTS[0];
  state.selectedId = s.id;
  log(
    "GET",
    "student.php?id=" + s.id,
    "Returned marks for " + s.name + " — any id works",
    true,
  );
  return `
    <h2>${s.name} <span class="chip">id ${s.id}</span></h2>
    <p class="tagline">Marks record — change the id in the URL to view any other student.</p>
    <table>
      <tr><th>Subject</th><th>Marks</th></tr>
      <tr><td>Math</td><td>${s.math}</td></tr>
      <tr><td>Science</td><td>${s.science}</td></tr>
      <tr><td>English</td><td>${s.english}</td></tr>
    </table>
    <div style="margin-top:14px;"><button class="btn" onclick="goto('students')">← back to list</button></div>
  `;
}

function renderEditMarks(id) {
  const s = STUDENTS.find((x) => x.id === Number(id)) || STUDENTS[0];
  state.selectedId = s.id;
  return `
    <h2>Edit Marks — ${s.name} <span class="chip">id ${s.id}</span></h2>
    <p class="tagline">POST edit.php?id=${s.id} — accepted with no server-side validation of who is submitting.</p>
    <div class="card-panel">
      <div class="row">
        <div class="field"><label>Math</label><input id="mMath" value="${s.math}"/></div>
        <div class="field"><label>Science</label><input id="mSci" value="${s.science}"/></div>
        <div class="field"><label>English</label><input id="mEng" value="${s.english}"/></div>
      </div>
      <button class="btn btn-primary" id="saveMarks">Save changes</button>
    </div>
    <div class="callout"><b>Mass modification:</b> a student in the "admin" view can overwrite anyone's grades. Real deployments have been breached this exact way.</div>
  `;
}

function renderFees() {
  log("GET", "fees.php (list)", "Listed every student for fee/PII lookup", true);
  return `
    <h2>Fee &amp; Family Details</h2>
    <p class="tagline">Personally identifiable information, exposed the same way.</p>
    <table>
      <tr><th>ID</th><th>Name</th><th></th></tr>
      ${STUDENTS.map((s) => `<tr><td>${s.id}</td><td>${s.name}</td><td><button class="btn" data-fee="${s.id}">View</button></td></tr>`).join("")}
    </table>
  `;
}

function renderFeeDetail(id) {
  const s = STUDENTS.find((x) => x.id === Number(id)) || STUDENTS[0];
  log(
    "GET",
    "fees.php?id=" + s.id,
    "Returned address, phone, parent name and scholarship for " + s.name,
    true,
  );
  return `
    <h2>${s.name} — Fee Record</h2>
    <table>
      <tr><td>Address</td><td>${s.address}</td></tr>
      <tr><td>Phone</td><td>${s.phone}</td></tr>
      <tr><td>Parent name</td><td>${s.parent}</td></tr>
      <tr><td>Fees due</td><td>${s.fees}</td></tr>
      <tr><td>Scholarship</td><td>${s.scholarship}</td></tr>
    </table>
    <div class="callout"><b>PII exposure:</b> home address, phone number and family details for any student, one id away.</div>
    <button class="btn" onclick="goto('fees')" style="margin-top:12px;">← back</button>
  `;
}

function renderSalary() {
  log("GET", "salary.php", "Returned faculty pay, PAN and bank details", true);
  return `
    <h2>Faculty Salaries</h2>
    <table>
      <tr><th>ID</th><th>Name</th><th>Dept</th><th>Salary</th><th>PAN</th><th>Bank</th><th>Account</th></tr>
      ${FACULTY.map((f) => `<tr><td>${f.id}</td><td>${f.name}</td><td>${f.dept}</td><td>${f.salary}</td><td>${f.pan}</td><td>${f.bank}</td><td>${f.account}</td></tr>`).join("")}
    </table>
    <div class="callout"><b>Sensitive financial data:</b> bank accounts and PAN numbers should never be reachable from a tampered role check.</div>
  `;
}

function renderExport() {
  return `
    <h2>Export Student Data</h2>
    <p class="tagline">export.php?type=students — generates a CSV of every record in one request.</p>
    <button class="btn btn-primary" id="dlCsv">Download CSV</button>
    <div class="callout"><b>Mass data leakage:</b> what took one row at a time via IDOR can be exfiltrated in bulk through an export endpoint that makes the same mistake.</div>
  `;
}

function renderAudit() {
  log(
    "GET",
    "audit.php",
    "Returned operational security logs — logins, password changes, deletions",
    true,
  );
  return `
    <h2>Audit Logs</h2>
    <table>
      <tr><th>Time</th><th>Event</th></tr>
      ${AUDIT.map((a) => `<tr><td>${a.t}</td><td>${a.ev}</td></tr>`).join("")}
    </table>
    <div class="callout"><b>Operational exposure:</b> logs like these help an attacker learn what's monitored and cover their tracks.</div>
  `;
}

function renderRoles() {
  return `
    <h2>Role Management</h2>
    <p class="tagline">roles.php — change any account's role. Watch what happens when you change your own.</p>
    <div class="card-panel">
      <div class="field">
        <label>Account: ${state.user.username}</label>
        <select id="selfRole">
          <option value="student" ${state.user.actualRole === "student" ? "selected" : ""}>Student</option>
          <option value="faculty" ${state.user.actualRole === "faculty" ? "selected" : ""}>Faculty</option>
          <option value="admin" ${state.user.actualRole === "admin" ? "selected" : ""}>Admin</option>
        </select>
      </div>
      <button class="btn btn-primary" id="applyRole">Change role</button>
      <span class="chip self">current session role: ${state.user.actualRole}</span>
    </div>
    <div class="callout"><b>Permanent privilege escalation:</b> unlike the URL/cookie/JWT tampering above (which only fakes the role for this session), this endpoint actually rewrites the account's real role in the database.</div>
  `;
}

function renderCreateUser() {
  return `
    <h2>Create User</h2>
    <p class="tagline">Any authenticated account can create a new account of any role — no approval step.</p>
    <div class="card-panel">
      <div class="row">
        <div class="field"><label>Name</label><input id="nuName" placeholder="e.g. Eve Adams"/></div>
        <div class="field"><label>Username</label><input id="nuUser" placeholder="eviladmin"/></div>
      </div>
      <div class="row">
        <div class="field"><label>Password</label><input id="nuPass" placeholder="Password123"/></div>
        <div class="field"><label>Role</label>
          <select id="nuRole"><option value="student">Student</option><option value="faculty">Faculty</option><option value="admin" selected>Admin</option></select>
        </div>
      </div>
      <button class="btn btn-primary" id="nuCreate">Create user</button>
    </div>
    ${CREATED_USERS.length ? `<table style="margin-top:16px;"><tr><th>Username</th><th>Name</th><th>Role</th></tr>${CREATED_USERS.map((u) => `<tr><td>${u.user}</td><td>${u.name}</td><td>${u.role}</td></tr>`).join("")}</table>` : ""}
    <div class="callout"><b>Backdoor account:</b> a permanent admin account created by a student survives long after the original tampering trick is patched.</div>
  `;
}

function renderAnnounce() {
  return `
    <h2>Announcements</h2>
    <p class="tagline">Posts here are broadcast to every student and faculty member instantly.</p>
    <div class="card-panel">
      <div class="field"><label>Message</label><input id="annText" placeholder="Final exam cancelled"/></div>
      <button class="btn btn-primary" id="annPost">Publish</button>
    </div>
    <div style="margin-top:14px;">
      ${ANNOUNCEMENTS.map((a) => `<div class="card-panel" style="margin-bottom:8px;"><b>${a.who}</b><br/><span style="font-size:13px;">${a.text}</span></div>`).join("")}
    </div>
    <div class="callout"><b>Integrity impact:</b> broken authorization isn't only about reading data — here it lets anyone impersonate an official university voice.</div>
  `;
}

function renderPapers() {
  log("GET", "papers.php", "Listed exam papers including AnswerKey.pdf", true);
  return `
    <h2>Exam Papers</h2>
    <table>
      <tr><th>File</th><th></th></tr>
      <tr><td>Midterm.pdf</td><td><button class="btn" data-paper="Midterm.pdf">Download</button></td></tr>
      <tr><td>Final.pdf</td><td><button class="btn" data-paper="Final.pdf">Download</button></td></tr>
      <tr><td>AnswerKey.pdf</td><td><button class="btn btn-danger" data-paper="AnswerKey.pdf">Download</button></td></tr>
    </table>
    <div class="callout"><b>Academic integrity breach:</b> the answer key sitting behind the same broken check as everything else.</div>
  `;
}

function renderBackup() {
  return `
    <h2>Server Backup</h2>
    <p class="tagline">backup.zip — contains a full database.sql dump.</p>
    <button class="btn btn-danger" id="dlBackup">Download backup.zip</button>
    <div class="callout"><b>Total compromise:</b> at this point the "student" account can walk away with the entire database — passwords, records, everything. This is the ceiling of what chained authorization flaws can cost.</div>
  `;
}

// ---------- content-level event wiring ----------
function attachContentHandlers() {
  document
    .querySelectorAll("[data-view]")
    .forEach((b) => (b.onclick = () => goto("studentDetail", b.dataset.view)));
  document
    .querySelectorAll("[data-edit]")
    .forEach((b) => (b.onclick = () => goto("editMarks", b.dataset.edit)));
  document
    .querySelectorAll("[data-fee]")
    .forEach((b) => (b.onclick = () => goto("feeDetail", b.dataset.fee)));
  document.querySelectorAll("[data-del]").forEach(
    (b) =>
      (b.onclick = () => {
        const id = Number(b.dataset.del);
        const idx = STUDENTS.findIndex((s) => s.id === id);
        if (idx > -1) {
          const removed = STUDENTS.splice(idx, 1)[0];
          log(
            "GET",
            "delete.php?id=" + id,
            "Deleted student record for " +
              removed.name +
              " — no confirmation, no authorization check",
            true,
          );
          toast("Deleted " + removed.name + " (id " + id + ")");
          renderContent();
        }
      }),
  );
  document.querySelectorAll("[data-paper]").forEach(
    (b) =>
      (b.onclick = () => {
        log(
          "GET",
          "papers.php?file=" + b.dataset.paper,
          "Downloaded " + b.dataset.paper,
          true,
        );
        toast("Downloaded " + b.dataset.paper + " (simulated)");
      }),
  );
  const saveMarks = document.getElementById("saveMarks");
  if (saveMarks)
    saveMarks.onclick = () => {
      const s = STUDENTS.find((x) => x.id === state.selectedId);
      s.math = Number(document.getElementById("mMath").value);
      s.science = Number(document.getElementById("mSci").value);
      s.english = Number(document.getElementById("mEng").value);
      log(
        "POST",
        "edit.php?id=" + s.id,
        "Marks overwritten for " + s.name,
        true,
      );
      toast("Marks saved for " + s.name);
      goto("students");
    };
  const dlCsv = document.getElementById("dlCsv");
  if (dlCsv)
    dlCsv.onclick = () => {
      log(
        "GET",
        "export.php?type=students",
        "Exported all student records as CSV",
        true,
      );
      const rows = ["Name,Phone,Address,Parent,Fees"].concat(
        STUDENTS.map(
          (s) => `${s.name},${s.phone},"${s.address}",${s.parent},${s.fees}`,
        ),
      );
      const blob = new Blob([rows.join("\n")], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "students_export.csv";
      a.click();
      toast("CSV downloaded");
    };
  const applyRole = document.getElementById("applyRole");
  if (applyRole)
    applyRole.onclick = () => {
      const newRole = document.getElementById("selfRole").value;
      state.user.actualRole = newRole;
      state.urlRole = newRole;
      state.cookieRole = newRole;
      state.jwtPayload.role = newRole;
      log(
        "POST",
        "roles.php",
        'Session role permanently changed to "' + newRole + '" in the database',
        true,
      );
      toast("Role changed to " + newRole + " — this is now permanent");
      renderShell();
    };
  const nuCreate = document.getElementById("nuCreate");
  if (nuCreate)
    nuCreate.onclick = () => {
      const name = document.getElementById("nuName").value || "Unnamed";
      const user =
        document.getElementById("nuUser").value ||
        "newuser" + Math.floor(Math.random() * 999);
      const role = document.getElementById("nuRole").value;
      CREATED_USERS.push({ name, user, role });
      log(
        "POST",
        "createuser.php",
        'Created account "' + user + '" with role=' + role,
        true,
      );
      toast("Created " + user + " as " + role);
      renderContent();
    };
  const annPost = document.getElementById("annPost");
  if (annPost)
    annPost.onclick = () => {
      const text = document.getElementById("annText").value.trim();
      if (!text) return;
      ANNOUNCEMENTS.unshift({
        who: state.user.name + " (posting as Administrator)",
        text,
      });
      log(
        "POST",
        "announcements.php",
        "Published announcement visible to entire university",
        true,
      );
      toast("Announcement published");
      renderContent();
    };
  const dlBackup = document.getElementById("dlBackup");
  if (dlBackup)
    dlBackup.onclick = () => {
      log("GET", "backup.zip", "Downloaded full database backup", true);
      const blob = new Blob(
        [
          "-- database.sql (simulated)\n-- users, students, faculty, fees, salaries\n",
        ],
        { type: "text/plain" },
      );
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "backup.sql";
      a.click();
      toast("backup.sql downloaded");
    };
}

// ---------- master render ----------
window.goto = goto;
function render() {
  if (!state.user) {
    renderLogin();
  } else {
    renderShell();
  }
}
render();
