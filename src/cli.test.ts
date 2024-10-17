import { run } from "./cli";
import { AnekdotService } from "./service";
import { LoadConfig } from "./config";
import { GitService } from "./service";
import * as fs from "fs";
import * as path from "path";

// Мокаем зависимости
jest.mock("./service/anekdotService");
jest.mock("./service/gitService");
jest.mock("./config/config");

describe("CLI Tests", () => {
    const experimentDir = path.join(process.cwd(), 'experiment');

    beforeAll(() => {
        // Создаем директорию experiment, если она не существует
        if (!fs.existsSync(experimentDir)) {
            fs.mkdirSync(experimentDir);
        }
    });

    afterAll(() => {
        // Удаляем директорию experiment после теста
        fs.rmdirSync(experimentDir, { recursive: true });
    });

    beforeEach(() => {
        jest.clearAllMocks(); // Очищаем моки перед каждым тестом
    });

    it("should generate commits with anekdots in the experiment directory", async () => {
        // Настраиваем моки
        const mockConfig = {
            minCommits: 1,
            maxCommits: 3,
            days: 7,
            weekendCommits: { minCommits: 1, maxCommits: 2 },
            repoUrl: "http://mock-repo.url",
            commitTemplate: "Commit: {message}",
        };

        (LoadConfig as jest.Mock).mockReturnValue(mockConfig);

        const mockInitRepo = jest.fn();
        const mockAddRemote = jest.fn();
        const mockCreateMasterBranch = jest.fn();
        const mockCommitFile = jest.fn();

        (GitService as jest.Mock).mockImplementation(() => {
            return {
                initRepo: mockInitRepo,
                addRemote: mockAddRemote,
                createMasterBranch: mockCreateMasterBranch,
                commitFile: mockCommitFile,
            };
        });

        // Мокаем AnekdotService
        const mockAnekdot = "Mock Anekdot"; // Псевдоним анекдота
        (AnekdotService as jest.Mock).mockImplementation(() => {
            return {
                setAnekdotToFile: jest.fn().mockReturnValue(mockAnekdot),
            };
        });

        console.log("Starting run function...");
        // Запускаем тестируемую функцию
        await run();
        console.log("Run function completed.");

        // Проверяем, что были созданы файлы с анекдотами
        const files = fs.readdirSync(experimentDir);
        console.log(`Files in experiment directory: ${files.length}`); // Отладочный лог
        expect(files.length).toBeGreaterThan(0); // Должны быть созданы файлы

        // Проверяем содержание каждого файла
        files.forEach(file => {
            const content = fs.readFileSync(path.join(experimentDir, file), 'utf-8');
            expect(content).toContain(mockAnekdot); // Каждый файл должен содержать анекдот
        });

        // Проверяем, что функции были вызваны
        expect(mockInitRepo).toHaveBeenCalled();
        expect(mockAddRemote).toHaveBeenCalledWith(mockConfig.repoUrl);
        expect(mockCreateMasterBranch).toHaveBeenCalled();
        expect(mockCommitFile).toHaveBeenCalled(); // Возможно, будет вызвано несколько раз
    });
});