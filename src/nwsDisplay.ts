import { NwsProperty, NwsHourly } from './nwsHourly';
import { roundNum, roundDate } from './helper';
import { NwsEntry, DisplayData } from './interfaces';
import { getTimes as getSunData } from 'suncalc'

export class NwsDisplay {

    nwsHourly: NwsHourly;
    nwsProp: string;
    nwsData: NwsProperty; 
    node: HTMLElement;

    constructor(node: HTMLElement, nwsHourly: NwsHourly, nwsProp: string) {
        this.nwsHourly = nwsHourly;
        this.nwsProp = nwsProp;
        this.nwsData = nwsHourly[nwsProp];
        this.node = node;
    }

    renderDisplay(startTime: Date, endTime: Date): void {
        // Get the latest hourly data
        this.nwsData = this.nwsHourly[this.nwsProp];

        // Get the display data
        let displayData = this.getDisplayData(startTime, endTime);
        
        // Clear the display and rebuild it
        this.clearDisplay();
        this.buildDisplay(displayData)        
    }

    buildDisplay(data: DisplayData[]) {
        data.forEach(entry => {
            let li = document.createElement('li');
            li.style.backgroundColor = entry.rgba;
            li.innerHTML = `<span>${entry.value}</span>`;
            this.node.appendChild(li);
        })
    }

    // This will be extended by each of the display objects
    getDisplayData(startTime: Date, endTime: Date): DisplayData[] {
        return [{date: new Date(), value: undefined, rgba: "undefined"}];
    }

    clearDisplay(): void {
        this.node.innerHTML = "";
    }
}

export class SunDisplay {

    node: HTMLElement;
    nwsHourly: NwsHourly;
    lat: number;
    long: number;

    constructor(node: HTMLElement, nwsHourly: NwsHourly) {
        this.node = node;
        this.nwsHourly = nwsHourly; 
        this.lat = nwsHourly.zipData.lat;
        this.long = nwsHourly.zipData.long;
    }

    renderDisplay(startTime: Date, endTime: Date) {
        let displayData = this.getDisplayData(startTime, endTime);
        console.log(startTime, endTime);
        this.clearDisplay();
        this.buildDisplay(displayData);
    }

    buildDisplay(data: DisplayData[]) {
        data.forEach(entry => {
            let li = document.createElement('li');
            li.style.left = `${entry.value}%`;
            this.node.appendChild(li);
        })
    }

    getDisplayData(startTime: Date, endTime: Date): DisplayData[] {

        let times: Date[] = []
        let checkTime = new Date(startTime.getTime()); 
        
        // Grab the sunrise and sunset times day by day until the sunset time is after end time. Then we can stop. 
        for (;;) {
            // Get the sunrise and sunset times for the current day we're checking
            var {sunrise, sunset} = getSunData(checkTime, this.lat, this.long);
    
            // If the sunrise is within the start time and end time add it
            if (sunrise >= startTime && sunrise <= endTime) {
                times.push(sunrise);
            }
            
            // If the sunset is less than the end time add it
            if (sunset <= endTime) {
                times.push(sunset);
            }
            // Otherwise break out of the loop. We don't need to check anymore.
            else {
                break;
            }

            // If we made it to here increment the day we're checking so that the next time through the loop we'll check the next day.
            checkTime = new Date(checkTime.getTime() + 24 * 60 * 60 * 1000)
        }

        const intervalDuration = endTime.getTime() + (60 * 60 * 1000) - startTime.getTime();

        return times.map((time): DisplayData => {
            const duration = time.getTime() - startTime.getTime();
            const percent = duration / intervalDuration * 100;
            return {date: time, value: percent}
        })

    }

    clearDisplay(): void {
        this.node.innerHTML = "";
    }

}

export class HourDisplay { 

    node: HTMLElement;

    constructor(node: HTMLElement) {
        this.node = node;
    }

    renderDisplay(startTime: Date, endTime: Date) {
        // Clear the display
        this.clearDisplay();

        let currentTime = startTime;
        while (currentTime <= endTime) {
            let li = document.createElement('li');
            li.innerHTML = `<span>${currentTime.getHours()}</span>`;
            this.node.appendChild(li);
            currentTime = new Date(currentTime.getTime() + (60 * 60 * 1000));
        }

    }


    clearDisplay(): void {
        this.node.innerHTML = "";
    }

}


export class TempDisplay extends NwsDisplay {

    baseTemp: number;
    baseRange: number;

    constructor(node: HTMLElement, nwsHourly: NwsHourly, nwsProp: string, baseTemp: number, baseRange: number) {
        super(node, nwsHourly, nwsProp);
        this.baseTemp = baseTemp;
        this.baseRange = baseRange;
    }

    getDisplayData(startTime: Date, endTime: Date): DisplayData[] {
        return this.nwsData.getInterval(startTime, endTime)
        .map((entry: NwsEntry) : DisplayData => {
            let temp = roundNum(entry.value * 9 / 5 + 32, 2);
            let rgba = this.toRGBA(temp)

            return {date: entry.date, value: temp, rgba: rgba}
        })
    }

    private toRGBA(temp: number): string {             
        let delta = Math.abs(temp - this.baseTemp);
        if (delta > this.baseRange) delta = this.baseRange;
        
        const opacity: number = roundNum(delta/this.baseRange,3)
        
        return temp > this.baseTemp ? `rgba(255,0,0,${opacity})` : `rgba(0,0,255,${opacity})`
    }

}


export class PercentDisplay extends NwsDisplay {

    color: [number,number,number];

    constructor(node: HTMLElement, nwsHourly: NwsHourly, nwsProp: string, color: [number,number,number]) {
        super(node, nwsHourly, nwsProp);
        this.color = color;
    }

    getDisplayData(startTime: Date, endTime: Date): DisplayData[]  {
        const baseData = this.nwsData.getInterval(startTime, endTime);

        return baseData.map((entry): DisplayData => {
            let rgba = this.toRGBA(entry.value)
            return {date: entry.date, value: `${entry.value}%`, rgba: rgba}
        })
    }

    private toRGBA(percent: number): string {                     
        const opacity = percent / 100;
        return `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${opacity})`;
    }

}

export class NumericDisplay extends NwsDisplay {

    color: [number,number,number];
    max: number;

    constructor(node: HTMLElement, nwsHourly: NwsHourly, nwsProp: string, color: [number,number,number], max: number) {
        super(node, nwsHourly, nwsProp);
        this.color = color;
        this.max = max;
    }

    getDisplayData(startTime: Date, endTime: Date): DisplayData[]  {
        const baseData = this.nwsData.getInterval(startTime, endTime);

        return baseData.map((entry): DisplayData => {
            let rgba = this.toRGBA(entry.value);
            return {date: entry.date, value: roundNum(entry.value,2), rgba: rgba}
        })
    }

    private toRGBA(value: number): string {                     
        let opacity = value / this.max;
        if (opacity > 1) opacity = 1;
        return `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${opacity})`;
    }

}

