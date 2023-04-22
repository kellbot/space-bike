function populateRust(count) {
    const screenArea = window.innerHeight * window.innerWidth;
    const density = screenArea / 10000;

    const rustbox = document.getElementById('rustbox');
    for(let i = 0; i < count; i++) {
        let scrap = document.createElement('div');
        scrap.style.transform =  `skew(${randomInteger(-20,20)}deg) rotate(${randomInteger(-90,90)}deg)`;
        scrap.classList.add('rust');
        const maxHeight = window.innerHeight - document.getElementById('hudrow').offsetHeight;

        scrap.style.left = randomInteger(0, window.innerWidth) + 'px';
        scrap.style.top = randomInteger(0, maxHeight) + 'px';

        rustbox.appendChild(scrap);
        scrap.addEventListener('click', async () => {
            const result = await window.electronAPI.removeRust();
            if(result) scrap.remove(); 
            console.log(result);
        })
    }

}


function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  export { populateRust };