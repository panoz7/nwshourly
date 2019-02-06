import { getNwsHourly, NwsProperty, NwsHourly } from './nwsHourly.js';
import { roundDate } from './helper.js';
import { NwsDisplay, TempDisplay, PercentDisplay, NumericDisplay } from './nwsDisplay.js';

let displays = []
let nwsHourly: NwsHourly;
let startTime: Date = roundDate(new Date, 'h');
let endTime: Date = new Date(startTime.getTime() + (23 * 60 * 60 * 1000));

setupDisplays(20009);

document.getElementById('hours').addEventListener('change', (e) => {
    let element = e.target as HTMLInputElement;
    let hours: number = parseInt(element.value);

    startTime = roundDate(new Date, 'h');
    endTime = new Date(startTime.getTime() + ((hours - 1) * 60 * 60 * 1000))
    
    displays.forEach(display => display.renderDisplay(startTime, endTime))
})

document.getElementById('zipCode').addEventListener('change', (e) => {
    let element = e.target as HTMLInputElement;
    let zipCode: number = parseInt(element.value);

    setupDisplays(zipCode);
    
})

document.getElementById('refreshDisplay').addEventListener('click', refreshDisplays);


async function refreshDisplays(): Promise<void> {
    await nwsHourly.getData();
    console.log(nwsHourly);

    let startTime: Date = roundDate(new Date, 'h');
    let endTime: Date = new Date(startTime.getTime() + (23 * 60 * 60 * 1000));

    displays.forEach(display => display.renderDisplay(startTime, endTime))
}


async function setupDisplays(zipCode: number): Promise<void> {
    nwsHourly = new NwsHourly(zipCode);
    await nwsHourly.getData();

    displays = [];
    displays.push(new TempDisplay(document.getElementById('tempData'), nwsHourly, 'hourlyTemp', 45, 35));
    displays.push(new PercentDisplay(document.getElementById('skyCoverData'), nwsHourly, 'skyCover', [190,190,190]));
    displays.push(new PercentDisplay(document.getElementById('precipProbabilityData'), nwsHourly, 'precipProbability', [0,0,255]));
    displays.push(new NumericDisplay(document.getElementById('windSpeedData'), nwsHourly, 'windSpeed', [190,190,190], 20));

    displays.forEach(display => display.renderDisplay(startTime, endTime))
}
