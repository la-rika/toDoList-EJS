function getDay(){
    const date = new Date(); //creo l'oggetto data di oggi

    const options = {
        weekday: 'long', //string
        day: 'numeric',  //number 
        month: 'long'    //string
    }

    let day = date.toLocaleDateString('it-IT', options) //martedi 6 giugno

    return day;
}

module.exports = getDay;