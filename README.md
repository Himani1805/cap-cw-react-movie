# cap-cw-react-movie

A small React movie search. Type a title and the page lists matching films with a poster and year. Newer films come first. Results come from the OMDb API.

## How to run

From this folder:

```bash
npm install
npm run dev
```

Open the local address Vite prints, usually http://localhost:5173/.

The page starts with Avengers results, twelve at a time. Use the page buttons to see more. Clear the box and it goes back to that list. Films with a broken poster stay off the opening list, and show up when you search. If nothing matches, it says no movies were found.
