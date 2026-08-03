// ==========================================
// FinGuard Registration System
// ==========================================

// ===============================
// SHARED STORAGE HELPERS
// ===============================
// NOTE ON SECURITY: This project has no backend yet, so accounts
// are stored in the browser's localStorage purely so the sign-up /
// sign-in flow has something real to check against while you build
// this out. Passwords here are NOT hashed and NOT secure — anyone
// with access to this browser's devtools can read them in plain
// text. Do not reuse a real password when testing this demo, and
// replace this with a real backend (server-side storage + hashed
// passwords, e.g. bcrypt) before this ever goes live.

const USERS_KEY = "finguard_users";
const SESSION_KEY = "finguard_current_user";

function getUsers() {

    try {

        const raw = localStorage.getItem(USERS_KEY);
        return raw ? JSON.parse(raw) : [];

    } catch (err) {

        console.error("Could not read stored users:", err);
        return [];

    }

}

function saveUsers(users) {

    try {

        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return true;

    } catch (err) {

        console.error("Could not save users:", err);
        return false;

    }

}

function findUserByEmail(email) {

    const normalized = email.trim().toLowerCase();
    return getUsers().find(function (u) {
        return u.email.toLowerCase() === normalized;
    });

}

function setCurrentUser(email) {

    localStorage.setItem(SESSION_KEY, email.trim().toLowerCase());

}

function getCurrentUser() {

    const email = localStorage.getItem(SESSION_KEY);

    if (!email) return null;

    return findUserByEmail(email) || null;

}

function logOutCurrentUser() {

    localStorage.removeItem(SESSION_KEY);

}


// ===============================
// AUTH GUARD (protected pages)
// ===============================
// Call this at the top of any page that requires a signed-in user.
// Redirects to login.html if nobody is signed in. Returns the
// current user object (or null, right before the redirect fires).

function requireAuth() {

    const user = getCurrentUser();

    if (!user) {

        window.location.href = "login.html";
        return null;

    }

    return user;

}


// ===============================
// THEME TOGGLE (every page)
// ===============================

const THEME_KEY = "finguard_theme";

function applyTheme(theme) {

    document.documentElement.setAttribute("data-theme", theme);

    try {

        localStorage.setItem(THEME_KEY, theme);

    } catch (err) {

        console.error("Could not save theme preference:", err);

    }

}

function getSavedTheme() {

    try {

        return localStorage.getItem(THEME_KEY) || "dark";

    } catch (err) {

        return "dark";

    }

}

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

    function syncThemeToggleUI(theme) {

        const icon = themeToggle.querySelector("i");

        if (theme === "light") {

            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
            themeToggle.setAttribute("aria-label", "Switch to dark mode");
            themeToggle.setAttribute("aria-pressed", "true");

        } else {

            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
            themeToggle.setAttribute("aria-label", "Switch to light mode");
            themeToggle.setAttribute("aria-pressed", "false");

        }

    }

    // Sync the button's icon/labels with whatever theme the
    // early head-script already applied, so there's no mismatch.
    syncThemeToggleUI(getSavedTheme());

    themeToggle.addEventListener("click", function () {

        const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
        const next = current === "light" ? "dark" : "light";

        applyTheme(next);
        syncThemeToggleUI(next);

    });

}


// ===============================
// APPLICATION / TRANSACTION HISTORY
// ===============================
// Each entry: { id, email, type: 'loan' | 'fraud', timestamp,
//               summary, score, level: 'low' | 'medium' | 'high' }

const HISTORY_KEY = "finguard_history";

function getAllHistory() {

    try {

        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];

    } catch (err) {

        console.error("Could not read history:", err);
        return [];

    }

}

function saveAllHistory(entries) {

    try {

        localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
        return true;

    } catch (err) {

        console.error("Could not save history:", err);
        return false;

    }

}

function addHistoryEntry(email, type, summary, score, level) {

    const entries = getAllHistory();

    entries.push({

        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        email: email.trim().toLowerCase(),
        type: type,
        timestamp: new Date().toISOString(),
        summary: summary,
        score: score,
        level: level

    });

    saveAllHistory(entries);

}

function getHistoryForUser(email) {

    const normalized = email.trim().toLowerCase();

    return getAllHistory()
        .filter(function (entry) { return entry.email === normalized; })
        .sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });

}

function clearHistoryForUser(email) {

    const normalized = email.trim().toLowerCase();
    const remaining = getAllHistory().filter(function (entry) { return entry.email !== normalized; });

    saveAllHistory(remaining);

}

function levelBadgeHTML(level) {

    const labels = { low: "Low Risk", medium: "Medium Risk", high: "High Risk" };
    const label = labels[level] || level;

    return '<span class="badge badge-' + level + '">' + label + '</span>';

}

