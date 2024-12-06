const api = "http://127.0.0.1:3000/";

async function main() {
    let data = await fetch(api + "get_all_users"); // Fix the double slash in API endpoint
    data = (await data.json()).users;

    let container = document.getElementById("container");
    const basePath = window.location.pathname.split('/').slice(0, -2).join('/');

    data.forEach(user => {
        let path = `${basePath}/game?name=${encodeURIComponent(user.player_name)}`;
        console.log(path);

        let content = `
        <div>
          <p>${user.player_name}</p>
          <button onclick="window.location.href='${basePath + '/game/index.html?name=' + user.player_name}'">Continue</button>
        </div>
        `;
        container.innerHTML += content;
    });
}

main();
