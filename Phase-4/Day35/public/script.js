const contactForm = document.getElementById("contactForm");
const responseMessage = document.getElementById("responseMessage");

contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    try {
        const response = await fetch("/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        });

        const data = await response.json();

        if (response.ok) {
            responseMessage.textContent = "Message sent successfully!";
            contactForm.reset();
        } else {
            responseMessage.textContent =
                data.error || "Something went wrong.";
        }

    } catch (error) {
        responseMessage.textContent =
            "Unable to connect to the server.";
        console.error(error);
    }
});