

async function main() {
    const urlParams = new URLSearchParams(window.location.search);
    const co2 = urlParams.get('co2');
    const distance = urlParams.get('distance');
    const name = urlParams.get('name');

}

main()