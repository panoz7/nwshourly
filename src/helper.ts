export function makeHttpRequest(url:string,method:string,body?:string,contentType:string = 'application/x-www-form-urlencoded'): Promise<string> {
    console.log(url);


    return new Promise((resolve, reject) => {

        var req = new XMLHttpRequest();
        req.open(method, url);

        req.setRequestHeader('Content-type', contentType);

        req.onload = function() {
            if (req.status == 200) {
                resolve(req.response)
            }
            else
                reject(Error(req.statusText));
        }

        // Handle network errors
        req.onerror = function() {
            reject(Error("Network Error"));
        };

        // Make the request
        req.send(body);

    })
}

export function roundDate(date: Date, roundTo: string, floor: boolean = true) : Date {
    let multiplier = 1; 
    if (roundTo == "s") multiplier = 1000; 
    if (roundTo == "m") multiplier = 1000 * 60;
    if (roundTo == "h") multiplier = 1000 * 60 * 60;
    if (roundTo == "d") multiplier = 1000 * 60 * 60 * 24;

    if (floor) return new Date(Math.floor(date.getTime() / multiplier) * multiplier);
    else return new Date(Math.ceil(date.getTime() / multiplier) * multiplier);
}

export function roundNum(num,dec): number {
    var m = Math.pow(10,dec)
    return (Math.round(num*m)/m);
} 

    // 7 - 36