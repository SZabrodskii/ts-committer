import * as process from "process";
import * as path from "path";
import {LoadConfig} from "./config";
import {AnekdotService, GitService} from "./service";

export async function run(): Promise<void> {
    try {
        const config = LoadConfig();

        const anekdotService = new AnekdotService();
        const experimentDir = path.join(process.cwd(), 'experiment');
        const gitService = new GitService(experimentDir);

        console.log("Initializing repository...");
        await gitService.initRepo();
        await gitService.addRemote(config.repoUrl);
        await gitService.createMasterBranch();

        // Генерация коммитов
        for (let day = 0; day < config.days; day++) {
            const isWeekend = day % 7 === 5 || day % 7 === 6;
            let minCommits = config.minCommits;
            let maxCommits = config.maxCommits;

            if (isWeekend && config.weekendCommits) {
                minCommits = config.weekendCommits.minCommits;
                maxCommits = config.weekendCommits.maxCommits;
            }

            const numCommits = Math.floor(Math.random() * (maxCommits - minCommits + 1)) + minCommits;
            console.log(`Day ${day + 1}: ${numCommits} commits`);

            for (let i = 0; i < numCommits; i++) {
                const anekdot = await anekdotService.setAnekdotToFile();
                console.log(`Anekdot: ${anekdot}`); // Отладочный лог для анекдота

                await gitService.commitFile(anekdot, config.commitTemplate.replace('{message}', `Commit ${i + 1} of day ${day + 1}`));
                console.log(`Commit ${i + 1} of day ${day + 1} created.`); // Лог после создания коммита
            }
        }

        console.log('Commits generated');
    } catch (error) {
        console.error("Error while during commits generation:", error);
    }
}

run().catch(error => console.error("Error during commits generation:", error));