function formatHistoryDate(isoString) {

    const d = new Date(isoString);

    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) +
        " · " +
        d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

}


// ===============================
// LOG OUT LINK (any page)
// ===============================

const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {

    logoutLink.addEventListener("click", function (e) {

        e.preventDefault();
        logOutCurrentUser();
        window.location.href = "login.html";

    });

}


// ===============================
// GET HTML ELEMENTS
// ===============================

const form = document.getElementById("registerForm");

// Everything below only applies to the registration page.
// Guard the whole block so this script can safely be included
// on pages (like index.html) that don't have the form.
if (form) {

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const terms = document.getElementById("terms");

const strength = document.getElementById("strength");

const togglePassword = document.getElementById("togglePassword");
const togglePasswordIcon = togglePassword.querySelector("i");

const modal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");


// ===============================
// SHOW / HIDE PASSWORD
// ===============================

togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePasswordIcon.classList.remove("fa-eye");
        togglePasswordIcon.classList.add("fa-eye-slash");

        togglePassword.setAttribute("aria-label", "Hide password");
        togglePassword.setAttribute("aria-pressed", "true");

    }

    else {

        passwordInput.type = "password";

        togglePasswordIcon.classList.remove("fa-eye-slash");
        togglePasswordIcon.classList.add("fa-eye");

        togglePassword.setAttribute("aria-label", "Show password");
        togglePassword.setAttribute("aria-pressed", "false");

    }

});


// ===============================
// PASSWORD STRENGTH CHECKER
// ===============================
// Kept in sync with passwordRegex below: a password only counts
// as "Strong"/"Medium" if it actually satisfies the validation
// rule (letters + numbers, 6+ chars), not just on length alone.

passwordInput.addEventListener("keyup", function () {

    let password = passwordInput.value;

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const meetsMinimum = hasLetter && hasNumber && password.length >= 6;

    if (password.length === 0) {

        strength.innerHTML = "";

    }

    else if (!meetsMinimum) {

        strength.innerHTML = "Weak Password (needs 6+ chars with letters & numbers)";
        strength.style.color = "red";

    }

    else if (password.length < 10 || !hasSpecial) {

        strength.innerHTML = "Medium Password";
        strength.style.color = "orange";

    }

    else {

        strength.innerHTML = "Strong Password";
        strength.style.color = "limegreen";

    }

});


// ===============================
// REGULAR EXPRESSIONS
// ===============================

const nameRegex = /^[A-Za-z ]{3,}$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Matches a 10-digit number, optionally preceded by a country code.
// Spaces/dashes are stripped from the input before this is tested.
const phoneRegex = /^(\+\d{1,3})?\d{10}$/;

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;


// ===============================
// ERROR FUNCTIONS
// ===============================

function getErrorElement(input) {

    return input.closest(".input-box")?.querySelector(".error");

}

function showError(input, message) {

    const error = getErrorElement(input);

    if (error) {

        error.innerHTML = message;

    }

}

function clearError(input) {

    const error = getErrorElement(input);

    if (error) {

        error.innerHTML = "";

    }

}


// ===============================
// CLEAR ERROR WHILE TYPING
// ===============================

const allInputs = document.querySelectorAll("input, select");

allInputs.forEach(function (field) {

    field.addEventListener("input", function () {

        clearError(field);

    });

});
// ===============================
// FORM SUBMIT
// ===============================

