import { AnekdotService } from "./anekdotService";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import * as fs from "fs";

jest.mock("fs");

describe("AnekdotService", () => {
    let service: AnekdotService;
    let mockAxios: MockAdapter;

    beforeAll(() => {
        service = new AnekdotService();
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.reset();
    });

    it("should fetch an anekdot successfully", async () => {
        const html = `
            <html>
                <body>
                    <div class="text">This is a test anekdot!</div>
                </body>
            </html>
        `;

        mockAxios.onGet(service['apiUrl']).reply(200, html);

        const anekdot = await service.fetchAnekdot();
        expect(anekdot).toBe("This is a test anekdot!");
    });

    it("should return 'No anekdot found' when anekdot is not found in response", async () => {
        const html = `
            <html>
                <body>
                    <div>No anekdot here!</div>
                </body>
            </html>
        `;

        mockAxios.onGet(service['apiUrl']).reply(200, html);

        const anekdot = await service.fetchAnekdot();
        expect(anekdot).toBe("No anekdot found");
    });

    it("should return 'Error fetching anekdot' when an error occurs", async () => {
        mockAxios.onGet(service['apiUrl']).reply(500);

        const anekdot = await service.fetchAnekdot();
        expect(anekdot).toBe("Error fetching anekdot");
    });
    it("should save anekdot to a file and return the file path", async () => {
        const mockAnekdot = "This is a test anekdot!";

        // Замокируем метод fetchAnekdot с помощью jest.spyOn
        jest.spyOn(service, 'fetchAnekdot').mockResolvedValueOnce(mockAnekdot);

        const expectedFilePathPattern = /repo\/anekdot-\d+\.txt/;

        (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

        const filePath = await service.setAnekdotToFile();

        expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringMatching(expectedFilePathPattern), mockAnekdot, 'utf-8');
        expect(filePath).toMatch(expectedFilePathPattern);
    });
});