import { getNwsHourly, NwsProperty, NwsHourly } from './nwsHourly';
import { roundDate } from './helper';
import { NwsDisplay, TempDisplay, PercentDisplay, NumericDisplay, HourDisplay } from './nwsDisplay';

let displays = [];
let hoursInput = document.getElementById('hours') as HTMLInputElement;
let nwsHourly: NwsHourly;
let startTime: Date = roundDate(new Date, 'h');
let endTime: Date = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));

setupDisplays(20009);

hoursInput.addEventListener('change', () => {
    const hours: number = parseInt(hoursInput.value);

    startTime = roundDate(new Date, 'h');
    endTime = new Date(startTime.getTime() + ((hours) * 60 * 60 * 1000))
    
    console.log(startTime, endTime);

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

    const hours: number = parseInt(hoursInput.value);

    startTime = roundDate(new Date, 'h');
    endTime = new Date(startTime.getTime() + ((hours) * 60 * 60 * 1000))

    displays.forEach(display => display.renderDisplay(startTime, endTime))
}


async function setupDisplays(zipCode: number): Promise<void> {
    nwsHourly = new NwsHourly(zipCode);
    await nwsHourly.getData();

    displays = [];
    displays.push(new HourDisplay(document.getElementById('hoursData')));
    displays.push(new TempDisplay(document.getElementById('tempData'), nwsHourly, 'hourlyTemp', 45, 35));
    displays.push(new PercentDisplay(document.getElementById('skyCoverData'), nwsHourly, 'skyCover', [190,190,190]));
    displays.push(new PercentDisplay(document.getElementById('precipProbabilityData'), nwsHourly, 'precipProbability', [0,0,255]));
    displays.push(new NumericDisplay(document.getElementById('windSpeedData'), nwsHourly, 'windSpeed', [190,190,190], 20));

    displays.forEach(display => display.renderDisplay(startTime, endTime))

    autoRefreshDisplays(roundDate(new Date, 'h', false),  60 * 60 * 1000)
}

function autoRefreshDisplays(initialTime: Date, increment: number) {
    // Get the number of milliseconds until the first refresh
    const now = new Date;
    const timeUntilFirst = initialTime.getTime() - now.getTime();

    console.log("Auto Refresh Initiated", `Next Refresh at ${initialTime}`)

    setTimeout(() => {
        refreshDisplays();
        console.log("Displays Refreshed", `Next Refresh at ${new Date(initialTime.getTime() + increment)}`)
        setInterval(() => {
            const now = new Date;
            console.log("Displays Refreshed", `Next Refresh at ${new Date(now.getTime() + increment)}`)
            refreshDisplays();
        }, increment);
    }, timeUntilFirst)


}