form.addEventListener("submit", function (e) {

    e.preventDefault();

    let valid = true;

    // ===============================
    // NAME
    // ===============================

    if (!nameRegex.test(nameInput.value.trim())) {

        showError(nameInput, "Enter a valid full name");
        valid = false;

    } else {

        clearError(nameInput);

    }

    // ===============================
    // EMAIL
    // ===============================

    if (!emailRegex.test(emailInput.value.trim())) {

        showError(emailInput, "Enter a valid email address");
        valid = false;

    } else if (findUserByEmail(emailInput.value.trim())) {

        showError(emailInput, "An account with this email already exists. Try signing in instead.");
        valid = false;

    } else {

        clearError(emailInput);

    }

    // ===============================
    // PHONE
    // ===============================

    const cleanedPhone = phoneInput.value.trim().replace(/[\s-]/g, "");

    if (!phoneRegex.test(cleanedPhone)) {

        showError(phoneInput, "Enter a valid 10-digit phone number");
        valid = false;

    } else {

        clearError(phoneInput);

    }

    // ===============================
    // AGE
    // ===============================

    if (ageInput.value === "" || Number(ageInput.value) < 18) {

        showError(ageInput, "Age must be 18 or above");
        valid = false;

    } else {

        clearError(ageInput);

    }

    // ===============================
    // GENDER
    // ===============================

    if (genderInput.value === "") {

        showError(genderInput, "Please select your gender");
        valid = false;

    } else {

        clearError(genderInput);

    }

    // ===============================
    // PASSWORD
    // ===============================

    if (!passwordRegex.test(passwordInput.value)) {

        showError(
            passwordInput,
            "Password must be at least 6 characters and include letters and numbers"
        );

        valid = false;

    } else {

        clearError(passwordInput);

    }

    // ===============================
    // CONFIRM PASSWORD
    // ===============================

    if (confirmPasswordInput.value !== passwordInput.value) {

        showError(confirmPasswordInput, "Passwords do not match");
        valid = false;

    } else {

        clearError(confirmPasswordInput);

    }

    // ===============================
    // TERMS
    // ===============================

    if (!terms.checked) {

        alert("Please accept the Terms & Conditions.");

        valid = false;

    }

    // ===============================
    // SUCCESS
    // ===============================

    if (valid) {

        const newUser = {

            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: cleanedPhone,
            age: ageInput.value,
            gender: genderInput.value,
            // Plain text — see the SHARED STORAGE HELPERS note above.
            password: passwordInput.value,
            createdAt: new Date().toISOString()

        };

        const users = getUsers();
        users.push(newUser);

        const saved = saveUsers(users);

        if (saved) {

            setCurrentUser(newUser.email);

        }

        modal.style.display = "flex";

        form.reset();

        strength.innerHTML = "";

    }

});


// ===============================
// CLOSE MODAL
// ===============================

closeModal.addEventListener("click", function () {

    modal.style.display = "none";

    if (getCurrentUser()) {

        window.location.href = "dashboard.html";

    }

});


// ===============================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ===============================

window.addEventListener("click", function (e) {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});

} // end if (form)


// ===============================
// LOGIN PAGE
// ===============================

// Same pattern used for registration email validation, declared
// separately here so login.html works standalone without needing
// the registration-page block above (which only runs on register.html).
const emailRegexLogin = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const loginEmailInput = document.getElementById("loginEmail");
    const loginPasswordInput = document.getElementById("loginPassword");
    const loginFormError = document.getElementById("loginFormError");

    const toggleLoginPassword = document.getElementById("toggleLoginPassword");
    const toggleLoginPasswordIcon = toggleLoginPassword.querySelector("i");

    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const forgotPasswordModal = document.getElementById("forgotPasswordModal");
    const closeForgotModal = document.getElementById("closeForgotModal");

    // If someone is already signed in, send them straight to the dashboard.
    if (getCurrentUser()) {

        window.location.href = "dashboard.html";

    }

    // -------- Show / hide password --------

    toggleLoginPassword.addEventListener("click", function () {

        if (loginPasswordInput.type === "password") {

            loginPasswordInput.type = "text";

            toggleLoginPasswordIcon.classList.remove("fa-eye");
            toggleLoginPasswordIcon.classList.add("fa-eye-slash");

            toggleLoginPassword.setAttribute("aria-label", "Hide password");
            toggleLoginPassword.setAttribute("aria-pressed", "true");

        } else {

            loginPasswordInput.type = "password";

            toggleLoginPasswordIcon.classList.remove("fa-eye-slash");
            toggleLoginPasswordIcon.classList.add("fa-eye");

            toggleLoginPassword.setAttribute("aria-label", "Show password");
            toggleLoginPassword.setAttribute("aria-pressed", "false");

        }

    });

    // -------- Clear errors while typing --------

    [loginEmailInput, loginPasswordInput].forEach(function (field) {

        field.addEventListener("input", function () {

            clearError(field);
            loginFormError.innerHTML = "";

        });

    });

    // -------- Forgot password modal --------

    forgotPasswordLink.addEventListener("click", function (e) {

        e.preventDefault();
        forgotPasswordModal.style.display = "flex";

    });

    closeForgotModal.addEventListener("click", function () {

        forgotPasswordModal.style.display = "none";

    });

    window.addEventListener("click", function (e) {

        if (e.target === forgotPasswordModal) {

            forgotPasswordModal.style.display = "none";

        }

    });

    // -------- Submit --------

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        loginFormError.innerHTML = "";

        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value;

        let valid = true;

        if (!emailRegexLogin.test(email)) {

            showError(loginEmailInput, "Enter a valid email address");
            valid = false;

        } else {

            clearError(loginEmailInput);

        }

        if (password === "") {

            showError(loginPasswordInput, "Enter your password");
            valid = false;

        } else {

            clearError(loginPasswordInput);

        }

        if (!valid) return;

        const user = findUserByEmail(email);

        if (!user || user.password !== password) {

            loginFormError.innerHTML = "Incorrect email or password. Please try again, or register if you don't have an account yet.";
            return;

        }

        setCurrentUser(user.email);

        window.location.href = "dashboard.html";

    });

}


