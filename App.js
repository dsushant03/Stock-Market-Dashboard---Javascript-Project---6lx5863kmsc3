const searchButton = document.getElementById('btn');
const watchlist = document.getElementById('watchlist');
const input = document.getElementById('search-box');
const modalHead = document.getElementById('modal-head')
let isEmpty = true;
const allStocks = {}
let nStocks = 0
let selectedTimeframeId = ""
let url = ""
const UrlObj ={
    "intra" : false,
    "day" : false,
    "week" : false,
    "month" : false 
} 
const modal = document.getElementById("modal");
const closeModal = document.getElementsByClassName("close")[0];

document.querySelectorAll('.btn').forEach((el)=>{
    el.addEventListener("click",(e)=>handleTimeframeClick(e.target))
})

function handleTimeframeClick(clickedBtn) {
    if(selectedTimeframeId != "")
    {
        document.getElementById(selectedTimeframeId).classList.toggle('active')
    }   
    clickedBtn.classList.toggle('active');
    selectedTimeframeId = clickedBtn.id
}

searchButton.addEventListener("click", appendToWatchlist)

async function appendToWatchlist(){
    
    if(selectedTimeframeId == "")
    {
        alert("Please select a timeframe");
        return
    }

    let symbol = input.value
    let data = await getData(symbol)
    // console.log(data)

    if(data == -1)
        return
    
    let key = `allStocks-${symbol}-${selectedTimeframeId}`
    allStocks[key] = data
    nStocks++
    setInitialText()
    // console.log(allStocks)
    
    const deleteButton = document.createElement("img")
    deleteButton.setAttribute('id',symbol)
    deleteButton.addEventListener("click", deleteStock)
    deleteButton.setAttribute('src',"cross.png")
    deleteButton.setAttribute('width',"25")
    deleteButton.setAttribute('height',"25")

    const stockSymbol = document.createElement("div")
    stockSymbol.innerText = symbol
    stockSymbol.setAttribute('class',"watch")
    stockSymbol.setAttribute('id',`${symbol}-${selectedTimeframeId}`)
    
    stockSymbol.addEventListener("click", (e)=>addDataToModal(e.target.id))

    let text;
    switch (selectedTimeframeId) {
        case "btn-intra":
            text = "INTRADAY"
            break;
        case "btn-day":
            text = "DAILY"
            break;
        case "btn-week":
            text = "WEEKLY"
            break;
        case "btn-month":
            text = "MONTHLY"
            break;
        default:
            break;
    }

    const timeFrame = document.createElement("div")
    timeFrame.innerText = text
    timeFrame.setAttribute('class',"watch")
    
    let el = document.createElement("div")
    el.append(stockSymbol)
    el.append(timeFrame)
    el.append(deleteButton)
    el.setAttribute('id', `div_${symbol}`)
    el.setAttribute('class', "watch-container")
    el.style.backgroundColor = "black"

    // console.log(watchlist)
    watchlist.append(el)
    
    input.value = ''
    // console.log(selectedTimeframeId)
}

async function getData(symbol){
    
    if(symbol == "")
    {
        alert("Please do the honours")
        return -1
    }

    if(allStocks.hasOwnProperty(`allStocks-${symbol}-${selectedTimeframeId}`))
    {
        alert("Try a new stock")
        input.value = ''
        return -1
    }
    
    switch (selectedTimeframeId) {
        case "btn-intra":
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&outputsize=compact&interval=5min&apikey=V33QXKW8721PHNTY`
            break;
        case "btn-day":
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=V33QXKW8721PHNTY`
            break;
        case "btn-week":
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&outputsize=compact&apikey=V33QXKW8721PHNTY`
            break;
        case "btn-month":
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&outputsize=compact&apikey=V33QXKW8721PHNTY`
            break;
        default:
            break;
    }
    
    let resp = await fetch(url)
    let data = await resp.json()

    if(data.hasOwnProperty('Error Message'))
    {
        alert(data['Error Message'])
        input.value = ''
        return -1;
    }

    return data;
}

function deleteStock(e) {
    let id = `div_${e.target.id}`
    document.getElementById(id).remove()
    delete allStocks[e.target.id]
    nStocks--

    // for initial text
    if(Object.keys(allStocks).length == 0)
    {
        isEmpty = true
    }
    setInitialText()
}

function setInitialText(){
    if(nStocks>0)
    {
        document.getElementById('initText').innerText = ""
    }
    else
    {
        document.getElementById('initText').innerText = "Search symbols and select timeframe to add your favourites here ..!"
    }
}

/*------------------------------------------------------------------------------------------------------*/
                                            /*   MODAL   */

closeModal.addEventListener("click", function() {
  modal.style.display = "none";
});

window.addEventListener("click", function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
}})

function addDataToModal(id){
    // console.log(id)
    document.getElementById('table-body').innerHTML = ""
    let entriesObj = allStocks[`allStocks-${id}`]
    let entries;
    let timeframe;

    switch (id.charAt(id.length-1)) {
        //intra
        case 'a':
            timeframe = "intraday"
            let intradayDate = entriesObj["Meta Data"]["3. Last Refreshed"].slice(0,10)
            document.getElementById('date').innerText = intradayDate
            entries = entriesObj["Time Series (5min)"]
            modalHead.innerText = `${entriesObj["Meta Data"]["2. Symbol"].toUpperCase()} - INTRADAY`
            break;
        
        //day
        case 'y':
            timeframe = "daily"
            entries = entriesObj["Time Series (Daily)"]
            modalHead.innerText = `${entriesObj["Meta Data"]["2. Symbol"].toUpperCase()} - DAILY`
            break;
        
        //week
        case 'k':
            timeframe = "weekly"
            entries = entriesObj["Weekly Time Series"]
            modalHead.innerText = `${entriesObj["Meta Data"]["2. Symbol"].toUpperCase()} - WEEKLY`
            break;
        
        //month
        case 'h':
            timeframe = "monthly"
            entries = entriesObj["Monthly Time Series"]
            modalHead.innerText = `${entriesObj["Meta Data"]["2. Symbol"].toUpperCase()} - MONTHLY`
            break;
    
        default:
            break;
    }

    // console.log(allStocks[`allStocks-${id}`])
    // console.log(entries)
    
    for(let key in entries)
    {
        let row = document.createElement('tr')
        
        let open = document.createElement('td')
        open.innerText = entries[key]["1. open"]
        
        let high = document.createElement('td')
        high.innerText = entries[key]["2. high"]
        
        let low = document.createElement('td')
        low.innerText = entries[key]["3. low"]

        let close = document.createElement('td')
        close.innerText = entries[key]["4. close"]
        
        let time = document.createElement('td')
        if(timeframe == "intraday")
        {
            time.innerText = key.slice(11,19)
        }
        else
        {
            time.innerText = key.slice(0,11)
        }
        
        let volume = document.createElement('td')
        volume.innerText = entries[key]["5. volume"]
        if(timeframe == "daily")
        {
            volume.innerText = entries[key]["6. volume"]
        }
        else
        {
            volume.innerText = entries[key]["5. volume"]
        }
        
        row.append(time)
        row.append(open)
        row.append(high)
        row.append(low)
        row.append(close)
        row.append(volume)
        
        document.getElementById('table-body').append(row)
    }

    modal.style.display = "block";
}
