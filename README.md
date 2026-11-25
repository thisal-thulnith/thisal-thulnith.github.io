# Thisal Thulnith — portfolio

**AI & Product Engineer. I turn language models into products people use every day.**

A dark, animated personal site with a 3D cloud of points behind the whole page. Static: no build step, no server code.

Each section has its own layout and its own 3D behaviour:

1. Opening: the name very large, the hook under it, and the 3D agent network free on the right.
2. What I do: three pinned steps with the text on the left. The 3D becomes the agents, a drone, then a globe.
3. A band of outlined words that follows the scroll. The 3D loosens and dims.
4. The person and the numbers: one statement that lights up word by word, then four big figures.
5. Work: a reel. The six projects stand side by side on a drum that the scroll turns, one board at the front at a time. Each board tells its project in three frames (the idea, how it works, the result), and the 3D draws the frames around the boards.
6. Story: a huge outlined year behind each step, with a 3D path drawing itself upward.
7. Contact.

## Run it locally

```bash
python3 -m http.server 5174 --bind 127.0.0.1
```

Open http://localhost:5174. Opening `index.html` by double-clicking will not work: browsers block the scripts unless the page comes from a server.

## Edit your details

All text lives in **`js/content.js`**: `site` (opening screen, about and exploring text), `services` (the three tour stops), `projects`, `experience`, `education`, `awards` and `skills`. The Sinhala Whisper project shows no link yet: its `link` line is switched off in `js/content.js` until the real model page is known.

A project's board takes its three frames from its entry in `js/content.js`: the sentence from `pitches`, the steps from `flow` (or its screenshot, if the entry has an `image:` line), and the number from `metric`. The small drawing in the first frame is in `js/covers.js` (`SKETCH`, one per project id); a project without one just shows its sentence.

## Files

| File | What it does |
|---|---|
| `index.html` | Page structure |
| `styles.css` | Brand system, layout and CSS motion |
| `js/content.js` | Your details (the only file you need to edit) |
| `js/scene.js` | The 3D point cloud and its six forms (Three.js) |
| `js/covers.js` | The line drawings: each project's small sketch on its board, and the diagram in its case study |
| `js/main.js` | Loading screen, scroll logic, moving type, the work reel, case studies |
| `js/terminal.js` | The `/` terminal |
