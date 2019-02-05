import { getNwsHourly, NwsProperty } from './nwsHourly.js';
import { roundDate } from './helper.js';
import { NwsDisplay, TempDisplay, PercentDisplay, NumericDisplay } from './nwsDisplay.js';

const displays = []

setupDisplays(20009);

document.getElementById('hours').addEventListener('change', (e) => {
    // console.log(e.target.value);
    let element = e.target as HTMLInputElement;
    let hours: number = parseInt(element.value);

    let startTime = roundDate(new Date, 'h');
    let endTime = new Date(startTime.getTime() + ((hours - 1) * 60 * 60 * 1000))
    
    displays.forEach(display => display.renderDisplay(startTime, endTime))
})

async function setupDisplays(zipCode: number): Promise<void> {
    const data = await getNwsHourly(zipCode);

    displays.push(new TempDisplay(document.getElementById('tempData'), data.hourlyTemp, 45, 35));
    displays.push(new PercentDisplay(document.getElementById('skyCoverData'), data.skyCover, [255,255,255]));
    displays.push(new PercentDisplay(document.getElementById('precipProbabilityData'), data.precipProbability, [0,0,255]));
    displays.push(new NumericDisplay(document.getElementById('windSpeedData'), data.windSpeed, [255,255,255], 20));

    let startTime: Date = roundDate(new Date, 'h');
    let endTime: Date = new Date(startTime.getTime() + (23 * 60 * 60 * 1000))

    displays.forEach(display => display.renderDisplay(startTime, endTime))

}
