from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os

app = Flask(__name__, static_folder="build", static_url_path="")
CORS(app)

client = MongoClient(os.environ.get("MONGO_URI", "mongodb://localhost:27017/"))
db = client["a28db"]

authors  = db["authors"]
books    = db["books"]
students = db["students"]
courses  = db["courses"]

def oid(id): return ObjectId(id)
def fmt(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# ── Serve React ────────────────────────────────────────────────────────────
@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_files(path):
    if path.startswith("api/"):
        return {"error": "not found"}, 404
    return send_from_directory(app.static_folder, path)

# ── AUTHORS ────────────────────────────────────────────────────────────────
@app.route("/api/authors", methods=["GET"])
def get_authors():
    return jsonify([fmt(a) for a in authors.find()])

@app.route("/api/authors", methods=["POST"])
def add_author():
    data = request.json
    r = authors.insert_one({"name": data["name"], "email": data["email"]})
    return jsonify({"_id": str(r.inserted_id)})

@app.route("/api/authors/<id>", methods=["PUT"])
def update_author(id):
    data = request.json
    authors.update_one({"_id": oid(id)}, {"$set": {"name": data["name"], "email": data["email"]}})
    return jsonify({"ok": True})

@app.route("/api/authors/<id>", methods=["DELETE"])
def delete_author(id):
    authors.delete_one({"_id": oid(id)})
    return jsonify({"ok": True})

# ── BOOKS ──────────────────────────────────────────────────────────────────
@app.route("/api/books", methods=["GET"])
def get_books():
    result = []
    for b in books.find():
        b = fmt(b)
        if b.get("author_id"):
            a = authors.find_one({"_id": oid(b["author_id"])})
            b["author"] = {"_id": b["author_id"], "name": a["name"]} if a else None
        result.append(b)
    return jsonify(result)

@app.route("/api/books", methods=["POST"])
def add_book():
    data = request.json
    r = books.insert_one({"title": data["title"], "genre": data["genre"], "author_id": data["author_id"]})
    return jsonify({"_id": str(r.inserted_id)})

@app.route("/api/books/<id>", methods=["PUT"])
def update_book(id):
    data = request.json
    books.update_one({"_id": oid(id)}, {"$set": {"title": data["title"], "genre": data["genre"], "author_id": data["author_id"]}})
    return jsonify({"ok": True})

@app.route("/api/books/<id>", methods=["DELETE"])
def delete_book(id):
    books.delete_one({"_id": oid(id)})
    return jsonify({"ok": True})

# ── COURSES ────────────────────────────────────────────────────────────────
@app.route("/api/courses", methods=["GET"])
def get_courses():
    result = []
    for c in courses.find():
        c = fmt(c)
        enrolled = []
        for sid in c.get("student_ids", []):
            s = students.find_one({"_id": oid(sid)})
            if s:
                enrolled.append({"_id": str(s["_id"]), "name": s["name"]})
        c["students"] = enrolled
        result.append(c)
    return jsonify(result)

@app.route("/api/courses", methods=["POST"])
def add_course():
    data = request.json
    r = courses.insert_one({"title": data["title"], "code": data["code"], "student_ids": []})
    return jsonify({"_id": str(r.inserted_id)})

@app.route("/api/courses/<id>", methods=["PUT"])
def update_course(id):
    data = request.json
    courses.update_one({"_id": oid(id)}, {"$set": {"title": data["title"], "code": data["code"]}})
    return jsonify({"ok": True})

@app.route("/api/courses/<id>", methods=["DELETE"])
def delete_course(id):
    courses.delete_one({"_id": oid(id)})
    return jsonify({"ok": True})

# ── STUDENTS ───────────────────────────────────────────────────────────────
@app.route("/api/students", methods=["GET"])
def get_students():
    result = []
    for s in students.find():
        s = fmt(s)
        enrolled = []
        for cid in s.get("course_ids", []):
            c = courses.find_one({"_id": oid(cid)})
            if c:
                enrolled.append({"_id": str(c["_id"]), "title": c["title"]})
        s["courses"] = enrolled
        result.append(s)
    return jsonify(result)

@app.route("/api/students", methods=["POST"])
def add_student():
    data = request.json
    r = students.insert_one({"name": data["name"], "email": data["email"], "course_ids": []})
    return jsonify({"_id": str(r.inserted_id)})

@app.route("/api/students/<id>", methods=["PUT"])
def update_student(id):
    data = request.json
    students.update_one({"_id": oid(id)}, {"$set": {"name": data["name"], "email": data["email"]}})
    return jsonify({"ok": True})

@app.route("/api/students/<id>", methods=["DELETE"])
def delete_student(id):
    students.delete_one({"_id": oid(id)})
    return jsonify({"ok": True})

@app.route("/api/students/<sid>/enroll/<cid>", methods=["POST"])
def enroll(sid, cid):
    students.update_one({"_id": oid(sid)}, {"$addToSet": {"course_ids": cid}})
    courses.update_one({"_id": oid(cid)}, {"$addToSet": {"student_ids": sid}})
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
    #checking jenkinsss