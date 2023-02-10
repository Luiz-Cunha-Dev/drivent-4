import { prisma } from "@/config";

async function findBooking(userId: number) {
  return prisma.booking.findFirst({
    where:{userId},
    select: {id: true, Room: true}
  });
}

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data:{userId, roomId},
    select:{roomId: true}
  })
}

async function updateBooking(id: number, roomId: number) {
  return prisma.booking.update({
    where:{id},
    data:{roomId},
    select:{roomId: true}
  })
}

async function findUserBooking(userId: number) {
  return prisma.booking.findFirst({
    where:{userId}
  })
}

async function findBookingById(id: number) {
  return prisma.booking.findFirst({
    where:{id}
  })
}


async function findRoom(id: number) {
  return prisma.room.findUnique({
    where: {id}
  })
}

async function findBookings(roomId: number) {
  return prisma.booking.findMany({
    where: {roomId}
  })
}

async function findEnrollment(userId: number) {
  return prisma.enrollment.findFirst({
    where: {userId}
  })
}

async function findTicket(enrollmentId: number) {
  return prisma.ticket.findFirst({
    where: {enrollmentId}
  })
}

async function findTicketType(id: number) {
  return prisma.ticketType.findFirst({
    where: {id}
  })
}

const bookingRepository = {
  findBooking,
  createBooking,
  updateBooking,
  findRoom,
  findBookings,
  findEnrollment,
  findTicket,
  findTicketType,
  findUserBooking,
  findBookingById
};

export default bookingRepository;
