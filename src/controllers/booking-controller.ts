import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBooking(userId)
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  type BookingBody = {
    roomId: number
  }

  const body = req.body as BookingBody;

  try {
    const booking = await bookingService.postBooking(userId, body.roomId)
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    console.error(error)
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "FORBIDDEN") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }

    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const {bookingId} = req.params;

  type BookingBody = {
    roomId: number
  }

  const body = req.body as BookingBody;

  try {
    const booking = await bookingService.putBooking(userId, body.roomId, Number(bookingId))
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    console.error(error)
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "FORBIDDEN") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }

    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

