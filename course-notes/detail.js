document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("id");
  
    const detailContainer = document.querySelector("main article");
    if (!userId || !detailContainer) return;
  
    detailContainer.innerHTML = "<p>Loading note details...</p>";
  
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch note details.");
      }
      const user = await res.json();
  
      const courseOptions = ["CS101", "MATH202", "ENG103", "BIO104", "HIST205"];
      const course = courseOptions[Math.floor(Math.random() * courseOptions.length)];
      const uploadDate = new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000)
        .toISOString()
        .split("T")[0];

  
      detailContainer.innerHTML = `
        <h2>${user.name} (${user.username})</h2>
        <p><strong>Course:</strong> ${course}</p>
        <p><strong>Uploaded:</strong> ${uploadDate}</p>
        <p>Email: ${user.email}</p>
        <p>Company: ${user.company.name}</p>
        <p><strong>Tags:</strong> ${user.company.bs.split(" ").join(", ")}</p>
        <div class="grid">
          <a href="new.html" role="button">Edit</a>
          <button class="secondary" disabled>Delete</button>
        </div>
      `;
    } catch (err) {
      detailContainer.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
  });
  