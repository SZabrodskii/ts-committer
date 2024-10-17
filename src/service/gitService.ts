import * as path from "path";
import * as process from "process";
import {simpleGit, SimpleGit} from "simple-git";
import * as fs from "fs";

const repoPath = path.resolve(process.cwd(), 'repo');

export class GitService {
    private git: SimpleGit;
    private readonly repoPath: string;

    constructor(repoPath: string) {
        this.repoPath = path.resolve(process.cwd(), repoPath);
        this.git = simpleGit(this.repoPath);
    }
    //initialize the git-repo
    async initRepo(): Promise<void> {
        if (!fs.existsSync(this.repoPath)) {
            fs.mkdirSync(this.repoPath, {recursive: true});
        }

        await this.git.init();
        console.log("Git-repo initialized at " + this.repoPath);
    }

    //add the origin
    async addRemote(repoUrl: string): Promise<void> {
        await this.git.addRemote('origin', repoUrl);
        console.log("Remote added");
    }

    //create the master branch
    async createMasterBranch(): Promise<void> {
        await this.git.checkoutLocalBranch('master');
        console.log("Created master branch");
    }
    //add and commit the file
    async commitFile(filePath: string, commitMessage: string): Promise<void> {
        await this.git.add(filePath);
        await this.git.commit(commitMessage);
        console.log(`File committed with message: "${commitMessage}"`);
    }
}
