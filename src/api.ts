import { picgoURL } from "./index";
import superagent from "superagent";

export async function uploadImages(list: string[]) {
    return await superagent.post(picgoURL).send({ list });
}
