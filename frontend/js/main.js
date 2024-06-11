document.addEventListener("DOMContentLoaded", function() {
    // Select the form and input elements, and error message containers for login
    const loginForm = document.querySelector('.login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const signupBtn = document.getElementById('signup-btn');

    // Adding some mock users to local storage for testing
    const mockUsers = [
        { email: 'sahar@gmail.com', password: '123123123' },
        { email: 'saharrr@gmail.com', password: '123123123' }
    ];
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the form from submitting normally

            // Clear previous error messages and remove 'invalid' class from inputs
            clearLoginErrors();

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
    }

    // Add event listener to the signup button
    if (signupBtn) {
        signupBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default link behavior
            window.location.href = 'signup.html'; // Redirect to the signup page
        });
    }

    // Signup page functionality
    if (window.location.pathname.endsWith('signup.html')) {
        const signupForm = document.querySelector('.form-container');
        const firstNameInput = document.getElementById('first');
        const lastNameInput = document.getElementById('last');
        const signupEmailInput = document.getElementById('email');
        const signupPasswordInput = document.getElementById('password');
        const firstNameError = document.getElementById('first-error');
        const lastNameError = document.getElementById('last-error');
        const signupEmailError = document.getElementById('email-error');
        const signupPasswordError = document.getElementById('password-error');

        if (signupForm) {
            signupForm.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevent the form from submitting normally

                // Clear previous error messages and remove 'invalid' class from inputs
                clearSignupErrors();
            
                // Get trimmed values from the input fields
                const firstName = firstNameInput.value.trim();
                const lastName = lastNameInput.value.trim();
                const email = signupEmailInput.value.trim();
                const password = signupPasswordInput.value.trim();

                let isValid = true; // Flag to track form validity

                // Validate first name
                if (!validateName(firstName)) {
                    firstNameError.textContent = 'Please enter a valid first name (at least 3 characters).';
                    firstNameInput.classList.add('invalid');
                    isValid = false;
                }

                // Validate last name
                if (!validateName(lastName)) {
                    lastNameError.textContent = 'Please enter a valid last name (at least 3 characters).';
                    lastNameInput.classList.add('invalid');
                    isValid = false;
                }

                // Validate email
                if (!validateEmail(email)) {
                    signupEmailError.textContent = 'Please enter a valid email address.';
                    signupEmailInput.classList.add('invalid');
                    isValid = false;
                }

                // Validate password
                if (!validatePassword(password)) {
                    signupPasswordError.textContent = 'Please enter a password with at least 6 characters.';
                    signupPasswordInput.classList.add('invalid');
                    isValid = false;
                }

                // If the form is valid, save the new user
                if (isValid) {
                    // Retrieve existing users
                    const users = JSON.parse(localStorage.getItem('mockUsers')) || [];

                    // Check if the email is already registered
                    const existingUser = users.find(user => user.email === email);
                    if (existingUser) {
                        signupEmailError.textContent = 'This email is already registered.';
                        signupEmailInput.classList.add('invalid');
                    } else {
                        // Save the new user
                        users.push({ email, password });
                        localStorage.setItem('mockUsers', JSON.stringify(users));
                        alert('Sign up successful! You can now log in.');
                        window.location.href = 'index.html'; // Redirect to login page
                    }
                }
            });
        }

        function clearSignupErrors() {
            firstNameError.textContent = '';
            lastNameError.textContent = '';
            signupEmailError.textContent = '';
            signupPasswordError.textContent = '';
            firstNameInput.classList.remove('invalid');
            lastNameInput.classList.remove('invalid');
            signupEmailInput.classList.remove('invalid');
            signupPasswordInput.classList.remove('invalid');
        }
    }

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    function validateName(name) {
        return name.length >= 3;
    }

    function clearLoginErrors() {
        emailError.textContent = '';
        passwordError.textContent = '';
        emailInput.classList.remove('invalid');
        passwordInput.classList.remove('invalid');
    }
});