// ===============================
// DASHBOARD PAGE
// ===============================

const dashboardUserName = document.getElementById("dashboardUserName");

if (dashboardUserName) {

    const dashboardEmail = document.getElementById("dashboardEmail");
    const dashboardMemberSince = document.getElementById("dashboardMemberSince");

    const currentUser = requireAuth();

    if (currentUser) {

        dashboardUserName.textContent = currentUser.name;

        if (dashboardEmail) {

            dashboardEmail.innerHTML = "<strong>Email:</strong> " + currentUser.email;

        }

        if (dashboardMemberSince && currentUser.createdAt) {

            const joined = new Date(currentUser.createdAt);

            dashboardMemberSince.innerHTML = "<strong>Member since:</strong> " +
                joined.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

        }

        const history = getHistoryForUser(currentUser.email);

        // -------- Recent activity table (latest 5) --------

        const recentActivityBody = document.getElementById("recentActivityBody");
        const recentActivityEmpty = document.getElementById("recentActivityEmpty");
        const recentActivityTableWrap = document.getElementById("recentActivityTableWrap");

        if (history.length === 0) {

            if (recentActivityTableWrap) recentActivityTableWrap.style.display = "none";
            if (recentActivityEmpty) recentActivityEmpty.style.display = "block";

        } else if (recentActivityBody) {

            recentActivityBody.innerHTML = history.slice(0, 5).map(function (entry) {

                const typeLabel = entry.type === "loan" ? "Loan Check" : "Fraud Check";

                return "<tr>" +
                    "<td>" + typeLabel + "</td>" +
                    "<td>" + entry.summary + "</td>" +
                    "<td>" + entry.score + "/100</td>" +
                    "<td>" + levelBadgeHTML(entry.level) + "</td>" +
                    "<td>" + formatHistoryDate(entry.timestamp) + "</td>" +
                    "</tr>";

            }).join("");

        }

        // -------- Risk score trend chart --------

        const chartCanvas = document.getElementById("riskTrendChart");
        const chartEmptyState = document.getElementById("chartEmptyState");

        if (chartCanvas) {

            if (history.length === 0) {

                chartCanvas.style.display = "none";
                if (chartEmptyState) chartEmptyState.style.display = "block";

            } else if (typeof Chart !== "undefined") {

                // Oldest to newest, left to right.
                const chronological = history.slice().reverse();

                const labels = chronological.map(function (entry) {
                    return new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
                });

                const loanScores = chronological.map(function (entry) {
                    return entry.type === "loan" ? entry.score : null;
                });

                const fraudScores = chronological.map(function (entry) {
                    return entry.type === "fraud" ? entry.score : null;
                });

                const rootStyles = getComputedStyle(document.documentElement);
                const accentColor = rootStyles.getPropertyValue("--accent").trim() || "#00d4ff";
                const textColor = rootStyles.getPropertyValue("--text-secondary").trim() || "#d7e6ff";
                const gridColor = rootStyles.getPropertyValue("--chart-grid").trim() || "rgba(255,255,255,.12)";

                new Chart(chartCanvas, {

                    type: "line",

                    data: {

                        labels: labels,

                        datasets: [
                            {
                                label: "Loan Check Score",
                                data: loanScores,
                                borderColor: accentColor,
                                backgroundColor: accentColor,
                                spanGaps: true,
                                tension: 0.35
                            },
                            {
                                label: "Fraud Check Score",
                                data: fraudScores,
                                borderColor: "#ff7a7a",
                                backgroundColor: "#ff7a7a",
                                spanGaps: true,
                                tension: 0.35
                            }
                        ]

                    },

                    options: {

                        responsive: true,
                        maintainAspectRatio: false,

                        scales: {

                            y: {
                                min: 0,
                                max: 100,
                                ticks: { color: textColor },
                                grid: { color: gridColor }
                            },

                            x: {
                                ticks: { color: textColor },
                                grid: { color: gridColor }
                            }

                        },

                        plugins: {

                            legend: {
                                labels: { color: textColor }
                            }

                        }

                    }

                });

            }

        }

    }

}

// ===============================
// LOAN RISK CALCULATOR PAGE
// ===============================

const loanForm = document.getElementById("loanForm");

