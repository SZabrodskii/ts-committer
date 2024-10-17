import axios from "axios";
import * as path from "path";
import * as fs from "fs";

export class AnekdotService{
    private readonly apiUrl = 'https://www.anekdot.ru/random/anekdot/';

    async fetchAnekdot():Promise<string>{
        try{
            const response = await axios.get(this.apiUrl);
            const html = response.data;

            const anekdotMatch = html.match(/<div class="text">([\s\S]*?)<\/div>/);
            if(anekdotMatch && anekdotMatch[1]){
                return anekdotMatch[1].replace(/<[^>]+>/g, '').trim();
            }
            return 'No anekdot found';
        }catch (error){
            console.error('Error fetching anekdot:', error);
            return 'Error fetching anekdot';
        }
    }

    async setAnekdotToFile(): Promise<string> {
        const anekdot = await this.fetchAnekdot();
        const filePath = path.join('repo', `anekdot-${Date.now()}.txt`);

        fs.writeFileSync(filePath, anekdot, 'utf-8');
        console.log(`Anekdot saved to ${filePath}`);

        return filePath;

    }

}