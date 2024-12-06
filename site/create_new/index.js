const api = "http://127.0.0.1:3000/"

let start_airport = "";
let end_airport = "";

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
    start_airport = data["start_airport"];
    end_airport = data["end_airport"];
})

document.querySelector(".start_button").addEventListener("click", function() {
    const input = document.querySelector(".name_input").value;
    if (input === "") {
        let errorElement = document.querySelector(".error");
        errorElement.style.display = "block";
        return;
    }
    async function getApiData() {
        const response = await fetch(api + "does_game_exist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name: input})
        });
        const data = await response.json();
        const exists = data.exists;
        if (exists && start_airport !== "" && end_airport !== "") {
            let errorElement = document.querySelector(".error");
            errorElement.style.display = "block";
            return;
        }

        //create new game
        const response2 = await fetch(api + "create_new_game", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: input,
                start_airport: start_airport,
                end_airport: end_airport
            })
        });
        if (!response2.ok) {
            const message = `An error has occured: ${response2.status}`;
            throw new Error(message);
        }
        let data2 = await response2.json();


        const basePath = window.location.pathname.split('/').slice(0, -2).join('/'); // Remove "create_new/index.html"
        window.location.href = `${basePath}/game/index.html?name=` + input;

    }
    getApiData()
})