import {JsonConverter, JsonCustomConvert} from "json2typescript"

@JsonConverter
export class UTCDateConverter implements JsonCustomConvert<Date> {
    serialize(date: Date): any {
        return date.toUTCString()
    }
    deserialize(date: string): Date {
        return new Date(date);
    }
}