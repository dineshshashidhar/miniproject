
// STUDENT MANAGEMENT DATA

let data = {
    students: JSON.parse(localStorage.getItem("students")) || [],
    attendance: JSON.parse(localStorage.getItem("attendance")) || [],
    marks: JSON.parse(localStorage.getItem("marks")) || [],
    fees: JSON.parse(localStorage.getItem("fees")) || []
};

let currentType = "";
let editIndex = -1;

// SAVE DATA

function saveData() {
    Object.keys(data).forEach(key => {
        localStorage.setItem(key, JSON.stringify(data[key]));
    });
}

// NAVIGATION

function showPage(page, element) {

    document.querySelectorAll(".page").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(page).classList.remove("hidden");

    document.querySelectorAll(".sidebar nav a").forEach(link => {
        link.classList.remove("active");
    });

    element.classList.add("active");

    const titles = {
        dashboard: "Dashboard",
        students: "Student Records",
        attendance: "Attendance Management",
        marks: "Marks & Results",
        fees: "Fee Management"
    };

    document.getElementById("pageTitle").textContent = titles[page];

    renderAll();
}

// FORM FIELDS

const fields = {

    students: [
        ["name", "Student Name"],
        ["usn", "USN / Roll Number"],
        ["email", "Email Address", "email"],
        ["phone", "Phone Number", "tel"],
        ["course", "Course"],
        ["semester", "Semester"],
        ["department", "Department"]
    ],

    attendance: [
        ["usn", "Student USN"],
        ["date", "Attendance Date", "date"],
        ["status", "Attendance Status", "select",
            ["Present", "Absent", "Late"]]
    ],

    marks: [
        ["usn", "Student USN"],
        ["subject", "Subject Name"],
        ["exam", "Exam Name"],
        ["marks", "Marks Obtained", "number"],
        ["total", "Maximum Marks", "number"]
    ],

    fees: [
        ["usn", "Student USN"],
        ["total", "Total Fees", "number"],
        ["paid", "Amount Paid", "number"],
        ["date", "Payment Date", "date"]
    ]
};

// OPEN FORM

function openForm(type, index = -1) {

    currentType = type;
    editIndex = index;

    document.getElementById("formTitle").textContent =
        index === -1 ? "Add New Details" : "Edit Details";

    const formFields = document.getElementById("formFields");

    formFields.innerHTML = "";

    fields[type].forEach(field => {

        const [name, label, inputType = "text", options] = field;

        let element;

        if (inputType === "select") {

            element = document.createElement("select");
            element.name = name;
            element.required = true;

            element.innerHTML =
                `<option value="">Select ${label}</option>` +
                options.map(option =>
                    `<option value="${option}">${option}</option>`
                ).join("");

        } else {

            element = document.createElement("input");
            element.type = inputType;
            element.name = name;
            element.placeholder = label;
            element.required = true;

        }

        if (index !== -1) {
            element.value = data[type][index][name] || "";
        }

        formFields.appendChild(element);

    });

    document.getElementById("modal").style.display = "flex";
}

// CLOSE FORM

function closeForm() {
    document.getElementById("modal").style.display = "none";
}

// SAVE RECORD

document.getElementById("dataForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const formData = new FormData(this);
    const record = {};

    formData.forEach((value, key) => {
        record[key] = value;
    });

    if (currentType === "marks") {
        if (+record.marks > +record.total || +record.total <= 0) {
            alert("Enter valid marks.");
            return;
        }
    }

    if (currentType === "fees") {
        if (+record.paid > +record.total || +record.total <= 0) {
            alert("Enter valid fee amounts.");
            return;
        }
    }

    if (editIndex === -1) {
        data[currentType].push(record);
    } else {
        data[currentType][editIndex] = record;
    }

    saveData();
    this.reset();
    closeForm();
    renderAll();

});

// DELETE RECORD

function deleteRecord(type, index) {

    if (confirm("Are you sure you want to delete this record?")) {

        data[type].splice(index, 1);

        saveData();
        renderAll();

    }
}

