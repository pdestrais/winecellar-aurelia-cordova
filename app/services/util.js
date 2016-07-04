export class Util {
    cleanValidatorModelObject(obj) {
        let result={};
        for (var key in obj) {
            if (key.charAt(0)!='_' || (key=='_id' && obj[key])) result[key]=obj[key];
        }
        return result;
    }
}