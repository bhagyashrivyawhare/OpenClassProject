import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, updatePassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, increment, deleteDoc, arrayUnion, arrayRemove, serverTimestamp, onSnapshot, orderBy, limit, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig, emailConfig } from "./config.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') console.log("Persistence failed: Multiple tabs open");
    else if (err.code == 'unimplemented') console.log("Persistence not supported");
});

// Add this after your app initialization logic
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('p');
    if (path) {
        // If the app was opened via 404 redirect, navigate to the correct page
        renderContent(path);
    }
});


export const provider = new GoogleAuthProvider();
emailjs.init(emailConfig.publicKey);

export { 
    doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, 
    increment, deleteDoc, arrayUnion, arrayRemove, serverTimestamp, onSnapshot, orderBy, limit,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, 
    signOut, signInWithPopup, updatePassword, sendPasswordResetEmail
};

// ... (Rest of your original getThumbnail and sendOTP functions remain the same)
export function getThumbnail(url) {
    try {
        let id = '';

        if(url.includes('v=')) id = url.split('v=')[1].split('&')[0];
        else if(url.includes('youtu.be/')) id = url.split('/').pop().split('?')[0];
        else if(url.includes('/shorts/')) id = url.split('/shorts/')[1].split('?')[0];
        else if(url.includes('/live/')) id = url.split('/live/')[1].split('?')[0];

        return id
            ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
            : 'https://res.cloudinary.com/dowhvdkjh/image/upload/v1777895769/IMG-20260504-WA0002_fucbjd.jpg';

    } catch(e) {
        return 'https://res.cloudinary.com/dowhvdkjh/image/upload/v1777895769/IMG-20260504-WA0002_fucbjd.jpg';
    }
}
export async function sendOTP(email, code) {
    return await emailjs.send(emailConfig.serviceID, emailConfig.templateID, { to_email: email, otp: code });
}

// =========================================
// ADMIN PANEL
// =========================================

const adminBtn =
    document.getElementById('admin-panel-btn');

const adminDashboard =
    document.getElementById('admin-dashboard');


// =========================================
// OPEN DASHBOARD
// =========================================



// =========================================
// CLOSE DASHBOARD
// =========================================

window.closeAdminDashboard = () => {

    adminDashboard.classList.add('hidden');

};


// =========================================
// SHOW SECTION
// =========================================

window.showSection = (sectionId) => {

    document.querySelectorAll('.admin-section')
        .forEach(section => {

            section.classList.add('hidden');

        });

    document.getElementById(sectionId)
        .classList.remove('hidden');

};



// =========================================
// ADD PLAN
// =========================================

window.addPlan = async () => {

    const id =
        document.getElementById('plan-id').value;

    const name =
        document.getElementById('plan-name').value;

    const price =
        Number(document.getElementById('plan-price').value);

    const duration =
        Number(document.getElementById('plan-duration').value);

    if (!id || !name) {

        alert("Fill all fields");

        return;

    }

    await setDoc(doc(db, "plans", id), {

        name,
        price,
        duration

    });

    alert("Plan Added");

    loadPlans();
     loadInstitutePlans();

};


// =========================================
// LOAD PLANS
// =========================================

async function loadPlans() {

    const container =
        document.getElementById("plans-list");

    container.innerHTML = "";

    const snap =
        await getDocs(collection(db, "plans"));

    snap.forEach((docSnap) => {

        const data = docSnap.data();

        container.innerHTML += `

        <div class="border p-4 rounded-xl mb-3">

            <h3 class="text-xl font-black">
                ${data.name}
            </h3>

            <p>
                ${data.years || 0} Years
                ${data.months || 0} Months
                ${data.days || 0} Days
            </p>

        </div>
        `;
    });
}
window.processPlanSave = async function () {

    const planName =
        document.getElementById("custom-plan-name").value;

    const years =
        parseInt(document.getElementById("custom-plan-years").value) || 0;

    const months =
        parseInt(document.getElementById("custom-plan-months").value) || 0;

    const days =
        parseInt(document.getElementById("custom-plan-days").value) || 0;

    await addDoc(collection(db, "plans"), {
        name: planName,
        years,
        months,
        days,
        createdAt: Date.now()
    });

    alert("Plan Saved");

    loadPlans();

    // IMPORTANT
    loadInstitutePlans();
};
async function loadInstitutePlans() {

    const planDropdown =
        document.getElementById("plan-type");

    // Default options thev
    planDropdown.innerHTML = `
        <option value="free_trial">Free Trial (15 Days)</option>
        <option value="one_year">One Year Plan</option>
    `;

    const snap =
        await getDocs(collection(db, "plans"));

    snap.forEach((docSnap) => {

        const plan = docSnap.data();

        planDropdown.innerHTML += `
            <option value="${docSnap.id}">
                ${plan.name}
            </option>
        `;
    });
}
document.addEventListener("DOMContentLoaded", () => {

    const planType = document.getElementById("plan-type");
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");

    if (!planType || !startDateInput || !endDateInput) {
        console.log("Missing HTML elements");
        return;
    }

    loadInstitutePlans();

    planType.addEventListener("change", async () => {

        const today = new Date();

        startDateInput.value = today.toISOString().split("T")[0];

        let end = new Date(today);

        if (planType.value === "free_trial") {
            end.setDate(end.getDate() + 15);
        }
        else if (planType.value === "one_year") {
            end.setFullYear(end.getFullYear() + 1);
        }
        else {
            const planRef = doc(db, "plans", planType.value);
            const planSnap = await getDoc(planRef);

            if (planSnap.exists()) {
                const plan = planSnap.data();

                end.setFullYear(end.getFullYear() + (plan.years || 0));
                end.setMonth(end.getMonth() + (plan.months || 0));
                end.setDate(end.getDate() + (plan.days || 0));
            }
        }

        endDateInput.value = end.toISOString().split("T")[0];
    });
});
// =========================================
// ADD INSTITUTE
// =========================================

