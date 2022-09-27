const express = require("express");
const mongoose = require("mongoose");
const _=require("lodash") ;

const app = express();
app.use(express.urlencoded({ extended: true })); // In latest version no need to use body parser instead use the alternative here.
app.use(express.static("public"));
app.set("view engine", "ejs");
mongoose.connect("mongodb+srv://admin-abhinav:test123@cluster0.zw7nf0b.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = {
  name:String,
  items:[itemsSchema] //We are making it an array so we can pass default item array and to render items in list.ejs as it needs array
}

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List",listSchema);

const item1 =new Item( {name: "Welcome to To-do-List"});
const item2 =new Item( { name: "Hit the + button to  add a new task" });
const item3 =new Item(  { name: "<-- Hit this to cross a task" });

const defaultItem = [item1,item2,item3];


function insertDefaultItems() {
  Item.insertMany(defaultItem, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(
        "Successfully saved the default items to items collection in  todolistDB"
      );
    }
  });
}


app.get("/", (req, res) => {

  Item.find({}, (err, foundItems) => {
    if (err) {
      console.log(err);
    } else if (foundItems.length === 0) {
      insertDefaultItems();
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems }); //When we use find({}) \ {} --> select All \ it returns an array of all the documents in the collection.
    }
  });
});


app.get("/:customListName", (req, res) => {
const customListName = _.capitalize(req.params.customListName);

List.findOne({name:customListName},(err,foundList)=>{
  if (!err) {
    if(!foundList){
      // Create a new list
      const list = new List({
        name:customListName,
        items:defaultItem
      })
      list.save();
      res.redirect("/"+ customListName)
    }else {
      // Show the existing list
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  } 
})});


app.get("/about", (req, res) => {
  res.render("about");
});


app.post("/", (req, res) => {
  const itemName = req.body.newItem;  //Valuse we get when user inputs one
  const listName = req.body.list    //Value we get from submit buttom that is listTitle
  const newItem = new Item({ name: itemName });  //Assigning  a value to newItem variable with itemSchema

  if (listName === "Today") {    
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    })
    }
});



app.post("/delete", (req, res) => {
  const checkedItemID = req.body.checkBox;
  const listName = req.body.listName;

  if (listName ==="Today") {
    
  Item.findByIdAndRemove(checkedItemID, (err) => {
    if (!err) {
      console.log("Item Deteted");
      res.redirect("/");
    }});
  } else {
   List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}},(err,foundList)=>{         //$pull is used for deleting  the items from an array refer to lectue 348
    if(!err){
      res.redirect("/"+listName);
    }
   }) 
  }
});


app.listen(3000, () => console.log("app listening on port 3000!"));