if (loanForm) {

    const loanUser = requireAuth();

    if (loanUser) {

        const incomeInput = document.getElementById("loanIncome");
        const loanAmountInput = document.getElementById("loanAmount");
        const tenureInput = document.getElementById("loanTenure");
        const existingEMIInput = document.getElementById("loanExistingEMI");
        const employmentInput = document.getElementById("loanEmployment");
        const creditScoreInput = document.getElementById("loanCreditScore");

        const placeholder = document.getElementById("loanResultPlaceholder");
        const resultContent = document.getElementById("loanResultContent");
        const scoreNumber = document.getElementById("loanScoreNumber");
        const riskBadge = document.getElementById("loanRiskBadge");
        const resultEMI = document.getElementById("loanResultEMI");
        const resultDTI = document.getElementById("loanResultDTI");
        const resultLTI = document.getElementById("loanResultLTI");
        const resultRecommendation = document.getElementById("loanResultRecommendation");

        function calculateEMI(principal, annualRatePercent, months) {

            const monthlyRate = annualRatePercent / 12 / 100;

            if (monthlyRate === 0) return principal / months;

            const factor = Math.pow(1 + monthlyRate, months);

            return (principal * monthlyRate * factor) / (factor - 1);

        }

        function calculateLoanRisk(data) {

            const ASSUMED_ANNUAL_RATE = 10.5; // fixed demo interest rate

            const emi = calculateEMI(data.loanAmount, ASSUMED_ANNUAL_RATE, data.tenure);
            const totalMonthlyObligation = emi + data.existingEMI;
            const dti = totalMonthlyObligation / data.income;
            const lti = data.loanAmount / (data.income * 12);

            let score = 0;

            // Debt-to-income ratio (lower is better) — up to 35 pts
            if (dti <= 0.35) score += 35;
            else if (dti <= 0.5) score += 20;
            else if (dti <= 0.65) score += 8;

            // Credit score — up to 30 pts
            if (data.creditScore >= 750) score += 30;
            else if (data.creditScore >= 700) score += 22;
            else if (data.creditScore >= 650) score += 14;
            else if (data.creditScore >= 600) score += 6;

            // Employment type — up to 20 pts
            if (data.employment === "salaried") score += 20;
            else if (data.employment === "self-employed") score += 14;
            else if (data.employment === "business") score += 12;
            else score += 2;

            // Loan-to-annual-income ratio (lower is better) — up to 15 pts
            if (lti <= 2) score += 15;
            else if (lti <= 4) score += 9;
            else if (lti <= 6) score += 4;

            score = Math.min(100, Math.round(score));

            let level, recommendation;

            if (score >= 75) {

                level = "low";
                recommendation = "Based on this model, the applicant profile looks strong — low debt burden relative to income and a healthy credit score. Likely to be approved, subject to full underwriting.";

            } else if (score >= 50) {

                level = "medium";
                recommendation = "This profile falls in a moderate risk band. A lender would likely request more documentation or offer a smaller loan amount / longer tenure to reduce monthly obligations.";

            } else {

                level = "high";
                recommendation = "This profile carries higher risk under this model — either the requested amount is large relative to income, or the credit profile is weak. Consider a smaller loan amount, a co-applicant, or improving credit score first.";

            }

            return { score, level, emi, dti, lti, recommendation };

        }

        loanForm.addEventListener("submit", function (e) {

            e.preventDefault();

            let valid = true;

            const income = Number(incomeInput.value);
            const loanAmount = Number(loanAmountInput.value);
            const tenure = Number(tenureInput.value);
            const existingEMI = Number(existingEMIInput.value);
            const employment = employmentInput.value;
            const creditScore = Number(creditScoreInput.value);

            if (!income || income <= 0) {
                showError(incomeInput, "Enter a valid monthly income");
                valid = false;
            } else {
                clearError(incomeInput);
            }

            if (!loanAmount || loanAmount <= 0) {
                showError(loanAmountInput, "Enter a valid loan amount");
                valid = false;
            } else {
                clearError(loanAmountInput);
            }

            if (!tenure || tenure < 1 || tenure > 360) {
                showError(tenureInput, "Enter a tenure between 1 and 360 months");
                valid = false;
            } else {
                clearError(tenureInput);
            }

            if (existingEMIInput.value === "" || existingEMI < 0) {
                showError(existingEMIInput, "Enter 0 if you have no existing EMI");
                valid = false;
            } else {
                clearError(existingEMIInput);
            }

            if (!employment) {
                showError(employmentInput, "Select an employment type");
                valid = false;
            } else {
                clearError(employmentInput);
            }

            if (!creditScore || creditScore < 300 || creditScore > 900) {
                showError(creditScoreInput, "Enter a credit score between 300 and 900");
                valid = false;
            } else {
                clearError(creditScoreInput);
            }

            if (!valid) return;

            const result = calculateLoanRisk({
                income, loanAmount, tenure, existingEMI, employment, creditScore
            });

            placeholder.style.display = "none";
            resultContent.style.display = "block";

            scoreNumber.textContent = result.score;
            riskBadge.innerHTML = levelBadgeHTML(result.level);

            resultEMI.textContent = "₹" + result.emi.toLocaleString(undefined, { maximumFractionDigits: 0 });
            resultDTI.textContent = (result.dti * 100).toFixed(1) + "%";
            resultLTI.textContent = result.lti.toFixed(2) + "x";
            resultRecommendation.textContent = result.recommendation;

            const summary = "₹" + loanAmount.toLocaleString() + " over " + tenure + " months";

            addHistoryEntry(loanUser.email, "loan", summary, result.score, result.level);

        });

    }

}


