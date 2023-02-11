import bookingRepository from "@/repositories/booking-repository";

async function getBooking(userId: number) {

  const booking = await bookingRepository.findBooking(userId);
  
  if(!booking){
    throw {name: "NotFoundError"}
  }

  return booking;
}



async function postBooking(userId: number, roomId: number) {

  const userBooking = await bookingRepository.findUserBooking(userId);

  if(userBooking){
    throw {name: "FORBIDDEN", message: "booking alredy exist"}
  }

  const enrollment = await bookingRepository.findEnrollment(userId)

  if(!enrollment){
    throw {name: "FORBIDDEN", message: "no enrollment"}
  }

  const ticket = await bookingRepository.findTicket(enrollment.id)

  if(!ticket || ticket.status === "RESERVED"){
    throw {name: "FORBIDDEN", message: "no ticket or ticket not paid"}
  }

  const ticketType = await bookingRepository.findTicketType(ticket.ticketTypeId)

  if(ticketType.isRemote === true || ticketType.includesHotel === false){
    throw {name: "FORBIDDEN", message: "ticket type without hotel include"}
  }

  const room = await bookingRepository.findRoom(roomId);

  if(!room){
    throw {name: "NotFoundError", message: "no room"}
  }

  const booking = await bookingRepository.findBookings(room.id);

  if(room.capacity === booking.length){
    throw {name: "FORBIDDEN", message: "full room"}
  }

  const bookingCreated = await bookingRepository.createBooking(userId, roomId);

  return bookingCreated;
}



async function putBooking(userId: number, roomId: number, bookingId: number) {

  const existedBooking = await bookingRepository.findBookingById(bookingId);

  if(!existedBooking){
    throw {name: "NotFoundError"}
  }

  const userBooking = await bookingRepository.findUserBooking(userId);

  if(!userBooking){
    throw {name: "FORBIDDEN"}
  }

  const room = await bookingRepository.findRoom(roomId);

  if(!room){
    throw {name: "NotFoundError"}
  }

  const booking = await bookingRepository.findBookings(room.id);

  if(room.capacity === booking.length){
    throw {name: "FORBIDDEN"}
  }

  const bookingUpdated = await bookingRepository.updateBooking(bookingId, roomId);

  return bookingUpdated;
}


const bookingService = {
  getBooking,
  postBooking,
  putBooking
};

export default bookingService;
