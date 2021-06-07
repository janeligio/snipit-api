import express from 'express';
import cors from 'cors';

const server = express().use(cors());
let port:any;
if(process.env.NODE_ENV === 'production') {
    port = process.env.PORT;
} else {
    port = 3001;
}

server.get('/', (req, res) => {
    res.send("Why are you here");
});

server.listen(port, () => console.log(`Server listening on localhost:${port}`));