// ===============================
// FRAUD RISK SIMULATOR PAGE
// ===============================

const fraudForm = document.getElementById("fraudForm");

if (fraudForm) {

    const fraudUser = requireAuth();

    if (fraudUser) {

        const amountInput = document.getElementById("fraudAmount");
        const typeInput = document.getElementById("fraudType");
        const locationInput = document.getElementById("fraudLocation");
        const deviceInput = document.getElementById("fraudDevice");
        const hourInput = document.getElementById("fraudHour");
        const velocityInput = document.getElementById("fraudVelocity");
        const accountAgeInput = document.getElementById("fraudAccountAge");

        const placeholder = document.getElementById("fraudResultPlaceholder");
        const resultContent = document.getElementById("fraudResultContent");
        const scoreNumber = document.getElementById("fraudScoreNumber");
        const riskBadge = document.getElementById("fraudRiskBadge");
        const resultBreakdown = document.getElementById("fraudResultBreakdown");
        const resultRecommendation = document.getElementById("fraudResultRecommendation");

        function calculateFraudRisk(data) {

            let score = 0;
            const reasons = [];

            if (data.amount > 100000) {
                score += 25;
                reasons.push(["Transaction amount", "High (+25)"]);
            } else if (data.amount > 25000) {
                score += 12;
                reasons.push(["Transaction amount", "Elevated (+12)"]);
            } else {
                reasons.push(["Transaction amount", "Normal (+0)"]);
            }

            if (data.location === "international") {
                score += 20;
                reasons.push(["Location", "International (+20)"]);
            } else {
                reasons.push(["Location", "Domestic (+0)"]);
            }

            if (data.device === "new") {
                score += 25;
                reasons.push(["Device", "Unrecognized (+25)"]);
            } else {
                reasons.push(["Device", "Recognized (+0)"]);
            }

            if (data.hour < 5 || data.hour >= 23) {
                score += 15;
                reasons.push(["Time of day", "Unusual hour (+15)"]);
            } else {
                reasons.push(["Time of day", "Normal hours (+0)"]);
            }

            if (data.velocity > 5) {
                score += 20;
                reasons.push(["Transaction velocity", "High (+20)"]);
            } else if (data.velocity >= 3) {
                score += 10;
                reasons.push(["Transaction velocity", "Elevated (+10)"]);
            } else {
                reasons.push(["Transaction velocity", "Normal (+0)"]);
            }

            if (data.accountAge < 3) {
                score += 10;
                reasons.push(["Account age", "New account (+10)"]);
            } else {
                reasons.push(["Account age", "Established (+0)"]);
            }

            score = Math.min(100, score);

            let level, recommendation;

            if (score < 30) {

                level = "low";
                recommendation = "This transaction looks consistent with normal account activity under this model. No action needed.";

            } else if (score < 60) {

                level = "medium";
                recommendation = "This transaction has some unusual characteristics. A real fraud system would typically flag it for manual review or step-up authentication.";

            } else {

                level = "high";
                recommendation = "Multiple high-risk signals detected. A real fraud system would likely block or hold this transaction pending identity verification.";

            }

            return { score, level, reasons, recommendation };

        }

        fraudForm.addEventListener("submit", function (e) {

            e.preventDefault();

            let valid = true;

            const amount = Number(amountInput.value);
            const type = typeInput.value;
            const location = locationInput.value;
            const device = deviceInput.value;
            const hour = Number(hourInput.value);
            const velocity = Number(velocityInput.value);
            const accountAge = Number(accountAgeInput.value);

            if (amountInput.value === "" || amount < 0) {
                showError(amountInput, "Enter a valid transaction amount");
                valid = false;
            } else {
                clearError(amountInput);
            }

            if (!type) {
                showError(typeInput, "Select a transaction type");
                valid = false;
            } else {
                clearError(typeInput);
            }

            if (!location) {
                showError(locationInput, "Select a location type");
                valid = false;
            } else {
                clearError(locationInput);
            }

            if (!device) {
                showError(deviceInput, "Select device status");
                valid = false;
            } else {
                clearError(deviceInput);
            }

            if (hourInput.value === "" || hour < 0 || hour > 23) {
                showError(hourInput, "Enter an hour between 0 and 23");
                valid = false;
            } else {
                clearError(hourInput);
            }

            if (!velocity || velocity < 1) {
                showError(velocityInput, "Enter at least 1 (this transaction counts too)");
                valid = false;
            } else {
                clearError(velocityInput);
            }

            if (accountAgeInput.value === "" || accountAge < 0) {
                showError(accountAgeInput, "Enter a valid account age in months");
                valid = false;
            } else {
                clearError(accountAgeInput);
            }

            if (!valid) return;

            const result = calculateFraudRisk({
                amount, type, location, device, hour, velocity, accountAge
            });

            placeholder.style.display = "none";
            resultContent.style.display = "block";

            scoreNumber.textContent = result.score;
            riskBadge.innerHTML = levelBadgeHTML(result.level);

            resultBreakdown.innerHTML = result.reasons.map(function (r) {
                return '<div class="result-row"><span>' + r[0] + '</span><span>' + r[1] + '</span></div>';
            }).join("");

            resultRecommendation.textContent = result.recommendation;

            const typeLabels = { online: "Online purchase", pos: "In-store purchase", atm: "ATM withdrawal", wire: "Wire transfer" };
            const summary = "₹" + amount.toLocaleString() + " " + (typeLabels[type] || type) + " (" + location + ")";

            addHistoryEntry(fraudUser.email, "fraud", summary, result.score, result.level);

        });

    }

}


