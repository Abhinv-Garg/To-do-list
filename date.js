exports.getDate = ()=>{

    let today = new Date();

  let options = { weekday: "long", day: "numeric", month: "long" };
  return today.toLocaleDateString("en-US", options);
}
//  for doubts check lecture 272
exports.getDay = ()=>{
    let today = new Date();

    let options = { weekday: "long" };
    return today.toLocaleDateString("en-US", options);
  }
