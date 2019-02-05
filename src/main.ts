import { getNwsHourly, NwsProperty } from './nwsHourly.js';
import { roundDate } from './helper.js';
import { NwsDisplay, TempDisplay, PercentDisplay, NumericDisplay } from './nwsDisplay.js';

let displays = []
let startTime: Date;
let endTime: Date;

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

async function setupDisplays(zipCode: number): Promise<void> {
    const data = await getNwsHourly(zipCode);

    displays = [];
    displays.push(new TempDisplay(document.getElementById('tempData'), data.hourlyTemp, 45, 35));
    displays.push(new PercentDisplay(document.getElementById('skyCoverData'), data.skyCover, [190,190,190]));
    displays.push(new PercentDisplay(document.getElementById('precipProbabilityData'), data.precipProbability, [0,0,255]));
    displays.push(new NumericDisplay(document.getElementById('windSpeedData'), data.windSpeed, [190,190,190], 20));

    startTime = roundDate(new Date, 'h');
    endTime = new Date(startTime.getTime() + (23 * 60 * 60 * 1000))

    displays.forEach(display => display.renderDisplay(startTime, endTime))

}