// ===============================
// PROFILE PAGE
// ===============================

const profileForm = document.getElementById("profileForm");

if (profileForm) {

    const profileUser = requireAuth();

    if (profileUser) {

        const profileNameInput = document.getElementById("profileName");
        const profileEmailInput = document.getElementById("profileEmail");
        const profilePhoneInput = document.getElementById("profilePhone");
        const profileAgeInput = document.getElementById("profileAge");
        const profileGenderInput = document.getElementById("profileGender");
        const profileSavedMessage = document.getElementById("profileSavedMessage");

        // Pre-fill the form with the current account details.
        profileNameInput.value = profileUser.name;
        profileEmailInput.value = profileUser.email;
        profilePhoneInput.value = profileUser.phone;
        profileAgeInput.value = profileUser.age;
        profileGenderInput.value = profileUser.gender;

        const profileNameRegex = /^[A-Za-z ]{3,}$/;
        const profilePhoneRegex = /^(\+\d{1,3})?\d{10}$/;

        function updateStoredUser(email, updates) {

            const users = getUsers();
            const normalized = email.trim().toLowerCase();

            const index = users.findIndex(function (u) {
                return u.email.toLowerCase() === normalized;
            });

            if (index === -1) return false;

            users[index] = Object.assign({}, users[index], updates);
            return saveUsers(users);

        }

        profileForm.addEventListener("submit", function (e) {

            e.preventDefault();

            profileSavedMessage.style.display = "none";

            let valid = true;

            if (!profileNameRegex.test(profileNameInput.value.trim())) {
                showError(profileNameInput, "Enter a valid full name");
                valid = false;
            } else {
                clearError(profileNameInput);
            }

            const cleanedProfilePhone = profilePhoneInput.value.trim().replace(/[\s-]/g, "");

            if (!profilePhoneRegex.test(cleanedProfilePhone)) {
                showError(profilePhoneInput, "Enter a valid 10-digit phone number");
                valid = false;
            } else {
                clearError(profilePhoneInput);
            }

            if (profileAgeInput.value === "" || Number(profileAgeInput.value) < 18) {
                showError(profileAgeInput, "Age must be 18 or above");
                valid = false;
            } else {
                clearError(profileAgeInput);
            }

            if (profileGenderInput.value === "") {
                showError(profileGenderInput, "Please select your gender");
                valid = false;
            } else {
                clearError(profileGenderInput);
            }

            if (!valid) return;

            updateStoredUser(profileUser.email, {
                name: profileNameInput.value.trim(),
                phone: cleanedProfilePhone,
                age: profileAgeInput.value,
                gender: profileGenderInput.value
            });

            profileSavedMessage.style.display = "block";

        });

        // -------- Change password --------

        const passwordForm = document.getElementById("passwordForm");
        const currentPasswordInput = document.getElementById("currentPassword");
        const newPasswordInput = document.getElementById("newPassword");
        const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
        const passwordSavedMessage = document.getElementById("passwordSavedMessage");

        const newPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

        if (passwordForm) {

            passwordForm.addEventListener("submit", function (e) {

                e.preventDefault();

                passwordSavedMessage.style.display = "none";

                let valid = true;

                const freshUser = findUserByEmail(profileUser.email);

                if (!freshUser || currentPasswordInput.value !== freshUser.password) {
                    showError(currentPasswordInput, "Current password is incorrect");
                    valid = false;
                } else {
                    clearError(currentPasswordInput);
                }

                if (!newPasswordRegex.test(newPasswordInput.value)) {
                    showError(newPasswordInput, "New password must be 6+ characters with letters and numbers");
                    valid = false;
                } else {
                    clearError(newPasswordInput);
                }

                if (confirmNewPasswordInput.value !== newPasswordInput.value) {
                    showError(confirmNewPasswordInput, "Passwords do not match");
                    valid = false;
                } else {
                    clearError(confirmNewPasswordInput);
                }

                if (!valid) return;

                updateStoredUser(profileUser.email, { password: newPasswordInput.value });

                passwordForm.reset();
                passwordSavedMessage.style.display = "block";

            });

        }

        // -------- Delete account --------

        const deleteAccountBtn = document.getElementById("deleteAccountBtn");
        const deleteAccountModal = document.getElementById("deleteAccountModal");
        const confirmDeleteAccount = document.getElementById("confirmDeleteAccount");
        const cancelDeleteAccount = document.getElementById("cancelDeleteAccount");

        if (deleteAccountBtn) {

            deleteAccountBtn.addEventListener("click", function () {
                deleteAccountModal.style.display = "flex";
            });

            cancelDeleteAccount.addEventListener("click", function () {
                deleteAccountModal.style.display = "none";
            });

            window.addEventListener("click", function (e) {
                if (e.target === deleteAccountModal) {
                    deleteAccountModal.style.display = "none";
                }
            });

            confirmDeleteAccount.addEventListener("click", function () {

                const users = getUsers().filter(function (u) {
                    return u.email.toLowerCase() !== profileUser.email.toLowerCase();
                });

                saveUsers(users);
                clearHistoryForUser(profileUser.email);
                logOutCurrentUser();

                window.location.href = "index.html";

            });

        }

    }

}


