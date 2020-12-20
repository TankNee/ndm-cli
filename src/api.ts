import { picgoURL } from "./index";
import superagent from "superagent";

export async function uploadImages(imagePaths: string[], callback: Function) {
    let result: string[] = [];
    for (let index = 0; index < imagePaths.length; index++) {
        const imagePath = imagePaths[index];
        callback(imagePath, index);
        const { body: res } = await superagent
            .post(picgoURL)
            .send({ list: [imagePath] });
        if (!res.success) {
            throw Error(`fail to upload ${imagePath}!`);
        }
        result = result.concat(res.result);
    }
    return result;
}
