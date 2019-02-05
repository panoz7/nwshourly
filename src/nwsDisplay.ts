import { NwsProperty } from './nwsHourly.js';
import { roundNum } from './helper.js';
import { NwsEntry, DisplayData } from './interfaces.js';

export class NwsDisplay {

    nwsData: NwsProperty; 
    node: HTMLElement;

    constructor(node: HTMLElement, nwsData: NwsProperty) {
        this.nwsData = nwsData;
        this.node = node;
    }

    buildDisplay(data: DisplayData[]) {
        data.forEach(entry => {
            let li = document.createElement('li');
            li.style.backgroundColor = entry.rgba;
            li.innerHTML = `<span>${entry.value}</span>`;
            this.node.appendChild(li);
        })
    }

    clearDisplay(): void {
        this.node.innerHTML = "";
    }
}

export class TempDisplay extends NwsDisplay {

    baseTemp: number;
    baseRange: number;

    constructor(node: HTMLElement, nwsData: NwsProperty, baseTemp: number, baseRange: number) {
        super(node, nwsData);
        this.baseTemp = baseTemp;
        this.baseRange = baseRange;
    }

    renderDisplay(startTime: Date, endTime: Date): void {
        this.clearDisplay();
        let displayData = this.getDisplayData(startTime, endTime);
        this.buildDisplay(displayData)        
    }

    private getDisplayData(startTime: Date, endTime: Date): DisplayData[] {
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

    constructor(node: HTMLElement, nwsData: NwsProperty, color: [number,number,number]) {
        super(node, nwsData);
        this.color = color;
    }

    renderDisplay(startTime: Date, endTime: Date): void {
        this.clearDisplay();
        let displayData = this.getDisplayData(startTime, endTime);
        this.buildDisplay(displayData)        
    }

    private getDisplayData(startTime: Date, endTime: Date): DisplayData[]  {
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

    constructor(node: HTMLElement, nwsData: NwsProperty, color: [number,number,number], max: number) {
        super(node, nwsData);
        this.color = color;
        this.max = max;
    }

    renderDisplay(startTime: Date, endTime: Date): void {
        this.clearDisplay();
        let displayData = this.getDisplayData(startTime, endTime);
        this.buildDisplay(displayData)        
    }

    private getDisplayData(startTime: Date, endTime: Date): DisplayData[]  {
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

