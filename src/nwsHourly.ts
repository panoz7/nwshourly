import { makeHttpRequest, roundNum } from './helper.js';
import { NwsEntry, DisplayData } from './interfaces.js';

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
        return new NwsProperty(this.rawData.properties.temperature);
    }

    get skyCover() {
        return new NwsProperty(this.rawData.properties.skyCover);
    }

    get precipProbability() {
        return new NwsProperty(this.rawData.properties.probabilityOfPrecipitation);
    }

    get windSpeed() {
        return new NwsProperty(this.rawData.properties.windSpeed);
    }
}


export class NwsProperty {
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
        // Filter the data down to just those entries between the start and end time
        .filter(entry => {
            let entryStart = entry.date;
            let entryEnd = new Date(entry.date.getTime() + (entry.duration * 60 * 60 * 1000))
            return entryEnd >= startTime && entryStart <= endTime
        }) 
        // Add an individual entry for each hour
        .forEach(entry => { 
            for (let i = 0; i < entry.duration; i++) {
                let date = entry.date;
                if (1 > 0) date = new Date(entry.date.getTime() + (1000 * 60 * 60 * i))
                if (date >= startTime && date <= endTime) {
                    returnData.push({date, value: entry.value})
                }
            }
        })
        
        return returnData;
    }
}







