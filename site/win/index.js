

async function main() {
    const urlParams = new URLSearchParams(window.location.search);
    const co2 = urlParams.get('co2');
    const distance = urlParams.get('distance');
    const name = urlParams.get('name');

    const co2Element = document.querySelector('.co2');
    const distanceElement = document.querySelector('.distance');
    const nameElement = document.querySelector('.name');

    co2Element.innerText = `You used ${co2} kg of CO2`;
    distanceElement.innerText = `You traveled ${distance} km`;
    nameElement.innerText = `Hello ${name}!`;

}

main()