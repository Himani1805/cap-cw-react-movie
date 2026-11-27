# cap-cw-react-movie

A small React movie search. Type a title and the page lists matching films with a poster and year. Newer films come first. Results come from the OMDb API.

## How to run

From this folder:

```bash
npm install
npm run dev
```

Open the local address Vite prints, usually http://localhost:5173/.

The page starts with Avengers results, twelve at a time. Use the page buttons to see more. Type one word, such as dhoom, and the related films appear. Add a second word, such as dhoom 3, and the list narrows to that title. A couple of letters, like dh, stay on the current list. Clear the box and it goes back to Avengers. Films with a broken poster stay off the opening list, and show up when you search. If nothing matches, it says no movies were found.
