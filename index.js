const express =  require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express());
const port = 5000;



app.get('/' , (req , res) => {
    res.send('Bismillahir Rahmanir Rahim');
})

app.listen(port , () => {
    console.log(`App listening at port ${port}`);
})