// Get DOM elements
const inputName = document.querySelector('#name');
const inputEmail = document.querySelector('#email');
const inputComments = document.querySelector('#comments');
const form = document.querySelector('form');
const dlBtn = document.querySelector('button[type="submit"]');

document.querySelectorAll('.form-box').forEach(box => {
    const input = box.querySelector('.input');
    const eraseBtn = box.querySelector('.erase-btn');

    // Hide initially
    eraseBtn.style.visibility = 'hidden';

    input.addEventListener('input', () => {
        eraseBtn.style.visibility = input.value ? 'visible' : 'hidden';

        input.classList.toggle('valid', input.checkValidity());
        input.classList.toggle('invalid', !input.checkValidity());
    });

    eraseBtn.addEventListener('click', () => {
        // If textarea, confirm before wiping
        if (input.tagName === 'TEXTAREA' && input.value.length > 20) {
            if (!confirm("Clear this whole comment? 👀")) return;
        }

        input.value = '';
        eraseBtn.style.visibility = 'hidden';
        input.classList.remove('valid', 'invalid');
        input.focus();
    });
});

// Form submit handler
form.addEventListener('submit', (e) => {
    e.preventDefault(); // prevent page reload

    const name = inputName.value.trim();
    const email = inputEmail.value.trim();
    const comments = inputComments.value.trim();
    const rating = form.querySelector('input[name="rating"]:checked')?.value;

    if (!name || !email || !comments || !rating) {
        alert("Please fill out all fields and select a rating!");
        return;
    }

    // For now, just log the data to console
    console.log("Feedback submitted:");
    console.log({ name, email, comments, rating });

    // Clear form after submit
    form.reset();
    eraseBtns.forEach(btn => btn.style.visibility = 'hidden');
    alert("Thanks for your feedback! ✨");

    // If you want, you could later send this data via fetch() to a server
    // fetch('/feedback', { method: 'POST', body: JSON.stringify({name, email, comments, rating}) })
});