// ===============================
// HISTORY PAGE
// ===============================

const historyTableBody = document.getElementById("historyTableBody");

if (historyTableBody) {

    const historyUser = requireAuth();

    if (historyUser) {

        const historyTableWrap = document.getElementById("historyTableWrap");
        const historyEmptyState = document.getElementById("historyEmptyState");
        const filterRadios = document.querySelectorAll('input[name="historyFilter"]');

        const clearHistoryBtn = document.getElementById("clearHistoryBtn");
        const clearHistoryModal = document.getElementById("clearHistoryModal");
        const confirmClearHistory = document.getElementById("confirmClearHistory");
        const cancelClearHistory = document.getElementById("cancelClearHistory");

        function renderHistory(filter) {

            const all = getHistoryForUser(historyUser.email);
            const filtered = filter === "all" ? all : all.filter(function (e) { return e.type === filter; });

            if (filtered.length === 0) {

                historyTableWrap.style.display = "none";
                historyEmptyState.style.display = "block";

            } else {

                historyTableWrap.style.display = "block";
                historyEmptyState.style.display = "none";

                historyTableBody.innerHTML = filtered.map(function (entry) {

                    const typeLabel = entry.type === "loan" ? "Loan Check" : "Fraud Check";

                    return "<tr>" +
                        "<td>" + typeLabel + "</td>" +
                        "<td>" + entry.summary + "</td>" +
                        "<td>" + entry.score + "/100</td>" +
                        "<td>" + levelBadgeHTML(entry.level) + "</td>" +
                        "<td>" + formatHistoryDate(entry.timestamp) + "</td>" +
                        "</tr>";

                }).join("");

            }

        }

        renderHistory("all");

        filterRadios.forEach(function (radio) {

            radio.addEventListener("change", function () {

                if (radio.checked) renderHistory(radio.value);

            });

        });

        if (clearHistoryBtn) {

            clearHistoryBtn.addEventListener("click", function () {
                clearHistoryModal.style.display = "flex";
            });

            cancelClearHistory.addEventListener("click", function () {
                clearHistoryModal.style.display = "none";
            });

            window.addEventListener("click", function (e) {
                if (e.target === clearHistoryModal) {
                    clearHistoryModal.style.display = "none";
                }
            });

            confirmClearHistory.addEventListener("click", function () {

                clearHistoryForUser(historyUser.email);
                clearHistoryModal.style.display = "none";

                const checkedFilter = document.querySelector('input[name="historyFilter"]:checked');
                renderHistory(checkedFilter ? checkedFilter.value : "all");

            });

        }

    }

}
