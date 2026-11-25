# Project pictures

Save one picture for each project in this folder, named after the project:

| Project | File name |
|---|---|
| StockNetwork | `stocknetwork.jpg` |
| Zorum AI | `zorum.jpg` |
| Sinhala Whisper | `whisper.jpg` |
| Buff Salon AI | `buffsalon.jpg` |
| Sales Agent | `sales.jpg` |
| Construction Agent | `construction.jpg` |

`.png` and `.webp` work too (for example `zorum.png`).

Then add one line to that project's block in `js/content.js`, with the file's name:

```js
image: "assets/projects/zorum.jpg",
```

The work page and the case study show the picture once that line is there.

- Shape: wide, about 16:10. The frame crops to fit, so keep the important part near the middle.
- Size: 1600 pixels or more across, and under about 500 KB so the page stays quick.
- Until a project has a picture, its frame shows the drawing of how it works.
