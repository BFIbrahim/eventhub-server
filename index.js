const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const port = process.env.PORT || 3000;

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send(`server is running`)
})


app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