window.addInstitute = async () => {

    const name = document.getElementById('institute-name').value;
    const logo = document.getElementById('institute-logo').value;
    const ownerId = document.getElementById('institute-owner').value;
    const currentPlan = document.getElementById('plan-type').value;

    const expiryDate = await calculateEndDate(currentPlan);

    await addDoc(collection(db, "institutes"), {
        name,
        logo,
        ownerId,
        currentPlan,
        subscriptionStatus: "active",
        createdAt: serverTimestamp(),
        expiryDate: expiryDate
    });

    alert("Institute Added");
    loadInstitutes();
};
async function calculateEndDate(planId, startDate = new Date()) {

    const start = new Date(startDate);

    // default plans
    if (planId === "free_trial") {
        start.setDate(start.getDate() + 15);
        return start;
    }

    if (planId === "one_year") {
        start.setFullYear(start.getFullYear() + 1);
        return start;
    }

    // custom plan from DB
    const planRef = doc(db, "plans", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) return start;

    const plan = planSnap.data();

    start.setFullYear(start.getFullYear() + (plan.years || 0));
    start.setMonth(start.getMonth() + (plan.months || 0));
    start.setDate(start.getDate() + (plan.days || 0));

    return start;
}

// =========================================
// LOAD INSTITUTES
// =========================================

async function loadInstitutes() {

    const container =
        document.getElementById('institutes-list');

    container.innerHTML = "";

    const snap =
        await getDocs(collection(db, "institutes"));

    snap.forEach((docSnap) => {

        const data = docSnap.data();

        container.innerHTML += `

        <div class="border p-4 rounded-xl mb-3">

            <h3 class="text-xl font-black">

                ${data.name}

            </h3>

            <p>

                Plan: ${data.currentPlan}

            </p>

            <p>

                Status: ${data.subscriptionStatus}

            </p>

        </div>
        `;
    });
}



// =========================================
// ADD PAYMENT
// =========================================

window.addPayment = async () => {

    const instituteId =
        document.getElementById('payment-institute').value;

    const amount =
        Number(document.getElementById('payment-amount').value);

    const paymentGateway =
        document.getElementById('payment-gateway').value;

    const transactionId =
        document.getElementById('payment-transaction').value;

    await addDoc(collection(db, "payments"), {

        instituteId,
        amount,
        paymentGateway,
        transactionId,

        status: "success"

    });

    alert("Payment Added");

    loadPayments();

};


// =========================================
// LOAD PAYMENTS
// =========================================

async function loadPayments() {

    const container =
        document.getElementById('payments-list');

    container.innerHTML = "";

    const snap =
        await getDocs(collection(db, "payments"));

    snap.forEach((docSnap) => {

        const data = docSnap.data();

        container.innerHTML += `

        <div class="border p-4 rounded-xl mb-3">

            <p>

                Amount: ₹${data.amount}

            </p>

            <p>

                Status: ${data.status}

            </p>

            <p>

                Gateway: ${data.paymentGateway}

            </p>

        </div>
        `;
    });
}



// =========================================
// ADD SUBSCRIPTION
// =========================================

window.addSubscription = async () => {

    const instituteId =
        document.getElementById('subscription-institute').value;

    const planId =
        document.getElementById('subscription-plan').value;

    const paymentId =
        document.getElementById('subscription-payment').value;

    let expiry = new Date();

    if (planId === "monthly") {

        expiry.setDate(expiry.getDate() + 30);

    }

    if (planId === "yearly") {

        expiry.setDate(expiry.getDate() + 365);

    }

    if (planId === "free_trial") {

        expiry.setDate(expiry.getDate() + 30);

    }

    await addDoc(collection(db, "subscriptions"), {

        instituteId,
        planId,
        paymentId,

        startDate: serverTimestamp(),

        expiryDate: expiry,

        status: "active"

    });

    alert("Subscription Added");

    loadSubscriptions();

};


// =========================================
// LOAD SUBSCRIPTIONS
// =========================================

async function loadSubscriptions() {

    const container =
        document.getElementById('subscriptions-list');

    container.innerHTML = "";

    const snap =
        await getDocs(collection(db, "subscriptions"));

    snap.forEach((docSnap) => {

        const data = docSnap.data();

        container.innerHTML += `

        <div class="border p-4 rounded-xl mb-3">

            <p>

                Institute: ${data.instituteId}

            </p>

            <p>

                Plan: ${data.planId}

            </p>

            <p>

                Status: ${data.status}

            </p>

        </div>
        `;
    });
}