// EDIT RECORD

function editRecord(type, index) {
    openForm(type, index);
}

// CREATE CARD

function createCard(type, record, index) {

    const card = document.createElement("div");
    card.className = "data-card";

    const heading = document.createElement("h3");

    heading.textContent =
        record.name || record.usn || "Student Record";

    card.appendChild(heading);

    Object.entries(record).forEach(([key, value]) => {

        const p = document.createElement("p");

        p.textContent =
            key.charAt(0).toUpperCase() +
            key.slice(1) + ": " + value;

        card.appendChild(p);

    });

    if (type === "fees") {

        const remaining = +record.total - +record.paid;

        const p = document.createElement("p");
        p.textContent = "Remaining Fees: ₹" + remaining;

        card.appendChild(p);

    }

    if (type === "marks") {

        const percentage =
            (+record.marks / +record.total) * 100;

        const p = document.createElement("p");
        p.textContent = "Percentage: " + percentage.toFixed(2) + "%";

        card.appendChild(p);

    }

    const actions = document.createElement("div");
    actions.className = "actions";

    const edit = document.createElement("button");
    edit.className = "edit-btn";
    edit.textContent = "Edit";
    edit.onclick = () => editRecord(type, index);

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.textContent = "Delete";
    remove.onclick = () => deleteRecord(type, index);

    actions.appendChild(edit);
    actions.appendChild(remove);

    card.appendChild(actions);

    return card;
}

// DISPLAY RECORDS

function displayList(type, containerId, searchId) {

    const container = document.getElementById(containerId);

    container.innerHTML = "";

    const search = document.getElementById(searchId)?.value.toLowerCase() || "";

    let records = data[type]
        .map((record, index) => ({record, index}))
        .filter(item =>
            Object.values(item.record).some(value =>
                String(value).toLowerCase().includes(search)
            )
        );

    if (type === "attendance") {

        const date = document.getElementById("attendanceDate").value;

        if (date) {
            records = records.filter(item => item.record.date === date);
        }

    }

    if (records.length === 0) {
        container.innerHTML = '<p class="empty">No records found.</p>';
        return;
    }

    records.forEach(item => {
        container.appendChild(
            createCard(type, item.record, item.index)
        );
    });

}

// UPDATE DASHBOARD

function updateDashboard() {

    const today = new Date().toLocaleDateString("en-CA");

    document.getElementById("studentCount").textContent =
        data.students.length;

    document.getElementById("presentCount").textContent =
        data.attendance.filter(item =>
            item.date === today && item.status === "Present"
        ).length;

    let totalMarks = 0;
    let totalMaximum = 0;

    data.marks.forEach(item => {
        totalMarks += Number(item.marks);
        totalMaximum += Number(item.total);
    });

    let average = totalMaximum > 0
        ? (totalMarks / totalMaximum) * 100
        : 0;

    document.getElementById("averageMarks").textContent =
        average.toFixed(1) + "%";

    let pending = data.fees.reduce((sum, item) => {
        return sum + Math.max(0, Number(item.total) - Number(item.paid));
    }, 0);

    document.getElementById("pendingFees").textContent =
        "₹" + pending.toLocaleString("en-IN");

    // RECENT STUDENTS

    const recent = document.getElementById("recentStudents");

    recent.innerHTML = "";

    if (data.students.length === 0) {
        recent.innerHTML =
            '<p class="empty">No students registered yet.</p>';
        return;
    }

    data.students.slice(-5).reverse().forEach((student, index) => {

        const p = document.createElement("p");

        p.textContent =
            student.name + " | " + student.usn +
            " | " + student.course;

        p.style.padding = "12px";
        p.style.borderBottom = "1px solid #eee";

        recent.appendChild(p);

    });

}

// RENDER ALL

function renderAll() {

    displayList("students", "studentList", "studentSearch");

    displayList("attendance", "attendanceList", null);

    displayList("marks", "marksList", "marksSearch");

    displayList("fees", "feesList", "feesSearch");

    updateDashboard();

}

// INITIALIZE

renderAll();
