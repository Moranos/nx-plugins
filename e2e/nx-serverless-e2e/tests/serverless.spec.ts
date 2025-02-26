import {
  cleanupTestWorkspace,
  createTestWorkspace,
} from '@ns3/nx-core/src/testing-utils/create-test-workspace';
import { checkFilesExist, readJson, runNxCommandAsync, uniq } from '@nx/plugin/testing';

describe('serverless e2e', () => {
  let projectDirectory: string;

  beforeAll(() => {
    projectDirectory = createTestWorkspace('@ns3/nx-serverless');
  });

  afterAll(() => {
    cleanupTestWorkspace(projectDirectory);
  });

  describe('serverless-bundle', () => {
    it('should create serverless', async () => {
      const plugin = 'nx-serverless-bundle';
      await runNxCommandAsync(`generate @ns3/nx-serverless:application ${plugin}`);

      const buildResult = await runNxCommandAsync(`package ${plugin}`);
      const buildOutput = buildResult.stdout + buildResult.stderr;
      expect(buildOutput).toContain('npx sls package');
      expect(buildOutput).toContain('Service packaged');

      const lintResult = await runNxCommandAsync(`lint ${plugin}`);
      const lintOutput = lintResult.stdout + lintResult.stderr;
      expect(lintOutput).not.toContain('Command failed with exit code 1');
    });
  });

  describe('@ns3/nx-serverless/plugin', () => {
    it('should create serverless', async () => {
      const plugin = 'nx-serverless-ns3';
      await runNxCommandAsync(
        `generate @ns3/nx-serverless:application ${plugin} --plugin @ns3/nx-serverless/plugin`,
      );

      const buildResult = await runNxCommandAsync(`package ${plugin}`);
      const buildOutput = buildResult.stdout + buildResult.stderr;
      expect(buildOutput).toContain('npx sls package');
      expect(buildOutput).toContain('Service packaged');

      const lintResult = await runNxCommandAsync(`lint ${plugin}`);
      const lintOutput = lintResult.stdout + lintResult.stderr;
      expect(lintOutput).not.toContain('Command failed with exit code 1');
    });
  });

  describe('--directory and --tags', () => {
    it('should create src in the specified directory with tags', async () => {
      const plugin = 'nx-serverless-nested';
      await runNxCommandAsync(
        `generate @ns3/nx-serverless:application ${plugin} --directory subdir --tags e2etag,e2ePackage --plugin @ns3/nx-serverless/plugin`,
      );
      const projectJson = readJson(`subdir/${plugin}/project.json`);
      expect(projectJson.tags).toEqual(['e2etag', 'e2ePackage']);
      expect(() => checkFilesExist(`subdir/${plugin}/src/handlers/foo/handler.ts`)).not.toThrow();
    });
  });
});
