import { Router, Request, Response } from 'express';
import { gitService } from '../services/git.service.js';
import { validatePath } from '../middleware/validatePath.js';

export const repositoryRoutes = Router();

repositoryRoutes.get('/repository/validate', validatePath, async (req: Request, res: Response) => {
  try {
    const path = req.body.validatedPath;
    const isValid = await gitService.validateRepository(path);
    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

repositoryRoutes.post('/repository/load', validatePath, async (req: Request, res: Response) => {
  try {
    const path = req.body.validatedPath;

    const isValid = await gitService.validateRepository(path);
    if (!isValid) {
      res.status(400).json({ error: 'Not a valid git repository' });
      return;
    }

    const repository = await gitService.getRepository(path);
    res.json({ success: true, data: repository });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

repositoryRoutes.post('/repository/commits', validatePath, async (req: Request, res: Response) => {
  try {
    const path = req.body.validatedPath;
    const maxCount = parseInt(req.query.maxCount as string) || 500;
    const skip = parseInt(req.query.skip as string) || 0;

    const isValid = await gitService.validateRepository(path);
    if (!isValid) {
      res.status(400).json({ error: 'Not a valid git repository' });
      return;
    }

    const result = await gitService.getCommitsPaginated(path, { maxCount, skip });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

repositoryRoutes.get('/commit/:hash', validatePath, async (req: Request, res: Response) => {
  try {
    const path = req.body.validatedPath;
    const { hash } = req.params;

    const commit = await gitService.getCommitDetails(path, hash);
    if (!commit) {
      res.status(404).json({ error: 'Commit not found' });
      return;
    }

    res.json({ commit });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
