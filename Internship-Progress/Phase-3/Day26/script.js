// ==========================================
// FinGuard Registration System
// ==========================================

// ===============================
// GET HTML ELEMENTS
// ===============================

const form = document.getElementById("registerForm");

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

const modal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");

if (!form) {
    console.log("Registration form not found on this page.");
}


// ===============================
// SHOW / HIDE PASSWORD
// ===============================

togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");

    }

    else {

        passwordInput.type = "password";

        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");

    }

});


// ===============================
// PASSWORD STRENGTH CHECKER
// ===============================

passwordInput.addEventListener("keyup", function () {

    let password = passwordInput.value;

    if (password.length === 0) {

        strength.innerHTML = "";

    }

    else if (password.length < 6) {

        strength.innerHTML = "Weak Password";
        strength.style.color = "red";

    }

    else if (password.length < 10) {

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

const phoneRegex = /^[0-9]{10}$/;

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

    } else {

        clearError(emailInput);

    }

    // ===============================
    // PHONE
    // ===============================

    if (!phoneRegex.test(phoneInput.value.trim())) {

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

});


// ===============================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ===============================

window.addEventListener("click", function (e) {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});