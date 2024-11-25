api = "http://127.0.0.1:3000/"



async function getApiData() {
    const response = await fetch(api + "get_start_and_end_airports");
    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    return await response.json();
}

getApiData().then(data => {
    const start_p = document.querySelector(".start");
    const end_p = document.querySelector(".end");
    start_p.innerHTML = "Start airport: " + data["start_airport"];
    end_p.innerHTML = "End airport: " + data["end_airport"];
})

document.querySelector(".start_button").addEventListener("click", function() {
    const input = document.querySelector(".name_input").value;
    async function getApiData() {
        const response = await fetch(api + "does_game_exist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name: input})
        });
        const data = await response.json();
        console.log(data)
    }
    getApiData()
})