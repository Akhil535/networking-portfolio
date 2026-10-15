# Akhil V. — Network & IT Support

A responsive portfolio site built with plain HTML, CSS, and JavaScript. The visual system uses liquid-glass panels, Akhil’s portrait from the provided CV, a custom 2D global network map, and animated SVG diagrams for network operations, ADHICS readiness, access control, and application support. An automatic terminal cycles through verified CV details, with pause and next controls.

## Preview

Open `index.html` in a browser. No build step or package install is needed. Google Fonts are optional; system font fallbacks are included. The contact form prepares a message in the visitor’s email app and does not store submissions.

The page includes a dark/light theme switch, responsive navigation, scroll reveals, animated routes, and reduced-motion support. Network graphics are inline SVG; the only raster image is the portrait extracted from the supplied CV.

## Before publishing

- Confirm that the contact email and phone number are appropriate for public display.
- Add verified LinkedIn or GitHub links if you want social profiles shown.
- Add certifications only after confirming the details; none were listed in the CV used for this portfolio.
- The uploaded CV is not included as a public download because it contains personal details. Add a public, redacted copy if you want to offer a resume download.

## Publish with GitHub Pages

From this folder, initialize or copy the contents into a repository, then select **Settings → Pages** in GitHub and publish from the `main` branch root.

```sh
git init
git add .
git commit -m "Create Akhil V portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-HANDLE/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the remote URL with your repository. If publishing from an existing repository, copy this folder’s contents into its root.

