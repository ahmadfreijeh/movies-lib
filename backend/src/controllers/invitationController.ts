import { NextFunction, Request, Response } from "express";
import { InvitationService } from "../services/InvitationService";
import { UnauthorizedError } from "../utils/errors";
import { sendSuccess } from "../utils/response";

const invitationService = new InvitationService();

export async function createInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const invitation = await invitationService.create(req.user.userId, req.user.organizationId, req.body);
    sendSuccess(res, invitation, 201);
  } catch (error) {
    next(error);
  }
}

export async function listInvitations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const invitations = await invitationService.listForOrganization(req.user.organizationId);
    sendSuccess(res, invitations);
  } catch (error) {
    next(error);
  }
}

export async function getInvitationByToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invitation = await invitationService.getByToken(req.params.token);
    sendSuccess(res, { email: invitation.email, role: invitation.role });
  } catch (error) {
    next(error);
  }
}
