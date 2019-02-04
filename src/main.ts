import { getNwsHourly } from './nwsHourly.js';
import { roundDate } from './helper.js';

getNwsHourly(20009)
.then(nwsHourly => {
    console.log(nwsHourly)

    const startTime = roundDate(new Date, 'h');
    const endTime = new Date(startTime.getTime() + (23 * 60 * 60 * 1000))

    let tempData = nwsHourly.hourlyTemp.getDisplayData(startTime, endTime, 45, 35);
    buildDisplay(document.getElementById('tempData'), tempData);

    let skyCoverData = nwsHourly.skyCover.getDisplayData(startTime, endTime);
    buildDisplay(document.getElementById('skyCoverData'), skyCoverData);

    let precipProbabilityData = nwsHourly.precipProbability.getDisplayData(startTime, endTime);
    buildDisplay(document.getElementById('precipProbabilityData'), precipProbabilityData);

    let windSpeedData = nwsHourly.windSpeed.getDisplayData(startTime, endTime);
    buildDisplay(document.getElementById('windSpeedData'), windSpeedData);

})

function buildDisplay(node, data) {
    data.forEach(entry => {
        let li = document.createElement('li');
        li.style.backgroundColor = entry.rgba;
        li.innerHTML = `<span>${entry.value}</span>`;
        node.appendChild(li)
    })
}
