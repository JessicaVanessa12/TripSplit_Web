const app = require('./app');
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`TripSplit en http://localhost:${port}`));
