import { useState, useEffect } from "react";
import "./App.css";

const API = "/api";

const get  = (url)       => fetch(url).then(r => r.json());
const post = (url, data) => fetch(url, { method: "POST",   headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
const put  = (url, data) => fetch(url, { method: "PUT",    headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json());
const del  = (url)       => fetch(url, { method: "DELETE" }).then(r => r.json());

// ── Authors ────────────────────────────────────────────────────────────────
function Authors() {
  const [authors, setAuthors] = useState([]);
  const [form, setForm]       = useState({ name: "", email: "" });
  const [editing, setEditing] = useState(null);

  const load = () => get(`${API}/authors`).then(setAuthors);
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (editing) { await put(`${API}/authors/${editing}`, form); setEditing(null); }
    else { await post(`${API}/authors`, form); }
    setForm({ name: "", email: "" });
    load();
  };

  return (
    <div className="section">
      <h2>📚 Authors</h2>
      <p className="badge">One-to-Many — Author → Books</p>
      <div className="row">
        <input placeholder="Name"  value={form.name}  onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <button onClick={submit}>{editing ? "Update" : "Add"}</button>
        {editing && <button className="cancel" onClick={() => { setEditing(null); setForm({ name: "", email: "" }); }}>Cancel</button>}
      </div>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
        <tbody>
          {authors.map(a => (
            <tr key={a._id}>
              <td>{a.name}</td><td>{a.email}</td>
              <td>
                <button onClick={() => { setForm({ name: a.name, email: a.email }); setEditing(a._id); }}>✏️</button>
                <button className="danger" onClick={async () => { await del(`${API}/authors/${a._id}`); load(); }}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Books ──────────────────────────────────────────────────────────────────
function Books() {
  const [books,   setBooks]   = useState([]);
  const [authors, setAuthors] = useState([]);
  const [form, setForm]       = useState({ title: "", genre: "", author_id: "" });
  const [editing, setEditing] = useState(null);

  const load = () => {
    get(`${API}/books`).then(setBooks);
    get(`${API}/authors`).then(setAuthors);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (editing) { await put(`${API}/books/${editing}`, form); setEditing(null); }
    else { await post(`${API}/books`, form); }
    setForm({ title: "", genre: "", author_id: "" });
    load();
  };

  return (
    <div className="section">
      <h2>📖 Books</h2>
      <p className="badge one-many">⭐ One-to-Many: Each book belongs to ONE author</p>
      <div className="row">
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Genre" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} />
        <select value={form.author_id} onChange={e => setForm({ ...form, author_id: e.target.value })}>
          <option value="">-- Author --</option>
          {authors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
        <button onClick={submit}>{editing ? "Update" : "Add"}</button>
        {editing && <button className="cancel" onClick={() => { setEditing(null); setForm({ title: "", genre: "", author_id: "" }); }}>Cancel</button>}
      </div>
      <table>
        <thead><tr><th>Title</th><th>Genre</th><th>Author (1:M)</th><th>Actions</th></tr></thead>
        <tbody>
          {books.map(b => (
            <tr key={b._id}>
              <td>{b.title}</td>
              <td>{b.genre}</td>
              <td><span className="hl">{b.author?.name || "—"}</span></td>
              <td>
                <button onClick={() => { setForm({ title: b.title, genre: b.genre, author_id: b.author_id }); setEditing(b._id); }}>✏️</button>
                <button className="danger" onClick={async () => { await del(`${API}/books/${b._id}`); load(); }}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Courses ────────────────────────────────────────────────────────────────
function Courses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm]       = useState({ title: "", code: "" });
  const [editing, setEditing] = useState(null);

  const load = () => get(`${API}/courses`).then(setCourses);
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (editing) { await put(`${API}/courses/${editing}`, form); setEditing(null); }
    else { await post(`${API}/courses`, form); }
    setForm({ title: "", code: "" });
    load();
  };

  return (
    <div className="section">
      <h2>🎓 Courses</h2>
      <p className="badge many-many">⭐ Many-to-Many: Courses ↔ Students</p>
      <div className="row">
        <input placeholder="Course Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Code e.g. CS101" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
        <button onClick={submit}>{editing ? "Update" : "Add"}</button>
        {editing && <button className="cancel" onClick={() => { setEditing(null); setForm({ title: "", code: "" }); }}>Cancel</button>}
      </div>
      <table>
        <thead><tr><th>Title</th><th>Code</th><th>Enrolled Students (M:M)</th><th>Actions</th></tr></thead>
        <tbody>
          {courses.map(c => (
            <tr key={c._id}>
              <td>{c.title}</td>
              <td>{c.code}</td>
              <td>{c.students?.length > 0 ? c.students.map(s => <span key={s._id} className="tag">{s.name}</span>) : <span className="muted">None</span>}</td>
              <td>
                <button onClick={() => { setForm({ title: c.title, code: c.code }); setEditing(c._id); }}>✏️</button>
                <button className="danger" onClick={async () => { await del(`${API}/courses/${c._id}`); load(); }}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Students ───────────────────────────────────────────────────────────────
function Students() {
  const [students, setStudents] = useState([]);
  const [courses,  setCourses]  = useState([]);
  const [form, setForm]         = useState({ name: "", email: "" });
  const [editing, setEditing]   = useState(null);
  const [sid, setSid]           = useState("");
  const [cid, setCid]           = useState("");

  const load = () => {
    get(`${API}/students`).then(setStudents);
    get(`${API}/courses`).then(setCourses);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (editing) { await put(`${API}/students/${editing}`, form); setEditing(null); }
    else { await post(`${API}/students`, form); }
    setForm({ name: "", email: "" });
    load();
  };

  const enroll = async () => {
    if (!sid || !cid) return alert("Select both student and course");
    await post(`${API}/students/${sid}/enroll/${cid}`, {});
    load();
  };

  return (
    <div className="section">
      <h2>👩‍🎓 Students</h2>
      <p className="badge many-many">⭐ Many-to-Many: Students ↔ Courses</p>
      <div className="row">
        <input placeholder="Name"  value={form.name}  onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <button onClick={submit}>{editing ? "Update" : "Add"}</button>
        {editing && <button className="cancel" onClick={() => { setEditing(null); setForm({ name: "", email: "" }); }}>Cancel</button>}
      </div>
      <div className="enroll-box">
        <b>Enroll Student in Course (Many-to-Many)</b>
        <div className="row" style={{ marginTop: "8px" }}>
          <select value={sid} onChange={e => setSid(e.target.value)}>
            <option value="">-- Student --</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select value={cid} onChange={e => setCid(e.target.value)}>
            <option value="">-- Course --</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <button onClick={enroll}>Enroll</button>
        </div>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Courses (M:M)</th><th>Actions</th></tr></thead>
        <tbody>
          {students.map(s => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.courses?.length > 0 ? s.courses.map(c => <span key={c._id} className="tag">{c.title}</span>) : <span className="muted">None</span>}</td>
              <td>
                <button onClick={() => { setForm({ name: s.name, email: s.email }); setEditing(s._id); }}>✏️</button>
                <button className="danger" onClick={async () => { await del(`${API}/students/${s._id}`); load(); }}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── App Root ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("authors");
  return (
    <div className="app">
      <header>
          <h1>Containerized with Docker App</h1>
          <div className="legend">
            <span className="legend-item one-many">🟡 One-to-Many</span>
            <span className="legend-item many-many">🟢 Many-to-Many</span>
          </div>
        </header>
      <nav>
        {["authors","books","students","courses"].map(t => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>
      <main>
        {tab === "authors"  && <Authors />}
        {tab === "books"    && <Books />}
        {tab === "students" && <Students />}
        {tab === "courses"  && <Courses />}
      </main>
    </div>
  );
}