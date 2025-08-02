// Completely clean main.tsx
console.log('Starting app...');

const root = document.getElementById("root");
if (root) {
  root.innerHTML = `
    <div style="padding: 20px; background: lightblue; font-family: Arial;">
      <h1>Clean HTML Test</h1>
      <p>Това е чист HTML без React, без импорти, без нищо друго.</p>
      <p>Ако това работи без грешки, значи проблемът е в някой импорт.</p>
    </div>
  `;
  console.log('HTML set successfully');
} else {
  console.error('Root element not found!');
}
