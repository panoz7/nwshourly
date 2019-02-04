import { makeHttpRequest, roundNum } from './helper.js';

interface NwsEntry {
    date: Date;
    duration?: number;
    value: any;
}

interface DisplayData {
    date: Date;
    value: any;
    rgba: string;
}

export async function getNwsHourly(zipCode: number): Promise<NwsHourly> {
    
    try {
        // Get the zip code data
        const zipData = JSON.parse(await makeHttpRequest(`./zipcode/${zipCode}`, 'GET'));

        // Fetch the point data from the NWS using the lat and long from the zip data
        const pointData = JSON.parse(await makeHttpRequest(`https://api.weather.gov/points/${zipData.lat},${zipData.long}`, 'GET'));

        const gridX = pointData.properties.gridX;
        const gridY = pointData.properties.gridY;
        const cwa = pointData.properties.cwa;

        const url: string = `https://api.weather.gov/gridpoints/${cwa}/${gridX},${gridY}`;
        const data = await makeHttpRequest(url, 'GET');

        const rawData = JSON.parse(data);

        return new NwsHourly(rawData);
    }
    catch(e) {
        console.log(e);
    }

}

class NwsHourly {
    private rawData;

    constructor(rawData) {
        this.rawData = rawData;
    }

    get hourlyTemp() {
        return new NwsTemperature(this.rawData.properties.temperature);
    }

    get skyCover() {
        return new NwsPercentage(this.rawData.properties.skyCover, [255,255,255]);
    }

    get precipProbability() {
        return new NwsPercentage(this.rawData.properties.probabilityOfPrecipitation, [0,0,255]);
    }

    get windSpeed() {
        return new NwsWindSpeed(this.rawData.properties.windSpeed, [0,0,255], 20);
    }
}


class NwsProperty {
    private rawData;
    data: NwsEntry[];

    constructor(rawData) {
        this.rawData = rawData;
        this.data = rawData.values.map(this.mapDates);
    }

    private mapDates(entry) {
        // NWS times are formatted like this: 2019-02-02T09:00:00+00:00/PT1H
        // The beginning before the /PT1H is an ISO formatted date
        // The integer before the H or D at the end is the duration of the date in hours
        // The H or D indicates whether the value is in hours or days
        // This regex extracts the date, duration, and duration type values
        let [_,date,duration,durationType] = entry.validTime.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2})\/PT?(\d+)([HD])/);
        if (durationType == 'D') duration = duration * 24;

        return {date: new Date(date), duration: parseInt(duration), value: entry.value};
    }

    getInterval(startTime: Date, endTime: Date): NwsEntry[] {
        let returnData = [];
        
        this.data
        .filter(entry => entry.date >= startTime && entry.date <= endTime) // Filter the data down to just those entries between the start and end time
        .forEach(entry => { // Add an individual entry for each hour
            for (let i = 0; i < entry.duration; i++) {
                let date = entry.date;
                if (1 > 0) date = new Date(entry.date.getTime() + (1000 * 60 * 60 * i))
                returnData.push({date, value: entry.value})
            }
        })
        
        return returnData;
    }
}

class NwsTemperature extends NwsProperty {

    constructor(rawData) {
        super(rawData)
    }
    
    getDisplayData(startTime: Date, endTime: Date, expectedTemp: number, comfortRange: number): DisplayData[] {
        const baseData: NwsEntry[] = this.getInterval(startTime, endTime);

        return baseData.map((entry: NwsEntry) : DisplayData => {
            let temp = roundNum(entry.value * 9 / 5 + 32, 2);
            let rgba = this.toRGBA(temp, expectedTemp, comfortRange)

            return {date: entry.date, value: temp, rgba: rgba}
        })
    }

    private toRGBA(temp: number, expectedTemp: number, comfortRange: number): string {             
        let delta = Math.abs(temp - expectedTemp);
        if (delta > comfortRange) delta = comfortRange;
        
        const opacity: number = roundNum(delta/comfortRange,3)
        
        return temp > expectedTemp ? `rgba(255,0,0,${opacity})` : `rgba(0,0,255,${opacity})`
    }

}

class NwsPercentage extends NwsProperty {

    color: number[];

    constructor(rawData, color: number[]) {
        super(rawData);
        this.color = color;
    }

    getDisplayData(startTime: Date, endTime: Date): DisplayData[]  {
        const baseData = this.getInterval(startTime, endTime);

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

class NwsWindSpeed extends NwsProperty {

    color: number[];
    max: number;

    constructor(rawData, color: number[], max: number) {
        super(rawData);
        this.color = color;
        this.max = max;
    }

    getDisplayData(startTime: Date, endTime: Date): DisplayData[]  {
        const baseData = this.getInterval(startTime, endTime);

        return baseData.map((entry): DisplayData => {
            let rgba = this.toRGBA(entry.value)
            return {date: entry.date, value: roundNum(entry.value,2), rgba: rgba}
        })
    }

    private toRGBA(value: number): string {                     
        let opacity = value / this.max;
        if (opacity > 1) opacity = 1;
        return `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${opacity})`;
    }

}










