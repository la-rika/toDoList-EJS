const express = require("express");
const bodyParser = require("body-parser");
const getDay = require(__dirname + "/day.js")
const mongoose = require('mongoose')
const _ = require('lodash')
const srvr = process.env.userName; 
const srvrCred = process.env.password; 

const app = express();

//settaggio per utilizzare ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')) //diciamo ad express dove andare a prendere i file a cui facciamo riferimento (css, img...)

mongoose.connect("mongodb+srv://"+srvr+":"+srvrCred+"@udemy-cluster.e18m7ig.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model('item', itemsSchema)

const item1 = new Item({
    name: 'be happy'
})

const item2 = new Item({
    name: 'dont tilt'
})

const item3 = new Item({
    name: 'love yourself and your company'
})

const defaultItems = [item1, item2, item3]

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model("List", listSchema)


app.get("/", (req, res) => {
    //visualizzo il file list.ejs (ejs guarda sempre dentro la cartella views per i file)
    //a questo file passo anche la variabile kindOfDay che ha il valore di day (label: value)
    //il file ejs all'intenro del quale usiamo l evariabili e' il ejs template
    Item.find().then((items) => {
        if (items.length === 0) {
            Item.insertMany(defaultItems).then(() => {
                console.log('items successfully saved')
            }).catch((err) => {
                console.log(err)
            })
        } else {
            res.render("list", { title: "Today", newListItems: items }) //list: file in cui voglio usare i dati; {}: dati che voglio usare nel file html
        }
    }).catch((err) => {
        console.log(err)
    })
})

app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    })

    if (listName === 'Today') {
        item.save();
        res.redirect('/')
    } else {
        List.findOne({ name: listName }).then((foundList) => {
            foundList.items.push(item)
            foundList.save();
            res.redirect('/' + listName)
        })
    }

})

app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.list;

    if (listName === 'Today') {
        Item.findByIdAndRemove({ _id: checkedItemId }).then(function () {
            res.redirect("/")
        }).catch(function (error) {
            console.log(error); // Failure
        });
    } else {
        //nel array items della lista in cui siamo troviamo e eliminiamo l'item con l'id dell'elemento che abbiamo checckato
        //$pull: elimina un elemento da un array
        List.findByIdAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }).then((foundList, err) => {
            if (!err) {
                res.redirect('/' + listName)
            }
        })
    }
})

//in base a cosa metto nel url dopo '/' vado in una nuova pagina
//dynamic routing
app.get('/:customList', (req, res) => {
    const customList = _.capitalize(req.params.customList) //lodash permette di formattare in un certo modo delle stringhe a prescindere da come vengono scritte dall'utente

    List.findOne({ name: customList }).then((result) => {
        if (result) { //result diverso da undefined
            res.render("list", { title: result.name, newListItems: result.items }) //list: file in cui voglio usare i dati; {}: dati che voglio usare nel file html
        } else {

            const list = new List({
                name: customList,
                items: []
            })

            list.save();
            setTimeout(() => { res.redirect('/' + customList); }, 2000);
        }
    })

})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}
app.listen(port,()=>{
    console.log('server up and running '+port)
});