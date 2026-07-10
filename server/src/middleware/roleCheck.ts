import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import prisma from '../config/database'

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }
    if (!roles.includes(req.user.role)) { res.status(403).json({ message: 'Insufficient permissions' }); return }
    next()
  }
}

export const requireProjectAccess = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }
  if (req.user.role === 'ADMIN') { req.projectRole = 'ADMIN'; next(); return }

  const projectId = req.params.projectId
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: req.user.id, projectId } },
  })
  if (!member) { res.status(403).json({ message: 'No access to this project' }); return }
  req.projectRole = member.role
  next()
}

// Enforces the user's PER-PROJECT role (global ADMIN always passes).
// Must run after requireProjectAccess, which resolves req.projectRole.
export const requireProjectRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }
    if (req.user.role === 'ADMIN') { next(); return }
    if (!req.projectRole || !roles.includes(req.projectRole)) {
      res.status(403).json({ message: 'Insufficient permissions for this project' })
      return
    }
    next()
  }
}
