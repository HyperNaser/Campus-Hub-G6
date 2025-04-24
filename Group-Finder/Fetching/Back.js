// Add event listener for the back button
document.getElementById('back-btn').addEventListener('click', () => {
  window.location.href = '../Main%20Page/GroupFinder.html'; // Correct the path if needed
});

// Form validation
document.querySelector('.group-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const inputs = this.querySelectorAll('input[type="text"]');
  let valid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.border = '2px solid red';
      alert(`Please fill in the ${input.previousElementSibling.textContent}`);
      valid = false;
    } else {
      input.style.border = '';
    }
  });

  if (valid) alert('Group Created (simulation)');
});