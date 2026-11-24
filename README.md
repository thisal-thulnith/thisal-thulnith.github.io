# Thisal Thulnith — portfolio

**AI & Product Engineer. I turn language models into products people use every day.**

A dark, animated personal site with a 3D cloud of points behind the whole page. Static: no build step, no server code.

Each section has its own layout and its own 3D behaviour:

1. Opening: the name very large, the hook under it, and the 3D agent network free on the right.
2. What I do: three pinned steps with the text on the left. The 3D becomes the agents, a drone, then a globe.
3. A band of outlined words that follows the scroll. The 3D loosens and dims.
4. The person and the numbers: one statement that lights up word by word, then four big figures.
5. Work: all six project names in a list. Scrolling moves through them while a 3D ring of six panels turns one place per project.
6. Story: a huge outlined year behind each step, with a 3D path drawing itself upward.
7. Contact.

## Run it locally

```bash
python3 -m http.server 5174 --bind 127.0.0.1
```

Open http://localhost:5174. Opening `index.html` by double-clicking will not work: browsers block the scripts unless the page comes from a server.

## Edit your details

All text lives in **`js/content.js`**: `site` (opening screen, about and exploring text), `services` (the three tour stops), `projects`, `experience`, `education`, `awards` and `skills`. Lines marked `DUMMY` are placeholders (right now the Hugging Face link for Sinhala Whisper).

## Files

| File | What it does |
|---|---|
| `index.html` | Page structure |
| `styles.css` | Brand system, layout and CSS motion |
| `js/content.js` | Your details (the only file you need to edit) |
| `js/scene.js` | The 3D point cloud and its six forms (Three.js) |
| `js/covers.js` | The line diagram on the pointer-following card |
| `js/main.js` | Loading screen, scroll logic, moving type, work list, case studies |
| `js/terminal.js` | The `/` terminal |
