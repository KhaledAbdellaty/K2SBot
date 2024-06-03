document.addEventListener("DOMContentLoaded", function() {
    // Select the form and input elements, and error message containers
    const form = document.querySelector('.form-container');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');

    // Adding some mock users to local storage for testing
    const mockUsers = [
        { email: 'sahar@gmail.com', password: '123123123' },
        { email: 'saharrr@gmail.com', password: '123123123' }
    ];
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting normally

        // Clear previous error messages and remove 'invalid' class from inputs
        emailError.textContent = '';
        passwordError.textContent = '';
        emailInput.classList.remove('invalid');
        passwordInput.classList.remove('invalid');

        // Get trimmed values from the input fields
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        let isValid = true; // Flag to track form validity

        // Validate email
        if (!validateEmail(email)) {
            emailError.textContent = 'Please enter a valid email address.';
            emailInput.classList.add('invalid');
            isValid = false;
        }

        // Validate password
        if (!validatePassword(password)) {
            passwordError.textContent = 'Please enter a password with at least 6 characters.';
            passwordInput.classList.add('invalid');
            isValid = false;
        }

        // If the form is valid, proceed with mock backend validation
        if (isValid) {
            // Get mock users from local storage
            const users = JSON.parse(localStorage.getItem('mockUsers'));

            // Check if the entered email and password match any mock user
            const user = users.find(user => user.email === email && user.password === password);

            if (user) {
                // If login is successful, redirect to home page
                window.location.href = 'homepage.html'; 
            } else {
                // If login fails, display an error message
                emailError.textContent = 'Email or password is incorrect. Please try again.';
                emailInput.classList.add('invalid');
                passwordInput.classList.add('invalid');
            }
        }

        // Set focus to the first invalid field
        if (!validateEmail(email)) {
            emailInput.focus();
        } else if (!validatePassword(password)) {
            passwordInput.focus();
        }
    });

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }
});
