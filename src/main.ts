import { NwsHourly } from './nwsHourly.js';
import { roundDate } from './helper.js';

let nwsHourly = new NwsHourly(20009);
nwsHourly.getData()
.then(_ => {
    const startTime = roundDate(new Date, 'h');
    const endTime = new Date(startTime.getTime() + (23 * 60 * 60 * 1000))
    
    let tempData = nwsHourly.hourlyTemp.getDisplayData(startTime, endTime, 45, 35);
    buildDisplay(document.getElementById('tempData'), tempData);

    let skyCoverData = nwsHourly.skyCover.getDisplayData(startTime, endTime);
    buildDisplay(document.getElementById('skyCoverData'), skyCoverData);

    let precipProbabilityData = nwsHourly.precipProbability.getDisplayData(startTime, endTime);
    buildDisplay(document.getElementById('precipProbabilityData'), precipProbabilityData);

})

function buildDisplay(node, data) {
    data.forEach(entry => {
        let li = document.createElement('li');
        li.style.backgroundColor = entry.rgba;
        li.innerHTML = `<span>${entry.value}</span>`;
        node.appendChild(li)
    })
}
